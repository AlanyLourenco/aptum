# Aptum — Arquitetura de Coleta de Dados

**Versão:** 0.1
**Data:** 05/09/2026
**Documentos irmãos:** [01-requisitos.md](./01-requisitos.md) · [03-fontes-de-dados.md](./03-fontes-de-dados.md) · [05-dados-ecommerce-flutuacao.md](./05-dados-ecommerce-flutuacao.md)

## Decisões travadas

| # | Decisão | Escolha | Seção |
|---|---|---|---|
| K1 | Coletores | **Conector próprio por loja**, com serviço de terceiro (Apify/SerpApi) apenas como rede de segurança quando um conector cai | §4, §10 |
| K2 | Modo C — descoberta | **Depois do MVP.** O núcleo é vigiar a lista com precisão; descoberta é o que todo mundo já faz | §2, §11 |
| K3 | Onde roda | **Serverless** (Cloud Run / Lambda) — volume baixo e em rajadas encaixa perfeito | §9 |
| K4 | Regras de cupom | **LLM extrai, humano revisa os duvidosos de alto impacto** | §7 |
| K5 | Lista curada do C0 | ⏳ pendente — decisão de usuária, não de engenharia | §11 |
| K6 | Página pública `/bot` | ⏳ pendente — recomendado | §5 |

---

## 1. O nosso bot não é o bot que já existe

Existem muitos robôs de promoção rodando hoje. Vale separar por **o que eles otimizam**, porque isso define a nossa arquitetura por contraste.

| Tipo | Exemplos | Otimiza para | Não tem |
|---|---|---|---|
| **Comunidade / descoberta em largura** | Promobit, Pelando, bots de Telegram | achar qualquer oferta boa, em qualquer lugar | estado do usuário, precisão por item, elegibilidade de cupom |
| **Comparador de catálogo** | Zoom, Buscapé | cobertura ampla de catálogo e preço | lista pessoal, ciclo de consumo, variante/tom |
| **Rastreador de SKU** | Keepa, CamelCamelCamel | profundidade histórica por produto | multi-loja, cupom, beleza |
| **Aptum** | — | **profundidade por variante, em várias lojas, cruzada com o estado da usuária** | cobertura larga (e não queremos) |

### A consequência arquitetural

Os bots de descoberta são **crawl-driven**: o volume é função do tamanho do catálogo das lojas — milhões de páginas. O Aptum é **watchlist-driven**: o volume é função do que as usuárias escolheram monitorar.

Isso é muito menor e muito mais previsível:

| Cenário | SKUs distintos | Pares SKU-loja | Requisições/dia | Por loja |
|---|---:|---:|---:|---:|
| Piloto — 100 usuárias | 420 | 1.680 | 3.360 | **0,01 req/s** |
| 1.000 usuárias | 3.000 | 12.000 | 24.000 | **0,07 req/s** |
| 10.000 usuárias | 14.400 | 57.600 | 115.200 | **0,33 req/s** |
| 50.000 usuárias | 36.000 | 144.000 | 288.000 | **0,83 req/s** |

*Premissas: 12 itens por usuária, 4 lojas, 2 checagens por dia, e sobreposição alta entre listas — beleza tem cabeça forte, muita gente monitora o mesmo protetor solar. O fator de itens distintos cai de 35% no piloto para 6% em escala.*

**Menos de 1 requisição por segundo por loja com 50 mil usuárias.** Isso é tráfego de um usuário humano navegando devagar. Não precisamos de proxy rotativo, de fazenda de IP, nem de nada que se pareça com evasão. A coleta do Aptum é pequena por natureza, e isso é uma vantagem competitiva: dá para ser **educado e transparente**, o que abre a porta para parceria em vez de bloqueio.

---

## 2. Três modos de coleta

Não é um bot só. São três, com naturezas diferentes.

### Modo A — Watchlist *(o núcleo)*
**Pull agendado por prioridade.** Para cada par produto-variante × loja monitorado, buscar preço, disponibilidade e seller.

É o modo que alimenta RN-02 (preço efetivo), RN-03 (histórico) e RN-05 (alerta). É onde está 90% do valor e 90% do risco.

### Modo B — Cupons *(empurrado + puxado)*
Feeds de rede de afiliado (sincronizam ~4×/dia) mais a página de cupons das lojas. Natureza completamente diferente do preço: **preço é número, cupom é texto com regras**. Pipeline próprio, seção 7.

### Modo C — Descoberta *(opcional, raso)*
Varredura leve das vitrines de oferta das lojas — as coleções do tipo "promoções", "mais vendidos", "últimas unidades" — para pegar promoção em produto que **ninguém ainda monitora**.

Alimenta a tela de descoberta e as sugestões de similares. Não gera alerta. É o único modo que se parece com os bots existentes, e é o de menor prioridade.

> A verificação feita na pesquisa mostrou que lojas em VTEX expõem `productClusters` e `clusterHighlights` no retorno público — ou seja, as coleções da loja vêm de graça junto do produto. O Modo C custa quase nada onde a loja é VTEX.

---

## 3. Agendamento por prioridade

Coletar tudo na mesma frequência é desperdício. O requisito RNF-031 já pedia priorização por demanda; aqui está a regra concreta.

### Score de prioridade

```
score = w1 · nº_de_usuárias_monitorando
      + w2 · urgência_de_reposição      (1 se reposição ≤ 14 dias, decai até 0 em 90 dias)
      + w3 · proximidade_do_preço_alvo  (1 se está a ≤ 5% do alvo)
      + w4 · volatilidade_histórica     (frequência de mudança de preço do próprio par)
      + w5 · evento_sazonal_ativo       (1 durante janela de evento aplicável)
      + w6 · plano_pago
```

Os pesos ficam configuráveis sem deploy (RNF-084).

### Faixas de frequência

| Faixa | Frequência | Quem cai aqui |
|---|---|---|
| **P0** | 1–2 h | Reposição próxima, preço colado no alvo, evento sazonal ativo |
| **P1** | 6 h | Item monitorado por várias usuárias, plano pago |
| **P2** | 12–24 h | Plano gratuito, reposição distante — é o padrão contratado (RF-150) |
| **P3** | 72 h | Item pausado, ou mantido só para histórico |

**A volatilidade histórica é o parâmetro mais elegante e o mais esquecido.** Um produto cujo preço não muda há 60 dias não precisa ser checado de hora em hora. Ele se auto-rebaixa. Isso corta o volume real bem abaixo da tabela da seção 1 — e o quanto exatamente é uma das medições do plano de análise (Billion Prices Project: duração mediana de um preço).

---

## 4. O contrato do conector

O núcleo não conhece loja nenhuma. Toda loja implementa a mesma interface (RF-140).

```
interface ConectorLoja {
  buscarProduto(consulta)            -> [ProdutoCandidato]
  obterOferta(idExterno, cep?)       -> Oferta
  obterCupons()                      -> [CupomBruto]
  obterVitrines()                    -> [Coleção]        // Modo C, opcional
  saude()                            -> { ok, latenciaP95, ultimoSucesso, taxaParse }
}

Oferta {
  preco, precoDe, disponivel, quantidade,
  sellerId, sellerNome, sellerTipo,
  ean, nomeRetornado, varianteRetornada,      // ← para o fingerprint, seção 6
  url, origem, coletadoEm
}
```

### Escada de acesso — do melhor para o pior

| Nível | Tipo | Custo de manutenção | Observação |
|---|---|---|---|
| 1 | **Feed de afiliado** | baixíssimo | autorizado, e ainda monetiza. É a via que a RNF-060 manda preferir |
| 2 | **API oficial** | baixo | Mercado Livre tem; Amazon exige Creators API com aprovação |
| 3 | **Endpoint público de plataforma** | baixo | VTEX `/api/catalog_system/pub/...` — verificado funcionando, traz EAN, preço, variante e seller |
| 4 | **HTML renderizado no servidor** | médio | parser quebra quando a loja muda o layout |
| 5 | **Página que exige JS** | alto | headless, caro em CPU e em fragilidade. Último recurso |
| 6 | **Terceiro** (Apify, SerpApi, Oxylabs) | baixo, mas pago | rede de segurança quando o conector próprio cai |

**Regra de decisão:** nunca subir um nível na escada sem antes tentar todos os anteriores. E se a loja bloqueia no nível 3–5, a resposta é nível 1 (parceria/afiliado) ou **ficar de fora** — nunca escalar para evasão. O caso concreto já conhecido é a Beleza na Web, que bloqueou o acesso público nos dois testes.

---

## 5. Coleta educada — e a linha que não se cruza

| Prática | Regra |
|---|---|
| Identificação | `User-Agent: AptumBot/1.0 (+https://aptum.app/bot)`, com página explicando quem somos e como pedir exclusão |
| `robots.txt` | respeitado, incluindo `Crawl-delay` |
| Taxa | teto de 1 req/s por domínio, com jitter. A conta da seção 1 mostra que nem chegamos perto |
| Cache | `ETag` e `If-Modified-Since` sempre que a loja suportar — resposta 304 é coleta grátis para os dois lados |
| Erros | backoff exponencial em 429 e 5xx; `Retry-After` obedecido |
| Janela | o grosso da coleta P2/P3 na madrugada; P0 distribuído no dia |
| Volume | só o que está na watchlist. Nunca varredura de catálogo inteiro |

### O que não fazemos

- ❌ Rotação de proxy residencial para contornar bloqueio
- ❌ Resolver CAPTCHA
- ❌ Fingerprint de navegador falsificado para parecer humano
- ❌ Acessar API privada de app de terceiro (vale inclusive para as bases estaduais de nota fiscal — os wrappers que existem no GitHub consomem a API privada do app, e não vamos por aí)
- ❌ Login em conta de usuária para ler preço logado

Isso não é só ética — é estratégia. Um bot educado e identificado pode virar parceiro de afiliado. Um bot que burla antibot vira processo e bloqueio permanente. E a conta da seção 1 mostra que **não precisamos** de nada disso.

---

## 6. O modo de falha que mata o produto

Esta é a seção mais importante do documento.

**O jeito mais comum de um rastreador de preço destruir a confiança do usuário não é ficar fora do ar. É gravar uma falha de parse como se fosse queda de preço.** A loja muda o layout, o seletor pega o elemento errado, o campo vem vazio, e o sistema registra R$ 0,00 — e dispara um push de "queda de 100%!" para 4 mil pessoas.

Nada no documento de requisitos é tão importante quanto isso, porque um único episódio desses desfaz meses de credibilidade.

### Portões de sanidade — obrigatórios antes de gravar

| # | Portão | Rejeita |
|---|---|---|
| 1 | **Faixa plausível** | preço ≤ 0, ou fora de 5%–500% da mediana de 90 dias do par |
| 2 | **Fingerprint do item** | EAN, nome ou variante retornados não batem com o esperado — a loja pode ter trocado o produto naquela URL. **Não é queda de preço, é outro produto** |
| 3 | **Coerência interna** | `preco > precoDe`, moeda errada, unidade divergente do catálogo |
| 4 | **Confirmação dupla** | variação acima de um limiar exige **segunda leitura independente** antes de virar alerta |
| 5 | **Quebra em massa** | se mais de N% dos itens de uma loja mudaram na mesma rodada, é parser quebrado, não liquidação: suspende a loja (RF-142) e avisa a operação |
| 6 | **Sanidade de mercado** | preço abaixo de 40% da mediana de mercado não vira alerta — já é a RN-12, aqui reaproveitada como detector de erro |

### A regra que resolve o empate

> **Na dúvida, não alertar.** Suspender um conector e mostrar "não conseguimos confirmar este preço agora" é sempre melhor do que mandar um push errado. O custo de um alerta perdido é uma oportunidade; o custo de um alerta falso é uma usuária.

Isso vira teste automatizado obrigatório (RNF-081): cada portão tem caso de teste com dado sintético de falha.

---

## 7. Cupons — pipeline separado

Preço é número. Cupom é **texto jurídico com regras**. Misturar os dois no mesmo pipeline é erro de arquitetura.

```
1. INGESTÃO      feeds de afiliado (Lomadee, Awin, Afilio) + página de cupons da loja
        ↓
2. EXTRAÇÃO      LLM converte o regulamento em JSON estruturado:
                 { marcas_excluidas[], categorias_incluidas[], valor_minimo,
                   seller, vigencia, primeira_compra, meio_pagamento, teto }
        ↓
3. PORTÃO        todo campo não extraído fica explicitamente "desconhecido"
                 → qualquer desconhecido rebaixa o cupom para "Talvez" (RN-04)
        ↓
4. AVALIAÇÃO     motor determinístico casa a regra contra cada item monitorado
        ↓
5. FILA HUMANA   "Talvez" de alto impacto (afeta muitos itens) vai para o Operador
        ↓
6. FEEDBACK      usuária marca funcionou / não funcionou → reclassifica (RF-057)
        ↓
7. VERSÃO        toda alteração de regra preserva a anterior (RF-147)
```

### Dois princípios

**O LLM extrai, não decide.** A classificação Vale / Talvez / Não vale sai de regra determinística (RN-04) sobre campos estruturados. Um modelo de linguagem opinando direto sobre elegibilidade é exatamente o tipo de não-determinismo que não cabe num produto cuja promessa é "eu tenho certeza".

**Campo ausente nunca é campo permissivo.** Se não conseguimos ler a lista de marcas excluídas, o cupom não é "Vale" — é "Talvez". Esse é o comportamento que a pesquisa mostrou ser necessário: **nenhum feed de afiliado entrega marcas excluídas de forma estruturada**, e em beleza essa é justamente a exclusão mais comum.

---

## 8. Armazenamento

### Gravar mudança, não leitura

Uma leitura idêntica à anterior **não gera linha nova** — só atualiza `visto_em`. Com preços que mudam a cada semanas, isso reduz o volume em uma ou duas ordens de grandeza.

```
observacao_preco     (variante_id, loja_id, seller_id, preco, preco_de,
                      disponivel, peu, origem, confianca, coletado_em)

janela_preco         (variante_id, loja_id, preco, inicio, fim)
                     ← derivada dos deltas; é o que torna P10 e mediana baratos

agregado_diario      (variante_id, loja_id, p10_90d, mediana_90d, pico_90d,
                      calculado_em)
                     ← recomputado uma vez por dia, não a cada consulta
```

A tabela `janela_preco` é o modelo de *price spell* usado na literatura de rigidez de preço — é a mesma estrutura que os microdados do Billion Prices Project usam, o que facilita reaproveitar a metodologia de medição.

### Indisponibilidade é estado, não lacuna

Produto esgotado grava `disponivel = false` com o preço da última leitura válida. Isso já está na RF-039, e é o que evita o viés de sobrevivência apontado nos riscos analíticos do estudo: o que esgota costuma ser justamente o que estava barato, e tratar isso como buraco na série puxa a mediana para cima.

---

## 9. Infraestrutura mínima

```
  ┌─ Agendador ─────────┐   calcula score, enfileira por faixa P0..P3
  │  (cron por faixa)   │
  └──────────┬──────────┘
             ↓
  ┌─ Fila ──────────────┐   uma fila por loja → isola falha e respeita rate limit
  └──────────┬──────────┘
             ↓
  ┌─ Workers ───────────┐   executam o conector, aplicam os 6 portões
  │  (por loja)         │   circuit breaker por conector
  └──────────┬──────────┘
             ↓
  ┌─ Normalização ──────┐   PEU (RN-02), casamento de variante, classificação de seller
  └──────────┬──────────┘
             ↓
  ┌─ Persistência ──────┐   delta + janela + agregado
  └──────────┬──────────┘
             ↓
  ┌─ Motor de alerta ───┐   RN-05, anti-spam RN-07, janela de inflação RN-19
  └─────────────────────┘
```

**Observabilidade obrigatória por conector** (RF-141): taxa de sucesso, latência p95, **taxa de parse válido**, itens rejeitados por cada portão, última coleta bem-sucedida. A taxa de parse é a métrica que detecta a quebra silenciosa antes do usuário.

**Feature flag por conector** (RNF-083): desligar uma loja sem release.

---

## 10. Construir, alugar ou comprar

| Loja / caso | Recomendação | Por quê |
|---|---|---|
| Loja em VTEX que responde ao endpoint público | **construir** | conector de poucos dias, dado estruturado com EAN e variante |
| Mercado Livre | **construir** | API oficial documentada |
| Amazon | **alugar tempo** — abrir Creators API já | aprovação e cota dependem de vendas, é ciclo de meses |
| Shopee | **construir** | Open API de afiliado com GraphQL; mas não traz atributo de tom |
| Loja que bloqueia (ex.: Beleza na Web) | **parceria de afiliado** ou ficar de fora | não escalar para evasão |
| Histórico retroativo | **comprar** (Keepa) | não há alternativa aberta |
| Rede de segurança quando um conector cai | **alugar** (Apify / SerpApi) | melhor um dado de terceiro rotulado do que nenhum |
| Preço de mercado como referência | **avaliar comprar** (Precifica / InfoPrice) | pode sair mais barato que manter conectores |

---

## 11. Roadmap de coleta

| Fase | Entrega | Depende de |
|---|---|---|
| **C0 — agora** | Coletor mínimo sobre lista curada, 1 loja VTEX, gravando preço diário. Sem app, sem alerta. Só série. | definir a lista curada |
| **C1** | Contrato de conector + fila + os 6 portões + observabilidade. Segunda loja. | C0 |
| **C2** | Pipeline de cupom com extração e fila humana. | C1 |
| **C3** | Agendamento por score, faixas P0–P3, volatilidade histórica. | 90 dias de série |
| **C4** | Modo C (descoberta) e conectores de marketplace. | C2 |

**C0 não depende de nenhuma decisão de produto pendente** e é a recomendação de maior retorno do estudo: cada semana sem coletar é uma semana de histórico que não volta.

---

## 12. Decisões em aberto

| # | Questão |
|---|---|
| K1 | Construir os coletores em casa ou apoiar em serviço de raspagem (Apify/Oxylabs) desde o começo? |
| K2 | O Modo C (descoberta) entra no MVP ou fica para depois? |
| K3 | Onde roda? Serverless (Cloud Run/Lambda) ou container fixo? Muda custo e complexidade. |
| K4 | Extração de regra de cupom com LLM desde o C2, ou 100% curadoria humana no piloto? |
| K5 | Qual a lista curada de produtos do C0 — decisão de usuária, não de engenharia. |
| K6 | Publicamos a página `/bot` com política de coleta? Recomendo que sim: é o que transforma "raspador" em "parceiro em potencial". |
