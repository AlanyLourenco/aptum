import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, Text, View } from 'react-native';

import { AptumGlyph } from '@/components/AptumMark';
import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Button, Txt } from '@/components/primitives';
import { font, radius, size, space } from '@/design/tokens';
import { makeStyles, useTheme } from '@/design/theme';
import { useAptum } from '@/store/useAptum';

const FREE = [
  'Até 15 itens somando todas as listas',
  'Verificação de preço a cada 12 horas',
  'Validação de cupom completa',
  'Histórico de 90 dias',
];

const PAID = [
  'Itens ilimitados',
  'Verificação a cada 2 horas nos itens urgentes',
  'Alerta antecipado, antes do resumo',
  'Histórico de 24 meses',
  'Recomendação sazonal com previsão por produto',
];

export default function Planos() {
  const c = useTheme();
  const s = useS();
  const router = useRouter();
  const total = useAptum((st) => st.products.length);

  return (
    <LinearGradient
      colors={c.gradients.plumRich}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0.6 }}
      style={s.safe}>
      {/* a marca grande e apagada, sangrando pela direita */}
      <View style={s.watermark} pointerEvents="none">
        <AptumGlyph size={230} />
      </View>

      <ScreenHeader title="Planos" tone="clear" onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.head}>
          <Text style={s.headline}>Você monitora {total} itens hoje.</Text>
          <Text style={s.sub}>
            O gratuito resolve para a maioria. O pago serve para quem acompanha muita coisa e
            quer saber antes.
          </Text>
        </View>

        <View style={s.sheet}>
          <View style={s.plan}>
            <View style={s.planHead}>
              <Text style={s.planName}>Gratuito</Text>
              <Text style={s.planPrice}>R$ 0</Text>
            </View>
            {FREE.map((f) => (
              <Row key={f} text={f} />
            ))}
            <View style={s.current}>
              <Text style={s.currentTxt}>Seu plano atual</Text>
            </View>
          </View>

          <LinearGradient
            colors={c.gradients.paid}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[s.plan, s.planPaid]}>
            {/* fita de gradiente no topo, no lugar da barra chapada */}
            <LinearGradient
              colors={c.gradients.mark}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.ribbon}
            />
            {/* satin: luz de cima à esquerda que morre no meio do cartão */}
            <LinearGradient
              colors={c.gradients.sheen}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.85, y: 0.9 }}
              style={s.sheen}
              pointerEvents="none"
            />
            <View style={s.planHead}>
              <Text style={[s.planName, { color: c.onPlum }]}>Aptum Mais</Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[s.planPrice, { color: c.onPlum }]}>R$ 12,90</Text>
                <Text style={s.perMonth}>por mês</Text>
              </View>
            </View>
            {PAID.map((f) => (
              <Row key={f} text={f} dark />
            ))}
            <Button label="Assinar o Aptum Mais" kind="light" />
          </LinearGradient>

          <View style={s.note}>
            <Text style={s.noteTitle}>Se você cancelar</Text>
            <Txt variant="body" style={{ marginTop: space.s2 }}>
              Os itens que passarem de 15 ficam <Text style={s.b}>pausados</Text>, não apagados.
              Você escolhe quais continuam ativos, e o histórico de todos permanece.
            </Txt>
          </View>

          <Txt variant="meta" style={s.fine}>
            O Aptum também recebe comissão quando você compra por um link nosso. Isso nunca
            muda a ordem das lojas — a lista é sempre por preço por unidade.
          </Txt>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function Row({ text, dark }: { text: string; dark?: boolean }) {
  const c = useTheme();
  const s = useS();
  return (
    <View style={s.row}>
      <Icon name="check" size={16} color={dark ? c.lilac2 : c.yes} strokeWidth={3} />
      <Text style={[s.rowTxt, dark && { color: c.onPlum2 }]}>{text}</Text>
    </View>
  );
}

const useS = makeStyles((c) => ({
  /** recorta a marca que sangra pela direita */
  safe: { flex: 1, overflow: 'hidden' },
  scroll: { paddingBottom: space.s8 },

  /** sangra pela direita e pelo topo: a marca é fundo, não ilustração */
  watermark: { position: 'absolute', top: -46, right: -74, opacity: 0.14 },
  head: { paddingHorizontal: space.s4, paddingBottom: space.s6, paddingTop: space.s2 },
  headline: {
    fontFamily: font.disExtra,
    fontSize: size.t6,
    letterSpacing: -1,
    color: c.onPlum,
    lineHeight: 30,
  },
  sub: {
    fontFamily: font.ui,
    fontSize: size.t2,
    color: c.onPlum2,
    marginTop: space.s2,
    lineHeight: 19,
  },

  sheet: {
    backgroundColor: c.paper,
    borderTopLeftRadius: radius.r4,
    borderTopRightRadius: radius.r4,
    padding: space.s4,
    minHeight: 620,
  },

  plan: {
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: radius.r3,
    padding: space.s4,
    marginBottom: space.s3,
  },
  planPaid: { borderColor: c.plum4, overflow: 'hidden' },
  ribbon: { position: 'absolute', top: 0, left: 0, right: 0, height: 4 },
  sheen: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  planHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: space.s3,
  },
  planName: { fontFamily: font.dis, fontSize: size.t4, letterSpacing: -0.5, color: c.ink },
  planPrice: {
    fontFamily: font.disExtra,
    fontSize: size.t6,
    letterSpacing: -1,
    color: c.ink,
    fontVariant: ['tabular-nums'],
  },
  perMonth: { fontFamily: font.uiSemi, fontSize: size.t1, color: c.onPlum3 },

  row: { flexDirection: 'row', gap: space.s2, alignItems: 'flex-start', paddingVertical: space.s2 },
  rowTxt: { flex: 1, fontFamily: font.ui, fontSize: size.t2, color: c.ink2, lineHeight: 19 },

  current: {
    marginTop: space.s3,
    borderTopWidth: 1,
    borderTopColor: c.line,
    paddingTop: space.s3,
    alignItems: 'center',
  },
  currentTxt: { fontFamily: font.uiBold, fontSize: size.t2, color: c.ink3 },

  note: {
    backgroundColor: c.wash,
    borderRadius: radius.r3,
    padding: space.s4,
    marginTop: space.s2,
  },
  noteTitle: { fontFamily: font.dis, fontSize: size.t3, letterSpacing: -0.3, color: c.ink },
  b: { fontFamily: font.uiBold, color: c.ink },
  fine: { marginTop: space.s4, lineHeight: 18 },
}));
