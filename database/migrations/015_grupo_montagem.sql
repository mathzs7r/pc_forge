-- ============================================================
-- MIGRAÇÃO 015 — Carrinho agrupa o "PC Montado"
--
-- Quando o cliente escolhe "Montado na loja", as peças entram no
-- carrinho amarradas por GRUPO (UUID gerado no front). Aí o
-- carrinho mostra UM cartão "PC Montado" com total fechado em vez
-- de listar cada peça solta.
--
--   GRUPO   : null = item comum (soltinho); com UUID = veio de uma
--             montagem e pertence ao grupo.
--   MONTADA : 1 = o grupo é "montado na loja" (mostra como um PC só).
--             0 = "só as peças": entra como itens normais (sem grupo).
-- ============================================================

USE pc_forge;

ALTER TABLE CARRINHO_ITEM
    ADD COLUMN GRUPO CHAR(36) NULL AFTER QUANTIDADE,
    ADD COLUMN MONTADA TINYINT(1) NOT NULL DEFAULT 0 AFTER GRUPO;
