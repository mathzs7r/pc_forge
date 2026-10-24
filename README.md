# Chutaki — marketplace de artigos esportivos

Marketplace full-stack (frontend + backend + MySQL) para compra e venda de artigos esportivos, com painéis de cliente, loja e administrador.

> **Nota:** este README foi gerado/atualizado automaticamente a partir do estado atual do código. Ajuste nomes, URLs e variáveis conforme o seu ambiente.

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | HTML5, CSS3, JavaScript (vanilla) |
| Backend | Node.js + Express |
| Banco | MySQL |
| Auth | JWT + bcrypt |
| Upload | Multer (imagens de produto/loja) |

---

## Estrutura do projeto

```
pc_forge/
├── backend/                 # API Node/Express
│   ├── routes/              # Rotas (produtos, lojas, clientes, carrinho, perfil, admin)
│   ├── utils/               # Auth, senha, imagem, erros, documentos
│   ├── server.js
│   ├── db.js
│   ├── migration.js
│   ├── package.json
│   └── .env.example
├── frontend/                # Páginas e assets estáticos
│   ├── assets/
│   │   ├── css/
│   │   ├── js/
│   │   └── img/
│   ├── *.html               # login, produtos, carrinho, painéis etc.
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   ├── migrations/          # Migrações numeradas
│   └── dump/
├── docs/
├── package.json             # Scripts raiz (opcional)
└── README.md
```

---

## Pré-requisitos

- Node.js 18+
- MySQL 8+
- Conta/API keys se for usar integrações externas (ex.: RapidAPI — ver `docs/`)

---

## Configuração rápida

### 1. Banco de dados

```bash
mysql -u root -p < database/schema.sql
# opcional: dados de teste
mysql -u root -p < database/seed.sql
# aplicar migrações (na ordem)
for f in database/migrations/*.sql; do mysql -u root -p < "$f"; done
```

Ou use o script de migração do backend (veja `backend/migration.js`).

### 2. Backend

```bash
cd backend
cp .env.example .env
# edite .env com DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET etc.
npm install
npm run dev   # ou npm start
```

A API sobe em geral em `http://localhost:3000` (confira `server.js` / `.env`).

### 3. Frontend

Sirva a pasta `frontend/` com qualquer servidor estático, por exemplo:

```bash
cd frontend
npx serve .
# ou
python -m http.server 8080
```

Configure a URL base da API no frontend (geralmente em `frontend/assets/js/api.js`).

---

## Variáveis de ambiente (backend)

Veja `backend/.env.example`. Principais:

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`
- `PORT`
- caminhos/limites de upload de imagem

**Nunca commite o arquivo `.env` real.**

---

## Funcionalidades principais

- Catálogo de produtos com busca/filtros
- Carrinho de compras
- Cadastro e login de clientes e lojas
- Painel da loja (produtos, pedidos, perfil)
- Painel administrativo
- Upload de imagens (produto / logo da loja)
- Avaliações (conforme migrações)
- Soft delete de produtos e logs de exclusão

---

## Scripts úteis (backend)

- `node migration.js` — aplica migrações
- `node gerar-catalogo.js` / seeds de fotos — popular catálogo
- `node gerar-hash.js` — gerar hash de senha para testes

---

## Licença / uso

Projeto educacional / demonstração. Ajuste conforme necessário antes de produção (segurança, CORS, rate limit, HTTPS, etc.).
