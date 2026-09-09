import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '@/design/theme';

/**
 * Frascos de produto desenhados. Mesmo sistema de traço dos ícones.
 * Enquanto não houver foto real de catálogo, isto é o que representa
 * o produto — e é honesto: lê como desenho, não finge ser fotografia.
 */
export type VesselName = 'dropper' | 'pump' | 'jar' | 'tube' | 'compact' | 'flacon';

type Props = {
  name: VesselName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function Vessel({
  name,
  size = 64,
  color,
  strokeWidth = 2.2,
}: Props) {
  const c = useTheme();
  /** sem cor explícita o frasco assume o lilás do tema em vigor */
  const stroke = color ?? c.lilac3;
  const s = {
    stroke,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  const h = Math.round((size * 70) / 64);

  return (
    <Svg width={size} height={h} viewBox="0 0 64 70" fill="none">
      {name === 'dropper' && (
        <>
          <Path d="M26 16h12v6h-12z" {...s} />
          <Path d="M22 22h20v34a6 6 0 0 1-6 6H28a6 6 0 0 1-6-6z" {...s} />
          <Path d="M32 8v8" {...s} />
          <Path d="M27 32h10" {...s} />
        </>
      )}
      {name === 'pump' && (
        <>
          <Path d="M28 6h8v5h-8z" {...s} />
          <Path d="M32 11v5" {...s} />
          <Path d="M38 8h6v3" {...s} />
          <Path d="M20 16h24v40a6 6 0 0 1-6 6H26a6 6 0 0 1-6-6z" {...s} />
          <Path d="M25 30h14" {...s} />
        </>
      )}
      {name === 'jar' && (
        <>
          <Path d="M18 20h28v6H18z" {...s} />
          <Path d="M21 26h22v28a6 6 0 0 1-6 6H27a6 6 0 0 1-6-6z" {...s} />
          <Path d="M26 38h12" {...s} />
        </>
      )}
      {name === 'tube' && (
        <>
          <Path d="M24 10h16l-2 8H26z" {...s} />
          <Path d="M26 18h12v40a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4z" {...s} />
          <Path d="M29 30h6" {...s} />
        </>
      )}
      {name === 'compact' && (
        /* estojo redondo com a dobradiça em cima. A diagonal que havia aqui
           cruzava os dois círculos e lia como sinal de proibido. */
        <>
          <Path d="M26 16h12v5H26z" {...s} />
          <Circle cx="32" cy="37" r="17" {...s} />
          <Circle cx="32" cy="37" r="9" {...s} />
        </>
      )}
      {name === 'flacon' && (
        <>
          <Path d="M28 8h8v6h-8z" {...s} />
          <Path d="M22 14h20l4 10v28a6 6 0 0 1-6 6H24a6 6 0 0 1-6-6V24z" {...s} />
          <Path d="M26 34h12" {...s} />
        </>
      )}
    </Svg>
  );
}
