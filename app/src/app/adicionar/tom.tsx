import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { Icon } from '@/components/Icon';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Block, Button, Seal, Txt } from '@/components/primitives';
import { Vessel } from '@/components/Vessel';
import { baseTones, brl, totalTones } from '@/data/catalog';
import { font, radius, size, space, TAP } from '@/design/tokens';
import { makeStyles, useTheme } from '@/design/theme';
import { useAptum } from '@/store/useAptum';

/** Referência estável: `?? []` criaria um array novo a cada render. */
const EMPTY: string[] = [];

/**
 * Escolher o tom. Variante é obrigatória quando o produto tem tom,
 * e o tom nunca é só a bolinha de cor: código e nome sempre juntos.
 */
export default function EscolherTom() {
  const c = useTheme();
  const s = useS();
  const router = useRouter();
  const [selected, setSelected] = useState('3.5');
  const accepted = useAptum(useShallow((st) => st.acceptedTones['base-matte'] ?? EMPTY));
  const toggleTone = useAptum((st) => st.toggleTone);

  const neighbours = baseTones.filter((t) => t.code !== selected && t.price);

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <ScreenHeader title="Escolha o seu tom" onBack={() => router.back()} />

      <View style={s.search}>
        <Icon name="search" size={18} color={c.ink3} strokeWidth={1.9} />
        <Text style={s.searchTxt}>base fluida matte</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.product}>
          <View style={s.shot}>
            <Vessel name="compact" size={48} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt variant="brand">Véu Cosméticos</Txt>
            <Txt variant="bodyStrong">Base Fluida Matte · 30 ml</Txt>
            <Txt variant="meta" style={{ marginTop: space.s1 }}>
              {totalTones} tons disponíveis · 4 lojas
            </Txt>
          </View>
        </View>

        <Block>
          <View style={s.tones}>
            {baseTones.map((t) => {
              const on = t.code === selected;
              return (
                <Pressable
                  key={t.code}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`Tom ${t.code} ${t.name}`}
                  onPress={() => setSelected(t.code)}
                  style={({ pressed }) => [
                    s.tone,
                    on && s.toneOn,
                    pressed && { borderColor: c.ink3 },
                  ]}>
                  <View style={[s.swatch, { backgroundColor: t.swatch }]} />
                  <Text style={s.toneCode}>{t.code}</Text>
                  <Text style={s.toneName}>{t.name}</Text>
                </Pressable>
              );
            })}
          </View>
          <Button label={`Ver os ${totalTones} tons`} kind="quiet" />
        </Block>

        <Block>
          <Text style={s.blockTitle}>Você também serve em algum vizinho?</Text>
          <Txt variant="body" style={{ marginBottom: space.s3 }}>
            Se serve, a gente avisa quando ficarem bem mais baratos — sempre dizendo que não
            é o seu tom.
          </Txt>
          {neighbours.map((t) => {
            const on = accepted.includes(t.code);
            return (
              <View key={t.code} style={s.row}>
                <View style={s.rowLeft}>
                  <View style={[s.dot, { backgroundColor: t.swatch }]} />
                  <View>
                    <Text style={s.rowName}>
                      {t.code} {t.name}
                    </Text>
                    <Text style={s.rowMeta}>{brl(t.price!)} hoje</Text>
                  </View>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`${on ? 'Remover' : 'Aceitar'} o tom ${t.code}`}
                  onPress={() => toggleTone('base-matte', t.code)}
                  hitSlop={8}>
                  <Seal tone={on ? 'yes' : 'no'} label={on ? 'Aceito' : 'Aceitar'} />
                </Pressable>
              </View>
            );
          })}
        </Block>

        <View style={s.hint}>
          <Icon name="scan" size={26} color={c.lilac3} strokeWidth={1.8} />
          <Txt variant="body" style={{ flex: 1 }}>
            Não sabe o tom? Escaneie o código de barras da base que você já tem.
          </Txt>
        </View>

        <Button label={`Monitorar o tom ${selected}`} onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const useS = makeStyles((c) => ({
  safe: { flex: 1, backgroundColor: c.paper },
  scroll: { padding: space.s4, paddingBottom: space.s8 },

  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s2,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: radius.pill,
    paddingHorizontal: space.s4,
    marginHorizontal: space.s4,
    marginTop: space.s2,
    minHeight: TAP,
  },
  searchTxt: { fontFamily: font.ui, fontSize: size.t3, color: c.ink3 },

  product: {
    flexDirection: 'row',
    gap: space.s3,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: radius.r3,
    padding: space.s3,
    marginBottom: space.s3,
  },
  shot: {
    width: 76,
    height: 88,
    borderRadius: radius.r2,
    backgroundColor: c.shotBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tones: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2 },
  tone: {
    width: '31%',
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: radius.r2,
    padding: space.s2,
    alignItems: 'center',
    minHeight: TAP,
  },
  toneOn: { borderWidth: 2, borderColor: c.plum, backgroundColor: c.wash },
  swatch: {
    width: '100%',
    height: 34,
    borderRadius: radius.r1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    marginBottom: space.s2,
  },
  toneCode: { fontFamily: font.disExtra, fontSize: size.t2, color: c.ink },
  toneName: {
    fontFamily: font.uiSemi,
    fontSize: size.t0,
    color: c.ink3,
    marginTop: 2,
    textAlign: 'center',
  },

  blockTitle: {
    fontFamily: font.dis,
    fontSize: size.t3,
    letterSpacing: -0.3,
    color: c.ink,
    marginBottom: space.s3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.s3,
    paddingVertical: space.s3,
    borderBottomWidth: 1,
    borderBottomColor: c.line,
    minHeight: TAP,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: space.s3 },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  rowName: { fontFamily: font.uiBold, fontSize: size.t3, color: c.ink },
  rowMeta: {
    fontFamily: font.ui,
    fontSize: size.t1,
    color: c.ink3,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },

  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: c.line2,
    borderRadius: radius.r3,
    padding: space.s4,
  },
}));
