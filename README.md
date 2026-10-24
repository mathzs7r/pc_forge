# PC Forge

Marketplace full-stack de componentes e periféricos de PC. Clientes compram, lojas vendem e um painel administrativo gerencia o sistema.

## Stack

| Camada     | Tecnologia                          |
|------------|-------------------------------------|
| Frontend   | HTML5, CSS3, JavaScript (vanilla)   |
| Backend    | Node.js + Express                   |
| Banco      | MySQL 8+                            |
| Auth       | Token assinado (AUTH_SECRET) + bcryptjs |
| Imagens    | BLOB no MySQL + suporte a URL       |

## Estrutura do projeto

```
pc_forge/
├── backend/
│   ├── routes/           # clientes, lojas, produtos, carrinho, perfil, admin
│   ├── utils/            # auth, senha, imagem, erros, documentos
│   ├── server.js         # sobe a API (e roda migração automática)
│   ├── db.js             # pool MySQL
│   ├── migration.js      # aplica schema + migrations
│   ├── seed-fotos-*.js   # scripts para popular imagens do catálogo
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── assets/
│   │   ├── css/
│   │   ├── js/
│   │   └── img/
│   └── *.html            # páginas (catálogo, login, painéis, carrinho...)
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   ├── migrations/       # 001 … 009
│   ├── dump/
│   └── README-CATALOGO.md
├── docs/
└── package.json
```

## Pré-requisitos

- Node.js 18+
- MySQL 8+

## Configuração rápida

### 1. Banco de dados

Crie o banco (ou deixe o `migration.js` criar):

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS pc_forge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edite o .env: DB_PASSWORD, AUTH_SECRET, etc.
npm install
npm start          # roda migration + sobe a API (porta 3000)
# ou
npm run migrate    # só atualiza o banco
npm run dev        # nodemon (sem migration automática)
```

Variáveis importantes no `.env`:

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `PORT` (padrão 3000)
- `AUTH_SECRET` — texto longo e aleatório (mín. 16 caracteres)

**Nunca faça commit do arquivo `.env` real.**

### 3. Frontend

Sirva a pasta `frontend/` com qualquer servidor estático:

```bash
cd frontend
npx serve .
# ou
python -m http.server 8080
```

A URL da API está centralizada em `frontend/assets/js/api.js` (`API_URL = "http://localhost:3000"`).

### Diagnóstico

Abra `http://localhost:3000/saude` para ver se a API enxerga o banco e se as colunas estão atualizadas.

## Funcionalidades

- Catálogo público de produtos (filtros, busca, página do produto)
- Carrinho de compras do cliente + finalização
- Cadastro/login de **Cliente** e de **Loja**
- Painel da loja (CRUD de produtos, perfil, logo)
- Painel administrativo (dashboard, listagens, exclusão/restauração lógica)
- Upload de imagens de produto (BLOB + tipo MIME)
- Avaliações de produto (nota + comentário)
- Soft-delete de produtos e logs de exclusão
- Página pública da loja

## Scripts úteis (pasta backend)

| Comando                    | O que faz                                      |
|----------------------------|------------------------------------------------|
| `npm start`                | Migration + sobe a API                         |
| `npm run migrate`          | Só aplica schema + migrations pendentes        |
| `npm run migrate:seed`     | Migration + seed básico                        |
| `npm run seed:fotos`       | Preenche fotos do catálogo (placeholder)       |
| `npm run seed:reais`       | Tenta buscar fotos reais (Bing)                |
| `npm run gerar:catalogo`   | Gera dados de catálogo                         |
| `npm run hash`             | Gera hash bcrypt de uma senha (testes)         |

## Rotas principais da API

- `GET  /produtos` / `GET /produtos/:id` / `GET /produtos/:id/imagem`
- `POST /produtos` (loja autenticada)
- Carrinho: `/carrinho/...` (cliente autenticado)
- Perfil: `/perfil/cliente/...` e `/perfil/loja/...`
- Admin: `/admin/...` (administrador autenticado)
- `GET /saude` — health check do banco

## Observações

- O frontend é 100% vanilla (sem framework).
- A migration roda automaticamente no `npm start`.
- Imagens de produto ficam no banco (MEDIUMBLOB). Listagens não trazem os bytes — só um flag `TEM_IMAGEM` e um `IMG_VERSAO` para cache-busting.
- Projeto voltado para estudo / demonstração. Antes de produção: HTTPS, rate-limit, CORS restrito, secrets fortes, backups, etc.

## Licença

ISC
