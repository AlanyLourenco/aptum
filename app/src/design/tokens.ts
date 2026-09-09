/**
 * Aptum — tokens que não dependem do tema.
 *
 * Cor não mora aqui: ela varia entre claro e escuro e sai de
 * `design/palettes.ts` através do hook `useTheme`. Espaço, tipo, raio e
 * alvo de toque são os mesmos nos dois temas.
 */

/** Escala de espaçamento. Oito degraus, nada fora dela. */
export const space = {
  s1: 4,
  s2: 8,
  s3: 12,
  s4: 16,
  s5: 20,
  s6: 24,
  s7: 32,
  s8: 40,
} as const;

/** Escala tipográfica. Nove degraus, razão ~1,2, piso em 11. */
export const size = {
  t0: 11,
  t1: 12,
  t2: 13,
  t3: 15,
  t4: 18,
  t5: 22,
  t6: 26,
  t7: 32,
  t8: 40,
} as const;

export const radius = {
  r1: 8,
  r2: 12,
  r3: 16,
  r4: 22,
  r5: 32,
  pill: 999,
} as const;

/** Alvo mínimo de toque. WCAG 2.1 AA. */
export const TAP = 44;

export const font = {
  /** Interface. Altura-x grande, legível em corpo pequeno. */
  ui: 'Manrope_400Regular',
  uiMedium: 'Manrope_500Medium',
  uiSemi: 'Manrope_600SemiBold',
  uiBold: 'Manrope_700Bold',
  uiExtra: 'Manrope_800ExtraBold',
  /** Display. Preços e títulos. */
  dis: 'Archivo_700Bold',
  disExtra: 'Archivo_800ExtraBold',
  disRegular: 'Archivo_400Regular',
  /** Só o letreiro da marca. */
  mark: 'Jost_400Regular',
} as const;
