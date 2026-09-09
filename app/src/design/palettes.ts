/**
 * As duas paletas do Aptum.
 *
 * Os nomes são papéis, não cores: `paper` é o fundo da página, `card` a
 * superfície que se destaca dele, `ink` o texto principal. Por isso a versão
 * escura não é uma inversão — `plum`, que no claro é a superfície de marca
 * mais escura que a página, no escuro precisa ser mais *clara* que ela,
 * senão a superfície some no fundo.
 *
 * Cada cor de sinal foi conferida contra o seu próprio fundo e contra a
 * página, nos dois temas: texto 4,5:1 e elemento não textual 3:1.
 */

/** O LinearGradient exige duas paradas no mínimo — daí a tupla. */
export type Ramp = readonly [string, string, ...string[]];

export const claro = {
  // ameixa — vem da logo
  plum: '#1E1226',
  plum2: '#2C1B37',
  plum3: '#422C50',
  plum4: '#5B3F6B',

  // superfícies
  paper: '#F7F4F6',
  card: '#FFFFFF',
  line: '#E4DBE4',
  line2: '#D2C6D3',
  wash: '#EFE9EF',
  /**
   * Fundo atrás do frasco. Separado de `wash` porque no escuro ele é o
   * único lugar que continua puxando roxo: é o que emoldura o produto e
   * ecoa o lilás do tema claro, sem roxear a interface inteira.
   */
  shotBg: '#EFE9EF',

  // texto sobre a página
  ink: '#1B1420',
  ink2: '#4C4155',
  ink3: '#6E6377',

  // texto sobre ameixa
  onPlum: '#F6F2F7',
  onPlum2: '#CFC2D8',
  onPlum3: '#9E8FA9',

  // rampa do monograma
  lilac1: '#EDE7F2',
  lilac2: '#C5B6D2',
  lilac3: '#6F5C80',

  /**
   * Realce sobre `card` e `paper`: aba ativa, opção escolhida, ícone de
   * ação. No claro é a ameixa; no escuro precisa clarear, senão o item
   * selecionado fica menos visível que os outros.
   */
  accent: '#1E1226',

  // sinal — um significado cada, validado para daltonismo
  down: '#1F5FA8',
  downBg: '#E2ECF8',
  up: '#94254A',
  upBg: '#F7E4E9',
  yes: '#22684A',
  yesBg: '#DFEFE7',
  maybe: '#7A5A0F',
  maybeBg: '#F8EED9',
  none: '#6B6076',
  noneBg: '#EBE5EC',

  /** sombra da barra inferior */
  shadow: 'rgba(30,18,38,0.09)',
  /** véu atrás de folhas e modais */
  scrim: 'rgba(27,20,32,0.45)',
  /** o alvo pressionado sobre superfície escura */
  pressOnPlum: 'rgba(237,231,242,0.12)',

  gradients: {
    mark: ['#EDE7F2', '#C5B6D2', '#7E6A90'] as Ramp,
    shot: ['#F2EDF4', '#DED2E5', '#BCAACB'] as Ramp,
    plumRich: ['#513469', '#2C1B3C', '#1B1023'] as Ramp,
    /** o cartão da promessa: mais luz que os outros, porque ele é o convite */
    premissa: ['#6A4489', '#3B2551', '#221532'] as Ramp,
    paid: ['#5A3B74', '#331F44', '#1E1226'] as Ramp,
    sheen: [
      'rgba(240,235,244,0.20)',
      'rgba(240,235,244,0.05)',
      'rgba(240,235,244,0)',
    ] as Ramp,
    plum: ['#3B2749', '#241631', '#1B1023'] as Ramp,
    /** a linha da aba ativa: a rampa da marca puxada para o escuro */
    tab: ['#8E7A9E', '#4A3459', '#1E1226'] as Ramp,
    lock: ['#5E4370', '#31203E', '#150B1C'] as Ramp,
  },
};

export type Palette = typeof claro;

export const escuro: Palette = {
  /**
   * No escuro a ameixa sobe: ela continua sendo a superfície de marca, mas
   * agora precisa estar acima da página, não abaixo. E como as superfícies
   * neutras viraram grafite, ela pode ser francamente roxa — é justamente
   * o contraste com o cinza que faz a marca aparecer.
   */
  plum: '#402C54',
  plum2: '#4C3665',
  plum3: '#5A4173',
  plum4: '#715889',

  /**
   * Grafite com um sopro de roxo, não ameixa.
   *
   * Antes página, cartão e superfície de marca estavam todos na mesma
   * família e nada se destacava. Aqui o azul fica um degrau acima do verde
   * e o vermelho meio degrau acima — o suficiente para não ser cinza morto,
   * pouco o bastante para o roxo da marca ter contra o que brilhar.
   */
  paper: '#151419',
  card: '#1E1D23',
  line: '#33313A',
  line2: '#46434E',
  wash: '#27252D',
  shotBg: '#2E2839',

  ink: '#F1EFF3',
  ink2: '#C3BFC9',
  ink3: '#98939F',

  onPlum: '#F6F2F7',
  onPlum2: '#D4C8DC',
  onPlum3: '#A697B1',

  /**
   * `lilac1` continua claro: o papel dele é ser o botão claro sobre
   * superfície escura, e isso não muda de tema.
   */
  lilac1: '#E6DEEE',
  lilac2: '#C5B6D2',
  lilac3: '#B9A6C9',

  accent: '#D8C9E6',

  // sinal — as mesmas famílias, clareadas para o fundo escuro
  down: '#7FB2EC',
  downBg: '#1B2C42',
  up: '#EE93AC',
  upBg: '#3A1F2A',
  yes: '#63C596',
  yesBg: '#173024',
  maybe: '#E3BD63',
  maybeBg: '#332711',
  none: '#A79AB0',
  noneBg: '#2A2231',

  shadow: 'rgba(0,0,0,0.45)',
  scrim: 'rgba(8,4,12,0.62)',
  pressOnPlum: 'rgba(237,231,242,0.14)',

  gradients: {
    mark: ['#EDE7F2', '#C5B6D2', '#7E6A90'],
    /**
     * O fundo de foto puxa mais roxo que o resto de propósito: ele fica
     * dentro do cartão, emoldura o produto e é o eco do lilás do tema
     * claro. Fora dele, superfície nenhuma é roxa.
     */
    shot: ['#332C42', '#2B2638', '#241F2E'],
    plumRich: ['#452F5C', '#281A38', '#171021'],
    premissa: ['#5A3C77', '#33204A', '#1E142C'],
    paid: ['#503470', '#301D44', '#1D1329'],
    sheen: [
      'rgba(240,235,244,0.14)',
      'rgba(240,235,244,0.04)',
      'rgba(240,235,244,0)',
    ],
    plum: ['#3A2850', '#2A1C3A', '#20172B'],
    /** sobre a barra escura a linha inverte: vai da ameixa para o lilás */
    tab: ['#5B4470', '#9880AE', '#D6C8E2'],
    lock: ['#3E2A52', '#22162E', '#0E0813'],
  },
};
