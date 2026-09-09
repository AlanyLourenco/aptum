# Aptum — Histórias de Usuário

**Versão:** 0.2 — foco em **beleza e cuidado pessoal**
**Data:** 05/09/2026
**Documento irmão:** [01-requisitos.md](./01-requisitos.md)

---

## Como ler este documento

> **Como** \<persona\>, **quero** \<ação\>, **para** \<benefício\>.

Critérios de aceitação em Gherkin (**Dado / Quando / Então**) — é o que o time de teste executa.

- **Pri**: M (Must / MVP) · S (Should) · C (Could)
- **Est**: pontos (Fibonacci: 1, 2, 3, 5, 8, 13)
- **RF / RN**: requisitos e regras cobertos

Personas: **Alany** (rotina montada, primária) · **A entusiasta** (secundária) · **Operador** (interna).

---

## Mapa de épicos

| # | Épico | Pergunta que responde | Pri |
|---|---|---|---|
| E1 | Entrar e começar | "Como eu começo sem fricção?" | M |
| E2 | Minha rotina | "Como digo o que eu uso — e em qual tom?" | M |
| E3 | Minha lista de desejo | "E o que eu ainda não uso mas quero?" | M |
| E4 | Preço comparável de verdade | "Frasco, refil, kit, leve 3 — qual sai mais barato por ml?" | M |
| E5 | **Cupom que realmente vale** | "Esse cupom serve pro MEU produto?" | M |
| E6 | Produto confiável | "Esse perfume barato é original?" | M |
| E7 | Reposição e estoque | "Vou precisar quando? Compro quantos?" | M |
| E8 | **Vale a pena esperar?** | "Compro agora ou seguro até a Black Friday?" | M |
| E9 | Alerta sem spam | "Me avise, mas não me encha" | M |
| E10 | Da notificação à compra | "Recebi o alerta, e agora?" | M |
| E11 | Minha economia | "Isso está valendo a pena?" | S |
| E12 | Confiança, privacidade e plano | "Posso confiar nesse app?" | M |
| E13 | Operação e catálogo | "Como mantemos o dado correto?" | M |

---

## E1 — Entrar e começar

### US-101 — Criar conta rápido
**Pri:** M · **Est:** 3 · **RF:** RF-001

> **Como** Alany, **quero** entrar com Google ou Apple, **para** não criar mais uma senha.

- **Dado** que estou na tela inicial, **quando** toco em "Continuar com Google", **então** autentico e chego em "Minha rotina" em até 10 segundos.
- **Dado** que já tenho conta por e-mail, **quando** entro com Google no mesmo e-mail, **então** as contas são vinculadas, sem duplicata.
- **Dado** que cancelo o login social, **quando** volto ao app, **então** continuo na tela inicial sem erro travado.

---

### US-102 — Experimentar antes de me cadastrar
**Pri:** S · **Est:** 5 · **RF:** RF-002

> **Como** Alany, **quero** adicionar meu primeiro produto sem criar conta, **para** entender o valor antes de me comprometer.

- **Dado** que abri o app pela primeira vez, **quando** busco e adiciono 1 produto, **então** ele é salvo localmente sem login.
- **Dado** que tenho 1 produto salvo sem conta, **quando** tento adicionar o segundo ou ativar notificações, **então** o app pede login explicando o motivo.
- **Dado** que faço login depois, **quando** a conta é criada, **então** o produto local migra sem perda.

---

### US-103 — Permitir notificações no momento certo
**Pri:** M · **Est:** 2 · **RF:** RF-003

> **Como** Alany, **quero** entender por que o app quer me notificar antes de pedir a permissão, **para** decidir com consciência.

- **Dado** que cadastrei meu primeiro produto, **quando** a tela seguinte aparece, **então** vejo a explicação ("só te avisamos quando estiver realmente barato") **antes** do diálogo nativo.
- **Dado** que neguei, **quando** vou às configurações do app, **então** tenho atalho para reativar no sistema.
- **Dado** que neguei, **quando** surge uma oportunidade, **então** ela aparece no centro de alertas mesmo sem push.

---

## E2 — Minha rotina

### US-201 — Buscar e adicionar um produto
**Pri:** M · **Est:** 5 · **RF:** RF-010, RF-011, RF-014

> **Como** Alany, **quero** buscar pelo nome o produto que sempre uso e colocá-lo na minha rotina, **para** o app começar a vigiar o preço.

- **Dado** que digito "sérum vitamina c creamy", **quando** a busca retorna, **então** vejo marca, linha, tamanho, imagem e o menor preço atual, em até 800 ms (p95).
- **Dado** que o produto existe em 30 ml e 60 ml, **quando** vejo os resultados, **então** cada tamanho aparece como opção distinta, com o preço por ml ao lado.
- **Dado** que toco em "Monitorar", **quando** escolho a lista (**rotina** ou **desejo**), **então** o item entra na lista escolhida e o monitoramento inicia imediatamente.
- **Dado** que a busca não encontra nada, **quando** vejo o vazio, **então** recebo as alternativas "escanear código de barras" e "colar link do produto".

---

### US-202 — Escolher o meu tom
**Pri:** M · **Est:** 8 · **RF:** RF-015, RF-016 · **RN:** RN-11

> **Como** Alany, **quero** dizer que uso a base **tom 3.5**, **para** não receber alerta de um tom que não me serve.

- **Dado** que adiciono um produto que tem tons, **quando** confirmo, **então** o app **exige** que eu escolha a variante antes de salvar.
- **Dado** que escolhi o tom 3.5, **quando** o tom 7.0 entra em promoção, **então** eu **não** recebo alerta.
- **Dado** que vejo a lista de tons, **quando** navego, **então** cada tom mostra **nome e código** ("3.5 Bege Médio"), nunca só a bolinha de cor.
- **Dado** que meu tom está esgotado em uma loja, **quando** abro o produto, **então** vejo "seu tom indisponível nesta loja" e não o preço de outro tom apresentado como se fosse o seu.

---

### US-203 — Aceitar tons vizinhos
**Pri:** S · **Est:** 5 · **RF:** RF-017 · **RN:** RN-11

> **Como** Alany, **quero** dizer que também sirvo no tom 3.0, **para** aproveitar promoção sem receber sugestão de tom que não é meu.

- **Dado** que monitoro o tom 3.5, **quando** abro "Também sirvo em", **então** vejo os tons adjacentes sugeridos, com preço atual de cada um.
- **Dado** que aprovo o tom 3.0, **quando** ele entra em promoção, **então** o alerta diz explicitamente *"tom 3.0 — você usa 3.5"*.
- **Dado** que não aprovei nenhum tom vizinho, **quando** um deles cai de preço, **então** não recebo alerta.
- **Dado** que removo a aprovação, **quando** confirmo, **então** aquele tom para de gerar alerta imediatamente.

---

### US-204 — Aceitar produtos similares
**Pri:** S · **Est:** 8 · **RF:** RF-018 · **RN:** RN-10

> **Como** Alany, **quero** dizer quais marcas equivalentes eu aceito, **para** aproveitar promoção de concorrente sem receber sugestão de coisa que eu não passaria no rosto.

- **Dado** que monitoro um protetor solar facial, **quando** abro "Aceito também", **então** vejo até 5 sugestões da mesma função e faixa de FPS, com preço por ml comparável.
- **Dado** que aprovo um similar, **quando** ele entra em promoção, **então** o alerta identifica claramente que é **similar aprovado**, não o item original.
- **Dado** que não aprovei similares, **quando** um similar cai de preço, **então** não recebo alerta.

---

### US-205 — Cadastrar pelo código de barras
**Pri:** S · **Est:** 5 · **RF:** RF-012

> **Como** Alany, **quero** escanear o que já tenho na bancada, **para** cadastrar sem digitar.

- **Dado** que autorizo a câmera, **quando** aponto para um EAN-13, **então** o produto é identificado em até 3 segundos, **já com a variante correta** quando o EAN for específico do tom.
- **Dado** que o EAN não existe no catálogo, **quando** a leitura conclui, **então** posso cadastrar informando marca, nome, tamanho e tom, e o item vai para curadoria.
- **Dado** que nego a permissão de câmera, **quando** tento escanear, **então** recebo instrução de como liberar e a opção de buscar por texto.

---

### US-206 — Definir meu preço-alvo
**Pri:** M · **Est:** 3 · **RF:** RF-020, RF-099

> **Como** Alany, **quero** dizer "me avise abaixo de R$ 89", **para** ter controle do que considero barato.

- **Dado** que edito um item, **quando** informo o preço-alvo, **então** ele é salvo e a ficha mostra a distância até o alvo.
- **Dado** que informo um alvo abaixo do mínimo histórico de 12 meses, **quando** salvo, **então** o app avisa "esse preço nunca foi praticado" mas permite salvar.
- **Dado** que o preço atinge o alvo, **quando** a coleta detecta, **então** recebo notificação **independentemente** dos demais gatilhos.

---

### US-207 — Pausar, mover ou remover
**Pri:** M · **Est:** 3 · **RF:** RF-021

> **Como** Alany, **quero** pausar ou mover um item entre as listas, **para** ajustar sem perder o histórico.

- **Dado** que pauso um item, **quando** há oportunidade nele, **então** não recebo alerta, mas o histórico continua sendo coletado.
- **Dado** que movo um item de desejo para rotina, **quando** confirmo, **então** o histórico acompanhado é preservado e o app pede o ciclo de consumo.
- **Dado** que removo por engano, **quando** toco em "Desfazer" (até 10 s), **então** o item volta com todas as configurações.

---

## E3 — Minha lista de desejo

### US-301 — Ter uma lista de desejo separada
**Pri:** M · **Est:** 5 · **RF:** RF-011, RF-097 · **RN:** RN-18, RN-05b

> **Como** a entusiasta, **quero** uma lista para o que eu **quero** comprar (o perfume novo, o sérum caro), separada do que eu **preciso** repor, **para** os avisos fazerem sentido em cada caso.

- **Dado** que adiciono um item à lista de desejo, **quando** ele é salvo, **então** o app **não** me pede ciclo de consumo.
- **Dado** que tenho um item na lista de desejo, **quando** o preço bate o mínimo dos últimos 180 dias ou o meu preço-alvo, **então** recebo alerta.
- **Dado** que tenho um item na lista de desejo com preço caindo 8%, **quando** o motor avalia, **então** eu **não** recebo alerta — desejo só dispara no melhor preço ou no alvo.
- **Dado** que abro o app, **quando** vejo a tela inicial, **então** as duas listas estão visualmente separadas e cada item mostra por que está sendo monitorado.

---

### US-302 — Transformar desejo em rotina
**Pri:** S · **Est:** 3 · **RF:** RF-098

> **Como** Alany, **quero** que um produto que eu comprei da lista de desejo vire item de reposição, **para** o app começar a contar quando ele vai acabar.

- **Dado** que registro a compra de um item da lista de desejo, **quando** confirmo, **então** o app pergunta se quero movê-lo para a rotina e pede a duração estimada.
- **Dado** que aceito mover, **quando** o item vai para a rotina, **então** todo o histórico de preço acompanhado é preservado e a janela de reposição começa a contar da data da compra.

---

## E4 — Preço comparável de verdade

### US-401 — Comparar lojas pelo preço por ml
**Pri:** M · **Est:** 8 · **RF:** RF-031, RF-034, RF-035 · **RN:** RN-02, RN-09

> **Como** Alany, **quero** ver as lojas ordenadas pelo preço por ml já com o cupom, **para** não me enganar com frasco maior ou desconto de fachada.

- **Dado** que abro a ficha de um produto, **quando** vejo a lista de lojas, **então** cada linha mostra preço do anúncio, cupom aplicável, **preço por ml/g** e a ordenação é por preço por ml crescente.
- **Dado** que uma loja tem frasco maior e preço absoluto maior, **quando** o preço por ml é menor, **então** ela aparece **em primeiro**.
- **Dado** que uma oferta tem link de afiliado, **quando** ela é exibida, **então** tem rótulo visível **e** sua posição não muda por causa disso.
- **Dado** que o preço foi coletado há mais de 6 h, **quando** vejo a oferta, **então** aparece "coletado há X h — pode ter mudado".
- **Dado** que vejo qualquer preço, **quando** olho a tela, **então** há a informação de que **o frete não está incluído**.

---

### US-402 — Comparar refil e tamanhos
**Pri:** M · **Est:** 5 · **RF:** RF-019, RF-036 · **RN:** RN-16

> **Como** Alany, **quero** ver se o refil compensa, **para** economizar sem descobrir depois que precisava do frasco.

- **Dado** que o produto tem frasco e refil, **quando** abro a comparação, **então** os dois aparecem na mesma escala de ml, com o refil rotulado **"refil — precisa do frasco"**.
- **Dado** que nunca comprei o frasco daquele produto, **quando** o refil está mais barato, **então** o app avisa que preciso do frasco antes de sugerir o refil.
- **Dado** que já registrei a compra do frasco, **quando** o refil entra em promoção, **então** ele é tratado como oferta normal.
- **Dado** que existe tamanho travel de 30 ml, **quando** vejo a comparação, **então** ele aparece com o preço por ml real — quase sempre o pior, e o app não esconde isso.

---

### US-403 — Entender "leve 3 pague 2"
**Pri:** M · **Est:** 8 · **RF:** RF-070, RF-071 · **RN:** RN-13

> **Como** Alany, **quero** saber quanto custa por ml na promoção progressiva, **para** decidir se vale levar a quantidade exigida.

- **Dado** que há uma promoção "leve 3 pague 2", **quando** vejo a oferta, **então** ela mostra os dois cenários: *"R$ 36/100 ml levando 1 · R$ 24/100 ml levando 3"*.
- **Dado** que recebo um alerta de promoção progressiva, **quando** leio o push, **então** ele informa **a quantidade necessária** no próprio texto.
- **Dado** que a quantidade exigida é maior que a minha sugestão de estoque, **quando** vejo a oferta, **então** o app mostra os dois cenários e **não** empurra o maior.
- **Dado** que a promoção exige itens de marcas diferentes, **quando** apenas um deles está nas minhas listas, **então** a promoção não é considerada no cálculo.

---

### US-404 — Saber se o kit compensa
**Pri:** M · **Est:** 8 · **RF:** RF-072, RF-073 · **RN:** RN-14

> **Como** Alany, **quero** saber se o kit com o meu produto vale a pena, **para** não pagar por três coisas que eu não uso.

- **Dado** que existe um kit contendo o meu produto, **quando** abro a oferta, **então** vejo a lista dos itens do kit, o valor de referência de cada um e o veredito: **"o kit compensa: economia de R$ 32"** ou **"não compensa: você paga R$ 47 por 2 itens que não usa"**.
- **Dado** que itens do kit não estão nas minhas listas, **quando** o cálculo é feito, **então** eles entram com 50% do valor de referência, e o app diz que fez isso.
- **Dado** que não há preço avulso de referência para um item do kit, **quando** o cálculo é feito, **então** o app usa a mediana de mercado e sinaliza a estimativa.
- **Dado** que o kit não compensa, **quando** o motor avalia, **então** ele **não** gera push.

---

### US-405 — Ver o brinde sem ser enganada por ele
**Pri:** M · **Est:** 3 · **RF:** RF-074 · **RN:** RN-15

> **Como** Alany, **quero** ver o brinde como informação, não como desconto, **para** não achar que economizei o que não economizei.

- **Dado** que a oferta inclui brinde, **quando** vejo o card, **então** o brinde aparece como texto ("grátis: necessaire + mini sérum 7 ml") e **não** altera o preço por ml.
- **Dado** que a única novidade de uma oferta é o brinde, **quando** o motor avalia, **então** ele **não** gera push.

---

### US-406 — Ver o histórico de preço
**Pri:** S · **Est:** 5 · **RF:** RF-032, RF-033

> **Como** Alany, **quero** ver como o preço variou, **para** saber se o desconto de hoje é bom mesmo.

- **Dado** que abro a ficha, **quando** vejo o gráfico, **então** posso alternar entre 30, 90 e 365 dias, com mínimo, mediana e preço atual marcados.
- **Dado** que a variante tem menos de 14 dias de histórico, **quando** abro o gráfico, **então** vejo "histórico insuficiente para comparar".
- **Dado** que a variante esteve indisponível, **quando** vejo o gráfico, **então** o período aparece como lacuna, não como preço zero.

---

### US-407 — Detectar falsa promoção
**Pri:** S · **Est:** 5 · **RF:** RF-037

> **Como** a entusiasta, **quero** ser avisada quando a loja inflou o preço antes de "descontar", **para** não cair em desconto de mentira.

- **Dado** que a loja subiu o preço nos 30 dias anteriores e anunciou desconto, **quando** vejo a oferta, **então** aparece o selo "desconto sobre preço inflado" com os números.
- **Dado** que a oferta está marcada como falsa promoção, **quando** o motor avalia, **então** ela **não** dispara push.

---

## E5 — Cupom que realmente vale *(épico central)*

### US-501 — Saber se o cupom vale pro meu produto
**Pri:** M · **Est:** 13 · **RF:** RF-050, RF-051, RF-052 · **RN:** RN-04

> **Como** Alany, **quero** saber **antes** do checkout se o cupom da loja vale pro meu produto, **para** não montar carrinho à toa e me frustrar na hora de pagar.

- **Dado** que existe cupom ativo na loja, **quando** abro meu produto nessa loja, **então** vejo um dos três selos: **Vale** (verde), **Talvez** (amarelo) ou **Não vale** (cinza).
- **Dado** que o selo é **Vale**, **quando** toco nele, **então** vejo por que vale e qual será o preço final com o desconto.
- **Dado** que o selo é **Talvez**, **quando** toco nele, **então** vejo exatamente qual condição não pôde ser verificada (ex.: "não conseguimos confirmar se essa marca está na campanha").
- **Dado** que o selo é **Não vale**, **quando** toco nele, **então** vejo o motivo específico (ex.: "este cupom exclui a marca La Roche-Posay" ou "só acima de R$ 149").
- **Dado** que o cupom exige valor mínimo não atingido, **quando** vejo o selo, **então** ele mostra quanto falta em reais.
- **Dado** que o cupom venceu, **quando** abro o produto, **então** ele não aparece mais.

> **Regra de ouro:** o selo **Vale** só é atribuído quando **todas** as condições de RN-04 foram verificadas com sucesso. Qualquer condição desconhecida rebaixa para **Talvez**. Nunca o contrário.

---

### US-502 — Ser avisada só quando é certeza
**Pri:** M · **Est:** 8 · **RF:** RF-053, RF-054, RF-055 · **RN:** D22

> **Como** Alany, **quero** receber push só de cupom que **realmente** vale, **para** confiar no app.

- **Dado** que a loja libera um cupom **Vale** para um item meu, **quando** ele é detectado, **então** recebo push em até 5 minutos com produto, tom, loja, código e preço final.
- **Dado** que o cupom é **Talvez**, **quando** ele é detectado, **então** eu **não** recebo push — ele aparece na ficha do produto com a condição incerta em destaque.
- **Dado** que o cupom é **Não vale**, **quando** ele é detectado, **então** ele não aparece no fluxo principal, apenas em uma seção recolhida "cupons que não servem", com o motivo.
- **Dado** que o mesmo cupom já me foi notificado, **quando** ele é recoletado, **então** não recebo notificação duplicada.

---

### US-503 — Dizer se o cupom funcionou
**Pri:** M · **Est:** 5 · **RF:** RF-057

> **Como** Alany, **quero** marcar "funcionou" ou "não funcionou" depois de usar o cupom, **para** o app aprender e parar de errar.

- **Dado** que fui à loja por um alerta com cupom, **quando** volto ao app ou horas depois, **então** sou perguntada se o cupom funcionou.
- **Dado** que marco "não funcionou" e escolho o motivo, **quando** envio, **então** aquele cupom é rebaixado para **Talvez** para mim imediatamente.
- **Dado** que 3 usuárias distintas marcam "não funcionou" pelo mesmo motivo naquele produto, **quando** o sistema processa, **então** a classificação vira **Não vale** globalmente e a regra entra na fila do Operador.
- **Dado** que já respondi, **quando** volto, **então** não sou perguntada de novo sobre o mesmo cupom.

---

### US-504 — Testar um cupom que recebi por fora
**Pri:** S · **Est:** 5 · **RF:** RF-058

> **Como** Alany, **quero** colar um cupom que recebi por e-mail ou de uma influenciadora, **para** descobrir na hora se ele serve para algum item meu.

- **Dado** que colo um código e escolho a loja, **quando** confirmo, **então** vejo quais dos meus itens ficam elegíveis e o preço final de cada um.
- **Dado** que o cupom não vale para nada meu, **quando** o teste conclui, **então** vejo "não vale para nenhum dos seus produtos" com o motivo mais provável.
- **Dado** que o cupom é novo para a base, **quando** ele é salvo, **então** entra na fila de curadoria e beneficia as demais usuárias.

---

### US-505 — Completar o pedido para destravar o cupom
**Pri:** C · **Est:** 8 · **RF:** RF-061

> **Como** Alany, **quero** ver o que mais das minhas listas eu poderia comprar na mesma loja, **para** atingir o valor mínimo do cupom sem comprar bobagem.

- **Dado** que um cupom exige R$ 149 e meu produto custa R$ 92, **quando** abro a sugestão, **então** vejo outros itens **das minhas listas** naquela loja que fecham a diferença, priorizando os de reposição mais próxima.
- **Dado** que vejo a sugestão, **quando** leio o resumo, **então** o app mostra o total, o desconto e a economia por ml de cada item.
- **Dado** que completar me faria gastar mais do que economizo, **quando** vejo o resumo, **então** o app diz explicitamente "não compensa completar".

---

## E6 — Produto confiável

### US-601 — Não ser levada a comprar falsificado
**Pri:** M · **Est:** 8 · **RF:** RF-080, RF-081, RF-082 · **RN:** RN-12

> **Como** Alany, **quero** que o app só me indique vendedor confiável em perfume e maquiagem, **para** não receber uma réplica por indicação dele.

- **Dado** que uma oferta de perfume vem de seller não classificado, **quando** o motor avalia, **então** ela **não** vira push.
- **Dado** que uma oferta tem preço por ml abaixo de 40% da mediana de mercado, **quando** o motor avalia, **então** ela é descartada dos alertas e marcada para revisão do Operador.
- **Dado** que abro a comparação de lojas, **quando** existe uma oferta reprovada, **então** ela aparece com selo de risco e a explicação — visível, mas nunca notificada.
- **Dado** que a oferta vem de loja oficial da marca, **quando** vejo o card, **então** há o selo "loja oficial".

---

### US-602 — Reportar suspeita
**Pri:** S · **Est:** 3 · **RF:** RF-084

> **Como** Alany, **quero** avisar que recebi um produto suspeito, **para** proteger as outras usuárias.

- **Dado** que registrei uma compra, **quando** reporto suspeita de falsificação, **então** o seller entra em revisão e é rebaixado preventivamente para "não classificado".
- **Dado** que um seller acumula reportes, **quando** o limiar é cruzado, **então** ele deixa de gerar alertas até revisão manual.

---

## E7 — Reposição e estoque

### US-701 — Informar quanto tempo o produto dura
**Pri:** M · **Est:** 3 · **RF:** RF-090

> **Como** Alany, **quero** dizer que um frasco me dura ~60 dias, **para** o app saber quando eu vou precisar.

- **Dado** que cadastro um item na rotina, **quando** informo a duração em dias ou escolho um preset (mensal, bimestral, trimestral, semestral), **então** o app calcula e exibe a data estimada de reposição.
- **Dado** que não informo a duração, **quando** salvo, **então** o item é monitorado só por preço e o campo pode ser preenchido depois.

---

### US-702 — Registrar uma compra
**Pri:** M · **Est:** 5 · **RF:** RF-092, RF-093

> **Como** Alany, **quero** registrar que comprei, **para** o app recalcular quando eu vou precisar e medir minha economia.

- **Dado** que confirmei a compra a partir de um alerta, **quando** o registro é feito, **então** loja, data, preço, quantidade e **variante** vêm preenchidos e eu só confirmo.
- **Dado** que comprei fora do app, **quando** registro manualmente, **então** informo loja, data, preço pago, quantidade e tom.
- **Dado** que registrei a segunda compra do mesmo item, **quando** o sistema recalcula, **então** o consumo diário passa a usar o intervalo real e a data de reposição é atualizada.
- **Dado** que o intervalo real diverge mais de 50% da estimativa, **quando** o recálculo ocorre, **então** o app avisa que ajustou o ciclo e permite reverter.

---

### US-703 — Ser avisada antes de acabar
**Pri:** S · **Est:** 5 · **RF:** RF-091, RF-094, RF-095

> **Como** Alany, **quero** ser avisada quando estiver perto de acabar mesmo sem promoção, **para** não ser obrigada a comprar às pressas pelo preço que estiver.

- **Dado** que faltam 7 dias para a reposição e não houve alerta de preço, **quando** o motor avalia, **então** recebo aviso de reposição com a melhor oferta atual.
- **Dado** que o preço está acima da mediana, **quando** recebo esse aviso, **então** ele diz claramente "o preço não está bom — compre o mínimo ou espere se der".
- **Dado** que marco "ainda tenho estoque", **quando** confirmo o período, **então** a data de reposição é adiada.

---

### US-704 — Comprar agora porque está barato E eu vou precisar
**Pri:** M · **Est:** 8 · **RF:** RF-110 · **RN:** RN-05a

> **Como** Alany, **quero** que o app junte "está barato" com "você vai precisar", **para** eu comprar no melhor momento em vez de no momento urgente.

- **Dado** que o preço está abaixo do P10 de 90 dias **e** a reposição está a menos de 30 dias, **quando** o motor avalia, **então** recebo push de prioridade alta: *"está no melhor preço e você vai precisar em ~X dias"*.
- **Dado** que o preço está ótimo mas a reposição está a 6 meses e a economia projetada é baixa, **quando** o motor avalia, **então** **não** recebo push — vai para o resumo.
- **Dado** que marquei "avisar sempre que estiver barato", **quando** o preço bate o gatilho, **então** recebo push independentemente da janela de reposição.

---

### US-705 — Saber quantos comprar
**Pri:** M · **Est:** 5 · **RF:** RF-096 · **RN:** RN-17

> **Como** Alany, **quero** que o app me diga quantas unidades vale a pena comprar, **para** aproveitar o preço excepcional sem exagerar.

- **Dado** que o preço está ≤ P10 e eu tenho ciclo de consumo definido, **quando** vejo o alerta, **então** o app sugere a quantidade (horizonte de 120 dias, teto de 4 unidades) e mostra a economia total.
- **Dado** que não tenho ciclo definido, **quando** vejo o alerta, **então** não há sugestão de quantidade.
- **Dado** que a sugestão é de 3 unidades, **quando** vejo o card, **então** vejo o total a pagar e por quanto tempo aquilo me atende.

> ⚠️ **Validade e prazo após aberto não são considerados** (decisão D15, risco R5 aceito). O teto de 4 unidades é o único limitador. Ver Q3 nas decisões em aberto.

---

## E8 — Vale a pena esperar? *(calendário sazonal)*

### US-801 — Ser avisada para segurar a compra
**Pri:** M · **Est:** 13 · **RF:** RF-170, RF-171, RF-172, RF-175 · **RN:** RN-19

> **Como** Alany, **quero** que o app me avise quando vale mais a pena **esperar** um evento próximo, **para** não comprar 10 dias antes da maior promoção do ano.

- **Dado** que existe evento aplicável em ≤ 45 dias, com queda mediana histórica ≥ 15% e confiança **Alta**, **e** minha reposição só vence depois do evento, **quando** o motor avalia, **então** recebo o aviso: *"segure — a Black Friday começa em 23 dias e nos últimos 2 anos esse produto caiu 34% na Época"*.
- **Dado** que recebo esse aviso, **quando** abro a tela, **então** vejo o nome do evento, a data, a queda esperada, o nível de confiança **e a melhor oferta atual clicável** — o app nunca me impede de comprar agora.
- **Dado** que o preço atual já está ≤ P10 dos 90 dias, **quando** o motor avalia, **então** **não** recebo recomendação de esperar — não há o que esperar.
- **Dado** que a confiança é **Informativa** (sem histórico de preço), **quando** o motor avalia, **então** eu **não** recebo push; o evento aparece só na ficha do produto.
- **Dado** que a confiança é **Média** (1 edição observada), **quando** recebo o aviso, **então** ele diz explicitamente "baseado em 1 ano de histórico".
- **Dado** que a data do evento é estimada, **quando** vejo o aviso, **então** ela aparece rotulada como estimada.

---

### US-802 — Não ficar sem produto por esperar
**Pri:** M · **Est:** 5 · **RF:** RF-173, RF-174 · **RN:** RN-19 (cond. 3)

> **Como** Alany, **quero** que o app **nunca** me mande esperar se eu for ficar sem o produto, **para** não trocar economia por ficar na mão.

- **Dado** que minha reposição estimada é anterior ao fim do evento + 7 dias, **quando** o motor avalia, **então** o app **não** recomenda esperar, mesmo com queda histórica alta.
- **Dado** que a trava de reposição impediu a recomendação, **quando** abro a ficha, **então** vejo: *"a Black Friday é em 40 dias, mas seu produto acaba em 20 — compre 1 agora e reavalie na data"*.
- **Dado** que sigo essa orientação e registro a compra de 1 unidade, **quando** o evento chega, **então** a reposição foi recalculada e o app reavalia a recomendação.

---

### US-803 — Ver os próximos eventos do meu produto
**Pri:** S · **Est:** 5 · **RF:** RF-177

> **Como** a entusiasta, **quero** ver o calendário de promoções aplicáveis ao meu produto, **para** planejar minhas compras do ano.

- **Dado** que abro a ficha de um produto, **quando** rolo até "Próximos eventos", **então** vejo os eventos aplicáveis com data, queda histórica média e nível de confiança de cada um.
- **Dado** que um evento não tem histórico daquele produto, **quando** vejo a linha, **então** ela mostra a queda média **da categoria** e diz que a base é a categoria, não o produto.
- **Dado** que não há evento aplicável nos próximos 120 dias, **quando** abro a seção, **então** vejo "nenhum evento previsto" em vez de uma lista genérica.

---

### US-804 — Ser lembrada quando o evento começar
**Pri:** S · **Est:** 3 · **RF:** RF-176

> **Como** Alany, **quero** ser avisada no dia em que a promoção começar, **para** não perder o que eu decidi esperar.

- **Dado** que toco em "me avise quando começar", **quando** o evento inicia, **então** recebo push com o preço atual do meu produto e a comparação com o que era antes.
- **Dado** que criei o lembrete e o produto entrou em promoção **antes** do evento, **quando** o gatilho normal de preço dispara, **então** recebo o alerta de preço e o lembrete é cancelado como redundante.
- **Dado** que o evento começou e o preço **não** caiu, **quando** recebo o aviso, **então** ele diz honestamente "o preço não caiu ainda — vamos continuar acompanhando".

---

### US-805 — Saber se o app acerta
**Pri:** S · **Est:** 5 · **RF:** RF-178, RF-179

> **Como** Alany, **quero** ver se as recomendações de esperar se confirmaram, **para** decidir o quanto confiar nelas.

- **Dado** que um evento terminou, **quando** o sistema processa, **então** ele compara o preço praticado com a previsão e registra acerto ou erro.
- **Dado** que segui uma recomendação de esperar, **quando** o evento termina, **então** recebo o desfecho: *"caiu 31% como previsto — você economizou R$ 42"* ou *"não caiu como esperávamos, desculpa"*.
- **Dado** que abro as configurações do calendário, **quando** vejo a seção, **então** há a taxa de acerto histórica ("acertamos 8 das últimas 10 previsões").
- **Dado** que um tipo de evento erra repetidamente, **quando** o sistema recalcula, **então** o nível de confiança daquele evento é rebaixado automaticamente.

---

### US-806 — Desligar as recomendações de esperar
**Pri:** S · **Est:** 2 · **RF:** RF-182

> **Como** Alany, **quero** poder desligar os avisos de "espere", **para** continuar recebendo só alerta de preço se eu preferir.

- **Dado** que desligo as recomendações de esperar, **quando** um evento se aproxima, **então** não recebo push sobre ele, mas os alertas de preço continuam normalmente.
- **Dado** que desliguei, **quando** abro a ficha de um produto, **então** a seção "Próximos eventos" continua disponível para consulta.

---

### US-807 — Manter o calendário *(Operador)*
**Pri:** M · **Est:** 8 · **RF:** RF-183, RF-180

> **Como** Operador, **quero** cadastrar e datar os eventos e revisar a evidência histórica, **para** o app não prometer queda que não existe.

- **Dado** que cadastro um evento, **quando** salvo, **então** informo nome, abrangência (mercado, loja ou marca), escopo de categorias, datas e se a data é confirmada ou estimada.
- **Dado** que um evento tem datas estimadas, **quando** ele é exibido no app, **então** o rótulo de estimativa é obrigatório.
- **Dado** que abro a evidência de um evento, **quando** reviso, **então** vejo a queda mediana por produto, por categoria e por mercado, com o número de edições observadas em cada nível.
- **Dado** que a evidência de um evento é insuficiente, **quando** salvo, **então** ele é criado com confiança **Informativa** e não gera push.

---

## E9 — Alerta sem spam

### US-901 — Não ser bombardeada
**Pri:** M · **Est:** 5 · **RF:** RF-112 · **RN:** RN-07

> **Como** Alany, **quero** um limite de notificações por dia e horário de silêncio, **para** continuar com o app instalado.

- **Dado** que já recebi 3 pushes hoje, **quando** surge uma quarta oportunidade, **então** ela não vira push e entra no resumo.
- **Dado** que é 23h e o silêncio é 22h–8h, **quando** surge uma oportunidade, **então** o push é adiado para as 8h — salvo se a promoção expirar antes, caso em que é entregue marcado como "expira em breve".
- **Dado** que fui notificada de um item há 10 h, **quando** ele cai de novo, **então** não recebo novo push, exceto se a queda adicional for ≥ 15%.
- **Dado** que altero teto e horário, **quando** salvo, **então** a nova regra vale a partir do próximo ciclo.

---

### US-902 — Escolher meu nível de sensibilidade
**Pri:** S · **Est:** 3 · **RF:** RF-117

> **Como** a entusiasta, **quero** poder pedir "quero ver tudo", **para** não perder nenhuma queda.

- **Dado** que escolho "só excepcionais", **quando** o motor avalia, **então** só recebo alertas ≤ P10 com economia ≥ R$ 30.
- **Dado** que escolho "quero ver tudo", **quando** o motor avalia, **então** recebo qualquer queda ≥ 5%, respeitando teto diário e silêncio.
- **Dado** que mudo o perfil, **quando** salvo, **então** o app mostra quantos alertas eu teria recebido na última semana com essa configuração.

---

### US-903 — Receber um resumo
**Pri:** S · **Est:** 5 · **RF:** RF-113, RF-115

> **Como** Alany, **quero** um resumo diário ou semanal, **para** ver de uma vez o que não mereceu push.

- **Dado** que escolhi resumo semanal, **quando** chega o dia e horário, **então** recebo as oportunidades da semana ordenadas por economia.
- **Dado** que não houve nenhuma oportunidade, **quando** chega o horário, **então** **não** recebo notificação vazia.
- **Dado** que abro o centro de alertas, **quando** navego, **então** vejo os últimos 90 dias com filtro por item e por status (aproveitada / ignorada / expirada).

---

## E10 — Da notificação à compra

### US-1001 — Ir da notificação à loja com o cupom na mão
**Pri:** M · **Est:** 8 · **RF:** RF-120, RF-121, RF-122, RF-124, RF-125

> **Como** Alany, **quero** tocar no alerta e cair direto no meu tom, na loja, com o cupom já copiado, **para** não perder tempo nem errar.

- **Dado** que recebo um push, **quando** toco nele, **então** abro a tela do alerta com produto, **tom**, loja, preço por ml, cupom, validade e o botão "Ir para a loja".
- **Dado** que toco em "Ir para a loja", **quando** o app da loja está instalado, **então** ele abre **na variante correta** por deep link; **senão**, abre no navegador.
- **Dado** que há cupom, **quando** toco em "Ir para a loja", **então** o código é copiado e vejo a confirmação "código COPIADO".
- **Dado** que a loja tem passo específico para aplicar cupom, **quando** vejo o alerta, **então** há um passo a passo de no máximo 3 linhas.
- **Dado** que o link é de afiliado, **quando** vejo a tela, **então** há "podemos receber comissão — isso não muda o ranking".
- **Dado** que vou para a loja, **quando** toco no botão, **então** o app avisa que **o preço não inclui frete**.

---

### US-1002 — O alerta responde tudo em uma tela
**Pri:** M · **Est:** 5 · **RF:** RF-111, RF-118 · **RNF:** RNF-071

> **Como** Alany, **quero** entender a oportunidade sem investigar, **para** decidir em segundos.

- **Dado** que abro um alerta, **quando** vejo a tela, **então** ela responde: **o quê** (produto, tamanho e tom), **por quanto** (preço final e por ml), **onde** (loja), **por que agora** (histórico e janela de reposição) e **o que fazer**.
- **Dado** que o alerta é de tom vizinho, **quando** vejo o título, **então** está explícito que não é o meu tom.
- **Dado** que o preço muda antes de eu agir, **quando** toco em "Ir para a loja", **então** o app revalida e me avisa se subiu.
- **Dado** que a oferta expirou, **quando** abro o alerta antigo, **então** ele aparece marcado como expirado, com o preço que era e a data.

---

### US-1003 — Confirmar se comprei
**Pri:** S · **Est:** 3 · **RF:** RF-123

> **Como** Alany, **quero** que o app me pergunte depois se comprei, **para** meu histórico ficar correto sem trabalho.

- **Dado** que fui à loja por um alerta, **quando** passam 4 horas, **então** recebo uma pergunta única e discreta: "comprou?" com Sim / Não / Depois.
- **Dado** que respondo "Sim", **quando** confirmo, **então** a compra é registrada com os dados do alerta e o ciclo é recalculado.
- **Dado** que respondo "Não", **quando** confirmo, **então** o app pergunta o motivo (preço mudou / cupom não funcionou / desisti / achei mais barato) e usa isso para calibrar.
- **Dado** que ignoro, **quando** passam 48 h, **então** a pergunta some e não é repetida.

---

## E11 — Minha economia

### US-1101 — Ver quanto economizei
**Pri:** S · **Est:** 5 · **RF:** RF-130, RF-131

> **Como** Alany, **quero** ver quanto o app já me economizou, **para** saber se vale a pena continuar (e assinar).

- **Dado** que tenho compras registradas, **quando** abro o painel, **então** vejo economia total, do mês e o cálculo explicado (preço pago × mediana histórica).
- **Dado** que comprei acima da mediana, **quando** vejo o painel, **então** aquela compra aparece como economia **negativa** — o número precisa ser honesto.
- **Dado** que tenho menos de 3 compras, **quando** abro o painel, **então** vejo "ainda juntando dados" em vez de projeção sem base.

---

### US-1102 — Ver meu histórico de compras
**Pri:** C · **Est:** 3 · **RF:** RF-132, RF-006

> **Como** Alany, **quero** consultar o que comprei, quando e por quanto, **para** entender meu padrão.

- **Dado** que abro o histórico, **quando** filtro por produto, **então** vejo todas as compras com data, loja, tom, preço pago e preço por ml.
- **Dado** que peço exportação, **quando** confirmo, **então** recebo CSV/JSON em até 24 h.

---

## E12 — Confiança, privacidade e plano

### US-1201 — Entender de onde vem o preço
**Pri:** M · **Est:** 3 · **RF:** RF-035 · **RNF:** RNF-075

> **Como** Alany, **quero** saber quando e de onde o preço foi coletado, **para** confiar no que estou vendo.

- **Dado** que vejo uma oferta, **quando** olho o rodapé do card, **então** vejo "coletado há X h · fonte: \<loja\>" e o link para a página original.
- **Dado** que o dado veio de envio colaborativo, **quando** vejo a oferta, **então** há o rótulo "informado por usuárias — pode variar".

---

### US-1202 — Controlar meus dados
**Pri:** M · **Est:** 5 · **RF:** RF-005, RF-006, RF-162 · **RNF:** RNF-050 a RNF-057

> **Como** Alany, **quero** apagar minha conta e escolher o que compartilho, **para** ficar tranquila — minha lista diz muito sobre minha pele.

- **Dado** que estou em Privacidade, **quando** vejo as opções, **então** ligo/desligo analytics e marketing separadamente, com efeito imediato.
- **Dado** que peço exclusão da conta, **quando** confirmo duas vezes, **então** recebo confirmação de apagamento em até 15 dias e o acesso é revogado na hora.
- **Dado** que leio a política, **quando** procuro, **então** encontro explicitamente que minha lista não é vendida nem usada para segmentação por condição de saúde.

---

### US-1203 — Esconder o produto na tela bloqueada
**Pri:** S · **Est:** 2 · **RNF:** RNF-057

> **Como** Alany, **quero** poder ocultar o nome do produto na notificação, **para** meu tratamento de acne não aparecer na tela bloqueada do celular.

- **Dado** que ativo "ocultar nome do produto", **quando** recebo um push, **então** o texto é genérico ("um item da sua rotina está no melhor preço") e o detalhe só aparece ao abrir o app.
- **Dado** que a opção está desligada, **quando** recebo um push, **então** o nome do produto aparece normalmente.

---

### US-1204 — Entender o limite do plano grátis
**Pri:** M · **Est:** 3 · **RF:** RF-150, RF-151, RF-154

> **Como** Alany, **quero** saber o que ganho em cada plano, **para** decidir sem me sentir enganada.

- **Dado** que tenho 15 itens monitorados no plano grátis, **quando** tento adicionar o 16º, **então** vejo a comparação dos planos e a opção de pausar outro item em vez de assinar.
- **Dado** que assino e depois cancelo, **quando** volto ao gratuito, **então** os itens excedentes ficam **pausados** e nenhum dado é apagado.
- **Dado** que estou no gratuito, **quando** vejo a frequência, **então** o app informa "atualizado a cada 12 h" sem esconder que o pago é mais rápido.

---

## E13 — Operação e catálogo *(interna)*

### US-1301 — Monitorar a saúde dos conectores
**Pri:** M · **Est:** 8 · **RF:** RF-141, RF-142

> **Como** Operador, **quero** ver a saúde de cada conector, **para** agir antes que a usuária receba dado errado.

- **Dado** que um conector cai abaixo de 90% de sucesso em 1 h, **quando** o limiar é cruzado, **então** a operação é alertada e os alertas baseados nele são suspensos automaticamente.
- **Dado** que um conector está suspenso, **quando** a usuária abre uma oferta daquela loja, **então** vê "não conseguimos confirmar este preço agora" em vez de dado velho apresentado como atual.
- **Dado** que abro o painel, **quando** vejo a lista, **então** tenho taxa de sucesso, latência p95, última coleta e volume por conector.

---

### US-1302 — Revisar casamento de produtos e variantes
**Pri:** M · **Est:** 13 · **RF:** RF-143, RF-144 · **RNF:** RNF-013

> **Como** Operador, **quero** revisar casamentos de baixa confiança, **para** o tom 3.5 de uma loja não virar o tom 3.0 da outra.

- **Dado** que dois anúncios foram casados com score < 0,8, **quando** abro a fila, **então** vejo os dois lado a lado com EAN, título, marca, tamanho, **tom** e imagem.
- **Dado** que rejeito um casamento, **quando** confirmo, **então** os itens são separados e a decisão é persistida.
- **Dado** que um casamento errado gerou alerta, **quando** ele é desfeito, **então** os alertas relacionados são invalidados.

---

### US-1303 — Revisar regras de cupom não extraídas
**Pri:** M · **Est:** 8 · **RF:** RF-144, RF-147

> **Como** Operador, **quero** completar manualmente as regras que a extração não leu, **para** transformar "Talvez" em "Vale" ou "Não vale".

- **Dado** que um cupom tem condição desconhecida, **quando** abro a fila, **então** vejo o regulamento original com os campos faltantes destacados — em especial a **lista de marcas excluídas**.
- **Dado** que preencho e salvo, **quando** o sistema reavalia, **então** os produtos afetados são reclassificados e as usuárias recebem a correção no próximo ciclo.
- **Dado** que altero uma regra, **quando** salvo, **então** a versão anterior é preservada com autor e data.

---

### US-1304 — Curar a base de sellers
**Pri:** M · **Est:** 8 · **RF:** RF-145, RF-082 · **RN:** RN-12

> **Como** Operador, **quero** classificar sellers e revisar ofertas de preço suspeito, **para** nenhuma réplica virar push.

- **Dado** que abro a fila de preço suspeito, **quando** reviso uma oferta, **então** posso liberá-la, mantê-la bloqueada ou rebaixar o seller.
- **Dado** que classifico um seller como autorizado, **quando** salvo, **então** as ofertas dele passam a ser notificáveis a partir da próxima coleta.
- **Dado** que um seller é rebaixado, **quando** salvo, **então** os alertas pendentes dele são cancelados.

---

### US-1305 — Revisar a composição dos kits
**Pri:** S · **Est:** 5 · **RF:** RF-148

> **Como** Operador, **quero** corrigir a composição de um kit, **para** o veredito de "compensa ou não" ser confiável.

- **Dado** que a extração leu o kit errado, **quando** corrijo os itens e quantidades, **então** o cálculo de RN-14 é refeito para todas as usuárias afetadas.
- **Dado** que um item do kit não tem preço avulso de referência, **quando** reviso, **então** posso informar a mediana de mercado manualmente.

---

## Plano de releases

### Release 1 — "Vigia meu produto" *(fatia vertical mínima)*
Prova que a coleta funciona, que a variante está certa e que o alerta chega. Lojas da fase F1 (varejo especializado).

`US-101` `US-103` `US-201` `US-202` `US-206` `US-207` `US-401` `US-406` `US-701` `US-704` `US-901` `US-1001` `US-1002` `US-1201` `US-1301` `US-1302`

### Release 2 — "Cupom que vale" *(o diferencial)*
`US-501` `US-502` `US-503` `US-702` `US-1003` `US-1204` `US-1202` `US-1303`

### Release 3 — "Preço de verdade e produto confiável"
Entra a fase F2 (marketplaces) — e com ela a autenticidade vira obrigatória.

`US-402` `US-403` `US-404` `US-405` `US-601` `US-602` `US-705` `US-1304`

### Release 4 — "Vale a pena esperar?" *(calendário sazonal)*
Depende de ter ≥ 90 dias de série própria ou de dado histórico de mercado (ver Q11).

`US-801` `US-802` `US-803` `US-804` `US-805` `US-806` `US-807`

### Release 5 — "Fica esperto"
`US-203` `US-204` `US-205` `US-301` `US-302` `US-407` `US-504` `US-703` `US-902` `US-903` `US-1101` `US-1203` `US-1305`

### Backlog (Could / v2)
`US-102` `US-505` `US-1102` · frete no cálculo · cashback e fidelidade · validade/PAO no estoque · lista compartilhada · lojas físicas

---

## Definition of Ready

Uma história entra no sprint quando: tem critérios de aceitação escritos, prioridade e estimativa; as fontes de dado necessárias estão disponíveis; o impacto em privacidade foi avaliado; e os textos de UI — **inclusive o texto exato do push** — foram definidos.

## Definition of Done

Código revisado e mergeado · testes automatizados cobrindo os critérios de aceitação · teste unitário obrigatório quando a história toca preço, cupom, variante, promoção progressiva, kit, autenticidade ou calendário · testado em Android e iOS · acessibilidade verificada com leitor de tela · telemetria instrumentada · requisitos atualizados.

---

## Perguntas em aberto por épico

| Épico | Pergunta |
|---|---|
| E2 | Você quer poder monitorar "qualquer tom" de um produto que você ainda não decidiu (ex.: batom novo)? |
| E4 | O fator de 50% para itens do kit que você não usa faz sentido, ou prefere 0% (só conta o que você quer)? |
| E5 | Cupom **Talvez** com desconto muito alto (ex.: 40%) merece uma exceção e vira push? |
| E7 | Horizonte de 120 dias e teto de 4 unidades na sugestão de estoque estão certos? |
| E7 | Aceita o aviso estático de validade por categoria como mitigação barata do risco R5? |
| E8 | Quantos eventos o calendário deve ter no lançamento? |
| E8 | No primeiro ano, sem histórico próprio, aceita previsão baseada em dado público de mercado (confiança Média)? |
| E8 | 45 dias de antecedência e 15% de queda mínima são os números certos para sugerir esperar? |
| E12 | "Ocultar nome do produto na notificação" deve vir ligado por padrão? |
| E12 | Quanto por mês você pagaria no plano pago? |
