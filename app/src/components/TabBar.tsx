import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, IconName } from '@/components/Icon';
import { font, radius, size, space, TAP } from '@/design/tokens';
import { makeStyles, useTheme } from '@/design/theme';

const TABS: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Início', icon: 'home' },
  cupons: { label: 'Cupons', icon: 'tag' },
  listas: { label: 'Listas', icon: 'list' },
  levar: { label: 'Vou levar', icon: 'bag' },
  conta: { label: 'Conta', icon: 'user' },
};

/**
 * Barra inferior própria. Cinco destinos, cada um com 44 de alvo.
 *
 * Superfície branca sobre o creme da página, separada por sombra e não só
 * por linha — a ameixa cheia ficava pesada demais no rodapé.
 *
 * A aba ativa é marcada por três coisas ao mesmo tempo: a barra de gradiente
 * na borda de cima, o peso do ícone e a cor do rótulo. Cor sozinha não conta
 * como indicador — quem não distingue os tons fica sem saber onde está.
 */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const c = useTheme();
  const s = useS();
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, space.s3) }]}>
      {state.routes.map((route, i) => {
        const meta = TABS[route.name];
        if (!meta) return null;
        const focused = state.index === i;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={meta.label}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            }}
            style={({ pressed }) => [s.tab, pressed && s.pressed]}>
            {/* a linha sai da borda de cima da barra, só na largura do ícone */}
            {focused ? (
              <LinearGradient
                colors={c.gradients.tab}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.rule}
              />
            ) : null}

            <Icon
              name={meta.icon}
              size={22}
              color={focused ? c.accent : c.ink3}
              strokeWidth={focused ? 2.1 : 1.6}
            />
            <Text style={[s.label, focused && s.labelOn]}>{meta.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useS = makeStyles((c) => ({
  bar: {
    flexDirection: 'row',
    backgroundColor: c.card,
    borderTopWidth: 1,
    borderTopColor: c.line,
    paddingHorizontal: space.s1,
    ...Platform.select({
      ios: {
        shadowColor: c.plum,
        shadowOpacity: 0.1,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: -3 },
      },
      android: { elevation: 14 },
      default: { boxShadow: '0 -3px 14px rgba(30,18,38,0.09)' },
    }),
  },
  tab: {
    flex: 1,
    minHeight: TAP,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderRadius: radius.r2,
    paddingTop: space.s2,
    paddingBottom: space.s1,
  },
  /** encostada na borda de cima, sem deslocar o conteúdo do botão */
  rule: {
    position: 'absolute',
    top: -1,
    width: 30,
    height: 3,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  pressed: { backgroundColor: c.wash },
  label: { fontFamily: font.uiBold, fontSize: size.t0, color: c.ink3 },
  labelOn: { color: c.accent },
}));
