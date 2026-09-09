import { ReactNode } from 'react';
import { Pressable, PressableProps, StyleProp, Text, TextProps, TextStyle, View, ViewStyle } from 'react-native';

import { Icon, IconName } from '@/components/Icon';
import { font, radius, size, space, TAP } from '@/design/tokens';
import { Palette } from '@/design/palettes';
import { makeStyles, useTheme } from '@/design/theme';

/* ------------------------------------------------------------------ *
 * Texto
 * ------------------------------------------------------------------ */

type Variant =
  | 'title'      // título de tela
  | 'heading'    // título de bloco
  | 'body'       // corrido
  | 'bodyStrong'
  | 'meta'       // secundário
  | 'micro'      // rótulo mínimo — piso de 11
  | 'brand'      // marca do produto
  | 'price'      // preço em destaque
  | 'priceBig'
  | 'num';       // número tabular

/** o mapa depende do tema, então é função — não constante de módulo */
const variantes = (c: Palette): Record<Variant, TextStyle> => ({
  title: { fontFamily: font.dis, fontSize: size.t5, letterSpacing: -0.7, color: c.ink },
  heading: { fontFamily: font.dis, fontSize: size.t3, letterSpacing: -0.3, color: c.ink },
  body: { fontFamily: font.ui, fontSize: size.t2, lineHeight: 19, color: c.ink2 },
  bodyStrong: { fontFamily: font.uiSemi, fontSize: size.t3, lineHeight: 20, color: c.ink },
  meta: { fontFamily: font.uiMedium, fontSize: size.t1, color: c.ink3 },
  micro: { fontFamily: font.uiBold, fontSize: size.t0, color: c.ink3 },
  brand: { fontFamily: font.uiBold, fontSize: size.t1, color: c.ink3 },
  price: {
    fontFamily: font.disExtra,
    fontSize: size.t6,
    letterSpacing: -1,
    color: c.ink,
    fontVariant: ['tabular-nums'],
  },
  priceBig: {
    fontFamily: font.disExtra,
    fontSize: size.t8,
    letterSpacing: -1.8,
    color: c.ink,
    fontVariant: ['tabular-nums'],
  },
  num: { fontFamily: font.dis, fontSize: size.t3, color: c.ink, fontVariant: ['tabular-nums'] },
});

export function Txt({
  variant = 'body',
  style,
  ...rest
}: TextProps & { variant?: Variant }) {
  const c = useTheme();
  return <Text {...rest} style={[variantes(c)[variant], style]} />;
}

/* ------------------------------------------------------------------ *
 * Selo — cor + ícone + palavra. Nunca cor sozinha.
 * ------------------------------------------------------------------ */

export type SealTone = 'yes' | 'maybe' | 'no' | 'down' | 'up';

const selos = (c: Palette): Record<SealTone, { fg: string; bg: string; icon?: IconName }> => ({
  yes: { fg: c.yes, bg: c.yesBg, icon: 'check' },
  maybe: { fg: c.maybe, bg: c.maybeBg, icon: 'question' },
  no: { fg: c.none, bg: c.noneBg, icon: 'close' },
  down: { fg: c.down, bg: c.downBg },
  up: { fg: c.up, bg: c.upBg },
});

export function Seal({
  tone,
  label,
  icon,
  style,
}: {
  tone: SealTone;
  label: string;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  const s = useS();
  const c = useTheme();
  const t = selos(c)[tone];
  const glyph = icon ?? t.icon;
  return (
    <View style={[s.seal, { backgroundColor: t.bg }, style]}>
      {glyph ? <Icon name={glyph} size={12} color={t.fg} strokeWidth={2} /> : null}
      <Text style={[s.sealLabel, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ *
 * Botões — sempre 44 de alvo, sempre com estado pressionado
 * ------------------------------------------------------------------ */

export function Button({
  label,
  kind = 'solid',
  style,
  ...rest
}: PressableProps & { label: string; kind?: 'solid' | 'ghost' | 'quiet' | 'light' }) {
  const c = useTheme();
  const s = useS();
  return (
    <Pressable
      accessibilityRole="button"
      {...rest}
      style={({ pressed }) => [
        s.btn,
        kind === 'solid' && s.btnSolid,
        kind === 'ghost' && s.btnGhost,
        kind === 'quiet' && s.btnQuiet,
        kind === 'light' && s.btnLight,
        pressed && s.pressed,
        style as ViewStyle,
      ]}>
      <Text
        style={[
          s.btnLabel,
          kind === 'solid' && { color: c.onPlum },
          kind === 'ghost' && { color: c.ink },
          kind === 'quiet' && { color: c.ink2, fontSize: size.t2 },
          kind === 'light' && { color: c.plum },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function IconButton({
  name,
  label,
  tint,
  badge,
  style,
  ...rest
}: PressableProps & { name: IconName; label: string; tint?: string; badge?: number }) {
  const c = useTheme();
  const s = useS();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      {...rest}
      style={({ pressed }) => [s.iconBtn, pressed && s.pressedSoft, style as ViewStyle]}>
      <Icon name={name} size={21} color={tint ?? c.ink} />
      {badge ? (
        <View style={s.badge}>
          <Text style={s.badgeTxt}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ *
 * Blocos
 * ------------------------------------------------------------------ */

export function Block({
  children,
  tone = 'card',
  style,
}: {
  children: ReactNode;
  tone?: 'card' | 'plum' | 'tint';
  style?: StyleProp<ViewStyle>;
}) {
  const c = useTheme();
  const s = useS();
  return (
    <View
      style={[
        s.block,
        tone === 'plum' && { backgroundColor: c.plum, borderColor: c.plum3 },
        tone === 'tint' && { backgroundColor: c.wash },
        style,
      ]}>
      {children}
    </View>
  );
}

/** Linha de condição verificada: ✓ / ? / ✕ mais o texto. */
export function CheckLine({
  state,
  children,
}: {
  state: 'yes' | 'maybe' | 'no';
  children: ReactNode;
}) {
  const c = useTheme();
  const s = useS();
  const map = {
    yes: { icon: 'check' as IconName, fg: c.yes },
    maybe: { icon: 'question' as IconName, fg: c.maybe },
    no: { icon: 'close' as IconName, fg: c.none },
  }[state];
  return (
    <View style={s.checkLine}>
      <Icon name={map.icon} size={16} color={map.fg} strokeWidth={2.2} />
      <Text style={s.checkTxt}>{children}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */

const useS = makeStyles((c) => ({
  seal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s1,
    paddingVertical: space.s1,
    paddingHorizontal: space.s2,
    borderRadius: radius.r1,
    alignSelf: 'flex-start',
  },
  sealLabel: { fontFamily: font.uiBold, fontSize: size.t0 },

  btn: {
    minHeight: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.s3,
    paddingHorizontal: space.s5,
  },
  btnSolid: { backgroundColor: c.plum },
  btnGhost: { borderWidth: 1.5, borderColor: c.line2 },
  btnQuiet: { minHeight: TAP, marginTop: space.s1 },
  /** o inverso do sólido: para o CTA que vive sobre uma superfície escura */
  btnLight: { backgroundColor: c.lilac1 },
  btnLabel: { fontFamily: font.uiExtra, fontSize: size.t3 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  pressedSoft: { opacity: 0.55 },

  iconBtn: {
    width: TAP,
    height: TAP,
    borderRadius: TAP / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: c.down,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: c.paper,
  },
  badgeTxt: {
    fontFamily: font.uiExtra,
    fontSize: size.t0,
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },

  block: {
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: radius.r3,
    padding: space.s4,
    marginBottom: space.s3,
  },

  checkLine: { flexDirection: 'row', gap: space.s2, alignItems: 'flex-start' },
  checkTxt: {
    flex: 1,
    fontFamily: font.ui,
    fontSize: size.t2,
    lineHeight: 19,
    color: c.ink2,
  },
}));
