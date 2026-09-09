import assert from 'node:assert/strict';
import { test } from 'node:test';

import { EnvInvalido, analisar, expandir } from './carregar-env.ts';

/** Atalho: texto de .env → mapa já expandido. */
const carregar = (texto: string, ambiente: Record<string, string | undefined> = {}) =>
  expandir(analisar(texto), ambiente);

test('analisa pares, ignorando comentário e linha vazia', () => {
  const r = carregar(['# comentário', '', 'A=1', '  B = 2  ', 'export C=3'].join('\n'));
  assert.equal(r.get('A'), '1');
  assert.equal(r.get('B'), '2');
  assert.equal(r.get('C'), '3');
});

test('expande ${VAR} vinda do próprio arquivo', () => {
  const r = carregar('SENHA=abc\nURL=x-${SENHA}-y');
  assert.equal(r.get('URL'), 'x-abc-y');
});

test('expande ${VAR} vinda do ambiente quando não está no arquivo', () => {
  const r = carregar('URL=x-${DE_FORA}-y', { DE_FORA: 'ok' });
  assert.equal(r.get('URL'), 'x-ok-y');
});

test('senha na URL é percent-encoded — é o ponto de todo o exercício', () => {
  // `@` cru faria o host virar `senha` e a conexão apontar para outro lugar
  const r = carregar('MINHASENHA=p@ss#w/rd\nDATABASE_URL=postgresql://user:${MINHASENHA}@host:5432/db');
  assert.equal(r.get('DATABASE_URL'), 'postgresql://user:p%40ss%23w%2Frd@host:5432/db');
  assert.equal(new URL(r.get('DATABASE_URL')!).hostname, 'host');
});

test('underscore atravessa intacto', () => {
  const r = carregar('MINHASENHA=a_senha_1\nDATABASE_URL=postgresql://u:${MINHASENHA}@host:5432/db');
  assert.equal(r.get('DATABASE_URL'), 'postgresql://u:a_senha_1@host:5432/db');
});

test('fora da posição de senha não codifica', () => {
  const r = carregar('X=a b\nY=prefixo ${X}');
  assert.equal(r.get('Y'), 'prefixo a b');
});

test('depois do @ não é senha: host não é codificado', () => {
  const r = carregar('H=meu.host\nU=postgresql://u:p@${H}:5432/db');
  assert.equal(r.get('U'), 'postgresql://u:p@meu.host:5432/db');
});

test('aspas simples são literais: nada de expansão', () => {
  const r = carregar("A=1\nB='vale ${A} cru'");
  assert.equal(r.get('B'), 'vale ${A} cru');
});

test('aspas duplas expandem e preservam espaço nas bordas', () => {
  const r = carregar('A=1\nB=" ${A} "');
  assert.equal(r.get('B'), ' 1 ');
});

test('comentário no fim da linha some, mas # colado na senha fica', () => {
  const r = carregar('A=valor # isto é comentário\nB=se#nha');
  assert.equal(r.get('A'), 'valor');
  assert.equal(r.get('B'), 'se#nha');
});

test('referência não resolvida fica literal, para o erro vir de quem sabe o nome', () => {
  // travar aqui impediria tarefa offline (drizzle-kit generate) de rodar;
  // quem exige DATABASE_URL é o carregarConfig, e ele reclama do marcador
  assert.equal(carregar('URL=${SUMIDA}').get('URL'), '${SUMIDA}');
});

test('senha vazia não vira string de conexão sem senha', () => {
  const r = carregar('MINHASENHA=\nURL=postgresql://u:${MINHASENHA}@h/db');
  assert.equal(r.get('URL'), 'postgresql://u:${MINHASENHA}@h/db');
  assert.ok(r.get('URL')!.includes('${'), 'o marcador precisa sobreviver para env.ts detectá-lo');
});

test('ciclo é detectado em vez de estourar a pilha', () => {
  assert.throws(() => carregar('A=${B}\nB=${A}'), (e: Error) => {
    assert.ok(e instanceof EnvInvalido);
    assert.match(e.message, /circular/);
    return true;
  });
});
