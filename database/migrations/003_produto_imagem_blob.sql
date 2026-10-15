-- ============================================================
-- MIGRAÇÃO 003 — Foto do produto guardada em BLOB
-- ============================================================
-- Adiciona em PRODUTO:
--   IMAGEM       MEDIUMBLOB   -> os bytes da foto (até 16 MB; o BLOB comum
--                                só guarda 64 KB, não serve pra foto)
--   IMAGEM_TIPO  VARCHAR(50)  -> formato da foto (image/jpeg, image/png...)
--
-- Os dois ficam NULL nos produtos que já existiam: eles continuam
-- aparecendo normalmente, com o ícone da categoria no lugar da foto.
-- A loja pode adicionar a foto depois, editando o produto no painel.
--
-- Se o banco foi criado com o schema.sql novo, essas colunas já existem e o
-- MySQL responde "Duplicate column name" — o migration.js entende isso como
-- "já aplicada" e segue normalmente.
--
-- Como rodar na mão (se preferir):
--   mysql -u root -p pc_forge < database/migrations/003_produto_imagem_blob.sql
-- ============================================================

USE pc_forge;

ALTER TABLE PRODUTO
    ADD COLUMN IMAGEM MEDIUMBLOB NULL,
    ADD COLUMN IMAGEM_TIPO VARCHAR(50) NULL;
