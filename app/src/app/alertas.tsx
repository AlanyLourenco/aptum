import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Seal, Txt } from '@/components/primitives';
import { Vessel } from '@/components/Vessel';
import { font, radius, size, space, TAP } from '@/design/tokens';
import { makeStyles, useTheme } from '@/design/theme';
import { useAptum } from '@/store/useAptum';

type Status = 'aberto' | 'aproveitado' | 'expirado';

/**
 * Um aviso é sobre um produto ou sobre um cupom.
 *
 * A segunda forma existe porque é assim que a coisa acontece na vida: a
 * loja solta um cupom e a pergunta não é "qual produto", é "vale para
 * quantos dos meus". Sem isso o app só sabe dizer uma coisa por vez.
 */
type Base = { when: string; status: Status; text: string };

type RowProduto = Base & {
  kind: 'preco' | 'cupom' | 'segure' | 'tom';
  productId: string;
};

type RowCupom = Base & {
  kind: 'cupomLista';
  codigo: string;
  loja: string;
  lista: string;
  /** quantos itens dessa lista o cupom pega */
  quantos: number;
};

/** `kind` é o discriminante: é ele que diz qual metade da união vale. */
type Row = RowProduto | RowCupom;

/** Histórico dos últimos avisos. O que virou compra, o que passou. */
const feed: Row[] = [
  {
    kind: 'cupomLista',
    codigo: 'CABELO25',
    loja: 'Amazon',
    lista: 'Minha rotina',
    quantos: 3,
    when: 'agora',
    status: 'aberto',
    text: 'Testamos nos seus itens: pega em 3 deles. Nos outros a loja exclui a categoria.',
  },
  {
    productId: 'serum-vitc',
    kind: 'preco',
    when: 'agora',
    status: 'aberto',
    text: 'Melhor preço em 90 dias na Época, e acaba em ~11 dias.',
  },
  {
    productId: 'base-matte',
    kind: 'tom',
    when: 'ontem',
    status: 'aberto',
    text: 'Tom 3.0 está R$ 28 mais barato. Você usa o 3.5.',
  },
  {
    productId: 'shampoo-refil',
    kind: 'segure',
    when: 'há 3 dias',
    status: 'aberto',
    text: 'Vale esperar a Black Friday: caiu 34% nas últimas edições.',
  },
  {
    productId: 'protetor-fps60',
    kind: 'cupom',
    when: 'há 5 dias',
    status: 'expirado',
    text: 'O cupom VERAO15 expirou antes de você usar.',
  },
  {
    productId: 'hidratante-ceramidas',
    kind: 'preco',
    when: 'há 8 dias',
    status: 'aproveitado',
    text: 'Você comprou por R$ 58,90 — R$ 6 abaixo da mediana.',
  },
];

const FILTERS: { key: Status | 'todos'; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'aberto', label: 'Em aberto' },
  { key: 'aproveitado', label: 'Aproveitados' },
  { key: 'expirado', label: 'Expirados' },
];

const kindSeal = {
  preco: { tone: 'down' as const, label: 'Preço caiu' },
  cupom: { tone: 'maybe' as const, label: 'Cupom' },
  cupomLista: { tone: 'yes' as const, label: 'Cupom vale' },
  segure: { tone: 'maybe' as const, label: 'Vale esperar' },
  tom: { tone: 'down' as const, label: 'Tom vizinho' },
};

export default function Alertas() {
  const c = useTheme();
  const s = useS();
  const router = useRouter();
  const [filter, setFilter] = useState<Status | 'todos'>('todos');
  const products = useAptum((st) => st.products);

  const rows = feed.filter((r) => filter === 'todos' || r.status === filter);

  const open = (r: Row) => {
    if (r.kind === 'cupomLista') {
      router.push({ pathname: '/cupom/[code]', params: { code: r.codigo } });
      return;
    }
    if (r.kind === 'segure') {
      router.push({ pathname: '/segure/[id]', params: { id: r.productId } });
    } else {
      router.push({ pathname: '/alerta/[id]', params: { id: r.productId } });
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <ScreenHeader title="Alertas" onBack={() => router.back()} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filtrosBox}
        contentContainerStyle={s.filters}>
        {FILTERS.map((f) => {
          const on = f.key === filter;
          return (
            <Pressable
              key={f.key}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => setFilter(f.key)}
              hitSlop={{ top: 4, bottom: 4 }}
              style={({ pressed }) => [s.chip, on && s.chipOn, pressed && { opacity: 0.82 }]}>
              <Text style={[s.chipTxt, on && s.chipTxtOn]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {rows.length === 0 ? (
          <View style={s.empty}>
            <Txt variant="bodyStrong" style={s.center}>
              Nada por aqui.
            </Txt>
            <Txt variant="body" style={[s.center, { marginTop: space.s2 }]}>
              Quando um preço bater o gatilho, o aviso aparece nesta lista.
            </Txt>
          </View>
        ) : (
          rows.map((r) => {
            const seal = kindSeal[r.kind];

            if (r.kind === 'cupomLista') {
              return (
                <Pressable
                  key={`${r.codigo}-${r.when}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Cupom ${r.codigo} da ${r.loja} vale para ${r.quantos} produtos da lista ${r.lista}. ${r.text}`}
                  onPress={() => open(r)}
                  style={({ pressed }) => [
                    s.row,
                    r.status !== 'aberto' && s.rowQuiet,
                    pressed && { borderColor: c.line2 },
                  ]}>
                  <View style={[s.shot, s.shotCupom]}>
                    <Icon name="tag" size={26} color={c.yes} strokeWidth={1.8} />
                    <Text style={s.quantos}>{r.quantos}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={s.rowTop}>
                      <Seal tone={seal.tone} label={seal.label} />
                      <Text style={s.when}>{r.when}</Text>
                    </View>
                    <Txt variant="bodyStrong" numberOfLines={3} style={{ marginTop: space.s2 }}>
                      A {r.loja} tem um cupom que vale para {r.quantos}{' '}
                      {r.quantos === 1 ? 'produto' : 'produtos'} da sua lista {r.lista}
                    </Txt>
                    <Txt variant="body" numberOfLines={2}>
                      {r.text}
                    </Txt>
                  </View>
                  <Icon name="chevron" size={19} color={c.ink3} strokeWidth={2} />
                </Pressable>
              );
            }

            const p = products.find((x) => x.id === r.productId);
            if (!p) return null;
            return (
              <Pressable
                key={`${r.productId}-${r.when}`}
                accessibilityRole="button"
                accessibilityLabel={`${seal.label}. ${p.name}. ${r.text}`}
                onPress={() => open(r)}
                style={({ pressed }) => [
                  s.row,
                  r.status !== 'aberto' && s.rowQuiet,
                  pressed && { borderColor: c.line2 },
                ]}>
                <View style={s.shot}>
                  <Vessel name={p.vessel} size={44} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={s.rowTop}>
                    <Seal tone={seal.tone} label={seal.label} />
                    <Text style={s.when}>{r.when}</Text>
                  </View>
                  <Txt variant="bodyStrong" numberOfLines={1} style={{ marginTop: space.s2 }}>
                    {p.name}
                  </Txt>
                  <Txt variant="body" numberOfLines={2}>
                    {r.text}
                  </Txt>
                  {r.status !== 'aberto' ? (
                    <Text style={s.status}>
                      {r.status === 'aproveitado' ? 'Você aproveitou' : 'Expirou'}
                    </Text>
                  ) : null}
                </View>
                <Icon name="chevron" size={19} color={c.ink3} strokeWidth={2} />
              </Pressable>
            );
          })
        )}

        <Txt variant="meta" style={s.foot}>
          Guardamos os últimos 90 dias. O teto é de 3 avisos por dia — o resto entra no
          resumo.
        </Txt>
      </ScrollView>
    </SafeAreaView>
  );
}

const useS = makeStyles((c) => ({
  safe: { flex: 1, backgroundColor: c.paper },
  scroll: { padding: space.s4, paddingBottom: space.s8 },
  center: { textAlign: 'center' },

  /**
   * Altura explícita: o ScrollView horizontal encolheu abaixo da ficha e
   * cortava o texto pelo topo. `flexGrow: 0` sozinho não resolve — ele
   * impede de crescer, não garante que caiba.
   */
  filtrosBox: { flexGrow: 0, height: 60 },
  filters: {
    paddingHorizontal: space.s4,
    paddingVertical: space.s3,
    gap: space.s2,
    alignItems: 'center',
  },
  chip: {
    borderWidth: 1,
    borderColor: c.line2,
    backgroundColor: c.card,
    borderRadius: radius.pill,
    paddingHorizontal: space.s3,
    minHeight: 36,
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: c.plum, borderColor: c.plum },
  chipTxt: { fontFamily: font.uiSemi, fontSize: size.t1, color: c.ink2 },
  chipTxtOn: { color: c.onPlum, fontFamily: font.uiBold },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: radius.r3,
    padding: space.s3,
    marginBottom: space.s3,
    minHeight: TAP,
  },
  rowQuiet: { backgroundColor: c.wash },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  shotCupom: { backgroundColor: c.yesBg },
  quantos: {
    position: 'absolute',
    bottom: 6,
    fontFamily: font.disExtra,
    fontSize: size.t1,
    color: c.yes,
    fontVariant: ['tabular-nums'],
  },
  shot: {
    width: 64,
    height: 74,
    borderRadius: radius.r2,
    backgroundColor: c.shotBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  when: { fontFamily: font.uiSemi, fontSize: size.t1, color: c.ink3 },
  status: { fontFamily: font.uiBold, fontSize: size.t0, color: c.ink3, marginTop: space.s1 },

  empty: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: c.line2,
    borderRadius: radius.r3,
    padding: space.s5,
  },
  foot: { marginTop: space.s3, textAlign: 'center', lineHeight: 18 },
}));
