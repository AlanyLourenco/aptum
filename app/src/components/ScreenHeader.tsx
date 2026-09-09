import { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AptumGlyph } from '@/components/AptumMark';
import { IconButton } from '@/components/primitives';
import { font, size, space, TAP } from '@/design/tokens';
import { makeStyles, useIsDark, useTheme } from '@/design/theme';

/**
 * O topo de toda tela.
 *
 * Existe porque antes cada tela tinha o seu — e o espaçamento derivou:
 * o Início respirava e as outras ficavam coladas na barra de status.
 * Um cabeçalho só, e não tem como desalinhar de novo.
 *
 * Ele aplica o inset da área segura por conta própria, então a tela
 * NÃO deve envolvê-lo num SafeAreaView com a borda de cima.
 */
export function ScreenHeader({
  title,
  wordmark,
  subtitle,
  onBack,
  backIcon = 'back',
  right,
  tone = 'paper',
}: {
  title?: string;
  /** o letreiro da marca, no lugar do título */
  wordmark?: boolean;
  subtitle?: string;
  onBack?: () => void;
  /** seta em tela empilhada, xis em tela que se abre por cima */
  backIcon?: 'back' | 'close';
  right?: ReactNode;
  /** `clear` é o plum sem fundo próprio: para sentar sobre um gradiente. */
  tone?: 'paper' | 'plum' | 'clear';
}) {
  const c = useTheme();
  const s = useS();
  const insets = useSafeAreaInsets();
  const dark = tone === 'plum' || tone === 'clear';
  /** a arte clara da marca serve tanto na faixa ameixa quanto no tema escuro */
  const escuro = useIsDark();

  return (
    <View
      style={[
        s.bar,
        tone === 'plum' && { backgroundColor: c.plum },
        tone === 'clear' && { backgroundColor: 'transparent' },
        { paddingTop: insets.top + space.s3 },
      ]}>
      {onBack ? (
        <IconButton
          name={backIcon}
          label={backIcon === 'close' ? 'Fechar' : 'Voltar'}
          tint={dark ? c.onPlum : c.ink}
          onPress={onBack}
          style={s.back}
        />
      ) : null}

      {wordmark ? <AptumGlyph size={30} onLight={!dark && !escuro} /> : null}

      <View style={s.middle}>
        {wordmark ? (
          <Text style={[s.wordmark, dark && { color: c.onPlum }]}>Aptum</Text>
        ) : title ? (
          <Text style={[s.title, dark && { color: c.onPlum }]} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text style={[s.subtitle, dark && { color: c.onPlum2 }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {right ? <View style={s.right}>{right}</View> : null}
    </View>
  );
}

const useS = makeStyles((c) => ({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s2,
    paddingHorizontal: space.s4,
    paddingBottom: space.s3,
    backgroundColor: c.paper,
  },
  /** o botão de voltar recua para a esquerda, alinhando o texto à margem */
  back: { marginLeft: -space.s3 },
  /**
   * Altura de alvo mesmo sem botão: senão a barra encolhe nas telas que
   * não têm ícone e o título sobe alguns pixels em relação às que têm.
   */
  middle: { flex: 1, minWidth: 0, minHeight: TAP, justifyContent: 'center' },
  right: { flexDirection: 'row', alignItems: 'center', marginRight: -space.s2, minHeight: TAP },

  wordmark: {
    fontFamily: font.mark,
    fontSize: size.t4,
    lineHeight: 26,
    letterSpacing: 4.6,
    textTransform: 'uppercase',
    color: c.ink,
  },
  title: {
    fontFamily: font.dis,
    fontSize: size.t5,
    /** altura de linha explícita: sem ela o topo óptico varia por fonte */
    lineHeight: 28,
    letterSpacing: -0.7,
    color: c.ink,
  },
  subtitle: {
    fontFamily: font.ui,
    fontSize: size.t1,
    lineHeight: 17,
    color: c.ink3,
    marginTop: 1,
  },
}));
