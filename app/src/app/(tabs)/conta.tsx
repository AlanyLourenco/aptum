import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { Block, Button, CheckLine, IconButton, Txt } from '@/components/primitives';
import { font, radius, size, space } from '@/design/tokens';
import { minutosParaHora } from '@/lib/mascaras';
import { SENSIBILIDADES, useAptum } from '@/store/useAptum';
import { makeStyles, useTheme } from '@/design/theme';

function Row({ label, hint, value }: { label: string; hint?: string; value?: string }) {
  const s = useS();
  return (
    <View style={s.row}>
      <View style={{ flex: 1 }}>
        <Text style={s.rowLabel}>{label}</Text>
        {hint ? <Text style={s.rowHint}>{hint}</Text> : null}
      </View>
      {value ? <Text style={s.rowValue}>{value}</Text> : null}
    </View>
  );
}

export default function Conta() {
  const c = useTheme();
  const s = useS();
  const router = useRouter();
  const avisos = useAptum((st) => st.avisos);
  const sensibilidade = SENSIBILIDADES.find((x) => x.key === avisos.sensibilidade)!;

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <LinearGradient
          colors={c.gradients.plum}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={s.head}>
          <ScreenHeader
            title="Conta"
            tone="clear"
            right={
              <IconButton
                name="sliders"
                label="Configurações"
                tint={c.onPlum}
                onPress={() => router.push('/config')}
              />
            }
          />
          <View style={s.who}>
            <View style={s.avatar} />
            <View>
              <Text style={s.name}>Alany</Text>
              <Text style={s.plan}>Plano gratuito · 16 de 15 itens</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={s.sheet}>
          <Block>
            <View style={s.blockHead}>
              <Text style={s.blockTitle}>Economia em 6 meses</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ver histórico de compras"
                onPress={() => router.push('/historico')}
                hitSlop={8}>
                <Text style={s.link}>Histórico</Text>
              </Pressable>
            </View>
            <Text style={s.big}>R$ 412,60</Text>
            <Text style={s.bigSub}>preço pago contra a mediana histórica</Text>
            <View style={{ marginTop: space.s3 }}>
              <CheckLine state="no">
                Uma compra saiu R$ 14 acima da mediana. Base, 03/07.
              </CheckLine>
            </View>
          </Block>

          <Block>
            <Text style={s.blockTitle}>Notificações</Text>
            <Txt variant="body" style={{ marginBottom: space.s2 }}>
              Já vem configurado. Você só mexe se quiser.
            </Txt>
            <Row label="Teto por dia" value={String(avisos.tetoPorDia)} />
            <Row
              label="Silêncio"
              value={
                avisos.silencioAtivo
                  ? `${minutosParaHora(avisos.silencioDe)} – ${minutosParaHora(avisos.silencioAte)}`
                  : 'Desligado'
              }
            />
            <Row
              label="Ocultar nome do produto"
              hint="O tratamento não aparece na tela bloqueada"
              value={avisos.ocultarNome ? 'Sim' : 'Não'}
            />
            <Row label="Sensibilidade" value={sensibilidade.label} />
            <Button
              label="Mudar como o app avisa"
              kind="ghost"
              onPress={() => router.push('/notificacoes')}
            />
            <Button
              label="Ver como a notificação chega"
              kind="quiet"
              onPress={() => router.push('/bloqueada')}
            />
          </Block>

          <Block>
            <Text style={s.blockTitle}>Plano</Text>
            <Txt variant="body">
              Você está no gratuito, com 16 de 15 itens. Um item ficou pausado — nada foi
              apagado.
            </Txt>
            <Button label="Ver planos" kind="ghost" onPress={() => router.push('/planos')} />
          </Block>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const useS = makeStyles((c) => ({
  safe: { flex: 1, backgroundColor: c.plum },
  scroll: { paddingBottom: space.s7 },

  /**
   * A folha branca sobe 20 para arredondar por cima do herói, então o
   * respiro sob o avatar é o que sobra daqui — s6 sozinho virava 4.
   */
  head: { paddingBottom: space.s6 + 20 },
  who: { paddingHorizontal: space.s4, flexDirection: 'row', alignItems: 'center', gap: space.s3, marginTop: space.s4 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: c.lilac2 },
  name: { fontFamily: font.dis, fontSize: size.t4, letterSpacing: -0.5, color: c.onPlum },
  plan: { fontFamily: font.ui, fontSize: size.t2, color: c.onPlum2, marginTop: 2 },

  sheet: {
    backgroundColor: c.paper,
    borderTopLeftRadius: radius.r4,
    borderTopRightRadius: radius.r4,
    marginTop: -20,
    padding: space.s4,
    minHeight: 620,
  },
  blockHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  link: { fontFamily: font.uiBold, fontSize: size.t2, color: c.lilac3 },
  blockTitle: {
    fontFamily: font.dis,
    fontSize: size.t3,
    letterSpacing: -0.3,
    color: c.ink,
    marginBottom: space.s3,
  },
  big: {
    fontFamily: font.disExtra,
    fontSize: size.t7,
    letterSpacing: -1.4,
    color: c.down,
    fontVariant: ['tabular-nums'],
  },
  bigSub: { fontFamily: font.uiSemi, fontSize: size.t2, color: c.ink3, marginTop: space.s2 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    paddingVertical: space.s3,
    borderBottomWidth: 1,
    borderBottomColor: c.line,
    minHeight: 44,
  },
  rowLabel: { fontFamily: font.uiBold, fontSize: size.t3, color: c.ink },
  rowHint: { fontFamily: font.ui, fontSize: size.t1, color: c.ink3, marginTop: 2 },
  rowValue: { fontFamily: font.dis, fontSize: size.t3, color: c.ink },

  toggle: { width: 48, height: 28, borderRadius: 14, backgroundColor: c.line2, padding: 3 },
  toggleOn: { backgroundColor: c.yes },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF' },
  knobOn: { marginLeft: 20 },
}));
