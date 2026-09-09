import { useMemo } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

import { claro, escuro, Palette } from '@/design/palettes';
import { useAptum } from '@/store/useAptum';

export type ThemePref = 'sistema' | 'claro' | 'escuro';

export const THEMES: { key: ThemePref; label: string; body: string }[] = [
  { key: 'sistema', label: 'Do sistema', body: 'Acompanha o tema do seu celular.' },
  { key: 'claro', label: 'Claro', body: 'Fundo creme o dia inteiro.' },
  { key: 'escuro', label: 'Escuro', body: 'Fundo ameixa profundo, para pouca luz.' },
];

/** Se o app está no escuro agora, considerando a preferência e o sistema. */
export function useIsDark() {
  const pref = useAptum((st) => st.theme);
  const sistema = useColorScheme();
  return pref === 'escuro' || (pref === 'sistema' && sistema === 'dark');
}

/** A paleta em vigor. Use para cor solta em prop de JSX. */
export function useTheme(): Palette {
  return useIsDark() ? escuro : claro;
}

/**
 * Fábrica de estilos por tema.
 *
 * `StyleSheet.create` congela as cores no carregamento do módulo, então um
 * app que troca de tema não pode ter folhas de estilo estáticas. Aqui a
 * folha é criada uma vez por paleta e guardada — só existem duas, então o
 * cache nunca cresce e a troca de tema não recompila nada.
 *
 * Uso: `const useS = makeStyles((c) => ({ ... }))` fora do componente, e
 * `const s = useS()` dentro dele.
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(fn: (c: Palette) => T) {
  const cache = new Map<Palette, T>();

  return function useStyles(): T {
    const c = useTheme();
    return useMemo(() => {
      const pronta = cache.get(c);
      if (pronta) return pronta;
      const nova = StyleSheet.create(fn(c));
      cache.set(c, nova);
      return nova;
    }, [c]);
  };
}
