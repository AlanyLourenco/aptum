import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Block, Button, Txt } from '@/components/primitives';
import { Vessel } from '@/components/Vessel';
import { brl, byId } from '@/data/catalog';
import { font, radius, size, space, TAP } from '@/design/tokens';
import { makeStyles, useTheme } from '@/design/theme';
import { useAptum } from '@/store/useAptum';

const today = () =>
  new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export default function RegistrarCompra() {
  const c = useTheme();
  const s = useS();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const p = byId(id);
  const recordPurchase = useAptum((st) => st.recordPurchase);

  const [store, setStore] = useState(p?.offers[0].store ?? '');
  const [paid, setPaid] = useState(p ? String(p.price).replace('.', ',') : '');
  const [qty, setQty] = useState(1);

  if (!p) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.missing}>
          <Txt variant="bodyStrong">Produto não encontrado.</Txt>
          <Button label="Voltar" kind="ghost" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const paidNumber = Number(paid.replace(/\./g, '').replace(',', '.'));
  const valid = store.trim().length > 1 && paidNumber > 0;
  const vsMedian = valid ? paidNumber - p.history.median : 0;

  const save = () => {
    if (!valid) return;
    recordPurchase({
      productId: p.id,
      store: store.trim(),
      date: today(),
      paid: paidNumber,
      qty,
      variant: p.variant ? `${p.variant.code} ${p.variant.name}` : undefined,
    });
    router.replace('/historico');
  };

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <ScreenHeader title="Registrar compra" backIcon="close" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.product}>
          <View style={s.shot}>
            <Vessel name={p.vessel} size={44} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt variant="brand">{p.brand}</Txt>
            <Txt variant="bodyStrong">
              {p.name} · {p.sizeLabel}
            </Txt>
            {p.variant ? (
              <Text style={s.variant}>
                Tom {p.variant.code} {p.variant.name}
              </Text>
            ) : null}
          </View>
        </View>

        <Block>
          <Text style={s.label}>Onde você comprou</Text>
          <View style={s.stores}>
            {p.offers.map((o) => {
              const on = o.store === store;
              return (
                <Pressable
                  key={o.store}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  onPress={() => setStore(o.store)}
                  hitSlop={{ top: 4, bottom: 4 }}
                  style={({ pressed }) => [s.chip, on && s.chipOn, pressed && { opacity: 0.85 }]}>
                  <Text style={[s.chipTxt, on && s.chipTxtOn]}>{o.store}</Text>
                </Pressable>
              );
            })}
          </View>
          <TextInput
            value={store}
            onChangeText={setStore}
            placeholder="Ou digite outra loja"
            placeholderTextColor={c.ink3}
            style={s.input}
            accessibilityLabel="Nome da loja"
          />
        </Block>

        <Block>
          <Text style={s.label}>Quanto você pagou</Text>
          <View style={s.moneyRow}>
            <Text style={s.currency}>R$</Text>
            <TextInput
              value={paid}
              onChangeText={setPaid}
              keyboardType="decimal-pad"
              placeholder="0,00"
              placeholderTextColor={c.ink3}
              style={s.money}
              accessibilityLabel="Valor pago em reais"
            />
          </View>
          {valid ? (
            <Text style={[s.compare, { color: vsMedian <= 0 ? c.yes : c.up }]}>
              {vsMedian <= 0
                ? `${brl(Math.abs(vsMedian))} abaixo da mediana de 90 dias`
                : `${brl(vsMedian)} acima da mediana de 90 dias`}
            </Text>
          ) : null}
        </Block>

        <Block>
          <Text style={s.label}>Quantas unidades</Text>
          <View style={s.qtyRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Diminuir quantidade"
              onPress={() => setQty((q) => Math.max(1, q - 1))}
              style={({ pressed }) => [s.qtyBtn, pressed && { backgroundColor: c.wash }]}>
              <Icon name="close" size={15} color={c.ink2} strokeWidth={2.4} />
            </Pressable>
            <Text style={s.qtyVal}>{qty}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Aumentar quantidade"
              onPress={() => setQty((q) => q + 1)}
              style={({ pressed }) => [s.qtyBtn, pressed && { backgroundColor: c.wash }]}>
              <Icon name="plus" size={17} color={c.ink2} strokeWidth={2.2} />
            </Pressable>
            <View style={{ flex: 1 }} />
            <Text style={s.qtyTotal}>{valid ? brl(paidNumber * qty) : '—'}</Text>
          </View>
        </Block>

        <Txt variant="meta" style={s.why}>
          Registrar a compra ajusta quando o produto vai acabar e alimenta a sua economia. É
          também o que faz o app aprender o seu ritmo em vez de depender do palpite inicial.
        </Txt>

        <Button label="Registrar" onPress={save} disabled={!valid} style={!valid && s.off} />
      </ScrollView>
    </SafeAreaView>
  );
}

const useS = makeStyles((c) => ({
  safe: { flex: 1, backgroundColor: c.paper },
  scroll: { padding: space.s4, paddingBottom: space.s8 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.s5 },

  product: {
    flexDirection: 'row',
    gap: space.s3,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: radius.r3,
    padding: space.s3,
    marginBottom: space.s3,
  },
  shot: {
    width: 64,
    height: 74,
    borderRadius: radius.r2,
    backgroundColor: c.shotBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  variant: { fontFamily: font.uiSemi, fontSize: size.t1, color: c.ink2, marginTop: 2 },

  label: { fontFamily: font.dis, fontSize: size.t3, letterSpacing: -0.3, color: c.ink },

  stores: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2, marginTop: space.s3 },
  chip: {
    borderWidth: 1,
    borderColor: c.line2,
    borderRadius: radius.pill,
    paddingHorizontal: space.s3,
    minHeight: 36,
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: c.plum, borderColor: c.plum },
  chipTxt: { fontFamily: font.uiSemi, fontSize: size.t1, color: c.ink2 },
  chipTxtOn: { color: c.onPlum, fontFamily: font.uiBold },

  input: {
    fontFamily: font.ui,
    fontSize: size.t3,
    color: c.ink,
    borderBottomWidth: 1,
    borderBottomColor: c.line,
    paddingVertical: space.s2,
    marginTop: space.s3,
    minHeight: TAP,
  },

  moneyRow: { flexDirection: 'row', alignItems: 'baseline', gap: space.s2, marginTop: space.s3 },
  currency: { fontFamily: font.dis, fontSize: size.t5, color: c.ink3 },
  money: {
    flex: 1,
    fontFamily: font.disExtra,
    fontSize: size.t7,
    letterSpacing: -1.4,
    color: c.ink,
    paddingVertical: 0,
    minHeight: TAP,
  },
  compare: { fontFamily: font.uiBold, fontSize: size.t2, marginTop: space.s2 },

  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: space.s2, marginTop: space.s3 },
  qtyBtn: {
    width: TAP,
    height: TAP,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: c.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyVal: {
    fontFamily: font.disExtra,
    fontSize: size.t5,
    color: c.ink,
    minWidth: 32,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  qtyTotal: {
    fontFamily: font.dis,
    fontSize: size.t4,
    color: c.ink,
    fontVariant: ['tabular-nums'],
  },

  why: { lineHeight: 18, marginTop: space.s2 },
  off: { opacity: 0.4 },
}));
