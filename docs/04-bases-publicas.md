# Aptum — Bases de Dados Públicas

**Versão:** 0.1
**Data:** 05/09/2026
**Escopo desta pesquisa:** apenas **bases públicas e abertas**. Nenhum acesso a loja, endpoint de varejista ou coleta privada.
**Documentos irmãos:** [01-requisitos.md](./01-requisitos.md) · [02-historias-de-usuario.md](./02-historias-de-usuario.md) · [03-fontes-de-dados.md](./03-fontes-de-dados.md)

---

## Resposta curta

**Sim, existem — e são melhores do que eu esperava.** Três em particular:

| Base | O que é | Recência |
|---|---|---|
| **Preço da Hora / Menor Preço / Economiza Alagoas** (Secretarias da Fazenda) | preço **real transacionado**, por **código de barras**, extraído de nota fiscal eletrônica | **tempo real** |
| **IBGE / SIDRA — IPCA** | série mensal de preços por subitem, incluindo **perfume** e **higiene pessoal** | mensal, **desde 1979** |
| **IBGE — POF** | quanto a família brasileira gasta com higiene pessoal e cosméticos, com microdados | 2017-2018; nova edição em campo desde **nov/2024** |

**Mas nenhuma delas resolve o problema central do Aptum**, que é histórico de preço de **produto específico em loja online de beleza**. Isso não existe em base pública. A seção 9 é honesta sobre o buraco.

---

## 1. Bases estaduais de preço por nota fiscal — *a descoberta principal*

Várias Secretarias da Fazenda estaduais publicam preços extraídos de **NFC-e** (Nota Fiscal de Consumidor Eletrônica). Não é preço anunciado: é o preço **efetivamente cobrado**, porque vem do documento fiscal autorizado pela Sefaz no momento da venda.

| Estado | Serviço | Escala |
|---|---|---|
| **Bahia** | [Preço da Hora Bahia](https://precodahora.ba.gov.br/) | **mais de 500 mil itens**, mais de **200 mil estabelecimentos**, 650 mil downloads, 120 mil usuários/mês |
| **Paraná** | [Menor Preço — Nota Paraná](https://menorpreco.notaparana.pr.gov.br/) | mais de **60 mil estabelecimentos**, atualizado **em tempo real a cada venda** |
| **Alagoas** | [Economiza Alagoas](https://economizaalagoas.sefaz.al.gov.br/) | todos os municípios do estado, mais de 5 anos de operação |

**O que trazem:** preço, descrição do produto e **código de barras**, por estabelecimento e por localização.

**Por que é forte para o Aptum:**

- É a única fonte pública que liga **EAN → preço praticado → data**.
- Resolve o problema de "preço justo" com autoridade: é dado fiscal, não anúncio.
- Cobre exatamente as categorias que interessam — a Sefaz-BA divulga que o app é usado inclusive para achar **medicamentos** mais baratos, e a base é de produtos em geral, o que inclui higiene, perfumaria e cosméticos.
- Serve de **referência de mercado** para a RN-14 (valor de referência de item de kit) e para detectar preço suspeito na RN-12.

**⚠️ Três ressalvas honestas:**

1. **É varejo físico, não online.** NFC-e é emitida no ponto de venda. O MVP do Aptum é e-commerce. A base serve como **referência de preço de mercado**, não como oferta clicável.
2. **Não achei API pública oficial documentada.** Existem wrappers não oficiais publicados no GitHub ([igorpereirag/precodahora_api](https://github.com/igorpereirag/precodahora_api), [Pedneri1/precodahora-api](https://github.com/Pedneri1/precodahora-api)), mas eles consomem a **API privada** do app — o que é exatamente o tipo de acesso que a RNF-061 manda evitar. O caminho correto é **pedir acesso formal à Sefaz** ou verificar se há publicação em dados abertos do estado.
3. **Cobertura estadual**, não nacional. Bahia, Paraná e Alagoas foram as que encontrei; pode haver outras.

**Ação recomendada:** oficiar a Sefaz-BA e a Sefaz-PR pedindo acesso a dados abertos ou convênio. É gratuito, é dado público, e o pior que acontece é receber "não".

---

## 2. IBGE / SIDRA — IPCA — *a solução pública para a sazonalidade*

Esta é a resposta mais direta ao seu problema de "não vivemos nenhuma Black Friday ainda".

O IPCA acompanha preços por **grupo, subgrupo, item e subitem** — e higiene pessoal e **perfume** são subitens medidos individualmente. Existe série mensal longa e pública.

| Tabela SIDRA | Conteúdo | Período |
|---|---|---|
| [1737](https://sidra.ibge.gov.br/tabela/1737) | série histórica com número-índice | **desde dez/1979** |
| [7060](https://sidra.ibge.gov.br/tabela/7060) | variação mensal por grupo, subgrupo, item e **subitem** | a partir de jan/2020 |
| [1419](https://sidra.ibge.gov.br/tabela/1419) | mesma estrutura, período anterior | jan/2012 a dez/2019 |
| [6691](https://sidra.ibge.gov.br/tabela/6691) | número-índice e variações acumuladas | a partir de nov/2014 |

**API oficial e gratuita:** `api.sidra.ibge.gov.br`. Também há o conjunto [IPCA no dados.gov.br](https://dados.gov.br/dados/conjuntos-dados/ia-indice-nacional-de-precos-ao-consumidor-amplo-ipca).

**Por que isso importa tanto:** com as tabelas 1419 + 7060 dá para reconstruir **mais de uma década** de variação mensal de preço de perfume e higiene pessoal no Brasil — e daí extrair o **padrão sazonal real** da categoria. Em que meses o preço de perfumaria sobe? Em que meses cai? Novembro cai de verdade?

Isso alimenta a **RN-19 no nível "Informativa"** sem depender de Keepa, sem depender de loja nenhuma, e de graça. Não substitui o histórico por produto — mas transforma "não temos ideia" em "a categoria historicamente se comporta assim".

**Limitação:** é índice de categoria, não preço de produto. Não diz que o seu sérum caiu 34%; diz que perfumaria historicamente varia de tal forma em novembro.

---

## 3. IBGE — POF (Pesquisa de Orçamentos Familiares)

Pesquisa oficial sobre a composição do orçamento das famílias brasileiras, **com microdados públicos**.

- A POF tem um **caderno de despesa coletiva** que registra os gastos do domicílio com **artigos de higiene pessoal e limpeza durante 7 dias consecutivos**.
- Microdados da **POF 2017-2018** disponíveis no portal do IBGE.
- Já existe pesquisa acadêmica publicada usando exatamente esse recorte: *["Determinantes do consumo das famílias brasileiras em artigos de higiene pessoal, cosméticos e perfumaria"](https://periodicos.ufv.br/oikos/article/view/16043)*, baseada na POF 2017-2018.
- **Nova edição (2024-2025)** entrou em campo em **5 de novembro de 2024** — resultados devem sair em breve, o que renova a base.

**Uso no Aptum:** é a melhor fonte pública para calibrar **quanto uma família gasta** e **com que frequência compra** por categoria. Ajuda a estimar os valores padrão de ciclo de consumo da RN-06 — hoje o app depende da usuária adivinhar "dura 45 dias".

⚠️ POF mede **despesa**, não duração de embalagem. Dá para inferir frequência de compra, não o quanto dura um frasco de 400 ml.

---

## 4. Open Beauty Facts — catálogo aberto de cosméticos

Base colaborativa e aberta de cosméticos, sob **Open Database License** (conteúdo sob Database Contents License).

- Dumps gerados **todas as noites**, em JSONL e **Parquet** (consultável direto com DuckDB).
- API v2, com o campo `code` = EAN/UPC de 13 dígitos.
- Também publicada no [Kaggle](https://www.kaggle.com/datasets/openfoodfacts/openbeautyfacts) e no [data.gouv.fr](https://www.data.gouv.fr/datasets/open-beauty-facts).

**Não consegui apurar** quantos produtos brasileiros a base tem. Nenhuma fonte encontrada publica esse número. É medição de 30 minutos: baixar o dump e contar por país — mas é medição, não pesquisa, e você pediu para não sair acessando coisa por conta própria agora.

**Uso:** enriquecimento de catálogo e fallback de EAN. Grátis e licença permissiva, o que é raro.

---

## 5. ANVISA — cosméticos regularizados

Base oficial de produtos de higiene pessoal, cosméticos e perfumes regularizados no Brasil. Produtos são **registrados** (risco maior) ou **notificados** (risco menor); o número de processo começa com `25351`.

- Consulta: [consultas.anvisa.gov.br/#/cosmeticos/regularizados](https://consultas.anvisa.gov.br/#/cosmeticos/regularizados/)
- Busca por nome do produto, número do processo ou **CNPJ da empresa**

**❌ Não encontrei dataset em CSV no dados.gov.br** nem API pública documentada. É sistema de consulta web. Isso é uma limitação real, não uma suposição minha — procurei especificamente e não achei.

**Uso pretendido:** é a única fonte oficial que liga **marca ↔ empresa ↔ produto regularizado**, o que alimenta a RN-12 (autenticidade). Continua valiosa, mas o acesso programático precisa ser resolvido — provavelmente via pedido de dados abertos à própria Anvisa (Lei de Acesso à Informação).

---

## 6. Datasets abertos internacionais (Kaggle)

Existem e são recentes, mas são **estrangeiros**:

| Dataset | Conteúdo |
|---|---|
| [Sephora Products and Skincare Reviews](https://www.kaggle.com/datasets/nadyinky/sephora-products-and-skincare-reviews) | **8 mil produtos** e cerca de **1 milhão de avaliações** de skincare |
| [Luxxify: Ulta Makeup Reviews](https://www.kaggle.com/datasets/zarasarkar/makeup-insights-customer-reviews) | avaliações + detalhes de produto: preço, marca, categoria, descrição |
| [E-commerce Cosmetic Products](https://www.kaggle.com/datasets/devi5723/e-commerce-cosmetics-dataset) | **11 mil+ produtos** de Amazon, Flipkart, Sephora e Ulta |
| [Cosmetics datasets](https://www.kaggle.com/datasets/kingabzpro/cosmetics-datasets) | ingredientes e tipos de pele |

**Serventia real para o Aptum:** nenhuma para preço no Brasil. **Mas** são ótimos para o que é chato construir do zero — **taxonomia de categorias de beleza, vocabulário de tons, atributos de produto e mapa de ingredientes**. Isso economiza semanas de modelagem de catálogo (RF-014, RF-015).

⚠️ São **snapshots**, não séries temporais. E preço em dólar, mercado americano.

---

## 7. Dados de mercado setoriais — relatório, não banco de dados

A **ABIHPEC** publica os números do setor, mas em formato de release e relatório — não é base consultável.

**⚠️ E os números divergem entre fontes.** Registro a divergência em vez de escolher uma:

| Afirmação | Fonte |
|---|---|
| Brasil é o **3º maior mercado** mundial, movimentando **US$ 26,9 bilhões/ano**; projeção de +7,2% a.a. até 2027 | [ABIHPEC](https://abihpec.org.br/tamanho-mercado-cosmeticos-brasil-2026/) |
| Em 2025 o Brasil movimentou **R$ 242,3 bilhões** em beleza e higiene pessoal, **+11,2%**; o país é o **4º** no ranking global, atrás de EUA, China e Japão | [Nuvemshop, citando dados setoriais](https://www.nuvemshop.com.br/blog/mercado-de-beleza/) |
| Higiene pessoal, perfumaria e cosméticos estão presentes em **100% dos domicílios brasileiros** | idem |
| Exportações superaram **US$ 1 bilhão** pela primeira vez, atendendo 189 países | ABIHPEC |

3º ou 4º maior, US$ 26,9 bi ou R$ 242,3 bi — são metodologias e recortes diferentes (varejo vs. ex-fábrica, anos distintos). **Para uso na tela de descoberta, citar a fonte junto do número**, nunca o número solto.

---

## 8. Onde procurar mais

| Portal | O que tem |
|---|---|
| [dados.gov.br](https://dados.gov.br/) | portal nacional de dados abertos — tem o IPCA; vale varrer por "preço" e "consumo" |
| [SIDRA/IBGE](https://sidra.ibge.gov.br/) | todas as pesquisas do IBGE com API |
| Portais de dados abertos estaduais | onde as bases de NFC-e podem estar publicadas oficialmente |
| [Kaggle](https://www.kaggle.com/) e Hugging Face | datasets de produto e review |

---

## 9. O que **não** existe em base pública

Esta é a parte que interessa tanto quanto a lista acima.

| Falta | Consequência |
|---|---|
| **Histórico de preço de produto específico em e-commerce brasileiro de beleza** | é o coração do Aptum. Não há base pública. Ou coleta própria, ou fonte paga (Keepa, InfoPrice, Precifica) |
| **Cupons e suas regras** | nenhuma base pública. Só feeds de rede de afiliado — e mesmo eles não trazem marcas excluídas |
| **Catálogo brasileiro com tom/variante estruturado** | não encontrei nenhum, público ou aberto |
| **Desconto medido por categoria em datas promocionais** | Procon e Zoom publicam estudos pontuais, não série aberta |
| **Classificação de vendedor autorizado por marca** | não existe base pública. RN-12 vai depender de curadoria própria |
| **Duração de uso de embalagem** (quanto dura um shampoo 400 ml) | não achei base pública. POF chega perto, mas mede despesa |

---

## 10. O que dá para construir **só** com dado público

Sem tocar em nenhuma loja, hoje:

1. **Padrão sazonal da categoria beleza** — IPCA subitem perfume e higiene pessoal, mais de 10 anos de série. Habilita a RN-19 no nível **Informativa** e responde "qual o melhor mês para comprar perfume" com dado oficial.
2. **Referência de preço justo por EAN** — bases das Sefaz, se o acesso formal for concedido.
3. **Taxonomia e atributos de catálogo** — Open Beauty Facts + datasets do Kaggle.
4. **Perfil de gasto por categoria** — POF, para calibrar os padrões de ciclo de consumo.
5. **Números de mercado para a tela de descoberta** — ABIHPEC, com fonte citada.

Isso é bastante para o **conteúdo semente** da seção 6 do documento 03 — a usuária ter algo útil para ver antes de cadastrar o primeiro produto. Não é suficiente para o motor de alerta, que continua dependendo de série própria ou de fonte paga.

---

## 11. Ressalvas de acesso e licença

| Base | Licença / acesso | Cuidado |
|---|---|---|
| IBGE (SIDRA, POF) | público, API oficial gratuita | citar a fonte |
| dados.gov.br | dados abertos governamentais | verificar licença por conjunto |
| Sefaz BA / PR / AL | serviço público, **sem API oficial documentada** | ⚠️ não usar wrapper não oficial de API privada — pedir acesso formal |
| Open Beauty Facts | **ODbL** + Database Contents License | ODbL exige atribuição e pode exigir compartilhamento de derivados — **ler a licença antes de embutir no produto** |
| ANVISA | público, sem API | avaliar pedido via Lei de Acesso à Informação |
| Kaggle | varia por dataset | ⚠️ vários são raspados de sites — verificar licença individual antes de uso comercial |

A licença do Open Beauty Facts merece atenção jurídica antes de virar dependência: ODbL tem cláusula de *share-alike* que pode alcançar bases derivadas.

---

## Fontes

- [Preço da Hora Bahia](https://precodahora.ba.gov.br/faq) · [Sefaz-BA — sobre o app](https://www.sefaz.ba.gov.br/noticias/app-preco-da-hora-bahia-auxilia-consumidores-a-escolher-produtos-com-os-melhores-precos/) · [Sefaz-BA — medicamentos](https://www.sefaz.ba.gov.br/noticias/preco-da-hora-bahia-ajuda-a-encontrar-medicamentos-com-precos-mais-baixos/)
- [Menor Preço — Nota Paraná](https://menorpreco.notaparana.pr.gov.br/) · [Sefaz-PR — pesquisar preços](https://www.fazenda.pr.gov.br/servicos/Programas/Nota-Parana-e-Menor-Preco/Pesquisar-precos-Menor-Preco-do-Nota-Parana-dYo9jKNL)
- [Economiza Alagoas](https://economizaalagoas.sefaz.al.gov.br/) · [Sefaz-AL — 5 anos do Economiza Alagoas](https://www.sefaz.al.gov.br/noticias/item/3113-sefaz-celebra-5-anos-do-economiza-alagoas)
- [SIDRA — Tabela 1737 (série desde 1979)](https://sidra.ibge.gov.br/tabela/1737) · [Tabela 7060](https://sidra.ibge.gov.br/tabela/7060) · [Tabela 1419](https://sidra.ibge.gov.br/tabela/1419) · [Tabela 6691](https://sidra.ibge.gov.br/tabela/6691)
- [dados.gov.br — IPCA](https://dados.gov.br/dados/conjuntos-dados/ia-indice-nacional-de-precos-ao-consumidor-amplo-ipca)
- [IBGE — POF 2017-2018](https://www.ibge.gov.br/estatisticas/sociais/saude/24786-pesquisa-de-orcamentos-familiares-2.html) · [POF — base de dados](https://ces.ibge.gov.br/apresentacao/portarias/200-comite-de-estatisticas-sociais/base-de-dados/1145-pesquisa-de-orcamentos-familiares.html)
- [Oikos — Determinantes do consumo das famílias brasileiras em higiene pessoal, cosméticos e perfumaria (POF 2017-2018)](https://periodicos.ufv.br/oikos/article/view/16043)
- [Open Beauty Facts — Data, API and SDKs](https://world.openbeautyfacts.org/data) · [no Kaggle](https://www.kaggle.com/datasets/openfoodfacts/openbeautyfacts) · [no data.gouv.fr](https://www.data.gouv.fr/datasets/open-beauty-facts)
- [Anvisa — Consulta a cosméticos regularizados](https://consultas.anvisa.gov.br/#/cosmeticos/regularizados/) · [Anvisa — como consultar](https://www.gov.br/anvisa/pt-br/sistemas/consulta-a-cosmeticos-regularizados)
- [Kaggle — Sephora Products and Skincare Reviews](https://www.kaggle.com/datasets/nadyinky/sephora-products-and-skincare-reviews) · [Luxxify Ulta](https://www.kaggle.com/datasets/zarasarkar/makeup-insights-customer-reviews) · [E-commerce Cosmetic Products](https://www.kaggle.com/datasets/devi5723/e-commerce-cosmetics-dataset) · [Cosmetics datasets](https://www.kaggle.com/datasets/kingabzpro/cosmetics-datasets)
- [ABIHPEC — Tamanho do mercado](https://abihpec.org.br/tamanho-mercado-cosmeticos-brasil-2026/)
- [Nuvemshop — Mercado de beleza no Brasil](https://www.nuvemshop.com.br/blog/mercado-de-beleza/)
