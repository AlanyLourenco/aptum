import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { carregarConfig } from '../config/env.ts';
import * as schema from './schema.ts';

/**
 * Conexão com o Postgres.
 *
 * Duas strings, e a diferença importa:
 *
 * - **6543 (pooler em modo transaction)** para a API e os workers. É o que
 *   permite muitas conexões curtas sem esgotar o Postgres.
 * - **5432 (direta)** só para migração. O pooler em modo transaction não
 *   suporta os comandos preparados que o DDL usa.
 *
 * `prepare: false` é obrigatório com o pooler: em modo transaction a sessão
 * não sobrevive entre comandos, e um statement preparado na conexão anterior
 * não existe na próxima.
 */

const config = carregarConfig();

const cliente = postgres(config.banco.url.revelar(), {
  prepare: false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  // o valor nunca vai para log; se a conexão falhar, só o código do erro
  onnotice: () => {},
});

export const db = drizzle(cliente, { schema });
export { schema };

/** Fecha a conexão. O worker chama isto ao receber SIGTERM. */
export async function fecharBanco() {
  await cliente.end({ timeout: 5 });
}
