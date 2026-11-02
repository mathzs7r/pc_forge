-- ============================================================
-- MIGRAÇÃO 018 — Descrição de produto maior
--
-- O schema criava PRODUTO.DESCRICAO com VARCHAR(255), mas a
-- validação da API (backend/routes/produtos.js) aceita até
-- 2000 caracteres e o textarea do painel não limitava nada.
-- Resultado: descrição normal do lojista dava ER_DATA_TOO_LONG
-- ("Algum campo passou do tamanho permitido").
-- aqui alinhamos o banco com o que o código já aceita.
-- ============================================================

USE pc_forge;

ALTER TABLE PRODUTO MODIFY DESCRICAO VARCHAR(2000) NOT NULL;
