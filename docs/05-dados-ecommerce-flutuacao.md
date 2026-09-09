# Aptum — Dados de E-commerce e Flutuação de Preços

**Versão:** 0.1
**Data:** 05/09/2026
**Escopo:** bases e estudos públicos sobre **preço em e-commerce** e **como o preço varia no tempo**. Sem acesso a loja.
**Documentos irmãos:** [01-requisitos.md](./01-requisitos.md) · [03-fontes-de-dados.md](./03-fontes-de-dados.md) · [04-bases-publicas.md](./04-bases-publicas.md)

---

## Resposta curta

Existem quatro coisas úteis, e uma delas muda um requisito do app:

| # | Fonte | O que dá |
|---|---|---|
| 1 | **Billion Prices Project / Harvard Dataverse** | **microdados diários de preço online, produto a produto, com o Brasil incluído** — download livre |
| 2 | **BigDataCorp — estudos de Black Friday** | flutuação medida em **milhões de produtos** no e-commerce brasileiro, com **beleza destacada** |
| 3 | **Olist (Kaggle)** | 100 mil pedidos reais de e-commerce brasileiro, com preço, frete e categoria `beleza_saude` / `perfumaria` |
| 4 | **ONS (Reino Unido)** | metodologia pública e testada para construir índice de preço a partir de dado raspado |

**A descoberta que muda requisito:** na Black Friday brasileira, **beleza e perfumaria é a categoria com o maior desconto** — mas os preços **inflam entre um mês e duas semanas antes** do evento. O melhor momento de compra medido foi **fim de outubro / começo de novembro**, não a Black Friday. A RN-19 do jeito que está escrita hoje ("espere a Black Friday") pode dar o conselho errado. Detalhe na seção 6.

---

## 1. Billion Prices Project — microdados de preço online com o Brasil

Projeto criado no **MIT em 2008** para medir inflação a partir de preços coletados na internet. Em 2010 já coletava **5 milhões de preços por dia de mais de 300 varejistas em 50 países**.

**Os datasets estão publicados no Harvard Dataverse, para download livre.** Verifiquei a página de datasets — estes são os que incluem o Brasil:

| Dataset | Países | Período | Granularidade |
|---|---|---|---|
| **Online Micro Price Data** | 6 (Argentina, **Brasil**, Chile, Colômbia, Venezuela, EUA) | 2007–2010 | **preço diário, no nível do produto**, de 7 grandes varejistas |
| **Price Indices** | 8 (inclui **Brasil**) | 2007/2008–2015 | índices diários de preço, inflação mensal e anual |
| **Online–Offline Price Comparison** | 10 (inclui **Brasil**) | 2014–2016 | preço no nível do produto, **56 varejistas multicanal** |
| **Global Retailers Data** | 85 | 2008–2013 | preço diário de todos os produtos de 4 varejistas globais |
| **PPP Data** | 11 (inclui **Brasil**) | 2010–2017 | preço médio por trimestre, desagregado |

Complementarmente, o artigo **Cavallo (2018), "Scraped Data and Sticky Prices"** (*Review of Economics and Statistics*) tem [dados de replicação no Harvard Dataverse](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/IAH6Z6): preços diários de 7 grandes varejistas, **1 deles no Brasil**, com estatísticas de **duração e tamanho das mudanças de preço** em 181 varejistas de 31 países.

E o **Cavallo & Kryvtsov (2024), "Price discounts and cheapflation"** (*Journal of Monetary Economics*) tem [dados de replicação](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/NY7IP4) — é sobre **descontos**, exatamente o nosso assunto.

### Por que isso vale muito para o Aptum

Não é o preço do seu sérum. É melhor do que parece: é a **física do preço online no Brasil**.

Esses dados respondem perguntas que hoje eu chutei nos requisitos:

| Pergunta do projeto | O que o dado responde |
|---|---|
| **Com que frequência devo coletar?** (RNF-031) | com que frequência o preço online realmente muda — coletar 4× ao dia se o preço muda a cada 3 semanas é queimar dinheiro |
| **10% de queda é muito ou pouco?** (RN-05) | qual é a distribuição real do tamanho das mudanças de preço |
| **90 dias de janela é o certo?** (RN-03) | quanto tempo dura, em média, um preço até mudar |
| **Preço online e de loja física são iguais?** | o dataset Online–Offline responde direto — a pesquisa aponta que **42% dos preços eram idênticos no Brasil** |

⚠️ **Limitações honestas:** os dados vão até 2017, são de varejo geral (supermercado, não beleza) e o Brasil aparece com poucos varejistas. Servem para **calibrar parâmetros e metodologia**, não para dizer o preço de nada hoje.

---

## 2. BigDataCorp — flutuação medida no e-commerce brasileiro

Esta é a fonte mais próxima do que você pediu: **medição real, em escala, de como o preço se move no e-commerce brasileiro**.

### Estudo de 2023
- **Mais de 9 milhões de produtos**, **1,7 milhão de sites**, nas **8 semanas** anteriores à Black Friday.
- Preço médio **subiu ~3%** na Black Friday em relação a dois meses antes.
- **Mais de 55% dos produtos aumentaram de preço ou mantiveram** o preço anterior. Só ~45% tiveram desconto real.
- Empresas subiram preço **entre um mês e duas semanas antes** e depois "descontaram" sobre o preço inflado.
- **Melhor momento para comprar: fim de outubro / começo de novembro** — cerca de um mês antes da data.
- **Categorias com maior desconto:** **beleza e perfumaria (66%)**, games (62%), joias e bijuterias (46%), antiguidades (33%).
- Maiores **altas** pré-evento: celulares +214%, tablets +111%, artigos de festa +101%, eletrodomésticos +78%, colchões +70%.

### Estudo mais recente
- **27,6 milhões de produtos** monitorados em **2,1 milhões de sites**, também nas 8 semanas anteriores.
- Percentual de produtos com **queda** de preço na Black Friday: **45,59% em 2023 → 70,39% em 2024 → 64,22% em 2025**.
- Maiores altas na véspera: produtos infantis **+147,94%**, eletrodomésticos **+143,24%**.
- Maiores quedas no dia: **beleza e perfumaria −66,26%**, celulares −58,47%.

> **Nota de interpretação:** o "+3% na média" e o "beleza −66%" não se contradizem. O +3% é a média de **todas** as categorias; beleza é a categoria que mais cai. Ou seja: a Black Friday brasileira em geral é ruim — **mas beleza é a exceção**.

⚠️ **Ressalva importante:** são **estudos divulgados na imprensa**, não bases abertas. A BigDataCorp é empresa privada; a base bruta não é pública e a metodologia detalhada não foi publicada. Os números das duas edições diferem em escopo (9M vs 27,6M produtos), então **não são comparáveis entre si** — só dentro de cada estudo. Use como ordem de grandeza e como validação de direção, nunca como número exato dentro do produto.

---

## 3. Olist — dataset transacional de e-commerce brasileiro

O [Brazilian E-Commerce Public Dataset by Olist](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce) é o dataset brasileiro de e-commerce mais usado publicamente.

- **100 mil pedidos**, de **2016 a 2018**, em múltiplos marketplaces brasileiros.
- Traz: status do pedido, **preço**, **frete**, pagamento, localização do cliente, **atributos do produto**, categoria e avaliações.
- Inclui as categorias **`beleza_saude`** e **`perfumaria`** — que estão entre as maiores do dataset.

**Para que serve no Aptum:**

- **Sazonalidade de demanda** por categoria ao longo do ano — quando as pessoas compram beleza.
- **Peso do frete no preço final** — dado real para embasar a decisão D12 (frete fora do MVP). Se o frete for uma fração alta do pedido em beleza, o risco R3 é maior do que eu estimei.
- **Ticket médio** por categoria.
- **Taxonomia de categorias em português**, pronta.

⚠️ São **pedidos**, não série de preço do mesmo SKU no tempo. Não serve para flutuação de preço de um produto. E é de 2016-2018 — velho, mas estrutural.

---

## 4. ONS (Reino Unido) — metodologia pública para dado raspado

O instituto de estatística britânico raspa preços de varejistas online **desde maio de 2014** e publica **índices experimentais** e a metodologia, incluindo no [data.gov.uk](https://www.data.gov.uk/dataset/57449d7f-9b80-477a-b05b-4e3b55378764/research-indices-using-web-scraped-price-data).

Dois trabalhos são diretamente aplicáveis ao nosso problema:

- **CLIP** — *Clustering Large datasets Into Price indices*: agrupa produtos semelhantes por aprendizado de máquina e acompanha o preço do **cluster**, não do item. É exatamente o problema da RN-10 (similares) e da RN-11 (variantes).
- **Análise de rotatividade de produto em dados raspados de vestuário** e seu impacto no cálculo de índice. Vestuário tem o mesmo comportamento de beleza: **SKU some, muda de nome, muda de tom**. Este trabalho é sobre como manter uma série histórica coerente quando o produto não fica parado.

Também vale o artigo *[Tracking and Modelling Prices Using Web-Scraped Price Microdata](https://academic.oup.com/jrsssa/article/181/3/737/7072018)* (JRSS-A).

**Não é dado brasileiro nem de beleza.** É **metodologia testada por um instituto oficial** para o problema exato que o Aptum tem: construir série de preço confiável a partir de raspagem, com catálogo instável. Vale ler antes de congelar a RN-03.

---

## 5. Índices de e-commerce brasileiro (vendas, não preço)

O **[MCC-ENET](https://www.mccenet.com.br/indice-de-vendas-online)** é o índice do Comitê de Métricas da Câmara Brasileira da Economia Digital em parceria com **Neotrust | Movimento Compre & Confie**. Publica **faturamento do setor, ticket médio e percentual de vendas online**, nacional e regional. A Compre & Confie coleta 100% das vendas reais de boa parte do e-commerce brasileiro.

⚠️ É índice de **vendas**, não de preço. Serve para contexto e para a tela de descoberta — não alimenta o motor de alerta.

---

## 6. O que isso muda nos requisitos

Esta é a parte acionável.

### A7 — A RN-19 precisa modelar a **janela de inflação**, não só a data do evento

**Requisito atual:** o app recomenda esperar quando um evento se aproxima e há histórico de queda.

**O dado diz:** os preços sobem **entre um mês e duas semanas antes** da Black Friday, e o melhor momento de compra medido foi **fim de outubro / começo de novembro**.

**Consequência:** um usuário que abre o app em 5 de novembro e recebe "espere a Black Friday" pode estar sendo mandado para um preço **pior** do que o de duas semanas antes. A regra precisa de um terceiro estado:

| Momento | Recomendação |
|---|---|
| > 6 semanas antes do evento | preço normal — regra de alerta padrão |
| **4 a 2 semanas antes** | ⚠️ **"janela de inflação" — se está bom agora, compre agora**; o preço tende a subir antes de cair |
| Últimos dias e dia do evento | avaliar contra o preço **de antes da inflação**, nunca contra o preço da véspera |

Isso reforça e amplia a RF-037 (falsa promoção): a comparação não pode ser com os 30 dias anteriores se justamente esses 30 dias estão contaminados.

### A8 — Beleza é a melhor categoria possível para este app

Beleza e perfumaria foi a categoria de **maior desconto** na Black Friday nas duas edições do estudo (66% e −66,26%), enquanto a média geral do e-commerce foi de **alta** de 3%. A escolha do vertical está validada por dado.

### A9 — Calibrar frequência de coleta e limiares com o BPP

Os limiares que eu escrevi nos requisitos — queda de 10%, janela de 90 dias, P10 — foram escolha razoável, não medida. Os microdados do Billion Prices Project permitem **medir** a distribuição real de tamanho e duração das mudanças de preço online no Brasil e ajustar RN-03 e RN-05 com base em evidência.

### A10 — Verificar o peso do frete com o Olist

A decisão D12 (frete fora do MVP) foi tomada sem dado. O Olist tem frete por pedido em `beleza_saude` e `perfumaria`. Se o frete for uma fatia grande, o risco R3 sobe e a decisão merece revisão.

---

## 7. O que continua não existindo em base pública

| Falta | Situação |
|---|---|
| Série de preço por SKU em e-commerce brasileiro de beleza, recente | **não existe** — coleta própria ou fonte paga |
| Base aberta de descontos por categoria e data no Brasil | só estudos de imprensa (BigDataCorp), sem base bruta |
| Dado público de cupom com regras | não existe |
| Microdados do BPP após 2017 | descontinuado; o que veio depois é comercial (PriceStats) |

---

## 8. Ordem de uso recomendada

1. **Baixar os microdados do Billion Prices Project (Brasil)** e medir duração e tamanho das mudanças de preço. Sai um número para calibrar RN-03, RN-05 e a frequência de coleta — hoje são chutes.
2. **Baixar o Olist** e medir peso do frete e sazonalidade de demanda em `beleza_saude` e `perfumaria`. Revisita D12.
3. **Ler o material metodológico do ONS** (CLIP e rotatividade de produto) antes de fechar o desenho da série histórica.
4. **Registrar os números da BigDataCorp** como carga inicial de expectativa da RN-19 para a categoria beleza — rotulados como estudo de terceiro, confiança **Informativa**.
5. **Implementar a janela de inflação** (A7) — é correção de regra, não funcionalidade nova.

Nada disso exige acessar nenhuma loja.

---

## Fontes

- [The Billion Prices Project — Datasets](https://www.thebillionpricesproject.com/datasets/) · [Research](https://www.thebillionpricesproject.com/our-research/)
- [Cavallo, A. (2018) "Scraped Data and Sticky Prices" — dados de replicação, Harvard Dataverse](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/IAH6Z6) · [PDF do artigo](https://www.hbs.edu/ris/Publication%20Files/Cavallo_Alberto_J4_Scraped%20Data%20and%20Sticky%20Prices_eb55d968-c3ec-44e7-9d3e-8afd50603ec1.pdf)
- [Cavallo & Kryvtsov (2024) "Price discounts and cheapflation" — dados de replicação](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/NY7IP4)
- [Cavallo & Rigobon — The Billion Prices Project (NBER w22111)](https://www.nber.org/papers/w22111) · [AEA / JEP](https://www.aeaweb.org/articles?id=10.1257%2Fjep.30.2.151)
- [BigDataCorp — Black Friday: melhor momento para comprar é um mês antes](https://blog.bigdatacorp.com.br/black-friday-melhor-momento-para-comprar-e-um-mes-antes-aponta-pesquisa/)
- [E-Commerce Brasil — Black Friday tem aumento médio de preços de 3%](https://www.ecommercebrasil.com.br/noticias/pesquisa-black-friday-tem-aumento-medio-de-precos-de-3-em-relacao-aos-meses-anteriores)
- [InfoMoney — As categorias que ficaram mais caras antes da Black Friday](https://www.infomoney.com.br/consumo/tudo-pela-metade-do-dobro-veja-as-categorias-que-mais-aumentaram-precos-antes-da-black-friday/)
- [Kaggle — Brazilian E-Commerce Public Dataset by Olist](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce)
- [ONS — Research indices using web scraped price data (CLIP)](https://www.ons.gov.uk/economy/inflationandpriceindices/articles/researchindicesusingwebscrapedpricedata/clusteringlargedatasetsintopriceindicesclip) · [no data.gov.uk](https://www.data.gov.uk/dataset/57449d7f-9b80-477a-b05b-4e3b55378764/research-indices-using-web-scraped-price-data)
- [ONS — Product turnover in web scraped clothing data](https://www.ons.gov.uk/methodology/methodologicalpublications/generalmethodology/currentmethodologyarticles/analysisofproductturnoverinwebscrapedclothingdataanditsimpactonmethodsforcompilingpriceindices)
- [JRSS-A — Tracking and Modelling Prices Using Web-Scraped Price Microdata](https://academic.oup.com/jrsssa/article/181/3/737/7072018)
- [MCC-ENET — Índice de Vendas Online](https://www.mccenet.com.br/indice-de-vendas-online)
