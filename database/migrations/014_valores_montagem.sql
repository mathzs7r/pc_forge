-- ============================================================
-- MIGRAÇÃO 014 — Valores do "Montado na loja"
-- Serviço de Montagem passa a custar R$ 0,10 (011/013 tinham
-- R$ 200). O FRETE DO PC PRONTO (~R$ 10) entra como item da
-- categoria "Serviços" (escondida da vitrine, igual o SO).
-- ============================================================

USE pc_forge;

UPDATE PRODUTO SET PRECO = 0.10
WHERE NOME = 'Serviço de Montagem' AND CATEGORIA = 'Serviços';

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, ATIVO)
SELECT L.ID, 'Frete do PC Montado',
       'Envio do computador já montado, testado e embalado em caixa reforçada.',
       'Serviços', 10, 'catalogo/servicos/frete.jpg', 1, 1
FROM LOJA L WHERE L.EMAIL = 'pcforge@gmail.com'
AND NOT EXISTS (SELECT 1 FROM PRODUTO P WHERE P.NOME = 'Frete do PC Montado' AND P.ID_LOJA = L.ID);
