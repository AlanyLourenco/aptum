# Aptum — API

Backend do Aptum. Segue o plano em `../docs/07-sdd.md`.

## Segredos

**Nenhuma credencial entra em arquivo versionado.** Nunca.

- Valores reais vão em `.env`, que está no `.gitignore` desde o primeiro commit.
- A senha do banco mora só em `MINHASENHA`; as duas URLs a referenciam com
  `${MINHASENHA}`. `src/config/carregar-env.ts` faz a expansão — nem o
  `--env-file` do Node nem o dotenv do drizzle-kit expandem — e aplica
  percent-encoding quando a variável cai na posição de senha de uma URL.
- `.env.example` fica no repositório com os **nomes** das variáveis e nenhum valor.
- `src/config/env.ts` embrulha todo segredo num objeto que imprime `[segredo]`
  em log, em `JSON.stringify` e em `console.log`. Não é conveniência: é para
  que um `logger.info(config)` distraído não vaze a chave.

Se uma chave for commitada por engano, **rotacione**. Remover o arquivo não
resolve — ela já está no histórico do git, e histórico se lê.

## Começar

```bash
cp .env.example .env     # e preencher
npm install
npm run dev              # sobe a API em :3000
npm test                 # roda as tabelas de caso das regras
npm run check            # TypeScript
npm run db:aplicar       # cria as tabelas no Supabase
```

Node 22 ou superior. Os `.ts` rodam direto, sem passo de build.

### Conexão

As duas URLs passam pelo **pooler**, e é deliberado: a conexão direta
(`db.<ref>.supabase.co`) hoje só resolve em IPv6, e rede sem rota v6 recebe
`ENETUNREACH`. O pooler é IPv4.

| Porta | Modo | Para quê |
|---|---|---|
| 6543 | transaction | API e workers. Exige `prepare: false` |
| 5432 | session | migração — mantém a sessão, DDL funciona |

`npm run db:aplicar` roda `src/db/migrar.ts`, não o `drizzle-kit migrate`: a
ferramenta oficial sai com código 1 **sem imprimir erro** neste ambiente,
inclusive quando não há nada a aplicar. O registro (`drizzle.__drizzle_migrations`,
hash sha256) é o mesmo, então voltar para ela depois não custa nada.
`npm run db:gerar` continua sendo o `drizzle-kit`, que funciona.

## O que já existe

```
src/
  config/env.ts        configuração validada; segredos que não vazam em log
  db/schema.ts         modelo de domínio (E1) — produto, variante, oferta,
                       cupom, regra, lista, alerta, fila, rejeição
  dominio/
    dinheiro.ts        centavos inteiros. Nunca float
    peu.ts             RN-02 — preço efetivo por unidade
    peu.test.ts        a tabela de casos do doc 07 §8.1, executável
  coleta/
    conector.ts        o contrato que toda loja implementa (doc 06 §4)
    portoes.ts         os 6 portões de sanidade
    portoes.test.ts    um teste por portão
    lojas/epoca.ts     VTEX, degrau 3 — a única loja verificada
  db/migrar.ts         aplica drizzle/*.sql em transação, com erro legível
  config/carregar-env.ts  lê o .env e expande ${VAR}
  api/servidor.ts      Fastify; rotas de busca, oferta e PEU
```

## O que ainda não existe

| Falta | Depende de |
|---|---|
| Fila com `SKIP LOCKED` | o worker que consome `tarefa_coleta` |
| Agendador e score de prioridade | 90 dias de série |
| Motor de alerta | E2 completa |
| Demais conectores | cadastro de afiliado de cada loja |
| Rotas de LGPD | banco de pé |

## Decisões que este código já carrega

| | |
|---|---|
| Dinheiro | `integer` em centavos, do banco à resposta. A tela formata |
| PEU | centésimos de centavo — é a escala que representa R$ 0,0768/ml exato |
| Variante | entidade, não coluna (RN-11) — senão a mediana mistura tons |
| Regra de cupom | tabela, não JSON — a tela precisa dizer *por que* não vale |
| Cupom `provavel` | nunca vira push (D22) |
| Vendedor desconhecido | entra como `terceiro` — na dúvida, não notifica (D18) |
| `429` da loja | desacelerar, nunca insistir nem trocar cabeçalho (C3) |
| Rejeição | vira linha com motivo, nunca lacuna silenciosa (C4) |

## Estado das lojas

Sondagem de 06/09/2026, uma requisição por loja, sem retentativa:

| Loja | Plataforma | Catálogo público | Situação |
|---|---|---|---|
| Época Cosméticos | VTEX | `429` — existe, pede calma | ✅ conector escrito |
| Natura | Salesforce Commerce Cloud | descartado pelo WAF | precisa de credencial |
| O Boticário | atrás de Akamai | descartado pelo WAF | precisa de credencial |
| Beleza na Web | atrás de Akamai | descartado pelo WAF | só por parceria |
| Mercado Livre | API oficial | — | falta credencial |
| Shopee | Open API de afiliado | — | falta cadastro |
| Amazon | Creators API | — | aprovação em meses |
