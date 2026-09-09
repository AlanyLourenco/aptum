import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

/**
 * Carrega o `.env` — com expansão de `${VARIAVEL}`.
 *
 * Existe por um motivo específico: a senha do banco aparece em duas strings
 * de conexão (pooler e direta). Duas cópias da mesma senha é uma cópia a mais
 * do que se quer manter — na hora de rotacionar, esquece-se uma. Então a
 * senha mora em `MINHASENHA` e as URLs a referenciam:
 *
 *     MINHASENHA=a_senha_do_projeto
 *     DATABASE_URL=postgresql://postgres.ref:${MINHASENHA}@host:6543/postgres
 *
 * Nada nativo faz isso: `node --env-file` não expande, e o dotenv que o
 * drizzle-kit usa por dentro também não. Daí este arquivo.
 *
 * Duas regras que não são óbvias:
 *
 * 1. **Ambiente real vence o arquivo.** Em produção as variáveis vêm do
 *    provedor; um `.env` esquecido no disco não pode sobrescrevê-las.
 * 2. **`${VAR}` na posição de senha de uma URL é percent-encoded.** Senha com
 *    `@`, `#` ou `/` quebra a URL silenciosamente — o host passa a ser outro.
 *    Por isso a senha se escreve CRUA em `MINHASENHA`, nunca pré-codificada.
 */

export class EnvInvalido extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'EnvInvalido';
  }
}

const LINHA = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/;
const REFERENCIA = /\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g;

/** Analisa o texto de um `.env`, sem expandir nada ainda. */
export function analisar(texto: string): Map<string, { valor: string; expandir: boolean }> {
  const saida = new Map<string, { valor: string; expandir: boolean }>();

  for (const bruta of texto.split(/\r?\n/)) {
    const linha = bruta.trim();
    if (!linha || linha.startsWith('#')) continue;

    const m = LINHA.exec(bruta);
    if (!m?.[1]) continue;
    const chave = m[1];

    let valor = (m[2] ?? '').trim();
    let expandir = true;

    if (valor.startsWith("'") && valor.endsWith("'") && valor.length >= 2) {
      // aspas simples: literal, como no shell — nem expansão nem escapes
      valor = valor.slice(1, -1);
      expandir = false;
    } else if (valor.startsWith('"') && valor.endsWith('"') && valor.length >= 2) {
      valor = valor.slice(1, -1).replace(/\n/g, '\n').replace(/\\"/g, '"');
    } else {
      // sem aspas: ` # ...` no fim é comentário. Sem o espaço não é —
      // senha pode conter `#`, e cortá-la aí seria calado e errado.
      valor = valor.replace(/\s+#.*$/, '').trim();
    }

    saida.set(chave, { valor, expandir });
  }

  return saida;
}

/**
 * A referência está na posição de senha de uma URL?
 *
 * Verdadeiro quando o valor começa com `esquema://` e a referência cai antes
 * do `@` que separa credencial de host. É exatamente onde percent-encoding
 * deixa de ser capricho e vira correção.
 */
function ehSenhaDeUrl(valor: string, posicao: number): boolean {
  const inicio = valor.indexOf('://');
  if (inicio === -1 || posicao < inicio) return false;
  const arroba = valor.indexOf('@', inicio + 3);
  return arroba !== -1 && posicao < arroba;
}

/** Troca `${VAR}` pelo valor, resolvendo contra o próprio arquivo e o ambiente. */
export function expandir(
  entradas: Map<string, { valor: string; expandir: boolean }>,
  ambiente: Record<string, string | undefined> = {},
): Map<string, string> {
  const resolvido = new Map<string, string>();
  const emCurso = new Set<string>();

  const resolver = (chave: string): string => {
    const jaFeito = resolvido.get(chave);
    if (jaFeito !== undefined) return jaFeito;

    if (emCurso.has(chave)) {
      throw new EnvInvalido(
        `Referência circular no .env: ${[...emCurso, chave].join(' → ')}.`,
      );
    }

    const entrada = entradas.get(chave);
    if (!entrada) return ambiente[chave] ?? '';
    if (!entrada.expandir) {
      resolvido.set(chave, entrada.valor);
      return entrada.valor;
    }

    emCurso.add(chave);
    const valor = entrada.valor.replace(REFERENCIA, (_todo: string, nome: string, posicao: number) => {
      const bruto = entradas.has(nome) ? resolver(nome) : ambiente[nome];

      // Variável ainda vazia: preserva o `${...}` literal em vez de estourar.
      // Quem sabe se aquilo era obrigatório é o carregarConfig — e ele diz o
      // nome. Estourar aqui travaria também tarefa offline (drizzle-kit
      // generate, por exemplo), que não precisa de credencial nenhuma.
      if (bruto === undefined || bruto === '') return `\${${nome}}`;

      return ehSenhaDeUrl(entrada.valor, posicao) ? encodeURIComponent(bruto) : bruto;
    });
    emCurso.delete(chave);

    resolvido.set(chave, valor);
    return valor;
  };

  for (const chave of entradas.keys()) resolver(chave);
  return resolvido;
}

/**
 * Onde está o `.env` — a raiz da API, achada subindo até o `package.json`.
 *
 * Não dá para depender de `import.meta.dirname`: o drizzle-kit empacota o
 * `drizzle.config.ts` com esbuild antes de executá-lo, e ali `dirname` chega
 * `undefined`. Também não dá para confiar só em `process.cwd()`: quem roda de
 * um subdiretório erraria o alvo. Então: tenta o diretório do módulo, cai
 * para o cwd, e sobe até achar o `package.json`.
 */
function raizDaApi(): string {
  let atual = import.meta.dirname ?? process.cwd();

  for (let subidas = 0; subidas < 10; subidas++) {
    if (existsSync(resolve(atual, 'package.json'))) return atual;
    const acima = dirname(atual);
    if (acima === atual) break;
    atual = acima;
  }

  return process.cwd();
}

let jaCarregado = false;

/**
 * Lê o `.env` da raiz da API e despeja em `process.env`.
 *
 * Idempotente: chamar de vários pontos de entrada não relê o arquivo. Some em
 * silêncio se o arquivo não existir — em produção não existe mesmo, e quem
 * reclama de variável faltando é o `carregarConfig`, com o nome dela.
 */
export function carregarArquivoEnv(caminho = resolve(raizDaApi(), '.env')): void {
  if (jaCarregado) return;
  jaCarregado = true;

  let texto: string;
  try {
    texto = readFileSync(caminho, 'utf8');
  } catch (erro) {
    if ((erro as NodeJS.ErrnoException).code === 'ENOENT') return;
    throw erro;
  }

  for (const [chave, valor] of expandir(analisar(texto), process.env)) {
    // ambiente real vence: só preenche o que ainda não veio de fora
    if (process.env[chave] === undefined) process.env[chave] = valor;
  }
}
