import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Button, Seal, Txt } from '@/components/primitives';
import { Vessel } from '@/components/Vessel';
import { brl } from '@/data/catalog';
import { font, radius, size, space } from '@/design/tokens';
import { makeStyles, useTheme } from '@/design/theme';
import { useAptum } from '@/store/useAptum';

const monthOf = (date: string) => {
  const [, m, y] = date.split('/');
  const name = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  return name.charAt(0).toUpperCase() + name.slice(1);
};

export default function Historico() {
  const c = useTheme();
  const s = useS();
  const router = useRouter();
  const purchases = useAptum((st) => st.purchases);
  const products = useAptum((st) => st.products);

  const groups = purchases.reduce<Record<string, typeof purchases>>((acc, p) => {
    const k = monthOf(p.date);
    (acc[k] ??= []).push(p);
    return acc;
  }, {});

  const totalSaved = purchases.reduce((sum, pu) => {
    const prod = products.find((x) => x.id === pu.productId);
    if (!prod) return sum;
    return sum + (prod.history.median - pu.paid) * pu.qty;
  }, 0);

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <ScreenHeader title="Histórico" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {purchases.length === 0 ? (
          <View style={s.empty}>
            <Txt variant="bodyStrong" style={s.center}>
              Nenhuma compra registrada.
            </Txt>
            <Txt variant="body" style={[s.center, { marginTop: space.s2 }]}>
              Quando você registrar a primeira, a gente começa a aprender o seu ritmo de
              consumo e a medir a sua economia de verdade.
            </Txt>
            <Button label="Ver o que está barato" kind="ghost" onPress={() => router.push('/')} />
          </View>
        ) : (
          <>
            <View style={s.summary}>
              <Text style={s.summaryLabel}>Economia acumulada</Text>
              <Text style={[s.summaryValue, totalSaved < 0 && { color: c.up }]}>
                {brl(totalSaved)}
              </Text>
              <Txt variant="meta" style={{ marginTop: space.s2 }}>
                Preço pago contra a mediana histórica de cada produto. Compra acima da
                mediana entra negativa.
              </Txt>
            </View>

            {Object.entries(groups).map(([month, rows]) => (
              <View key={month}>
                <Text style={s.month}>{month}</Text>
                {rows.map((pu) => {
                  const prod = products.find((x) => x.id === pu.productId);
                  const delta = prod ? (prod.history.median - pu.paid) * pu.qty : 0;
                  return (
                    <View key={pu.id} style={s.row}>
                      <View style={s.shot}>
                        {prod ? <Vessel name={prod.vessel} size={40} /> : null}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Txt variant="bodyStrong" numberOfLines={2}>
                          {prod?.name ?? 'Produto removido'}
                        </Txt>
                        <Text style={s.meta}>
                          {pu.store} · {pu.date} · {pu.qty}{' '}
                          {pu.qty === 1 ? 'unidade' : 'unidades'}
                        </Text>
                        {pu.variant ? <Text style={s.meta}>Tom {pu.variant}</Text> : null}
                        <Seal
                          tone={delta >= 0 ? 'yes' : 'up'}
                          label={
                            delta >= 0
                              ? `Economizou ${brl(delta)}`
                              : `Pagou ${brl(Math.abs(delta))} a mais`
                          }
                          style={{ marginTop: space.s2 }}
                        />
                      </View>
                      <View style={s.right}>
                        <Text style={s.paid}>{brl(pu.paid * pu.qty)}</Text>
                        {prod ? (
                          <Text style={s.unit}>
                            {brl(pu.paid / (prod.perUnit > 0 ? prod.price / prod.perUnit : 1))}/
                            {prod.unitLabel}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const useS = makeStyles((c) => ({
  safe: { flex: 1, backgroundColor: c.paper },
  scroll: { padding: space.s4, paddingBottom: space.s8 },
  center: { textAlign: 'center' },

  summary: {
    backgroundColor: c.plum,
    borderRadius: radius.r3,
    padding: space.s4,
    marginBottom: space.s4,
  },
  summaryLabel: { fontFamily: font.uiSemi, fontSize: size.t1, color: c.onPlum3 },
  summaryValue: {
    fontFamily: font.disExtra,
    fontSize: size.t7,
    letterSpacing: -1.4,
    color: c.lilac1,
    fontVariant: ['tabular-nums'],
    marginTop: space.s1,
  },

  month: {
    fontFamily: font.dis,
    fontSize: size.t4,
    letterSpacing: -0.5,
    color: c.ink,
    marginBottom: space.s3,
    marginTop: space.s2,
  },

  row: {
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
    width: 58,
    height: 68,
    borderRadius: radius.r2,
    backgroundColor: c.shotBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { fontFamily: font.ui, fontSize: size.t1, color: c.ink3, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  paid: {
    fontFamily: font.dis,
    fontSize: size.t3,
    color: c.ink,
    fontVariant: ['tabular-nums'],
  },
  unit: {
    fontFamily: font.uiSemi,
    fontSize: size.t0,
    color: c.ink3,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },

  empty: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: c.line2,
    borderRadius: radius.r3,
    padding: space.s5,
  },
}));
