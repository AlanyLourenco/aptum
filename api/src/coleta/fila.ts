import { and, eq, isNull, lte, sql } from 'drizzle-orm';

import { db } from '../db/index.ts';
import { tarefaColeta } from '../db/schema.ts';

/**
 * A fila de coleta, no próprio Postgres.
 *
 * Decisão E3: a 0,83 req/s por loja (doc 06 §1), `FOR UPDATE SKIP LOCKED`
 * dá conta com folga — e remove Redis, SQS e Kafka da operação. Um
 * componente a menos para quebrar às três da manhã.
 *
 * `SKIP LOCKED` é o que faz vários workers puxarem da mesma fila sem
 * pisarem uns nos outros: quem chega depois pula a linha já travada em vez
 * de esperar por ela.
 *
 * Quando trocar: acima de ~50 req/s sustentados, ou quando a retentativa
 * com recuo exponencial ficar complicada demais para uma tabela. Aí `pgmq`
 * primeiro, broker de verdade só depois.
 */

export type Tarefa = {
  id: string;
  lojaId: string;
  varianteId: string;
  faixa: number;
  tentativas: number;
};

/** Máximo de tentativas antes de a tarefa parar de voltar para a fila. */
const TETO_TENTATIVAS = 4;

/**
 * Puxa até `quantas` tarefas prontas **de uma loja só**.
 *
 * Por loja, não global: é isso que isola a falha e respeita o teto de
 * requisições de cada uma. Uma loja lenta não pode segurar as outras.
 */
export async function puxar(lojaId: string, quantas = 5): Promise<Tarefa[]> {
  const linhas = await db.execute<Tarefa>(sql`
    UPDATE ${tarefaColeta}
       SET pega_em = now(), tentativas = tentativas + 1
     WHERE id IN (
       SELECT id FROM ${tarefaColeta}
        WHERE loja_id = ${lojaId}
          AND pega_em IS NULL
          AND agendada_para <= now()
          AND tentativas < ${TETO_TENTATIVAS}
        ORDER BY faixa ASC, agendada_para ASC
        LIMIT ${quantas}
        FOR UPDATE SKIP LOCKED
     )
    RETURNING id, loja_id AS "lojaId", variante_id AS "varianteId", faixa, tentativas
  `);
  return linhas as unknown as Tarefa[];
}

/** Deu certo: a tarefa sai da fila. */
export async function concluir(id: string) {
  await db.delete(tarefaColeta).where(eq(tarefaColeta.id, id));
}

/**
 * Deu errado: volta para a fila com recuo exponencial.
 *
 * 1 min, 4 min, 9 min, 16 min. Insistir na mesma cadência contra uma loja
 * que já falhou é a diferença entre retentativa e ataque.
 */
export async function falhar(id: string, tentativas: number, erro: string) {
  const esperaMin = Math.min(60, (tentativas + 1) ** 2);
  await db
    .update(tarefaColeta)
    .set({
      pegaEm: null,
      ultimoErro: erro.slice(0, 500),
      agendadaPara: sql`now() + ${`${esperaMin} minutes`}::interval`,
    })
    .where(eq(tarefaColeta.id, id));
}

/**
 * Devolve à fila o que ficou preso.
 *
 * Worker morto no meio do trabalho deixa `pega_em` preenchido para sempre, e
 * a tarefa nunca mais é puxada. Roda a cada poucos minutos.
 */
export async function destravarOrfas(minutos = 15) {
  const devolvidas = await db
    .update(tarefaColeta)
    .set({ pegaEm: null })
    .where(
      and(
        sql`${tarefaColeta.pegaEm} < now() - ${`${minutos} minutes`}::interval`,
        sql`${tarefaColeta.pegaEm} IS NOT NULL`,
      ),
    )
    .returning({ id: tarefaColeta.id });
  return devolvidas.length;
}

/** Quantas tarefas esperando por loja — alimenta a página de saúde. */
export async function profundidade(lojaId: string) {
  const [linha] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(tarefaColeta)
    .where(
      and(
        eq(tarefaColeta.lojaId, lojaId),
        isNull(tarefaColeta.pegaEm),
        lte(tarefaColeta.agendadaPara, new Date()),
      ),
    );
  return linha?.n ?? 0;
}
