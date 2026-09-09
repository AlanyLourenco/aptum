import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Seal, Txt } from '@/components/primitives';
import { Vessel } from '@/components/Vessel';
import { brl, Product } from '@/data/catalog';
import { font, radius, size, space } from '@/design/tokens';
import { makeStyles } from '@/design/theme';

/**
 * Produto em linha, ocupando a largura toda.
 *
 * É o formato para quando há um só: um cartão de trilho sozinho deixa dois
 * terços da faixa vazios e parece defeito. Em linha, um item preenche.
 *
 * Continua sendo um cartão branco mesmo dentro do cupom em ameixa: é o que
 * mantém o texto legível e casa com os cartões do trilho.
 */
export function ProductRow({ product }: { product: Product }) {
  const s = useS();
  const p = product;
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${p.brand} ${p.name}, ${brl(p.price)}`}
      onPress={() => router.push({ pathname: '/produto/[id]', params: { id: p.id } })}
      style={({ pressed }) => [s.row, pressed && s.pressed]}>
      <View style={s.shot}>
        <Vessel name={p.vessel} size={48} />
        {p.discountPct ? (
          <View style={s.off}>
            <Text style={s.offTxt}>−{p.discountPct}%</Text>
          </View>
        ) : null}
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Txt variant="brand">{p.brand}</Txt>
        <Txt variant="bodyStrong" numberOfLines={2}>
          {p.name} · {p.sizeLabel}
        </Txt>

        <View style={s.price}>
          <Text style={s.now}>{brl(p.price)}</Text>
          <Text style={s.unit}>
            {brl(p.perUnit)} / {p.unitLabel}
          </Text>
        </View>

        {p.coupon ? (
          <Seal
            tone={p.coupon.state}
            label={
              p.coupon.state === 'yes'
                ? 'Cupom vale'
                : p.coupon.state === 'maybe'
                  ? 'Cupom talvez'
                  : 'Cupom não vale'
            }
            style={s.seal}
          />
        ) : p.runsOutInDays ? (
          <Seal
            tone="maybe"
            icon="clock"
            label={`Acaba em ${p.runsOutInDays} dias`}
            style={s.seal}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const useS = makeStyles((c) => ({
  row: {
    flexDirection: 'row',
    gap: space.s3,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: radius.r3,
    padding: space.s3,
  },
  pressed: { opacity: 0.9 },

  shot: {
    width: 76,
    height: 88,
    borderRadius: radius.r2,
    backgroundColor: c.shotBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  off: {
    position: 'absolute',
    top: space.s1,
    left: space.s1,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.down,
    paddingHorizontal: space.s1,
    borderRadius: radius.r1,
  },
  offTxt: {
    fontFamily: font.uiExtra,
    fontSize: size.t0,
    color: c.down,
    fontVariant: ['tabular-nums'],
  },

  price: { flexDirection: 'row', alignItems: 'baseline', gap: space.s2, marginTop: space.s1 },
  now: {
    fontFamily: font.disExtra,
    fontSize: size.t5,
    letterSpacing: -0.8,
    color: c.ink,
    fontVariant: ['tabular-nums'],
  },
  unit: {
    fontFamily: font.uiSemi,
    fontSize: size.t1,
    color: c.ink3,
    fontVariant: ['tabular-nums'],
  },
  seal: { marginTop: space.s2 },
}));
