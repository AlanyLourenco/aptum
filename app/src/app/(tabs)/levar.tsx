import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Button, Seal, Txt } from '@/components/primitives';
import { brl } from '@/data/catalog';
import { font, radius, size, space, TAP } from '@/design/tokens';
import { makeStyles, useTheme } from '@/design/theme';
import { groupBagByStore, useAptum } from '@/store/useAptum';

export default function Levar() {
  const c = useTheme();
  const s = useS();
  const router = useRouter();
  const bag = useAptum(useShallow((st) => st.bag));
  const products = useAptum(useShallow((st) => st.products));
  const stores = useMemo(() => groupBagByStore(bag, products), [bag, products]);
  const setBagQty = useAptum((st) => st.setBagQty);
  const removeFromBag = useAptum((st) => st.removeFromBag);

  const items = stores.reduce((n, st) => n + st.items.length, 0);

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <ScreenHeader
        title="Vou levar"
        right={
          items > 0 ? (
            <Text style={s.count}>
              {items} {items === 1 ? 'item' : 'itens'} · {stores.length}{' '}
              {stores.length === 1 ? 'loja' : 'lojas'}
            </Text>
          ) : null
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {stores.length === 0 ? (
          <View style={s.empty}>
            <Txt variant="bodyStrong" style={s.center}>
              Nada marcado ainda.
            </Txt>
            <Txt variant="body" style={[s.center, { marginTop: space.s2 }]}>
              Quando um preço estiver bom, marque “vou levar” e a gente agrupa por loja para
              você comprar tudo de uma vez.
            </Txt>
            <Button
              label="Ver o que está barato"
              kind="ghost"
              onPress={() => router.push('/')}
            />
          </View>
        ) : (
          stores.map((store) => (
            <View key={store.store}>
              <View style={s.shead}>
                <Text style={s.sheadTitle}>{store.store}</Text>
                <Text style={s.sheadCount}>
                  {store.items.length} {store.items.length === 1 ? 'item' : 'itens'}
                </Text>
              </View>

              <View style={s.card}>
                {store.items.map((row, i) => (
                  <View
                    key={row.product.id}
                    style={[s.line, i === store.items.length - 1 && { borderBottomWidth: 0 }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.iname} numberOfLines={2}>
                        {row.product.name}
                      </Text>
                      <Text style={s.iqty}>
                        {brl(row.product.perUnit)} / {row.product.unitLabel}
                      </Text>
                    </View>

                    <View style={s.stepper}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Diminuir ${row.product.name}`}
                        onPress={() => setBagQty(row.product.id, row.qty - 1)}
                        style={({ pressed }) => [s.step, pressed && s.stepPressed]}>
                        <Icon name="close" size={13} color={c.ink2} strokeWidth={2.4} />
                      </Pressable>
                      <Text style={s.qty}>{row.qty}</Text>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Aumentar ${row.product.name}`}
                        onPress={() => setBagQty(row.product.id, row.qty + 1)}
                        style={({ pressed }) => [s.step, pressed && s.stepPressed]}>
                        <Icon name="plus" size={15} color={c.ink2} strokeWidth={2.2} />
                      </Pressable>
                    </View>

                    <Text style={s.itotal}>{brl(row.product.price * row.qty)}</Text>
                  </View>
                ))}

                <View style={s.total}>
                  <View>
                    <Text style={s.totalLabel}>
                      {store.couponCode
                        ? `Com ${store.couponCode}`
                        : 'Sem cupom que sirva hoje'}
                    </Text>
                    <Text style={[s.totalValue, store.saves > 0 ? { color: c.yes } : null]}>
                      {brl(store.total)}
                    </Text>
                  </View>
                  {store.saves > 0 ? (
                    <Seal tone="yes" label={`Economiza ${brl(store.saves)}`} />
                  ) : null}
                </View>

                <Button
                  label={`Abrir a ${store.store.split(' ')[0]}${store.couponCode ? ' com o cupom' : ''}`}
                  kind={store.couponCode ? 'solid' : 'ghost'}
                />
                <Txt variant="meta" style={s.fine}>
                  O Aptum não vende. Você finaliza na loja, e o preço não inclui frete.
                </Txt>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Tirar tudo da ${store.store}`}
                  onPress={() => store.items.forEach((r) => removeFromBag(r.product.id))}
                  style={({ pressed }) => [s.clear, pressed && { opacity: 0.7 }]}>
                  <Text style={s.clearTxt}>Tirar tudo desta loja</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const useS = makeStyles((c) => ({
  safe: { flex: 1, backgroundColor: c.paper },
  scroll: { paddingBottom: space.s7 },
  center: { textAlign: 'center' },

  count: {
    fontFamily: font.uiSemi,
    fontSize: size.t2,
    color: c.ink3,
    fontVariant: ['tabular-nums'],
  },

  empty: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: c.line2,
    borderRadius: radius.r3,
    padding: space.s5,
    margin: space.s4,
  },

  shead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: space.s4,
    paddingTop: space.s5,
    paddingBottom: space.s1,
  },
  sheadTitle: { fontFamily: font.dis, fontSize: size.t4, letterSpacing: -0.5, color: c.ink },
  sheadCount: {
    fontFamily: font.uiSemi,
    fontSize: size.t2,
    color: c.ink3,
    fontVariant: ['tabular-nums'],
  },

  card: {
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: radius.r3,
    padding: space.s4,
    marginHorizontal: space.s4,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    paddingVertical: space.s3,
    borderBottomWidth: 1,
    borderBottomColor: c.line,
  },
  iname: { fontFamily: font.uiBold, fontSize: size.t2, color: c.ink, lineHeight: 18 },
  iqty: {
    fontFamily: font.ui,
    fontSize: size.t1,
    color: c.ink3,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: radius.pill,
  },
  step: {
    width: 34,
    height: TAP - 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  stepPressed: { backgroundColor: c.wash },
  qty: {
    fontFamily: font.uiBold,
    fontSize: size.t2,
    color: c.ink,
    minWidth: 16,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },

  itotal: {
    fontFamily: font.dis,
    fontSize: size.t3,
    color: c.ink,
    fontVariant: ['tabular-nums'],
    minWidth: 68,
    textAlign: 'right',
  },

  total: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: space.s3,
    paddingTop: space.s3,
    borderTopWidth: 1.5,
    borderTopColor: c.line2,
  },
  totalLabel: { fontFamily: font.uiSemi, fontSize: size.t1, color: c.ink3 },
  totalValue: {
    fontFamily: font.disExtra,
    fontSize: size.t6,
    letterSpacing: -1,
    color: c.ink,
    fontVariant: ['tabular-nums'],
    marginTop: space.s1,
  },
  fine: { textAlign: 'center', marginTop: space.s2, lineHeight: 18 },

  clear: { minHeight: TAP, alignItems: 'center', justifyContent: 'center', marginTop: space.s1 },
  clearTxt: { fontFamily: font.uiSemi, fontSize: size.t2, color: c.ink3 },
}));
