import Fastify from 'fastify';

import { ConectorEpoca } from '../coleta/lojas/epoca.ts';
import { carregarConfig } from '../config/env.ts';
import { peuExibido } from '../dominio/peu.ts';

/**
 * A API do Aptum.
 *
 * O app fala só com ela, e só ela fala com loja (princípio C6). Motivos, na
 * ordem em que doem: a chave de afiliado ficaria no APK, que se descompila;
 * o limite por loja seria impossível com mil celulares pedindo por conta;
 * não haveria cache; e os seis portões rodam antes de gravar, o que no
 * cliente não tem onde acontecer.
 *
 * Esqueleto: as rotas de catálogo ainda leem do conector direto, sem banco.
 * É de propósito — dá para exercitar o conector e o contrato antes de a
 * migração existir.
 */

const config = carregarConfig();
const epoca = new ConectorEpoca(config.coletor.userAgent);

const app = Fastify({
  logger: {
    level: config.ambiente === 'production' ? 'info' : 'debug',
    // nunca deixar cabeçalho de autorização entrar no log
    redact: ['req.headers.authorization', 'req.headers.cookie'],
  },
});

app.get('/saude', async () => ({
  ok: true,
  ambiente: config.ambiente,
  conectores: { epoca: await epoca.saude() },
}));

/**
 * Busca de produto — alimenta a tela "Adicionar produto".
 *
 * Hoje consulta uma loja só. Quando houver mais de um conector, isto vira
 * consulta ao catálogo local e a loja entra só no preço.
 */
app.get<{ Querystring: { busca?: string } }>(
  '/v1/produtos',
  {
    schema: {
      querystring: {
        type: 'object',
        required: ['busca'],
        properties: { busca: { type: 'string', minLength: 2 } },
      },
    },
  },
  async (req) => {
    const candidatos = await epoca.buscarProduto(req.query.busca!);
    return { itens: candidatos, loja: epoca.slug };
  },
);

/**
 * Oferta de um produto.
 *
 * Todo valor sai em **centavos inteiros** e toda oferta carrega
 * `coletadoEm` — a tela mostra "há 2 h", e esse dado vem daqui, não de um
 * palpite do cliente.
 */
app.get<{ Params: { id: string } }>('/v1/produtos/:id/ofertas', async (req, reply) => {
  const oferta = await epoca.obterOferta(req.params.id);
  if (!oferta) {
    return reply.code(404).send({
      erro: 'oferta_indisponivel',
      mensagem: 'A loja não devolveu preço para este produto agora.',
    });
  }

  return {
    ofertas: [
      {
        loja: epoca.nome,
        preco: oferta.preco,
        precoDe: oferta.precoDe ?? null,
        disponivel: oferta.disponivel,
        vendedor: { nome: oferta.sellerNome, tipo: oferta.sellerTipo },
        url: oferta.url,
        origem: oferta.origem,
        coletadoEm: oferta.coletadoEm.toISOString(),
      },
    ],
  };
});

/** O PEU exposto para conferência — mesma conta que a tela usa. */
app.get<{ Querystring: { preco: number; conteudo: number; unidade: 'ml' | 'g' | 'un' } }>(
  '/v1/peu',
  {
    schema: {
      querystring: {
        type: 'object',
        required: ['preco', 'conteudo', 'unidade'],
        properties: {
          preco: { type: 'integer', minimum: 1 },
          conteudo: { type: 'integer', minimum: 1 },
          unidade: { type: 'string', enum: ['ml', 'g', 'un'] },
        },
      },
    },
  },
  async (req) => {
    const { calcularPEU } = await import('../dominio/peu.ts');
    const { centavos } = await import('../dominio/dinheiro.ts');
    const peu = calcularPEU({
      preco: centavos(req.query.preco),
      embalagem: { conteudo: req.query.conteudo, unidade: req.query.unidade },
    });
    return { peu, exibicao: peuExibido(peu, req.query.unidade) };
  },
);

app.setErrorHandler((erro: Error & { statusCode?: number }, _req, reply) => {
  app.log.error({ erro: erro.message }, 'falha na requisição');
  reply.code(erro.statusCode ?? 500).send({
    erro: 'falha_interna',
    // a mensagem crua pode conter detalhe de conexão; não vai para o cliente
    mensagem: 'Não conseguimos responder agora. Tente de novo em instantes.',
  });
});

const endereco = await app.listen({ port: config.porta, host: '0.0.0.0' });
app.log.info(`Aptum API em ${endereco}`);
