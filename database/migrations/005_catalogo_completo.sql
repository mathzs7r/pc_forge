-- ============================================================
-- MIGRAÇÃO 005 — Catálogo completo (50 produtos por categoria)
-- Lojas parceiras: Pichau, Kabum, Terabyte
-- Fotos: preenchidas depois pelo script seed-fotos-catalogo.js
-- Idempotente: só insere se ainda não existir (por e-mail da loja / nome+loja)
-- ============================================================

USE pc_forge;

INSERT INTO LOJA (NOME, CNPJ, ENDERECO, CELULAR, EMAIL, SENHA, DESCRICAO)
SELECT 'Pichau', '11.111.111/0001-11', 'Rua Hardware, 100 - Joinville - SC', '47999991111', 'parceiro@pichau.com.br', '$2b$10$bK2yK21Q4FUxfRHr6jncB.H.00oURgsM4XgzDRFmauUhHKbC0rF5u', 'Loja parceira oficial no PC Forge.'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM LOJA WHERE EMAIL = 'parceiro@pichau.com.br');

INSERT INTO LOJA (NOME, CNPJ, ENDERECO, CELULAR, EMAIL, SENHA, DESCRICAO)
SELECT 'Kabum', '22.222.222/0001-22', 'Av. Tecnologia, 200 - São Paulo - SP', '11999992222', 'parceiro@kabum.com.br', '$2b$10$bK2yK21Q4FUxfRHr6jncB.H.00oURgsM4XgzDRFmauUhHKbC0rF5u', 'Loja parceira oficial no PC Forge.'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM LOJA WHERE EMAIL = 'parceiro@kabum.com.br');

INSERT INTO LOJA (NOME, CNPJ, ENDERECO, CELULAR, EMAIL, SENHA, DESCRICAO)
SELECT 'Terabyte', '33.333.333/0001-33', 'Rua dos Processadores, 300 - Curitiba - PR', '41999993333', 'parceiro@terabyte.com.br', '$2b$10$bK2yK21Q4FUxfRHr6jncB.H.00oURgsM4XgzDRFmauUhHKbC0rF5u', 'Loja parceira oficial no PC Forge.'
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM LOJA WHERE EMAIL = 'parceiro@terabyte.com.br');

-- Produtos (50 por categoria)
INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Intel Core i3-12100F', 'Processador Intel Core i3-12100F. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 800, 'catalogo/processadores/1.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Intel Core i3-12100F' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Intel Core i5-12400F', 'Processador Intel Core i5-12400F. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 885, 'catalogo/processadores/2.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Intel Core i5-12400F' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Intel Core i5-13400F', 'Processador Intel Core i5-13400F. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 970, 'catalogo/processadores/3.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Intel Core i5-13400F' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Intel Core i5-14400F', 'Processador Intel Core i5-14400F. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 1055, 'catalogo/processadores/4.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Intel Core i5-14400F' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Intel Core i5-14600K', 'Processador Intel Core i5-14600K. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 1140, 'catalogo/processadores/5.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Intel Core i5-14600K' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Intel Core i7-12700F', 'Processador Intel Core i7-12700F. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 1225, 'catalogo/processadores/6.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Intel Core i7-12700F' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Intel Core i7-13700K', 'Processador Intel Core i7-13700K. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 1310, 'catalogo/processadores/7.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Intel Core i7-13700K' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Intel Core i7-14700K', 'Processador Intel Core i7-14700K. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 1185, 'catalogo/processadores/8.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Intel Core i7-14700K' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Intel Core i9-12900K', 'Processador Intel Core i9-12900K. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 1270, 'catalogo/processadores/9.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Intel Core i9-12900K' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Intel Core i9-13900K', 'Processador Intel Core i9-13900K. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 1355, 'catalogo/processadores/10.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Intel Core i9-13900K' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Intel Core i9-14900K', 'Processador Intel Core i9-14900K. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 1440, 'catalogo/processadores/11.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Intel Core i9-14900K' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'AMD Ryzen 3 4100', 'Processador AMD Ryzen 3 4100. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 1525, 'catalogo/processadores/12.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'AMD Ryzen 3 4100' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'AMD Ryzen 5 5500', 'Processador AMD Ryzen 5 5500. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 1610, 'catalogo/processadores/13.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'AMD Ryzen 5 5500' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'AMD Ryzen 5 5600', 'Processador AMD Ryzen 5 5600. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 1695, 'catalogo/processadores/14.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'AMD Ryzen 5 5600' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'AMD Ryzen 5 5600X', 'Processador AMD Ryzen 5 5600X. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 1570, 'catalogo/processadores/15.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'AMD Ryzen 5 5600X' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'AMD Ryzen 5 7600', 'Processador AMD Ryzen 5 7600. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 1655, 'catalogo/processadores/16.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'AMD Ryzen 5 7600' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'AMD Ryzen 5 7600X', 'Processador AMD Ryzen 5 7600X. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 1740, 'catalogo/processadores/17.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'AMD Ryzen 5 7600X' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'AMD Ryzen 7 5700X', 'Processador AMD Ryzen 7 5700X. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 1825, 'catalogo/processadores/18.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'AMD Ryzen 7 5700X' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'AMD Ryzen 7 5800X', 'Processador AMD Ryzen 7 5800X. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 1910, 'catalogo/processadores/19.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'AMD Ryzen 7 5800X' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'AMD Ryzen 7 7700', 'Processador AMD Ryzen 7 7700. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 1995, 'catalogo/processadores/20.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'AMD Ryzen 7 7700' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'AMD Ryzen 7 7700X', 'Processador AMD Ryzen 7 7700X. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 2080, 'catalogo/processadores/21.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'AMD Ryzen 7 7700X' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'AMD Ryzen 9 5900X', 'Processador AMD Ryzen 9 5900X. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 1955, 'catalogo/processadores/22.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'AMD Ryzen 9 5900X' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'AMD Ryzen 9 7900X', 'Processador AMD Ryzen 9 7900X. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 2040, 'catalogo/processadores/23.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'AMD Ryzen 9 7900X' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'AMD Ryzen 9 7950X', 'Processador AMD Ryzen 9 7950X. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 2125, 'catalogo/processadores/24.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'AMD Ryzen 9 7950X' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Intel Core Ultra 5 245K', 'Processador Intel Core Ultra 5 245K. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 2210, 'catalogo/processadores/25.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Intel Core Ultra 5 245K' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Intel Core Ultra 7 265K', 'Processador Intel Core Ultra 7 265K. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 2295, 'catalogo/processadores/26.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Intel Core Ultra 7 265K' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Intel Core i3-12100F Ed. 2', 'Processador Intel Core i3-12100F. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 2380, 'catalogo/processadores/27.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Intel Core i3-12100F Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Intel Core i5-12400F Ed. 2', 'Processador Intel Core i5-12400F. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 2465, 'catalogo/processadores/28.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Intel Core i5-12400F Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Intel Core i5-13400F Ed. 2', 'Processador Intel Core i5-13400F. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 2340, 'catalogo/processadores/29.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Intel Core i5-13400F Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Intel Core i5-14400F Ed. 2', 'Processador Intel Core i5-14400F. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 2425, 'catalogo/processadores/30.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Intel Core i5-14400F Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Intel Core i5-14600K Ed. 2', 'Processador Intel Core i5-14600K. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 2510, 'catalogo/processadores/31.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Intel Core i5-14600K Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Intel Core i7-12700F Ed. 2', 'Processador Intel Core i7-12700F. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 2595, 'catalogo/processadores/32.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Intel Core i7-12700F Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Intel Core i7-13700K Ed. 2', 'Processador Intel Core i7-13700K. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 2680, 'catalogo/processadores/33.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Intel Core i7-13700K Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Intel Core i7-14700K Ed. 2', 'Processador Intel Core i7-14700K. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 2765, 'catalogo/processadores/34.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Intel Core i7-14700K Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Intel Core i9-12900K Ed. 2', 'Processador Intel Core i9-12900K. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 2850, 'catalogo/processadores/35.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Intel Core i9-12900K Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Intel Core i9-13900K Ed. 2', 'Processador Intel Core i9-13900K. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 2725, 'catalogo/processadores/36.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Intel Core i9-13900K Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Intel Core i9-14900K Ed. 2', 'Processador Intel Core i9-14900K. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 2810, 'catalogo/processadores/37.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Intel Core i9-14900K Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'AMD Ryzen 3 4100 Ed. 2', 'Processador AMD Ryzen 3 4100. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 2895, 'catalogo/processadores/38.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'AMD Ryzen 3 4100 Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'AMD Ryzen 5 5500 Ed. 2', 'Processador AMD Ryzen 5 5500. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 2980, 'catalogo/processadores/39.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'AMD Ryzen 5 5500 Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'AMD Ryzen 5 5600 Ed. 2', 'Processador AMD Ryzen 5 5600. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 3065, 'catalogo/processadores/40.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'AMD Ryzen 5 5600 Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'AMD Ryzen 5 5600X Ed. 2', 'Processador AMD Ryzen 5 5600X. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 950, 'catalogo/processadores/41.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'AMD Ryzen 5 5600X Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'AMD Ryzen 5 7600 Ed. 2', 'Processador AMD Ryzen 5 7600. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 1035, 'catalogo/processadores/42.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'AMD Ryzen 5 7600 Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'AMD Ryzen 5 7600X Ed. 2', 'Processador AMD Ryzen 5 7600X. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 910, 'catalogo/processadores/43.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'AMD Ryzen 5 7600X Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'AMD Ryzen 7 5700X Ed. 2', 'Processador AMD Ryzen 7 5700X. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 995, 'catalogo/processadores/44.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'AMD Ryzen 7 5700X Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'AMD Ryzen 7 5800X Ed. 2', 'Processador AMD Ryzen 7 5800X. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 1080, 'catalogo/processadores/45.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'AMD Ryzen 7 5800X Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'AMD Ryzen 7 7700 Ed. 2', 'Processador AMD Ryzen 7 7700. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 1165, 'catalogo/processadores/46.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'AMD Ryzen 7 7700 Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'AMD Ryzen 7 7700X Ed. 2', 'Processador AMD Ryzen 7 7700X. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 1250, 'catalogo/processadores/47.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'AMD Ryzen 7 7700X Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'AMD Ryzen 9 5900X Ed. 2', 'Processador AMD Ryzen 9 5900X. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 1335, 'catalogo/processadores/48.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'AMD Ryzen 9 5900X Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'AMD Ryzen 9 7900X Ed. 2', 'Processador AMD Ryzen 9 7900X. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 1420, 'catalogo/processadores/49.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'AMD Ryzen 9 7900X Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'AMD Ryzen 9 7950X Ed. 2', 'Processador AMD Ryzen 9 7950X. Ideal para jogos e produtividade. Garantia do fabricante.', 'Processadores', 1295, 'catalogo/processadores/50.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'AMD Ryzen 9 7950X Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'GTX 1650 4GB', 'Placa de vídeo GTX 1650 4GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 1200, 'catalogo/placas-de-vídeo/1.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'GTX 1650 4GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RTX 3050 8GB', 'Placa de vídeo RTX 3050 8GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 1400, 'catalogo/placas-de-vídeo/2.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RTX 3050 8GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RTX 3060 12GB', 'Placa de vídeo RTX 3060 12GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 1600, 'catalogo/placas-de-vídeo/3.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RTX 3060 12GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RTX 4060 8GB', 'Placa de vídeo RTX 4060 8GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 1800, 'catalogo/placas-de-vídeo/4.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RTX 4060 8GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RTX 4060 Ti 8GB', 'Placa de vídeo RTX 4060 Ti 8GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 2000, 'catalogo/placas-de-vídeo/5.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RTX 4060 Ti 8GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RTX 4070 12GB', 'Placa de vídeo RTX 4070 12GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 1800, 'catalogo/placas-de-vídeo/6.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RTX 4070 12GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RTX 4070 Super 12GB', 'Placa de vídeo RTX 4070 Super 12GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 2000, 'catalogo/placas-de-vídeo/7.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RTX 4070 Super 12GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RTX 4070 Ti 12GB', 'Placa de vídeo RTX 4070 Ti 12GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 2200, 'catalogo/placas-de-vídeo/8.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RTX 4070 Ti 12GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RTX 4080 16GB', 'Placa de vídeo RTX 4080 16GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 2400, 'catalogo/placas-de-vídeo/9.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RTX 4080 16GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RTX 4090 24GB', 'Placa de vídeo RTX 4090 24GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 2600, 'catalogo/placas-de-vídeo/10.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RTX 4090 24GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RX 6500 XT 4GB', 'Placa de vídeo RX 6500 XT 4GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 2400, 'catalogo/placas-de-vídeo/11.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RX 6500 XT 4GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RX 6600 8GB', 'Placa de vídeo RX 6600 8GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 2600, 'catalogo/placas-de-vídeo/12.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RX 6600 8GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RX 6700 XT 12GB', 'Placa de vídeo RX 6700 XT 12GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 2800, 'catalogo/placas-de-vídeo/13.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RX 6700 XT 12GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RX 7600 8GB', 'Placa de vídeo RX 7600 8GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 3000, 'catalogo/placas-de-vídeo/14.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RX 7600 8GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RX 7700 XT 12GB', 'Placa de vídeo RX 7700 XT 12GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 3200, 'catalogo/placas-de-vídeo/15.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RX 7700 XT 12GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RX 7800 XT 16GB', 'Placa de vídeo RX 7800 XT 16GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 3000, 'catalogo/placas-de-vídeo/16.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RX 7800 XT 16GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RX 7900 XT 20GB', 'Placa de vídeo RX 7900 XT 20GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 3200, 'catalogo/placas-de-vídeo/17.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RX 7900 XT 20GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RX 7900 XTX 24GB', 'Placa de vídeo RX 7900 XTX 24GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 3400, 'catalogo/placas-de-vídeo/18.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RX 7900 XTX 24GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Arc A750 8GB', 'Placa de vídeo Arc A750 8GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 3600, 'catalogo/placas-de-vídeo/19.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Arc A750 8GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Arc A770 16GB', 'Placa de vídeo Arc A770 16GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 3800, 'catalogo/placas-de-vídeo/20.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Arc A770 16GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RTX 4050 Laptop 6GB', 'Placa de vídeo RTX 4050 Laptop 6GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 3600, 'catalogo/placas-de-vídeo/21.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RTX 4050 Laptop 6GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RTX 4060 Ti 16GB', 'Placa de vídeo RTX 4060 Ti 16GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 3800, 'catalogo/placas-de-vídeo/22.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RTX 4060 Ti 16GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RTX 4070 Ti Super 16GB', 'Placa de vídeo RTX 4070 Ti Super 16GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 4000, 'catalogo/placas-de-vídeo/23.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RTX 4070 Ti Super 16GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RX 6800 16GB', 'Placa de vídeo RX 6800 16GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 4200, 'catalogo/placas-de-vídeo/24.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RX 6800 16GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RTX 3080 10GB', 'Placa de vídeo RTX 3080 10GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 4400, 'catalogo/placas-de-vídeo/25.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RTX 3080 10GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'GTX 1650 4GB Ed. 2', 'Placa de vídeo GTX 1650 4GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 4200, 'catalogo/placas-de-vídeo/26.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'GTX 1650 4GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RTX 3050 8GB Ed. 2', 'Placa de vídeo RTX 3050 8GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 4400, 'catalogo/placas-de-vídeo/27.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RTX 3050 8GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RTX 3060 12GB Ed. 2', 'Placa de vídeo RTX 3060 12GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 4600, 'catalogo/placas-de-vídeo/28.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RTX 3060 12GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RTX 4060 8GB Ed. 2', 'Placa de vídeo RTX 4060 8GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 4800, 'catalogo/placas-de-vídeo/29.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RTX 4060 8GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RTX 4060 Ti 8GB Ed. 2', 'Placa de vídeo RTX 4060 Ti 8GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 5000, 'catalogo/placas-de-vídeo/30.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RTX 4060 Ti 8GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RTX 4070 12GB Ed. 2', 'Placa de vídeo RTX 4070 12GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 4800, 'catalogo/placas-de-vídeo/31.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RTX 4070 12GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RTX 4070 Super 12GB Ed. 2', 'Placa de vídeo RTX 4070 Super 12GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 5000, 'catalogo/placas-de-vídeo/32.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RTX 4070 Super 12GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RTX 4070 Ti 12GB Ed. 2', 'Placa de vídeo RTX 4070 Ti 12GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 5200, 'catalogo/placas-de-vídeo/33.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RTX 4070 Ti 12GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RTX 4080 16GB Ed. 2', 'Placa de vídeo RTX 4080 16GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 5400, 'catalogo/placas-de-vídeo/34.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RTX 4080 16GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RTX 4090 24GB Ed. 2', 'Placa de vídeo RTX 4090 24GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 5600, 'catalogo/placas-de-vídeo/35.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RTX 4090 24GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RX 6500 XT 4GB Ed. 2', 'Placa de vídeo RX 6500 XT 4GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 5400, 'catalogo/placas-de-vídeo/36.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RX 6500 XT 4GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RX 6600 8GB Ed. 2', 'Placa de vídeo RX 6600 8GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 5600, 'catalogo/placas-de-vídeo/37.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RX 6600 8GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RX 6700 XT 12GB Ed. 2', 'Placa de vídeo RX 6700 XT 12GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 5800, 'catalogo/placas-de-vídeo/38.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RX 6700 XT 12GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RX 7600 8GB Ed. 2', 'Placa de vídeo RX 7600 8GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 6000, 'catalogo/placas-de-vídeo/39.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RX 7600 8GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RX 7700 XT 12GB Ed. 2', 'Placa de vídeo RX 7700 XT 12GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 6200, 'catalogo/placas-de-vídeo/40.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RX 7700 XT 12GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RX 7800 XT 16GB Ed. 2', 'Placa de vídeo RX 7800 XT 16GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 6000, 'catalogo/placas-de-vídeo/41.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RX 7800 XT 16GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RX 7900 XT 20GB Ed. 2', 'Placa de vídeo RX 7900 XT 20GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 6200, 'catalogo/placas-de-vídeo/42.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RX 7900 XT 20GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RX 7900 XTX 24GB Ed. 2', 'Placa de vídeo RX 7900 XTX 24GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 6400, 'catalogo/placas-de-vídeo/43.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RX 7900 XTX 24GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Arc A750 8GB Ed. 2', 'Placa de vídeo Arc A750 8GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 6600, 'catalogo/placas-de-vídeo/44.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Arc A750 8GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Arc A770 16GB Ed. 2', 'Placa de vídeo Arc A770 16GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 6800, 'catalogo/placas-de-vídeo/45.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Arc A770 16GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RTX 4050 Laptop 6GB Ed. 2', 'Placa de vídeo RTX 4050 Laptop 6GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 1200, 'catalogo/placas-de-vídeo/46.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RTX 4050 Laptop 6GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RTX 4060 Ti 16GB Ed. 2', 'Placa de vídeo RTX 4060 Ti 16GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 1400, 'catalogo/placas-de-vídeo/47.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RTX 4060 Ti 16GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RTX 4070 Ti Super 16GB Ed. 2', 'Placa de vídeo RTX 4070 Ti Super 16GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 1600, 'catalogo/placas-de-vídeo/48.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RTX 4070 Ti Super 16GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RX 6800 16GB Ed. 2', 'Placa de vídeo RX 6800 16GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 1800, 'catalogo/placas-de-vídeo/49.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RX 6800 16GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'RTX 3080 10GB Ed. 2', 'Placa de vídeo RTX 3080 10GB. Desempenho em jogos Full HD / 1440p / 4K conforme modelo.', 'Placas de Vídeo', 2000, 'catalogo/placas-de-vídeo/50.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'RTX 3080 10GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '8GB DDR4 3200MHz', 'Memória 8GB DDR4 3200MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 180, 'catalogo/memória-ram/1.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '8GB DDR4 3200MHz' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '16GB DDR4 3200MHz', 'Memória 16GB DDR4 3200MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 220, 'catalogo/memória-ram/2.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '16GB DDR4 3200MHz' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '32GB DDR4 3200MHz', 'Memória 32GB DDR4 3200MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 260, 'catalogo/memória-ram/3.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '32GB DDR4 3200MHz' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '16GB DDR4 3600MHz', 'Memória 16GB DDR4 3600MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 300, 'catalogo/memória-ram/4.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '16GB DDR4 3600MHz' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '32GB DDR4 3600MHz', 'Memória 32GB DDR4 3600MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 280, 'catalogo/memória-ram/5.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '32GB DDR4 3600MHz' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '8GB DDR5 4800MHz', 'Memória 8GB DDR5 4800MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 320, 'catalogo/memória-ram/6.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '8GB DDR5 4800MHz' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '16GB DDR5 5200MHz', 'Memória 16GB DDR5 5200MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 360, 'catalogo/memória-ram/7.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '16GB DDR5 5200MHz' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '16GB DDR5 5600MHz', 'Memória 16GB DDR5 5600MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 400, 'catalogo/memória-ram/8.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '16GB DDR5 5600MHz' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '32GB DDR5 5600MHz', 'Memória 32GB DDR5 5600MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 380, 'catalogo/memória-ram/9.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '32GB DDR5 5600MHz' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '32GB DDR5 6000MHz', 'Memória 32GB DDR5 6000MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 420, 'catalogo/memória-ram/10.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '32GB DDR5 6000MHz' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '64GB DDR5 5600MHz', 'Memória 64GB DDR5 5600MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 460, 'catalogo/memória-ram/11.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '64GB DDR5 5600MHz' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '16GB DDR5 6000MHz CL30', 'Memória 16GB DDR5 6000MHz CL30. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 500, 'catalogo/memória-ram/12.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '16GB DDR5 6000MHz CL30' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '32GB DDR5 6400MHz', 'Memória 32GB DDR5 6400MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 480, 'catalogo/memória-ram/13.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '32GB DDR5 6400MHz' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '2x8GB DDR4 3200 RGB', 'Memória 2x8GB DDR4 3200 RGB. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 520, 'catalogo/memória-ram/14.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '2x8GB DDR4 3200 RGB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '2x16GB DDR4 3600 RGB', 'Memória 2x16GB DDR4 3600 RGB. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 560, 'catalogo/memória-ram/15.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '2x16GB DDR4 3600 RGB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '2x16GB DDR5 6000 RGB', 'Memória 2x16GB DDR5 6000 RGB. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 600, 'catalogo/memória-ram/16.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '2x16GB DDR5 6000 RGB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '64GB DDR4 3200MHz', 'Memória 64GB DDR4 3200MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 580, 'catalogo/memória-ram/17.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '64GB DDR4 3200MHz' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '8GB DDR4 2666MHz', 'Memória 8GB DDR4 2666MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 620, 'catalogo/memória-ram/18.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '8GB DDR4 2666MHz' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '16GB DDR4 2666MHz', 'Memória 16GB DDR4 2666MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 660, 'catalogo/memória-ram/19.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '16GB DDR4 2666MHz' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '48GB DDR5 5600MHz', 'Memória 48GB DDR5 5600MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 700, 'catalogo/memória-ram/20.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '48GB DDR5 5600MHz' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '8GB DDR4 3200MHz Ed. 2', 'Memória 8GB DDR4 3200MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 680, 'catalogo/memória-ram/21.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '8GB DDR4 3200MHz Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '16GB DDR4 3200MHz Ed. 2', 'Memória 16GB DDR4 3200MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 720, 'catalogo/memória-ram/22.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '16GB DDR4 3200MHz Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '32GB DDR4 3200MHz Ed. 2', 'Memória 32GB DDR4 3200MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 760, 'catalogo/memória-ram/23.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '32GB DDR4 3200MHz Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '16GB DDR4 3600MHz Ed. 2', 'Memória 16GB DDR4 3600MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 800, 'catalogo/memória-ram/24.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '16GB DDR4 3600MHz Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '32GB DDR4 3600MHz Ed. 2', 'Memória 32GB DDR4 3600MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 780, 'catalogo/memória-ram/25.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '32GB DDR4 3600MHz Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '8GB DDR5 4800MHz Ed. 2', 'Memória 8GB DDR5 4800MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 820, 'catalogo/memória-ram/26.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '8GB DDR5 4800MHz Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '16GB DDR5 5200MHz Ed. 2', 'Memória 16GB DDR5 5200MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 860, 'catalogo/memória-ram/27.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '16GB DDR5 5200MHz Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '16GB DDR5 5600MHz Ed. 2', 'Memória 16GB DDR5 5600MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 900, 'catalogo/memória-ram/28.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '16GB DDR5 5600MHz Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '32GB DDR5 5600MHz Ed. 2', 'Memória 32GB DDR5 5600MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 880, 'catalogo/memória-ram/29.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '32GB DDR5 5600MHz Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '32GB DDR5 6000MHz Ed. 2', 'Memória 32GB DDR5 6000MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 920, 'catalogo/memória-ram/30.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '32GB DDR5 6000MHz Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '64GB DDR5 5600MHz Ed. 2', 'Memória 64GB DDR5 5600MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 210, 'catalogo/memória-ram/31.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '64GB DDR5 5600MHz Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '16GB DDR5 6000MHz CL30 Ed. 2', 'Memória 16GB DDR5 6000MHz CL30. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 250, 'catalogo/memória-ram/32.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '16GB DDR5 6000MHz CL30 Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '32GB DDR5 6400MHz Ed. 2', 'Memória 32GB DDR5 6400MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 230, 'catalogo/memória-ram/33.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '32GB DDR5 6400MHz Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '2x8GB DDR4 3200 RGB Ed. 2', 'Memória 2x8GB DDR4 3200 RGB. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 270, 'catalogo/memória-ram/34.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '2x8GB DDR4 3200 RGB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '2x16GB DDR4 3600 RGB Ed. 2', 'Memória 2x16GB DDR4 3600 RGB. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 310, 'catalogo/memória-ram/35.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '2x16GB DDR4 3600 RGB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '2x16GB DDR5 6000 RGB Ed. 2', 'Memória 2x16GB DDR5 6000 RGB. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 350, 'catalogo/memória-ram/36.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '2x16GB DDR5 6000 RGB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '64GB DDR4 3200MHz Ed. 2', 'Memória 64GB DDR4 3200MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 330, 'catalogo/memória-ram/37.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '64GB DDR4 3200MHz Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '8GB DDR4 2666MHz Ed. 2', 'Memória 8GB DDR4 2666MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 370, 'catalogo/memória-ram/38.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '8GB DDR4 2666MHz Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '16GB DDR4 2666MHz Ed. 2', 'Memória 16GB DDR4 2666MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 410, 'catalogo/memória-ram/39.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '16GB DDR4 2666MHz Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '48GB DDR5 5600MHz Ed. 2', 'Memória 48GB DDR5 5600MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 450, 'catalogo/memória-ram/40.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '48GB DDR5 5600MHz Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '8GB DDR4 3200MHz Ed. 3', 'Memória 8GB DDR4 3200MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 430, 'catalogo/memória-ram/41.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '8GB DDR4 3200MHz Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '16GB DDR4 3200MHz Ed. 3', 'Memória 16GB DDR4 3200MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 470, 'catalogo/memória-ram/42.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '16GB DDR4 3200MHz Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '32GB DDR4 3200MHz Ed. 3', 'Memória 32GB DDR4 3200MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 510, 'catalogo/memória-ram/43.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '32GB DDR4 3200MHz Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '16GB DDR4 3600MHz Ed. 3', 'Memória 16GB DDR4 3600MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 550, 'catalogo/memória-ram/44.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '16GB DDR4 3600MHz Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '32GB DDR4 3600MHz Ed. 3', 'Memória 32GB DDR4 3600MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 530, 'catalogo/memória-ram/45.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '32GB DDR4 3600MHz Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '8GB DDR5 4800MHz Ed. 3', 'Memória 8GB DDR5 4800MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 570, 'catalogo/memória-ram/46.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '8GB DDR5 4800MHz Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '16GB DDR5 5200MHz Ed. 3', 'Memória 16GB DDR5 5200MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 610, 'catalogo/memória-ram/47.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '16GB DDR5 5200MHz Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '16GB DDR5 5600MHz Ed. 3', 'Memória 16GB DDR5 5600MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 650, 'catalogo/memória-ram/48.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '16GB DDR5 5600MHz Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '32GB DDR5 5600MHz Ed. 3', 'Memória 32GB DDR5 5600MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 630, 'catalogo/memória-ram/49.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '32GB DDR5 5600MHz Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, '32GB DDR5 6000MHz Ed. 3', 'Memória 32GB DDR5 6000MHz. Compatível com plataformas modernas. Testada e aprovada.', 'Memória RAM', 670, 'catalogo/memória-ram/50.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = '32GB DDR5 6000MHz Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD SATA 480GB', 'SSD SATA 480GB. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 150, 'catalogo/armazenamento/1.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD SATA 480GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD SATA 1TB', 'SSD SATA 1TB. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 205, 'catalogo/armazenamento/2.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD SATA 1TB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD NVMe 500GB Gen3', 'SSD NVMe 500GB Gen3. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 260, 'catalogo/armazenamento/3.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD NVMe 500GB Gen3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD NVMe 1TB Gen3', 'SSD NVMe 1TB Gen3. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 315, 'catalogo/armazenamento/4.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD NVMe 1TB Gen3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD NVMe 1TB Gen4', 'SSD NVMe 1TB Gen4. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 370, 'catalogo/armazenamento/5.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD NVMe 1TB Gen4' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD NVMe 2TB Gen4', 'SSD NVMe 2TB Gen4. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 425, 'catalogo/armazenamento/6.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD NVMe 2TB Gen4' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD NVMe 500GB Gen4', 'SSD NVMe 500GB Gen4. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 360, 'catalogo/armazenamento/7.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD NVMe 500GB Gen4' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD NVMe 4TB Gen4', 'SSD NVMe 4TB Gen4. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 415, 'catalogo/armazenamento/8.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD NVMe 4TB Gen4' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'HD 1TB 7200RPM', 'HD 1TB 7200RPM. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 470, 'catalogo/armazenamento/9.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'HD 1TB 7200RPM' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'HD 2TB 7200RPM', 'HD 2TB 7200RPM. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 525, 'catalogo/armazenamento/10.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'HD 2TB 7200RPM' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'HD 4TB', 'HD 4TB. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 580, 'catalogo/armazenamento/11.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'HD 4TB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD Externo 1TB USB-C', 'SSD Externo 1TB USB-C. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 635, 'catalogo/armazenamento/12.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD Externo 1TB USB-C' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD NVMe 2TB Gen5', 'SSD NVMe 2TB Gen5. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 570, 'catalogo/armazenamento/13.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD NVMe 2TB Gen5' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD SATA 240GB', 'SSD SATA 240GB. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 625, 'catalogo/armazenamento/14.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD SATA 240GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD NVMe 250GB', 'SSD NVMe 250GB. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 680, 'catalogo/armazenamento/15.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD NVMe 250GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Cartão MicroSD 128GB', 'Cartão MicroSD 128GB. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 735, 'catalogo/armazenamento/16.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Cartão MicroSD 128GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Cartão MicroSD 256GB', 'Cartão MicroSD 256GB. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 790, 'catalogo/armazenamento/17.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Cartão MicroSD 256GB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Pendrive 128GB USB 3.2', 'Pendrive 128GB USB 3.2. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 845, 'catalogo/armazenamento/18.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Pendrive 128GB USB 3.2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD Portátil 2TB', 'SSD Portátil 2TB. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 780, 'catalogo/armazenamento/19.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD Portátil 2TB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'HD Externo 5TB', 'HD Externo 5TB. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 835, 'catalogo/armazenamento/20.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'HD Externo 5TB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD SATA 480GB Ed. 2', 'SSD SATA 480GB. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 890, 'catalogo/armazenamento/21.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD SATA 480GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD SATA 1TB Ed. 2', 'SSD SATA 1TB. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 945, 'catalogo/armazenamento/22.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD SATA 1TB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD NVMe 500GB Gen3 Ed. 2', 'SSD NVMe 500GB Gen3. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 1000, 'catalogo/armazenamento/23.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD NVMe 500GB Gen3 Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD NVMe 1TB Gen3 Ed. 2', 'SSD NVMe 1TB Gen3. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 1055, 'catalogo/armazenamento/24.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD NVMe 1TB Gen3 Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD NVMe 1TB Gen4 Ed. 2', 'SSD NVMe 1TB Gen4. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 990, 'catalogo/armazenamento/25.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD NVMe 1TB Gen4 Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD NVMe 2TB Gen4 Ed. 2', 'SSD NVMe 2TB Gen4. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 1045, 'catalogo/armazenamento/26.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD NVMe 2TB Gen4 Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD NVMe 500GB Gen4 Ed. 2', 'SSD NVMe 500GB Gen4. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 1100, 'catalogo/armazenamento/27.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD NVMe 500GB Gen4 Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD NVMe 4TB Gen4 Ed. 2', 'SSD NVMe 4TB Gen4. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 1155, 'catalogo/armazenamento/28.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD NVMe 4TB Gen4 Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'HD 1TB 7200RPM Ed. 2', 'HD 1TB 7200RPM. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 1210, 'catalogo/armazenamento/29.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'HD 1TB 7200RPM Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'HD 2TB 7200RPM Ed. 2', 'HD 2TB 7200RPM. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 1265, 'catalogo/armazenamento/30.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'HD 2TB 7200RPM Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'HD 4TB Ed. 2', 'HD 4TB. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 1200, 'catalogo/armazenamento/31.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'HD 4TB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD Externo 1TB USB-C Ed. 2', 'SSD Externo 1TB USB-C. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 1255, 'catalogo/armazenamento/32.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD Externo 1TB USB-C Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD NVMe 2TB Gen5 Ed. 2', 'SSD NVMe 2TB Gen5. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 1310, 'catalogo/armazenamento/33.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD NVMe 2TB Gen5 Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD SATA 240GB Ed. 2', 'SSD SATA 240GB. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 1365, 'catalogo/armazenamento/34.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD SATA 240GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD NVMe 250GB Ed. 2', 'SSD NVMe 250GB. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 1420, 'catalogo/armazenamento/35.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD NVMe 250GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Cartão MicroSD 128GB Ed. 2', 'Cartão MicroSD 128GB. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 250, 'catalogo/armazenamento/36.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Cartão MicroSD 128GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Cartão MicroSD 256GB Ed. 2', 'Cartão MicroSD 256GB. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 185, 'catalogo/armazenamento/37.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Cartão MicroSD 256GB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Pendrive 128GB USB 3.2 Ed. 2', 'Pendrive 128GB USB 3.2. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 240, 'catalogo/armazenamento/38.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Pendrive 128GB USB 3.2 Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD Portátil 2TB Ed. 2', 'SSD Portátil 2TB. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 295, 'catalogo/armazenamento/39.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD Portátil 2TB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'HD Externo 5TB Ed. 2', 'HD Externo 5TB. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 350, 'catalogo/armazenamento/40.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'HD Externo 5TB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD SATA 480GB Ed. 3', 'SSD SATA 480GB. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 405, 'catalogo/armazenamento/41.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD SATA 480GB Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD SATA 1TB Ed. 3', 'SSD SATA 1TB. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 460, 'catalogo/armazenamento/42.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD SATA 1TB Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD NVMe 500GB Gen3 Ed. 3', 'SSD NVMe 500GB Gen3. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 395, 'catalogo/armazenamento/43.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD NVMe 500GB Gen3 Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD NVMe 1TB Gen3 Ed. 3', 'SSD NVMe 1TB Gen3. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 450, 'catalogo/armazenamento/44.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD NVMe 1TB Gen3 Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD NVMe 1TB Gen4 Ed. 3', 'SSD NVMe 1TB Gen4. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 505, 'catalogo/armazenamento/45.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD NVMe 1TB Gen4 Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD NVMe 2TB Gen4 Ed. 3', 'SSD NVMe 2TB Gen4. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 560, 'catalogo/armazenamento/46.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD NVMe 2TB Gen4 Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD NVMe 500GB Gen4 Ed. 3', 'SSD NVMe 500GB Gen4. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 615, 'catalogo/armazenamento/47.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD NVMe 500GB Gen4 Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'SSD NVMe 4TB Gen4 Ed. 3', 'SSD NVMe 4TB Gen4. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 670, 'catalogo/armazenamento/48.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'SSD NVMe 4TB Gen4 Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'HD 1TB 7200RPM Ed. 3', 'HD 1TB 7200RPM. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 605, 'catalogo/armazenamento/49.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'HD 1TB 7200RPM Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'HD 2TB 7200RPM Ed. 3', 'HD 2TB 7200RPM. Alta velocidade de leitura/escrita. Ideal para sistema e jogos.', 'Armazenamento', 660, 'catalogo/armazenamento/50.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'HD 2TB 7200RPM Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'B550M Gaming', 'Placa-mãe B550M Gaming. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 550, 'catalogo/placas-mãe/1.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'B550M Gaming' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'B650M WiFi', 'Placa-mãe B650M WiFi. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 620, 'catalogo/placas-mãe/2.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'B650M WiFi' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'X670E Gaming', 'Placa-mãe X670E Gaming. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 690, 'catalogo/placas-mãe/3.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'X670E Gaming' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Z790 DDR5', 'Placa-mãe Z790 DDR5. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 760, 'catalogo/placas-mãe/4.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Z790 DDR5' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'B760M WiFi', 'Placa-mãe B760M WiFi. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 830, 'catalogo/placas-mãe/5.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'B760M WiFi' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'A520M', 'Placa-mãe A520M. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 775, 'catalogo/placas-mãe/6.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'A520M' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'B450M', 'Placa-mãe B450M. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 845, 'catalogo/placas-mãe/7.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'B450M' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'X570S', 'Placa-mãe X570S. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 915, 'catalogo/placas-mãe/8.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'X570S' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'H610M', 'Placa-mãe H610M. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 985, 'catalogo/placas-mãe/9.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'H610M' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'B660M', 'Placa-mãe B660M. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1055, 'catalogo/placas-mãe/10.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'B660M' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Z690', 'Placa-mãe Z690. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1000, 'catalogo/placas-mãe/11.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Z690' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'B650 Aorus', 'Placa-mãe B650 Aorus. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1070, 'catalogo/placas-mãe/12.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'B650 Aorus' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'MAG B550 Tomahawk', 'Placa-mãe MAG B550 Tomahawk. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1140, 'catalogo/placas-mãe/13.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'MAG B550 Tomahawk' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'TUF Gaming B650', 'Placa-mãe TUF Gaming B650. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1210, 'catalogo/placas-mãe/14.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'TUF Gaming B650' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Prime B760M', 'Placa-mãe Prime B760M. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1280, 'catalogo/placas-mãe/15.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Prime B760M' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'ROG Strix B550-F', 'Placa-mãe ROG Strix B550-F. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1225, 'catalogo/placas-mãe/16.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'ROG Strix B550-F' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'ProArt X670E', 'Placa-mãe ProArt X670E. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1295, 'catalogo/placas-mãe/17.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'ProArt X670E' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'MPG Z790 Edge', 'Placa-mãe MPG Z790 Edge. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1365, 'catalogo/placas-mãe/18.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'MPG Z790 Edge' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Steel Legend B650', 'Placa-mãe Steel Legend B650. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1435, 'catalogo/placas-mãe/19.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Steel Legend B650' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Gaming Plus B550', 'Placa-mãe Gaming Plus B550. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1505, 'catalogo/placas-mãe/20.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Gaming Plus B550' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'B550M Gaming Ed. 2', 'Placa-mãe B550M Gaming. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1450, 'catalogo/placas-mãe/21.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'B550M Gaming Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'B650M WiFi Ed. 2', 'Placa-mãe B650M WiFi. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1520, 'catalogo/placas-mãe/22.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'B650M WiFi Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'X670E Gaming Ed. 2', 'Placa-mãe X670E Gaming. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1590, 'catalogo/placas-mãe/23.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'X670E Gaming Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Z790 DDR5 Ed. 2', 'Placa-mãe Z790 DDR5. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1660, 'catalogo/placas-mãe/24.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Z790 DDR5 Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'B760M WiFi Ed. 2', 'Placa-mãe B760M WiFi. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1730, 'catalogo/placas-mãe/25.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'B760M WiFi Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'A520M Ed. 2', 'Placa-mãe A520M. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1675, 'catalogo/placas-mãe/26.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'A520M Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'B450M Ed. 2', 'Placa-mãe B450M. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1745, 'catalogo/placas-mãe/27.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'B450M Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'X570S Ed. 2', 'Placa-mãe X570S. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1815, 'catalogo/placas-mãe/28.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'X570S Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'H610M Ed. 2', 'Placa-mãe H610M. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1885, 'catalogo/placas-mãe/29.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'H610M Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'B660M Ed. 2', 'Placa-mãe B660M. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1955, 'catalogo/placas-mãe/30.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'B660M Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Z690 Ed. 2', 'Placa-mãe Z690. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 550, 'catalogo/placas-mãe/31.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Z690 Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'B650 Aorus Ed. 2', 'Placa-mãe B650 Aorus. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 620, 'catalogo/placas-mãe/32.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'B650 Aorus Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'MAG B550 Tomahawk Ed. 2', 'Placa-mãe MAG B550 Tomahawk. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 690, 'catalogo/placas-mãe/33.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'MAG B550 Tomahawk Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'TUF Gaming B650 Ed. 2', 'Placa-mãe TUF Gaming B650. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 760, 'catalogo/placas-mãe/34.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'TUF Gaming B650 Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Prime B760M Ed. 2', 'Placa-mãe Prime B760M. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 830, 'catalogo/placas-mãe/35.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Prime B760M Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'ROG Strix B550-F Ed. 2', 'Placa-mãe ROG Strix B550-F. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 775, 'catalogo/placas-mãe/36.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'ROG Strix B550-F Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'ProArt X670E Ed. 2', 'Placa-mãe ProArt X670E. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 845, 'catalogo/placas-mãe/37.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'ProArt X670E Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'MPG Z790 Edge Ed. 2', 'Placa-mãe MPG Z790 Edge. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 915, 'catalogo/placas-mãe/38.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'MPG Z790 Edge Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Steel Legend B650 Ed. 2', 'Placa-mãe Steel Legend B650. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 985, 'catalogo/placas-mãe/39.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Steel Legend B650 Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Gaming Plus B550 Ed. 2', 'Placa-mãe Gaming Plus B550. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1055, 'catalogo/placas-mãe/40.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Gaming Plus B550 Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'B550M Gaming Ed. 3', 'Placa-mãe B550M Gaming. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1000, 'catalogo/placas-mãe/41.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'B550M Gaming Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'B650M WiFi Ed. 3', 'Placa-mãe B650M WiFi. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1070, 'catalogo/placas-mãe/42.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'B650M WiFi Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'X670E Gaming Ed. 3', 'Placa-mãe X670E Gaming. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1140, 'catalogo/placas-mãe/43.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'X670E Gaming Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Z790 DDR5 Ed. 3', 'Placa-mãe Z790 DDR5. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1210, 'catalogo/placas-mãe/44.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Z790 DDR5 Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'B760M WiFi Ed. 3', 'Placa-mãe B760M WiFi. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1280, 'catalogo/placas-mãe/45.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'B760M WiFi Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'A520M Ed. 3', 'Placa-mãe A520M. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1225, 'catalogo/placas-mãe/46.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'A520M Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'B450M Ed. 3', 'Placa-mãe B450M. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1295, 'catalogo/placas-mãe/47.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'B450M Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'X570S Ed. 3', 'Placa-mãe X570S. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1365, 'catalogo/placas-mãe/48.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'X570S Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'H610M Ed. 3', 'Placa-mãe H610M. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1435, 'catalogo/placas-mãe/49.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'H610M Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'B660M Ed. 3', 'Placa-mãe B660M. Slots PCIe, USB e rede modernos. Suporte a overclock conforme chipset.', 'Placas-mãe', 1505, 'catalogo/placas-mãe/50.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'B660M Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 450W 80 Plus', 'Fonte 450W 80 Plus. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 220, 'catalogo/fontes/1.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 450W 80 Plus' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 500W 80 Plus Bronze', 'Fonte 500W 80 Plus Bronze. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 280, 'catalogo/fontes/2.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 500W 80 Plus Bronze' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 550W 80 Plus Bronze', 'Fonte 550W 80 Plus Bronze. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 340, 'catalogo/fontes/3.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 550W 80 Plus Bronze' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 650W 80 Plus Bronze', 'Fonte 650W 80 Plus Bronze. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 400, 'catalogo/fontes/4.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 650W 80 Plus Bronze' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 650W 80 Plus Gold', 'Fonte 650W 80 Plus Gold. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 460, 'catalogo/fontes/5.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 650W 80 Plus Gold' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 750W 80 Plus Gold', 'Fonte 750W 80 Plus Gold. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 420, 'catalogo/fontes/6.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 750W 80 Plus Gold' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 850W 80 Plus Gold', 'Fonte 850W 80 Plus Gold. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 480, 'catalogo/fontes/7.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 850W 80 Plus Gold' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 1000W 80 Plus Gold', 'Fonte 1000W 80 Plus Gold. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 540, 'catalogo/fontes/8.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 1000W 80 Plus Gold' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 750W Modular Gold', 'Fonte 750W Modular Gold. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 600, 'catalogo/fontes/9.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 750W Modular Gold' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 850W Modular Platinum', 'Fonte 850W Modular Platinum. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 660, 'catalogo/fontes/10.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 850W Modular Platinum' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 550W Full Modular', 'Fonte 550W Full Modular. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 620, 'catalogo/fontes/11.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 550W Full Modular' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 650W Semi Modular', 'Fonte 650W Semi Modular. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 680, 'catalogo/fontes/12.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 650W Semi Modular' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 1200W 80 Plus Platinum', 'Fonte 1200W 80 Plus Platinum. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 740, 'catalogo/fontes/13.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 1200W 80 Plus Platinum' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 450W PFC Ativo', 'Fonte 450W PFC Ativo. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 800, 'catalogo/fontes/14.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 450W PFC Ativo' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 500W White', 'Fonte 500W White. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 860, 'catalogo/fontes/15.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 500W White' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 600W Bronze', 'Fonte 600W Bronze. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 820, 'catalogo/fontes/16.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 600W Bronze' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 700W Gold', 'Fonte 700W Gold. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 880, 'catalogo/fontes/17.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 700W Gold' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 800W Gold Modular', 'Fonte 800W Gold Modular. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 940, 'catalogo/fontes/18.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 800W Gold Modular' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 900W Platinum', 'Fonte 900W Platinum. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 1000, 'catalogo/fontes/19.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 900W Platinum' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 1050W Titanium', 'Fonte 1050W Titanium. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 1060, 'catalogo/fontes/20.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 1050W Titanium' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 450W 80 Plus Ed. 2', 'Fonte 450W 80 Plus. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 1020, 'catalogo/fontes/21.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 450W 80 Plus Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 500W 80 Plus Bronze Ed. 2', 'Fonte 500W 80 Plus Bronze. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 1080, 'catalogo/fontes/22.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 500W 80 Plus Bronze Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 550W 80 Plus Bronze Ed. 2', 'Fonte 550W 80 Plus Bronze. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 1140, 'catalogo/fontes/23.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 550W 80 Plus Bronze Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 650W 80 Plus Bronze Ed. 2', 'Fonte 650W 80 Plus Bronze. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 1200, 'catalogo/fontes/24.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 650W 80 Plus Bronze Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 650W 80 Plus Gold Ed. 2', 'Fonte 650W 80 Plus Gold. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 1260, 'catalogo/fontes/25.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 650W 80 Plus Gold Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 750W 80 Plus Gold Ed. 2', 'Fonte 750W 80 Plus Gold. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 1220, 'catalogo/fontes/26.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 750W 80 Plus Gold Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 850W 80 Plus Gold Ed. 2', 'Fonte 850W 80 Plus Gold. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 1280, 'catalogo/fontes/27.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 850W 80 Plus Gold Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 1000W 80 Plus Gold Ed. 2', 'Fonte 1000W 80 Plus Gold. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 1340, 'catalogo/fontes/28.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 1000W 80 Plus Gold Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 750W Modular Gold Ed. 2', 'Fonte 750W Modular Gold. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 280, 'catalogo/fontes/29.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 750W Modular Gold Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 850W Modular Platinum Ed. 2', 'Fonte 850W Modular Platinum. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 340, 'catalogo/fontes/30.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 850W Modular Platinum Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 550W Full Modular Ed. 2', 'Fonte 550W Full Modular. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 300, 'catalogo/fontes/31.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 550W Full Modular Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 650W Semi Modular Ed. 2', 'Fonte 650W Semi Modular. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 360, 'catalogo/fontes/32.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 650W Semi Modular Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 1200W 80 Plus Platinum Ed. 2', 'Fonte 1200W 80 Plus Platinum. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 420, 'catalogo/fontes/33.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 1200W 80 Plus Platinum Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 450W PFC Ativo Ed. 2', 'Fonte 450W PFC Ativo. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 480, 'catalogo/fontes/34.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 450W PFC Ativo Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 500W White Ed. 2', 'Fonte 500W White. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 540, 'catalogo/fontes/35.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 500W White Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 600W Bronze Ed. 2', 'Fonte 600W Bronze. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 500, 'catalogo/fontes/36.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 600W Bronze Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 700W Gold Ed. 2', 'Fonte 700W Gold. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 560, 'catalogo/fontes/37.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 700W Gold Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 800W Gold Modular Ed. 2', 'Fonte 800W Gold Modular. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 620, 'catalogo/fontes/38.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 800W Gold Modular Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 900W Platinum Ed. 2', 'Fonte 900W Platinum. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 680, 'catalogo/fontes/39.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 900W Platinum Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 1050W Titanium Ed. 2', 'Fonte 1050W Titanium. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 740, 'catalogo/fontes/40.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 1050W Titanium Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 450W 80 Plus Ed. 3', 'Fonte 450W 80 Plus. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 700, 'catalogo/fontes/41.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 450W 80 Plus Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 500W 80 Plus Bronze Ed. 3', 'Fonte 500W 80 Plus Bronze. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 760, 'catalogo/fontes/42.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 500W 80 Plus Bronze Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 550W 80 Plus Bronze Ed. 3', 'Fonte 550W 80 Plus Bronze. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 820, 'catalogo/fontes/43.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 550W 80 Plus Bronze Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 650W 80 Plus Bronze Ed. 3', 'Fonte 650W 80 Plus Bronze. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 880, 'catalogo/fontes/44.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 650W 80 Plus Bronze Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 650W 80 Plus Gold Ed. 3', 'Fonte 650W 80 Plus Gold. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 940, 'catalogo/fontes/45.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 650W 80 Plus Gold Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 750W 80 Plus Gold Ed. 3', 'Fonte 750W 80 Plus Gold. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 900, 'catalogo/fontes/46.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 750W 80 Plus Gold Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 850W 80 Plus Gold Ed. 3', 'Fonte 850W 80 Plus Gold. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 960, 'catalogo/fontes/47.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 850W 80 Plus Gold Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 1000W 80 Plus Gold Ed. 3', 'Fonte 1000W 80 Plus Gold. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 1020, 'catalogo/fontes/48.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 1000W 80 Plus Gold Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 750W Modular Gold Ed. 3', 'Fonte 750W Modular Gold. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 1080, 'catalogo/fontes/49.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 750W Modular Gold Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Fonte 850W Modular Platinum Ed. 3', 'Fonte 850W Modular Platinum. Proteções OVP/UVP/SCP. Cabos com boa organização.', 'Fontes', 1140, 'catalogo/fontes/50.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Fonte 850W Modular Platinum Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Teclado Mecânico Red Switch', 'Teclado Mecânico Red Switch. Conforto e precisão para uso diário e jogos.', 'Periféricos', 80, 'catalogo/periféricos/1.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Teclado Mecânico Red Switch' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Teclado Mecânico Blue Switch', 'Teclado Mecânico Blue Switch. Conforto e precisão para uso diário e jogos.', 'Periféricos', 114, 'catalogo/periféricos/2.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Teclado Mecânico Blue Switch' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Teclado Membrana RGB', 'Teclado Membrana RGB. Conforto e precisão para uso diário e jogos.', 'Periféricos', 148, 'catalogo/periféricos/3.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Teclado Membrana RGB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Mouse Gamer 16000 DPI', 'Mouse Gamer 16000 DPI. Conforto e precisão para uso diário e jogos.', 'Periféricos', 182, 'catalogo/periféricos/4.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Mouse Gamer 16000 DPI' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Mouse Gamer Wireless', 'Mouse Gamer Wireless. Conforto e precisão para uso diário e jogos.', 'Periféricos', 216, 'catalogo/periféricos/5.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Mouse Gamer Wireless' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Mousepad Grande RGB', 'Mousepad Grande RGB. Conforto e precisão para uso diário e jogos.', 'Periféricos', 250, 'catalogo/periféricos/6.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Mousepad Grande RGB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Headset 7.1 USB', 'Headset 7.1 USB. Conforto e precisão para uso diário e jogos.', 'Periféricos', 212, 'catalogo/periféricos/7.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Headset 7.1 USB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Headset Wireless', 'Headset Wireless. Conforto e precisão para uso diário e jogos.', 'Periféricos', 246, 'catalogo/periféricos/8.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Headset Wireless' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Webcam Full HD 1080p', 'Webcam Full HD 1080p. Conforto e precisão para uso diário e jogos.', 'Periféricos', 280, 'catalogo/periféricos/9.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Webcam Full HD 1080p' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Webcam 4K', 'Webcam 4K. Conforto e precisão para uso diário e jogos.', 'Periféricos', 314, 'catalogo/periféricos/10.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Webcam 4K' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Microfone USB Condensador', 'Microfone USB Condensador. Conforto e precisão para uso diário e jogos.', 'Periféricos', 348, 'catalogo/periféricos/11.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Microfone USB Condensador' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Caixa de Som 2.1', 'Caixa de Som 2.1. Conforto e precisão para uso diário e jogos.', 'Periféricos', 382, 'catalogo/periféricos/12.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Caixa de Som 2.1' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Controle Xbox Series', 'Controle Xbox Series. Conforto e precisão para uso diário e jogos.', 'Periféricos', 344, 'catalogo/periféricos/13.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Controle Xbox Series' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Controle PS5 DualSense', 'Controle PS5 DualSense. Conforto e precisão para uso diário e jogos.', 'Periféricos', 378, 'catalogo/periféricos/14.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Controle PS5 DualSense' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Teclado 60% RGB', 'Teclado 60% RGB. Conforto e precisão para uso diário e jogos.', 'Periféricos', 412, 'catalogo/periféricos/15.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Teclado 60% RGB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Mouse Ergonômico Vertical', 'Mouse Ergonômico Vertical. Conforto e precisão para uso diário e jogos.', 'Periféricos', 446, 'catalogo/periféricos/16.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Mouse Ergonômico Vertical' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Combo Teclado + Mouse', 'Combo Teclado + Mouse. Conforto e precisão para uso diário e jogos.', 'Periféricos', 480, 'catalogo/periféricos/17.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Combo Teclado + Mouse' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Headset Drivers 50mm', 'Headset Drivers 50mm. Conforto e precisão para uso diário e jogos.', 'Periféricos', 514, 'catalogo/periféricos/18.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Headset Drivers 50mm' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Mousepad XXL', 'Mousepad XXL. Conforto e precisão para uso diário e jogos.', 'Periféricos', 476, 'catalogo/periféricos/19.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Mousepad XXL' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Teclado Numpad', 'Teclado Numpad. Conforto e precisão para uso diário e jogos.', 'Periféricos', 510, 'catalogo/periféricos/20.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Teclado Numpad' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Teclado Mecânico Red Switch Ed. 2', 'Teclado Mecânico Red Switch. Conforto e precisão para uso diário e jogos.', 'Periféricos', 544, 'catalogo/periféricos/21.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Teclado Mecânico Red Switch Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Teclado Mecânico Blue Switch Ed. 2', 'Teclado Mecânico Blue Switch. Conforto e precisão para uso diário e jogos.', 'Periféricos', 578, 'catalogo/periféricos/22.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Teclado Mecânico Blue Switch Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Teclado Membrana RGB Ed. 2', 'Teclado Membrana RGB. Conforto e precisão para uso diário e jogos.', 'Periféricos', 612, 'catalogo/periféricos/23.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Teclado Membrana RGB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Mouse Gamer 16000 DPI Ed. 2', 'Mouse Gamer 16000 DPI. Conforto e precisão para uso diário e jogos.', 'Periféricos', 646, 'catalogo/periféricos/24.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Mouse Gamer 16000 DPI Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Mouse Gamer Wireless Ed. 2', 'Mouse Gamer Wireless. Conforto e precisão para uso diário e jogos.', 'Periféricos', 608, 'catalogo/periféricos/25.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Mouse Gamer Wireless Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Mousepad Grande RGB Ed. 2', 'Mousepad Grande RGB. Conforto e precisão para uso diário e jogos.', 'Periféricos', 92, 'catalogo/periféricos/26.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Mousepad Grande RGB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Headset 7.1 USB Ed. 2', 'Headset 7.1 USB. Conforto e precisão para uso diário e jogos.', 'Periféricos', 126, 'catalogo/periféricos/27.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Headset 7.1 USB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Headset Wireless Ed. 2', 'Headset Wireless. Conforto e precisão para uso diário e jogos.', 'Periféricos', 160, 'catalogo/periféricos/28.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Headset Wireless Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Webcam Full HD 1080p Ed. 2', 'Webcam Full HD 1080p. Conforto e precisão para uso diário e jogos.', 'Periféricos', 194, 'catalogo/periféricos/29.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Webcam Full HD 1080p Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Webcam 4K Ed. 2', 'Webcam 4K. Conforto e precisão para uso diário e jogos.', 'Periféricos', 228, 'catalogo/periféricos/30.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Webcam 4K Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Microfone USB Condensador Ed. 2', 'Microfone USB Condensador. Conforto e precisão para uso diário e jogos.', 'Periféricos', 190, 'catalogo/periféricos/31.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Microfone USB Condensador Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Caixa de Som 2.1 Ed. 2', 'Caixa de Som 2.1. Conforto e precisão para uso diário e jogos.', 'Periféricos', 224, 'catalogo/periféricos/32.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Caixa de Som 2.1 Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Controle Xbox Series Ed. 2', 'Controle Xbox Series. Conforto e precisão para uso diário e jogos.', 'Periféricos', 258, 'catalogo/periféricos/33.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Controle Xbox Series Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Controle PS5 DualSense Ed. 2', 'Controle PS5 DualSense. Conforto e precisão para uso diário e jogos.', 'Periféricos', 292, 'catalogo/periféricos/34.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Controle PS5 DualSense Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Teclado 60% RGB Ed. 2', 'Teclado 60% RGB. Conforto e precisão para uso diário e jogos.', 'Periféricos', 326, 'catalogo/periféricos/35.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Teclado 60% RGB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Mouse Ergonômico Vertical Ed. 2', 'Mouse Ergonômico Vertical. Conforto e precisão para uso diário e jogos.', 'Periféricos', 360, 'catalogo/periféricos/36.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Mouse Ergonômico Vertical Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Combo Teclado + Mouse Ed. 2', 'Combo Teclado + Mouse. Conforto e precisão para uso diário e jogos.', 'Periféricos', 322, 'catalogo/periféricos/37.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Combo Teclado + Mouse Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Headset Drivers 50mm Ed. 2', 'Headset Drivers 50mm. Conforto e precisão para uso diário e jogos.', 'Periféricos', 356, 'catalogo/periféricos/38.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Headset Drivers 50mm Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Mousepad XXL Ed. 2', 'Mousepad XXL. Conforto e precisão para uso diário e jogos.', 'Periféricos', 390, 'catalogo/periféricos/39.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Mousepad XXL Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Teclado Numpad Ed. 2', 'Teclado Numpad. Conforto e precisão para uso diário e jogos.', 'Periféricos', 424, 'catalogo/periféricos/40.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Teclado Numpad Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Teclado Mecânico Red Switch Ed. 3', 'Teclado Mecânico Red Switch. Conforto e precisão para uso diário e jogos.', 'Periféricos', 458, 'catalogo/periféricos/41.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Teclado Mecânico Red Switch Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Teclado Mecânico Blue Switch Ed. 3', 'Teclado Mecânico Blue Switch. Conforto e precisão para uso diário e jogos.', 'Periféricos', 492, 'catalogo/periféricos/42.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Teclado Mecânico Blue Switch Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Teclado Membrana RGB Ed. 3', 'Teclado Membrana RGB. Conforto e precisão para uso diário e jogos.', 'Periféricos', 454, 'catalogo/periféricos/43.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Teclado Membrana RGB Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Mouse Gamer 16000 DPI Ed. 3', 'Mouse Gamer 16000 DPI. Conforto e precisão para uso diário e jogos.', 'Periféricos', 488, 'catalogo/periféricos/44.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Mouse Gamer 16000 DPI Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Mouse Gamer Wireless Ed. 3', 'Mouse Gamer Wireless. Conforto e precisão para uso diário e jogos.', 'Periféricos', 522, 'catalogo/periféricos/45.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Mouse Gamer Wireless Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Mousepad Grande RGB Ed. 3', 'Mousepad Grande RGB. Conforto e precisão para uso diário e jogos.', 'Periféricos', 556, 'catalogo/periféricos/46.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Mousepad Grande RGB Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Headset 7.1 USB Ed. 3', 'Headset 7.1 USB. Conforto e precisão para uso diário e jogos.', 'Periféricos', 590, 'catalogo/periféricos/47.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Headset 7.1 USB Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Headset Wireless Ed. 3', 'Headset Wireless. Conforto e precisão para uso diário e jogos.', 'Periféricos', 624, 'catalogo/periféricos/48.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Headset Wireless Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Webcam Full HD 1080p Ed. 3', 'Webcam Full HD 1080p. Conforto e precisão para uso diário e jogos.', 'Periféricos', 586, 'catalogo/periféricos/49.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Webcam Full HD 1080p Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Webcam 4K Ed. 3', 'Webcam 4K. Conforto e precisão para uso diário e jogos.', 'Periféricos', 620, 'catalogo/periféricos/50.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Webcam 4K Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Cooler CPU Torre Dual Fan', 'Cooler CPU Torre Dual Fan. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 35, 'catalogo/acessórios/1.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Cooler CPU Torre Dual Fan' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Water Cooler 240mm', 'Water Cooler 240mm. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 63, 'catalogo/acessórios/2.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Water Cooler 240mm' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Water Cooler 360mm', 'Water Cooler 360mm. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 91, 'catalogo/acessórios/3.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Water Cooler 360mm' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Cooler Box Intel', 'Cooler Box Intel. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 119, 'catalogo/acessórios/4.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Cooler Box Intel' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Pasta Térmica 4g', 'Pasta Térmica 4g. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 147, 'catalogo/acessórios/5.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Pasta Térmica 4g' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Cabo DisplayPort 2m', 'Cabo DisplayPort 2m. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 175, 'catalogo/acessórios/6.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Cabo DisplayPort 2m' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Cabo HDMI 2.1 2m', 'Cabo HDMI 2.1 2m. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 203, 'catalogo/acessórios/7.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Cabo HDMI 2.1 2m' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Hub USB 3.0 4 portas', 'Hub USB 3.0 4 portas. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 161, 'catalogo/acessórios/8.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Hub USB 3.0 4 portas' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Adaptador USB-C Hub', 'Adaptador USB-C Hub. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 189, 'catalogo/acessórios/9.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Adaptador USB-C Hub' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Suporte Monitor Articulado', 'Suporte Monitor Articulado. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 217, 'catalogo/acessórios/10.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Suporte Monitor Articulado' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Filtro de Linha 6 tomadas', 'Filtro de Linha 6 tomadas. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 245, 'catalogo/acessórios/11.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Filtro de Linha 6 tomadas' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'LED RGB Fita 5m', 'LED RGB Fita 5m. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 273, 'catalogo/acessórios/12.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'LED RGB Fita 5m' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Controladora RGB', 'Controladora RGB. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 301, 'catalogo/acessórios/13.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Controladora RGB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Ventoinha 120mm RGB', 'Ventoinha 120mm RGB. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 329, 'catalogo/acessórios/14.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Ventoinha 120mm RGB' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Kit 3 Fans 120mm', 'Kit 3 Fans 120mm. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 287, 'catalogo/acessórios/15.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Kit 3 Fans 120mm' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Cabo SATA 3.0', 'Cabo SATA 3.0. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 315, 'catalogo/acessórios/16.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Cabo SATA 3.0' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Extensor PCIe Riser', 'Extensor PCIe Riser. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 343, 'catalogo/acessórios/17.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Extensor PCIe Riser' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Base Notebook Cooler', 'Base Notebook Cooler. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 371, 'catalogo/acessórios/18.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Base Notebook Cooler' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Organizador de Cabos', 'Organizador de Cabos. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 399, 'catalogo/acessórios/19.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Organizador de Cabos' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Kit Limpeza PC', 'Kit Limpeza PC. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 427, 'catalogo/acessórios/20.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Kit Limpeza PC' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Cooler CPU Torre Dual Fan Ed. 2', 'Cooler CPU Torre Dual Fan. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 455, 'catalogo/acessórios/21.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Cooler CPU Torre Dual Fan Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Water Cooler 240mm Ed. 2', 'Water Cooler 240mm. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 413, 'catalogo/acessórios/22.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Water Cooler 240mm Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Water Cooler 360mm Ed. 2', 'Water Cooler 360mm. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 441, 'catalogo/acessórios/23.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Water Cooler 360mm Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Cooler Box Intel Ed. 2', 'Cooler Box Intel. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 469, 'catalogo/acessórios/24.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Cooler Box Intel Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Pasta Térmica 4g Ed. 2', 'Pasta Térmica 4g. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 497, 'catalogo/acessórios/25.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Pasta Térmica 4g Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Cabo DisplayPort 2m Ed. 2', 'Cabo DisplayPort 2m. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 525, 'catalogo/acessórios/26.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Cabo DisplayPort 2m Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Cabo HDMI 2.1 2m Ed. 2', 'Cabo HDMI 2.1 2m. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 553, 'catalogo/acessórios/27.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Cabo HDMI 2.1 2m Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Hub USB 3.0 4 portas Ed. 2', 'Hub USB 3.0 4 portas. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 581, 'catalogo/acessórios/28.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Hub USB 3.0 4 portas Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Adaptador USB-C Hub Ed. 2', 'Adaptador USB-C Hub. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 539, 'catalogo/acessórios/29.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Adaptador USB-C Hub Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Suporte Monitor Articulado Ed. 2', 'Suporte Monitor Articulado. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 567, 'catalogo/acessórios/30.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Suporte Monitor Articulado Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Filtro de Linha 6 tomadas Ed. 2', 'Filtro de Linha 6 tomadas. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 55, 'catalogo/acessórios/31.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Filtro de Linha 6 tomadas Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'LED RGB Fita 5m Ed. 2', 'LED RGB Fita 5m. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 83, 'catalogo/acessórios/32.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'LED RGB Fita 5m Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Controladora RGB Ed. 2', 'Controladora RGB. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 111, 'catalogo/acessórios/33.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Controladora RGB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Ventoinha 120mm RGB Ed. 2', 'Ventoinha 120mm RGB. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 139, 'catalogo/acessórios/34.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Ventoinha 120mm RGB Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Kit 3 Fans 120mm Ed. 2', 'Kit 3 Fans 120mm. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 167, 'catalogo/acessórios/35.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Kit 3 Fans 120mm Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Cabo SATA 3.0 Ed. 2', 'Cabo SATA 3.0. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 125, 'catalogo/acessórios/36.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Cabo SATA 3.0 Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Extensor PCIe Riser Ed. 2', 'Extensor PCIe Riser. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 153, 'catalogo/acessórios/37.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Extensor PCIe Riser Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Base Notebook Cooler Ed. 2', 'Base Notebook Cooler. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 181, 'catalogo/acessórios/38.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Base Notebook Cooler Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Organizador de Cabos Ed. 2', 'Organizador de Cabos. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 209, 'catalogo/acessórios/39.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Organizador de Cabos Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Kit Limpeza PC Ed. 2', 'Kit Limpeza PC. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 237, 'catalogo/acessórios/40.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Kit Limpeza PC Ed. 2' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Cooler CPU Torre Dual Fan Ed. 3', 'Cooler CPU Torre Dual Fan. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 265, 'catalogo/acessórios/41.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Cooler CPU Torre Dual Fan Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Water Cooler 240mm Ed. 3', 'Water Cooler 240mm. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 293, 'catalogo/acessórios/42.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Water Cooler 240mm Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Water Cooler 360mm Ed. 3', 'Water Cooler 360mm. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 251, 'catalogo/acessórios/43.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Water Cooler 360mm Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Cooler Box Intel Ed. 3', 'Cooler Box Intel. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 279, 'catalogo/acessórios/44.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Cooler Box Intel Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Pasta Térmica 4g Ed. 3', 'Pasta Térmica 4g. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 307, 'catalogo/acessórios/45.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Pasta Térmica 4g Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Cabo DisplayPort 2m Ed. 3', 'Cabo DisplayPort 2m. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 335, 'catalogo/acessórios/46.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Cabo DisplayPort 2m Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Cabo HDMI 2.1 2m Ed. 3', 'Cabo HDMI 2.1 2m. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 363, 'catalogo/acessórios/47.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Cabo HDMI 2.1 2m Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Hub USB 3.0 4 portas Ed. 3', 'Hub USB 3.0 4 portas. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 391, 'catalogo/acessórios/48.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@terabyte.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Hub USB 3.0 4 portas Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Adaptador USB-C Hub Ed. 3', 'Adaptador USB-C Hub. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 419, 'catalogo/acessórios/49.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@pichau.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Adaptador USB-C Hub Ed. 3' AND P.ID_LOJA = L.ID
);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Suporte Monitor Articulado Ed. 3', 'Suporte Monitor Articulado. Complemento essencial para montagem e manutenção do PC.', 'Acessórios', 377, 'catalogo/acessórios/50.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'parceiro@kabum.com.br'
AND NOT EXISTS (
  SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Suporte Monitor Articulado Ed. 3' AND P.ID_LOJA = L.ID
);

-- Fim da migração 005