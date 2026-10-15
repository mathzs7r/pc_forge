-- ============================================================
-- MIGRAÇÃO 004 — Carrinho de compras + perfil da loja
-- ============================================================
-- 1) CARRINHO_ITEM: o carrinho de cada cliente fica no banco, então ele
--    "acompanha" a pessoa entre abas, navegadores e dispositivos. Uma linha
--    por produto no carrinho (a chave é cliente + produto; adicionar de novo
--    o mesmo produto só aumenta a QUANTIDADE).
--      - Apagou o cliente  -> o carrinho dele vai junto (ON DELETE CASCADE).
--      - Apagou o produto  -> sai do carrinho (na prática produto é só
--                             desativado, ATIVO = 0, e a API já ignora esses).
--
-- 2) LOJA.DESCRICAO: o texto "sobre a loja" do perfil da loja (opcional,
--    até 500 caracteres). Aparece na página pública da loja.
--
-- Ordem importa: o CREATE TABLE vem primeiro (é idempotente, IF NOT EXISTS) e o
-- ALTER por último. Se o banco foi criado com o schema.sql novo, a coluna já
-- existe e o MySQL responde "Duplicate column name" — o migration.js entende
-- isso como "já aplicada" e segue normalmente.
--
-- Como rodar na mão (se preferir):
--   mysql -u root -p pc_forge < database/migrations/004_carrinho_e_perfil.sql
-- ============================================================

USE pc_forge;

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

ALTER TABLE LOJA
    ADD COLUMN DESCRICAO VARCHAR(500) NULL;
