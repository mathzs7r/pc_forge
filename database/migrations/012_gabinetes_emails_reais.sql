-- ============================================================
-- MIGRAÇÃO 012 — Correção da 011 (gabinetes)
-- A 011 mirava os e-mails "parceiro@pichau.com.br" etc. (que só
-- existem no seed do 005), mas as lojas que VALERAM no banco são
-- pichau@gmail.com / kabum@gmail.com / terabyte@gmail.com.
-- Resultado: 011 aplicou e inseriu zero linha. Este arquivo
-- repete os INSERTs com os e-mails que existem de verdade.
-- Idempotente: só insere se ainda não existir (nome + loja).
-- ============================================================

USE pc_forge;

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Gabinete Mini Tower mATX até 280mm',
       'Gabinete Mini Tower mATX. Suporta placa de vídeo de até 280mm.',
       'Gabinetes', 190, 'catalogo/gabinetes/1.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'pichau@gmail.com'
AND NOT EXISTS (SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Gabinete Mini Tower mATX até 280mm' AND P.ID_LOJA = L.ID);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Gabinete Mini Tower mATX Mesh até 290mm',
       'Gabinete Mini Tower mATX frente mesh. Suporta placa de vídeo de até 290mm.',
       'Gabinetes', 230, 'catalogo/gabinetes/2.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'kabum@gmail.com'
AND NOT EXISTS (SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Gabinete Mini Tower mATX Mesh até 290mm' AND P.ID_LOJA = L.ID);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Gabinete Mid Tower ATX até 300mm',
       'Gabinete Mid Tower ATX. Suporta placa de vídeo de até 300mm.',
       'Gabinetes', 280, 'catalogo/gabinetes/3.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'terabyte@gmail.com'
AND NOT EXISTS (SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Gabinete Mid Tower ATX até 300mm' AND P.ID_LOJA = L.ID);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Gabinete Mid Tower ATX Mesh até 320mm',
       'Gabinete Mid Tower ATX mesh. Suporta placa de vídeo de até 320mm e radiador até 280mm.',
       'Gabinetes', 340, 'catalogo/gabinetes/4.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'pichau@gmail.com'
AND NOT EXISTS (SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Gabinete Mid Tower ATX Mesh até 320mm' AND P.ID_LOJA = L.ID);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Gabinete Mid Tower ATX RGB até 330mm',
       'Gabinete Mid Tower ATX vidro temperado, 3 fans ARGB. Suporta placa de vídeo de até 330mm.',
       'Gabinetes', 420, 'catalogo/gabinetes/5.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'kabum@gmail.com'
AND NOT EXISTS (SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Gabinete Mid Tower ATX RGB até 330mm' AND P.ID_LOJA = L.ID);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Gabinete Mid Tower ATX Silent até 310mm',
       'Gabinete Mid Tower ATX com isolamento acústico. Suporta placa de vídeo de até 310mm.',
       'Gabinetes', 460, 'catalogo/gabinetes/6.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'terabyte@gmail.com'
AND NOT EXISTS (SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Gabinete Mid Tower ATX Silent até 310mm' AND P.ID_LOJA = L.ID);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Gabinete Full Tower E-ATX até 400mm',
       'Gabinete Full Tower E-ATX. Suporta placa de vídeo de até 400mm e radiador até 420mm.',
       'Gabinetes', 620, 'catalogo/gabinetes/7.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'pichau@gmail.com'
AND NOT EXISTS (SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Gabinete Full Tower E-ATX até 400mm' AND P.ID_LOJA = L.ID);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Gabinete Full Tower ATX até 380mm',
       'Gabinete Full Tower ATX. Suporta placa de vídeo de até 380mm e water cooler até 360mm.',
       'Gabinetes', 540, 'catalogo/gabinetes/8.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'kabum@gmail.com'
AND NOT EXISTS (SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Gabinete Full Tower ATX até 380mm' AND P.ID_LOJA = L.ID);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Gabinete Mid Tower ATX até 330mm Gaming',
       'Gabinete Mid Tower ATX com janela lateral. Suporta placa de vídeo de até 330mm.',
       'Gabinetes', 390, 'catalogo/gabinetes/9.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'terabyte@gmail.com'
AND NOT EXISTS (SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Gabinete Mid Tower ATX até 330mm Gaming' AND P.ID_LOJA = L.ID);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Gabinete Mid Tower ATX Mesh até 340mm Branco',
       'Gabinete Mid Tower ATX branco frente mesh dupla. Suporta placa de vídeo de até 340mm.',
       'Gabinetes', 370, 'catalogo/gabinetes/10.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'pichau@gmail.com'
AND NOT EXISTS (SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Gabinete Mid Tower ATX Mesh até 340mm Branco' AND P.ID_LOJA = L.ID);
