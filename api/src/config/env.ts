/**
 * Configuração vinda do ambiente.
 *
 * Duas regras, e a segunda é a que importa:
 *
 * 1. Falta o que é obrigatório → o processo morre agora, na subida, com o
 *    nome da variável. Melhor não subir do que subir e falhar na primeira
 *    coleta às três da manhã.
 *
 * 2. **Valor de segredo nunca aparece em lugar nenhum.** Nem em log, nem em
 *    mensagem de erro, nem em `console.log(config)`. Por isso os segredos
 *    ficam atrás de uma função `segredo()` em vez de campo comum, e o objeto
 *    tem um `toJSON` que os apaga. Chave de afiliado vazada é conta banida.
 */

import { carregarArquivoEnv } from './carregar-env.ts';

// lê o .env (com expansão de ${MINHASENHA}) antes de qualquer leitura de
// process.env. Idempotente — cada ponto de entrada pode importar à vontade.
carregarArquivoEnv();

type Fonte = Record<string, string | undefined>;

class ConfiguracaoInvalida extends Error {
  constructor(faltando: string[], mensagem?: string) {
    super(
      mensagem ??
        `Variáveis de ambiente obrigatórias faltando: ${faltando.join(', ')}.\n` +
          `Copie .env.example para .env e preencha. O .env não vai para o repositório.`,
    );
    this.name = 'ConfiguracaoInvalida';
  }
}

/** Marca um valor como segredo: ele não sai em serialização nem em log. */
export type Segredo = { readonly __segredo: true; revelar(): string };

function segredo(valor: string): Segredo {
  return {
    __segredo: true,
    revelar: () => valor,
    // qualquer caminho que tente imprimir isso vê a máscara, não a chave
    toJSON: () => '[segredo]',
    toString: () => '[segredo]',
    [Symbol.for('nodejs.util.inspect.custom')]: () => '[segredo]',
  } as Segredo;
}

function ler(fonte: Fonte, nome: string): string | undefined {
  const v = fonte[nome]?.trim();
  return v ? v : undefined;
}

export function carregarConfig(fonte: Fonte = process.env) {
  const faltando: string[] = [];
  const exigir = (nome: string): string => {
    const v = ler(fonte, nome);
    if (!v) faltando.push(nome);
    return v ?? '';
  };

  const cfg = {
    ambiente: (ler(fonte, 'NODE_ENV') ?? 'development') as
      | 'development'
      | 'production'
      | 'test',
    porta: Number(ler(fonte, 'PORT') ?? 3000),

    banco: {
      url: segredo(urlDeBanco(exigir('DATABASE_URL'), 'DATABASE_URL')),
      urlDireta: segredo(
        urlDeBanco(ler(fonte, 'DATABASE_URL_DIRETA') ?? '', 'DATABASE_URL_DIRETA'),
      ),
    },

    coletor: {
      userAgent: ler(fonte, 'COLETOR_USER_AGENT') ?? 'AptumBot/0.1',
      contato: ler(fonte, 'COLETOR_CONTATO') ?? '',
    },

    /**
     * Credencial de loja é sempre opcional.
     *
     * Conector sem credencial se desliga sozinho (ver `estaConfigurada`) em
     * vez de derrubar o processo. É o que permite rodar com a Época hoje e
     * ligar a Shopee no dia em que o cadastro de afiliado sair, sem tocar
     * em código.
     */
    lojas: {
      shopee: par(fonte, 'SHOPEE_APP_ID', 'SHOPEE_APP_SECRET'),
      mercadoLivre: par(fonte, 'MERCADOLIVRE_CLIENT_ID', 'MERCADOLIVRE_CLIENT_SECRET'),
      amazon: {
        ...par(fonte, 'AMAZON_ACCESS_KEY', 'AMAZON_SECRET_KEY'),
        tag: ler(fonte, 'AMAZON_PARTNER_TAG') ?? '',
      },
      keepa: { chave: opcional(fonte, 'KEEPA_API_KEY') },
    },
  };

  if (faltando.length) throw new ConfiguracaoInvalida(faltando);
  return cfg;
}

/**
 * Confere que a string de conexão é uma URL de Postgres de verdade.
 *
 * Vale o esforço porque a falha alternativa é péssima: senha com caractere
 * reservado deixa a URL sintaticamente válida apontando para OUTRO host, e o
 * erro que chega é "conexão recusada" — que manda procurar no lugar errado.
 * A mensagem nunca ecoa a URL: ela contém a senha.
 */
function urlDeBanco(valor: string, nome: string): string {
  if (!valor) return valor;

  let url: URL;
  try {
    url = new URL(valor);
  } catch {
    throw new ConfiguracaoInvalida([], `${nome} não é uma URL válida.`);
  }

  if (url.protocol !== 'postgresql:' && url.protocol !== 'postgres:') {
    throw new ConfiguracaoInvalida(
      [],
      `${nome} deveria começar com postgresql:// (veio ${url.protocol}//).`,
    );
  }
  if (!url.hostname) {
    throw new ConfiguracaoInvalida([], `${nome} está sem host.`);
  }
  if (valor.includes('${') || valor.includes('[YOUR-PASSWORD]')) {
    throw new ConfiguracaoInvalida(
      [],
      `${nome} ainda tem um marcador por substituir — confira MINHASENHA no .env.`,
    );
  }

  return valor;
}

function opcional(fonte: Fonte, nome: string): Segredo | null {
  const v = ler(fonte, nome);
  return v ? segredo(v) : null;
}

function par(fonte: Fonte, nomeId: string, nomeSegredo: string) {
  const id = ler(fonte, nomeId);
  const sec = ler(fonte, nomeSegredo);
  return {
    id: id ?? '',
    segredo: sec ? segredo(sec) : null,
    /** o conector consulta isto para decidir se sobe ou fica de fora */
    estaConfigurada: Boolean(id && sec),
  };
}

export type Config = ReturnType<typeof carregarConfig>;
