import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import postgres from 'postgres';

import { carregarArquivoEnv } from '../config/carregar-env.ts';

/**
 * Aplica as migrações de `drizzle/`.
 *
 * Existe porque o `drizzle-kit migrate` sai com código 1 **sem imprimir erro
 * nenhum** neste ambiente (Windows + pooler do Supabase) — inclusive quando
 * não há nada a aplicar. Diagnosticar um comando mudo é impossível, e
 * migração é justamente onde se quer saber qual comando falhou.
 *
 * O formato de registro é o mesmo do drizzle-kit — `drizzle.__drizzle_migrations`,
 * hash sha256 do arquivo — então voltar a usar a ferramenta oficial, no dia em
 * que ela funcionar, não exige remendo nenhum.
 *
 * Cada migração roda dentro de uma transação: ou entra inteira, ou não entra.
 * Meia migração aplicada é o pior estado possível de um banco.
 */

type Entrada = { idx: number; when: number; tag: string };

const RAIZ = resolve(dirname(import.meta.dirname), '..');
const PASTA = resolve(RAIZ, 'drizzle');

export async function migrar(): Promise<void> {
  carregarArquivoEnv();

  const url = process.env.DATABASE_URL_DIRETA || process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL_DIRETA (ou DATABASE_URL) não está definida. Confira o .env.');
  }

  // DDL precisa de sessão estável: porta 5432 (direta ou pooler em modo
  // session). A 6543 é transaction pooling e derruba statement preparado.
  if (new URL(url).port === '6543') {
    throw new Error(
      'DATABASE_URL_DIRETA aponta para a 6543 (transaction pooling), que não sustenta DDL.\n' +
        'Use a 5432 — conexão direta ou pooler em modo session.',
    );
  }

  const jornal: { entries: Entrada[] } = JSON.parse(
    readFileSync(resolve(PASTA, 'meta/_journal.json'), 'utf8'),
  );

  const sql = postgres(url, { connect_timeout: 20, max: 1, onnotice: () => {} });

  try {
    await sql.unsafe('create schema if not exists drizzle');
    await sql.unsafe(`create table if not exists drizzle."__drizzle_migrations" (
      id serial primary key,
      hash text not null,
      created_at bigint
    )`);

    const aplicadas = new Set(
      (
        await sql<{ hash: string }[]>`select hash from drizzle."__drizzle_migrations"`
      ).map((l) => l.hash),
    );

    let novas = 0;

    for (const entrada of jornal.entries) {
      const arquivo = resolve(PASTA, `${entrada.tag}.sql`);
      const bruto = readFileSync(arquivo, 'utf8');
      const hash = createHash('sha256').update(bruto).digest('hex');

      if (aplicadas.has(hash)) {
        console.log(`· ${entrada.tag} — já aplicada`);
        continue;
      }

      const comandos = bruto
        .split('--> statement-breakpoint')
        .map((c) => c.trim())
        .filter(Boolean);

      console.log(`▸ ${entrada.tag} — ${comandos.length} comandos`);

      await sql.begin(async (tx) => {
        for (const [i, comando] of comandos.entries()) {
          try {
            await tx.unsafe(comando);
          } catch (erro) {
            // qual comando, na íntegra — é o que falta no drizzle-kit
            console.error(`\n  falhou no comando ${i + 1}:\n${comando}\n`);
            throw erro;
          }
        }
        await tx.unsafe(
          `insert into drizzle."__drizzle_migrations" (hash, created_at) values ($1, $2)`,
          [hash, entrada.when],
        );
      });

      console.log(`  ✓ aplicada`);
      novas++;
    }

    console.log(novas ? `\n${novas} migração(ões) aplicada(s).` : '\nNada a aplicar.');
  } finally {
    await sql.end({ timeout: 5 });
  }
}

if (import.meta.filename === process.argv[1]) {
  await migrar().catch((erro: Error) => {
    // a mensagem pode conter a URL, e a URL contém a senha
    console.error(`\nMigração abortada: ${erro.message.replace(/postgresql:\/\/[^\s]+/g, '[url]')}`);
    process.exit(1);
  });
}
