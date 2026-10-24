-- ============================================================
-- MIGRACAO 007 — Logo da loja guardada em BLOB
-- ============================================================
-- Adiciona em LOJA:
--   LOGO                MEDIUMBLOB  -> os bytes da logo (BLOB com só 
--                                      64 KB não serve pra imagem)
--   LOGO_TIPO           VARCHAR(50) -> formato (image/jpeg, image/png...)
--   LOGO_ATUALIZADO_EM  TIMESTAMP   -> versão da logo; vai na URL como
--                                      ?v= pra o navegador não mostrar
--                                      imagem velha do cache
--
-- Fica NULL nas lojas antigas: o cabeçalho da loja mostra o fallback
-- (bigorna/letra) até a loja cadastrar a logo no perfil.
--
-- Se o schema.sql novo já criou as colunas, o migration.js entende o
-- "Duplicate column name" como "já aplicada" e segue normalmente.
-- ============================================================

USE pc_forge;

ALTER TABLE LOJA
    ADD COLUMN LOGO MEDIUMBLOB NULL,
    ADD COLUMN LOGO_TIPO VARCHAR(50) NULL,
    ADD COLUMN LOGO_ATUALIZADO_EM TIMESTAMP NULL;
