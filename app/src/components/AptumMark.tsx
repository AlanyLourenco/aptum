import { Image } from 'react-native';

/** duas artes, uma por tipo de fundo — ver o comentário do AptumGlyph */
const MARCA = require('../../assets/marca.png');
const MARCA_ESCURA = require('../../assets/marca-ink.png');

/**
 * O monograma da marca.
 *
 * É a arte de verdade, extraída de `referencias/Logo.png` com o fundo
 * transformado em transparência — não um redesenho. Quando existir o SVG
 * original, é só trocar: a interface do componente fica igual.
 *
 * São dois arquivos porque o alfa vem da luminância do original: sobre a
 * ameixa isso reproduz a arte exatamente, mas sobre o creme o ápice quase
 * branco sumiria. A versão `onLight` usa alfa de silhueta e a rampa da
 * marca virada para o escuro — mesma forma, mesma direção da luz.
 */
export function AptumGlyph({ size = 24, onLight }: { size?: number; onLight?: boolean }) {
  return (
    <Image
      source={onLight ? MARCA_ESCURA : MARCA}
      style={{ width: size, height: size }}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
      alt=""
    />
  );
}

