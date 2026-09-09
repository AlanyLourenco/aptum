import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { Block, Button, CheckLine, IconButton, Seal, Txt } from '@/components/primitives';
import { Vessel } from '@/components/Vessel';
import { brl, byId, holds } from '@/data/catalog';
import { font, radius, size, space } from '@/design/tokens';
import { makeStyles, useTheme } from '@/design/theme';

export default function Produto() {
  const c = useTheme();
  const s = useS();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const p = byId(id);

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

  const best = p.offers[0];
  const hold = holds[p.id];
  /**
   * A mediana do histórico é do frasco fechado, então quem entra na conta
   * é o preço do frasco — não o preço por ml. Comparar os dois dava −98%.
   */
  const cheaper =
    p.history.median > 0 ? Math.round((1 - p.offers[0].price / p.history.median) * 100) : 0;

  return (
    <View style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <LinearGradient colors={c.gradients.shot} style={s.hero}>
          <SafeAreaView edges={['top']} style={s.heroTop}>
            <IconButton name="back" label="Voltar" onPress={() => router.back()} />
            <IconButton
              name={p.favourite ? 'heartFilled' : 'heart'}
              label={p.favourite ? 'Remover dos favoritos' : 'Favoritar'}
              tint={p.favourite ? c.up : c.ink}
            />
          </SafeAreaView>
          <Vessel name={p.vessel} size={142} color="#4B3560" strokeWidth={2} />
        </LinearGradient>

        <View style={s.sheet}>
          <Txt variant="brand">{p.brand}</Txt>
          <Text style={s.name}>
            {p.name} {p.sizeLabel}
          </Text>

          <Block>
            <View style={s.priceRow}>
              <View>
                <Text style={s.big}>{brl(best.perUnit)}</Text>
                <Text style={s.bigSub}>
                  por {best.unitLabel} · {best.format.toLowerCase()}
                </Text>
              </View>
              {cheaper > 0 ? <Seal tone="down" label={`−${cheaper}% vs mediana`} /> : null}
            </View>
            {p.note ? (
              <View style={{ marginTop: space.s3 }}>
                <CheckLine state="yes">{p.note}</CheckLine>
              </View>
            ) : null}
          </Block>

          <Block>
            <Text style={s.blockTitle}>Por {best.unitLabel} em cada loja</Text>
            {p.offers.map((o, i) => (
              <View key={o.store} style={[s.offer, i === 0 && s.offerBest]}>
                <View style={{ flex: 1 }}>
                  <Text style={s.oname}>{o.store}</Text>
                  <Text style={s.ometa}>
                    {o.format} · {o.collectedAgo}
                    {o.seller === 'oficial' ? ' · loja oficial' : ''}
                  </Text>
                </View>
                <View style={s.oright}>
                  <Text style={s.op}>{brl(o.price)}</Text>
                  <Text style={s.ou}>
                    {brl(o.perUnit)}/{o.unitLabel}
                  </Text>
                </View>
              </View>
            ))}
            <Txt variant="meta" style={s.fine}>
              Preços sem frete. O tamanho travel quase sempre é o mais caro por unidade —
              mostramos assim mesmo.
            </Txt>
          </Block>

          {hold ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Vale esperar a ${hold.event}`}
              onPress={() => router.push({ pathname: '/segure/[id]', params: { id: p.id } })}
              style={({ pressed }) => [s.hold, pressed && { opacity: 0.9 }]}>
              <View style={{ flex: 1 }}>
                <Text style={s.holdTitle}>Vale esperar a {hold.event}</Text>
                <Text style={s.holdBody}>
                  Começa em {hold.daysAway} dias e caiu {hold.historicDropPct}% nas últimas
                  edições. Seu estoque atravessa.
                </Text>
              </View>
              <Icon name="chevron" size={19} color={c.maybe} strokeWidth={2} />
            </Pressable>
          ) : null}

          <Block tone="plum">
            <Text style={[s.blockTitle, { color: c.onPlum }]}>Últimos 90 dias</Text>
            <View style={s.pairs}>
              <Pair label="Mediana" value={brl(p.history.median)} />
              <Pair label="Mínimo" value={brl(p.history.min)} />
              <Pair label="Pico" value={brl(p.history.peak)} />
              <Pair label="Mudou" value={`${p.history.changes} vezes`} />
            </View>
          </Block>

          <Button label={`Ir para a ${best.store}`} />
          <Button
            label="Já comprei este"
            kind="ghost"
            onPress={() => router.push({ pathname: '/compra/[id]', params: { id: p.id } })}
          />
          <Txt variant="meta" style={s.fine}>
            {best.affiliate
              ? 'Link de afiliado. Não muda a ordem da lista.'
              : 'Preço sem frete.'}
          </Txt>
        </View>
      </ScrollView>
    </View>
  );
}

function Pair({ label, value }: { label: string; value: string }) {
  const s = useS();
  return (
    <View style={s.pair}>
      <Text style={s.pk}>{label}</Text>
      <Text style={s.pv}>{value}</Text>
    </View>
  );
}

const useS = makeStyles((c) => ({
  safe: { flex: 1, backgroundColor: c.paper },
  scroll: { paddingBottom: space.s8 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.s5 },

  hero: { height: 290, alignItems: 'center', justifyContent: 'center' },
  heroTop: {
    position: 'absolute',
    top: space.s3,
    left: space.s2,
    right: space.s2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  sheet: {
    backgroundColor: c.paper,
    borderTopLeftRadius: radius.r4,
    borderTopRightRadius: radius.r4,
    marginTop: -22,
    paddingHorizontal: space.s4,
    paddingTop: space.s5,
  },
  name: {
    fontFamily: font.dis,
    fontSize: size.t5,
    letterSpacing: -0.8,
    color: c.ink,
    marginTop: space.s1,
    marginBottom: space.s3,
    lineHeight: 26,
  },

  priceRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: space.s3 },
  big: {
    fontFamily: font.disExtra,
    fontSize: size.t8,
    letterSpacing: -1.8,
    color: c.down,
    fontVariant: ['tabular-nums'],
  },
  bigSub: { fontFamily: font.uiSemi, fontSize: size.t2, color: c.ink3, marginTop: space.s2 },

  blockTitle: {
    fontFamily: font.dis,
    fontSize: size.t3,
    letterSpacing: -0.3,
    color: c.ink,
    marginBottom: space.s3,
  },

  offer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    paddingVertical: space.s3,
    borderBottomWidth: 1,
    borderBottomColor: c.line,
    minHeight: 44,
  },
  offerBest: {
    backgroundColor: c.downBg,
    marginHorizontal: -space.s4,
    paddingHorizontal: space.s4,
    borderRadius: radius.r2,
    borderBottomWidth: 0,
  },
  oname: { fontFamily: font.uiBold, fontSize: size.t3, color: c.ink },
  ometa: { fontFamily: font.ui, fontSize: size.t1, color: c.ink3, marginTop: 2 },
  oright: { alignItems: 'flex-end' },
  op: {
    fontFamily: font.dis,
    fontSize: size.t3,
    color: c.ink,
    fontVariant: ['tabular-nums'],
  },
  ou: {
    fontFamily: font.uiSemi,
    fontSize: size.t1,
    color: c.ink3,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
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

  fine: { marginTop: space.s2, lineHeight: 18 },

  hold: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    backgroundColor: c.maybeBg,
    borderRadius: radius.r3,
    padding: space.s4,
    marginBottom: space.s3,
    minHeight: 44,
  },
  holdTitle: { fontFamily: font.dis, fontSize: size.t3, letterSpacing: -0.3, color: c.maybe },
  holdBody: {
    fontFamily: font.ui,
    fontSize: size.t1,
    lineHeight: 18,
    color: c.ink2,
    marginTop: space.s1,
  },
}));
