# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

O produto final é um app nativo para Android e iOS (React Native / Expo, decisão D8 em `docs/01-requisitos.md`). Android é o mercado primário — Brasil. O artefato atual em produção é um **protótipo visual em HTML** que representa essas telas; ele não é o produto, é a maquete dele.

## Stack

Produto: React Native / Expo, Android + iOS. Push via Expo Notifications sobre FCM/APNs.

Protótipo atual: HTML + CSS estático, sem framework, sem backend, sem estado. Escolha registrada porque o pedido é explicitamente "demonstração visual sem backend".

## Users

**Alany — a rotina montada** (primária). Mulher brasileira que mantém uma rotina de skincare e cabelo definida, recompra as mesmas marcas em ciclos previsíveis, compra online, é sensível a preço mas não tem tempo de caçar promoção todo dia. O trabalho dela: nunca mais pagar caro em algo que sabia que ia precisar.

**A entusiasta** (secundária). Acompanha lançamento, mantém lista de desejo grande, estoca quando está barato, participa de grupo de promoção. O trabalho dela: comprar o produto caro no melhor preço do ano.

**Operador de catálogo** (interna). Time do Aptum que cura catálogo, variantes, vendedores e regras de cupom.

A dor que originou o produto, nas palavras da fundadora: ter um cupom na mão e descobrir só no fim da compra que ele não vale para o produto dela.

## Product Purpose

O Aptum vigia preço e cupom dos produtos de beleza que a usuária já usa e dos que ela quer usar, e só a chama quando comprar naquele momento é comprovadamente o melhor negócio — com o cupom já validado para o produto e a variante exatos.

Sucesso: a usuária compra no melhor momento em vez de no momento urgente, e nunca mais monta um carrinho para descobrir no checkout que o cupom não serve.

## Positioning

Três camadas que um vizinho não copia de graça:

1. **Elegibilidade de cupom.** O app modela as regras do cupom — marca, categoria, vendedor, valor mínimo, itens excluídos — e responde "esse cupom vale pro meu item?" antes do checkout. Nenhum comparador brasileiro faz isso.
2. **Preço efetivo por unidade.** Normaliza frasco, refil, tamanho travel, kit e promoção progressiva pela unidade de uso, já com o cupom aplicado.
3. **Janela de reposição.** Cruza "está barato" com "você vai precisar", usando o histórico de consumo da própria usuária — dado proprietário.

O vertical de beleza está validado por dado: na Black Friday brasileira, beleza e perfumaria é a categoria de maior desconto, enquanto a média do e-commerce sobe.

## Operating Context

Compra 100% online. Quatro frentes de loja: varejo de beleza especializado, marcas diretas, marketplaces, farmácia e dermocosmético. O checkout acontece sempre **na loja**, nunca dentro do Aptum — o app encaminha por deep link com o cupom copiado.

Categorias: skincare, maquiagem, perfumaria, cabelo, corpo e banho.

A usuária mantém listas: reposição ("Minha rotina"), desejo, e listas que ela cria.

## Capabilities and Constraints

**Confirmado no produto**

- Duas ou mais listas, com regra de alerta distinta por tipo (reposição cruza preço com consumo; desejo dispara só no mínimo histórico ou no preço-alvo).
- Variante é entidade de primeira classe. Tom de base, fragrância, tamanho. A usuária monitora uma variante específica e pode aprovar tons vizinhos.
- Três estados de cupom: **Vale**, **Talvez**, **Não vale**, cada um com o motivo em linguagem simples. Push só no estado "Vale".
- Preço sempre acompanhado do preço por ml, g ou unidade. Ordenação de loja sempre por preço por unidade.
- Autenticidade: em perfumaria e maquiagem, só vendedor oficial, autorizado ou confiável gera alerta.
- Promoção progressiva ("leve 3 pague 2") e kit são decompostos e explicados.
- Calendário sazonal com recomendação de esperar, travada pela data de reposição: o app nunca manda esperar se o produto for acabar antes.
- Teto de 3 avisos por dia, intervalo mínimo de 48 h por produto, horário de silêncio.
- Plano gratuito: 15 itens somando todas as listas, verificação a cada 12 h.

**Fora do escopo, por decisão**

- **Carrinho e pagamento.** O app não processa compra. No lugar, a usuária marca itens como "vou levar" e o app agrupa por loja com o total — ela vai para a loja com a lista pronta.
- **Frete** no cálculo do preço (decisão D12). Toda tela de compra precisa declarar que o preço não inclui frete.
- **Cashback e programas de fidelidade** (D13).
- **Validade e prazo após aberto** na sugestão de estoque (D15, risco aceito).
- Lojas físicas, encartes, lista compartilhada, categorias fora de beleza.

**Estrutura de navegação confirmada**

- A tela inicial abre com **vitrine geral de promoções de beleza** e a lista da usuária logo abaixo.
- Organização por **categoria de beleza**, por **estado de oportunidade** (em promoção, tem cupom, vai acabar, no preço-alvo) e **por lista**.

## Brand Commitments

**Nome:** Aptum. Latim para "apto, adequado, que serve" — o que serve para você.

**Logo:** `Logo.png` na raiz. Monograma "A" em gradiente prata-lilás sobre ameixa muito escura, com letreiro geométrico de traço fino em caixa alta e espaçamento largo.

**Cores da marca, extraídas da logo:** ameixa `#1E1226`, gradiente `#EDE7F2 → #C5B6D2 → #7E6A90`.

**Referências de UI que a fundadora deu como vinculantes** (`ui_ux referencias.pdf`, 5 páginas): vidro fosco sobre imagem, cantos muito arredondados, paleta de duas cores (uma escura de marca + creme), grade bento, serifada misturada com geométrica, chips de metadado, folha de conteúdo subindo por cima da imagem, navegação flutuante em pílula.

**Referência de estrutura de app de produto:** captura do app da Riachuelo. O que a fundadora quer dessa referência: produto como herói, grade de produto com foto, preço cortado e preço novo, selo de desconto, coração de favoritar, barra de filtro e ordenação, abas de categoria roláveis, banner promocional, e "Cupons" como aba própria na navegação inferior.

**Voz:** direta, como uma amiga que entende de preço. "Compre agora", "Segure", "Esse cupom não serve pro seu produto". Sem jargão de marketing. Erro explica o que aconteceu e como resolver, sem pedir desculpas.

**Rejeitado explicitamente pela fundadora:** interface que pareça painel de métricas ou ferramenta de análise. Métricas existem, mas em segundo plano — nunca como tela principal. E qualquer coisa com "cara de IA".

## Evidence on Hand

- `docs/01-requisitos.md` — 119 requisitos funcionais, ~60 não funcionais, 19 regras de negócio, 22 decisões travadas.
- `docs/02-historias-de-usuario.md` — 55 histórias em 13 épicos, com critérios de aceitação.
- `docs/03-fontes-de-dados.md`, `docs/04-bases-publicas.md`, `docs/05-dados-ecommerce-flutuacao.md` — pesquisa de fontes de preço e cupom.
- `docs/06-coleta-de-dados.md` — arquitetura de coleta.
- `Logo.png`, `ui_ux referencias.pdf` — identidade e referências visuais.

**Não existe ainda, e não pode ser inventado:** nenhum dado real de preço foi coletado. Nenhuma loja foi integrada. Nenhum usuário real usou o produto. Não há métrica de uso, avaliação, número de downloads nem depoimento. Todo preço, cupom, produto e nome de loja em qualquer protótipo é fictício e precisa estar rotulado como tal.

## Product Principles

1. **Na dúvida, não alertar.** Alerta perdido custa uma oportunidade; alerta falso custa uma usuária. Cupom só é "Vale" quando todas as condições foram verificadas.
2. **O produto é o herói.** A usuária vem ver produto e preço, não gráfico. Número analítico serve à decisão de compra, nunca ocupa o lugar dela.
3. **Todo preço é comparável.** Preço por unidade sempre ao lado do preço cheio, senão a comparação é mentira.
4. **Honestidade acima de conversão.** Frete declarado, link de afiliado rotulado, ranking nunca alterado por comissão, economia negativa mostrada quando existe.
5. **A variante certa ou nada.** Alertar o tom errado é tão ruim quanto alertar o cupom errado.

## Accessibility & Inclusion

WCAG 2.1 AA. Alvo de toque mínimo de 44 pt. Suporte a leitor de tela e fonte ampliada até 200%.

Duas exigências específicas deste produto:

- **Tom de cor nunca é o único identificador de variante.** Sempre acompanhado de código e nome ("3.5 Bege Médio") — por daltonismo e por leitor de tela.
- **A lista de produtos revela dado sensível de saúde** (tratamento de acne, queda de cabelo, dermocosmético com indicação clínica). A notificação precisa poder ocultar o nome do produto na tela bloqueada.
