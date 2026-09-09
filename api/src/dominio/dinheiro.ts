/**
 * Dinheiro em centavos inteiros. Nunca `float`.
 *
 * `0.1 + 0.2` dá `0.30000000000000004` em ponto flutuante. Num app cuja
 * promessa inteira é "este preço está R$ 14 abaixo da mediana", errar o
 * centavo não é detalhe de implementação — é a promessa quebrando.
 *
 * A regra atravessa o sistema: o banco guarda `integer`, a API devolve
 * `7190`, e só a tela formata para `R$ 71,90`.
 */

/** Reais em centavos. `7190` são R$ 71,90. */
export type Centavos = number & { readonly __centavos: unique symbol };

export function centavos(n: number): Centavos {
  if (!Number.isInteger(n)) {
    throw new TypeError(`Centavos precisa ser inteiro, veio ${n}`);
  }
  return n as Centavos;
}

/** Converte reais para centavos arredondando meio-para-cima. */
export function deReais(reais: number): Centavos {
  return centavos(Math.round(reais * 100));
}

/** Formata para exibição. O servidor quase nunca precisa disto — a tela formata. */
export function paraBRL(c: Centavos): string {
  const sinal = c < 0 ? '-' : '';
  const abs = Math.abs(c);
  return `${sinal}R$ ${Math.floor(abs / 100)},${String(abs % 100).padStart(2, '0')}`;
}

/**
 * Desconto percentual, arredondado meio-para-cima.
 *
 * Arredondar para baixo faria o app prometer um preço final menor que o
 * cobrado no caixa — o erro que mais destrói confiança. Para cima, no pior
 * caso, a usuária paga um centavo a menos que o previsto.
 */
export function aplicarPercentual(valor: Centavos, percentual: number): Centavos {
  if (percentual < 0 || percentual > 100) {
    throw new RangeError(`Percentual fora de 0–100: ${percentual}`);
  }
  return centavos(Math.round(valor * (1 - percentual / 100)));
}

/** Desconto de valor fixo, sem deixar o preço ficar negativo. */
export function aplicarAbatimento(valor: Centavos, abatimento: Centavos): Centavos {
  return centavos(Math.max(0, valor - abatimento));
}

/** Variação percentual de `de` para `para`. Negativo é queda. */
export function variacaoPct(de: Centavos, para: Centavos): number {
  if (de === 0) return 0;
  return Math.round(((para - de) / de) * 100);
}
