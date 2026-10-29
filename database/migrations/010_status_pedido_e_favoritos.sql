-- ============================================================
-- MIGRAÇÃO 010 — Status do pedido + Lista de desejos (favoritos)
-- ============================================================
-- 1) STATUS em COMPRA: ciclo de vida do pedido visível pro cliente
--    (chip colorido) e alterável pela loja dona de algum item dele:
--      PENDENTE (default) -> PAGO -> ENVIADO -> ENTREGUE
--                               \-> CANCELADO
--    Uso VARCHAR (e não ENUM) porque adicionar valor novo num ENUM
--    exige ALTER de novo; string dá flexibilidade sem custo real.
--
-- 2) Tabela FAVORITO: lista de desejos do cliente. Chave primária
--    composta (ID_CLIENTE, ID_PRODUTO) = um produto não entra duas
--    vezes na lista do mesmo cliente; transição é coração cheio/vazio.
--    ON DELETE CASCADE: apagou cliente/produto, o favorito some junto.
--
-- Usamos ALTER TABLE normal (sem IF NOT EXISTS, que o MySQL 8 não
-- aceita — só o MariaDB). Se a coluna já existir, o migration.js
-- entende o erro 1060 "Duplicate column name" como "já aplicada".
-- ============================================================

USE pc_forge;

ALTER TABLE COMPRA
    ADD COLUMN STATUS VARCHAR(20) NOT NULL DEFAULT 'PENDENTE' AFTER FORMA_PAGAMENTO;

-- ------------------------------------------------------------
-- FAVORITO — um coração guardado do cliente num produto
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS FAVORITO (
    ID_CLIENTE     INT NOT NULL,
    ID_PRODUTO     INT NOT NULL,
    ADICIONADO_EM  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ID_CLIENTE, ID_PRODUTO),
    CONSTRAINT fk_favorito_cliente
        FOREIGN KEY (ID_CLIENTE) REFERENCES CLIENTE (ID)
        ON DELETE CASCADE,
    CONSTRAINT fk_favorito_produto
        FOREIGN KEY (ID_PRODUTO) REFERENCES PRODUTO (ID)
        ON DELETE CASCADE
);
