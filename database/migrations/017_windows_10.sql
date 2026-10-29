-- ============================================================
-- MIGRAÇÃO 017 — Windows 10 sem custo (kit "Melhor Upgrade da Forja")
--
-- O kit de preset "O Melhor Upgrade da Forja" (frontend kits.js)
-- pré-seleciona o sistema Windows 10. Como os sistemas operacionais
-- só existem como PRODUTO (as categorias são escondidas da vitrine
-- no GET /produtos), o Windows 10 precisa existir no banco pra
-- entrar no carrinho junto com a build.
--
-- Mesmo padrão da Linux Ubuntu na 013: vendido pela loja própria
-- da plataforma, preço 0 (a licença entra como cortesia assim como
-- a instalação do Ubuntu), idempotente.
-- ============================================================

USE pc_forge;

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Windows 10 Pro (sem custo)',
       'Instalação do Windows 10 incluída no serviço de montagem, sem custo adicional.',
       'Sistemas Operacionais', 0, 'catalogo/sistemas/4.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'pcforge@gmail.com'
AND NOT EXISTS (SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Windows 10 Pro (sem custo)' AND P.ID_LOJA = L.ID);
