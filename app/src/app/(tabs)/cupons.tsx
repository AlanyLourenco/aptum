import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, IconButton, Seal, Txt } from '@/components/primitives';
import { PasteCoupon } from '@/components/PasteCoupon';
import { ProductRail } from '@/components/ProductRail';
import { ProductRow } from '@/components/ProductRow';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Coupon, coupons, products } from '@/data/catalog';
import { font, radius, size, space } from '@/design/tokens';
import { makeStyles, useTheme } from '@/design/theme';

const stateLabel = { yes: 'Vale', maybe: 'Talvez', no: 'Não vale' } as const;

/**
 * Um cupom e os produtos que ele cobre.
 *
 * O cartão precisa fechar em volta do conteúdo: sem isso o texto encosta na
 * borda da tela e nada diz onde um cupom acaba e o outro começa. Os produtos
 * cobertos vão num trilho lateral porque a quantidade é imprevisível — na
 * vertical, um cupom com quatro produtos empurra o próximo para fora da tela.
 */
function CouponShelf({ coupon }: { coupon: Coupon }) {
  const c = useTheme();
  const s = useS();
  const router = useRouter();
  const covered = products.filter((p) => coupon.covers.includes(p.id));
  const plum = coupon.state === 'yes';
  const dead = coupon.state === 'no';

  return (
    <View style={[s.shelf, !plum && s.shelfQuiet, dead && s.shelfDead]}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Cupom ${coupon.code} da ${coupon.store}. ${stateLabel[coupon.state]}.`}
        onPress={() =>
          router.push({ pathname: '/cupom/[code]', params: { code: coupon.code } })
        }
        style={({ pressed }) => [s.shelfBody, pressed && { opacity: 0.9 }]}>
        <View style={s.shelfTop}>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                s.code,
                !plum && { color: coupon.state === 'maybe' ? c.maybe : c.none },
              ]}>
              {coupon.code}
            </Text>
            <Text style={[s.meta, !plum && { color: c.ink3 }]}>
              {coupon.store} · {coupon.headline} · {coupon.expires}
            </Text>
          </View>
          <Seal tone={coupon.state} label={stateLabel[coupon.state]} />
        </View>

        {coupon.reason ? (
          <Text style={[s.reason, !plum && { color: c.ink3 }]}>{coupon.reason}</Text>
        ) : null}
      </Pressable>

      {covered.length > 0 ? (
        <View style={[s.covered, plum && s.coveredOnPlum]}>
          <Text style={[s.coveredHead, plum && { color: c.onPlum2 }]}>
            {covered.length} {covered.length === 1 ? 'produto seu' : 'produtos seus'}
          </Text>
          {covered.length === 1 ? (
            <View style={s.single}>
              <ProductRow product={covered[0]} />
            </View>
          ) : (
            <ProductRail products={covered} inset />
          )}
        </View>
      ) : null}
    </View>
  );
}

export default function Cupons() {
  const s = useS();
  /**
   * Cupom que não serve é a última coisa que interessa: ele vai para o fim,
   * depois do atalho de colar código, que resolve algo.
   */
  const useful = coupons.filter((c) => c.state !== 'no');
  const dead = coupons.filter((c) => c.state === 'no');
  const [pasting, setPasting] = useState(false);

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <ScreenHeader
        title="Cupons"
        right={
          <IconButton name="plus" label="Colar um cupom" onPress={() => setPasting(true)} />
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {useful.map((c) => (
          <CouponShelf key={c.code} coupon={c} />
        ))}

        <View style={s.paste}>
          <Txt variant="body" style={s.pasteTxt}>
            Viu um cupom num story, num grupo ou com uma blogueira? Cole aqui que a gente
            testa contra as suas listas e diz se vale para alguma coisa.
          </Txt>
          <Button
            label="Colar um código"
            kind="ghost"
            onPress={() => setPasting(true)}
            style={{ marginTop: space.s3 }}
          />
        </View>

        {dead.length > 0 ? (
          <>
            <View style={s.deadHead}>
              <Text style={s.deadTitle}>Não servem para os seus produtos</Text>
              <Text style={s.deadCount}>{dead.length}</Text>
            </View>
            {dead.map((c) => (
              <CouponShelf key={c.code} coupon={c} />
            ))}
          </>
        ) : null}
      </ScrollView>

      <PasteCoupon open={pasting} onClose={() => setPasting(false)} />
    </SafeAreaView>
  );
}

const useS = makeStyles((c) => ({
  safe: { flex: 1, backgroundColor: c.paper },
  scroll: { paddingBottom: space.s7 },

  shelf: {
    backgroundColor: c.plum,
    borderRadius: radius.r3,
    marginHorizontal: space.s4,
    marginTop: space.s3,
    overflow: 'hidden',
  },
  shelfQuiet: { backgroundColor: c.card, borderWidth: 1, borderColor: c.line },
  shelfDead: { backgroundColor: c.wash, borderWidth: 1, borderColor: c.line },
  shelfBody: { padding: space.s4 },
  shelfTop: { flexDirection: 'row', alignItems: 'center', gap: space.s3 },
  code: {
    fontFamily: font.disExtra,
    fontSize: size.t4,
    letterSpacing: 1.4,
    color: c.onPlum,
  },
  meta: { fontFamily: font.ui, fontSize: size.t1, color: c.onPlum2, marginTop: space.s1 },
  reason: {
    fontFamily: font.ui,
    fontSize: size.t1,
    lineHeight: 18,
    color: c.onPlum2,
    marginTop: space.s3,
  },

  /** os produtos ficam numa faixa própria, para não se confundirem com o cupom */
  covered: {
    borderTopWidth: 1,
    borderTopColor: c.line,
    paddingTop: space.s3,
    paddingBottom: space.s3,
  },
  /** a linha única respeita a mesma calha de 16 do trilho */
  single: { paddingHorizontal: space.s4, paddingTop: space.s2 },
  coveredOnPlum: { borderTopColor: c.plum3, backgroundColor: 'rgba(237,231,242,0.06)' },
  coveredHead: {
    fontFamily: font.uiBold,
    fontSize: size.t0,
    color: c.ink3,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: space.s4,
  },

  paste: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: c.line2,
    borderRadius: radius.r3,
    padding: space.s5,
    margin: space.s4,
    marginTop: space.s5,
    alignItems: 'center',
  },
  pasteTxt: { textAlign: 'center' },

  deadHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: space.s4,
    paddingTop: space.s5,
    borderTopWidth: 1,
    borderTopColor: c.line,
    marginTop: space.s3,
  },
  deadTitle: { fontFamily: font.dis, fontSize: size.t3, letterSpacing: -0.3, color: c.ink3 },
  deadCount: {
    fontFamily: font.uiBold,
    fontSize: size.t2,
    color: c.ink3,
    fontVariant: ['tabular-nums'],
  },
}));
