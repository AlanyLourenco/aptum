import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';

import { AptumGlyph } from '@/components/AptumMark';
import { Icon } from '@/components/Icon';
import { makeStyles, useTheme } from '@/design/theme';
import { font, radius, size, space } from '@/design/tokens';

/**
 * A promessa do app, em tamanho de promessa.
 *
 * É o único bloco da Início que não fala de um produto — fala do serviço.
 * Por isso ele não pode ter o peso de um aviso: tem fundo próprio, marca
 * d'água, brilho e o display no maior degrau da escala.
 *
 * O título quebra em duas cores porque são duas ideias: o que ela faz e o
 * que a gente faz. É o mesmo par de tons da abertura, então a tela nova
 * não inventa uma linguagem só dela.
 */
export function CartaoPremissa({ onPress }: { onPress: () => void }) {
  const s = useS();
  const c = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Faça sua lista e a gente vigia. Todo dia conferimos preço e testamos se o cupom vale no seu produto. Tocar para adicionar o primeiro."
      onPress={onPress}
      style={({ pressed }) => [s.wrap, pressed && s.pressed]}>
      <LinearGradient
        colors={c.gradients.premissa}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.fundo}>
        {/* a marca sangra pela direita, atrás de tudo */}
        <View style={s.marca} pointerEvents="none">
          <AptumGlyph size={210} />
        </View>

        {/* satin: luz de cima à esquerda, que morre antes do texto acabar */}
        <LinearGradient
          colors={c.gradients.sheen}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={s.brilho}
          pointerEvents="none"
        />

        <View style={s.conteudo}>
          <Text style={s.titulo}>
            Faça sua lista.{'\n'}
            <Text style={s.tituloEco}>A gente vigia.</Text>
          </Text>

          <Text style={s.corpo}>
            Todo dia conferimos preço e promoção nas lojas — e testamos se o cupom vale no{' '}
            <Text style={s.corpoForte}>seu</Text> produto, não naquele que a loja quis.
          </Text>

          <View style={s.cta}>
            <Text style={s.ctaTxt}>Adicionar meu primeiro produto</Text>
            <Icon name="chevron" size={17} color={c.plum} strokeWidth={2.4} />
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const useS = makeStyles((c) => ({
  wrap: { borderRadius: radius.r4, overflow: 'hidden' },
  pressed: { opacity: 0.94, transform: [{ scale: 0.995 }] },
  fundo: { minHeight: 232 },
  marca: { position: 'absolute', top: -34, right: -62, opacity: 0.16 },
  brilho: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },

  conteudo: { padding: space.s5, paddingTop: space.s5 },
  titulo: {
    fontFamily: font.disExtra,
    fontSize: size.t7,
    lineHeight: 34,
    letterSpacing: -1.5,
    color: c.onPlum,
  },
  /** a segunda metade em lilás: são duas ideias, não uma frase longa */
  tituloEco: { color: c.lilac2 },
  corpo: {
    fontFamily: font.ui,
    fontSize: size.t2,
    lineHeight: 19,
    color: c.onPlum2,
    marginTop: space.s3,
    maxWidth: 290,
  },
  corpoForte: { fontFamily: font.uiExtra, color: c.onPlum },

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s2,
    alignSelf: 'flex-start',
    backgroundColor: c.lilac1,
    borderRadius: radius.pill,
    paddingVertical: space.s3,
    paddingHorizontal: space.s4,
    marginTop: space.s4,
  },
  ctaTxt: { fontFamily: font.uiExtra, fontSize: size.t2, color: c.plum },
}));
