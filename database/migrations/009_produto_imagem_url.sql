-- ============================================================
-- MIGRACAO 009 — FOTO REAL externa por produto (IMAGEM_URL)
-- ============================================================
-- Até aqui a foto do produto era o placeholder gerado por
-- seed-fotos-catalogo.js (PNG de cor única por categoria) gravado
-- no BLOB. IMAGEM_URL aponta pra uma foto REAL do produto na web
-- (ex.: foto do Wikimedia Commons do "Ryzen 5 5600").
--
-- Prioridade de exibição (decidida no urlImagemProduto do front):
--   1. IMAGEM_URL  (foto real externa)
--   2. IMAGEM/BLOB (placeholder ou foto que a loja subiu)
--   3. nada        (ícone da categoria no front)
--
-- Se o link externo um dia quebrar, o front cai pro ícone da
-- categoria automaticamente (onerror), nunca fica quebrado feio.
-- ============================================================

-- Usamos ALTER TABLE normal (sem IF NOT EXISTS, que o MySQL 8 não aceita —
-- só o MariaDB aceita). Se a coluna já existir, o migration.js entende o
-- erro 1060 "Duplicate column name" como "já aplicada" e segue normalmente.
-- ============================================================

USE pc_forge;

ALTER TABLE PRODUTO
    ADD COLUMN IMAGEM_URL VARCHAR(500) NULL AFTER IMAGEM_TIPO;
