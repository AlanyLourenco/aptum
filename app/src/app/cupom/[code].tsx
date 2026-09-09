import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Block, Button, CheckLine, IconButton, Seal, Txt } from '@/components/primitives';
import { brl, couponByCode } from '@/data/catalog';
import { selectCouponState, useAptum } from '@/store/useAptum';
import { font, radius, size, space } from '@/design/tokens';
import { makeStyles, useTheme } from '@/design/theme';

const headline = {
  yes: 'Vale no seu produto',
  maybe: 'Talvez — não confirmamos',
  no: 'Não vale',
} as const;

export default function Cupom() {
  const s = useS();
  const c = useTheme();
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const declared = couponByCode(code);
  const verdict = useAptum((st) => st.couponVerdicts[code ?? '']);
  const setVerdict = useAptum((st) => st.setCouponVerdict);
  const effective = useAptum((st) =>
    declared ? selectCouponState(st, declared.code, declared.state) : 'no',
  );
  const cupom = declared ? { ...declared, state: effective } : undefined;

  if (!cupom) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.missing}>
          <Txt variant="bodyStrong">Cupom não encontrado.</Txt>
          <Button label="Voltar" kind="ghost" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const tint = cupom.state === 'yes' ? c.yes : cupom.state === 'maybe' ? c.maybe : c.none;

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
            <Text style={s.code}>{cupom.code}</Text>
          </View>
          <Text style={s.headMeta}>
            {cupom.store} · {cupom.headline} · {cupom.expires}
          </Text>
        </SafeAreaView>

        <View style={s.sheet}>
          <Block style={cupom.state === 'yes' ? s.blockYes : undefined}>
            <Seal tone={cupom.state} label={headline[cupom.state]} style={s.bigSeal} />
            {cupom.finalPrice ? (
              <View style={{ marginTop: space.s4 }}>
                <Text style={[s.big, { color: tint }]}>{brl(cupom.finalPrice)}</Text>
                {cupom.wasPrice ? (
                  <Text style={s.bigSub}>
                    de {brl(cupom.wasPrice)} · você economiza {brl(cupom.wasPrice - cupom.finalPrice)}
                  </Text>
                ) : null}
              </View>
            ) : null}

            {cupom.state === 'yes' ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Copiar o código ${cupom.code}`}
                style={({ pressed }) => [s.codebox, pressed && { opacity: 0.85 }]}>
                <Text style={s.codeboxVal}>{cupom.code}</Text>
                <Text style={s.codeboxAct}>Copiar</Text>
              </Pressable>
            ) : null}
          </Block>

          <Block>
            <Text style={s.blockTitle}>
              {cupom.state === 'yes'
                ? `As ${cupom.conditions.length} condições`
                : 'O que verificamos'}
            </Text>
            <View style={{ gap: space.s3 }}>
              {cupom.conditions.map((cond) => (
                <CheckLine key={cond.text} state={cond.state}>
                  {cond.text}
                </CheckLine>
              ))}
            </View>
            <Txt variant="meta" style={s.fine}>
              {cupom.state === 'yes'
                ? 'Só chamamos de “vale” quando todas fecham. Sobrou dúvida, vira “talvez” e não te notificamos.'
                : cupom.reason}
            </Txt>
          </Block>

          {cupom.alternative ? (
            <Block tone="tint">
              <Text style={s.blockTitle}>Mas este serve</Text>
              <View style={s.altRow}>
                <View>
                  <Text style={s.altCode}>{cupom.alternative}</Text>
                  <Text style={s.altMeta}>testado contra os seus produtos</Text>
                </View>
                <Seal tone="yes" label="Vale" />
              </View>
            </Block>
          ) : null}

          <Block>
            <Text style={s.blockTitle}>Você já usou este cupom?</Text>
            <Txt variant="body" style={{ marginBottom: space.s3 }}>
              O que você responde aqui corrige a classificação para você e para as outras.
            </Txt>
            <View style={s.verdictRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: verdict === 'funcionou' }}
                onPress={() => setVerdict(cupom.code, 'funcionou')}
                style={({ pressed }) => [
                  s.verdict,
                  verdict === 'funcionou' && s.verdictYes,
                  pressed && { opacity: 0.85 },
                ]}>
                <Text style={[s.verdictTxt, verdict === 'funcionou' && { color: c.yes }]}>
                  Funcionou
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: verdict === 'nao-funcionou' }}
                onPress={() => setVerdict(cupom.code, 'nao-funcionou')}
                style={({ pressed }) => [
                  s.verdict,
                  verdict === 'nao-funcionou' && s.verdictNo,
                  pressed && { opacity: 0.85 },
                ]}>
                <Text style={[s.verdictTxt, verdict === 'nao-funcionou' && { color: c.up }]}>
                  Não funcionou
                </Text>
              </Pressable>
            </View>
            {verdict === 'nao-funcionou' && declared?.state === 'yes' ? (
              <Txt variant="meta" style={{ marginTop: space.s3 }}>
                Rebaixamos para “talvez” e paramos de te notificar sobre ele.
              </Txt>
            ) : null}
          </Block>

          {cupom.state === 'yes' ? (
            <>
              <Button label="Ir para a loja com o cupom" />
              <Txt variant="meta" style={s.fineCenter}>
                Preço sem frete · link de afiliado
              </Txt>
            </>
          ) : cupom.state === 'maybe' ? (
            <>
              <Button label="Tentar mesmo assim" kind="ghost" />
              <Button label="Me avise se alguém confirmar" kind="quiet" />
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const useS = makeStyles((c) => ({
  safe: { flex: 1, backgroundColor: c.plum },
  scroll: { paddingBottom: space.s8 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.s5 },

  head: { backgroundColor: c.plum, paddingTop: space.s3, paddingBottom: space.s6 },
  headBar: { flexDirection: 'row', alignItems: 'center', gap: space.s2, paddingHorizontal: space.s2 },
  code: {
    fontFamily: font.disExtra,
    fontSize: size.t5,
    letterSpacing: 1.8,
    color: c.onPlum,
  },
  headMeta: {
    fontFamily: font.ui,
    fontSize: size.t2,
    color: c.onPlum2,
    paddingHorizontal: space.s4,
    marginTop: space.s1,
  },

  sheet: {
    backgroundColor: c.paper,
    borderTopLeftRadius: radius.r4,
    borderTopRightRadius: radius.r4,
    marginTop: -20,
    padding: space.s4,
    minHeight: 560,
  },
  blockYes: { borderWidth: 1.5, borderColor: '#A9D2BE' },
  bigSeal: { paddingVertical: space.s2, paddingHorizontal: space.s3 },
  big: {
    fontFamily: font.disExtra,
    fontSize: size.t8,
    letterSpacing: -1.8,
    fontVariant: ['tabular-nums'],
  },
  bigSub: { fontFamily: font.uiSemi, fontSize: size.t2, color: c.ink3, marginTop: space.s2 },

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
  codeboxVal: {
    fontFamily: font.disExtra,
    fontSize: size.t4,
    letterSpacing: 1.6,
    color: c.plum2,
  },
  codeboxAct: {
    fontFamily: font.uiExtra,
    fontSize: size.t1,
    color: c.lilac3,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },

  blockTitle: {
    fontFamily: font.dis,
    fontSize: size.t3,
    letterSpacing: -0.3,
    color: c.ink,
    marginBottom: space.s3,
  },
  fine: { marginTop: space.s3, lineHeight: 18 },
  fineCenter: { marginTop: space.s2, textAlign: 'center' },

  altRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.s3 },
  altCode: { fontFamily: font.disExtra, fontSize: size.t4, letterSpacing: 1.4, color: c.ink },
  altMeta: { fontFamily: font.ui, fontSize: size.t1, color: c.ink3, marginTop: 2 },

  verdictRow: { flexDirection: 'row', gap: space.s2 },
  verdict: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: c.line2,
    borderRadius: radius.pill,
  },
  verdictYes: { borderColor: c.yes, backgroundColor: c.yesBg },
  verdictNo: { borderColor: c.up, backgroundColor: c.upBg },
  verdictTxt: { fontFamily: font.uiBold, fontSize: size.t2, color: c.ink2 },
}));
