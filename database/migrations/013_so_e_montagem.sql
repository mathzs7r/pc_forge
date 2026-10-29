-- ============================================================
-- MIGRAÇÃO 013 — Sistema operacional + serviço de montagem
--
-- "Monte seu PC" oferece duas modalidades:
--   a) SÓ AS PEÇAS: o cliente monta em casa.
--   b) MONTO NA LOJA: leva serviço de montagem + o sistema
--      operacional escolhido, já instalado.
--
-- SO e serviço precisam existir como PRODUTO pra poderem ir no
-- carrinho (o banco exige FK), mas o backend ESCONDE as
-- categorias "Sistemas Operacionais" e "Serviços" da vitrine
-- (rotas completas em produto.html?id=N existem so "internas").
-- Vendidos pela loja própria da plataforma (pcforge@gmail.com).
-- Idempotente: só insere se ainda não existir.
-- ============================================================

USE pc_forge;

-- ---------- Sistemas operacionais ----------
INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Windows 11 Home (chave digital)',
       'Licença digital com instalação incluída quando combinada com o serviço de montagem.',
       'Sistemas Operacionais', 650, 'catalogo/sistemas/1.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'pcforge@gmail.com'
AND NOT EXISTS (SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Windows 11 Home (chave digital)' AND P.ID_LOJA = L.ID);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Windows 11 Pro (chave digital)',
       'Licença digital do Windows 11 Pro. Instalação incluída junto com o serviço de montagem.',
       'Sistemas Operacionais', 900, 'catalogo/sistemas/2.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'pcforge@gmail.com'
AND NOT EXISTS (SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Windows 11 Pro (chave digital)' AND P.ID_LOJA = L.ID);

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Linux Ubuntu (sem custo)',
       'Instalação do Ubuntu LTS incluída no serviço de montagem, sem custo adicional.',
       'Sistemas Operacionais', 0, 'catalogo/sistemas/3.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'pcforge@gmail.com'
AND NOT EXISTS (SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Linux Ubuntu (sem custo)' AND P.ID_LOJA = L.ID);

-- ---------- Serviço (etapa opcional) ----------
INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Serviço de Montagem',
       'Montagem do seu PC na bancada da loja: tudo instalado, testado, com gerenciamento de cabos e máquina pronta pro uso. Inclui media, atualização de drivers e instalação do sistema escolhido.',
       'Serviços', 200, 'catalogo/servicos/montagem.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'pcforge@gmail.com'
AND NOT EXISTS (SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Serviço de Montagem' AND P.ID_LOJA = L.ID);
