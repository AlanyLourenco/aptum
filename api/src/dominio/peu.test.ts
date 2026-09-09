import assert from 'node:assert/strict';
import { test } from 'node:test';

import { deReais } from './dinheiro.ts';
import { calcularPEU, peuExibido } from './peu.ts';

/**
 * A tabela de casos da RN-02, tirada do documento 07 §8.1.
 *
 * Isto não é teste de implementação — é a especificação executável. Se um
 * número aqui mudar, foi a regra de negócio que mudou, e a mudança tem que
 * começar no documento.
 */
const CASOS = [
  {
    nome: 'sérum 30 ml, sem cupom',
    preco: 71.9,
    embalagem: { conteudo: 30, unidade: 'ml' as const },
    peuEsperado: 23967, // R$ 2,3967/ml
  },
  {
    nome: 'sérum 30 ml, cupom de 20% entra no PEU (D4)',
    preco: 71.9,
    embalagem: { conteudo: 30, unidade: 'ml' as const },
    descontoPct: 20,
    peuEsperado: 19173, // R$ 1,9173/ml
  },
  {
    nome: 'shampoo 400 ml — exibir por 100 ml, não por ml',
    preco: 59.6,
    embalagem: { conteudo: 400, unidade: 'ml' as const },
    peuEsperado: 1490,
    exibicao: { valor: 1490, rotulo: '100 ml' },
  },
  {
    nome: 'kit 2×250 ml decomposto (RN-14)',
    preco: 89.9,
    embalagem: { conteudo: 250, unidade: 'ml' as const, pecas: 2 },
    peuEsperado: 1798, // R$ 0,1798/ml
  },
  {
    nome: 'refil 500 ml (RN-16)',
    preco: 38.4,
    embalagem: { conteudo: 500, unidade: 'ml' as const },
    peuEsperado: 768, // R$ 0,0768/ml
  },
];

for (const caso of CASOS) {
  test(`RN-02 — ${caso.nome}`, () => {
    const peu = calcularPEU({
      preco: deReais(caso.preco),
      embalagem: caso.embalagem,
      ...(caso.descontoPct !== undefined ? { descontoPct: caso.descontoPct } : {}),
    });
    assert.equal(peu, caso.peuEsperado);

    if (caso.exibicao) {
      assert.deepEqual(peuExibido(peu, caso.embalagem.unidade), caso.exibicao);
    }
  });
}

test('RN-02 — refil de 500 ml é muito mais barato que frasco de 30 ml', () => {
  const frasco = calcularPEU({ preco: deReais(71.9), embalagem: { conteudo: 30, unidade: 'ml' } });
  const refil = calcularPEU({ preco: deReais(38.4), embalagem: { conteudo: 500, unidade: 'ml' } });
  // é a comparação que justifica a existência do PEU: mais caro no total,
  // e ainda assim o frasco é ~31× mais caro por ml
  assert.ok(refil < frasco);
  assert.ok(frasco / refil > 30);
});

test('conteúdo zero não passa silenciosamente', () => {
  assert.throws(
    () => calcularPEU({ preco: deReais(10), embalagem: { conteudo: 0, unidade: 'ml' } }),
    RangeError,
  );
});
