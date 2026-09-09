import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { Button, Txt } from '@/components/primitives';
import { ScreenHeader } from '@/components/ScreenHeader';
import { font, radius, size, space } from '@/design/tokens';
import { makeStyles, useTheme } from '@/design/theme';

/**
 * Visor de leitura. A câmera de verdade não faz parte do frontend —
 * aqui a tela demonstra o fluxo e, principalmente, o estado que importa:
 * o produto que o catálogo ainda não conhece.
 */
export default function Escanear() {
  const c = useTheme();
  const s = useS();
  const router = useRouter();
  const [phase, setPhase] = useState<'lendo' | 'nao-encontrado'>('lendo');

  useEffect(() => {
    const t = setTimeout(() => setPhase('nao-encontrado'), 2600);
    return () => clearTimeout(t);
  }, []);

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScreenHeader title="Escanear" tone="plum" backIcon="close" onBack={() => router.back()} />

      <View style={s.viewport}>
        <View style={s.frame}>
          <View style={[s.corner, s.tl]} />
          <View style={[s.corner, s.tr]} />
          <View style={[s.corner, s.bl]} />
          <View style={[s.corner, s.br]} />
          {phase === 'lendo' ? <View style={s.beam} /> : null}
        </View>
        <Text style={s.hint}>
          {phase === 'lendo'
            ? 'Aponte para o código de barras da embalagem'
            : 'Código lido: 7891234567890'}
        </Text>
      </View>

      {phase === 'nao-encontrado' ? (
        <View style={s.sheet}>
          <View style={s.notFoundIcon}>
            <Icon name="question" size={26} color={c.maybe} strokeWidth={1.8} />
          </View>
          <Text style={s.nfTitle}>Esse ainda não está no catálogo</Text>
          <Txt variant="body" style={{ marginTop: space.s2 }}>
            Acontece com produto novo ou de marca pequena. Preencha marca, nome e tamanho que
            a gente cadastra e começa a vigiar o preço — leva algumas horas.
          </Txt>
          <Button label="Cadastrar este produto" onPress={() => router.back()} />
          <Button label="Tentar outro código" kind="ghost" onPress={() => setPhase('lendo')} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const useS = makeStyles((c) => ({
  safe: { flex: 1, backgroundColor: c.plum },

  viewport: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.s5 },
  frame: {
    width: 250,
    height: 170,
    borderRadius: radius.r3,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  corner: { position: 'absolute', width: 34, height: 34, borderColor: c.lilac2 },
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: radius.r3 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: radius.r3 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: radius.r3 },
  br: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: radius.r3,
  },
  beam: {
    position: 'absolute',
    left: space.s5,
    right: space.s5,
    top: '50%',
    height: 2,
    backgroundColor: c.lilac1,
    opacity: 0.85,
  },
  hint: {
    fontFamily: font.uiSemi,
    fontSize: size.t2,
    color: c.onPlum2,
    textAlign: 'center',
    paddingHorizontal: space.s5,
  },

  sheet: {
    backgroundColor: c.paper,
    borderTopLeftRadius: radius.r4,
    borderTopRightRadius: radius.r4,
    padding: space.s5,
  },
  notFoundIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.r2,
    backgroundColor: c.maybeBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.s3,
  },
  nfTitle: { fontFamily: font.dis, fontSize: size.t4, letterSpacing: -0.5, color: c.ink },
}));
