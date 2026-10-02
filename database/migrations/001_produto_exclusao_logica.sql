-- ============================================================
-- MIGRAÇÃO 001 — Exclusão lógica de PRODUTO
-- ============================================================
-- Rode este arquivo só se você JÁ TINHA criado o banco antes com o
-- schema.sql antigo (sem as colunas ATIVO/ATUALIZADO_EM). Se você está
-- criando o banco do zero, não precisa: já rode o schema.sql novo, que
-- já vem com tudo isso.
--
-- Por quê: sem a coluna ATIVO, o botão "Excluir produto" do painel da
-- loja apagava a linha de verdade (DELETE). Isso quebrava com o erro
--   "Cannot delete or update a parent row: a foreign key constraint fails"
-- sempre que o produto já tinha sido vendido (existe um registro dele em
-- POSSUI). Agora "excluir" só marca ATIVO = 0, então o produto some da
-- vitrine e do painel, mas o histórico de compras continua íntegro.
--
-- Como rodar (exemplo via linha de comando):
--   mysql -u root -p pc_forge < database/migrations/001_produto_exclusao_logica.sql
--
-- Funciona em MySQL e MariaDB (não usa "IF NOT EXISTS", que o MySQL não
-- aceita em ADD COLUMN / CREATE INDEX). Se o banco já tiver essas colunas,
-- o MySQL avisa "Duplicate column name" — o migration.js entende isso como
-- "já aplicada" e segue normalmente.
-- ============================================================

USE pc_forge;

ALTER TABLE PRODUTO
    ADD COLUMN ATIVO TINYINT(1) NOT NULL DEFAULT 1 AFTER QUANTIDADE_IMG,
    ADD COLUMN CRIADO_EM TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER ATIVO,
    ADD COLUMN ATUALIZADO_EM TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER CRIADO_EM;

CREATE INDEX idx_produto_loja_ativo ON PRODUTO (ID_LOJA, ATIVO);

-- Garante que todo produto que já existia continua visível (ativo).
UPDATE PRODUTO SET ATIVO = 1 WHERE ATIVO IS NULL;
