import type { Config } from 'drizzle-kit';

import { carregarArquivoEnv } from './src/config/carregar-env.ts';

/**
 * Migração usa a conexão DIRETA (5432), não a do pooler (6543):
 * o pooler em modo transaction não suporta comandos de DDL preparados.
 *
 * O carregador é o nosso, não o dotenv que vem embutido no drizzle-kit:
 * aquele não expande `${MINHASENHA}`, e a URL chegaria aqui com o texto
 * literal no lugar da senha.
 */
carregarArquivoEnv();

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL_DIRETA ?? '' },
} satisfies Config;
