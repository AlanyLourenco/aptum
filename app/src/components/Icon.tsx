import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '@/design/theme';

/**
 * Conjunto de ícones desenhado para o Aptum.
 * Um sistema de traço só: 1.8 de espessura, pontas e junções arredondadas,
 * caixa de 24. Nada de emoji nem glifo unicode fazendo papel de ícone.
 */
export type IconName =
  | 'search'
  | 'heart'
  | 'heartFilled'
  | 'user'
  | 'home'
  | 'tag'
  | 'list'
  | 'bag'
  | 'sort'
  | 'filter'
  | 'chevron'
  | 'back'
  | 'close'
  | 'check'
  | 'question'
  | 'bell'
  | 'scan'
  | 'plus'
  | 'clock'
  | 'alert'
  | 'lock'
  | 'download'
  | 'trash'
  | 'doc'
  | 'sliders';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function Icon({
  name,
  size = 22,
  color,
  strokeWidth = 1.8,
}: Props) {
  const c = useTheme();
  /** sem cor explícita o ícone assume a tinta do tema em vigor */
  const stroke = color ?? c.ink;
  const s = { stroke, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {name === 'search' && (
        <>
          <Circle cx="10.5" cy="10.5" r="6.5" {...s} />
          <Path d="M15.4 15.4 L21 21" {...s} />
        </>
      )}
      {name === 'heart' && (
        <Path d="M12 20.2s-7.6-4.6-7.6-9.7A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.6 2.9c0 5.1-7.6 9.7-7.6 9.7Z" {...s} />
      )}
      {name === 'heartFilled' && (
        <Path
          d="M12 20.2s-7.6-4.6-7.6-9.7A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.6 2.9c0 5.1-7.6 9.7-7.6 9.7Z"
          fill={stroke}
          {...s}
        />
      )}
      {name === 'user' && (
        <>
          <Circle cx="12" cy="8.4" r="3.9" {...s} />
          <Path d="M4.8 20.4c.9-3.7 3.8-5.7 7.2-5.7s6.3 2 7.2 5.7" {...s} />
        </>
      )}
      {name === 'home' && (
        <>
          <Path d="M3.6 10.6 12 4l8.4 6.6" {...s} />
          <Path d="M5.7 12.2v7.3h12.6v-7.3" {...s} />
        </>
      )}
      {name === 'tag' && (
        <>
          <Path d="M11.2 3.6H20v8.8l-8.4 8.4a1.6 1.6 0 0 1-2.3 0l-6.5-6.5a1.6 1.6 0 0 1 0-2.3Z" {...s} />
          <Circle cx="16.1" cy="7.9" r="1.5" {...s} />
        </>
      )}
      {name === 'list' && (
        <>
          <Path d="M9 6.5h11M9 12h11M9 17.5h11" {...s} />
          <Path d="M4.4 6.5h.01M4.4 12h.01M4.4 17.5h.01" {...s} />
        </>
      )}
      {name === 'bag' && (
        <>
          <Path d="M5.6 8h12.8l1 12.4H4.6Z" {...s} />
          <Path d="M9 8V6.4a3 3 0 0 1 6 0V8" {...s} />
        </>
      )}
      {name === 'sort' && (
        <>
          <Path d="M7 4.5v15M7 19.5 4 16.3M7 19.5l3-3.2" {...s} />
          <Path d="M17 19.5v-15M17 4.5l-3 3.2M17 4.5l3 3.2" {...s} />
        </>
      )}
      {name === 'filter' && <Path d="M3.6 5.5h16.8L14 13v6l-4 1.6V13Z" {...s} />}
      {name === 'chevron' && <Path d="M9.4 5.6 16 12l-6.6 6.4" {...s} />}
      {name === 'back' && <Path d="M14.6 5.6 8 12l6.6 6.4" {...s} />}
      {name === 'close' && <Path d="M6 6l12 12M18 6L6 18" {...s} />}
      {name === 'check' && <Path d="M4.6 12.4 9.4 17 19.4 6.8" {...s} strokeWidth={strokeWidth + 1} />}
      {name === 'question' && (
        <>
          <Circle cx="12" cy="12" r="8.6" {...s} />
          <Path d="M9.6 9.4a2.5 2.5 0 1 1 3.3 2.4c-.6.2-.9.7-.9 1.3v.6" {...s} />
          <Path d="M12 17.2h.01" {...s} />
        </>
      )}
      {name === 'bell' && (
        <>
          <Path d="M18.2 16.4H5.8c1.2-1.3 1.6-2.4 1.6-4.4V10a4.6 4.6 0 1 1 9.2 0v2c0 2 .4 3.1 1.6 4.4Z" {...s} />
          <Path d="M10.3 19.4a2 2 0 0 0 3.4 0" {...s} />
        </>
      )}
      {name === 'scan' && (
        <>
          <Path
            d="M4 8.5V5.4A1.4 1.4 0 0 1 5.4 4h3.1M15.5 4h3.1A1.4 1.4 0 0 1 20 5.4v3.1M20 15.5v3.1a1.4 1.4 0 0 1-1.4 1.4h-3.1M8.5 20H5.4A1.4 1.4 0 0 1 4 18.6v-3.1"
            {...s}
          />
          <Path d="M4 12h16" {...s} />
        </>
      )}
      {name === 'plus' && <Path d="M12 5v14M5 12h14" {...s} />}
      {name === 'clock' && (
        <>
          <Circle cx="12" cy="12" r="8.5" {...s} />
          <Path d="M12 7.2V12l3.2 2" {...s} />
        </>
      )}
      {name === 'alert' && (
        <>
          <Path d="M12 4.2 21 19.6H3Z" {...s} />
          <Path d="M12 10v4" {...s} />
          <Path d="M12 17h.01" {...s} />
        </>
      )}
      {name === 'lock' && (
        <>
          <Path d="M5.5 10.5h13v9.5h-13z" {...s} />
          <Path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" {...s} />
          <Path d="M12 14.4v2.2" {...s} />
        </>
      )}
      {name === 'download' && (
        <>
          <Path d="M12 3.6v11" {...s} />
          <Path d="M7.6 10.4 12 14.8l4.4-4.4" {...s} />
          <Path d="M4.5 17.5v2.5h15v-2.5" {...s} />
        </>
      )}
      {name === 'trash' && (
        <>
          <Path d="M4.5 6.6h15" {...s} />
          <Path d="M9.4 6.6V4.4h5.2v2.2" {...s} />
          <Path d="M6.4 6.6 7.4 20h9.2l1-13.4" {...s} />
          <Path d="M10.3 10.3v6M13.7 10.3v6" {...s} />
        </>
      )}
      {name === 'sliders' && (
        <>
          <Path d="M4 7.5h9M17 7.5h3" {...s} />
          <Circle cx="15" cy="7.5" r="2.4" {...s} />
          <Path d="M4 16.5h3M11 16.5h9" {...s} />
          <Circle cx="9" cy="16.5" r="2.4" {...s} />
        </>
      )}
      {name === 'doc' && (
        <>
          <Path d="M6 3.6h7.4L18 8.2V20.4H6z" {...s} />
          <Path d="M13.4 3.6v4.6H18" {...s} />
          <Path d="M8.8 12.6h6.4M8.8 16h4.6" {...s} />
        </>
      )}
    </Svg>
  );
}
