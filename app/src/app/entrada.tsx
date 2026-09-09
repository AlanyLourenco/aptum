import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AptumGlyph } from '@/components/AptumMark';
import { Button, Txt } from '@/components/primitives';
import { font, radius, size, space, TAP } from '@/design/tokens';
import { makeStyles } from '@/design/theme';

/**
 * A premissa, nas palavras dela.
 *
 * O passo 3 nomeia a frustração antes de prometer a solução: é ela que
 * faz a pessoa entender para que serve o app em duas linhas. Sem isso o
 * discurso vira "monitoramos preço", que qualquer um diz.
 */
const STEPS = [
  {
    lead: 'Você monta',
    rest: 'suas listas.',
    body: 'Shampoo, sérum, base, perfume — no tamanho e no tom que você usa de verdade.',
  },
  {
    lead: 'A gente fica',
    rest: 'de olho no preço.',
    body: 'Todo dia, em quatro lojas. Se baixar ou entrar em promoção, você fica sabendo.',
  },
  {
    lead: 'E testa o cupom',
    rest: 'antes de te avisar.',
    body: 'Sabe quando a loja solta vinte cupons e, na hora de usar, nenhum serve para o seu produto? A gente confere antes — e diz em quais dos seus itens ele pega.',
  },
  {
    lead: 'Achou um cupom',
    rest: 'por aí?',
    body: 'Viu num story, num grupo, com uma blogueira. Cola aqui que a gente testa contra as suas listas e diz se vale para alguma coisa.',
  },
];

export default function Entrada() {
  const s = useS();
  const router = useRouter();
  const [step, setStep] = useState(-1); // -1 = abertura

  const enter = () => router.replace('/');

  if (step === -1) {
    return (
      <LinearGradient
        colors={['#5E4370', '#31203E', '#150B1C']}
        start={{ x: 0.24, y: 0 }}
        style={s.fill}>
        <SafeAreaView style={s.open} edges={['top', 'bottom']}>
          <View style={s.brand}>
            <AptumGlyph size={96} />
            <Text style={s.wordmark}>Aptum</Text>
            <Text style={s.tagline}>o preço certo, na hora certa</Text>
            <Text style={s.premissa}>
              Suas listas de beleza, vigiadas todo dia. E o cupom testado no seu produto
              antes de você chegar no caixa.
            </Text>
          </View>

          <View style={s.actions}>
            <Button label="Continuar com Google" onPress={() => setStep(0)} style={s.light} />
            <Button label="Continuar com Apple" kind="ghost" onPress={() => setStep(0)} style={s.outline} />
            <Button label="Usar e-mail" kind="quiet" onPress={() => setStep(0)} style={s.quiet} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Explorar sem criar conta"
              onPress={enter}
              style={({ pressed }) => [s.skip, pressed && { opacity: 0.7 }]}>
              <Text style={s.skipTxt}>Explorar sem conta</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (step < STEPS.length) {
    const st = STEPS[step];
    return (
      <LinearGradient
        colors={['#5E4370', '#31203E', '#150B1C']}
        start={{ x: 0.24, y: 0 }}
        style={s.fill}>
        <SafeAreaView style={s.open} edges={['top', 'bottom']}>
          <View style={s.steps}>
            {STEPS.map((_, i) => (
              <View key={i} style={[s.tick, i === step && s.tickOn]} />
            ))}
          </View>

          <View style={s.pitch}>
            <Text style={s.pitchTxt}>
              <Text style={s.pitchLead}>{st.lead} </Text>
              {st.rest}
            </Text>
            <Text style={s.pitchBody}>{st.body}</Text>
          </View>

          <View style={s.actions}>
            <Button
              label={step === STEPS.length - 1 ? 'Escolher meu primeiro produto' : 'Continuar'}
              onPress={() => setStep((v) => v + 1)}
              style={s.light}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Pular apresentação"
              onPress={() => setStep(STEPS.length)}
              style={({ pressed }) => [s.skip, pressed && { opacity: 0.7 }]}>
              <Text style={s.skipTxt}>Pular</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // pedido de permissão, explicado antes do diálogo do sistema
  return (
    <SafeAreaView style={s.permSafe} edges={['top', 'bottom']}>
      <View style={s.permBody}>
        <View style={s.permIcon}>
          <AptumGlyph size={54} />
        </View>
        <Text style={s.permTitle}>Podemos te avisar?</Text>
        <Txt variant="body" style={s.permTxt}>
          O aviso é o app inteiro: sem ele, você só descobre a promoção se abrir na hora certa.
        </Txt>

        <View style={s.rules}>
          <Rule text="No máximo 3 avisos por dia" />
          <Rule text="Silêncio das 22h às 8h" />
          <Rule text="Só quando o cupom é confirmado, nunca no talvez" />
          <Rule text="Dá para ocultar o nome do produto na tela bloqueada" />
        </View>
      </View>

      <View style={{ padding: space.s4 }}>
        <Button label="Permitir avisos" onPress={enter} />
        <Button label="Agora não" kind="quiet" onPress={enter} />
      </View>
    </SafeAreaView>
  );
}

function Rule({ text }: { text: string }) {
  const s = useS();
  return (
    <View style={s.rule}>
      <View style={s.bullet} />
      <Text style={s.ruleTxt}>{text}</Text>
    </View>
  );
}

const useS = makeStyles((c) => ({
  fill: { flex: 1 },
  open: { flex: 1, justifyContent: 'space-between', padding: space.s5 },

  brand: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.s3 },
  wordmark: {
    fontFamily: font.mark,
    fontSize: size.t6,
    letterSpacing: 9,
    textTransform: 'uppercase',
    color: c.onPlum,
    marginTop: space.s2,
  },
  tagline: { fontFamily: font.ui, fontSize: size.t2, color: c.onPlum3 },
  /** a promessa inteira já na abertura, antes de qualquer passo */
  premissa: {
    fontFamily: font.ui,
    fontSize: size.t3,
    lineHeight: 21,
    color: c.onPlum2,
    textAlign: 'center',
    paddingHorizontal: space.s5,
    marginTop: space.s4,
  },

  actions: { gap: space.s1 },
  light: { backgroundColor: c.lilac1 },
  outline: { borderColor: 'rgba(237,231,242,0.32)' },
  quiet: {},
  skip: { minHeight: TAP, alignItems: 'center', justifyContent: 'center' },
  skipTxt: { fontFamily: font.uiSemi, fontSize: size.t2, color: c.onPlum3 },

  steps: { flexDirection: 'row', gap: space.s2, paddingTop: space.s3 },
  tick: { height: 3, flex: 1, borderRadius: 2, backgroundColor: 'rgba(237,231,242,0.22)' },
  tickOn: { backgroundColor: c.lilac1 },

  pitch: { flex: 1, justifyContent: 'center' },
  pitchTxt: {
    fontFamily: font.disExtra,
    fontSize: size.t7,
    letterSpacing: -1.6,
    color: c.onPlum,
    lineHeight: 38,
  },
  pitchLead: { color: c.lilac2 },
  pitchBody: {
    fontFamily: font.ui,
    fontSize: size.t3,
    color: c.onPlum2,
    lineHeight: 22,
    marginTop: space.s4,
    maxWidth: 320,
  },

  permSafe: { flex: 1, backgroundColor: c.paper, justifyContent: 'space-between' },
  permBody: { flex: 1, justifyContent: 'center', padding: space.s5 },
  permIcon: {
    width: 76,
    height: 76,
    borderRadius: radius.r3,
    backgroundColor: c.plum,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.s4,
  },
  permTitle: {
    fontFamily: font.disExtra,
    fontSize: size.t6,
    letterSpacing: -1,
    color: c.ink,
  },
  permTxt: { marginTop: space.s2, fontSize: size.t3, lineHeight: 22 },

  rules: { marginTop: space.s5, gap: space.s3 },
  rule: { flexDirection: 'row', alignItems: 'center', gap: space.s3 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.lilac3 },
  ruleTxt: { flex: 1, fontFamily: font.uiSemi, fontSize: size.t2, color: c.ink2 },
}));
