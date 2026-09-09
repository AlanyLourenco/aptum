# Aptum — plano de conclusão do frontend

**Meta:** frontend completo, navegável, com estado real e sem erro de tipo, de lint ou de bundle.
**Escopo:** só a interface. Sem backend, sem autenticação real, sem coleta. Dados mockados que se comportam como dados de verdade.

**Verificação a cada fase:** `npx tsc --noEmit` limpo · bundle compila · detector do impeccable sem achado real.

Legenda: `[ ]` a fazer · `[~]` em andamento · `[x]` pronto

> **Fechado em 06/09/2026.** 25 de 25. `tsc --noEmit` limpo · `expo lint` sem aviso ·
> bundle compila · detector do impeccable com 0 achados · 20 rotas respondendo 200.

---

## Fase 1 — Estado

Hoje tudo é leitura de constante. Nada guarda, nada muda.

- [x] **T1 · Store** — Zustand com as fatias: produtos monitorados, listas, favoritos, sacola "vou levar", tons aceitos, filtros ativos, ordenação.
  *Pronto quando:* `src/store/useAptum.ts` existe e expõe ações tipadas.
- [x] **T2 · Persistência** — AsyncStorage via middleware `persist`, com versão de schema e migração vazia.
  *Pronto quando:* fecha e reabre o app e a lista continua igual.
- [x] **T3 · Semear o estado** — o catálogo de `data/catalog.ts` vira o estado inicial, sem duplicar fonte de verdade.
  *Pronto quando:* nenhuma tela importa `products` direto; todas leem do store.

## Fase 2 — As telas existentes passam a funcionar

- [x] **T4 · Favoritar** — o coração no cartão e na ficha alterna e persiste.
- [x] **T5 · Filtro de estado** — "Em promoção", "Tem cupom", "Vai acabar", "No preço-alvo" filtram a grade de verdade, e o contador mostra o número real.
- [x] **T6 · Filtro de categoria** — as abas do topo filtram.
- [x] **T7 · Ordenação** — folha de opções: maior queda, menor preço por unidade, acaba antes, nome.
- [x] **T8 · Vou levar** — adicionar e remover item, ajustar quantidade, agrupar por loja, recalcular total e economia.
- [x] **T9 · Tons vizinhos** — aceitar e remover persiste, e o alerta de tom vizinho passa a existir só para os aceitos.
- [x] **T10 · Cupom funcionou** — na tela do cupom, marcar "funcionou" ou "não funcionou"; um "não funcionou" rebaixa o cupom para "talvez" na hora.

## Fase 3 — As telas que faltam

- [x] **T11 · Buscar produto** (`/adicionar`) — campo de busca, resultados filtrados, atalhos para escanear e colar link, estado vazio com saída.
- [x] **T12 · Escanear** (`/adicionar/escanear`) — visor simulado e o estado honesto de "produto não encontrado" com cadastro manual.
- [x] **T13 · Detalhe da lista** (`/lista/[id]`) — abre a lista, mostra os itens, permite mover para outra lista e remover.
- [x] **T14 · Criar lista** (`/lista/nova`) — nome, ícone e regra de alerta: reposição ou desejo.
- [x] **T15 · Centro de alertas** (`/alertas`) — histórico, filtro por estado, cada item abre o alerta.
- [x] **T16 · Planos** (`/planos`) — gratuito contra pago, com a frase de que item excedente é pausado e não apagado.
- [x] **T17 · Registrar compra** (`/compra/[id]`) — loja, data, preço pago, quantidade, variante. Alimenta o histórico.
- [x] **T18 · Histórico de compras** (`/historico`) — agrupado por mês, com preço pago e preço por unidade.
- [x] **T19 · Onboarding e entrada** (`/entrada`) — abertura com a marca, três telas de valor e o pedido de permissão explicado.

## Fase 4 — Acabamento

- [x] **T20 · Estados vazios** — toda lista vazia tem texto próprio e uma ação. Nenhuma ilustração genérica.
- [x] **T21 · Carregando e erro** — esqueleto na grade e um estado de falha que diz o que houve e como sair dele.
- [x] **T22 · Acessibilidade** — varredura: rótulo em todo controle, papel correto, alvo de 44px, tom nunca só por cor.
- [x] **T23 · Lint e formatação** — `expo lint` sem aviso.
- [x] **T24 · Detector do impeccable** — rodar sobre `src/` e resolver o que for real.
- [x] **T25 · Passada final** — tsc limpo, bundle compila, navegação entre todas as telas conferida uma a uma.

---

## Fora deste plano, de propósito

Backend, autenticação real, coleta de preço, notificação push de verdade, câmera de código de barras, pagamento. Tudo isso depende de decisão que já está registrada em `docs/01-requisitos.md` e não é trabalho de frontend.
