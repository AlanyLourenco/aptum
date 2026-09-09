import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { Icon } from '@/components/Icon';
import { IconButton, Seal, Txt } from '@/components/primitives';
import { CartaoPremissa } from '@/components/CartaoPremissa';
import { PromoTile } from '@/components/ProductCard';
import { ProductRail } from '@/components/ProductRail';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Vessel } from '@/components/Vessel';
import { brl, categories } from '@/data/catalog';
import { font, radius, size, space } from '@/design/tokens';
import { makeStyles, useTheme } from '@/design/theme';
import {
  OPPORTUNITIES,
  selectOpportunityCounts,
  selectVisibleProducts,
  SORTS,
  useAptum,
} from '@/store/useAptum';

export default function Inicio() {
  const c = useTheme();
  const s = useS();
  const router = useRouter();
  const [sortOpen, setSortOpen] = useState(false);

  const category = useAptum((st) => st.category);
  const setCategory = useAptum((st) => st.setCategory);
  const opportunities = useAptum((st) => st.opportunities);
  const toggleOpportunity = useAptum((st) => st.toggleOpportunity);
  const sort = useAptum((st) => st.sort);
  const setSort = useAptum((st) => st.setSort);

  const visible = useAptum(useShallow(selectVisibleProducts));
  const counts = useAptum(useShallow(selectOpportunityCounts));
  const routine = useAptum(useShallow((st) => st.products.filter((p) => p.inRoutine)));
  const favourites = useAptum((st) => st.favourites);
  const allProducts = useAptum((st) => st.products);

  const sortLabel = SORTS.find((x) => x.key === sort)!.label;

  /**
   * O que está nas listas dela e caiu de preço. Fica acima da lista
   * detalhada porque é a resposta que ela abre o app para ver — a lista
   * inteira, item por item, continua logo abaixo.
   */
  const mine = useMemo(() => {
    const score = (p: (typeof allProducts)[number]) =>
      (p.discountPct ?? 0) + (p.coupon?.state === 'yes' ? 12 : 0);
    return allProducts
      .filter((p) => (p.inRoutine || favourites.includes(p.id)) && score(p) > 0)
      .sort((a, b) => score(b) - score(a))
      .slice(0, 8);
  }, [allProducts, favourites]);

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <ScreenHeader
        wordmark
        right={
          <>
            <IconButton
              name="search"
              label="Buscar produto"
              onPress={() => router.push('/adicionar')}
            />
            <IconButton
              name="bell"
              label="Alertas, 3 novos"
              badge={3}
              onPress={() => router.push('/alertas')}
            />
          </>
        }
      />

      <View style={s.catsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.catsInner}>
            {categories.map((c) => {
            const on = c === category;
            return (
              <Pressable
                key={c}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                onPress={() => setCategory(c)}
                style={s.cat}>
                <Text style={[s.catTxt, on && s.catTxtOn]}>{c}</Text>
                <View style={[s.catRule, on && s.catRuleOn]} />
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filters}>
          {/* a ordenação abre a fila: é o único controle que muda a lista toda */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ordenar por ${sortLabel}. Tocar para mudar.`}
            onPress={() => setSortOpen(true)}
            style={({ pressed }) => [s.fchip, s.fsort, pressed && { opacity: 0.82 }]}>
            <Icon name="sort" size={15} color={c.ink} strokeWidth={2} />
            <Text style={s.fsortTxt}>{sortLabel}</Text>
          </Pressable>
          <View style={s.divisor} />

          {OPPORTUNITIES.map((o) => {
            const on = opportunities.includes(o.key);
            return (
              <Pressable
                key={o.key}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`${o.label}, ${counts[o.key]} itens${on ? '. Filtro ativo' : ''}`}
                onPress={() => toggleOpportunity(o.key)}
                hitSlop={{ top: 4, bottom: 4 }}
                style={({ pressed }) => [s.fchip, on && s.fchipOn, pressed && { opacity: 0.82 }]}>
                <Text style={[s.fchipTxt, on && s.fchipTxtOn]}>{o.label}</Text>
                {on ? <Icon name="close" size={12} color={c.onPlum} strokeWidth={2.6} /> : null}
              </Pressable>
            );
          })}
        </ScrollView>

        {/*
          O que o app faz, dito antes de qualquer produto. Sem isto a tela
          abre numa vitrine e a função principal — monitorar o que é dela —
          só aparece rolando até o fim.
        */}
        <View style={s.blocoTopo}>
          <CartaoPremissa onPress={() => router.push('/adicionar')} />
        </View>

        {visible.length === 0 ? (
          <View style={s.empty}>
            <Txt variant="bodyStrong" style={s.emptyTitle}>
              Nada nesse recorte.
            </Txt>
            <Txt variant="body" style={s.emptyBody}>
              Tire um filtro ou troque de categoria — o que você monitora continua aqui.
            </Txt>
          </View>
        ) : (
          <>
            <ProductRail
              title="Achados de hoje"
              meta={`${visible.length} ${visible.length === 1 ? 'item' : 'itens'}`}
              products={visible}
            />

            <View style={s.bloco}>
              <PromoTile
                title="Semana da beleza"
                body="Até 40% em skincare nas quatro lojas. Termina domingo."
              />
            </View>
          </>
        )}

        <ProductRail
          title="Das suas listas"
          meta={mine.length > 0 ? 'em promoção agora' : undefined}
          products={mine}
        />

        <View style={s.shead}>
          <Text style={s.sheadTitle}>Da sua rotina</Text>
          <Text style={s.sheadLink}>{routine.length} itens</Text>
        </View>

        {routine.map((p) => (
          <Pressable
            key={p.id}
            accessibilityRole="button"
            accessibilityLabel={`Abrir ${p.name}`}
            onPress={() => router.push({ pathname: '/produto/[id]', params: { id: p.id } })}
            style={({ pressed }) => [s.lrow, pressed && { borderColor: c.line2 }]}>
            <View style={s.lshot}>
              <Vessel name={p.vessel} size={48} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt variant="brand">{p.brand}</Txt>
              <Txt variant="bodyStrong" numberOfLines={2}>
                {p.name} · {p.sizeLabel}
              </Txt>
              <View style={s.lprice}>
                <Text style={s.lpriceNow}>{brl(p.price)}</Text>
                <Text style={s.lpriceUnit}>
                  {brl(p.perUnit)} / {p.unitLabel}
                </Text>
              </View>
              {p.runsOutInDays ? (
                <Seal
                  tone="maybe"
                  icon="clock"
                  label={`Acaba em ${p.runsOutInDays} dias`}
                  style={{ marginTop: space.s2 }}
                />
              ) : null}
            </View>
          </Pressable>
        ))}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Adicionar um produto para monitorar"
          onPress={() => router.push('/adicionar')}
          style={({ pressed }) => [s.add, pressed && { backgroundColor: c.wash }]}>
          <View style={s.addDot}>
            <Icon name="plus" size={20} color={c.accent} strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.addTitle}>Adicionar outro produto</Text>
            <Txt variant="body" style={{ marginTop: 2 }}>
              Busque pelo nome ou escaneie o código de barras da embalagem.
            </Txt>
          </View>
        </Pressable>
      </ScrollView>

      <Modal
        visible={sortOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSortOpen(false)}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar a ordenação"
          style={s.scrim}
          onPress={() => setSortOpen(false)}
        />
        <View style={s.sheetWrap}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>Ordenar por</Text>
            {SORTS.map((o) => {
              const on = o.key === sort;
              return (
                <Pressable
                  key={o.key}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  onPress={() => {
                    setSort(o.key);
                    setSortOpen(false);
                  }}
                  style={({ pressed }) => [s.sortRow, pressed && { backgroundColor: c.wash }]}>
                  <Text style={[s.sortTxt, on && s.sortTxtOn]}>{o.label}</Text>
                  {on ? <Icon name="check" size={18} color={c.accent} strokeWidth={2.4} /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const useS = makeStyles((c) => ({
  safe: { flex: 1, backgroundColor: c.paper },
  scroll: { paddingBottom: space.s7 },

  /**
   * 42, não 50. O texto é alinhado embaixo (é uma aba, a régua fica sob
   * ele), então toda altura sobrando vira vazio entre o letreiro e as
   * categorias — eram 39px de distância contra 12 do resto da tela.
   */
  catsWrap: { height: 36, borderBottomWidth: 1, borderBottomColor: c.line },
  catsInner: { paddingHorizontal: space.s4, gap: space.s5, alignItems: 'flex-end' },
  cat: { height: 36, justifyContent: 'flex-end' },
  catTxt: { fontFamily: font.uiSemi, fontSize: size.t3, color: c.ink3, textAlign: 'center' },
  catTxtOn: { color: c.ink },
  catRule: { height: 2.5, backgroundColor: 'transparent', marginTop: space.s2, width: '100%' },
  catRuleOn: { backgroundColor: c.ink },


  filters: {
    paddingHorizontal: space.s4,
    paddingTop: space.s3,
    paddingBottom: space.s2,
    gap: space.s2,
    alignItems: 'center',
  },
  /** a ordenação é do mesmo tamanho das fichas, mas não é um filtro: sem preenchimento e com divisória atrás */
  fsort: { borderColor: c.ink3, gap: space.s2 },
  fsortTxt: { fontFamily: font.uiBold, fontSize: size.t1, color: c.ink },
  divisor: { width: 1, height: 22, backgroundColor: c.line2, marginHorizontal: space.s1 },
  fchip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s1,
    borderWidth: 1,
    borderColor: c.line2,
    backgroundColor: c.card,
    borderRadius: radius.pill,
    paddingHorizontal: space.s3,
    minHeight: 36,
  },
  fchipOn: { backgroundColor: c.plum, borderColor: c.plum },
  fchipTxt: { fontFamily: font.uiSemi, fontSize: size.t1, color: c.ink2 },
  fchipTxtOn: { color: c.onPlum, fontFamily: font.uiBold },

  /**
   * Ritmo vertical da Início: cada bloco paga só o seu espaço de cima.
   * `blocoTopo` segue a barra de controle, que não é seção; `bloco` segue
   * outra seção. O trilho e a lista já usam s6 no próprio cabeçalho, então
   * a tela inteira anda no mesmo degrau.
   */
  blocoTopo: { paddingHorizontal: space.s4, paddingTop: space.s4 },
  bloco: { paddingHorizontal: space.s4, paddingTop: space.s6 },

  empty: {
    marginHorizontal: space.s4,
    marginTop: space.s5,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: c.line2,
    borderRadius: radius.r3,
    padding: space.s5,
  },
  emptyTitle: { textAlign: 'center' },
  emptyBody: { textAlign: 'center', marginTop: space.s2 },

  shead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: space.s4,
    paddingTop: space.s6,
    paddingBottom: space.s2,
  },
  sheadTitle: { fontFamily: font.dis, fontSize: size.t4, letterSpacing: -0.5, color: c.ink },
  sheadLink: {
    fontFamily: font.uiSemi,
    fontSize: size.t2,
    color: c.ink3,
    fontVariant: ['tabular-nums'],
  },

  /** o fim da lista é o lugar de crescer a lista */
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: c.line2,
    borderRadius: radius.r3,
    padding: space.s4,
    marginHorizontal: space.s4,
    /** fecha 24 com o marginBottom das linhas acima, como as outras seções */
    marginTop: space.s3,
  },
  addDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.lilac1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTitle: { fontFamily: font.uiExtra, fontSize: size.t3, color: c.ink },

  lrow: {
    flexDirection: 'row',
    gap: space.s3,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: radius.r3,
    padding: space.s3,
    marginHorizontal: space.s4,
    marginBottom: space.s3,
  },
  lshot: {
    width: 76,
    height: 88,
    borderRadius: radius.r2,
    backgroundColor: c.shotBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lprice: { flexDirection: 'row', alignItems: 'baseline', gap: space.s2, marginTop: space.s1 },
  lpriceNow: {
    fontFamily: font.disExtra,
    fontSize: size.t5,
    letterSpacing: -0.8,
    color: c.ink,
    fontVariant: ['tabular-nums'],
  },
  lpriceUnit: {
    fontFamily: font.uiSemi,
    fontSize: size.t1,
    color: c.ink3,
    fontVariant: ['tabular-nums'],
  },

  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(27,20,32,0.45)',
  },
  sheetWrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: c.paper,
    borderTopLeftRadius: radius.r4,
    borderTopRightRadius: radius.r4,
    padding: space.s4,
    paddingBottom: space.s7,
  },
  sheetTitle: {
    fontFamily: font.dis,
    fontSize: size.t4,
    letterSpacing: -0.5,
    color: c.ink,
    marginBottom: space.s3,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: space.s3,
    borderRadius: radius.r2,
  },
  sortTxt: { fontFamily: font.uiSemi, fontSize: size.t3, color: c.ink2 },
  sortTxtOn: { fontFamily: font.uiBold, color: c.ink },
}));
