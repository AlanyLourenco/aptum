# Aptum — Fontes de Dados e Estratégia de Cold Start

**Versão:** 0.1
**Data:** 05/09/2026
**Documentos irmãos:** [01-requisitos.md](./01-requisitos.md) · [02-historias-de-usuario.md](./02-historias-de-usuario.md)

**Objetivo:** responder três perguntas práticas antes de escrever a primeira linha de código.

1. De onde vêm os dados de catálogo, preço e cupom?
2. Como o app faz previsão sazonal **sem nunca ter vivido uma Black Friday**?
3. O que a usuária vê no primeiro acesso, antes de cadastrar qualquer produto?

> Duas verificações foram feitas ao vivo durante esta pesquisa, e estão marcadas com ✅ **verificado em 05/09/2026**. O resto vem de fontes públicas citadas ao fim.

---

## 1. O problema do cold start

O Aptum tem três dependências de dado que nascem vazias:

| Dependência | Sem ela o app… | Tempo para encher sozinho |
|---|---|---|
| **Catálogo** (produto, marca, EAN, tamanho, tom) | não consegue nem cadastrar produto | imediato, se comprar/importar base |
| **Série histórica de preço** | não sabe dizer se "está barato" (RN-03 exige 14 dias mínimos, 90 dias ideais) | 3 meses de coleta própria |
| **Evidência sazonal** (quanto cai na Black Friday) | não pode recomendar esperar (RN-19) | **12 a 24 meses** — inaceitável |

A terceira é a crítica. Ela é o motivo deste documento.

---

## 2. Catálogo de produtos — identidade e atributos

### 2.1 Bluesoft Cosmos — *a base brasileira mais completa*

Maior base de produtos do Brasil, com **mais de 18 milhões de itens**. Consulta por GTIN/EAN devolve marca, fabricante, NCM, GPC, preço médio e fotos. API REST com header `X-Cosmos-Token`.

| Endpoint | Uso no Aptum |
|---|---|
| `GET /gtins/{código}` | resolver o código de barras escaneado (US-205) |
| `GET /products?query=` | busca textual para o cadastro (US-201) |
| `GET /gpcs/{código}` | classificação de categoria |

**Veredito:** melhor ponto de partida para o catálogo brasileiro. Verificar plano e limite de requisições — é a primeira negociação comercial do projeto.

### 2.2 Open Beauty Facts — *aberto e gratuito*

Base colaborativa e aberta de cosméticos, sob **Open Database License**. Dumps noturnos em JSONL e **Parquet**, consultáveis com DuckDB, além da API v2 (campo `code` = EAN/UPC de 13 dígitos).

**Veredito:** cobertura brasileira provavelmente fraca, mas é grátis, tem ingredientes e serve como **enriquecimento** e fallback. Custo de integração baixo — vale importar o dump e medir a cobertura real nas nossas categorias antes de decidir.

### 2.3 ANVISA — Cosméticos Regularizados — *o diferencial escondido*

Base oficial de consulta em `consultas.anvisa.gov.br/#/cosmeticos/regularizados/`. Cosméticos no Brasil são **registrados** (risco maior) ou **notificados** (risco menor), e o número de processo começa com `25351`.

**Por que isso importa mais do que parece:** essa é a única fonte oficial que liga **marca ↔ fabricante ↔ produto regularizado**. Ela alimenta diretamente a **RN-12 (autenticidade)** — um perfume cuja marca não aparece regularizada, ou cujo importador não bate, é sinal forte de irregularidade. Nenhum concorrente usa isso.

⚠️ Não há API pública documentada — é consulta web. Vai exigir coleta cuidadosa e respeitosa (RNF-061).

### 2.4 GS1 Brasil

Cadastro Nacional de Produtos, fonte oficial do EAN. Pago. **Veredito:** avaliar só se Cosmos + Open Beauty Facts não cobrirem.

---

## 3. Preço e catálogo por loja

### 3.1 ✅ VTEX — a descoberta que muda a arquitetura

**Verificado em 05/09/2026:** o endpoint público de catálogo da VTEX responde **sem autenticação**.

```
GET https://www.epocacosmeticos.com.br/api/catalog_system/pub/products/search/?ft=serum&_from=0&_to=1
```

Retornou JSON estruturado com exatamente os campos de que o Aptum precisa:

| Nível | Campos retornados |
|---|---|
| **Produto** | `productId`, `productName`, `brand`, `brandId`, `productReference`, `categories`, `link`, `releaseDate`, **`clusterHighlights`**, **`productClusters`** |
| **SKU** (`items[]`) | `itemId`, `nameComplete`, **`ean`**, `referenceId`, `images`, **`tamanho sku`**, `variations`, `Variação produto` |
| **Oferta** (`items[].sellers[].commertialOffer`) | **`Price`**, `ListPrice`, `PriceWithoutDiscount`, `AvailableQuantity`, `IsAvailable`, `Installments`, `PaymentOptions` |

**Por que isso é grande:**

- `ean` no nível do SKU resolve o casamento entre lojas (RF-143) sem heurística.
- `variations` e `tamanho sku` entregam **variante e tamanho estruturados** — exatamente RN-11 (tom) e RN-01 (ml/g), que eram os dois maiores riscos de catálogo.
- `sellers[]` entrega o vendedor, base para RN-12.
- `ListPrice` vs `Price` dá o desconto declarado, e comparado à nossa série detecta falsa promoção (RF-037).
- **`clusterHighlights` e `productClusters`** são as coleções da loja — normalmente incluem "mais vendidos" e "destaques". É **conteúdo semente de graça** (seção 6).
- `/api/catalog_system/pub/category/tree/{n}` dá a árvore de categorias completa.

**Quem roda VTEX (relevante para nós):** Época Cosméticos (Grupo Magazine Luiza) e O Boticário. Beleza na Web pertence ao Grupo Boticário.

⚠️ **Limitações reais:**
- O endpoint **não devolve 100% dos SKUs** da loja — precisa varrer por categoria e paginar, não confiar em uma chamada.
- ❌ **Beleza na Web bloqueou** as duas tentativas (`ECONNRESET` e timeout) — tem proteção antibot. Não insistir: ou entra via afiliado/parceria, ou fica fora da fase 1.
- Ser público não é autorização irrestrita: vale rate limit conservador, `User-Agent` identificado e respeito a `robots.txt` (RNF-061).

**Ação:** testar o mesmo endpoint em cada loja candidata da fase F1/F3. Uma loja VTEX que responde é um conector de 2 dias; uma que bloqueia é um conector de 2 semanas.

### 3.2 ⚠️ Amazon — a PA-API morreu

**Descoberta crítica.** A Product Advertising API 5.0 foi **descontinuada** (uma fonte cita 15/05/2026 como data). A documentação oficial hoje redireciona para a página de deprecação, afirma que "Product Advertising API is deprecated. Please migrate to Creators API" e que chamadas antigas retornam **HTTP 403**.

A substituta é a **Creators API**, que exige credenciais próprias e **aprovação** para sub-serviços e feeds de dado. A taxa de requisição permitida continua atrelada ao **desempenho de vendas** da conta de associado nos últimos 30 dias — ou seja, **conta nova = cota mínima**.

**Consequência para o plano:** a Amazon deixa de ser a "entrada fácil" que eu havia assumido no documento de requisitos. Ela agora exige: virar associado → gerar vendas → ganhar cota. Isso é um ciclo de meses.

**Recomendação:** rebaixar a Amazon na ordem de conectores e subir as lojas VTEX. Abrir a conta de associado **agora**, em paralelo, para o relógio de aprovação começar a correr.

### 3.3 Mercado Livre

API pública de itens e a **API de Preços** existem e são documentadas no portal de desenvolvedores. Porém: **não há API oficial de afiliados** — o programa é baseado em painel (gerador de link e gestor de tags), sem endpoint documentado que transforme URL em link com tag.

**Consequência:** dá para ler preço e catálogo pela API oficial; o link de afiliado precisa ser resolvido por outra via (painel, ou intermediário de terceiro — com o risco que isso carrega). Vale planejar a monetização do Mercado Livre como incerta.

### 3.4 Shopee

**Affiliate Open API** em `open-api.affiliate.shopee.com.br/graphql`, GraphQL com autenticação **HMAC-SHA256**. Cinco modos: `products`, `shops`, `campaigns`, `conversions`, `feeds` — e o modo `feeds` cobre o catálogo inteiro. Credenciais (App ID e API Key) na área Open API do painel de afiliado.

⚠️ O feed traz título, imagem principal e preço atual, **mas não descrição completa nem atributos detalhados**. Para beleza isso significa: **sem atributo de tom estruturado**. Vai exigir extração do título, que é frágil. Shopee é ótima para preço, ruim para variante.

### 3.5 Keepa — *a máquina do tempo*

Keepa cobre a Amazon **incluindo o Brasil**, e a API entrega **histórico completo de preços**, dados de produto, ofertas de marketplace, deals, **listas de best sellers** e informação de vendedor.

**Esta é a peça mais valiosa deste documento para o cold start.** É a única fonte identificada que dá **série histórica retroativa** — ou seja, permite saber quanto um produto caiu na Black Friday de 2025 **sem termos existido em 2025**.

### 3.6 Redes de afiliados — catálogo, cupom e monetização no mesmo lugar

**Lomadee** aparece como a principal agregadora brasileira: feeds de cupons, ofertas, **XML de produtos** e estatísticas, com **API de cupons documentada** em `developer.socialsoul.com.vc/afiliados/cupons/`. Plataformas de cupom sincronizam com ela a cada ~6 horas, removendo cupons expirados automaticamente.

Outras com API/feed: **Awin**, **Afilio**, **Rakuten Advertising**, **ClickWise**.

**Por que priorizar:** a rede de afiliado resolve três problemas de uma vez — catálogo legalizado, cupom estruturado e a monetização (D9). É a via oficial que a RNF-060 manda preferir.

### 3.7 Comparadores e agregadores como referência

- **Zoom** — mais de 300 lojas parceiras e **histórico de preços de 6 meses** exposto. Não é API, mas é referência de validação e prova de que o histórico é exibível publicamente.
- **Buscapé**, **Promobit**, **Pelando** — histórico e comunidade de promoções. Promobit tem mais de 200 ofertas postadas por dia. Não encontrei API pública documentada em nenhum dos dois; seria conversa de parceria.

### 3.8 Fornecedores B2B pagos

- **InfoPrice** — coleta **mais de 1 bilhão de dados por ano**, incluindo varejo físico via hardware próprio (Smart Price™).
- **Precifica** — monitoramento de mercado em tempo real, com **APIs abertas** para integração.
- **Sieve** — price intelligence, controlada pela B2W desde 2015.

**Veredito:** caros para um MVP, mas são o plano B se o scraping virar inviável. **Vale um orçamento** — o custo de uma assinatura pode ser menor que dois meses de engenharia mantendo conectores.

### 3.9 Fallback genérico

**SerpApi**, **Apify** e **Oxylabs** oferecem Google Shopping estruturado (produto, preço, loja, avaliação, URL, país/idioma), com filtros de preço e ordenação. Resolvem CAPTCHA e bloqueio.

**Uso recomendado:** não como fonte primária, mas como **rede de segurança** quando um conector cai (RF-142) — melhor um dado de terceiro do que nenhum.

---

## 4. Cupons

| Fonte | O que entrega |
|---|---|
| **Lomadee — API de Cupons** | cupons estruturados por loja, sincronizados ~4×/dia |
| **Awin / Afilio / Rakuten** | feeds de cupom das lojas afiliadas |
| **Cuponomia** | mais de **20 mil cupons em 2 mil lojas**, atualizados e testados diariamente — referência de cobertura |

### ⚠️ O que nenhuma dessas fontes entrega

Os feeds trazem **código, valor e vigência**. Eles **não** trazem, de forma estruturada e confiável:

- a lista de **marcas excluídas** (a exclusão mais comum em beleza — RN-04);
- o **seller** específico em marketplace;
- as regras de acumulação.

**Isso confirma a decisão mais importante do produto.** A elegibilidade de cupom não é um problema de integração — é um problema de **extração e curadoria**. RF-144 (fila de revisão do Operador) e RF-183 não são "nice to have": são o produto. É exatamente por isso que a classe **"Talvez"** (RN-04) precisa existir, e que só o **"Vale"** vira push (D22).

---

## 5. Estratégia de cold start sazonal — como prever a Black Friday sem ter vivido nenhuma

Esta seção responde a **Q11** do documento de requisitos.

### 5.1 Camada 1 — Retroativo via Keepa *(imediato, o mais forte)*

Keepa tem histórico da Amazon BR. Puxando o histórico dos produtos de beleza mais relevantes, dá para **medir a queda real da Black Friday 2024 e 2025** por produto e por categoria — sem termos existido.

> Isso permite nascer com **confiança Média/Alta** (RN-19) nos produtos vendidos na Amazon, já no primeiro ano.

**Limitação honesta:** só cobre Amazon. Época Cosméticos, Boticário e farmácia ficam de fora. Para essas, a queda da categoria medida na Amazon serve como **proxy**, e precisa ser rotulada como tal.

### 5.2 Camada 2 — Dado setorial público *(grátis, baixa granularidade)*

Referências mensuráveis já publicadas:

| Fato | Fonte |
|---|---|
| Black Friday 2025 no e-commerce brasileiro: **R$ 11 bilhões**, +17% vs 2024 | Neotrust |
| **Beleza & perfumaria entre as categorias de maior crescimento** na Black Friday 2025 | Neotrust / Confi |
| Novembro/2025: **1,4 milhão de unidades** de cosméticos para o rosto, **R$ 106,8 milhões**, 7,2% do setor de beleza e perfumaria | Confi Neotrust |
| Perfumaria nacional (Boticário, Natura) com **descontos de até 40%** no Dia das Mães | calendário promocional do varejo de beleza |
| Ibevar identificou produtos com preço **inflado em até 70%** antes da "promoção" | Ibevar |

**Uso:** calibra a expectativa de ordem de grandeza e alimenta o conteúdo semente. **Não** é suficiente para prever um produto específico — só serve para confiança **Informativa**.

### 5.3 Camada 3 — Procon-SP *(oficial, gratuito, subestimado)*

O Procon **monitora preços de uma amostra de produtos desde setembro** nos sites das grandes redes, justamente para verificar se o desconto da Black Friday é real.

Ou seja: existe uma **série histórica oficial e pública** de preços pré-Black Friday. A amostra é focada em eletrônicos e eletrodomésticos, mas a **metodologia** é reaproveitável — e é uma fonte de autoridade para o selo de falsa promoção (RF-037).

### 5.4 Camada 4 — Coleta própria a partir de hoje

Cada dia sem coletar é um dia de histórico perdido. **A coleta deve começar antes do app existir.**

> **Recomendação operacional:** subir um coletor mínimo — VTEX público das lojas F1 + Keepa — nas próximas semanas, gravando preço diário de uma lista curada de ~500 produtos de beleza. Custa pouco e, quando o app lançar, ele já nasce com meses de série própria em vez de 14 dias.
>
> Isso é a coisa de maior retorno neste documento inteiro. É barato, é hoje, e não depende de nenhuma decisão de produto.

### 5.5 Como isso se traduz na RN-19

| Fonte de evidência | Nível de confiança | Push? |
|---|---|---|
| Histórico próprio, ≥ 2 edições | **Alta** | sim |
| Keepa retroativo do próprio produto | **Alta** | sim |
| Keepa retroativo da categoria (proxy para loja não-Amazon) | **Média** | sim, rotulado como proxy |
| Histórico próprio, 1 edição | **Média** | sim |
| Só dado setorial (Neotrust/ABIHPEC) ou só data conhecida | **Informativa** | **não** |

**Resposta à Q11:** sim, dá para nascer com previsão de confiança Média — **desde que rotulada** — usando Keepa como base retroativa. Sem Keepa, o primeiro ano é inevitavelmente "Informativa", e o épico E8 vira Release 5, não Release 4.

---

## 6. Conteúdo semente — o que a usuária vê antes de criar a lista

Hoje o app abre vazio. Isso é o pior primeiro contato possível para um produto cujo valor só aparece semanas depois. Estas são as respostas que o Aptum pode dar **no minuto zero**, sem a usuária cadastrar nada.

### 6.1 Perguntas que o app deve responder no dia 1

| Pergunta | Fonte do dado | Esforço |
|---|---|---|
| **"Qual o melhor mês para comprar perfume?"** | calendário promocional + histórico Keepa por categoria | baixo |
| **"Quanto cai de verdade em beleza na Black Friday?"** | Keepa retroativo + Neotrust | baixo |
| **"Quais são os produtos de beleza mais vendidos agora?"** | `clusterHighlights` / `productClusters` do VTEX; Amazon Best Sellers via Keepa; Nubimetrics para Mercado Livre | baixo |
| **"O preço desse produto está bom hoje?"** | série própria + Keepa | médio |
| **"Que marcas mais entram em promoção?"** | análise da série própria | médio |
| **"Vale mais o refil?"** | comparação por ml no próprio catálogo VTEX | baixo |
| **"Esse desconto é real ou preço inflado?"** | RF-037 sobre a série histórica | médio |
| **"Quanto custa esse produto nas 4 lojas agora?"** | coleta VTEX + Keepa | baixo |

As de esforço baixo cabem em uma tela de descoberta já no Release 1 — antes mesmo do motor de alerta ficar pronto.

### 6.2 Ranking de mais vendidos por categoria

| Fonte | Cobertura | Como acessar |
|---|---|---|
| **VTEX `productClusters`** | por loja (Época, Boticário) | ✅ endpoint público já verificado |
| **Keepa best sellers** | Amazon BR | API |
| **Nubimetrics** | Mercado Livre — dados de mais vendidos e mais buscados na categoria beleza, ranking de marcas e palavras-chave | plataforma paga, parceira oficial do Mercado Livre |

Sinais de tendência que a Nubimetrics já publica abertamente e que servem de calibração inicial: skincare coreano e chinês (ampolas, máscaras faciais, séruns com ácido hialurônico) em crescimento, e a marca **Sheglam** subindo 27 posições no ranking de marcas mais vendidas de beleza no Mercado Livre.

### 6.3 Calendário promocional de beleza — carga inicial

Datas que já podem ser cadastradas no RF-170 antes de qualquer coleta:

| Data | Quando | Relevância para beleza |
|---|---|---|
| **Dia do Consumidor** | 15 de março | beleza e perfumaria entre as categorias com desconto |
| **Dia das Mães** | 2º domingo de maio | **uma das datas mais lucrativas do ano** no varejo de beleza; perfumaria nacional com até 40% off |
| **Dia dos Namorados** | 12 de junho | perfume é presente clássico |
| **Dia do Amigo** | 20 de julho | campanhas "leve 2 pague 1" em maquiagem, skincare e esmaltes — casa direto com a RN-13 |
| **Black Friday** | **27 de novembro de 2026** | maior evento de desconto; beleza entre os maiores crescimentos |
| **Cyber Monday** | segunda seguinte | cauda da Black Friday |
| **Natal** | dezembro | maior data em faturamento; perfume entre os presentes dominantes |
| **Boti Week / aniversários de loja** | variável | campanhas próprias das marcas diretas |
| **Prime Day** | julho | Amazon |
| **11.11 / 12.12** | novembro e dezembro | Shopee e marketplaces asiáticos |

⚠️ Uma dica recorrente do varejo que vira requisito: em datas de presente, **os itens mais procurados esgotam rápido**. Isso deve entrar na recomendação de esperar (RN-19) como ressalva — esperar tem risco de ruptura de estoque, não só de preço.

### 6.4 Números de mercado para a tela de descoberta

| Fato | Fonte |
|---|---|
| Brasil é o **3º maior mercado mundial** de higiene pessoal, perfumaria e cosméticos, movimentando **US$ 26,9 bilhões/ano** | ABIHPEC |
| Crescimento projetado de **7,2% ao ano até 2027**, chegando a **US$ 40 bilhões** | ABIHPEC |
| Brasil é o **2º maior mercado mundial de fragrâncias**, que cresceram **10% em 2025** | ABIHPEC |
| 2º maior em **produtos masculinos e desodorantes**; 3º em **infantil, proteção solar, higiene oral e cabelo** | ABIHPEC |
| Setor fechou o 1º trimestre com **+6,5%** | ABIHPEC |
| O setor representa cerca de **2% do PIB** | ABIHPEC |

---

## 7. Quadro consolidado

| Fonte | Catálogo | Preço atual | Histórico | Cupom | Custo | Esforço | Risco |
|---|:--:|:--:|:--:|:--:|---|---|---|
| **VTEX público** ✅ | ●●● | ●●● | ○ | ○ | grátis | **baixo** | bloqueio/ToS |
| **Keepa** | ●● | ●●● | **●●●** | ○ | assinatura | baixo | só Amazon |
| **Bluesoft Cosmos** | ●●● | ● | ○ | ○ | pago | baixo | — |
| **Lomadee / Awin / Afilio** | ●● | ●● | ○ | **●●●** | grátis (comissão) | médio | cobertura |
| **Mercado Livre API** | ●● | ●●● | ○ | ○ | grátis | médio | sem API de afiliado |
| **Shopee Affiliate API** | ●● | ●●● | ○ | ●● | grátis | médio | sem atributo de tom |
| **Amazon Creators API** | ●●● | ●●● | ○ | ○ | grátis | **alto** | aprovação + cota por vendas |
| **Open Beauty Facts** | ●● | ○ | ○ | ○ | grátis | baixo | cobertura BR |
| **ANVISA** | ● | ○ | ○ | ○ | grátis | médio | sem API |
| **InfoPrice / Precifica** | ●●● | ●●● | ●●● | ○ | **caro** | baixo | custo |
| **SerpApi / Apify** | ● | ●● | ○ | ○ | por uso | baixo | qualidade |
| **Nubimetrics** | ● | ● | ●● | ○ | pago | baixo | só Mercado Livre |

---

## 8. Recomendação

### Fazer agora, antes de qualquer código de produto

1. **Ligar o coletor de histórico** — VTEX público das lojas F1 + Keepa, ~500 produtos curados, gravando preço diário. Cada semana de atraso é uma semana de histórico que não volta.
2. **Abrir a conta de associado da Amazon** e iniciar o pedido da **Creators API** — o relógio de aprovação e de cota depende de tempo e de vendas, não de esforço.
3. **Testar o endpoint VTEX público em cada loja candidata** — isso decide, em uma tarde, quais lojas entram na fase 1.
4. **Cadastrar o calendário da seção 6.3** — não depende de nada e já habilita a tela de descoberta.

### Stack por fase

| Fase | Catálogo | Preço | Histórico | Cupom |
|---|---|---|---|---|
| **F1** Varejo especializado | VTEX público + Cosmos | VTEX público | próprio (a partir de hoje) | Lomadee + curadoria manual |
| **F2** Marketplaces | Mercado Livre API + Keepa | idem | **Keepa retroativo** | Lomadee / Shopee API |
| **F3** Farmácia | VTEX público + Cosmos | VTEX / scraping | próprio | curadoria manual |
| **F4** Marcas diretas | VTEX público | VTEX público | próprio | campanha própria da marca |

### Ajustes ao plano dos documentos anteriores

| # | Ajuste | Motivo |
|---|---|---|
| A1 | **Rebaixar a Amazon** na ordem de conectores; **subir as lojas VTEX** | PA-API descontinuada; Creators API exige aprovação e cota por vendas |
| A2 | **Tirar a Beleza na Web da fase 1** ou entrar por afiliado | bloqueou as duas tentativas de acesso |
| A3 | **Contratar Keepa** ou aceitar que o épico E8 (calendário) vira Release 5 | é a única fonte retroativa identificada |
| A4 | **Adicionar a ANVISA** como fonte da RN-12 (autenticidade) | fonte oficial de marca ↔ fabricante regularizado |
| A5 | **Adicionar tela de descoberta** ao Release 1 | responde a seção 6.1 sem depender do motor de alerta |
| A6 | **Reforçar RF-144** (curadoria de cupom) como caminho crítico, não secundário | nenhum feed entrega marcas excluídas |

---

## 9. Decisões em aberto

| # | Questão |
|---|---|
| F1 | Contratamos Keepa? É o que decide se o calendário sazonal nasce com previsão real ou só informativa. |
| F2 | Bluesoft Cosmos ou tentar montar catálogo só com VTEX + Open Beauty Facts? Depende do preço do Cosmos. |
| F3 | Entramos em rede de afiliado agora (Lomadee/Awin) — o que também define a monetização — ou depois do MVP? |
| F4 | A tela de descoberta entra no Release 1 (recomendado) ou fica para depois? |
| F5 | Qual o orçamento mensal aceitável para dados? Isso decide entre coleta própria e InfoPrice/Precifica. |
| F6 | Qual a lista curada de ~500 produtos para começar a coletar? Precisa da sua opinião de usuária — quais marcas e produtos realmente importam. |

---

## Fontes

- [Open Beauty Facts — Data, API and SDKs](https://world.openbeautyfacts.org/data)
- [Bluesoft Cosmos — Catálogo de Produtos, GTIN, NCM](https://cosmos.bluesoft.com.br/api)
- [Anvisa — Consulta a cosméticos regularizados](https://consultas.anvisa.gov.br/#/cosmeticos/regularizados/)
- [Anvisa — Saiba como consultar um produto de higiene pessoal, perfume ou cosmético](https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/2023/saiba-como-consultar-um-produto-de-higiene-pessoal-perfume-ou-cosmetico)
- [VTEX — Search (Legacy) API Overview](https://developers.vtex.com/docs/guides/search-api-overview)
- [VTEX — Catalog API Overview](https://developers.vtex.com/docs/guides/catalog-api-overview)
- [Época Cosméticos — endpoint público verificado](https://www.epocacosmeticos.com.br/api/catalog_system/pub/products/search/?ft=serum&_from=0&_to=1)
- [Amazon — PA-API 5.0 deprecation / Creators API](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/paapiv5-deprecation)
- [Amazon PA-API 5.0 — Brazil locale reference](https://webservices.amazon.com/paapi5/documentation/locale-reference/brazil.html)
- [Mercado Livre Developers — API de Preços](https://developers.mercadolivre.com.br/pt_br/api-de-precos)
- [Guia — API de afiliados do Mercado Livre](https://botdoafiliado.com/blog/api-de-afiliados-do-mercado-livre/)
- [Shopee Brasil — Criadores e Afiliados, Open API](https://affiliate.shopee.com.br/open_api)
- [Keepa — API Documentation](https://keepa.com/api-docs/)
- [Lomadee Developers — API de Cupons](https://developer.socialsoul.com.vc/afiliados/cupons/)
- [Lomadee — Cupons de afiliados](https://www.lomadee.com.br/blog/cupons-de-afiliados)
- [Cuponomia](https://www.cuponomia.com.br/)
- [Zoom — Black Friday](https://www.zoom.com.br/black-friday)
- [TechTudo — Melhores ferramentas para monitorar preços](https://www.techtudo.com.br/guia/2025/10/black-friday-melhores-ferramentas-para-monitorar-precos-e-fugir-de-ciladas-edsoftwares.ghtml)
- [Promobit — O que é](https://www.promobit.com.br/o-que-e-promobit/)
- [InfoPrice](https://www.infoprice.co/)
- [Precifica — Inteligência de Mercado](https://precifica.com.br/inteligencia-de-mercado/)
- [Sieve — Price Intelligence](https://www.sieve.com.br/sobre)
- [E-Commerce Brasil — Black Friday 2025: R$ 11 bilhões, projeção Neotrust](https://www.ecommercebrasil.com.br/noticias/black-friday-2025-e-commerce-deve-faturar-r-11-bilhoes-aponta-projecao-da-neotrust)
- [CNN Brasil — Neotrust: faturamento do e-commerce na Black Friday](https://www.cnnbrasil.com.br/economia/negocios/neotrust-diz-que-faturamento-do-e-commerce-deve-crescer-17-na-black-friday/)
- [ABIHPEC — Tamanho do mercado de beleza e cuidados pessoais no Brasil](https://abihpec.org.br/tamanho-mercado-cosmeticos-brasil-2026/)
- [ABIHPEC — Vendas do setor crescem 6,5% no 1º trimestre](https://abihpec.org.br/release/vendas-do-setor-de-higiene-pessoal-perfumaria-e-cosmeticos-fecham-1o-trimestre-com-crescimento-de-65-diz-abihpec/)
- [Nubimetrics — Produtos de beleza mais vendidos e buscados no Mercado Livre](https://academia.nubimetrics.com/br/beleza)
- [Belliz — Calendário promocional do varejo de beleza](https://blog.bellizcompany.com.br/calendario-promocional/)
- [Calendário de Promoções 2026](https://cupomdescontos.com/calendario-promocoes-2026)
- [Procon-SP — Procon de olho na Black Friday](https://www.procon.sp.gov.br/procon-de-olho-na-black-friday/)
- [Reclame Aqui — Como saber se o desconto na Black Friday é real](https://blog.reclameaqui.com.br/descubra-se-o-desconto-e-real-na-black-friday/)
- [SerpApi — comparação de preços](https://dev.to/tamilchelvan/criando-uma-ferramenta-de-comparacao-de-precos-com-o-serpapi-1913)
