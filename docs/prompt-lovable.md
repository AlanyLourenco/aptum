# Prompt para o Lovable — Aptum (demonstração visual)

> Copie tudo abaixo da linha e cole no Lovable.

---

# Aptum — protótipo visual de app mobile

Quero uma **demonstração visual estática** de um app mobile de beleza. Sem backend, sem autenticação, sem banco de dados, sem estado, sem formulário que funcione. Todo conteúdo escrito direto no código.

React + Tailwind, mobile-first, largura de 390px. Uma navegação simples entre as telas só para eu poder passar de uma para a outra. Texto em português do Brasil, valores em R$.

O app monitora preço de produtos de beleza e avisa quando está barato. É só isso que você precisa saber para desenhar — o resto é composição.

---

## Identidade

**Não use o tema padrão do shadcn.** Sobrescreva tudo.

### Paleta

```
Fundo de marca      #1E1226   ameixa muito escura
Superfície escura   #2A1A34
Borda no escuro     #3E2A4B

Creme               #F5F1F4   fundo das telas claras
Creme 2             #EBE3EB
Borda no claro      #DAD0DC

Texto sobre ameixa  #F4EFF6  /  secundário #CBBFD6
Texto sobre creme   #1F1626  /  secundário #4E4459

Gradiente da marca  linear-gradient(145deg, #EDE7F2, #C5B6D2 46%, #7E6A90)
```

Cores de sinal, usadas **só** onde carregam significado:

```
Azul   #1F5FA8  sobre #E1EBF7   preço caiu
Vinho  #94254A  sobre #F6E3E9   preço subiu
Verde  #256A4C  sobre #E0F0E8   cupom vale
Âmbar  #7C5C10  sobre #F7EDD8   cupom talvez
Cinza  #6B6076  sobre #EAE4EB   cupom não vale
```

Duas cores estruturam tudo: **ameixa e creme**. Nada de cor decorativa.

### Tipografia

- **Manrope** — toda a interface, pesos 400/500/600/700
- **Newsreader** — preços grandes e frases de destaque, com itálico
- **Jost** — só o letreiro "APTUM", caixa alta, espaçamento 0.2em. Em mais nenhum lugar
- **IBM Plex Mono** — só números em coluna, com tabular-nums

Regras rígidas: nada abaixo de 11px; texto corrido a partir de 14px; peso 300 proibido; caixa alta só em rótulo de seção.

### Forma

- Cantos: cartão 18px, tela 32px, botão e chip em pílula
- **Folha creme subindo por cima de um cabeçalho ameixa**, canto superior arredondado, sobreposição de −26px. Estrutura de quase toda tela
- **Vidro fosco** (blur 18px, fundo rgba(26,15,34,.66)) sobre as áreas de gradiente
- **Navegação flutuante em pílula**, descolada do rodapé
- **Grade bento** — cartões de tamanhos diferentes, alguns ocupando duas colunas
- Imagens de produto: blocos de gradiente suave com a inicial em serifada. Não busque imagem externa

---

## Evite

A versão anterior deste protótipo ficou com cara de gerada por IA. Não faça:

- Tema shadcn sem customizar · fonte Inter ou Space Grotesk
- Emoji como ícone
- Tudo centralizado
- Todos os cartões do mesmo tamanho, mesmo raio, mesma sombra, em grade regular
- Hero com número gigante, rótulo pequeno e gradiente atrás
- Barra de acento colorida na lateral de cartão arredondado
- Ilustração genérica de empty state com personagem
- Lorem ipsum ou texto em inglês

No lugar: hierarquia por **tamanho e peso de tipo**, não por caixa. Assimetria proposital. Densidade diferente entre seções. Sombra em um lugar só.

---

## As telas

### 1 · Abertura
Fundo ameixa cheio. Monograma "A" em gradiente prata-lilás, centralizado. Letreiro APTUM em Jost abaixo. Três botões empilhados no rodapé.

### 2 · Onboarding — 3 telas
Uma frase por tela, em Newsreader grande, sobre ameixa com gradiente radial saindo do canto superior esquerdo. Indicador de passo em traços finos horizontais.

### 3 · Minhas listas
Cabeçalho ameixa curto. Folha creme com cartões de lista empilhados: nome, contagem, e três miniaturas de produto em fila. Um cartão pontilhado no fim para criar lista nova.

### 4 · Lista aberta *(a tela principal)*
Cabeçalho ameixa com saudação em Newsreader e uma linha de contexto abaixo. Folha creme por cima com dois grupos de itens separados por rótulo de seção. Cada item: miniatura em gradiente à esquerda, nome em duas linhas, variante, preço em Newsreader, preço por ml em mono ao lado, e um ou dois chips coloridos. Navegação flutuante embaixo com quatro ícones.

### 5 · Buscar produto
Campo de busca em pílula no topo. Lista de resultados: miniatura, nome, marca, tamanho, preço. Duas alternativas em destaque abaixo do campo: escanear código de barras e colar link.

### 6 · Escolher o tom
Indicador de 4 passos em traços. Pergunta em Newsreader. Grade de 6 amostras de tom em 3 colunas — cada uma com um bloco de cor, o código em mono e o nome abaixo. Uma amostra selecionada com borda grossa. Abaixo, dois cartões de tom vizinho em linha, cada um com bolinha de cor, nome, preço e um chip de ação.

### 7 · Configurar o item
Formulário visual (não funcional): escolher lista, campo de preço-alvo, e quatro chips de duração — mensal, bimestral, trimestral, semestral. Botão largo embaixo.

### 8 · Escanear
Visor de câmera simulado — retângulo escuro com moldura de cantos em gradiente e uma linha de leitura. Texto de instrução abaixo.

### 9 · Ficha do produto
Área de gradiente de 236px no topo com a inicial do produto grande e translúcida. **Painel de vidro fosco** ancorado no rodapé dessa área, com nome em Newsreader, marca, e três chips. Folha creme abaixo: preço grande em Newsreader com chip de variação ao lado; lista de quatro lojas, a primeira com fundo azul-claro destacando que é a melhor, cada linha com nome da loja, formato e horário à esquerda e dois preços empilhados à direita; um cartão **escuro** com quatro pares de dado em duas colunas e um gráfico de linha simples; botão em gradiente.

### 10 · Cupom — três variações
Cabeçalho ameixa com o código do cupom em mono grande. Folha creme com: selo colorido em pílula no topo, preço grande na cor do selo, e uma lista de condições — cada linha com um símbolo (✓, ?, ✕) e um texto. Faça as três variações: **vale** (verde, cinco linhas de check), **talvez** (âmbar, uma interrogação no meio dos checks), **não vale** (cinza, um X e um cartão extra sugerindo outro cupom). Um seletor no topo para alternar entre elas.

### 11 · Alerta "Compre agora"
Cabeçalho ameixa com frase em Newsreader e itálico. Folha creme: cartão do produto com miniatura, divisória, e preço grande; cartão de três razões com checks verdes; cartão **escuro** com quatro pares de dado; caixa de código pontilhada em lilás claro; botão em gradiente.

### 12 · Alerta "Segure a compra"
Mesma estrutura, com dois chips de contexto no cabeçalho. Um cartão de atenção com borda âmbar contendo texto e um **gráfico esquemático pequeno**: linha reta que sobe, depois despenca, com uma faixa âmbar destacando o trecho de subida. No fim, um cartão claro com a melhor oferta atual e um botão de contorno.

### 13 · Tela bloqueada com notificações
Fundo em gradiente radial ameixa. Relógio grande em Newsreader centralizado. Três cartões de notificação em **vidro fosco claro** empilhados, cada um com ícone quadradinho da marca, nome, horário e duas linhas de texto. Opacidade decrescente do primeiro para o terceiro.

### 14 · Centro de alertas
Folha creme com lista de avisos anteriores. Linha do tempo simples com data agrupando os itens.

### 15 · Economia *(grade bento)*
Cabeçalho ameixa com valor grande em Newsreader itálico. Folha creme com grade de duas colunas onde os cartões têm tamanhos diferentes: um cartão escuro largo no topo, dois quadrados médios lado a lado (um deles com fundo em gradiente lilás), um cartão largo com três barras horizontais de progresso, dois quadrados pequenos — **um deles com valor negativo em vinho** — e um cartão escuro largo no fim com uma frase em Newsreader itálico.

### 16 · Histórico de compras
Lista simples agrupada por mês. Cada linha: data, loja, nome do produto, preço pago e preço por unidade alinhados à direita em mono.

### 17 · Perfil
Cabeçalho ameixa com avatar circular, nome em Newsreader e um chip de plano. Folha creme com blocos de acesso em lista, separados por divisórias finas — não por cartões.

### 18 · Configurar notificações
Lista de controles: um seletor numérico, dois campos de horário, três chips de sensibilidade em fila, e interruptores. Visual apenas.

### 19 · Planos
Dois cartões lado a lado ou empilhados: um creme (gratuito), um **ameixa escuro** (pago) com o gradiente da marca no topo. Lista de itens com check em cada um.

### 20 · Privacidade
Texto explicativo e três interruptores separados por divisórias. Dois botões de contorno no fim.

### 21 · Meus cupons
Campo para colar um código no topo, em pílula pontilhada. Abaixo, lista de cupons, cada um com código em mono, loja, e o selo de estado à direita.

### 22 · Estados vazios
Uma tela mostrando dois exemplos de lista vazia. Sem ilustração — só uma frase curta em Newsreader e um botão de contorno.

---

Faça as telas em ordem. Se for muito para uma vez só, entregue da 1 à 10 primeiro e eu peço o resto.
