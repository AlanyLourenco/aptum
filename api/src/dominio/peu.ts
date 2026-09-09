import { aplicarPercentual, type Centavos } from './dinheiro.ts';

/**
 * RN-02 — Preço Efetivo por Unidade.
 *
 * É o número que o app inteiro existe para calcular: quanto custa **um ml**
 * deste produto, nesta loja, hoje, **já com o cupom que vale** (D4).
 *
 * Sem ele não há comparação honesta. Um frasco de 30 ml a R$ 71,90 e um
 * refil de 500 ml a R$ 38,40 não se comparam pelo preço — o refil é quase
 * trinta vezes mais barato por ml, e é isso que a usuária precisa ver.
 *
 * **Unidade:** centésimos de centavo, ou seja 1/10.000 de real. É a menor
 * escala que representa exatamente os quatro decimais que a regra usa —
 * R$ 0,0768/ml vira `768`, sem arredondar. Em centavos o sérum a
 * R$ 2,3967/ml viraria `2`, e o erro se acumularia nas medianas de 90 dias.
 */

export type Unidade = 'ml' | 'g' | 'un';

/** Centésimos de centavo por unidade. `23967` são R$ 2,3967 por ml. */
export type PEU = number & { readonly __peu: unique symbol };

export type Embalagem = {
  /** conteúdo total, na unidade */
  conteudo: number;
  unidade: Unidade;
  /** quantas peças vêm na caixa — kit de 2×250 ml tem `pecas: 2` (RN-14) */
  pecas?: number;
};

export type EntradaPEU = {
  preco: Centavos;
  embalagem: Embalagem;
  /** desconto do cupom já validado como elegível pela RN-04 */
  descontoPct?: number;
};

export function calcularPEU({ preco, embalagem, descontoPct }: EntradaPEU): PEU {
  const total = embalagem.conteudo * (embalagem.pecas ?? 1);
  if (total <= 0) throw new RangeError(`Conteúdo precisa ser positivo, veio ${total}`);

  const efetivo = descontoPct ? aplicarPercentual(preco, descontoPct) : preco;
  return Math.round((efetivo / total) * 100) as PEU;
}

/** R$ 1,00 por unidade — abaixo disto, ler "por 1 ml" fica ilegível. */
const PISO_POR_UNIDADE = 10_000;

/**
 * Em que escala mostrar.
 *
 * "R$ 0,149/ml" é ilegível; "R$ 14,90 / 100 ml" é o que a pessoa lê no
 * rótulo do mercado. A escolha da escala é de apresentação, mas mora aqui
 * para que app e API digam sempre a mesma coisa.
 */
export function escalaDeExibicao(peu: PEU, unidade: Unidade): { fator: number; rotulo: string } {
  if (unidade === 'un') return { fator: 1, rotulo: 'un' };
  return peu < PISO_POR_UNIDADE
    ? { fator: 100, rotulo: `100 ${unidade}` }
    : { fator: 1, rotulo: unidade };
}

/** O PEU convertido para centavos na escala de exibição. */
export function peuExibido(peu: PEU, unidade: Unidade): { valor: number; rotulo: string } {
  const { fator, rotulo } = escalaDeExibicao(peu, unidade);
  return { valor: Math.round((peu * fator) / 100), rotulo };
}
