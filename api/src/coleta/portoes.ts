import type { OfertaBruta } from './conector.ts';

/**
 * Os seis portões de sanidade — doc 06 §6.
 *
 * Existem para impedir **o único erro irrecuperável do sistema**: coletar o
 * produto errado e gravar como se fosse o certo. Preço de um tom em cima de
 * outro, kit em cima do avulso, refil em cima do frasco. A série fica
 * contaminada, a mediana mente, e o alerta manda a usuária comprar por um
 * preço que não existe — e ninguém descobre, porque a tela mostra um número
 * plausível.
 *
 * Rodam **antes de gravar**, sem exceção. Item reprovado não vira lacuna
 * silenciosa: vira linha em `rejeicao` com o motivo (princípio C4).
 */

export type Esperado = {
  varianteId: string;
  ean?: string | undefined;
  nome: string;
  codigoTom?: string | undefined;
  conteudo: number;
  unidade: string;
  /** mediana de 90 dias em centavos, quando já existe série */
  mediana?: number | undefined;
  /** último preço visto, para detectar salto absurdo */
  ultimoPreco?: number | undefined;
};

export type Veredito =
  | { passou: true; confianca: number }
  | { passou: false; portao: string; motivo: string };

/** Abaixo disto o preço é bom demais para ser verdade sem confirmação. */
const QUEDA_ABSURDA = 0.7;
/** Acima disto o preço subiu demais de uma leitura para a outra. */
const ALTA_ABSURDA = 3;

type Portao = {
  nome: string;
  /** devolve o motivo da rejeição, ou `null` se passou */
  checar(o: OfertaBruta, e: Esperado): string | null;
  /** quanto tira da confiança quando passa "raspando" */
  penalidade?(o: OfertaBruta, e: Esperado): number;
};

const PORTOES: Portao[] = [
  {
    /**
     * 1. Identidade. Se os dois lados têm EAN, eles têm que bater — é a
     * checagem mais forte que existe e a única que não depende de heurística.
     */
    nome: 'identidade',
    checar(o, e) {
      if (!o.eanRetornado || !e.ean) return null;
      const a = o.eanRetornado.replace(/\D/g, '');
      const b = e.ean.replace(/\D/g, '');
      return a === b ? null : `EAN divergente: pedimos ${b}, veio ${a}`;
    },
    penalidade(o, e) {
      // sem EAN dos dois lados, sobrou o nome — e nome casa mal
      return !o.eanRetornado || !e.ean ? 25 : 0;
    },
  },
  {
    /**
     * 2. Variante. RN-11: tom errado é o erro mais caro de beleza, porque
     * o preço é plausível e ninguém percebe.
     */
    nome: 'variante',
    checar(o, e) {
      if (!e.codigoTom || !o.varianteRetornada) return null;
      const veio = o.varianteRetornada.toLowerCase();
      const quer = e.codigoTom.toLowerCase();
      return veio.includes(quer) ? null : `Tom divergente: pedimos ${quer}, veio ${veio}`;
    },
    penalidade(o, e) {
      // esperávamos tom e a loja não disse qual: não dá para confiar
      return e.codigoTom && !o.varianteRetornada ? 40 : 0;
    },
  },
  {
    /**
     * 3. Embalagem. Pegar o kit no lugar do avulso muda o preço por ml em
     * várias vezes, e o número continua parecendo razoável (RN-14, RN-16).
     */
    nome: 'embalagem',
    checar(o, e) {
      if (o.conteudoRetornado == null) return null;
      const razao = o.conteudoRetornado / e.conteudo;
      if (razao > 0.95 && razao < 1.05) return null;
      return `Conteúdo divergente: esperado ${e.conteudo}${e.unidade}, veio ${o.conteudoRetornado}`;
    },
  },
  {
    /** 4. Sanidade do valor. Preço zero ou negativo é erro de parse, não promoção. */
    nome: 'valor',
    checar(o) {
      if (o.preco <= 0) return `Preço inválido: ${o.preco}`;
      if (o.precoDe != null && o.precoDe < o.preco) {
        return `Preço "de" (${o.precoDe}) menor que o "por" (${o.preco})`;
      }
      return null;
    },
  },
  {
    /**
     * 5. Salto. Queda de mais de 70% ou alta de mais de 3× contra a mediana
     * quase sempre é o parser pegando outro produto — não uma liquidação.
     *
     * Não rejeita quando não há série: no começo tudo é primeira leitura.
     */
    nome: 'salto',
    checar(o, e) {
      const base = e.mediana ?? e.ultimoPreco;
      if (!base) return null;
      if (o.preco < base * (1 - QUEDA_ABSURDA)) {
        return `Queda absurda: ${o.preco} contra base ${base}`;
      }
      if (o.preco > base * ALTA_ABSURDA) {
        return `Alta absurda: ${o.preco} contra base ${base}`;
      }
      return null;
    },
  },
  {
    /**
     * 6. Frescor. Dado velho não é dado: a tela promete "há 2 h" e o alerta
     * manda comprar agora.
     */
    nome: 'frescor',
    checar(o) {
      const horas = (Date.now() - o.coletadoEm.getTime()) / 3_600_000;
      if (horas > 48) return `Coleta com ${Math.round(horas)} h — velha demais`;
      return null;
    },
    penalidade(o) {
      const horas = (Date.now() - o.coletadoEm.getTime()) / 3_600_000;
      return horas > 24 ? 15 : 0;
    },
  },
];

/** Confiança inicial por origem — degrau mais baixo da escada vale mais. */
const CONFIANCA_BASE: Record<OfertaBruta['origem'], number> = {
  feed_afiliado: 100,
  api_oficial: 100,
  endpoint_publico: 95,
  html: 75,
  terceiro: 70,
  usuaria: 60,
};

/**
 * Passa a oferta pelos seis portões, em ordem.
 *
 * Para no primeiro que reprovar — não faz sentido continuar avaliando uma
 * oferta que já sabemos que é de outro produto.
 */
export function avaliar(oferta: OfertaBruta, esperado: Esperado): Veredito {
  let confianca = CONFIANCA_BASE[oferta.origem];

  for (const portao of PORTOES) {
    const motivo = portao.checar(oferta, esperado);
    if (motivo) return { passou: false, portao: portao.nome, motivo };
    confianca -= portao.penalidade?.(oferta, esperado) ?? 0;
  }

  return { passou: true, confianca: Math.max(0, Math.min(100, confianca)) };
}

/** RN-08 / C7 — abaixo disto o dado entra na série mas não vira alerta. */
export const PISO_PARA_ALERTAR = 70;
