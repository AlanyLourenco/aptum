import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Block, Button, CheckLine, IconButton, Seal, Txt } from '@/components/primitives';
import { brl, byId, holds } from '@/data/catalog';
import { font, radius, size, space } from '@/design/tokens';
import { makeStyles, useTheme } from '@/design/theme';

/**
 * Segure a compra — a única tela que diz para não comprar.
 * Só existe quando a trava de reposição passa: o estoque tem que
 * atravessar o fim do evento. E ela nunca bloqueia a compra.
 */
export default function Segure() {
  const c = useTheme();
  const s = useS();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const p = byId(id);
  const h = holds[id];

  if (!p || !h) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.missing}>
          <Txt variant="bodyStrong">Nenhuma recomendação de espera para este item.</Txt>
          <Button label="Voltar" kind="ghost" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const best = p.offers[0];

  return (
    <View style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <SafeAreaView edges={['top']} style={s.head}>
          <View style={s.headBar}>
            <IconButton
              name="back"
              label="Voltar"
              tint={c.onPlum}
              onPress={() => router.back()}
            />
            <Text style={s.crumb} numberOfLines={1}>
              {p.name}
            </Text>
          </View>
          <Text style={s.title}>Segure.</Text>
          <Text style={s.sub}>
            A {h.event} começa em {h.daysAway} dias e nos últimos {h.editionsSeen} anos este
            produto caiu {h.historicDropPct}% aqui.
          </Text>
          <View style={s.chips}>
            <View style={s.chip}>
              <Text style={s.chipTxt}>Confiança {h.confidence}</Text>
            </View>
            <View style={s.chip}>
              <Text style={s.chipTxt}>{h.editionsSeen} edições observadas</Text>
            </View>
          </View>
        </SafeAreaView>

        <View style={s.sheet}>
          <Block>
            <Text style={s.blockTitle}>Por que dá para esperar</Text>
            <View style={{ gap: space.s3 }}>
              {h.reasons.map((r) => (
                <CheckLine key={r} state="yes">
                  {r}
                </CheckLine>
              ))}
            </View>
          </Block>

          <Block style={s.warn}>
            <Text style={[s.blockTitle, { color: c.maybe }]}>
              Cuidado entre {h.inflationWindow.from} e {h.inflationWindow.to}
            </Text>
            <Txt variant="body">
              Nessa janela os preços costumam subir antes de cair. Se aparecer um bom preço
              antes disso, a gente avisa na hora.
            </Txt>
          </Block>

          <Block>
            <Text style={s.blockTitle}>Melhor oferta hoje</Text>
            <View style={s.offer}>
              <View style={{ flex: 1 }}>
                <Text style={s.oname}>{best.store}</Text>
                <Text style={s.ometa}>{best.format}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.op}>{brl(best.price)}</Text>
                <Text style={s.ou}>
                  {brl(best.perUnit)}/{best.unitLabel}
                </Text>
              </View>
            </View>
            <Button label="Comprar mesmo assim" kind="ghost" />
          </Block>

          <Button label={`Me avise quando a ${h.event} começar`} kind="quiet" />

          <View style={s.footnote}>
            <Seal tone="down" icon="clock" label={`Estoque até ${h.stockLastsUntil}`} />
            <Txt variant="meta" style={{ marginTop: space.s2 }}>
              Só sugerimos esperar porque o seu estoque passa do fim do evento. Se fosse
              acabar antes, esta tela não apareceria.
            </Txt>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const useS = makeStyles((c) => ({
  safe: { flex: 1, backgroundColor: c.plum },
  scroll: { paddingBottom: space.s8 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.s5 },

  head: { backgroundColor: c.plum, paddingTop: space.s3, paddingBottom: space.s7 },
  headBar: { flexDirection: 'row', alignItems: 'center', gap: space.s1, paddingHorizontal: space.s2 },
  crumb: { flex: 1, fontFamily: font.uiSemi, fontSize: size.t2, color: c.onPlum2 },
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
  chips: { flexDirection: 'row', gap: space.s2, paddingHorizontal: space.s4, marginTop: space.s4 },
  chip: {
    backgroundColor: 'rgba(237,231,242,0.14)',
    borderRadius: radius.r1,
    paddingVertical: space.s1,
    paddingHorizontal: space.s2,
  },
  chipTxt: { fontFamily: font.uiBold, fontSize: size.t0, color: c.onPlum2 },

  sheet: {
    backgroundColor: c.paper,
    borderTopLeftRadius: radius.r4,
    borderTopRightRadius: radius.r4,
    marginTop: -20,
    padding: space.s4,
    minHeight: 580,
  },
  blockTitle: {
    fontFamily: font.dis,
    fontSize: size.t3,
    letterSpacing: -0.3,
    color: c.ink,
    marginBottom: space.s3,
  },
  warn: { borderColor: '#E3D0A6' },

  offer: { flexDirection: 'row', alignItems: 'center', gap: space.s3, minHeight: 44 },
  oname: { fontFamily: font.uiBold, fontSize: size.t3, color: c.ink },
  ometa: { fontFamily: font.ui, fontSize: size.t1, color: c.ink3, marginTop: 2 },
  op: { fontFamily: font.dis, fontSize: size.t3, color: c.ink, fontVariant: ['tabular-nums'] },
  ou: {
    fontFamily: font.uiSemi,
    fontSize: size.t1,
    color: c.ink3,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },

  footnote: { marginTop: space.s5, paddingTop: space.s4, borderTopWidth: 1, borderTopColor: c.line },
}));
