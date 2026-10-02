# Chutaki — marketplace de artigos esportivos

Marketplace estilo "Shopee de esportes": clientes compram, e qualquer loja pode
criar uma conta e começar a vender. O projeto tem duas frentes de login/cadastro
(Cliente e Loja), com uma barra no topo pra alternar entre as duas.

## Estrutura

```
loja-esportiva/
├── database/
│   ├── schema.sql              # script do banco (MySQL) — já com PRODUTO.ATIVO
│   ├── seed.sql                 # produtos de exemplo, pra testar o catálogo
│   ├── migrations/
│   │   └── 001_produto_exclusao_logica.sql   # pra quem já tinha o banco criado
│   └── dump/
│       └── pc_forge_dump.sql    # dump pronto (schema + dados), testado de verdade
├── backend/
│   ├── server.js                 # só monta a aplicação e as rotas
│   ├── db.js                     # pool de conexão MySQL
│   ├── migration.js               # roda schema + migrações pendentes (+ seed opcional)
│   ├── package.json
│   ├── .env.example
│   ├── routes/
│   │   ├── clientes.js           # cadastro/login/consulta de cliente
│   │   ├── lojas.js              # cadastro/login de loja
│   │   └── produtos.js           # listar/cadastrar/editar/excluir produto
│   └── utils/
│       ├── senha.js              # hash/verificação de senha (bcryptjs)
│       ├── documentos.js         # CPF/CNPJ/e-mail com ou sem máscara
│       └── erros.js              # traduz erro do MySQL em mensagem útil
└── frontend/
    ├── produtos.html             # PÁGINA INICIAL — catálogo
    ├── cliente-cadastro.html     # cadastro de CLIENTE
    ├── login.html                # login de CLIENTE
    ├── loja-cadastro.html        # cadastro de LOJA
    ├── loja-login.html           # login de LOJA
    ├── painel-loja.html          # painel da LOJA — cadastrar/editar/excluir produtos
    └── assets/
        ├── css/
        │   ├── base.css           # tokens de cor, reset, fundo
        │   ├── navbar.css         # barra do topo + alternador + usuário logado
        │   ├── forms.css          # card de vidro + formulários
        │   ├── catalog.css        # vitrine de produtos (só produtos.html)
        │   ├── painel.css         # painel da loja (só painel-loja.html)
        │   ├── modal.css          # modal de acesso de visualização
        │   └── toast.css          # notificações (substitui os alert())
        └── js/
            ├── api.js             # URL da API + helpers de fetch (get/post/put)
            ├── toast.js           # window.mostrarToast(mensagem, tipo)
            ├── demo.js            # modo visualização + produtos de exemplo
            ├── admin-modal.js     # login secreto (clique na logo)
            ├── navbar.js          # monta a barra do topo + personalização de login
            ├── cep.js             # busca de endereço por CEP
            ├── produtos.js        # lógica do catálogo
            ├── login.js           # lógica do login de cliente
            ├── cliente-cadastro.js
            ├── loja-cadastro.js
            ├── loja-login.js
            └── painel-loja.js     # lógica do painel da loja (cadastrar/editar/excluir)
```

---

## ⚡ Cadastro/login não funcionam? Faça nessa ordem

1. **Instale e crie o `.env`** (uma vez só):
   ```bash
   cd backend
   npm install
   copy .env.example .env      # Mac/Linux: cp .env.example .env
   ```
   Abra o `backend/.env` e coloque em `DB_PASSWORD` a **mesma senha do MySQL** que você usa no Database Client.
2. **Crie as tabelas** (ainda na pasta `backend`): `npm run migrate:seed`
   (ou execute `database/dump/pc_forge_dump.sql` pelo Database Client — cuidado: o dump apaga as tabelas antes de recriar).
3. **Ligue a API**: `npm start`. O terminal agora diz na hora se o banco está OK:
   - `✅ Conectado ao MySQL` → tudo certo.
   - `❌ ... usuário ou senha do banco errados` → ajuste `DB_USER` / `DB_PASSWORD` no `.env`.
   - `❌ ... banco não existe` / `faltam tabelas` → rode `npm run migrate`.
   - `❌ ... MySQL ligado?` → ligue o MySQL (ou confira `DB_HOST` / `DB_PORT`).
4. **Confira no navegador**: `http://localhost:3000/saude` deve mostrar `"banco": "ok"`.
5. **Abra o site** (Live Server ou `npx serve -l 5500`) e cadastre. Se der erro, a mensagem na tela agora diz o motivo real.

**Logins de teste** (criados pelo seed/dump), senha `senha123`:
- Cliente: `cliente@teste.com` (ou CPF `123.456.789-09`)
- Loja: `contato@pcforge.com`

**Testando as rotas no RapidAPI Client:** importe o arquivo `docs/rapidapi-colecao.json`
(botão de importar coleção). A variável `base` já aponta pra `http://localhost:3000`.
Rode primeiro a `0. Saúde`, depois `1. Cadastrar cliente` e `2. Login de cliente`.

**Inserindo usuário direto pelo Database Client?** A senha precisa ser um hash bcrypt, não texto puro.
Gere com `npm run hash -- minhasenha` (dentro de `backend`) e cole na coluna `SENHA`.

**"Modo visualização"** (clique na logo → `adm` / `1234`): agora só simula cadastro/login se a API estiver
**desligada**. Com a API ligada, o cadastro e o login sempre vão de verdade pro banco.

---

## Passo a passo pra rodar na sua máquina

### 0. Pré-requisitos

Você precisa ter instalado:
- **Node.js** (18 ou mais recente) — [nodejs.org](https://nodejs.org)
- **MySQL** (Workbench, XAMPP, ou o MySQL Server "puro") — o que você já usa

Pra conferir se já tem o Node instalado, abra o terminal e rode:
```bash
node -v
npm -v
```
Se aparecer um número de versão, tá tudo certo.

### 1. Criar o banco de dados

Abra o terminal na pasta do projeto (onde está a pasta `database/`) e rode:

```bash
mysql -u root -p < database/schema.sql
```

Ele vai pedir a senha do seu MySQL. Isso cria o banco `pc_forge` com as
tabelas `CLIENTE`, `ENDERECO`, `LOJA`, `PRODUTO`, `COMPRA` e `POSSUI` já
corrigidas.

Se preferir, pode abrir o arquivo `database/schema.sql` direto no MySQL
Workbench e rodar o script por lá (ícone de raio ⚡).

### 1.1 (Opcional, mas recomendado) Popular com produtos de exemplo

O catálogo (`produtos.html`) começa vazio até existir pelo menos uma loja e
alguns produtos no banco. Pra já ver alguma coisa na tela, rode:

```bash
mysql -u root -p pc_forge < database/seed.sql
```

Isso cria uma "Loja Exemplo PC Forge" com 10 produtos de hardware
(processador, placa de vídeo, memória RAM, SSD, etc). Sem isso, a página só
vai mostrar uma mensagem avisando que não tem produto cadastrado ainda.

### 1.2 Alternativa aos passos 1 e 1.1: rodar tudo com um comando só

Se preferir não digitar os comandos `mysql` acima, o back-end tem um script
que faz a mesma coisa (e mais: também aplica migrações novas, tipo a de
`ATIVO` em `PRODUTO`). Pule os passos 1 e 1.1 e, depois de configurar o
`.env` no passo 2 abaixo, rode dentro de `backend/`:

```bash
npm run migrate:seed
```

(ou `npm run migrate`, sem o `:seed`, se não quiser os produtos de exemplo).
Ele é seguro de rodar de novo mais tarde — não duplica nada.

Uma terceira opção, sem precisar do Node pra nada: importar o dump já
pronto (schema + produtos de exemplo, tudo num arquivo só):

```bash
mysql -u root -p < database/dump/pc_forge_dump.sql
```

### 2. Configurar e ligar o back-end (a API)

```bash
cd backend
npm install
cp .env.example .env
```

No Windows (PowerShell), troque o `cp` por:
```powershell
copy .env.example .env
```

Abra o `.env` num editor de texto e coloque o usuário/senha do seu MySQL:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=escola
DB_NAME=pc_forge
DB_PORT=3306
PORT=3000
```

Agora suba a API:

```bash
npm start
```

Você deve ver no terminal: `API rodando na porta: 3000`

**Teste rápido**: com a API rodando, abra `http://localhost:3000/ola` no
navegador. Se aparecer "Hello World!", a API está de pé.

> Deixe esse terminal aberto rodando a API. Você vai precisar de um
> **segundo terminal** pra servir o front-end (próximo passo).

### 3. Servir o front-end

Evite abrir o `index.html` clicando duas vezes nele (`file://...`) — alguns
navegadores bloqueiam o `fetch()` de páginas abertas assim. O jeito certo é
servir a pasta `frontend` por HTTP, mesmo que seja localmente. Duas opções
fáceis, escolha uma:

**Opção A — usando Node (você já tem instalado):**
```bash
cd frontend
npx serve -l 5500
```
Depois abra `http://localhost:5500` no navegador.

**Opção B — usando Python (se tiver instalado):**
```bash
cd frontend
python -m http.server 5500
```
Depois abra `http://localhost:5500` no navegador.

**Opção C — VS Code:** clique com o botão direito no `index.html` e escolha
"Open with Live Server" (extensão Live Server).

### 4. Testar o fluxo completo

1. Abra `http://localhost:5500` — você cai direto na **vitrine de produtos**
   (essa agora é a página inicial).
2. Use os filtros de categoria pra navegar pelos produtos.
3. Clique em **"Comprar"** num produto: como você ainda não tem conta
   logada, o site te leva direto pra tela de login.
4. Clique em "Criar conta" (barra do topo) → cadastre-se → faça login →
   você volta pro catálogo já logado.
5. Clique em "Comprar" de novo: agora ele deixa continuar (o fluxo de
   pagamento em si ainda não existe, é só a validação de login).
6. Clique no alternador **"Loja"** no topo → cadastre uma loja de teste →
   faça login como loja.

Se algo der erro, olhe o terminal onde a API está rodando — os erros
aparecem lá com detalhe.

---

---

## Modo visualização (login secreto, sem precisar da API)

Clique na **logo "CHUTAKI."**, no canto superior esquerdo, em qualquer
página. Vai abrir um modal pedindo usuário e senha:

- **Usuário:** `adm`
- **Senha:** `1234`

Isso ativa um "modo visualização": o site passa a usar produtos de exemplo
e aceita qualquer login/cadastro sem de fato chamar a API — dá pra navegar
pelo site inteiro sem precisar ligar o MySQL nem o `npm start` do back-end.
Um aviso "Modo visualização — sair" aparece no canto da tela; clique nele
(ou refaça o cadastro/login normalmente) pra voltar ao modo real.

**Isso não é segurança de verdade.** É só uma chave guardada no
`localStorage` do navegador — usuário e senha ficam visíveis pra qualquer
um que abrir o código-fonte (`assets/js/admin-modal.js`). Serve bem pra
você testar e mostrar o site sozinho, mas não deve virar a base de um
painel de admin de verdade num site com usuários reais.

---

## O que mudou nessa rodada

- **`backend/migration.js` — deixa o banco em dia com um comando só**:
  roda `database/schema.sql`, depois qualquer arquivo novo em
  `database/migrations/` que ainda não tinha sido aplicado (ele guarda o
  controle disso numa tabela `_MIGRACOES`), e — se você passar `--seed` —
  roda também o `seed.sql` no final. É seguro rodar quantas vezes quiser,
  ele pula o que já tiver sido aplicado.
  ```bash
  cd backend
  npm run migrate          # só schema + migrações pendentes
  npm run migrate:seed     # o mesmo, e ainda popula com dados de teste
  ```
- **`database/dump/pc_forge_dump.sql`** — um dump pronto do banco (schema
  atualizado, com a coluna `ATIVO`, mais os produtos de exemplo do
  `seed.sql`). Pra importar direto sem rodar nada em Node:
  `mysql -u root -p < database/dump/pc_forge_dump.sql`. Ele já vem com
  `CREATE DATABASE IF NOT EXISTS pc_forge` no topo.
- **Toasts no lugar de `alert()`**: `assets/js/toast.js` +
  `assets/css/toast.css`, incluídos em todas as páginas. Chame
  `mostrarToast('mensagem', 'sucesso' | 'erro' | 'aviso' | 'info')` em
  qualquer script. Todo `alert(...)` que existia no projeto (cadastro de
  cliente/loja, CEP inválido, tentar comprar sem login, boas-vindas no
  login, erro ao excluir produto) foi trocado por isso.
- **Navbar personalizada pra quem já logou**: se tem
  `sessionStorage.cliente` ou `sessionStorage.loja` (é o que `login.js` e
  `loja-login.js` já gravavam), a barra do topo troca "Entrar / Criar
  conta" por um chip com o primeiro nome da pessoa (ex.: cadastrou como
  "Matheus Souza" → aparece "Olá, Matheus") e um botão "Sair". Tudo em
  `assets/js/navbar.js`, sem precisar mexer em cada página.

## Rodada anterior

- **Painel da loja agora edita produto, não só cria/exclui**:
  - `PUT /produtos/:id` — rota nova. Atualiza nome, categoria, preço,
    descrição etc. de um produto (só se ele pertencer à loja informada em
    `id_loja` no corpo da requisição). No painel (`painel-loja.html`), o
    botão "Editar" preenche o formulário com os dados atuais e troca o
    botão de "Adicionar produto" pra "Salvar alterações".
  - `DELETE /produtos/:id` passou a ser **exclusão lógica**: em vez de
    apagar a linha do banco, ele marca a coluna nova `PRODUTO.ATIVO = 0`.
    Produto excluído some da vitrine e do painel da loja, mas continua no
    banco — isso corrige um bug em que excluir um produto que já tinha
    sido vendido (referenciado na tabela `POSSUI`) quebrava com erro de
    chave estrangeira. Se você já tinha o banco criado antes dessa
    mudança, rode `database/migrations/001_produto_exclusao_logica.sql`
    pra adicionar a coluna sem perder os dados que já tinha.
- **Link "Início" removido**: como `produtos.html` já é a própria página
  inicial, o link ficava redundante. Tirado da barra do topo.
- **Painel da loja pra cadastrar produtos de verdade**: loja loga e cai em
  `painel-loja.html`, onde vê a lista dos próprios produtos e cadastra novos
  (nome, categoria, preço, descrição) — sem produto fake, tudo grava direto
  no banco via API e aparece na hora na vitrine pública.
  - `GET /produtos/loja/:idLoja` — lista os produtos da loja logada
  - `POST /produtos` — cadastra um produto novo (`id_loja`, `nome`,
    `categoria`, `preco`, `descricao` opcional)
  - `DELETE /produtos/:id` — exclui um produto (só se pertencer à loja
    informada em `id_loja` no corpo da requisição)
- **Identidade visual**: cores da bandeira da Tailândia (vermelho pro tema
  Cliente, azul pro tema Loja) e catálogo com foco em artes marciais (BJJ,
  MMA, Boxe, Muay Thai) no lugar do tema esportivo genérico.

## Rodada anterior

- **Login secreto de visualização**: clique na logo "CHUTAKI." pra abrir
  (usuário `adm`, senha `1234`) — deixa navegar o site inteiro sem precisar
  ligar a API. Detalhes na seção acima.

## Rodada anterior

- **Loja não pede mais CPF/nascimento**: o cadastro de loja só pede o que
  uma empresa realmente tem — nome, CNPJ, endereço, e-mail, celular e senha.
- **Alternador Cliente/Loja agora troca de tela na hora**: antes ele só
  mudava links escondidos; agora clicar em "Loja" te leva direto pra tela de
  loja (e mantém se você tava em "criar conta" ou "entrar").
- **Sem rodapé redundante**: tirei os textos "já tem conta / criar conta" de
  baixo do formulário — isso já é resolvido pelos botões "Entrar" / "Criar
  conta" lá em cima, na barra do topo.
- **Identidade visual própria por tipo de conta**: Cliente continua
  verde-gramado + laranja; Loja ganhou um tema próprio azul-noite + dourado,
  pra ficar claro que é uma área diferente (vendedor). Cada tela também tem
  um painel de "vitrine" à esquerda (em telas largas) com frase de efeito e
  uma trajetória decorativa em SVG.

## Rodada anterior

- **Marca**: o site se chama **Chutaki**, um marketplace — qualquer loja
  pode criar conta e vender, não é uma loja só.
- **Bugs de CSS corrigidos**: `background-attachment: fixed` (quebra em
  iOS/Safari), falta de `:focus-visible` no teclado, layout que dependia de
  centralizar o `<body>` inteiro.

## Próximos passos sugeridos

- Upload de imagem de verdade pro produto (hoje é só `CAMINHO_IMG` em texto).
- Página de detalhe do produto (hoje o clique em "Comprar" já checa login,
  mas ainda não existe uma tela própria por produto).
- Carrinho e checkout de verdade — hoje "Comprar" só confirma que você está
  logado, não processa pagamento.
- Sessão de verdade (JWT) em vez de só guardar cliente/loja no
  `sessionStorage` — hoje isso é só visual, não protege rotas (inclusive as
  novas rotas de produto confiam no `id_loja` que o próprio front-end manda).
- Validação de CPF e CNPJ (dígito verificador) no front e no back.
