import { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/data/catalog';
import { font, size, space } from '@/design/tokens';
import { makeStyles } from '@/design/theme';

/**
 * Trilho lateral de produtos.
 *
 * Serve para quando a quantidade é imprevisível — os produtos que um cupom
 * cobre, os itens das listas em promoção. Na vertical isso empurra o resto
 * da página para longe; na horizontal ocupa uma faixa fixa e o dedo resolve.
 *
 * A calha entra pelo `contentContainerStyle` e não por margem nos cartões,
 * senão o primeiro e o último não encostam na margem da página.
 */
export function ProductRail({
  title,
  meta,
  products,
  footer,
  inset,
}: {
  title?: string;
  meta?: string;
  products: Product[];
  /** peça avulsa no fim do trilho, como um atalho */
  footer?: ReactNode;
  /**
   * Trilho dentro de um cartão. A calha vira margem do próprio ScrollView,
   * e não padding do conteúdo: assim o corte acontece na borda de dentro e
   * sobra sempre uma faixa do cartão dos dois lados. Com padding, o cartão
   * rolava até encostar no fundo e parecia cortado pela tela.
   */
  inset?: boolean;
}) {
  const s = useS();
  if (products.length === 0 && !footer) return null;

  return (
    <View>
      {title ? (
        <View style={s.head}>
          <Text style={s.title}>{title}</Text>
          {meta ? <Text style={s.meta}>{meta}</Text> : null}
        </View>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        /**
         * Sem `flexGrow: 0` o ScrollView horizontal dentro de um vertical
         * estica para preencher o pai e o trilho vira um bloco vazio.
         */
        style={[s.railBox, inset && s.railBoxInset]}
        contentContainerStyle={[s.rail, inset && s.railInset]}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} compact />
        ))}
        {footer}
      </ScrollView>
    </View>
  );
}

const useS = makeStyles((c) => ({
  head: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: space.s4,
    paddingTop: space.s6,
    paddingBottom: space.s2,
  },
  title: { fontFamily: font.dis, fontSize: size.t4, letterSpacing: -0.5, color: c.ink },
  meta: {
    fontFamily: font.uiSemi,
    fontSize: size.t2,
    color: c.ink3,
    fontVariant: ['tabular-nums'],
  },
  railBox: { flexGrow: 0 },
  railBoxInset: { marginHorizontal: space.s4 },
  rail: {
    flexDirection: 'row',
    gap: space.s3,
    paddingHorizontal: space.s4,
    paddingVertical: space.s2,
    alignItems: 'stretch',
  },
  railInset: { paddingHorizontal: 0 },
}));
