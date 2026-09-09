import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { Button, IconButton, Txt } from '@/components/primitives';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Vessel } from '@/components/Vessel';
import { lists } from '@/data/catalog';
import { font, radius, size, space, TAP } from '@/design/tokens';
import { makeStyles, useTheme } from '@/design/theme';

export default function Listas() {
  const c = useTheme();
  const s = useS();
  const router = useRouter();
  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <ScreenHeader
        title="Listas"
        right={
          <IconButton
            name="plus"
            label="Criar lista"
            onPress={() => router.push('/lista/nova')}
          />
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {lists.map((l) => (
          <Pressable
            key={l.id}
            accessibilityRole="button"
            accessibilityLabel={`Abrir ${l.name}, ${l.count} itens`}
            onPress={() => router.push({ pathname: '/lista/[id]', params: { id: l.id } })}
            style={({ pressed }) => [s.card, pressed && { borderColor: c.line2 }]}>
            <View style={s.thumbs}>
              {l.vessels.map((v, i) => (
                <View key={v} style={[s.thumb, i > 0 && { marginLeft: -9 }]}>
                  <Vessel name={v} size={18} strokeWidth={3} />
                </View>
              ))}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{l.name}</Text>
              <Text style={s.rule}>
                {l.count} itens · {l.rule}
              </Text>
            </View>
            <Icon name="chevron" size={19} color={c.ink3} strokeWidth={2} />
          </Pressable>
        ))}

        <View style={s.empty}>
          <Txt variant="body" style={{ textAlign: 'center' }}>
            Uma lista nova para cada coisa que você acompanha de um jeito diferente.
          </Txt>
          <Button label="Criar lista" kind="ghost" onPress={() => router.push('/lista/nova')} />
        </View>

        <View style={s.plan}>
          <View style={s.planHead}>
            <Text style={s.planTitle}>Plano gratuito</Text>
            <Text style={s.planCount}>16 de 15</Text>
          </View>
          <Txt variant="body" style={{ marginTop: space.s2 }}>
            Você passou do limite. Um item ficou pausado — nada foi apagado. Escolha qual
            despausar, ou veja o plano pago.
          </Txt>
          <Button label="Ver planos" kind="ghost" onPress={() => router.push('/planos')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const useS = makeStyles((c) => ({
  safe: { flex: 1, backgroundColor: c.paper },
  scroll: { paddingBottom: space.s7 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: radius.r3,
    padding: space.s4,
    marginHorizontal: space.s4,
    marginBottom: space.s3,
    minHeight: TAP,
  },
  thumbs: { flexDirection: 'row' },
  thumb: {
    width: 34,
    height: 40,
    borderRadius: radius.r1,
    backgroundColor: c.wash,
    borderWidth: 2,
    borderColor: c.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontFamily: font.uiBold, fontSize: size.t3, color: c.ink },
  rule: { fontFamily: font.ui, fontSize: size.t1, color: c.ink3, marginTop: 2 },

  empty: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: c.line2,
    borderRadius: radius.r3,
    padding: space.s5,
    marginHorizontal: space.s4,
    marginBottom: space.s3,
    alignItems: 'center',
  },

  plan: {
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: radius.r3,
    padding: space.s4,
    marginHorizontal: space.s4,
  },
  planHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  planTitle: { fontFamily: font.dis, fontSize: size.t4, letterSpacing: -0.5, color: c.ink },
  planCount: {
    fontFamily: font.uiSemi,
    fontSize: size.t2,
    color: c.ink3,
    fontVariant: ['tabular-nums'],
  },
}));
