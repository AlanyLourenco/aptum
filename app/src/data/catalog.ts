import { VesselName } from '@/components/Vessel';

/**
 * Catálogo fictício. Nenhum preço aqui foi coletado de loja real.
 * Marcas e produtos são inventados de propósito, para não atribuir
 * preço falso a marca que existe.
 */

export type CouponState = 'yes' | 'maybe' | 'no';

export type Offer = {
  store: string;
  format: string;
  price: number;
  /** preço por unidade de uso, já com o cupom elegível */
  perUnit: number;
  unitLabel: string;
  seller: 'oficial' | 'autorizado' | 'confiavel';
  collectedAgo: string;
  affiliate: boolean;
};

export type Product = {
  id: string;
  brand: string;
  name: string;
  sizeLabel: string;
  vessel: VesselName;
  category: 'skincare' | 'maquiagem' | 'cabelo' | 'perfumaria' | 'corpo';
  /** variante, quando o produto tem tom ou cor */
  variant?: { code: string; name: string; swatch: string };
  wasPrice?: number;
  price: number;
  perUnit: number;
  unitLabel: string;
  discountPct?: number;
  coupon?: { code: string; state: CouponState };
  /** dias até acabar, pelo ritmo de consumo registrado */
  runsOutInDays?: number;
  targetPrice?: number;
  favourite: boolean;
  inRoutine: boolean;
  offers: Offer[];
  history: { median: number; min: number; peak: number; changes: number };
  note?: string;
};

export const products: Product[] = [
  {
    id: 'serum-vitc',
    brand: 'Lumis Lab',
    name: 'Sérum Vitamina C 20%',
    sizeLabel: '30 ml',
    vessel: 'dropper',
    category: 'skincare',
    wasPrice: 99.8,
    price: 71.9,
    perUnit: 2.4,
    unitLabel: 'ml',
    discountPct: 28,
    coupon: { code: 'BELEZA20', state: 'yes' },
    runsOutInDays: 11,
    favourite: true,
    inRoutine: true,
    history: { median: 99.8, min: 71.9, peak: 118.4, changes: 9 },
    offers: [
      { store: 'Época Cosméticos', format: 'Frasco 30 ml', price: 71.9, perUnit: 2.4, unitLabel: 'ml', seller: 'oficial', collectedAgo: 'há 2 h', affiliate: true },
      { store: 'Sephora', format: 'Frasco 30 ml', price: 84.0, perUnit: 2.8, unitLabel: 'ml', seller: 'oficial', collectedAgo: 'há 3 h', affiliate: false },
      { store: 'Amazon', format: 'Frasco 30 ml', price: 89.9, perUnit: 3.0, unitLabel: 'ml', seller: 'autorizado', collectedAgo: 'há 5 h', affiliate: true },
    ],
  },
  {
    id: 'shampoo-refil',
    brand: 'Fiber Care',
    name: 'Shampoo Reconstrutor',
    sizeLabel: 'refil 400 ml',
    vessel: 'pump',
    category: 'cabelo',
    wasPrice: 90.4,
    price: 59.6,
    perUnit: 14.9,
    unitLabel: '100 ml',
    discountPct: 34,
    coupon: { code: 'BELEZA20', state: 'yes' },
    favourite: true,
    inRoutine: true,
    note: 'Você já tem o frasco — comprou em março.',
    history: { median: 22.6, min: 14.9, peak: 27.1, changes: 7 },
    offers: [
      { store: 'Época Cosméticos', format: 'Refil 400 ml', price: 59.6, perUnit: 14.9, unitLabel: '100 ml', seller: 'oficial', collectedAgo: 'há 2 h', affiliate: true },
      { store: 'Drogasil', format: 'Frasco 300 ml', price: 68.0, perUnit: 22.67, unitLabel: '100 ml', seller: 'oficial', collectedAgo: 'há 4 h', affiliate: false },
      { store: 'Amazon', format: 'Frasco 300 ml', price: 71.9, perUnit: 23.97, unitLabel: '100 ml', seller: 'oficial', collectedAgo: 'há 3 h', affiliate: true },
      { store: 'Mercado Livre', format: 'Travel 100 ml', price: 34.9, perUnit: 34.9, unitLabel: '100 ml', seller: 'confiavel', collectedAgo: 'há 6 h', affiliate: true },
    ],
  },
  {
    id: 'protetor-fps60',
    brand: 'Solaris Derma',
    name: 'Protetor Solar Facial FPS 60',
    sizeLabel: '50 ml',
    vessel: 'tube',
    category: 'skincare',
    wasPrice: 87.6,
    price: 74.5,
    perUnit: 1.49,
    unitLabel: 'ml',
    discountPct: 15,
    coupon: { code: 'VERAO15', state: 'maybe' },
    runsOutInDays: 6,
    favourite: false,
    inRoutine: true,
    note: 'Preço acima da mediana. Compre o mínimo ou espere se der.',
    history: { median: 71.2, min: 62.9, peak: 92.0, changes: 5 },
    offers: [
      { store: 'Drogasil', format: 'Bisnaga 50 ml', price: 74.5, perUnit: 1.49, unitLabel: 'ml', seller: 'oficial', collectedAgo: 'há 4 h', affiliate: false },
      { store: 'Panvel', format: 'Bisnaga 50 ml', price: 78.9, perUnit: 1.58, unitLabel: 'ml', seller: 'oficial', collectedAgo: 'há 7 h', affiliate: false },
    ],
  },
  {
    id: 'base-matte',
    brand: 'Véu Cosméticos',
    name: 'Base Fluida Matte',
    sizeLabel: '30 ml',
    vessel: 'compact',
    category: 'maquiagem',
    variant: { code: '3.5', name: 'Bege Médio', swatch: '#C99873' },
    price: 112.0,
    perUnit: 3.73,
    unitLabel: 'ml',
    targetPrice: 95,
    favourite: false,
    inRoutine: true,
    history: { median: 114.5, min: 98.0, peak: 129.9, changes: 4 },
    offers: [
      { store: 'Sephora', format: 'Frasco 30 ml', price: 112.0, perUnit: 3.73, unitLabel: 'ml', seller: 'oficial', collectedAgo: 'há 3 h', affiliate: false },
      { store: 'Época Cosméticos', format: 'Frasco 30 ml', price: 118.9, perUnit: 3.96, unitLabel: 'ml', seller: 'oficial', collectedAgo: 'há 2 h', affiliate: true },
    ],
  },
  {
    id: 'hidratante-ceramidas',
    brand: 'Aura Skin',
    name: 'Hidratante Facial Ceramidas',
    sizeLabel: '50 g',
    vessel: 'jar',
    category: 'skincare',
    price: 64.9,
    perUnit: 1.3,
    unitLabel: 'g',
    runsOutInDays: 6,
    favourite: false,
    inRoutine: true,
    history: { median: 62.4, min: 51.9, peak: 74.0, changes: 6 },
    offers: [
      { store: 'Drogasil', format: 'Pote 50 g', price: 64.9, perUnit: 1.3, unitLabel: 'g', seller: 'oficial', collectedAgo: 'há 4 h', affiliate: false },
    ],
  },
  {
    id: 'perfume-alba',
    brand: 'Casa Alba',
    name: 'Eau de Parfum Alba',
    sizeLabel: '50 ml',
    vessel: 'flacon',
    category: 'perfumaria',
    price: 389.0,
    perUnit: 7.78,
    unitLabel: 'ml',
    targetPrice: 320,
    favourite: true,
    inRoutine: false,
    history: { median: 412.0, min: 349.0, peak: 459.0, changes: 3 },
    offers: [
      { store: 'Época Cosméticos', format: 'Frasco 50 ml', price: 389.0, perUnit: 7.78, unitLabel: 'ml', seller: 'oficial', collectedAgo: 'há 2 h', affiliate: true },
    ],
  },
];

export const byId = (id: string) => products.find((p) => p.id === id);

/* ------------------------------------------------------------------ */

export type Coupon = {
  code: string;
  store: string;
  headline: string;
  expires: string;
  state: CouponState;
  /** cada condição verificada, com o resultado */
  conditions: { state: CouponState; text: string }[];
  /** produtos da usuária que este cupom cobre */
  covers: string[];
  finalPrice?: number;
  wasPrice?: number;
  /** por que não vale, ou o que não deu para confirmar */
  reason?: string;
  alternative?: string;
};

export const coupons: Coupon[] = [
  {
    code: 'BELEZA20',
    store: 'Época Cosméticos',
    headline: '20% em beleza',
    expires: 'expira em 2 dias',
    state: 'yes',
    covers: ['serum-vitc', 'shampoo-refil'],
    finalPrice: 71.9,
    wasPrice: 89.9,
    conditions: [
      { state: 'yes', text: 'A marca Lumis Lab está na campanha' },
      { state: 'yes', text: 'Vendido e entregue pela própria loja' },
      { state: 'yes', text: 'R$ 89,90 passa do mínimo de R$ 79' },
      { state: 'yes', text: 'Sem restrição de primeira compra' },
      { state: 'yes', text: 'Válido até 07/09' },
    ],
  },
  {
    code: 'VERAO15',
    store: 'Sephora',
    headline: '15% em selecionados',
    expires: 'expira amanhã',
    state: 'maybe',
    covers: ['protetor-fps60'],
    reason:
      'O regulamento diz "marcas selecionadas" e não lista quais. Não te notificamos por isso — push é só quando temos certeza.',
    conditions: [
      { state: 'maybe', text: 'Não sabemos se a marca entra na campanha' },
      { state: 'yes', text: 'Vendido pela própria loja' },
      { state: 'yes', text: 'Passa do mínimo de R$ 79' },
      { state: 'yes', text: 'Válido até 06/09' },
    ],
  },
  {
    code: 'DERMA10',
    store: 'Drogasil',
    headline: '10% na primeira compra',
    expires: 'expira em 5 dias',
    state: 'no',
    covers: [],
    reason: 'Exclui dermocosméticos, e é onde estão três dos seus produtos.',
    alternative: 'CUIDADO12',
    conditions: [
      { state: 'no', text: 'A campanha exclui dermocosméticos' },
      { state: 'yes', text: 'Vendido pela própria loja' },
      { state: 'yes', text: 'Passa do mínimo' },
    ],
  },
];

export const couponByCode = (code: string) => coupons.find((c) => c.code === code);

/* ------------------------------------------------------------------ */

export type List = {
  id: string;
  name: string;
  kind: 'reposicao' | 'desejo';
  count: number;
  rule: string;
  vessels: VesselName[];
};

export const lists: List[] = [
  {
    id: 'rotina',
    name: 'Minha rotina',
    kind: 'reposicao',
    count: 9,
    rule: 'avisa quando está barato e você precisa',
    vessels: ['dropper', 'pump', 'jar'],
  },
  {
    id: 'desejo',
    name: 'Lista de desejo',
    kind: 'desejo',
    count: 4,
    rule: 'avisa só no melhor preço já visto',
    vessels: ['flacon', 'compact'],
  },
  {
    id: 'natal',
    name: 'Presentes de Natal',
    kind: 'desejo',
    count: 3,
    rule: 'avisa só no melhor preço já visto',
    vessels: ['tube'],
  },
];

/* ------------------------------------------------------------------ */

export type BagStore = {
  store: string;
  items: { name: string; qty: string; total: number }[];
  couponCode?: string;
  total: number;
  saves?: number;
};

export const bag: BagStore[] = [
  {
    store: 'Época Cosméticos',
    couponCode: 'BELEZA20',
    total: 203.4,
    saves: 50.8,
    items: [
      { name: 'Sérum Vitamina C 20%', qty: '2 unidades · R$ 2,40/ml', total: 143.8 },
      { name: 'Shampoo Reconstrutor refil', qty: '1 unidade · R$ 14,90/100ml', total: 59.6 },
    ],
  },
  {
    store: 'Drogasil',
    total: 139.4,
    items: [
      { name: 'Protetor Solar FPS 60', qty: '1 unidade · R$ 1,49/ml', total: 74.5 },
      { name: 'Hidratante Ceramidas', qty: '1 unidade · R$ 1,30/g', total: 64.9 },
    ],
  },
];

/* ------------------------------------------------------------------ */


/**
 * O que a base inteira acompanha, não o que ela acompanha.
 *
 * É uma lista de descoberta: serve para quem abriu a tela de adicionar e
 * não sabe por onde começar. Por isso vive separada de `products` — esses
 * ainda não são dela, e entrar num deles é o ato de passar a monitorar.
 *
 * `watchers` é quanta gente vigia o produto. É o critério da ordem, e o
 * número aparece na tela: ranking sem o número é opinião disfarçada.
 */
export type Popular = {
  id: string;
  brand: string;
  name: string;
  sizeLabel: string;
  vessel: VesselName;
  category: Product['category'];
  price: number;
  perUnit: number;
  unitLabel: string;
  watchers: number;
  /** variação do preço mediano nos últimos 30 dias */
  trendPct?: number;
};

export const popular: Popular[] = [
  { id: 'pop-protetor-fps50', brand: 'Solaris Derma', name: 'Protetor Solar Facial FPS 50', sizeLabel: '50 ml', vessel: 'tube', category: 'skincare', price: 68.9, perUnit: 1.38, unitLabel: 'ml', watchers: 14820, trendPct: -6 },
  { id: 'pop-serum-niacinamida', brand: 'Lumis Lab', name: 'Sérum Niacinamida 10%', sizeLabel: '30 ml', vessel: 'dropper', category: 'skincare', price: 54.5, perUnit: 1.82, unitLabel: 'ml', watchers: 12140, trendPct: -11 },
  { id: 'pop-shampoo-antiqueda', brand: 'Fiber Care', name: 'Shampoo Antiqueda', sizeLabel: '400 ml', vessel: 'pump', category: 'cabelo', price: 49.9, perUnit: 12.48, unitLabel: '100 ml', watchers: 10930, trendPct: 3 },
  { id: 'pop-base-alta-cobertura', brand: 'Véu Cosméticos', name: 'Base Alta Cobertura', sizeLabel: '30 ml', vessel: 'flacon', category: 'maquiagem', price: 119.0, perUnit: 3.97, unitLabel: 'ml', watchers: 9640 },
  { id: 'pop-hidratante-ureia', brand: 'Aura Skin', name: 'Hidratante Corporal Ureia 10%', sizeLabel: '400 g', vessel: 'jar', category: 'corpo', price: 42.3, perUnit: 10.58, unitLabel: '100 g', watchers: 8710, trendPct: -4 },
  { id: 'pop-perfume-amadeirado', brand: 'Alba Parfums', name: 'Eau de Parfum Amadeirado', sizeLabel: '100 ml', vessel: 'flacon', category: 'perfumaria', price: 289.0, perUnit: 2.89, unitLabel: 'ml', watchers: 7480, trendPct: 9 },
  { id: 'pop-mascara-cilios', brand: 'Véu Cosméticos', name: 'Máscara de Cílios Volume', sizeLabel: '10 ml', vessel: 'tube', category: 'maquiagem', price: 74.9, perUnit: 7.49, unitLabel: 'ml', watchers: 6950 },
  { id: 'pop-acido-salicilico', brand: 'Solaris Derma', name: 'Tônico Ácido Salicílico 2%', sizeLabel: '200 ml', vessel: 'flacon', category: 'skincare', price: 61.0, perUnit: 0.31, unitLabel: 'ml', watchers: 6220, trendPct: -8 },
  { id: 'pop-condicionador-refil', brand: 'Fiber Care', name: 'Condicionador Refil', sizeLabel: '500 ml', vessel: 'pump', category: 'cabelo', price: 38.4, perUnit: 7.68, unitLabel: '100 ml', watchers: 5480, trendPct: -2 },
  { id: 'pop-po-compacto', brand: 'Véu Cosméticos', name: 'Pó Compacto Matte', sizeLabel: '12 g', vessel: 'compact', category: 'maquiagem', price: 89.9, perUnit: 7.49, unitLabel: 'g', watchers: 4310, trendPct: 5 },
];

/** "14820" vira "14,8 mil" — o número exato não ajuda ninguém a decidir. */
export function watchersLabel(n: number) {
  if (n < 1000) return String(n);
  const mil = n / 1000;
  return `${mil.toFixed(1).replace('.', ',')} mil`;
}

export const categories = [
  'Tudo',
  'Skincare',
  'Maquiagem',
  'Cabelo',
  'Perfumaria',
  'Corpo',
] as const;

export const opportunityFilters = [
  { label: 'Em promoção', count: 18 },
  { label: 'Tem cupom', count: 7 },
  { label: 'Vai acabar', count: 2 },
  { label: 'No preço-alvo', count: 1 },
] as const;

/** Formata em real brasileiro. */
export const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

/* ------------------------------------------------------------------ *
 * Alerta de oportunidade
 * ------------------------------------------------------------------ */

export type Alert = {
  productId: string;
  detectedAgo: string;
  reasons: string[];
  couponCode?: string;
  suggestQty: number;
  coversMonths: number;
  total: number;
  saves: number;
};

export const alerts: Record<string, Alert> = {
  'serum-vitc': {
    productId: 'serum-vitc',
    detectedAgo: 'há 8 minutos',
    reasons: [
      'Menor preço em 90 dias. A mediana é R$ 99,80.',
      'Acaba em ~11 dias, pelo seu ritmo de uso.',
      'Cupom BELEZA20 confirmado para este item.',
    ],
    couponCode: 'BELEZA20',
    suggestQty: 2,
    coversMonths: 4,
    total: 143.8,
    saves: 56,
  },
};

/* ------------------------------------------------------------------ *
 * Recomendação sazonal — a única que diz para não comprar
 * ------------------------------------------------------------------ */

export type Hold = {
  productId: string;
  event: string;
  daysAway: number;
  historicDropPct: number;
  confidence: 'alta' | 'media' | 'informativa';
  editionsSeen: number;
  /** trava de reposição: o estoque tem que passar do fim do evento */
  stockLastsUntil: string;
  inflationWindow: { from: string; to: string };
  reasons: string[];
};

export const holds: Record<string, Hold> = {
  'shampoo-refil': {
    productId: 'shampoo-refil',
    event: 'Black Friday',
    daysAway: 23,
    historicDropPct: 34,
    confidence: 'alta',
    editionsSeen: 2,
    stockLastsUntil: '19 de dezembro',
    inflationWindow: { from: '28/10', to: '11/11' },
    reasons: [
      'Seu estoque dura até 19 de dezembro — passa do fim do evento com folga.',
      'O preço de hoje não está no mínimo histórico.',
    ],
  },
};

/* ------------------------------------------------------------------ *
 * Tons — variante é entidade de primeira classe
 * ------------------------------------------------------------------ */

export type Tone = { code: string; name: string; swatch: string; price?: number };

export const baseTones: Tone[] = [
  { code: '1.0', name: 'Porcelana', swatch: '#EBCDB4' },
  { code: '2.0', name: 'Baunilha', swatch: '#E0BB9C' },
  { code: '3.0', name: 'Bege Claro', swatch: '#D3A882', price: 96 },
  { code: '3.5', name: 'Bege Médio', swatch: '#C99873', price: 112 },
  { code: '4.0', name: 'Amêndoa', swatch: '#B98561', price: 112 },
  { code: '5.0', name: 'Caramelo', swatch: '#A26F4E' },
];

export const totalTones = 18;

/* ------------------------------------------------------------------ *
 * Notificações da tela bloqueada
 * ------------------------------------------------------------------ */

export type Push = { title: string; body: string; when: string };

export const pushes: Push[] = [
  {
    title: 'Sérum Vitamina C no melhor preço em 90 dias',
    body: 'R$ 2,40/ml na Época com o BELEZA20 — e acaba em ~11 dias.',
    when: 'agora',
  },
  {
    title: 'Tom 3.0 está R$ 28 mais barato',
    body: 'Você usa o 3.5 — este é um vizinho que você aprovou.',
    when: 'ontem',
  },
  {
    title: 'Um item da sua rotina está no melhor preço',
    body: 'Nome oculto, como você pediu.',
    when: '3 dias',
  },
];
