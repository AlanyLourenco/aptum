# Briefing para pesquisa aprofundada — Aptum

Cole o texto abaixo em uma ferramenta de deep research. Contexto do projeto em [03-fontes-de-dados.md](./03-fontes-de-dados.md).

---

## Prompt

Estou construindo um aplicativo mobile brasileiro chamado Aptum, focado em **produtos de beleza** (skincare, maquiagem, perfumaria, cabelo). A usuária cadastra os produtos que usa e quer usar; o app monitora preço nas lojas online, valida se os cupons das lojas realmente valem para aquele produto específico, e avisa quando comprar é o melhor negócio. Também precisa dizer quando vale **esperar** uma data promocional.

Preciso de uma pesquisa aprofundada, com fontes citadas e datas, sobre os oito pontos abaixo. Priorize dados brasileiros, números verificáveis e documentação técnica oficial. Quando não houver dado, diga que não há em vez de estimar.

### 1. Keepa — cobertura do Brasil
- O Keepa cobre `amazon.com.br` com que profundidade histórica? Desde quando?
- A cobertura da categoria Beleza é boa ou é concentrada em eletrônicos?
- É possível recuperar retroativamente o preço praticado nas Black Fridays de 2024 e 2025 no Brasil?
- Quais são os planos e o custo da API (tokens por minuto, limites, preço em euros/reais)?
- Existe alternativa com histórico retroativo de preços brasileiros fora da Amazon?

### 2. Ciclos de consumo de produtos de beleza
Quanto tempo dura, em uso doméstico típico, cada um destes — em dias, com a fonte:
- shampoo e condicionador 300–400 ml
- sérum facial 30 ml
- hidratante facial 50 g
- protetor solar facial 50 ml (uso diário)
- base líquida 30 ml
- máscara de cílios
- perfume 50 ml e 100 ml
- sabonete líquido corporal
Procure estudos de consumo, dados de fabricantes, pesquisas de mercado ou painéis de consumo (Kantar, NielsenIQ, ABIHPEC). Também: qual a frequência média de recompra por categoria no Brasil.

### 3. Feeds de cupom das redes de afiliados
Para **Lomadee, Awin, Afilio, Rakuten Advertising e ClickWise**, no Brasil:
- Qual o esquema de dados do feed/API de cupons? Liste os campos.
- O feed inclui **marcas excluídas**, **categorias excluídas**, **seller específico** e **valor mínimo**? Ou só código, valor e validade?
- Há documentação pública do esquema? Links diretos.
- Quais lojas de beleza brasileiras estão em cada rede (Época Cosméticos, Beleza na Web, Sephora, O Boticário, Natura, Drogasil, Panvel)?

### 4. Concorrência
- Que aplicativos ou serviços, no Brasil e no exterior, monitoram preço de produtos de beleza e avisam o usuário?
- Algum deles valida se um cupom é elegível para um produto específico **antes** do checkout? Como funciona?
- Comparar: Zoom, Buscapé, Promobit, Pelando, Cuponomia, Méliuz, Keepa, CamelCamelCamel, Honey/PayPal Honey, e apps internacionais de beleza.
- Por que a validação de elegibilidade de cupom parece não existir? É limitação técnica, jurídica ou comercial?
- Algum app faz previsão sazonal recomendando **esperar** uma data promocional?

### 5. Profundidade real de desconto em beleza no Brasil
Números medidos, por data promocional, na categoria beleza/perfumaria:
- Black Friday (2022 a 2025): desconto médio real, não anunciado
- Dia das Mães, Dia dos Namorados, Dia do Consumidor, Natal, Boti Week
- Estudos de "preço maquiado" / "metade do dobro" com metodologia e amostra
- Fontes possíveis: Zoom, Promobit, Confi Neotrust, Ibevar, Procon-SP, Reclame Aqui, ABComm

### 6. ANVISA — dados abertos de cosméticos
- Existe dataset baixável de cosméticos regularizados em dados.gov.br ou no portal da Anvisa?
- Há API pública documentada, ou só a consulta web em `consultas.anvisa.gov.br`?
- Qual o formato e a frequência de atualização?
- É possível cruzar marca, fabricante/importador e produto regularizado a partir dela?

### 7. Bases de catálogo de produtos
- **Bluesoft Cosmos**: planos, preços, limites de requisição, e qualidade real da cobertura em cosméticos e perfumaria (não em mercearia).
- **GS1 Brasil / Cadastro Nacional de Produtos**: custo e condições de acesso.
- **Open Beauty Facts**: qual a cobertura de produtos brasileiros? Quantos itens com EAN nacional?
- Existe base específica de cosméticos brasileira com **tom/variante** estruturado?

### 8. Jurídico e conformidade
- Jurisprudência brasileira sobre **raspagem de dados de preço** em sites de e-commerce. Há decisões relevantes?
- O que o CDC e as normas de publicidade exigem de quem exibe preço de terceiro (comparadores)?
- Uso de nome de marca, imagem de produto e preço por comparadores: limites de direito autoral e marcário.
- LGPD: a lista de produtos de beleza de uma pessoa (incluindo tratamento de acne, queda de cabelo, dermocosméticos) pode ser considerada **dado sensível de saúde**? Qual o entendimento da ANPD?
- Riscos de sinalizar um vendedor como "não confiável" ou um produto como possível falsificação.

---

## Formato pedido

Para cada ponto: resposta direta, número quando houver, fonte com link e data. Separe claramente **fato verificado** de **estimativa**. No fim, liste o que **não** foi possível descobrir.
