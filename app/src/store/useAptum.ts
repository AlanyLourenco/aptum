import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import {
  coupons as seedCoupons,
  lists as seedLists,
  products as seedProducts,
  type CouponState,
  type List,
  type Product,
} from '@/data/catalog';

/**
 * Guardar não pode derrubar o app.
 *
 * O módulo nativo pode não existir — versão incompatível com o Expo Go,
 * primeira execução antes do build, navegador com armazenamento bloqueado.
 * Nesses casos o app segue funcionando em memória: a usuária perde a
 * persistência entre sessões, não a sessão inteira.
 */
const memory = new Map<string, string>();
let warned = false;

const safeStorage: StateStorage = {
  getItem: async (name) => {
    try {
      return await AsyncStorage.getItem(name);
    } catch {
      if (!warned) {
        console.warn('[aptum] armazenamento indisponível — seguindo só em memória');
        warned = true;
      }
      return memory.get(name) ?? null;
    }
  },
  setItem: async (name, value) => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch {
      memory.set(name, value);
    }
  },
  removeItem: async (name) => {
    try {
      await AsyncStorage.removeItem(name);
    } catch {
      memory.delete(name);
    }
  },
};

/* ------------------------------------------------------------------ *
 * Tipos que só existem enquanto o app está sendo usado
 * ------------------------------------------------------------------ */

export type SortKey = 'queda' | 'unidade' | 'acaba' | 'nome';

export const SORTS: { key: SortKey; label: string }[] = [
  { key: 'queda', label: 'Maior queda' },
  { key: 'unidade', label: 'Menor preço por unidade' },
  { key: 'acaba', label: 'Acaba antes' },
  { key: 'nome', label: 'Nome' },
];

export type OpportunityKey = 'promocao' | 'cupom' | 'acabando' | 'alvo';

export const OPPORTUNITIES: { key: OpportunityKey; label: string }[] = [
  { key: 'promocao', label: 'Em promoção' },
  { key: 'cupom', label: 'Tem cupom' },
  { key: 'acabando', label: 'Vai acabar' },
  { key: 'alvo', label: 'No preço-alvo' },
];

/** Item marcado como "vou levar". Não é carrinho: o Aptum não vende. */
export type BagItem = { productId: string; qty: number };

/** Compra registrada pela usuária. */
export type Purchase = {
  id: string;
  productId: string;
  store: string;
  date: string;
  paid: number;
  qty: number;
  variant?: string;
};

/** Retorno da usuária sobre um cupom, que rebaixa a classificação. */
export type CouponVerdict = 'funcionou' | 'nao-funcionou';

/**
 * Como o app avisa. Tudo vem pronto num padrão que funciona sozinho —
 * ela só mexe se quiser. Um app de preço que chega sem configuração é um
 * app que ela desinstala na primeira semana.
 */
export type Sensibilidade = 'so-certeza' | 'equilibrado' | 'tudo';

export const SENSIBILIDADES: {
  key: Sensibilidade;
  label: string;
  body: string;
}[] = [
  {
    key: 'so-certeza',
    label: 'Só quando tenho certeza',
    body: 'Avisa apenas com cupom confirmado no seu produto ou menor preço já visto. Poucos avisos, nenhum falso.',
  },
  {
    key: 'equilibrado',
    label: 'Equilibrado',
    body: 'Acrescenta quedas relevantes contra a mediana e itens que estão para acabar. É o padrão.',
  },
  {
    key: 'tudo',
    label: 'Quero saber de tudo',
    body: 'Inclui cupom que talvez valha e promoção de loja sem garantia no seu produto. Mais avisos, alguns em vão.',
  },
];

export type Avisos = {
  /** teto de notificações por dia */
  tetoPorDia: number;
  silencioAtivo: boolean;
  /**
   * Minutos desde a meia-noite, 0–1439. Guardar em minutos e não em hora
   * cheia é o que permite ela escolher 22:30 — e comparar dois horários
   * vira uma subtração, sem caso especial para virada de dia.
   */
  silencioDe: number;
  silencioAte: number;
  /** RN: o nome do tratamento não aparece na tela bloqueada */
  ocultarNome: boolean;
  sensibilidade: Sensibilidade;
};

export const AVISOS_PADRAO: Avisos = {
  tetoPorDia: 5,
  silencioAtivo: true,
  silencioDe: 22 * 60,
  silencioAte: 8 * 60,
  ocultarNome: true,
  sensibilidade: 'equilibrado',
};

type State = {
  products: Product[];
  lists: List[];
  favourites: string[];
  bag: BagItem[];
  /** tons vizinhos aceitos, por produto */
  acceptedTones: Record<string, string[]>;
  purchases: Purchase[];
  couponVerdicts: Record<string, CouponVerdict>;

  // filtros da vitrine
  category: string;
  opportunities: OpportunityKey[];
  sort: SortKey;

  avisos: Avisos;
  theme: 'sistema' | 'claro' | 'escuro';
};

type Actions = {
  toggleFavourite: (productId: string) => void;

  setCategory: (c: string) => void;
  toggleOpportunity: (k: OpportunityKey) => void;
  clearOpportunities: () => void;
  setSort: (s: SortKey) => void;

  addToBag: (productId: string, qty?: number) => void;
  removeFromBag: (productId: string) => void;
  setBagQty: (productId: string, qty: number) => void;
  clearBag: () => void;

  createList: (name: string, kind: List['kind']) => string;
  removeList: (id: string) => void;
  moveProduct: (productId: string, listId: string) => void;
  removeProduct: (productId: string) => void;

  toggleTone: (productId: string, toneCode: string) => void;

  recordPurchase: (p: Omit<Purchase, 'id'>) => void;
  setCouponVerdict: (code: string, verdict: CouponVerdict) => void;

  setAviso: <K extends keyof Avisos>(chave: K, valor: Avisos[K]) => void;
  resetAvisos: () => void;
  setTheme: (t: State['theme']) => void;

  /** LGPD art. 18, VI — apaga tudo o que é dela e volta ao estado inicial */
  apagarMeusDados: () => void;

  reset: () => void;
};

const initial: State = {
  products: seedProducts,
  lists: seedLists,
  favourites: seedProducts.filter((p) => p.favourite).map((p) => p.id),
  bag: [
    { productId: 'serum-vitc', qty: 2 },
    { productId: 'shampoo-refil', qty: 1 },
    { productId: 'protetor-fps60', qty: 1 },
    { productId: 'hidratante-ceramidas', qty: 1 },
  ],
  acceptedTones: {},
  purchases: [],
  couponVerdicts: {},
  category: 'Tudo',
  opportunities: ['promocao', 'cupom'],
  sort: 'queda',
  avisos: AVISOS_PADRAO,
  theme: 'sistema',
};

export const useAptum = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initial,

      toggleFavourite: (id) =>
        set((st) => ({
          favourites: st.favourites.includes(id)
            ? st.favourites.filter((f) => f !== id)
            : [...st.favourites, id],
        })),

      setCategory: (category) => set({ category }),
      toggleOpportunity: (k) =>
        set((st) => ({
          opportunities: st.opportunities.includes(k)
            ? st.opportunities.filter((o) => o !== k)
            : [...st.opportunities, k],
        })),
      clearOpportunities: () => set({ opportunities: [] }),
      setSort: (sort) => set({ sort }),

      addToBag: (productId, qty = 1) =>
        set((st) =>
          st.bag.some((b) => b.productId === productId)
            ? st
            : { bag: [...st.bag, { productId, qty }] },
        ),
      removeFromBag: (productId) =>
        set((st) => ({ bag: st.bag.filter((b) => b.productId !== productId) })),
      setBagQty: (productId, qty) =>
        set((st) => ({
          bag:
            qty <= 0
              ? st.bag.filter((b) => b.productId !== productId)
              : st.bag.map((b) => (b.productId === productId ? { ...b, qty } : b)),
        })),
      clearBag: () => set({ bag: [] }),

      createList: (name, kind) => {
        const id = `lista-${Date.now()}`;
        set((st) => ({
          lists: [
            ...st.lists,
            {
              id,
              name,
              kind,
              count: 0,
              rule:
                kind === 'reposicao'
                  ? 'avisa quando está barato e você precisa'
                  : 'avisa só no melhor preço já visto',
              vessels: [],
            },
          ],
        }));
        return id;
      },
      removeList: (id) =>
        set((st) => ({ lists: st.lists.filter((l) => l.id !== id) })),

      moveProduct: (productId, listId) =>
        set((st) => ({
          products: st.products.map((p) =>
            p.id === productId ? { ...p, inRoutine: listId === 'rotina' } : p,
          ),
        })),
      removeProduct: (productId) =>
        set((st) => ({
          products: st.products.filter((p) => p.id !== productId),
          favourites: st.favourites.filter((f) => f !== productId),
          bag: st.bag.filter((b) => b.productId !== productId),
        })),

      toggleTone: (productId, toneCode) =>
        set((st) => {
          const cur = st.acceptedTones[productId] ?? [];
          return {
            acceptedTones: {
              ...st.acceptedTones,
              [productId]: cur.includes(toneCode)
                ? cur.filter((t) => t !== toneCode)
                : [...cur, toneCode],
            },
          };
        }),

      recordPurchase: (p) =>
        set((st) => ({
          purchases: [{ ...p, id: `c-${Date.now()}` }, ...st.purchases],
        })),

      setCouponVerdict: (code, verdict) =>
        set((st) => ({ couponVerdicts: { ...st.couponVerdicts, [code]: verdict } })),

      setAviso: (chave, valor) =>
        set((st) => ({ avisos: { ...st.avisos, [chave]: valor } })),
      resetAvisos: () => set({ avisos: AVISOS_PADRAO }),
      setTheme: (t) => set({ theme: t }),

      /**
       * Apaga o que é dela e mantém o que é semente do catálogo. O tema
       * sobrevive de propósito: é preferência de acessibilidade, não dado
       * pessoal, e devolver alguém ao claro no meio da noite é hostil.
       */
      apagarMeusDados: () =>
        set((st) => ({
          ...initial,
          products: seedProducts,
          favourites: [],
          bag: [],
          purchases: [],
          couponVerdicts: {},
          acceptedTones: {},
          lists: seedLists,
          theme: st.theme,
        })),

      reset: () => set(initial),
    }),
    {
      name: 'aptum-v1',
      version: 2,
      storage: createJSONStorage(() => safeStorage),
      /**
       * v1 guardava o silêncio em hora cheia (22, 8). A v2 guarda minutos
       * desde a meia-noite, para caber 22:30. Sem esta conversão o 22 do
       * disco vira 00:22 na tela de quem já usava o app.
       */
      migrate: (guardado, versao) => {
        const st = guardado as Partial<State> | undefined;
        if (versao < 2 && st?.avisos) {
          const a = st.avisos;
          st.avisos = {
            ...a,
            silencioDe: a.silencioDe < 24 ? a.silencioDe * 60 : a.silencioDe,
            silencioAte: a.silencioAte < 24 ? a.silencioAte * 60 : a.silencioAte,
          };
        }
        return st as State;
      },
      // o catálogo é semente, não estado do usuário: não persiste
      partialize: (st) => ({
        favourites: st.favourites,
        bag: st.bag,
        acceptedTones: st.acceptedTones,
        purchases: st.purchases,
        couponVerdicts: st.couponVerdicts,
        lists: st.lists,
        category: st.category,
        opportunities: st.opportunities,
        sort: st.sort,
        avisos: st.avisos,
        theme: st.theme,
      }),
    },
  ),
);

/* ------------------------------------------------------------------ *
 * Seletores — a lógica de vitrine mora aqui, não nas telas
 * ------------------------------------------------------------------ */

const matchesOpportunity = (p: Product, k: OpportunityKey) => {
  switch (k) {
    case 'promocao':
      return Boolean(p.discountPct);
    case 'cupom':
      return p.coupon?.state === 'yes';
    case 'acabando':
      return typeof p.runsOutInDays === 'number' && p.runsOutInDays <= 14;
    case 'alvo':
      return typeof p.targetPrice === 'number' && p.price <= p.targetPrice;
  }
};

const catKey = (c: string) => c.toLowerCase();

export function selectVisibleProducts(st: State): Product[] {
  let out = st.products;

  if (st.category !== 'Tudo') {
    out = out.filter((p) => p.category === catKey(st.category));
  }
  if (st.opportunities.length > 0) {
    out = out.filter((p) => st.opportunities.some((k) => matchesOpportunity(p, k)));
  }

  const sorted = [...out];
  switch (st.sort) {
    case 'queda':
      sorted.sort((a, b) => (b.discountPct ?? 0) - (a.discountPct ?? 0));
      break;
    case 'unidade':
      sorted.sort((a, b) => a.perUnit - b.perUnit);
      break;
    case 'acaba':
      sorted.sort((a, b) => (a.runsOutInDays ?? 999) - (b.runsOutInDays ?? 999));
      break;
    case 'nome':
      sorted.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      break;
  }
  return sorted;
}

/** Quantos itens cada filtro de oportunidade encontraria agora. */
export function selectOpportunityCounts(st: State): Record<OpportunityKey, number> {
  const base =
    st.category === 'Tudo'
      ? st.products
      : st.products.filter((p) => p.category === catKey(st.category));

  return OPPORTUNITIES.reduce(
    (acc, o) => {
      acc[o.key] = base.filter((p) => matchesOpportunity(p, o.key)).length;
      return acc;
    },
    {} as Record<OpportunityKey, number>,
  );
}

/** O estado do cupom já considerando o retorno da usuária. */
export function selectCouponState(st: State, code: string, declared: CouponState): CouponState {
  const verdict = st.couponVerdicts[code];
  if (verdict === 'nao-funcionou' && declared === 'yes') return 'maybe';
  return declared;
}

/**
 * A sacola agrupada por loja, com total e economia recalculados.
 *
 * Função pura de propósito, e NÃO um seletor de hook: ela cria objetos
 * novos a cada chamada, então usá-la dentro de `useAptum` faria o
 * componente rerenderizar para sempre — nem `useShallow` salva, porque
 * ele compara os elementos por identidade. Chame dentro de `useMemo`.
 */
export function groupBagByStore(bag: BagItem[], products: Product[]) {
  const rows = bag
    .map((b) => {
      const p = products.find((x) => x.id === b.productId);
      return p ? { product: p, qty: b.qty } : null;
    })
    .filter((r): r is { product: Product; qty: number } => r !== null);

  const byStore = new Map<
    string,
    { store: string; items: typeof rows; total: number; saves: number; couponCode?: string }
  >();

  for (const r of rows) {
    const offer = r.product.offers[0];
    const key = offer.store;
    const entry = byStore.get(key) ?? {
      store: key,
      items: [] as typeof rows,
      total: 0,
      saves: 0,
      couponCode: undefined as string | undefined,
    };
    entry.items.push(r);
    entry.total += r.product.price * r.qty;
    if (r.product.wasPrice) entry.saves += (r.product.wasPrice - r.product.price) * r.qty;
    if (r.product.coupon?.state === 'yes') entry.couponCode = r.product.coupon.code;
    byStore.set(key, entry);
  }

  return [...byStore.values()];
}

export const seedCouponList = seedCoupons;
