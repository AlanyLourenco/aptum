import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

/**
 * Modelo de domínio — etapa E1 do documento 07.
 *
 * Três decisões estruturais, e cada uma tem um porquê que já foi discutido:
 *
 * 1. **Variante é entidade, não coluna** (RN-11, D16). O tom 3.0 e o 3.5 têm
 *    preço e estoque diferentes na mesma loja. Como atributo, a série de
 *    preço misturaria os tons e a mediana viraria ficção.
 *
 * 2. **Regra de cupom é tabela, não JSON** (RN-04). A tela precisa dizer
 *    *por que* o cupom não vale — "exclui dermocosméticos". Regra em JSON
 *    não se consulta nem se audita.
 *
 * 3. **Dinheiro é `integer` em centavos.** Nunca `numeric`, nunca `real`.
 */

/* ─────────────────────────────────────────────────────────────────────
 * Enums
 * ──────────────────────────────────────────────────────────────────── */

export const unidadeEnum = pgEnum('unidade', ['ml', 'g', 'un']);
export const categoriaEnum = pgEnum('categoria', [
  'skincare',
  'maquiagem',
  'cabelo',
  'perfumaria',
  'corpo',
]);
/** RN-12 / D18 — só os dois primeiros geram alerta. */
export const tipoSellerEnum = pgEnum('tipo_seller', ['oficial', 'autorizado', 'terceiro']);
/** RN-04 / D22 — `provavel` nunca vira push. */
export const estadoCupomEnum = pgEnum('estado_cupom', ['confirmado', 'provavel', 'nao_vale']);
export const tipoRegraEnum = pgEnum('tipo_regra', [
  'categoria_inclui',
  'categoria_exclui',
  'marca_inclui',
  'marca_exclui',
  'valor_minimo',
  'primeira_compra',
  'teto_desconto',
]);
export const tipoListaEnum = pgEnum('tipo_lista', ['reposicao', 'desejo']);
export const origemEnum = pgEnum('origem', [
  'feed_afiliado',
  'api_oficial',
  'endpoint_publico',
  'html',
  'terceiro',
  'usuaria',
]);

/* ─────────────────────────────────────────────────────────────────────
 * Catálogo
 * ──────────────────────────────────────────────────────────────────── */

export const produto = pgTable(
  'produto',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    marca: text('marca').notNull(),
    nome: text('nome').notNull(),
    categoria: categoriaEnum('categoria').notNull(),
    /** EAN da embalagem base, quando existe */
    ean: text('ean'),
    /** aponta para o frasco correspondente quando este produto é refil (RN-16) */
    refilDe: uuid('refil_de'),
    criadoEm: timestamp('criado_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('produto_marca_idx').on(t.marca),
    uniqueIndex('produto_ean_idx').on(t.ean),
  ],
);

export const variante = pgTable(
  'variante',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    produtoId: uuid('produto_id')
      .notNull()
      .references(() => produto.id, { onDelete: 'cascade' }),
    /** "3.0", "Rosa Nude" — nulo quando o produto não tem variação */
    codigoTom: text('codigo_tom'),
    nomeTom: text('nome_tom'),
    /** hex da amostra, para a bolinha na tela */
    amostra: text('amostra'),
    ean: text('ean'),

    /** embalagem — insumo do PEU (RN-02) */
    conteudo: integer('conteudo').notNull(),
    unidade: unidadeEnum('unidade').notNull(),
    /** kit de 2×250 ml tem `pecas = 2` (RN-14) */
    pecas: smallint('pecas').notNull().default(1),

    criadaEm: timestamp('criada_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('variante_produto_idx').on(t.produtoId),
    uniqueIndex('variante_ean_idx').on(t.ean),
  ],
);

/* ─────────────────────────────────────────────────────────────────────
 * Lojas e vendedores
 * ──────────────────────────────────────────────────────────────────── */

export const loja = pgTable('loja', {
  id: uuid('id').primaryKey().defaultRandom(),
  /** chave estável usada pelo conector: 'epoca', 'mercadolivre' */
  slug: text('slug').notNull().unique(),
  nome: text('nome').notNull(),
  /** degrau da escada de acesso, 1 a 6 (doc 06 §4) */
  degrauAcesso: smallint('degrau_acesso').notNull(),
  /** teto de requisições por segundo. O worker respeita isto */
  reqPorSegundo: integer('req_por_segundo').notNull().default(1),
  /** RNF-083 — desligar uma loja sem release */
  ativa: boolean('ativa').notNull().default(true),
  /** por que está desligada, quando estiver */
  motivoInativa: text('motivo_inativa'),
});

export const seller = pgTable(
  'seller',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    lojaId: uuid('loja_id')
      .notNull()
      .references(() => loja.id, { onDelete: 'cascade' }),
    idExterno: text('id_externo').notNull(),
    nome: text('nome').notNull(),
    /** RN-12 — curadoria; o padrão é o mais desconfiado */
    tipo: tipoSellerEnum('tipo').notNull().default('terceiro'),
  },
  (t) => [uniqueIndex('seller_loja_externo_idx').on(t.lojaId, t.idExterno)],
);

/* ─────────────────────────────────────────────────────────────────────
 * Série de preço — doc 06 §8
 * ──────────────────────────────────────────────────────────────────── */

/**
 * Uma linha por **mudança**, não por leitura (princípio C5).
 *
 * Leitura idêntica à anterior só atualiza `vistoEm`. Com preço que muda a
 * cada semanas, isso corta o volume em uma a duas ordens de grandeza.
 */
export const observacaoPreco = pgTable(
  'observacao_preco',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    varianteId: uuid('variante_id')
      .notNull()
      .references(() => variante.id, { onDelete: 'cascade' }),
    lojaId: uuid('loja_id')
      .notNull()
      .references(() => loja.id, { onDelete: 'cascade' }),
    sellerId: uuid('seller_id').references(() => seller.id, { onDelete: 'set null' }),

    /** centavos inteiros. Nunca float */
    preco: integer('preco').notNull(),
    /** o "de" riscado, quando a loja publica */
    precoDe: integer('preco_de'),
    /** C4 — esgotado grava linha com o último preço, não vira lacuna */
    disponivel: boolean('disponivel').notNull(),
    /** centésimos de centavo por unidade (RN-02) */
    peu: integer('peu').notNull(),

    origem: origemEnum('origem').notNull(),
    /** RN-08 / C7 — abaixo do piso não gera alerta. 0 a 100 */
    confianca: smallint('confianca').notNull(),

    coletadoEm: timestamp('coletado_em', { withTimezone: true }).notNull(),
    /** atualizado quando a leitura repete, em vez de gravar linha nova */
    vistoEm: timestamp('visto_em', { withTimezone: true }).notNull(),
  },
  (t) => [
    // "qual o preço agora" — a consulta mais quente do sistema
    index('obs_variante_loja_tempo_idx').on(t.varianteId, t.lojaId, t.coletadoEm.desc()),
  ],
);

/**
 * *Price spell*: por quanto tempo cada preço valeu.
 *
 * É o que torna mediana e P10 de 90 dias baratos — sem isso, cada consulta
 * varreria a série inteira. É o mesmo modelo dos microdados do Billion
 * Prices Project (doc 05), o que permite reaproveitar a metodologia.
 */
export const janelaPreco = pgTable(
  'janela_preco',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    varianteId: uuid('variante_id')
      .notNull()
      .references(() => variante.id, { onDelete: 'cascade' }),
    lojaId: uuid('loja_id')
      .notNull()
      .references(() => loja.id, { onDelete: 'cascade' }),
    preco: integer('preco').notNull(),
    inicio: timestamp('inicio', { withTimezone: true }).notNull(),
    /** nulo enquanto o preço ainda está valendo */
    fim: timestamp('fim', { withTimezone: true }),
  },
  (t) => [index('janela_variante_periodo_idx').on(t.varianteId, t.inicio, t.fim)],
);

/** Recalculado uma vez por dia, não a cada consulta. */
export const agregadoDiario = pgTable(
  'agregado_diario',
  {
    varianteId: uuid('variante_id')
      .notNull()
      .references(() => variante.id, { onDelete: 'cascade' }),
    lojaId: uuid('loja_id')
      .notNull()
      .references(() => loja.id, { onDelete: 'cascade' }),
    dia: date('dia').notNull(),
    p10_90d: integer('p10_90d').notNull(),
    mediana90d: integer('mediana_90d').notNull(),
    pico90d: integer('pico_90d').notNull(),
    /** quantas mudanças de preço em 90 dias — alimenta o score de prioridade */
    trocas90d: smallint('trocas_90d').notNull(),
  },
  (t) => [uniqueIndex('agregado_pk').on(t.varianteId, t.lojaId, t.dia)],
);

/* ─────────────────────────────────────────────────────────────────────
 * Cupons — RN-04
 * ──────────────────────────────────────────────────────────────────── */

export const cupom = pgTable(
  'cupom',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    lojaId: uuid('loja_id')
      .notNull()
      .references(() => loja.id, { onDelete: 'cascade' }),
    codigo: text('codigo').notNull(),
    chamada: text('chamada').notNull(),
    descontoPct: smallint('desconto_pct'),
    descontoValor: integer('desconto_valor'),

    vigenciaInicio: timestamp('vigencia_inicio', { withTimezone: true }),
    vigenciaFim: timestamp('vigencia_fim', { withTimezone: true }),

    /**
     * D22 — a decisão mais importante do produto.
     * `provavel` aparece no app e **nunca** vira push.
     */
    estado: estadoCupomEnum('estado').notNull().default('provavel'),
    /** o texto que a tela mostra quando não vale */
    motivo: text('motivo'),

    /** regulamento cru, para a fila humana reler sem recoletar */
    regulamentoBruto: text('regulamento_bruto'),
    /** quem revisou e quando — `provavel` só vira `confirmado` por pessoa */
    revisadoPor: text('revisado_por'),
    revisadoEm: timestamp('revisado_em', { withTimezone: true }),
  },
  (t) => [
    uniqueIndex('cupom_loja_codigo_idx').on(t.lojaId, t.codigo),
    index('cupom_vigencia_idx').on(t.lojaId, t.vigenciaFim),
  ],
);

/** Uma condição por linha. Um cupom tem várias, e todas precisam passar. */
export const regraCupom = pgTable(
  'regra_cupom',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cupomId: uuid('cupom_id')
      .notNull()
      .references(() => cupom.id, { onDelete: 'cascade' }),
    tipo: tipoRegraEnum('tipo').notNull(),
    /** o alvo da regra: 'skincare', 'Solaris Derma', ou o valor mínimo */
    valor: text('valor'),
    valorNumerico: integer('valor_numerico'),
    /** o trecho do regulamento de onde saiu — auditoria da fila humana */
    trechoOrigem: text('trecho_origem'),
  },
  (t) => [index('regra_cupom_idx').on(t.cupomId)],
);

/* ─────────────────────────────────────────────────────────────────────
 * Usuária, listas, alertas
 * ──────────────────────────────────────────────────────────────────── */

export const usuaria = pgTable('usuaria', {
  /** vem do auth do Supabase — não geramos id próprio */
  id: uuid('id').primaryKey(),
  email: text('email').notNull(),
  /** preferências de aviso; espelha o tipo `Avisos` do app */
  avisos: jsonb('avisos').notNull(),
  criadaEm: timestamp('criada_em', { withTimezone: true }).notNull().defaultNow(),
});

export const lista = pgTable(
  'lista',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    usuariaId: uuid('usuaria_id')
      .notNull()
      .references(() => usuaria.id, { onDelete: 'cascade' }),
    nome: text('nome').notNull(),
    /** D21 — reposição e desejo têm motores de alerta distintos */
    tipo: tipoListaEnum('tipo').notNull(),
    criadaEm: timestamp('criada_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('lista_usuaria_idx').on(t.usuariaId)],
);

export const itemLista = pgTable(
  'item_lista',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    listaId: uuid('lista_id')
      .notNull()
      .references(() => lista.id, { onDelete: 'cascade' }),
    varianteId: uuid('variante_id')
      .notNull()
      .references(() => variante.id, { onDelete: 'cascade' }),
    /** RN-06 — dias estimados até acabar */
    cicloDias: smallint('ciclo_dias'),
    ultimaCompraEm: date('ultima_compra_em'),
    /** centavos; dispara alerta de lista de desejo */
    precoAlvo: integer('preco_alvo'),
    /** D16 — tons vizinhos que ela aprovou */
    tonsAceitos: jsonb('tons_aceitos'),
    pausado: boolean('pausado').notNull().default(false),
  },
  (t) => [
    uniqueIndex('item_lista_variante_idx').on(t.listaId, t.varianteId),
    // achar quem monitora uma variante — insumo do score de prioridade
    index('item_variante_idx').on(t.varianteId),
  ],
);

/**
 * O que foi disparado, para quem, e **por quê**.
 *
 * A coluna `justificativa` não é log: é exigência do art. 20 da LGPD. Sem
 * ela não há como revisar uma decisão automática, e a tela de privacidade
 * do app promete essa revisão.
 */
export const alerta = pgTable(
  'alerta',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    usuariaId: uuid('usuaria_id')
      .notNull()
      .references(() => usuaria.id, { onDelete: 'cascade' }),
    varianteId: uuid('variante_id').references(() => variante.id, { onDelete: 'set null' }),
    cupomId: uuid('cupom_id').references(() => cupom.id, { onDelete: 'set null' }),

    gatilho: text('gatilho').notNull(),
    /** LGPD art. 20 — preço no momento, mediana usada, regra aplicada */
    justificativa: jsonb('justificativa').notNull(),

    enviadoEm: timestamp('enviado_em', { withTimezone: true }).notNull().defaultNow(),
    abertoEm: timestamp('aberto_em', { withTimezone: true }),
  },
  (t) => [index('alerta_usuaria_tempo_idx').on(t.usuariaId, t.enviadoEm.desc())],
);

/* ─────────────────────────────────────────────────────────────────────
 * Fila de coleta — decisão E3: o próprio Postgres, com SKIP LOCKED
 * ──────────────────────────────────────────────────────────────────── */

export const tarefaColeta = pgTable(
  'tarefa_coleta',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    lojaId: uuid('loja_id')
      .notNull()
      .references(() => loja.id, { onDelete: 'cascade' }),
    varianteId: uuid('variante_id')
      .notNull()
      .references(() => variante.id, { onDelete: 'cascade' }),
    /** P0 a P3 — doc 06 §3 */
    faixa: smallint('faixa').notNull(),
    agendadaPara: timestamp('agendada_para', { withTimezone: true }).notNull(),
    /** nulo enquanto na fila; preenchido quando um worker pega */
    pegaEm: timestamp('pega_em', { withTimezone: true }),
    tentativas: smallint('tentativas').notNull().default(0),
    ultimoErro: text('ultimo_erro'),
  },
  (t) => [
    // é este índice que faz o SKIP LOCKED ser barato
    index('tarefa_fila_idx').on(t.lojaId, t.agendadaPara, t.pegaEm),
  ],
);

/**
 * O que os portões rejeitaram, e por quê.
 *
 * Item reprovado não some (C4): vira linha aqui com o motivo. É desta
 * tabela que sai a "taxa de parse válido" — a métrica que detecta o
 * conector quebrado antes da usuária (doc 06 §9).
 */
export const rejeicao = pgTable(
  'rejeicao',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    lojaId: uuid('loja_id')
      .notNull()
      .references(() => loja.id, { onDelete: 'cascade' }),
    varianteId: uuid('variante_id').references(() => variante.id, { onDelete: 'set null' }),
    portao: text('portao').notNull(),
    motivo: text('motivo').notNull(),
    /** o que a loja devolveu, para depurar sem recoletar */
    cargaBruta: jsonb('carga_bruta'),
    ocorridoEm: timestamp('ocorrido_em', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('rejeicao_loja_tempo_idx').on(t.lojaId, t.ocorridoEm.desc())],
);
