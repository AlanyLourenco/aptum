import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { IconButton } from '@/components/primitives';
import { pushes } from '@/data/catalog';
import { font, radius, size, space } from '@/design/tokens';
import { makeStyles, useTheme } from '@/design/theme';

/**
 * Prévia da notificação. A usuária pode ver como o aviso chega
 * antes de decidir se quer o nome do produto visível — o que importa
 * quando a lista revela tratamento de pele.
 */
export default function Bloqueada() {
  const c = useTheme();
  const s = useS();
  const router = useRouter();
  const [hideName, setHideName] = useState(false);

  return (
    <LinearGradient colors={c.gradients.lock} style={s.fill} start={{ x: 0.26, y: 0 }}>
      <SafeAreaView style={s.fill} edges={['top', 'bottom']}>
        <View style={s.bar}>
          <IconButton
            name="back"
            label="Voltar"
            tint={c.onPlum}
            onPress={() => router.back()}
          />
          <Text style={s.barTxt}>Prévia da notificação</Text>
        </View>

        <View style={s.clock}>
          <Text style={s.time}>9:41</Text>
          <Text style={s.date}>sábado, 5 de setembro</Text>
        </View>

        <View style={s.stack}>
          {pushes.map((p, i) => (
            <View key={p.title} style={[s.notif, { opacity: 1 - i * 0.1 }]}>
              <View style={s.notifHead}>
                <View style={s.mark}>
                  <Icon name="tag" size={12} color={c.lilac2} strokeWidth={2} />
                </View>
                <Text style={s.brand}>Aptum</Text>
                <Text style={s.when}>{p.when}</Text>
              </View>
              <Text style={s.title}>
                {hideName ? 'Um item da sua rotina está no melhor preço' : p.title}
              </Text>
              <Text style={s.body}>
                {hideName ? 'Abra o app para ver qual.' : p.body}
              </Text>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: hideName }}
          onPress={() => setHideName((v) => !v)}
          style={({ pressed }) => [s.toggleRow, pressed && { opacity: 0.85 }]}>
          <Text style={s.toggleTxt}>
            {hideName ? 'Nome oculto' : 'Nome visível'} — tocar para alternar
          </Text>
        </Pressable>

        <Text style={s.footer}>3 de 3 hoje · silêncio das 22h às 8h</Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const useS = makeStyles((c) => ({
  fill: { flex: 1 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: space.s1, paddingHorizontal: space.s2 },
  barTxt: { fontFamily: font.uiSemi, fontSize: size.t2, color: c.onPlum2 },

  clock: { alignItems: 'center', paddingVertical: space.s7 },
  time: {
    fontFamily: font.disRegular,
    fontSize: 64,
    letterSpacing: -3,
    color: c.onPlum,
    fontVariant: ['tabular-nums'],
  },
  date: { fontFamily: font.uiSemi, fontSize: size.t2, color: c.onPlum2, marginTop: space.s2 },

  stack: { paddingHorizontal: space.s4, gap: space.s3 },
  notif: {
    backgroundColor: 'rgba(247,244,246,0.95)',
    borderRadius: radius.r3,
    padding: space.s3,
  },
  notifHead: { flexDirection: 'row', alignItems: 'center', gap: space.s2, marginBottom: space.s1 },
  mark: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: c.plum,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontFamily: font.mark,
    fontSize: size.t1,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: c.ink,
  },
  when: { fontFamily: font.uiSemi, fontSize: size.t1, color: c.ink3, marginLeft: 'auto' },
  title: { fontFamily: font.uiBold, fontSize: size.t2, color: c.ink, lineHeight: 19 },
  body: { fontFamily: font.ui, fontSize: size.t2, color: c.ink2, lineHeight: 19 },

  toggleRow: {
    marginTop: space.s5,
    marginHorizontal: space.s4,
    borderWidth: 1,
    borderColor: 'rgba(237,231,242,0.24)',
    borderRadius: radius.pill,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTxt: { fontFamily: font.uiSemi, fontSize: size.t2, color: c.onPlum2 },

  footer: {
    marginTop: 'auto',
    textAlign: 'center',
    fontFamily: font.uiSemi,
    fontSize: size.t1,
    color: c.onPlum3,
    paddingBottom: space.s4,
  },
}));
