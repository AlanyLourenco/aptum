import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Seal, Txt } from '@/components/primitives';
import { Vessel, VesselName } from '@/components/Vessel';
import { brl, Product } from '@/data/catalog';
import { useAptum } from '@/store/useAptum';
import { font, radius, size, space, TAP } from '@/design/tokens';
import { makeStyles, useTheme } from '@/design/theme';

/**
 * Cartão de produto da grade.
 * Uma ênfase só — o preço, a 26px contra 13px do nome.
 * Loja e horário de coleta vivem na ficha, não aqui.
 *
 * Não use `<Link asChild>` aqui. O Slot do expo-router funde o `style`
 * com spread de objeto, e espalhar a função `({pressed}) => …` do
 * Pressable devolve `{}` — no nativo o cartão perde o estilo inteiro.
 *
 * `compact` é a versão de trilho lateral: largura fixa e preço um degrau
 * menor, para caber vários na horizontal.
 */
export function ProductCard({ product, compact }: { product: Product; compact?: boolean }) {
  const c = useTheme();
  const s = useS();
  const p = product;
  const router = useRouter();
  const isFav = useAptum((st) => st.favourites.includes(p.id));
  const toggleFavourite = useAptum((st) => st.toggleFavourite);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${p.brand} ${p.name}, ${brl(p.price)}`}
      onPress={() => router.push({ pathname: '/produto/[id]', params: { id: p.id } })}
      style={({ pressed }) => [s.card, compact && s.cardCompact, pressed && s.pressed]}>
      <View style={[s.shot, compact && s.shotCompact]}>
        {p.discountPct ? (
          <View style={s.off}>
            <Text style={s.offTxt}>−{p.discountPct}%</Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: isFav }}
          accessibilityLabel={
            isFav ? `Remover ${p.name} dos favoritos` : `Favoritar ${p.name}`
          }
          onPress={(e) => {
            e.stopPropagation?.();
            toggleFavourite(p.id);
          }}
          style={s.fav}
          hitSlop={4}>
          <View style={s.favDot}>
            <Icon
              name={isFav ? 'heartFilled' : 'heart'}
              size={17}
              color={isFav ? c.up : c.ink3}
            />
          </View>
        </Pressable>

        <Vessel name={p.vessel} size={compact ? 64 : 92} />
      </View>

      <View style={s.body}>
        <Txt variant="brand">{p.brand}</Txt>
        <Txt variant="bodyStrong" numberOfLines={2} style={s.name}>
          {p.name} · {p.sizeLabel}
        </Txt>

        {p.variant ? (
          <View style={s.tone}>
            <View style={[s.swatch, { backgroundColor: p.variant.swatch }]} />
            <Text style={s.toneTxt}>
              {p.variant.code} {p.variant.name}
            </Text>
          </View>
        ) : null}

        {p.wasPrice && !compact ? <Text style={s.was}>{brl(p.wasPrice)}</Text> : null}
        <Text
          style={[
            s.price,
            compact && s.priceCompact,
            p.discountPct ? { color: c.down } : null,
          ]}>
          {brl(p.price)}
        </Text>
        <Text style={s.unit}>
          {brl(p.perUnit)} / {p.unitLabel}
        </Text>

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
        ) : p.targetPrice ? (
          <Seal
            tone="down"
            label={`Alvo ${brl(p.targetPrice)}`}
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

/**
 * Peça larga em ameixa, ocupando a largura toda.
 *
 * Serve para a campanha e para o convite de monitorar. Com `onPress` ela
 * vira alvo de toque e ganha o galão; sem, é só um anúncio.
 */
export function PromoTile({
  title,
  body,
  vessel = 'dropper',
  caps = true,
  onPress,
}: {
  title: string;
  body: string;
  vessel?: VesselName;
  /** caixa alta serve para nome de campanha; frase explicativa não grita */
  caps?: boolean;
  onPress?: () => void;
}) {
  const s = useS();
  const c = useTheme();

  const conteudo = (
    <>
      <View style={{ flex: 1 }}>
        <Text style={[s.promoTitle, !caps && s.promoTitleFrase]}>{title}</Text>
        <Text style={s.promoBody}>{body}</Text>
      </View>
      <View style={s.promoArt}>
        <Vessel name={vessel} size={34} color={c.plum} strokeWidth={3} />
      </View>
      {onPress ? (
        <Icon name="chevron" size={20} color={c.onPlum2} strokeWidth={2} />
      ) : null}
    </>
  );

  if (!onPress) return <View style={s.promo}>{conteudo}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${body}`}
      onPress={onPress}
      style={({ pressed }) => [s.promo, pressed && s.pressed]}>
      {conteudo}
    </Pressable>
  );
}

const useS = makeStyles((c) => ({
  card: {
    flex: 1,
    minWidth: 0,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: radius.r3,
    overflow: 'hidden',
  },
  /**
   * No trilho lateral a largura é fixa. Não use `flex: 0` aqui: no
   * react-native-web ele vira `flex: 0 0 0%`, e o `flex-basis: 0` anula o
   * `width` — o cartão colapsa para nada.
   */
  cardCompact: { flexGrow: 0, flexShrink: 0, flexBasis: 'auto', width: 150 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },

  /** no trilho a foto é mais baixa que quadrada: o cartão inteiro encolhe */
  shotCompact: { aspectRatio: 1.2 },
  shot: {
    aspectRatio: 1,
    backgroundColor: c.shotBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  off: {
    position: 'absolute',
    top: space.s2,
    left: space.s2,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.down,
    paddingVertical: 2,
    paddingHorizontal: space.s2,
    borderRadius: radius.r1,
  },
  offTxt: {
    fontFamily: font.uiExtra,
    fontSize: size.t0,
    color: c.down,
    fontVariant: ['tabular-nums'],
  },
  fav: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: TAP,
    height: TAP,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  body: { padding: space.s3, gap: space.s1, flex: 1 },
  name: { fontSize: size.t2, lineHeight: 17 },
  tone: { flexDirection: 'row', alignItems: 'center', gap: space.s1, marginTop: 2 },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  toneTxt: { fontFamily: font.uiSemi, fontSize: size.t1, color: c.ink2 },

  was: {
    fontFamily: font.ui,
    fontSize: size.t1,
    color: c.ink3,
    textDecorationLine: 'line-through',
    fontVariant: ['tabular-nums'],
    marginTop: space.s1,
  },
  price: {
    fontFamily: font.disExtra,
    fontSize: size.t6,
    letterSpacing: -1,
    color: c.ink,
    fontVariant: ['tabular-nums'],
    lineHeight: 28,
  },
  priceCompact: { fontSize: size.t5, letterSpacing: -0.8, lineHeight: 25 },
  unit: {
    fontFamily: font.uiSemi,
    fontSize: size.t1,
    color: c.ink3,
    fontVariant: ['tabular-nums'],
  },
  seal: { marginTop: space.s2 },

  promo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    backgroundColor: c.plum,
    borderRadius: radius.r3,
    padding: space.s4,
    minHeight: 92,
  },
  promoTitle: {
    fontFamily: font.disExtra,
    fontSize: size.t5,
    letterSpacing: -0.8,
    color: c.onPlum,
    textTransform: 'uppercase',
    marginBottom: space.s1,
  },
  promoTitleFrase: { textTransform: 'none', letterSpacing: -0.5, fontSize: size.t4 },
  promoBody: { fontFamily: font.ui, fontSize: size.t1, color: c.onPlum2, lineHeight: 17 },
  promoArt: {
    width: 56,
    height: 64,
    borderRadius: radius.r2,
    backgroundColor: c.lilac2,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
