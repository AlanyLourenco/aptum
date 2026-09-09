# Aptum — Documento de Requisitos

**Versão:** 0.2 — foco em **beleza e cuidado pessoal**
**Data:** 05/09/2026
**Autora do problema:** Alany
**Documentos irmãos:** [02-historias-de-usuario.md](./02-historias-de-usuario.md) · [03-fontes-de-dados.md](./03-fontes-de-dados.md)
**Mudança desde a v0.1:** vertical redefinido de "produtos de uso recorrente em geral" para **beleza** (skincare, maquiagem, perfumaria, cabelo, corpo e banho). Regras novas de variante de tom, autenticidade de vendedor, promoção progressiva e kit. **Calendário sazonal incluído** (D14 revertida). Frete, cashback e fidelidade ficaram fora do MVP por decisão.

---

## 1. Visão do produto

### 1.1 Problema

Quem cuida da pele e do cabelo compra em **ciclos previsíveis** — o sérum acaba, a base termina, o shampoo esvazia — mas as promoções acontecem em momentos **imprevisíveis**. O resultado é sempre o mesmo:

1. **Dessincronização preço × necessidade** — você compra quando acaba, não quando está barato, e paga acima da média.
2. **Promoção perdida** — teve preço ótimo em algum momento do mês ou do trimestre, mas você não estava olhando.
3. **Cupom inútil** — a loja libera um cupom, você monta o carrinho e só descobre no checkout que aquele item específico está excluído (marca de fora da campanha, seller diferente, valor mínimo não atingido). **Essa frustração é o gatilho principal do produto.**

Beleza agrava tudo isso: o mesmo produto existe em 4 tamanhos e 30 tons, aparece em kit, em refil, em "leve 3 pague 2", em 4 lojas diferentes com preços que não se comparam diretamente — e em marketplace com risco de falsificado.

### 1.2 Proposta de valor

> O Aptum vigia o preço e os cupons dos produtos de beleza que você usa e quer usar, e só te chama quando comprar **agora** é comprovadamente o melhor negócio — com o cupom já validado para o **seu** produto, no **seu** tom, comparado por **ml**.

### 1.3 Diferencial defensável

| Camada | O que faz | Por que é difícil de copiar |
|---|---|---|
| **Elegibilidade de cupom** | Modela as regras do cupom (marca, categoria, seller, valor mínimo, itens excluídos) e responde "esse cupom vale pro meu item?" **antes** do checkout | Exige extrair e manter regras semiestruturadas; melhora com o feedback das usuárias |
| **Preço real comparável** | Normaliza tudo por ml/g/unidade — frasco, refil, travel size, kit, "leve 3 pague 2" — já com o cupom aplicado | Exige catálogo de beleza com atributos e variantes corretos, que ninguém mantém bem |
| **Janela de reposição** | Sabe quando o seu produto vai acabar e cruza com o preço | Só funciona com o histórico de consumo da usuária — dado proprietário |
| **Confiança do produto** | Só recomenda vendedor confiável em perfume e maquiagem | Exige curadoria de sellers e detecção de preço suspeito |

### 1.4 Escopo de categorias (MVP)

| Categoria | Exemplos | Unidade de uso |
|---|---|---|
| **Skincare** | Limpeza facial, hidratante, sérum, ácido, protetor solar, esfoliante, máscara facial | ml / g |
| **Maquiagem** | Base, corretivo, pó, blush, batom, máscara de cílios, delineador, iluminador | ml / g / un |
| **Perfumaria** | Perfume, body splash, desodorante colônia | ml |
| **Cabelo** | Shampoo, condicionador, máscara, leave-in, finalizador, óleo, ampola | ml / g |
| **Corpo e banho** | Sabonete, hidratante corporal, óleo, esfoliante | ml / g / un |

### 1.5 Fora de escopo (MVP)

- Compra/pagamento dentro do Aptum — o checkout acontece sempre na loja.
- **Frete** no cálculo do preço (decisão D12).
- **Cashback** (Méliuz, Ame, banco) e **programas de fidelidade/consultora** (Natura, Avon, Boticário) — decisão D13.
- **Validade e prazo após aberto (PAO)** na sugestão de estoque — decisão D15.
- Lojas físicas, encartes e geolocalização de loja.
- Lista compartilhada com outra pessoa.
- Categorias fora de beleza (limpeza da casa, mercearia, pet).
- Recomendação de produto por tipo de pele — o Aptum não é consultor de beleza, é vigia de preço.

---

## 2. Decisões de produto

| # | Decisão | Escolha | Impacto |
|---|---|---|---|
| D1 | Origem dos preços | **Híbrida**: APIs oficiais/afiliados onde existirem, scraping onde não existir, correção colaborativa da usuária | Arquitetura de ingestão plugável por conector |
| D2 | Lojas do piloto | **Quatro frentes**: varejo especializado, marcas diretas, marketplaces, farmácia/dermocosmético | MVP grande — ver faseamento em 2.1 |
| D3 | Cadastro de produto | Item exato (SKU/EAN) **+ similares aprovados pela usuária** | Grupo de equivalência com aprovação explícita |
| D4 | "Melhor preço" | Preço por ml/g **já com cupom elegível**, comparado a histórico **e** a preço-alvo | Requer atributos de embalagem e série histórica |
| D5 | Cupons | Coleta + modelagem de regras + validação de elegibilidade por item | Núcleo do diferencial |
| D6 | Recorrência | Ciclo estimado informado pela usuária + aprendizado pelas compras registradas | Requer registro de compra |
| D7 | Notificações | Só oportunidade real via push + resumo periódico, com teto diário e horário de silêncio | Motor de alerta com supressão |
| D8 | Plataforma | React Native / Expo — Android e iOS | Push via Expo Notifications sobre FCM/APNs |
| D9 | Monetização | Afiliado + freemium, **limite de 15 produtos** no plano grátis | Divulgação de afiliado; não pode distorcer o ranking |
| D10 | Conta | Login social (Google/Apple) + e-mail | Necessário para sync, push e histórico |
| D11 | Regionalização | CEP **opcional**, usado só para disponibilidade — não entra no preço no MVP | Prioridade baixa (frete está fora) |
| D12 | **Frete** | **Fora do MVP.** O PEU não inclui frete | ⚠️ Risco R3 — o alerta pode indicar loja que sai mais cara no total |
| D13 | Cashback e fidelidade | **Fora do MVP.** Nem informativo | Fica para a v2 |
| D14 | **Calendário sazonal** | **Dentro do MVP.** O app avisa quando vale **esperar** um evento próximo — com trava de reposição obrigatória | Requer curadoria de eventos + evidência histórica (RN-19) |
| D15 | Validade / PAO | **Ignorada no MVP**, mesmo com sugestão de estoque ativa | ⚠️ Risco R5 — ver mitigação barata pendente (Q3) |
| D16 | Variante de tom/cor | Monitorar o **tom exato** + tons vizinhos **aprovados** pela usuária | Variante é entidade de primeira classe no catálogo |
| D17 | Tipos de promoção | **Todos os quatro**: queda de preço, cupom, progressiva ("leve 3 pague 2"), brinde/kit | MVP grande — ver faseamento em 2.1 |
| D18 | Autenticidade | Alerta **só** de vendedor confiável; preço suspeito é descartado, não notificado | Requer curadoria de sellers |
| D19 | Refil e tamanho | Sempre comparados por ml/g, com aviso quando for refil | Requer relação refil ↔ frasco base |
| D20 | Kit | Decompor e dizer se compensa em relação ao avulso | Requer preço de referência de cada item do kit |
| D21 | Lista de desejo | Lista **separada** da reposição, com regra de alerta própria | Dois motores de alerta com gatilhos distintos |
| D22 | Cupom incerto | Push **apenas** para cupom **Confirmado**; "Provável" só aparece dentro do app | Protege a confiança — é a decisão mais importante do produto |

### 2.1 Faseamento sugerido dentro do MVP

Você escolheu as quatro frentes de loja e os quatro tipos de promoção. Isso é entregável, mas não simultaneamente. Ordem sugerida, sem reduzir o escopo acordado:

| Fase | Lojas | Promoções |
|---|---|---|
| **F1** | Varejo especializado (Beleza na Web, Época Cosméticos) | Queda de preço + cupom |
| **F2** | Marketplaces (Amazon, Mercado Livre) — com RN-12 obrigatório | + promoção progressiva |
| **F3** | Farmácia/dermocosmético (Drogasil, Panvel) | + kit e brinde |
| **F4** | Marcas diretas (Boticário, Natura, Sallve, Creamy) | consolidação e refil |

Marcas diretas ficam por último de propósito: têm refil (o maior ganho de preço por ml) e campanhas próprias, mas raramente têm API e o catálogo é pequeno e estável — o custo/benefício de conector é o pior dos quatro no começo.

---

## 3. Personas

| Persona | Descrição | Objetivo | Dor |
|---|---|---|---|
| **Alany — a rotina montada** (primária) | Tem rotina de skincare e cabelo definida, recompra sempre as mesmas marcas, é sensível a preço mas não tem tempo de caçar promoção | Nunca mais pagar caro no que ela sabia que ia acabar | Perde promoção durante o mês; descobre no checkout que o cupom não vale |
| **A entusiasta** (secundária) | Acompanha lançamento, quer experimentar, tem lista de desejo grande, estoca quando está barato | Comprar o produto caro no melhor preço do ano | Ruído; alerta de tom que não é o dela; medo de perfume falsificado |
| **Operador de catálogo** (interna) | Time do Aptum que cura catálogo, variantes, sellers e regras de cupom | Manter dado correto e cobertura alta | Loja muda layout/API e o dado quebra silenciosamente |

---

## 4. Regras de negócio

### RN-01 — Unidade de uso
Todo produto tem uma **unidade de uso** normalizada: `ml`, `g` ou `un`. É ela que permite comparar frasco de 200 ml, refil de 400 ml e travel de 30 ml.

### RN-02 — Preço Efetivo por Unidade (PEU)

```
PEU = (preço_à_vista − desconto_cupom_elegível − desconto_promoção_progressiva)
      ÷ quantidade_em_unidade_de_uso
```

- **Frete não entra no MVP** (D12). O campo existe no modelo com valor zero, para ser ligado sem migração.
- `desconto_cupom_elegível`: só entra cupom aprovado em RN-04.
- `desconto_promoção_progressiva`: ver RN-13.
- Cashback e fidelidade não entram (D13).
- Parcelamento sem juros **não** reduz o PEU; preço com juros não é considerado.

### RN-03 — Faixa histórica
Para cada trio **produto × variante × loja** o sistema mantém a série de PEU. São calculados o **P10**, a **mediana** e o **pico** dos últimos **90 dias** (configurável). Produto com menos de **14 dias** de histórico é marcado "histórico insuficiente" e não gera alerta de mínimo histórico.

### RN-04 — Elegibilidade de cupom
Um cupom é elegível para um item quando **todas** as condições abaixo são satisfeitas:

`loja` • `seller/vendedor` • `marca incluída` • `categoria incluída` • `item fora da lista de exclusão` • `valor mínimo do pedido atingido` • `dentro da vigência` • `quantidade máxima respeitada` • `restrição de primeira compra respeitada` • `restrição de meio de pagamento respeitada`

Se **qualquer** condição for **desconhecida**, o cupom é classificado como **"Provável"** — nunca como "Confirmado".

> Em beleza a exclusão mais comum é **por marca** ("não válido para Kérastase, Vichy e produtos de perfumaria importada"). O extrator precisa tratar lista de marcas excluídas como campo de primeira classe.

### RN-05 — Gatilhos de alerta

**a) Produto de reposição** — dispara quando:

```
PEU_atual ≤ preço_alvo   OU   ( PEU_atual ≤ P10_90d  E  queda ≥ 10% vs mediana )
```
**E** pelo menos uma destas:
- a janela de reposição está a ≤ 30 dias (RN-06); **ou**
- a economia absoluta projetada é ≥ R$ 15 (configurável); **ou**
- a usuária marcou "avisar sempre que estiver barato".

**b) Produto da lista de desejo** — dispara quando:

```
PEU_atual ≤ preço_alvo   OU   PEU_atual ≤ mínimo_histórico_180d
```
Sem cruzar com reposição — desejo não acaba, então a única pergunta é "está no melhor preço já visto?".

**c) Cupom** — dispara quando surge cupom **Confirmado** (RN-04) para um produto de qualquer uma das duas listas.

### RN-06 — Janela de reposição

```
data_reposição = data_última_compra + ( quantidade_comprada ÷ consumo_diário_estimado )
```

O `consumo_diário_estimado` começa com o valor informado pela usuária e é reajustado a cada compra registrada (média móvel ponderada, peso maior nas 3 compras mais recentes). São necessárias **≥ 2 compras registradas** para substituir a estimativa manual.

### RN-07 — Anti-spam
Máximo de **3 pushes por dia** e **1 push por produto a cada 48 h**, respeitando o horário de silêncio (padrão 22h–8h). O que for suprimido entra no resumo periódico. Exceção: queda adicional ≥ 15% reabre a janela do produto.

### RN-08 — Confiança do dado
Todo preço e todo cupom carrega `origem` (api_oficial | scraping | colaborativo), `coletado_em` e `nível_de_confiança`. A UI sempre mostra a data da coleta. Preço com mais de **6 h** é exibido como "pode ter mudado".

### RN-09 — Neutralidade do ranking
O link de afiliado **não** altera a ordenação, que é sempre por PEU crescente. Ofertas com link de afiliado recebem rótulo visível.

### RN-10 — Grupo de similares
Um similar só gera alerta depois de **aprovado explicitamente** pela usuária. O sistema sugere; a usuária decide.

### RN-11 — Variante (tom, cor, fragrância, tipo de pele) — *específica de beleza*
Variante é entidade de primeira classe. Um produto pai (ex.: "Base Fluida Matte") tem N variantes (tom 1.0 … 12.0), cada uma com **preço, estoque e histórico próprios**.

- A usuária monitora **uma variante específica**.
- Ela pode aprovar **tons vizinhos** — sugeridos pela proximidade no catálogo, nunca incluídos automaticamente.
- Alerta de tom vizinho é sempre rotulado como tal: *"o tom 3.0 (você usa 3.5) está R$ 28 mais barato"*.
- Promoção que vale só para alguns tons **não** pode ser exibida como promoção do produto inteiro.

### RN-12 — Vendedor confiável e autenticidade — *específica de beleza*
Aplica-se a **perfumaria e maquiagem** em marketplace. Uma oferta só é **notificável** se o seller for:

`loja oficial da marca` **ou** `revendedor autorizado catalogado` **ou** `seller com reputação ≥ limiar e volume de vendas ≥ limiar`

Além disso, **preço suspeito é descartado**: oferta com PEU abaixo de **40%** da mediana de mercado dos últimos 90 dias não gera alerta e é marcada para revisão do Operador. Ofertas reprovadas continuam visíveis na comparação dentro do app, com selo de risco — mas nunca viram push.

### RN-13 — Promoção progressiva ("leve 3 pague 2", "2º item 50%") — *específica de beleza*
O sistema simula a combinação e calcula o **PEU efetivo na quantidade mínima da promoção**.

- O alerta deve informar **a quantidade necessária**: *"R$ 24/100 ml se levar 3 — R$ 36/100 ml se levar 1"*.
- Se a quantidade exigida ultrapassar a **sugestão de estoque** (RN-17), o app mostra os dois cenários e não empurra o maior.
- Promoções progressivas que exigem itens de marcas diferentes só são consideradas quando todos os itens estão nas listas da usuária.

### RN-14 — Kit — *específica de beleza*
Quando um kit contém um produto monitorado, o sistema decompõe:

```
economia_do_kit = Σ (preço_de_referência_de_cada_item) − preço_do_kit
```

- `preço_de_referência` = mediana 90 dias do item avulso na mesma loja; se não houver, mediana do mercado.
- O veredito é explícito: **"o kit compensa: economia de R$ 32"** ou **"não compensa: você paga R$ 47 por 2 itens que não usa"**.
- Itens do kit que **não** estão nas listas da usuária entram no cálculo com **50% do valor de referência** — ela pode não querer aquilo. O fator é configurável.

### RN-15 — Brinde e amostra — *específica de beleza*
Brinde **não entra no PEU**. Ele é exibido como informação adicional (*"grátis: necessaire + mini sérum 7 ml"*) e nunca é usado para justificar um alerta sozinho. Motivo: atribuir preço a brinde é chute, e chute vira alerta errado.

### RN-16 — Refil — *específica de beleza*
Refil é comparado normalmente por ml, com duas condições:
- a oferta é rotulada **"refil — precisa do frasco"**;
- refil só é sugerido se a usuária tiver marcado que possui o frasco daquele produto (padrão: sim, após a primeira compra registrada do produto original).

### RN-17 — Sugestão de estoque
Quando o PEU está ≤ P10 e a usuária tem ciclo de consumo definido:

```
quantidade_sugerida = teto( horizonte_de_estoque_em_dias ÷ duração_de_uma_unidade_em_dias )
```
com `horizonte_de_estoque` padrão de **120 dias**, limitado a **4 unidades**.

> ⚠️ **Validade e PAO não são considerados no MVP** (D15). O app pode sugerir estocar um item de vida curta. Mitigação barata pendente de decisão (Q3): texto estático de aviso por categoria, sem base de PAO.

### RN-18 — Duas listas
`reposição` e `desejo` são listas independentes, com gatilhos distintos (RN-05) e contadas **juntas** no limite do plano (D9). Um item pode ser movido de desejo para reposição após a primeira compra registrada.

### RN-19 — Calendário sazonal e recomendação de esperar — *específica de beleza*

Beleza tem calendário previsível. O Aptum é o único agente da jornada que pode dizer **"não compre agora"** — e é justamente isso que resolve a dor de "perdi a promoção durante o trimestre".

**Modelo de evento**

| Campo | Descrição |
|---|---|
| `nome` | Black Friday, Dia das Mães, Semana do Consumidor, Boti Week, aniversário da loja, Prime Day, 11.11… |
| `abrangência` | mercado inteiro, loja específica ou marca específica |
| `escopo` | categorias e marcas historicamente afetadas |
| `data_início` / `data_fim` | data confirmada, ou estimada a partir dos anos anteriores (marcada como estimada) |
| `evidência` | queda mediana observada nas edições anteriores, por produto → categoria → mercado, nessa ordem de preferência |

**Gatilho de "vale esperar"** — dispara quando **todas** as condições forem verdadeiras:

1. existe evento aplicável ao produto começando em **≤ 45 dias**;
2. a queda mediana histórica naquele evento é **≥ 15%** em relação ao preço atual;
3. **trava de reposição** — a data de reposição estimada (RN-06) é **posterior** ao fim do evento **+ 7 dias** de margem de entrega. Ou seja: você não vai ficar sem o produto esperando;
4. o preço atual **não** está já ≤ P10 dos 90 dias — se já está no mínimo, não há o que esperar.

**Nível de confiança**

| Nível | Base | Comportamento |
|---|---|---|
| **Alta** | ≥ 2 edições anteriores observadas com queda consistente | Push permitido |
| **Média** | 1 edição anterior observada | Push permitido, com o texto "baseado em 1 ano de histórico" |
| **Informativa** | data conhecida, sem histórico de preço | **Nunca** gera push; aparece só na ficha do produto |

**Regras de segurança**

- A recomendação de esperar **nunca bloqueia** a compra: a melhor oferta atual continua visível e clicável na mesma tela.
- Se a condição 3 falhar (o produto vai acabar antes), o app **não** sugere esperar — no máximo informa que o evento existe, e recomenda comprar o suficiente para atravessar.
- Ao fim do evento, o sistema **verifica se acertou** e registra o resultado. A taxa de acerto por tipo de evento realimenta o nível de confiança e é exibida à usuária ("acertamos 8 das últimas 10 previsões").
- A usuária pode pedir **"me avise quando esse evento começar"**, criando um alerta agendado para a data de início.
- Evento com data estimada é sempre rotulado como estimado.

---

## 5. Requisitos Funcionais

Prioridade (MoSCoW): **M** = Must (MVP) · **S** = Should · **C** = Could · **W** = Won't (agora)

### 5.1 Conta, onboarding e perfil

| ID | Requisito | Pri |
|---|---|---|
| RF-001 | O sistema deve permitir cadastro e login com Google, Apple e e-mail + senha. | M |
| RF-002 | O sistema deve permitir explorar o app e adicionar 1 produto antes de exigir login. | S |
| RF-003 | O sistema deve solicitar permissão de push explicando o benefício, após o primeiro produto cadastrado — nunca na abertura. | M |
| RF-004 | O sistema deve permitir informar CEP opcional, usado apenas para disponibilidade e prazo de entrega. | C |
| RF-005 | O sistema deve permitir excluir a conta e todos os dados pessoais, com confirmação, concluindo em até 15 dias. | M |
| RF-006 | O sistema deve permitir exportar os dados da usuária em JSON/CSV. | S |
| RF-007 | O sistema deve sincronizar listas e configurações entre dispositivos da mesma conta. | S |
| RF-008 | O sistema deve permitir registrar preferências de perfil relevantes ao catálogo (tipo de pele, tipo de cabelo, tom de base habitual) para melhorar sugestão de similares e tons vizinhos. | C |

### 5.2 Catálogo, variantes e cadastro

| ID | Requisito | Pri |
|---|---|---|
| RF-010 | O sistema deve permitir buscar produto por texto livre (nome, marca, linha) retornando marca, linha, tamanho, variante e imagem. | M |
| RF-011 | O sistema deve permitir adicionar um produto à lista de **reposição** ou à lista de **desejo** (RN-18). | M |
| RF-012 | O sistema deve permitir adicionar produto pela leitura do código de barras (EAN). | S |
| RF-013 | O sistema deve permitir adicionar produto colando a URL do produto em uma loja suportada. | S |
| RF-014 | O sistema deve armazenar, por produto: nome, marca, linha, categoria, EAN/GTIN, quantidade e unidade, unidade de uso, imagem, tipo de embalagem (frasco / refil / travel / kit) e identificadores por loja. | M |
| RF-015 | O sistema deve modelar **variantes** (tom, cor, fragrância, tipo de pele/cabelo) como entidades próprias, com preço, estoque e histórico independentes (RN-11). | M |
| RF-016 | O sistema deve exigir que a usuária escolha a variante exata ao cadastrar um produto que tenha variantes. | M |
| RF-017 | O sistema deve sugerir **tons vizinhos** e exigir aprovação explícita para incluí-los no monitoramento (RN-11). | S |
| RF-018 | O sistema deve sugerir **produtos similares** (mesma categoria, função e unidade de uso) e exigir aprovação explícita (RN-10). | S |
| RF-019 | O sistema deve relacionar **refil ↔ frasco base** e permitir marcar que a usuária possui o frasco (RN-16). | S |
| RF-020 | O sistema deve permitir editar o item monitorado: preço-alvo, ciclo de consumo, tons e similares aceitos, lojas de interesse e sensibilidade de alerta. | M |
| RF-021 | O sistema deve permitir pausar, mover entre listas ou remover um item. | M |
| RF-022 | O sistema deve permitir organizar os itens por rotina/etapa (limpeza, tratamento, hidratação, proteção, maquiagem, cabelo, perfumaria). | C |
| RF-023 | O sistema deve permitir reportar erro de catálogo (produto, tamanho, tom ou imagem errados). | S |

### 5.3 Monitoramento e histórico de preços

| ID | Requisito | Pri |
|---|---|---|
| RF-030 | O sistema deve coletar periodicamente o preço de cada **variante** monitorada em todas as lojas suportadas onde ela exista. | M |
| RF-031 | O sistema deve calcular e armazenar o PEU (RN-02) a cada coleta. | M |
| RF-032 | O sistema deve manter série histórica por produto × variante × loja por, no mínimo, 24 meses. | M |
| RF-033 | O sistema deve exibir gráfico de variação (30 / 90 / 365 dias) com mínimo, mediana e preço atual. | S |
| RF-034 | O sistema deve exibir comparação das lojas ordenada por PEU (RN-09), mostrando preço do anúncio, cupom aplicável e preço por ml/g. | M |
| RF-035 | O sistema deve indicar em cada oferta a data/hora da coleta e a origem do dado (RN-08). | M |
| RF-036 | O sistema deve comparar formatos diferentes do mesmo produto (frasco, refil, travel, tamanho família) na mesma escala de ml/g, rotulando o refil (RN-01, RN-16). | M |
| RF-037 | O sistema deve identificar e sinalizar "falsa promoção" — preço inflado nos 30 dias anteriores ao desconto anunciado. | S |
| RF-038 | O sistema deve permitir corrigir um preço divergente, alimentando a base colaborativa. | S |
| RF-039 | O sistema deve marcar variante como "indisponível" quando fora de estoque, sem apagar o histórico. | M |
| RF-040 | O sistema deve sinalizar produto **descontinuado** ou de **edição limitada** e avisar a usuária. | C |

### 5.4 Cupons e elegibilidade — *núcleo do diferencial*

| ID | Requisito | Pri |
|---|---|---|
| RF-050 | O sistema deve coletar cupons e campanhas das lojas suportadas: código, valor/percentual, teto de desconto, vigência, valor mínimo, **marcas incluídas/excluídas**, categorias, seller, restrição de cliente e de pagamento. | M |
| RF-051 | O sistema deve avaliar a elegibilidade de cada cupom para cada item monitorado conforme RN-04. | M |
| RF-052 | O sistema deve classificar em **Vale** (Confirmado), **Talvez** (Provável) ou **Não vale**, explicando em linguagem simples o porquê. | M |
| RF-053 | O sistema deve notificar por push **apenas** cupons classificados como **Vale** (D22). | M |
| RF-054 | O sistema deve exibir os cupons **Talvez** dentro do app, com a condição não verificada em destaque, sem enviar push. | M |
| RF-055 | O sistema não deve exibir cupons **Não vale** no fluxo principal do produto, apenas em uma seção recolhida "cupons que não servem" com o motivo. | S |
| RF-056 | O sistema deve permitir copiar o código do cupom com um toque. | M |
| RF-057 | O sistema deve permitir registrar se o cupom **funcionou** ou **não funcionou**, e usar esse retorno para reclassificar (RN-04). | M |
| RF-058 | O sistema deve permitir colar manualmente um cupom recebido por fora e testar a elegibilidade contra os itens da usuária. | S |
| RF-059 | O sistema deve calcular a combinação mais vantajosa quando houver cupom acumulável com promoção progressiva. | C |
| RF-060 | O sistema deve expirar automaticamente cupons vencidos e removê-los dos alertas ativos. | M |
| RF-061 | Quando o cupom exigir valor mínimo, o sistema deve mostrar quanto falta e sugerir itens **das listas da usuária** na mesma loja. | C |

### 5.5 Promoções específicas de beleza

| ID | Requisito | Pri |
|---|---|---|
| RF-070 | O sistema deve identificar e simular **promoções progressivas** ("leve 3 pague 2", "2º item 50%"), calculando o PEU efetivo na quantidade exigida (RN-13). | M |
| RF-071 | O alerta de promoção progressiva deve informar explicitamente a quantidade necessária e o PEU nos dois cenários (1 unidade × quantidade da promoção). | M |
| RF-072 | O sistema deve identificar **kits** que contenham um item monitorado e decompô-los (RN-14). | M |
| RF-073 | O sistema deve dar veredito explícito sobre o kit: compensa ou não, com o número. | M |
| RF-074 | O sistema deve exibir **brindes e amostras** como informação adicional, sem incluí-los no PEU e sem justificar alerta sozinho (RN-15). | M |
| RF-075 | O sistema deve permitir configurar o fator de valor dos itens do kit que não estão nas listas da usuária (padrão 50%). | C |
| RF-076 | O sistema deve tratar o calendário sazonal conforme a seção 5.14. | M |

### 5.6 Autenticidade e vendedor

| ID | Requisito | Pri |
|---|---|---|
| RF-080 | O sistema deve manter, por loja de marketplace, a classificação do seller: **oficial**, **autorizado**, **confiável** ou **não classificado** (RN-12). | M |
| RF-081 | O sistema deve notificar apenas ofertas de seller oficial, autorizado ou confiável, em perfumaria e maquiagem. | M |
| RF-082 | O sistema deve descartar de alertas ofertas com PEU abaixo de 40% da mediana de mercado, marcando-as para revisão. | M |
| RF-083 | O sistema deve exibir, dentro do app, ofertas reprovadas com selo de risco e explicação, sem transformá-las em push. | S |
| RF-084 | O sistema deve permitir à usuária reportar suspeita de produto falsificado, alimentando a classificação do seller. | S |
| RF-085 | O sistema deve permitir configurar a exigência de autenticidade por categoria (RN-12 aplicada a mais categorias, se ela quiser). | C |

### 5.7 Reposição, estoque e lista de desejo

| ID | Requisito | Pri |
|---|---|---|
| RF-090 | O sistema deve permitir informar a duração estimada de uma unidade (em dias, ou por preset: mensal, bimestral, trimestral, semestral). | M |
| RF-091 | O sistema deve estimar e exibir a data de reposição (RN-06). | M |
| RF-092 | O sistema deve permitir registrar uma compra (loja, data, preço pago, quantidade, variante), manualmente ou a partir da confirmação de um alerta. | M |
| RF-093 | O sistema deve reajustar o consumo diário estimado a cada compra registrada (RN-06). | S |
| RF-094 | O sistema deve avisar quando um produto estiver perto de acabar mesmo sem promoção. | S |
| RF-095 | O sistema deve permitir marcar "ainda tenho estoque" para adiar a janela de reposição. | S |
| RF-096 | O sistema deve sugerir a quantidade a comprar quando o preço estiver excepcional (RN-17), mostrando a economia total da sugestão. | M |
| RF-097 | O sistema deve manter a **lista de desejo** separada, com gatilho de alerta próprio (RN-05b, RN-18). | M |
| RF-098 | O sistema deve permitir mover um item de desejo para reposição, preservando o histórico de preço acompanhado. | S |
| RF-099 | O sistema deve permitir definir preço-alvo em qualquer uma das duas listas. | M |

### 5.8 Alertas e notificações

| ID | Requisito | Pri |
|---|---|---|
| RF-110 | O sistema deve enviar push quando um gatilho de RN-05 for satisfeito. | M |
| RF-111 | O push deve informar: produto, variante/tom, loja, preço final por ml/g e se há cupom **Vale**. | M |
| RF-112 | O sistema deve aplicar teto diário, intervalo mínimo por produto e horário de silêncio (RN-07), configuráveis. | M |
| RF-113 | O sistema deve enviar resumo (diário ou semanal, à escolha) com o que não gerou push. | S |
| RF-114 | O sistema deve permitir silenciar um item por um período. | S |
| RF-115 | O sistema deve manter centro de alertas no app com histórico de 90 dias. | S |
| RF-116 | O sistema deve avisar quando uma promoção monitorada estiver nas últimas horas de vigência. | C |
| RF-117 | O sistema deve permitir escolher perfil de sensibilidade: "só excepcionais", "equilibrado", "quero ver tudo". | S |
| RF-118 | O alerta de tom vizinho deve deixar explícito que não é o tom da usuária (RN-11). | M |

### 5.9 Ação de compra

| ID | Requisito | Pri |
|---|---|---|
| RF-120 | O sistema deve abrir o produto **na variante correta** no app ou site da loja por deep link. | M |
| RF-121 | O sistema deve copiar automaticamente o código do cupom ao encaminhar para a loja, confirmando a cópia. | M |
| RF-122 | O sistema deve exibir passo a passo curto de como aplicar o cupom naquela loja. | S |
| RF-123 | O sistema deve perguntar, horas depois, se a compra foi concluída (registro + validação do cupom). | S |
| RF-124 | O sistema deve identificar o link como link de afiliado quando for o caso (RN-09). | M |
| RF-125 | O sistema deve avisar, ao encaminhar, que o preço não inclui frete (D12). | M |

### 5.10 Economia e histórico

| ID | Requisito | Pri |
|---|---|---|
| RF-130 | O sistema deve estimar a economia de cada compra (preço pago × mediana histórica) e acumular em um painel. | S |
| RF-131 | O sistema deve exibir economia negativa quando a compra foi acima da mediana — o número precisa ser honesto. | S |
| RF-132 | O sistema deve exibir histórico de compras com data, loja, variante, preço pago e preço por ml. | C |

### 5.11 Ingestão de dados e operação (backoffice)

| ID | Requisito | Pri |
|---|---|---|
| RF-140 | O sistema deve suportar conectores plugáveis por loja, com contrato comum (buscar produto, obter preço por variante, obter cupons, obter seller). | M |
| RF-141 | O sistema deve registrar taxa de sucesso, latência e falhas por conector. | M |
| RF-142 | O sistema deve alertar a operação quando um conector cair abaixo do limiar e suspender os alertas baseados nele. | M |
| RF-143 | O sistema deve deduplicar e casar produtos **e variantes** entre lojas, com score de confiança. | M |
| RF-144 | O sistema deve permitir ao operador revisar casamentos de baixa confiança, regras de cupom não extraídas e ofertas de preço suspeito. | M |
| RF-145 | O sistema deve manter e permitir editar a base de classificação de sellers (RN-12). | M |
| RF-146 | O sistema deve respeitar robots.txt, limites de taxa e termos de uso, com backoff. | M |
| RF-147 | O sistema deve versionar as regras de cupom extraídas, preservando o histórico. | C |
| RF-148 | O sistema deve manter a composição dos kits (itens e quantidades) revisável manualmente. | S |

### 5.12 Monetização e planos

| ID | Requisito | Pri |
|---|---|---|
| RF-150 | O plano gratuito deve permitir monitorar até **15 itens** somando as duas listas, com verificação a cada 12 h. | M |
| RF-151 | O plano pago deve remover o limite, aumentar a frequência de verificação e liberar alerta antecipado e histórico estendido. | S |
| RF-152 | O sistema deve exibir de forma clara e não enganosa o que é link de afiliado. | M |
| RF-153 | O sistema deve processar assinatura via In-App Purchase. | S |
| RF-154 | O sistema deve degradar sem perda de dado ao voltar ao plano gratuito (itens excedentes ficam pausados). | S |

### 5.13 Configurações, transparência e suporte

| ID | Requisito | Pri |
|---|---|---|
| RF-160 | O sistema deve oferecer tela de configuração de notificações (teto, horário de silêncio, tipo de resumo, sensibilidade). | M |
| RF-161 | O sistema deve exibir política de privacidade e termos de uso no app. | M |
| RF-162 | O sistema deve permitir gerenciar consentimentos (analytics, marketing) de forma granular e reversível. | M |
| RF-163 | O sistema deve oferecer canal de suporte/feedback no app. | S |
| RF-164 | O sistema deve funcionar em modo leitura offline, com aviso de desatualização. | S |

### 5.14 Calendário sazonal e recomendação de esperar

| ID | Requisito | Pri |
|---|---|---|
| RF-170 | O sistema deve manter um calendário curado de eventos promocionais de beleza (Black Friday, Cyber Monday, Semana do Consumidor, Dia da Mulher, Dia das Mães, Dia dos Namorados, Natal, Prime Day, 11.11, Boti Week, aniversários de loja), com abrangência, escopo de categorias/marcas e datas confirmadas ou estimadas (RN-19). | M |
| RF-171 | O sistema deve calcular, por produto, categoria e mercado, a **queda mediana histórica** observada em cada evento nas edições anteriores. | M |
| RF-172 | O sistema deve recomendar **esperar** quando as quatro condições de RN-19 forem satisfeitas, informando o evento, a data, a queda esperada e o nível de confiança. | M |
| RF-173 | O sistema **não deve** recomendar esperar quando a data de reposição estimada cair antes do fim do evento mais 7 dias (trava de reposição). | M |
| RF-174 | Quando a trava de reposição impedir a espera, o sistema deve informar que o evento existe e sugerir comprar a quantidade suficiente para atravessar até ele. | S |
| RF-175 | O sistema deve exibir a melhor oferta atual na mesma tela da recomendação de esperar — a recomendação nunca bloqueia a compra. | M |
| RF-176 | O sistema deve permitir criar um lembrete "me avise quando esse evento começar", disparando alerta na data de início. | S |
| RF-177 | O sistema deve exibir, na ficha do produto, os próximos eventos aplicáveis com a queda histórica de cada um, mesmo quando não houver recomendação ativa. | S |
| RF-178 | O sistema deve **verificar ao fim de cada evento** se a previsão se confirmou, registrar o resultado e ajustar o nível de confiança daquele evento. | M |
| RF-179 | O sistema deve exibir à usuária a taxa de acerto histórica das recomendações de esperar. | S |
| RF-180 | O sistema deve rotular claramente eventos com **data estimada** e recomendações de confiança **Média**. | M |
| RF-181 | O sistema não deve enviar push para recomendações de confiança **Informativa** (RN-19). | M |
| RF-182 | O sistema deve permitir à usuária desativar as recomendações de esperar, mantendo os alertas de preço. | S |
| RF-183 | O sistema deve permitir ao Operador cadastrar, editar e datar eventos, e revisar a evidência histórica associada. | M |

---

## 6. Requisitos Não Funcionais

### 6.1 Desempenho

| ID | Requisito | Métrica |
|---|---|---|
| RNF-001 | Abertura a frio até a lista utilizável | ≤ 2,5 s no p90 em Android intermediário (4 GB RAM) |
| RNF-002 | APIs de leitura (listas, ficha de produto) | ≤ 400 ms no p95 |
| RNF-003 | Busca no catálogo | ≤ 800 ms no p95 |
| RNF-004 | Push a partir da detecção da oportunidade | ≤ 5 min no p95 |
| RNF-005 | Elegibilidade de cupom para 1 item | ≤ 200 ms no p95 |
| RNF-006 | Simulação de promoção progressiva e decomposição de kit | ≤ 500 ms no p95 |
| RNF-007 | Consumo de dados móveis | ≤ 5 MB/dia em uso normal |
| RNF-008 | Bateria | fora dos 5 maiores consumidores em uso típico; sem foreground service de polling |

### 6.2 Frescor e qualidade do dado

| ID | Requisito | Métrica |
|---|---|---|
| RNF-010 | Idade máxima do preço sem aviso de desatualização | 6 h |
| RNF-011 | Precisão do preço notificado (bate com a loja no clique) | ≥ 95% |
| RNF-012 | Precisão do cupom classificado como **Vale** | ≥ 97% — falso positivo aqui destrói a confiança, que é o produto inteiro |
| RNF-013 | Precisão do casamento de **variante/tom** | ≥ 98% — alertar o tom errado é tão ruim quanto o cupom errado |
| RNF-014 | Cobertura de catálogo nas categorias do MVP | ≥ 80% dos produtos buscados são encontrados |
| RNF-015 | Falso positivo de alerta de oportunidade | ≤ 3% dos alertas enviados |
| RNF-016 | Oferta de vendedor não confiável que virou push | 0 — é regra dura, não meta |

### 6.3 Confiabilidade e disponibilidade

| ID | Requisito | Métrica |
|---|---|---|
| RNF-020 | Disponibilidade das APIs do app | 99,5% mensal |
| RNF-021 | Falha de um conector não derruba o app nem os demais | degradação isolada e explícita na UI |
| RNF-022 | Perda de dados | RPO ≤ 1 h, RTO ≤ 4 h; backup diário, restauração testada trimestralmente |
| RNF-023 | Entrega de notificação | reenvio com backoff; nada perdido silenciosamente — o não entregue vai para o resumo |

### 6.4 Escalabilidade

| ID | Requisito | Métrica |
|---|---|---|
| RNF-030 | Suportar 50 mil usuárias ativas e 500 mil trios produto-variante-loja monitorados sem replataformar | coleta em fila, escalável horizontalmente |
| RNF-031 | Coleta priorizada por demanda | item monitorado por muitas usuárias e com reposição próxima é coletado com mais frequência |
| RNF-032 | Custo de infraestrutura por usuária ativa/mês | ≤ R$ 0,50 no MVP |
| RNF-033 | Explosão combinatória de variantes | o catálogo deve suportar produtos com até 60 variantes sem degradar a busca |

### 6.5 Segurança

| ID | Requisito |
|---|---|
| RNF-040 | Todo tráfego em HTTPS/TLS 1.2+; certificate pinning nas chamadas ao backend próprio. |
| RNF-041 | Senhas com hash forte (Argon2 ou bcrypt com custo adequado); nunca em log. |
| RNF-042 | Tokens de sessão em armazenamento seguro do SO (Keychain / Keystore), com refresh e revogação. |
| RNF-043 | Dados pessoais criptografados em repouso. |
| RNF-044 | Nenhum dado de cartão ou pagamento é coletado ou trafegado pelo Aptum. |
| RNF-045 | Rate limiting e proteção contra abuso nos endpoints públicos e no envio colaborativo. |
| RNF-046 | Segredos e chaves de API nunca embarcados no app; toda chamada a loja/afiliado sai do backend. |
| RNF-047 | Trilha de auditoria para acessos administrativos ao backoffice. |

### 6.6 Privacidade e conformidade (LGPD)

| ID | Requisito |
|---|---|
| RNF-050 | Base legal declarada por finalidade; consentimento granular e revogável para analytics e marketing. |
| RNF-051 | Minimização: CEP opcional; geolocalização precisa não é coletada. |
| RNF-052 | Direitos do titular atendidos em até 15 dias: acesso, correção, portabilidade e eliminação. |
| RNF-053 | **A lista de produtos de beleza revela dado sensível** — tratamento de acne, queda de cabelo, manchas, envelhecimento, produtos dermatológicos com indicação clínica. Não pode ser vendida nem compartilhada com terceiros para publicidade, e não pode ser usada para segmentação por condição de saúde. |
| RNF-054 | Dados agregados só podem ser usados de forma anonimizada e não reidentificável. |
| RNF-055 | Retenção definida: histórico de preços indefinido (dado de mercado); dados pessoais apagados em até 15 dias após exclusão da conta; backups expurgados em até 90 dias. |
| RNF-056 | Registro das operações de tratamento e nomeação de encarregado (DPO) antes do lançamento público. |
| RNF-057 | Notificação push não pode expor conteúdo sensível na tela bloqueada — o texto padrão usa o nome do produto, e a usuária pode ativar "ocultar nome do produto nas notificações". |

### 6.7 Legal e relação com as fontes

| ID | Requisito |
|---|---|
| RNF-060 | Priorizar sempre a via oficial (API, feed de afiliado, parceria) sobre scraping. |
| RNF-061 | A coleta respeita robots.txt e limites de taxa, e não contorna proteção antibot nem autenticação. |
| RNF-062 | Não replicar conteúdo protegido além do necessário para informar preço, nome e imagem em miniatura, com atribuição e link para a fonte. |
| RNF-063 | Conformidade com o CDC: o preço exibido precisa deixar claras as condições, o prazo, a origem — e que **não inclui frete** (D12). |
| RNF-064 | A classificação de seller como "não confiável" é opinativa e baseada em critérios objetivos publicados; o app não afirma que um produto é falsificado, apenas sinaliza risco. |
| RNF-065 | Conformidade com as políticas de App Store e Google Play, inclusive quanto a IAP e conteúdo de terceiros. |

### 6.8 Usabilidade e acessibilidade

| ID | Requisito |
|---|---|
| RNF-070 | Cadastrar o primeiro produto em ≤ 60 s e ≤ 5 toques (o passo extra é a escolha da variante). |
| RNF-071 | O alerta responde em uma tela: **o quê (e qual tom), por quanto, onde, por que agora, o que fazer**. |
| RNF-072 | WCAG 2.1 AA: contraste, alvos de toque ≥ 44 pt, leitor de tela (TalkBack/VoiceOver) e fonte ampliada até 200%. |
| RNF-073 | Cor de tom **nunca** é o único identificador da variante — sempre acompanhada de nome e código (ex.: "3.5 Bege Médio"), por acessibilidade e por daltonismo. |
| RNF-074 | Interface em português do Brasil, moeda BRL, data no formato brasileiro; arquitetura preparada para i18n. |
| RNF-075 | Nunca exibir "melhor preço" sem mostrar a base de comparação e a data do dado. |
| RNF-076 | Suporte a tema claro e escuro. |

### 6.9 Manutenibilidade e operação

| ID | Requisito |
|---|---|
| RNF-080 | Conectores isolados atrás de uma interface comum; adicionar uma loja não exige alteração no núcleo. |
| RNF-081 | Cobertura de testes ≥ 70% no núcleo de precificação, elegibilidade de cupom, simulação de promoção progressiva, decomposição de kit e motor de alerta. |
| RNF-082 | Observabilidade: logs estruturados, métricas e tracing na cadeia coleta → cálculo → alerta → entrega. |
| RNF-083 | Feature flags por conector, categoria e tipo de alerta, sem novo release. |
| RNF-084 | Regras de negócio (limiares, pesos, tetos, fator de kit, horizonte de estoque) configuráveis sem deploy. |
| RNF-085 | O modelo de dados deve prever os campos de **frete**, **cashback** e **validade/PAO** desde o início, com valor neutro — para ligar as decisões D12/D13/D15 sem migração. |
| RNF-086 | Publicação por CI/CD com canal beta (TestFlight / Play Internal Testing). |

### 6.10 Compatibilidade

| ID | Requisito |
|---|---|
| RNF-090 | Android 9 (API 28) ou superior; iOS 15 ou superior. |
| RNF-091 | Telas de 4,7" a tablets, em orientação retrato. |
| RNF-092 | Degradação graciosa sem conexão (RF-164). |

---

## 7. Métricas de sucesso

| Métrica | Meta no 1º trimestre pós-lançamento |
|---|---|
| Itens monitorados por usuária ativa | ≥ 12 (média das duas listas) |
| Taxa de abertura do push de oportunidade | ≥ 25% |
| Conversão do alerta em compra confirmada | ≥ 10% |
| Cupom marcado "funcionou" entre os classificados **Vale** | ≥ 95% |
| Alertas de tom errado reportados | ≤ 1% |
| Acerto das recomendações de esperar (o preço caiu ≥ o previsto) | ≥ 75% |
| Usuárias que ficaram sem o produto por seguir uma recomendação de esperar | 0 — a trava de reposição existe para isso |
| Economia média declarada por usuária/mês | ≥ R$ 50 |
| Retenção D30 | ≥ 30% |
| Usuárias que desativam notificações | ≤ 10% |

---

## 8. Riscos

| # | Risco | Impacto | Mitigação |
|---|---|---|---|
| R1 | Cupom classificado **Vale** não funciona no checkout | **Crítico** — mata a confiança | Classe "Talvez"; push só para Confirmado (D22); feedback da usuária; RNF-012 |
| R2 | Alerta no tom errado | Alto | Variante como entidade de primeira classe (RN-11); RNF-013; tom vizinho sempre rotulado |
| R3 | **Frete fora do MVP** (D12) faz o app indicar a loja "mais barata" que sai mais cara no total | **Alto** | Aviso obrigatório no encaminhamento (RF-125); campo já modelado (RNF-085) para ligar em uma release |
| R4 | **Recomendação de esperar dá errado**: a usuária segura a compra, o preço não cai (ou sobe) e ela fica sem o produto | **Alto — é o único conselho do app que custa dinheiro se estiver errado** | Trava de reposição obrigatória (RN-19 cond. 3); mínimo de evidência histórica; nível de confiança exibido; verificação pós-evento (RF-178); nunca bloqueia a compra (RF-175) |
| R5 | **Validade ignorada** (D15) + sugestão de estoque faz comprar 3 itens que vencem | Médio | Aceito. Mitigação barata pendente (Q3): texto estático por categoria; teto de 4 unidades já limita o dano |
| R6 | Produto falsificado comprado por indicação do app | **Alto — reputacional e jurídico** | RN-12: só seller confiável vira push; preço suspeito descartado; RNF-064 |
| R7 | Loja bloqueia a coleta ou muda o layout | Alto | Priorizar API/afiliado; saúde por conector (RF-142); suspender alerta em vez de errar |
| R8 | Escopo do MVP grande demais (4 frentes de loja × 4 tipos de promoção) | **Alto — cronograma** | Faseamento F1–F4 da seção 2.1 |
| R9 | Catálogo de beleza com casamento errado entre lojas | Alto | EAN como chave, score de confiança, revisão manual (RF-143/144) |
| R10 | Excesso de notificação | Alto | RN-07, perfis de sensibilidade, resumo |
| R11 | Conflito de interesse do afiliado | Médio / reputacional | RN-09 e RF-152 |
| R12 | Exposição de dado sensível de saúde da pele | Alto / legal | RNF-053, RNF-057, minimização, sem venda de dado |
| R13 | Custo de coleta cresce mais rápido que a receita | Médio | Coleta priorizada por demanda (RNF-031), cache, frequência por plano |

---

## 9. Decisões em aberto

| # | Questão | Precisa decidir até |
|---|---|---|
| Q1 | Quais lojas **exatas** em cada uma das quatro frentes? Sugestão F1: Beleza na Web + Época Cosméticos. | antes da arquitetura |
| Q2 | Aceita o faseamento F1–F4 da seção 2.1, ou quer as quatro frentes simultâneas no piloto? | antes do planejamento |
| Q3 | **Mitigação barata da validade**: aceita um aviso estático por categoria ("máscara de cílios dura ~4 meses depois de aberta") junto da sugestão de estoque? Custa quase nada e reduz o risco R5. | antes do épico de estoque |
| Q4 | Horizonte de estoque de 120 dias e teto de 4 unidades estão certos? | antes do épico de estoque |
| Q5 | Fator de 50% para itens do kit fora das suas listas é razoável? | antes do épico de kit |
| Q6 | Quanto você pagaria por mês no plano pago? | antes do lançamento |
| Q7 | "Ocultar nome do produto na notificação" (RNF-057) deve ser padrão ligado ou desligado? | antes do design de notificações |
| Q8 | Frete e cashback — em qual release pós-MVP entram? | após o piloto |
| Q9 | Lista compartilhada com outra pessoa entra quando? | v2 |
| Q10 | O calendário sazonal deve nascer com quantos eventos? Sugestão: 8 datas de mercado + aniversário das 4 lojas da F1/F2. | antes do épico sazonal |
| Q11 | ~~Sem histórico próprio no primeiro ano, de onde vem a queda esperada?~~ **Respondida** em [03-fontes-de-dados.md §5](./03-fontes-de-dados.md): o Keepa tem histórico retroativo da Amazon BR e permite nascer com confiança Média/Alta. Sem Keepa, o primeiro ano é só "Informativa". Decisão pendente: contratar Keepa (F1). | antes do épico sazonal |
| Q12 | Antecedência de 45 dias e queda mínima de 15% para sugerir esperar estão certas? | antes do épico sazonal |
