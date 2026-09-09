import assert from 'node:assert/strict';
import { test } from 'node:test';

import { centavos } from '../dominio/dinheiro.ts';
import type { OfertaBruta } from './conector.ts';
import { avaliar, type Esperado } from './portoes.ts';

const ESPERADO: Esperado = {
  varianteId: 'v1',
  ean: '7891234567890',
  nome: 'Sérum Vitamina C 20%',
  codigoTom: undefined,
  conteudo: 30,
  unidade: 'ml',
  mediana: 9980,
};

/** `omitir` existe porque `exactOptionalPropertyTypes` recusa `undefined`
 *  explícito: ausência e "presente valendo undefined" são coisas diferentes,
 *  e os portões dependem justamente dessa distinção. */
function oferta(
  mudancas: Partial<OfertaBruta> = {},
  omitir: (keyof OfertaBruta)[] = [],
): OfertaBruta {
  const base: OfertaBruta = {
    preco: centavos(7190),
    disponivel: true,
    sellerIdExterno: 's1',
    sellerNome: 'Época Cosméticos',
    sellerTipo: 'oficial',
    eanRetornado: '7891234567890',
    nomeRetornado: 'Sérum Vitamina C 20% 30ml',
    conteudoRetornado: 30,
    unidadeRetornada: 'ml',
    url: 'https://exemplo/produto',
    origem: 'endpoint_publico',
    coletadoEm: new Date(),
    ...mudancas,
  };
  for (const k of omitir) delete base[k];
  return base;
}

test('portão passa a oferta correta com confiança alta', () => {
  const v = avaliar(oferta(), ESPERADO);
  assert.equal(v.passou, true);
  assert.ok(v.passou && v.confianca >= 90);
});

test('portão 1 — EAN divergente é rejeitado', () => {
  const v = avaliar(oferta({ eanRetornado: '7899999999999' }), ESPERADO);
  assert.equal(v.passou, false);
  assert.ok(!v.passou && v.portao === 'identidade');
});

test('portão 2 — tom divergente é rejeitado', () => {
  const comTom = { ...ESPERADO, codigoTom: '3.5' };
  const v = avaliar(oferta({ varianteRetornada: 'Tom 3.0' }), comTom);
  assert.equal(v.passou, false);
  assert.ok(!v.passou && v.portao === 'variante');
});

test('portão 2 — esperava tom e a loja não disse: passa, mas com confiança menor', () => {
  const comTom = { ...ESPERADO, codigoTom: '3.5' };
  const v = avaliar(oferta({}, ['varianteRetornada']), comTom);
  assert.equal(v.passou, true);
  assert.ok(v.passou && v.confianca <= 60);
});

test('portão 3 — kit pego no lugar do avulso é rejeitado', () => {
  const v = avaliar(oferta({ conteudoRetornado: 500 }), ESPERADO);
  assert.equal(v.passou, false);
  assert.ok(!v.passou && v.portao === 'embalagem');
});

test('portão 4 — preço zero é erro de parse, não promoção', () => {
  const v = avaliar(oferta({ preco: centavos(0) }), ESPERADO);
  assert.equal(v.passou, false);
  assert.ok(!v.passou && v.portao === 'valor');
});

test('portão 5 — queda de 95% contra a mediana é rejeitada', () => {
  const v = avaliar(oferta({ preco: centavos(499) }), ESPERADO);
  assert.equal(v.passou, false);
  assert.ok(!v.passou && v.portao === 'salto');
});

test('portão 5 — sem série histórica, não rejeita por salto', () => {
  const semSerie = { ...ESPERADO, mediana: undefined, ultimoPreco: undefined };
  const v = avaliar(oferta({ preco: centavos(499) }), semSerie);
  assert.equal(v.passou, true);
});

test('portão 6 — coleta de três dias atrás é rejeitada', () => {
  const tresDias = new Date(Date.now() - 72 * 3_600_000);
  const v = avaliar(oferta({ coletadoEm: tresDias }), ESPERADO);
  assert.equal(v.passou, false);
  assert.ok(!v.passou && v.portao === 'frescor');
});

test('sem EAN dos dois lados, a confiança cai — sobrou casar por nome', () => {
  const semEan = { ...ESPERADO, ean: undefined };
  const v = avaliar(oferta({}, ['eanRetornado']), semEan);
  assert.equal(v.passou, true);
  assert.ok(v.passou && v.confianca <= 75);
});
