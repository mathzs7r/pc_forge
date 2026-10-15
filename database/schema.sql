-- ============================================================
-- SCHEMA — PC Forge (peças e acessórios de TI)
-- ============================================================

CREATE DATABASE IF NOT EXISTS pc_forge
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE pc_forge;

-- ------------------------------------------------------------
-- CLIENTE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS CLIENTE (
    ID          INT AUTO_INCREMENT PRIMARY KEY,
    NOME        VARCHAR(150) NOT NULL,
    CPF         VARCHAR(14)  NOT NULL,
    EMAIL       VARCHAR(150) NOT NULL,
    CELULAR     VARCHAR(15)  NOT NULL,
    NASCIMENTO  DATE         NOT NULL,
    SENHA       VARCHAR(255) NOT NULL,
    CRIADO_EM   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (CPF),
    UNIQUE (EMAIL)
);

-- ------------------------------------------------------------
-- ENDERECO
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ENDERECO (
    ID          INT AUTO_INCREMENT PRIMARY KEY,
    ID_CLIENTE  INT NOT NULL,
    CEP         VARCHAR(9)   NOT NULL,
    RUA         VARCHAR(150) NOT NULL,
    NUMERO      VARCHAR(10)  NOT NULL,
    BAIRRO      VARCHAR(100) NOT NULL,
    CIDADE      VARCHAR(100) NOT NULL,
    ESTADO      CHAR(2)      NOT NULL,
    CONSTRAINT fk_endereco_cliente
        FOREIGN KEY (ID_CLIENTE) REFERENCES CLIENTE (ID)
        ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- LOJA
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS LOJA (
    ID         INT AUTO_INCREMENT PRIMARY KEY,
    NOME       VARCHAR(150) NOT NULL,
    CNPJ       VARCHAR(18)  NOT NULL,
    ENDERECO   VARCHAR(200) NOT NULL,
    CELULAR    VARCHAR(15)  NOT NULL,
    EMAIL      VARCHAR(150) NOT NULL,
    SENHA      VARCHAR(255) NOT NULL,
    CRIADO_EM  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- "Sobre a loja": texto opcional do perfil (aparece na página pública da loja).
    -- Fica depois de CRIADO_EM de propósito, pra a ordem das colunas ser a mesma
    -- de um banco atualizado pela migração 004.
    DESCRICAO  VARCHAR(500) NULL,
    UNIQUE (CNPJ),
    UNIQUE (EMAIL)
);

-- ------------------------------------------------------------
-- PRODUTO
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS PRODUTO (
    ID              INT AUTO_INCREMENT PRIMARY KEY,
    ID_LOJA         INT NOT NULL,
    NOME            VARCHAR(150) NOT NULL,
    DESCRICAO       VARCHAR(255) NOT NULL,
    CATEGORIA       VARCHAR(80)  NOT NULL,
    PRECO           DECIMAL(10,2) NOT NULL,
    CAMINHO_IMG     VARCHAR(255) NOT NULL,
    QUANTIDADE_IMG  INT DEFAULT 1,
    -- ATIVO = "exclusão lógica": a loja "exclui" o produto (some da vitrine
    -- e do painel dela), mas a linha continua existindo no banco. Isso evita
    -- o erro de chave estrangeira que acontecia ao apagar de verdade um
    -- produto que já tinha sido vendido (referenciado em POSSUI).
    ATIVO           TINYINT(1) NOT NULL DEFAULT 1,
    CRIADO_EM       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ATUALIZADO_EM   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- FOTO DO PRODUTO, guardada no próprio banco (BLOB = "binary large object").
    -- Usamos MEDIUMBLOB (até 16 MB) e não o BLOB comum, que só guarda 64 KB —
    -- pouco demais até pra uma foto pequena. IMAGEM_TIPO guarda o formato
    -- (image/jpeg, image/png...) pra API responder com o Content-Type certo.
    -- NULL = produto sem foto (a vitrine mostra o ícone da categoria).
    IMAGEM          MEDIUMBLOB NULL,
    IMAGEM_TIPO     VARCHAR(50) NULL,
    CONSTRAINT fk_produto_loja
        FOREIGN KEY (ID_LOJA) REFERENCES LOJA (ID)
        ON DELETE CASCADE,
    INDEX idx_produto_loja_ativo (ID_LOJA, ATIVO)
);

-- ------------------------------------------------------------
-- COMPRA
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS COMPRA (
    ID               INT AUTO_INCREMENT PRIMARY KEY,
    ID_CLIENTE       INT NOT NULL,
    ID_ENDERECO      INT NOT NULL,
    DATA             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FORMA_PAGAMENTO  VARCHAR(50) NOT NULL,
    VALOR_INICIAL    DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_compra_cliente
        FOREIGN KEY (ID_CLIENTE) REFERENCES CLIENTE (ID),
    CONSTRAINT fk_compra_endereco
        FOREIGN KEY (ID_ENDERECO) REFERENCES ENDERECO (ID)
);

-- ------------------------------------------------------------
-- POSSUI (COMPRA x PRODUTO)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS POSSUI (
    ID_COMPRA       INT NOT NULL,
    ID_PRODUTO      INT NOT NULL,
    VALOR_UNITARIO  DECIMAL(10,2) NOT NULL,
    QUANTIDADE      INT NOT NULL,
    PRIMARY KEY (ID_COMPRA, ID_PRODUTO),
    CONSTRAINT fk_possui_compra
        FOREIGN KEY (ID_COMPRA) REFERENCES COMPRA (ID)
        ON DELETE CASCADE,
    -- Sem ON DELETE aqui de propósito: um produto que já foi vendido não
    -- pode sumir do banco (senão a compra ficaria com um item "fantasma"
    -- no histórico). É por isso que excluir produto é exclusão lógica
    -- (ATIVO = 0), e não um DELETE de verdade — veja PRODUTO.ATIVO acima.
    CONSTRAINT fk_possui_produto
        FOREIGN KEY (ID_PRODUTO) REFERENCES PRODUTO (ID)
);

-- ------------------------------------------------------------
-- CARRINHO_ITEM (carrinho de compras de cada cliente)
-- Uma linha por produto no carrinho; a chave é cliente + produto, então
-- adicionar o mesmo produto de novo só soma na QUANTIDADE.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS CARRINHO_ITEM (
    ID_CLIENTE     INT NOT NULL,
    ID_PRODUTO     INT NOT NULL,
    QUANTIDADE     INT NOT NULL DEFAULT 1,
    ADICIONADO_EM  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ATUALIZADO_EM  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (ID_CLIENTE, ID_PRODUTO),
    CONSTRAINT fk_carrinho_cliente
        FOREIGN KEY (ID_CLIENTE) REFERENCES CLIENTE (ID)
        ON DELETE CASCADE,
    CONSTRAINT fk_carrinho_produto
        FOREIGN KEY (ID_PRODUTO) REFERENCES PRODUTO (ID)
        ON DELETE CASCADE
);
