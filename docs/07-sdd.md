# Aptum — SDD: plano de construção do backend

> **Documento 07.** Depende de: `01-requisitos.md` (RF/RNF/RN/D), `02-historias-de-usuario.md`
> (critérios em Gherkin), `03-fontes-de-dados.md` (fontes verificadas),
> `04-bases-publicas.md`, `05-dados-ecommerce-flutuacao.md`, `06-coleta-de-dados.md`
> (arquitetura de coleta).
>
> Este documento **não repete** o que está nos anteriores. Ele fecha as decisões que
> ficaram abertas, define o que nunca foi escrito — modelo de dados, banco, servidor,
> a nossa API — e coloca tudo em ordem de execução.

---

## 0. Como este documento funciona

### 0.1 Por que mudar o método agora

O frontend foi construído por conversa: descrever, ver, corrigir. Funcionou porque o
resultado era **visível** — dava para apontar "o card está muito perto" e "esse roxo
está escuro demais".

O backend não tem isso. Ninguém olha para uma regra de elegibilidade de cupom e vê que
está certa. Se a RN-04 decidir errado que o `DERMA10` vale no protetor solar, o app mente
para a usuária no caixa — e **nenhuma tela denuncia**. A verificação tem que sair do olho
e ir para o teste. É essa a razão de trocar o método.

### 0.2 O laço

```
    especificação  →  plano  →  tarefas  →  implementação  →  verificação
         ↑                                                          │
         └──────────────────  mudou? volta aqui  ───────────────────┘
```

A regra que faz o método valer, e a única difícil de cumprir: **mudança volta na
especificação primeiro**. Corrigir direto no código e "depois atualizar o doc" é como o
documento apodrece — em duas semanas ele mente, e a partir daí ninguém confia nele.

### 0.3 O que conta como "pronto"

Uma etapa só fecha quando existe **evidência mecânica**, não opinião:

| Tipo de etapa | Evidência de pronto |
|---|---|
| Pesquisa | Fonte acessada, número anotado, data e link registrados |
| Modelo | Migração roda e reverte; schema versionado |
| Regra de negócio | Tabela de casos com entrada e saída esperada, virada em teste, verde |
| Conector | Coleta real de uma loja, passando os 6 portões de sanidade |
| API | Contrato publicado, e o app consumindo o contrato, não o banco |

---

## 1. Constituição — o que não se negocia

Regras que valem para toda decisão técnica daqui em diante. Vêm das decisões travadas
(D1–D22) e dos riscos já identificados.

| # | Princípio | De onde vem | Consequência prática |
|---|---|---|---|
| C1 | **Push só com certeza.** Cupom "Provável" nunca vira notificação; só aparece dentro do app | D22 | O motor de alerta lê um campo `estado`, e `provavel` não dispara |
| C2 | **O ranking é por preço por unidade, sempre.** Comissão nunca reordena | D9, RN-09 | `afiliado` é coluna de exibição, não de ordenação. Teste que prova isso é obrigatório |
| C3 | **Nunca escalar para evasão.** Loja que bloqueia vira parceria ou fica de fora | Doc 06 §5 | Sem rotação de IP residencial, sem burlar CAPTCHA, sem fingir navegador |
| C4 | **Indisponível é estado, não lacuna** | RF-039 | `disponivel=false` grava linha; nunca se apaga a série |
| C5 | **Gravar mudança, não leitura** | Doc 06 §8 | Leitura igual à anterior só atualiza `visto_em` |
| C6 | **O app nunca fala com loja.** Só com a nossa API | Novo, ver §5.1 | Chave de afiliado nunca sai do servidor |
| C7 | **Dado sem confiança não vira alerta** | RN-08 | Todo preço carrega `confianca`; abaixo do piso, não notifica |
| C8 | **Retenção é lei, não preferência** | Marco Civil art. 15, LGPD | Log de acesso 6 meses e some sozinho. Está no schema, não na tela |

---

## 2. As etapas, em ordem

| # | Etapa | Entra | Sai | Bloqueia |
|---|---|---|---|---|
| **E0** | Pesquisas que faltam | — | Números de mercado e custo | E3, E4 |
| **E1** | Modelo de domínio | 01, 03 | Schema + migrações | E2, E5, E6 |
| **E2** | Regras como tabela de casos | 01 (RN) | Casos + testes | E7 |
| **E3** | Infraestrutura | E0 | Banco, servidor, fila escolhidos | E4, E6 |
| **E4** | A nossa API | E1, E3 | Contrato OpenAPI | App real |
| **E5** | As APIs deles | 03, 06 | Um conector por loja | E6 |
| **E6** | Coleta: quem, onde, quando | E1, E3, E5 | Série histórica correndo | E7 |
| **E7** | Motor de alerta | E2, E6 | Push saindo | Lançamento |
| **E8** | Verificação | E2 | Suíte verde em CI | Lançamento |
| **E9** | LGPD no backend | E1 | Exportação, exclusão, retenção | Lançamento |

**A ordem não é sugestão.** E6 sem E1 grava lixo que precisa ser migrado depois. E7 sem
E2 vira regra escrita em `if` espalhado. E4 antes de E1 congela um contrato sobre um
modelo que ainda vai mudar.

**Exceção deliberada:** o **C0** do doc 06 — coletor mínimo de uma loja gravando preço
diário — pode e deve começar **em paralelo a tudo**, porque cada semana sem coletar é
uma semana de histórico que não volta. Ele grava em tabela provisória e é descartável.

---

## 3. E0 — As pesquisas que faltam

O que os documentos 03–05 cobrem é **pesquisa de fonte de dados**: onde achar preço,
que base pública existe, como prever a Black Friday sem ter vivido nenhuma.

O que **não existe em lugar nenhum** é pesquisa de mercado e de custo. E isso não é
detalhe: o custo de coleta é o que decide a arquitetura. Vigiar 6 produtos e vigiar 500
mil por hora são sistemas diferentes.

### 3.1 Pesquisa A — Concorrência

| O que descobrir | Onde | Como |
|---|---|---|
| Quem já faz isso no Brasil | Google Play e App Store, busca por "comparador de preço", "alerta de preço", "cupom" | Baixar os 5 primeiros, usar por uma semana, anotar o que falha |
| Quem faz **cupom validado por produto** | O mesmo, mais Product Hunt e Reddit r/brasil | Esta é a pergunta que importa: se ninguém valida, é o fosso; se alguém valida, é a régua |
| Quanto cobram | Tela de assinatura dos concorrentes | Alimenta o preço do Aptum Mais |
| Reclamação recorrente | Avaliações de 1 e 2 estrelas na loja de apps | É onde mora o requisito que ninguém escreveu |

**Saída:** uma tabela de 5 a 8 concorrentes com preço, o que validam e o que quebra.

### 3.2 Pesquisa B — Custo de operação

O número que falta para fechar E3. Precisa ser medido, não estimado.

| Item | Onde consultar | O que anotar |
|---|---|---|
| Banco gerenciado | Página de preço de Supabase, Neon, Railway | Custo por GB e por hora de computação |
| Container | Cloud Run, Fly.io, Render | Custo de 1 worker rodando 24 h |
| Saída de rede | O mesmo | Coleta é muita requisição pequena — egress costuma surpreender |
| Push | Expo / FCM | FCM é gratuito; confirmar se há teto |
| Keepa | keepa.com/#!api | Custo do histórico retroativo (doc 03 §5.1 já recomenda comprar) |
| Raspagem terceirizada | Apify, SerpApi | Só como rede de segurança (doc 06 §10) |

**Método:** calcular para três cenários — **100**, **5.000** e **50.000** usuárias — usando
o volume que o doc 06 §1 já derivou (0,83 req/s por loja a 50 mil usuárias). Sem os três
cenários o número não serve: o que é barato a 100 pode ser inviável a 50 mil.

**Saída:** custo mensal por cenário, e o ponto onde a assinatura de R$ 12,90 se paga.

### 3.3 Pesquisa C — Fechar as lacunas de fonte

| Lacuna | Onde | Prazo |
|---|---|---|
| Amazon Creators API | Portal de afiliados Amazon | **Abrir agora.** Doc 06 diz que a aprovação é ciclo de meses |
| Shopee Open API | open.shopee.com | Confirmar se o feed traz EAN — sem EAN o casamento de produto quebra |
| Mercado Livre | developers.mercadolivre.com.br | Já documentada; confirmar cota |
| Regulamento de cupom | Páginas de termos das 4 lojas do piloto | É o insumo da RN-04 e ninguém coletou ainda |

A última linha é a mais importante e a mais esquecida: **a RN-04 depende de ler o
regulamento**, e regulamento é texto em português, não campo de API. Sem uma amostra real
de 20 a 30 regulamentos não dá para modelar as regras de exclusão.

---

## 4. E1 — Modelo de domínio

O protótipo tem um seed com 6 produtos. Isso não é modelo — é dado de tela.

### 4.1 As entidades e por que cada uma existe

```
produto            identidade de catálogo: marca, nome, categoria, EAN base
  └ variante       tom, cor, fragrância, tamanho — RN-11 diz que é 1ª classe
       └ oferta    variante × loja × seller, no tempo

loja               conector, escada de acesso, rate limit, feature flag
seller             nome, tipo (oficial/autorizado/terceiro) — RN-12
cupom              código, loja, vigência, estado
  └ regra_cupom    UMA condição. Um cupom tem várias
usuaria
  └ lista          reposição | desejo — D21 exige motores distintos
       └ item      variante + ciclo de reposição + preço-alvo
alerta             o que foi disparado, para quem, quando, por qual gatilho
```

**Por que `variante` é entidade separada e não coluna:** RN-11 e D16. O tom 3.0 e o 3.5
têm preços e estoques diferentes na mesma loja. Se variante for atributo, a série de preço
mistura tons e a mediana vira ficção.

**Por que `regra_cupom` é tabela e não JSON:** a RN-04 precisa responder *por que* um cupom
não vale — "exclui dermocosméticos" — e mostrar isso na tela. Regra em JSON não se
consulta nem se audita.

### 4.2 As tabelas de série — vindas do doc 06 §8

```sql
observacao_preco   (variante_id, loja_id, seller_id, preco, preco_de,
                    disponivel, peu, origem, confianca, coletado_em)

janela_preco       (variante_id, loja_id, preco, inicio, fim)
                   -- price spell; é o que torna P10 e mediana baratos

agregado_diario    (variante_id, loja_id, p10_90d, mediana_90d, pico_90d,
                    calculado_em)
```

`janela_preco` é o modelo de *price spell* da literatura de rigidez de preço — a mesma
estrutura dos microdados do Billion Prices Project (doc 05), o que permite reaproveitar
a metodologia de medição em vez de inventar uma.

### 4.3 Índices que decidem se funciona

| Índice | Serve para |
|---|---|
| `observacao_preco (variante_id, loja_id, coletado_em DESC)` | "qual o preço agora" |
| `janela_preco (variante_id, inicio, fim)` | mediana e P10 de 90 dias |
| `item_lista (variante_id)` | achar quem monitora — insumo do score de prioridade |
| `cupom (loja_id, vigencia_fim) WHERE estado = 'confirmado'` | o que o motor de alerta varre |

### 4.4 Como se sabe que E1 fechou

- [ ] Migração sobe e desce sem perda
- [ ] O seed do protótipo carrega no schema real, sem adaptação
- [ ] `EXPLAIN` das quatro consultas acima usa índice, não *seq scan*

---

## 5. E4 — A API

### 5.1 Usar uma ou fazer uma? As duas — e a distinção importa

**Fazemos a nossa.** O app fala só com ela.
**Consumimos as deles.** Só o servidor fala com loja.

```
   App (Expo)
      │  só HTTPS para api.aptum.app
      ▼
   API Aptum  ──────┐
      │             │  chave de afiliado, rate limit, cache
      │             ▼
      │      Conectores → VTEX pública · ML oficial · feed de afiliado · Keepa
      ▼
   Postgres
```

**Por que o app nunca fala com loja direto** (princípio C6):

1. A chave de afiliado ficaria no APK. APK se descompila. Chave vazada é conta banida.
2. Rate limit por loja é impossível se cada celular pede por conta própria — mil
   usuárias abrindo o app viram mil requisições simultâneas na mesma loja.
3. Sem servidor no meio não há cache: dez usuárias monitorando o mesmo sérum viram dez
   coletas do mesmo dado.
4. Os 6 portões de sanidade (doc 06 §6) rodam **antes** de gravar. No cliente não há onde.

### 5.2 Estilo e forma

**REST sobre HTTP, JSON.** Não GraphQL: o app tem telas fixas e consultas previsíveis, e
GraphQL traria custo de cache e de limite de profundidade sem ganho aqui.

Recorte inicial, derivado das telas que já existem:

| Método | Rota | Serve a tela |
|---|---|---|
| `GET` | `/v1/produtos?busca=` | Adicionar produto |
| `GET` | `/v1/produtos/{id}` | Ficha do produto |
| `GET` | `/v1/produtos/{id}/ofertas` | "Por ml em cada loja" |
| `GET` | `/v1/produtos/{id}/historico?dias=90` | Mediana, P10, pico |
| `GET` | `/v1/populares` | Mais monitorados |
| `GET/POST/DELETE` | `/v1/listas`, `/v1/listas/{id}/itens` | Listas |
| `GET` | `/v1/cupons` | Aba Cupons |
| `POST` | `/v1/cupons/testar` | Colar um cupom |
| `GET` | `/v1/alertas` | Aba Alertas |
| `GET/PATCH` | `/v1/eu/avisos` | Preferências de notificação |
| `GET` | `/v1/eu/dados` | LGPD art. 18, V — portabilidade |
| `DELETE` | `/v1/eu` | LGPD art. 18, VI — eliminação |

As duas últimas não são enfeite: sem elas a tela de privacidade que já existe no app é
promessa vazia.

### 5.3 Regras do contrato

- **Versão no caminho** (`/v1/`). App na loja demora a atualizar; quebrar contrato quebra
  quem não atualizou.
- **Dinheiro em centavos inteiros.** Nunca `float`. `7190`, não `71.90`.
- **Toda oferta carrega `coletado_em` e `confianca`.** A tela já mostra "há 2 h" — o dado
  tem que vir do servidor, não ser inventado no cliente.
- **Erro com corpo legível**, não só código: a tela precisa dizer o que houve.
- **OpenAPI versionado no repositório**, e é dele que se gera o cliente do app.

---

## 6. E3 — Banco e servidor

Fecha as decisões K1, K2 e K3 que o doc 06 deixou abertas.

### 6.1 Banco: PostgreSQL

| Por quê | |
|---|---|
| O modelo é relacional | Produto → variante → oferta, com integridade referencial de verdade |
| A consulta central é janela temporal | `janela_preco` com `daterange` e índice GiST resolve mediana de 90 dias sem varrer tudo |
| Extensível quando doer | TimescaleDB se a série crescer; `pgmq` para fila; ambos são extensão, não migração |
| Row-Level Security | Isolamento por usuária no banco, não só no código — reduz a chance de vazar lista de outra pessoa |

**Não NoSQL.** A pergunta que o produto faz o tempo todo — "qual o menor preço por ml
entre lojas, com cupom elegível, para esta variante" — é uma junção. Em documento isso
vira desnormalização e o histórico duplicado apodrece.

**Gerenciado, não próprio.** Candidatos a avaliar em E0: **Neon** (Postgres puro, barato,
tem *branching* que ajuda a testar migração) e **Supabase** (Postgres + auth + storage +
RLS num pacote — colapsa três componentes num). Preço precisa ser conferido na fonte, não
chutado aqui.

### 6.2 Fila: o próprio Postgres, no começo

**K1 respondido:** não subir Redis, SQS nem Kafka agora.

A 0,83 req/s por loja (doc 06 §1), `SELECT … FOR UPDATE SKIP LOCKED` numa tabela de
tarefas dá conta com folga — e remove um componente inteiro da operação. Kafka a essa
vazão é enfeite caro.

**Quando trocar:** quando a fila passar de ~50 req/s sustentados, ou quando precisar de
retentativa com *backoff* que a tabela não sustente. Aí `pgmq` primeiro, broker de verdade
depois.

### 6.3 Servidor

**K3 respondido:** container, não serverless — mas por partes.

| Componente | Onde | Por quê |
|---|---|---|
| **API** | Container com escala a zero (Cloud Run, Fly.io, Render) | Tráfego segue o uso do app; dormir de madrugada é economia real |
| **Workers de coleta** | Container **sempre ligado**, um processo por loja | Precisam de estado: circuit breaker, contador de rate limit, conexão viva. Função serverless perde tudo isso a cada invocação |
| **Agendador** | Cron gerenciado chamando um endpoint que enfileira | Simples, auditável |
| **Recalculo diário** | Job agendado | `agregado_diario`, uma vez por dia, fora do horário de pico |

**Por que o worker não é serverless:** o circuit breaker do doc 06 §9 precisa lembrar que
a loja falhou 5 vezes seguidas. Em função efêmera esse estado teria que ir para o banco a
cada tentativa — e aí a proteção contra a loja custa mais que a coleta.

### 6.4 O que fica de fora do MVP, de propósito

Kubernetes, malha de serviço, microsserviços, Kafka, data lake. Nada disso resolve um
problema que o Aptum tenha hoje, e cada um deles é uma coisa a mais para quebrar às três
da manhã.

---

## 7. E6 — A coleta: quem busca, onde, quando

O doc 06 já definiu os três modos, o score de prioridade e as faixas P0–P3. Aqui só o que
faltava: **a tabela operacional**.

### 7.1 Quem busca

| Ator | O que faz | Roda quando |
|---|---|---|
| **Agendador** | Calcula o score de cada par variante × loja e enfileira por faixa | A cada 30 min |
| **Worker de loja** | Tira da fila daquela loja, chama o conector, aplica os 6 portões | Contínuo, com teto de req/s por loja |
| **Normalizador** | Calcula PEU (RN-02), casa a variante, classifica o seller (RN-12) | No mesmo processo, depois do portão |
| **Persistidor** | Grava delta, fecha janela, atualiza `visto_em` | Idem |
| **Agregador** | Recalcula P10, mediana e pico de 90 dias | 1×/dia, madrugada |
| **Motor de alerta** | Avalia gatilhos, aplica anti-spam e silêncio | A cada 15 min |
| **Coletor de cupom** | Feed de afiliado + página de cupom da loja | 4×/dia (é a cadência dos feeds) |
| **Fila humana de cupom** | Revisa regra extraída antes de virar "Confirmado" | Diário, D22 exige |

### 7.2 Onde busca — ordem obrigatória

Nunca subir um degrau sem tentar os anteriores (doc 06 §4):

1. Feed de afiliado — autorizado e ainda monetiza
2. API oficial — Mercado Livre tem; Amazon exige Creators API
3. Endpoint público de plataforma — VTEX `/api/catalog_system/pub/…`, **verificado
   funcionando**, traz EAN, preço, variante e seller
4. HTML renderizado no servidor
5. Página que exige JS — último recurso, caro e frágil
6. Terceiro (Apify, SerpApi) — rede de segurança quando o conector próprio cai

Loja que bloqueia nos níveis 3–5 vira **parceria de afiliado** ou fica de fora. O caso
conhecido é a Beleza na Web, que bloqueou nos dois testes.

### 7.3 Quando busca

| Faixa | Frequência | Quem cai aqui |
|---|---|---|
| **P0** | 1–2 h | Reposição ≤ 14 dias, preço a ≤ 5% do alvo, evento sazonal ativo |
| **P1** | 6 h | Monitorado por várias usuárias, ou plano pago |
| **P2** | 12–24 h | Plano gratuito, reposição distante — é o contratado (RF-150) |
| **P3** | 72 h | Item pausado, mantido só para histórico |

**A volatilidade histórica é o parâmetro que mais economiza e o mais esquecido.** Produto
sem mudança de preço há 60 dias se auto-rebaixa de faixa. Quanto isso corta é uma das
medições de E0.

### 7.4 O modo de falha que mata o produto

Do doc 06 §6, e vale repetir porque é o único erro irrecuperável: **coletar o produto
errado e gravar como se fosse o certo**. Preço de um tom em cima de outro, kit em cima do
avulso, refil em cima do frasco. A série fica contaminada, a mediana mente, e o alerta
manda a usuária comprar por um preço que não existe.

Os 6 portões de sanidade rodam **antes de gravar**, sem exceção. Item que não passa vira
`rejeitado` com o motivo — não vira lacuna silenciosa.

---

## 8. E2 e E8 — As regras viram casos, os casos viram teste

É a etapa que justifica o método inteiro.

### 8.1 O formato

Cada regra de negócio vira uma tabela com entradas, saída esperada e o **porquê**. A
coluna do porquê não é documentação: é o que a tela mostra para a usuária.

**RN-02 — Preço Efetivo por Unidade**

| Preço | Tamanho | Unidade | Cupom elegível | PEU esperado | Nota |
|---|---|---|---|---|---|
| 71,90 | 30 ml | ml | — | 2,3967/ml | base |
| 71,90 | 30 ml | ml | −20% | 1,9173/ml | cupom entra no PEU (D4) |
| 59,60 | 400 ml | ml | — | 0,149/ml | exibir por 100 ml, não por ml |
| 89,90 | 2×250 ml | ml | — | 0,1798/ml | kit decomposto (RN-14) |
| 38,40 | 500 ml refil | ml | — | 0,0768/ml | marcar como refil (RN-16) |

**RN-04 — Elegibilidade de cupom**

| Cupom | Regra | Produto | Saída | Por quê (o que a tela diz) |
|---|---|---|---|---|
| BELEZA20 | 20% em beleza | Sérum, skincare | `vale` | categoria incluída |
| DERMA10 | 10% 1ª compra, exclui dermocosmético | Protetor FPS 60 | `nao_vale` | "Exclui dermocosméticos" |
| VERAO15 | 15% em "marcas selecionadas", sem lista | Protetor | `talvez` | regulamento não lista as marcas → **nunca vira push** (D22) |
| BELEZA20 | mínimo R$ 150 | Carrinho R$ 89 | `nao_vale` | abaixo do mínimo |

O caso `talvez` é o mais importante da suíte: é ele que prova a D22 na prática.

**RN-12 — Vendedor**

| Seller | Preço | Mediana | Saída | Por quê |
|---|---|---|---|---|
| Loja oficial | 71,90 | 99,80 | notifica | confiável |
| Autorizado | 74,50 | 99,80 | notifica | confiável |
| Terceiro | 22,00 | 99,80 | **descarta** | 78% abaixo da mediana com seller não confiável — D18 manda descartar, não notificar |

### 8.2 De onde vêm os testes

As 55 histórias do doc 02 **já estão em Gherkin**. `Dado / Quando / Então` converte quase
literalmente em teste. É o ativo mais subaproveitado do projeto.

### 8.3 Os testes que não podem faltar

| Teste | Prova |
|---|---|
| Ordenação ignora afiliado | C2 / RN-09 — o mais importante para a confiança |
| Cupom `talvez` não gera push | C1 / D22 |
| Preço de seller não confiável não gera alerta | RN-12 / D18 |
| Leitura repetida não cria linha nova | C5 |
| Esgotado grava `disponivel=false`, não some | C4 / RF-039 |
| Portão rejeita EAN divergente | Doc 06 §6 |
| Teto diário respeitado | RN-07 |
| Silêncio noturno respeitado | RN-07 |

---

## 9. E9 — LGPD dentro do backend

As telas de privacidade já existem no app. Elas prometem coisas que só o backend cumpre.

| Direito | Artigo | O que o backend precisa ter |
|---|---|---|
| Acesso e portabilidade | 18, II e V | Job que gera JSON com tudo da usuária |
| Correção | 18, III | Endpoint de edição, e log de quem alterou |
| Eliminação | 18, VI | Apagar em cascata, **menos** o log de acesso |
| Revogação de consentimento | 8º §5º | Tabela `consentimento` com histórico — quando ligou, quando desligou |
| Revisão de decisão automática | 20 | Guardar **por que** cada alerta disparou, não só que disparou |
| Log de acesso | Marco Civil 15 | 6 meses, com expurgo automático agendado |

**O art. 20 é o que mais afeta o schema.** Guardar só "alertou às 14h" não permite
revisar. Tem que guardar o gatilho, o preço no momento, a mediana usada e a regra de
cupom aplicada. É mais barato decidir isso agora do que migrar depois.

**Pendências que não são técnicas e bloqueiam o lançamento:** razão social, CNPJ e o nome
e e-mail do encarregado de dados. Estão marcados como pendentes no app de propósito —
política de privacidade com contato falso não cumpre a lei.

---

## 10. Ordem de execução

| Onda | O que acontece | Por que nesta ordem |
|---|---|---|
| **Agora, em paralelo** | **C0**: coletor de 1 loja VTEX gravando preço diário em tabela provisória | Histórico não volta. Cada semana parada é dado perdido |
| **Agora** | Abrir Amazon Creators API | Aprovação é ciclo de meses |
| **Onda 1** | E0 (pesquisas) + E1 (modelo) | E0 decide E3; E1 destrava quase tudo |
| **Onda 2** | E3 (infra) + E2 (casos de regra) | Independentes entre si |
| **Onda 3** | E5 (conectores) + E4 (API) | E4 já pode servir o app com dado do C0 |
| **Onda 4** | E6 (coleta de verdade) + E8 (CI verde) | Substitui o C0 |
| **Onda 5** | E7 (alertas) + E9 (LGPD) | Últimos porque dependem de série real |

---

## 11. Riscos

| # | Risco | Sinal de que aconteceu | Resposta |
|---|---|---|---|
| S1 | Conector quebra em silêncio quando a loja muda o layout | Taxa de parse cai, taxa de sucesso não | Alarme na **taxa de parse**, não no HTTP 200 |
| S2 | Produto errado gravado como certo | Mediana pula sem motivo | Os 6 portões, e alerta de variação absurda |
| S3 | Amazon não aprova a Creators API | Sem resposta em 90 dias | Plano B: afiliado via rede, ou Amazon fora do piloto |
| S4 | Custo de coleta inviabiliza o grátis | Custo por usuária > receita de afiliado | E0 responde antes de construir |
| S5 | Regulamento de cupom é ambíguo demais para modelar | Muitos `talvez`, poucos `vale` | Fila humana; e `talvez` nunca vira push (D22) |
| S6 | Loja bloqueia | 403 sistemático | Parceria ou ficar de fora. **Nunca** evadir (C3) |

---

## 12. Decisões que ainda faltam

| # | Questão | Quem decide | Bloqueia |
|---|---|---|---|
| Q1 | Linguagem e runtime do backend | Alany | E1 em diante |
| Q2 | Neon ou Supabase | E0 §3.2 | E3 |
| Q3 | Modo C (descoberta) entra no MVP? | Alany | E5 |
| Q4 | Quais 4 lojas exatamente no piloto | Alany + E0 §3.1 | E5 |
| Q5 | Razão social, CNPJ, encarregado de dados | Alany | Lançamento |

---

*Documento 07. Escrito para ser editado: quando algo mudar, muda aqui primeiro.*
