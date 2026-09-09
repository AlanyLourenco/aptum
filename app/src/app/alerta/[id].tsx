import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Block, Button, CheckLine, IconButton, Txt } from '@/components/primitives';
import { Vessel } from '@/components/Vessel';
import { alerts, brl, byId } from '@/data/catalog';
import { font, radius, size, space } from '@/design/tokens';
import { makeStyles, useTheme } from '@/design/theme';

/** Compre agora — responde em uma tela: o quê, por quanto, onde, por que, quantos. */
export default function Alerta() {
  const c = useTheme();
  const s = useS();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const p = byId(id);
  const a = alerts[id];

  if (!p || !a) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.missing}>
          <Txt variant="bodyStrong">Este alerta não existe mais.</Txt>
          <Button label="Voltar" kind="ghost" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const store = p.offers[0];

  return (
    <View style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <SafeAreaView edges={['top']} style={s.head}>
          <View style={s.headBar}>
            <IconButton
              name="close"
              label="Fechar"
              tint={c.onPlum}
              onPress={() => router.back()}
            />
            <View style={{ flex: 1 }} />
            <Text style={s.when}>{a.detectedAgo}</Text>
          </View>
          <Text style={s.title}>Compre agora.</Text>
          <Text style={s.sub}>
            Melhor preço em 90 dias, e acaba em ~{p.runsOutInDays} dias.
          </Text>
        </SafeAreaView>

        <View style={s.sheet}>
          <View style={s.product}>
            <View style={s.shot}>
              <Vessel name={p.vessel} size={48} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt variant="brand">
                {p.brand} · {store.store}
              </Txt>
              <Txt variant="bodyStrong" numberOfLines={2}>
                {p.name} · {p.sizeLabel}
              </Txt>
              {p.wasPrice ? <Text style={s.was}>{brl(p.wasPrice)}</Text> : null}
              <Text style={s.now}>{brl(p.price)}</Text>
              <Text style={s.unit}>
                {brl(p.perUnit)} / {p.unitLabel} · já com o cupom
              </Text>
            </View>
          </View>

          <Block>
            <Text style={s.blockTitle}>Por que agora</Text>
            <View style={{ gap: space.s3 }}>
              {a.reasons.map((r) => (
                <CheckLine key={r} state="yes">
                  {r}
                </CheckLine>
              ))}
            </View>
          </Block>

          <Block tone="plum">
            <Text style={[s.blockTitle, { color: c.onPlum }]}>Quantos levar</Text>
            <View style={s.pairs}>
              <Pair label="Sugerido" value={`${a.suggestQty} unidades`} />
              <Pair label="Cobre" value={`~${a.coversMonths} meses`} />
              <Pair label="Total" value={brl(a.total)} />
              <Pair label="Economia" value={brl(a.saves)} tint="#7FAEEA" />
            </View>
          </Block>

          {a.couponCode ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Copiar o código ${a.couponCode}`}
              style={({ pressed }) => [s.codebox, pressed && { opacity: 0.85 }]}>
              <Text style={s.codeVal}>{a.couponCode}</Text>
              <Text style={s.codeAct}>Copiado</Text>
            </Pressable>
          ) : null}

          <Button label={`Ir para a ${store.store}`} />
          <Button label='Adicionar a “vou levar”' kind="quiet" />
          <Txt variant="meta" style={s.fine}>
            Preço sem frete · link de afiliado, não muda o ranking
          </Txt>
        </View>
      </ScrollView>
    </View>
  );
}

function Pair({ label, value, tint }: { label: string; value: string; tint?: string }) {
  const s = useS();
  return (
    <View style={s.pair}>
      <Text style={s.pk}>{label}</Text>
      <Text style={[s.pv, tint ? { color: tint } : null]}>{value}</Text>
    </View>
  );
}

const useS = makeStyles((c) => ({
  safe: { flex: 1, backgroundColor: c.plum },
  scroll: { paddingBottom: space.s8 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.s5 },

  head: { backgroundColor: c.plum, paddingTop: space.s3, paddingBottom: space.s7 },
  headBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.s2 },
  when: {
    fontFamily: font.uiSemi,
    fontSize: size.t2,
    color: c.onPlum2,
    paddingRight: space.s3,
  },
  title: {
    fontFamily: font.disExtra,
    fontSize: size.t7,
    letterSpacing: -1.4,
    color: c.onPlum,
    paddingHorizontal: space.s4,
    lineHeight: 34,
  },
  sub: {
    fontFamily: font.ui,
    fontSize: size.t3,
    color: c.onPlum2,
    paddingHorizontal: space.s4,
    marginTop: space.s2,
    lineHeight: 21,
  },

  sheet: {
    backgroundColor: c.paper,
    borderTopLeftRadius: radius.r4,
    borderTopRightRadius: radius.r4,
    marginTop: -20,
    padding: space.s4,
    minHeight: 600,
  },

  product: {
    flexDirection: 'row',
    gap: space.s3,
    backgroundColor: c.card,
    borderWidth: 1.5,
    borderColor: '#BAD1EE',
    borderRadius: radius.r3,
    padding: space.s3,
    marginBottom: space.s3,
  },
  shot: {
    width: 76,
    height: 88,
    borderRadius: radius.r2,
    backgroundColor: c.shotBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  was: {
    fontFamily: font.ui,
    fontSize: size.t1,
    color: c.ink3,
    textDecorationLine: 'line-through',
    fontVariant: ['tabular-nums'],
    marginTop: space.s2,
  },
  now: {
    fontFamily: font.disExtra,
    fontSize: size.t7,
    letterSpacing: -1.4,
    color: c.down,
    fontVariant: ['tabular-nums'],
    lineHeight: 34,
  },
  unit: {
    fontFamily: font.uiSemi,
    fontSize: size.t1,
    color: c.ink3,
    fontVariant: ['tabular-nums'],
  },

  blockTitle: {
    fontFamily: font.dis,
    fontSize: size.t3,
    letterSpacing: -0.3,
    color: c.ink,
    marginBottom: space.s3,
  },

  pairs: { flexDirection: 'row', flexWrap: 'wrap' },
  pair: { width: '50%', paddingBottom: space.s4 },
  pk: { fontFamily: font.uiSemi, fontSize: size.t1, color: c.onPlum3 },
  pv: {
    fontFamily: font.dis,
    fontSize: size.t4,
    letterSpacing: -0.5,
    color: c.onPlum,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },

  codebox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: c.lilac3,
    backgroundColor: '#EDE6F1',
    borderRadius: radius.r2,
    paddingHorizontal: space.s4,
    minHeight: 52,
    marginTop: space.s3,
  },
  codeVal: {
    fontFamily: font.disExtra,
    fontSize: size.t4,
    letterSpacing: 1.6,
    color: c.plum2,
  },
  codeAct: {
    fontFamily: font.uiExtra,
    fontSize: size.t1,
    color: c.lilac3,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },

  fine: { marginTop: space.s2, textAlign: 'center', lineHeight: 18 },
}));
