# Aptum

App que vigia preço e cupom dos produtos de beleza que a usuária já usa, e só
a chama quando comprar naquele momento é comprovadamente o melhor negócio —
com o cupom já validado para o produto e a variante exatos.

Repositório privado. Visão de produto completa em [`PRODUCT.md`](PRODUCT.md).

## Estrutura

| Pasta          | O que é                                                          |
| -------------- | ---------------------------------------------------------------- |
| `app/`         | App React Native / Expo (Android + iOS)                          |
| `api/`         | API Fastify + Drizzle/Postgres e os coletores de preço           |
| `docs/`        | Requisitos, histórias de usuário, fontes de dados, SDD, protótipos |
| `referencias/` | Referências visuais e de UI/UX                                   |
| `erros/`       | Capturas de bugs em investigação                                 |

## Rodando

Node >= 22 nos dois pacotes.

```bash
# API
cd api
npm install
cp .env.example .env   # preencha as credenciais
npm run db:aplicar
npm run dev

# App
cd app
npm install
npx expo start
```

## Segredos

`api/.env` **nunca** é versionado. Chave de afiliado vazada é conta banida — se
alguma credencial for commitada por engano, ela está comprometida: rotacione, não
basta remover o arquivo. As variáveis necessárias estão em `api/.env.example`.
