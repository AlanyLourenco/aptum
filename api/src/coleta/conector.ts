import type { Centavos } from '../dominio/dinheiro.ts';
import type { Unidade } from '../dominio/peu.ts';

/**
 * O contrato do conector — doc 06 §4.
 *
 * O núcleo não conhece loja nenhuma. Toda loja implementa esta interface, e
 * é isso que permite ligar a Shopee no dia em que o cadastro de afiliado
 * sair sem tocar em nenhuma outra linha.
 */

export type TipoSeller = 'oficial' | 'autorizado' | 'terceiro';

export type Origem =
  | 'feed_afiliado'
  | 'api_oficial'
  | 'endpoint_publico'
  | 'html'
  | 'terceiro'
  | 'usuaria';

/**
 * O que a loja devolveu, **antes** de qualquer normalização.
 *
 * Os campos `…Retornado` existem para os portões: é comparando o que a loja
 * disse com o que pedimos que se detecta a coleta do produto errado — o
 * único erro irrecuperável do sistema.
 */
export type OfertaBruta = {
  preco: Centavos;
  precoDe?: Centavos;
  disponivel: boolean;

  sellerIdExterno: string;
  sellerNome: string;
  sellerTipo: TipoSeller;

  /** para o portão de identidade */
  eanRetornado?: string;
  nomeRetornado: string;
  varianteRetornada?: string;
  conteudoRetornado?: number;
  unidadeRetornada?: Unidade;

  url: string;
  origem: Origem;
  coletadoEm: Date;
};

export type ProdutoCandidato = {
  idExterno: string;
  nome: string;
  marca?: string;
  ean?: string;
  url: string;
};

export type CupomBruto = {
  codigo: string;
  chamada: string;
  descontoPct?: number;
  descontoValor?: Centavos;
  vigenciaFim?: Date;
  /** o texto do regulamento. É daqui que a RN-04 sai, e é texto, não campo */
  regulamentoBruto?: string;
};

export type Saude = {
  ok: boolean;
  latenciaP95Ms: number | null;
  ultimoSucesso: Date | null;
  /**
   * Fração de respostas que deram para interpretar, de 0 a 1.
   *
   * É a métrica que denuncia o conector quebrado. Quando a loja muda o
   * layout, o HTTP continua 200 e a taxa de sucesso continua ótima — só a
   * taxa de parse cai. Alarmar no 200 não detecta nada.
   */
  taxaParse: number | null;
};

export interface ConectorLoja {
  readonly slug: string;
  readonly nome: string;
  /** 1 a 6 — nunca subir sem tentar os anteriores (doc 06 §4) */
  readonly degrauAcesso: 1 | 2 | 3 | 4 | 5 | 6;
  readonly reqPorSegundo: number;

  /**
   * `false` quando falta credencial. O conector se desliga sozinho em vez
   * de derrubar o processo — é o que permite rodar hoje com o que já tem.
   */
  estaConfigurado(): boolean;

  buscarProduto(consulta: string): Promise<ProdutoCandidato[]>;
  obterOferta(idExterno: string): Promise<OfertaBruta | null>;
  obterCupons(): Promise<CupomBruto[]>;
  saude(): Promise<Saude>;
}
