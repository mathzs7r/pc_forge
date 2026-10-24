# Chutaki — Marketplace de peças de TI (PC Forge)

Marketplace estilo "Shopee de componentes de informática": clientes compram peças e
acessórios de computadores, e qualquer loja pode criar uma conta e começar a vender.
O projeto tem duas frentes de login/cadastro (Cliente e Loja), com uma barra no topo pra
alternar entre as duas.

## Funcionalidades

### 🛒 Catálogo e vitrine

- Página inicial (`frontend/produtos.html`) com a **vitrine de produtos**.
- Filtros: nome (busca parcial), categoria, faixa de preço (`preco_min` / `preco_max`),
  ordenação (`menor_preco` / `maior_preco`) e paginação (`?pagina=2`, 10 por página).
- O total de resultados achados pelos filtros é devolvido no header `X-Resultados-Total`.
- Categorias em `GET /produtos/categorias`.
- Detalhe do produto (`frontend/produto.html?id=N`): dados do produto, loja vendedora e
  médias de avaliações (do produto e da loja).
- Avaliações de produto (`GET /produtos/:id/avaliacoes` e `POST /produtos/:id/avaliacao`):
  nota de 1 a 5 + comentário (máx. 1000 caracteres). Só quem comprou o produto pode
  avaliar; se já avaliou, atualiza a mesma (upsert). Lista no máximo 60 avaliações.

### 🏬 Lojas e clientes

- Cadastro/login de **loja** (com CNPJ, endereço, e-mail, celular e senha) e de
  **cliente** (com CPF, data de nascimento, e-mail, celular e senha).
- Perfil da loja (`frontend/perfil-loja.html`): dados de cadastro, números (produtos à
  venda, pedidos recebidos, itens vendidos e faturamento), vendas recentes, edição com
  senha atual e o texto "Sobre a loja" (até 500 caracteres).
- Página pública da loja (`frontend/loja.html?id=N`): qualquer visitante vê nome, "sobre",
  tempo de loja e produtos. CNPJ, e-mail, celular e endereço **não** aparecem lá. Na
  vitrine, o nome da loja em cada produto é um link pra essa página.
  `GET /produtos?loja=N` filtra a vitrine pela loja.

### 🔐 Autenticação e segurança

- Login (de cliente ou loja) devolve um **token assinado** (HMAC-SHA256, válido 12 horas)
  que deve ser enviado nas rotas protegidas como `Authorization: Bearer <token>`.
- As rotas de carrinho e perfil exigem o token **e** que ele seja do dono do recurso
  (cliente 5 não abre o carrinho do 6; sem token → 401; token de outra conta → 403).
- O segredo da assinatura é o `AUTH_SECRET` do `backend/.env`. Sem ele a API usa um segredo
  temporário e avisa no terminal.
- Admin: modal "Acesso restrito" (clique na **logo**) → `POST /admin/login` (usuário `adm`,
  senha guardada no servidor como hash bcrypt) → token do tipo `adm`. Rotas `/admin/...`
  exigem esse token.

### 🧺 Carrinho e pedidos

- Carrinho em `CARRINHO_ITEM`, preso à conta: abrir em outro navegador mostra o mesmo
  carrinho.
- Adicionar (soma se já existe), alterar quantidade (1 a 99), remover, esvaziar.
- Ao finalizar: escolher endereço de entrega + forma de pagamento
  (pix, cartão de crédito, cartão de débito, boleto) e clicar em **Finalizar compra** —
  tudo numa transação que grava a `COMPRA`, os itens em `POSSUI` (com o preço do momento)
  e esvazia o carrinho.
- Ainda **não existe cobrança real nem controle de estoque**: o pedido só é registrado
  (a tela avisa isso).

### 🖼️ Fotos de produto

- No painel da loja, o formulário de produto tem o campo **Foto do produto** (opcional):
  escolher a imagem, ver o preview, salvar. Ao editar dá pra trocar a foto ou clicar em
  **Remover foto**.
- A foto chega em **base64** (data URL ou base64 puro) até o back-end, que valida o tamanho
  (máx. 5 MB) e o formato real do arquivo (magic bytes — JPG, PNG, WEBP ou GIF; SVG fica de
  fora de propósito). O **front-end** já reduz na hora (canvas, lado maior até 1200 px, JPEG)
  antes de enviar, pra não mandar foto de celular de 5 MB.
- A foto fica no BLOB `PRODUTO.IMAGEM` (`MEDIUMBLOB` + `PRODUTO.IMAGEM_TIPO`), ou na coluna
  `PRODUTO.IMAGEM_URL` quando a foto é de origem externa.
- Listas **não** trazem os bytes da foto; a foto é buscada em `GET /produtos/:id/imagem`
  (com `?v=` no cache-busting). Sem foto, a vitrine e o painel mostram o ícone da categoria.

### 🛠️ Admin

- Modal "Acesso restrito" (clique na logo) → login do admin (`adm`) → painel
  (`frontend/painel-admin.html`) com:
  - Visão geral: lojas, clientes, acessos (hoje/semana/total), produtos vendidos e faturamento.
  - Listas de lojas parceiras e clientes cadastrados.

## Stack

- **Backend:** Node.js + Express + `mysql2` (pool de conexão) + autenticação via token
  assinado (HMAC-SHA256) + `bcryptjs` para senhas.
- **Frontend:** HTML, CSS e JavaScript puros (vanilla), sem framework — as páginas vivem
  em `frontend/` e conversam com a API via `fetch`.
- **Banco:** MySQL (schema versionado em `database/schema.sql` + migrações).

## Estrutura do projeto

```
pc_forge/
├── backend/
│   ├── server.js                 # sobe a API (e roda a migração antes)
│   ├── db.js                     # pool de conexão MySQL
│   ├── migration.js              # roda schema + migrações pendentes (+ seed opcional)
│   ├── gerar-catalogo.js         # regenera o SQL da migração 005 (nomes/preços)
│   ├── gerar-hash.js             # gera hash bcrypt de senha pro admin/testes
│   ├── seed-fotos-catalogo.js   # grava fotos placeholder no BLOB dos produtos
│   ├── seed-fotos-reais.js      # grava fotos reais nos produtos
│   ├── package.json
│   ├── .env.example
│   ├── routes/
│   │   ├── admin.js              # login do admin, visão, lojas, clientes, log de acessos
│   │   ├── carrinho.js           # carrinho + finalizar compra
│   │   ├── clientes.js           # cadastro/login/consulta de cliente
│   │   ├── lojas.js              # cadastro/login de loja + páginas públicas
│   │   ├── perfil.js             # perfis (cliente e loja) + endereços + pedidos/vendas
│   │   └── produtos.js           # catálogo, detalhe, avaliações, foto, CRUD de produto
│   └── utils/
│       ├── auth.js               # token assinado + middleware exigirLogin
│       ├── documentos.js         # CPF/CNPJ/e-mail com ou sem máscara
│       ├── erros.js              # traduz erro do MySQL em mensagem útil
│       ├── imagem.js             # valida foto (JPG/PNG/WEBP/GIF, até 5 MB)
│       └── senha.js              # hash/verificação de senha (bcryptjs)
├── database/
│   ├── schema.sql                # script do banco (MySQL)
│   ├── seed.sql                  # produtos/lojas de exemplo
│   ├── catalogo-meta.json       # metadados do catálogo completo
│   ├── README-CATALOGO.md       # detalhes do catálogo (migração 005)
│   ├── migrations/
│   │   ├── 001_produto_exclusao_logica.sql  # exclusão lógica (ATIVO)
│   │   ├── 002_cliente_teste.sql             # cliente de teste
│   │   ├── 003_produto_imagem_blob.sql     # foto do produto em BLOB
│   │   ├── 004_carrinho_e_perfil.sql       # CARRINHO_ITEM + LOJA.DESCRICAO
│   │   ├── 005_catalogo_completo.sql       # 3 lojas parceiras + 400 produtos
│   │   ├── 006_avaliacoes.sql              # tabela AVALIACAO (estrelas)
│   │   ├── 007_loja_logo.sql               # logo da loja em BLOB
│   │   ├── 008_admin_acessos.sql          # tabela ACESSO_LOG
│   │   └── 009_produto_imagem_url.sql     # foto do produto via URL
│   └── dump/
│       └── pc_forge_dump.sql     # dump pronto (schema + dados)
├── docs/
│   └── rapidapi-colecao.json    # coleção para importar no RapidAPI Client
├── frontend/
│   ├── produtos.html             # PÁGINA INICIAL — catálogo
│   ├── produto.html              # detalhe do produto (avaliacoes, vendedor, comprar)
│   ├── loja.html                 # página PÚBLICA de uma loja (loja.html?id=1)
│   ├── carrinho.html             # carrinho + finalizar compra
│   ├── login.html                # login de CLIENTE
│   ├── cliente-cadastro.html     # cadastro de CLIENTE
│   ├── loja-login.html           # login de LOJA (ponto de entrada do painel)
│   ├── loja-cadastro.html        # cadastro de LOJA
│   ├── painel-loja.html          # painel da LOJA — cadastrar/editar/excluir produtos
│   ├── painel-admin.html         # painel do ADMINISTRADOR
│   ├── perfil-cliente.html       # PERFIL do cliente (dados, endereços, pedidos)
│   └── perfil-loja.html          # PERFIL da loja (dados, números, vendas)
│   └── assets/
│       ├── css/                   # base, navbar, forms, catalog, produto, carrinho,
│       │                         # perfil, painel, modal, toast
│       └── js/                    # api, util, toast, demo, admin-modal, navbar, cep,
│                                 # produtos, produto, loja-publica, carrinho,
│                                 # carrinho-api, perfil-*, painel-*, login,
│                                 # loja-*, cliente-cadastro
└── package.json
```

## ✅ Pré-requisitos

- **Node.js** (18 ou mais recente) — [nodejs.org](https://nodejs.org)
- **MySQL** (Workbench, XAMPP ou MySQL Server) — o banco usado é `pc_forge`

## 🚀 Como rodar

### 1. Banco de dados

Dentro da raiz do projeto, crie o banco e as tabelas:

```bash
mysql -u root -p < database/schema.sql
```

Ou, se preferir, abra o `database/schema.sql` no MySQL Workbench e rode por lá (ícone de
⚡). Depois (opcional) popula com produtos de exemplo:

```bash
mysql -u root -p pc_forge < database/seed.sql
```

### 2. Backend (a API)

```bash
cd backend
npm install
copy .env.example .env        # Mac/Linux: cp .env.example .env
```

No `backend/.env`, coloque a senha do seu MySQL em `DB_PASSWORD` e, se quiser, um
`AUTH_SECRET` com pelo menos 16 caracteres (o token de login usa essa chave).

Suba a API — o `npm start` roda a migração automaticamente e só sobe se o banco estiver
pronto:

```bash
npm start
```

No terminal você deve ver `✅ Conectado ao MySQL` e `API rodando na porta: 3000`.

### 3. Frontend (o site)

Evite abrir o HTML direto via `file://` — o `fetch` para a API pode ser bloqueado. Sirva a
pasta `frontend` por HTTP:

```bash
cd frontend
npx serve -l 5500
# ou: python -m http.server 5500
# ou: VS Code → "Open with Live Server"
```

Depois abra: **http://localhost:5500**

### 4. Testar

1. Com a API no ar, acesse **http://localhost:3000/saude** — deve responder algo como
   `{ "api": "ok", "banco": "ok" }`. Se faltar alguma coisa, o terminal da API avisa o que
   rodar (`npm run migrate`).
2. Abra o site, cadastre um cliente, adicione produtos ao carrinho e finalize a compra.
3. Alternador **Cliente/Loja** no topo pra testar as duas frentes.

## 🗄️ Banco de dados e migrações

- `database/schema.sql` — cria o banco `pc_forge` com as tabelas (`CLIENTE`, `ENDERECO`,
  `LOJA`, `PRODUTO`, `COMPRA`, `POSSUI`, `CARRINHO_ITEM`, `AVALIACAO`, `ACESSO_LOG`).
- `database/migrations/*.sql` — migrações idempotentes (prefixo numérico garante ordem).
  A `backend/migration.js` aplica as pendentes e marca em `_MIGRACOES`; é seguro rodar de
  novo quantas vezes.
- Comandos (dentro de `backend/`):
  - `npm run migrate` — schema + migrações pendentes.
  - `npm run migrate:seed` — o mesmo, e ainda roda o `database/seed.sql`.
  - `npm run migrate:catalogo` — migra + grava as fotos placeholder dos produtos do catálogo.
- Dump pronto: `database/dump/pc_forge_dump.sql` (schema + dados) — importar com
  `mysql -u root -p < database/dump/pc_forge_dump.sql`.

## 🔌 API

- `GET /ola` — health check simples (`Hello World!`).
- `GET /saude` — checagem do banco (`api` + `banco`).
- `POST /cliente`, `POST /login`, `GET /cliente/:cpf`, `DELETE /cliente/:cpf`
- `POST /loja`, `POST /loja/login`, `GET /loja/:id/publico`, `GET /loja/:id/avaliacoes`, `GET /loja/:id/logo`, `GET /produtos?loja=:id`
- `GET /produtos`, `GET /produtos/categorias`, `GET /produtos/:id`, `GET /produtos/:id/avaliacoes`,
  `POST /produtos/:id/avaliacao`, `GET /produtos/loja/:idLoja`, `GET /produtos/:id/imagem`,
  `POST /produtos`, `PUT /produtos/:id`, `DELETE /produtos/:id`
- `GET /carrinho/:id`, `POST /carrinho/:id/itens`, `PUT /carrinho/:id/itens/:idProduto`,
  `DELETE /carrinho/:id/itens/:idProduto`, `DELETE /carrinho/:id`,
  `POST /carrinho/:id/finalizar`
- `GET /perfil/cliente/:id`, `PUT /perfil/cliente/:id`,
  `GET/POST /perfil/cliente/:id/enderecos`, `PUT/DELETE /perfil/cliente/:id/enderecos/:idEndereco`,
  `GET /perfil/cliente/:id/pedidos`,
  `GET /perfil/loja/:id`, `PUT /perfil/loja/:id`, `GET /perfil/loja/:id/vendas`
- `POST /admin/login`, `POST /acesso`, `GET /admin/visao`, `GET /admin/lojas`, `GET /admin/clientes`

A coleção completa (com exemplos de corpo) pra importar no **RapidAPI Client** está em
`docs/rapidapi-colecao.json`.

## 🔑 Contas de teste

- Cliente: `cliente@teste.com` (CPF `123.456.789-09`) — senha `senha123`.
- Lojas parceiras do catálogo: `parceiro@pichau.com.br`, `parceiro@kabum.com.br`,
  `parceiro@terabyte.com.br` — senha `senha123`.
- Admin: usuário `adm` (senha fica no servidor, no hash do `backend/routes/admin.js`) —
  acessa pelo modal "Acesso restrito" (clique na logo) e entra em `frontend/painel-admin.html`.

## 🎨 Modo visualização

Clique na **logo "Chutaki"** (canto superior esquerdo) em qualquer página → abre o modal
**Acesso restrito**.

- **Admin:** faz o login real via `POST /admin/login` e vai pro painel.
- **Visualização geral do site:** enquanto a API estiver fora do ar, o site pode usar os
  dados de exemplo (`frontend/assets/js/demo.js`) pra navegar sem MySQL nem back-end — o
  cadastro/login e o carrinho viram simulação.

> ⚠️ Não é segurança de verdade: é só uma chave/localStorage pra testar o site. Não use
> como base de um painel de admin de verdade.

## 🔮 Próximos passos sugeridos

- Pagamento de verdade e controle de estoque (hoje o finalizar só registra o pedido).
- Mostrar o endereço de entrega completo para a loja (hoje ela vê só nome/cidade/UF).
- Estender o token às rotas antigas que ainda confiam no `id` enviado pelo front
  (`POST/PUT/DELETE /produtos`, `GET /cliente/:cpf`, `DELETE /cliente/:cpf`).
- Validação de CPF e CNPJ (dígito verificador) no front e no back.
