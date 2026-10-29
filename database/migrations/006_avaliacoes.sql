-- ============================================================
-- MIGRACAO 006 — Avaliações de produto (estilo Mercado Livre)
--
-- Cria a tabela AVALIACAO:
--   * ID_PRODUTO  -> o produto avaliado
--   * ID_CLIENTE  -> quem avaliou (NULL nas avaliações de exemplo)
--   * NOME_CLIENTE-> nome exibido (guardado na hora da avaliação,
--                    para o nome histórico continuar valendo mesmo
--                    depois de o cliente mudar o cadastro)
--   * NOTA        -> 1 a 5 estrelas (CHECK no banco)
--   * COMENTARIO  -> texto opcional
--   * DATA        -> quando foi avaliado
-- Regra: 1 avaliação por cliente por produto (chave única), que
-- pode ser atualizada — igual ao comportamento de "editar review".
--
-- Também popula avaliações de exemplo nos 12 primeiros produtos
-- ativos, pra a vitrine já nascer com estrelas visíveis.
-- ============================================================

USE `pc_forge`;

CREATE TABLE IF NOT EXISTS AVALIACAO (
    ID           INT AUTO_INCREMENT PRIMARY KEY,
    ID_PRODUTO   INT NOT NULL,
    ID_CLIENTE   INT NULL,
    NOME_CLIENTE VARCHAR(120) NOT NULL,
    NOTA         INT NOT NULL,
    COMENTARIO   VARCHAR(1000) NULL,
    DATA         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_avaliacao_produto
        FOREIGN KEY (ID_PRODUTO) REFERENCES PRODUTO (ID),
    CONSTRAINT fk_avaliacao_cliente
        FOREIGN KEY (ID_CLIENTE) REFERENCES CLIENTE (ID)
        ON DELETE SET NULL,
    CONSTRAINT ck_avaliacao_nota CHECK (NOTA BETWEEN 1 AND 5),
    CONSTRAINT uk_avaliacao_cliente_produto UNIQUE (ID_CLIENTE, ID_PRODUTO),
    -- o INDEX nome único abaixo permite cliente repetir produto apenas
    -- para atualizar (upsert) e permite N exemplos com ID_CLIENTE NULL
    -- enquanto a unicidade real é garantida acima:
    INDEX ix_avaliacao_produto (ID_PRODUTO)
);

-- Observações práticas:
--   * Único por (ID_CLIENTE, ID_PRODUTO): no MySQL, valores NULL não
--     colidem nesse índice, então as avaliações de exemplo (sem cliente)
--     podem existir em quantidade — o que queremos.
--   * O upsert do back-end usa ON DUPLICATE KEY UPDATE nessa chave, então
--     o cliente "edita a review" dele apenas atualizando a linha.

-- ------------------------------------------------------------
-- Avaliações de exemplo: 12 primeiros produtos ativos x 6 autores
-- (talvez não seja 72, se o banco tiver menos produtos; o JOIN
-- resolve distinguindo os que existem)
--
-- Idempotente: o WHERE NOT EXISTS impede repetir as avaliações de
-- exemplo se este arquivo rodar mais de uma vez (importante, porque
-- NULL não colide na unique key do MySQL — sem esse filtro, rodar
-- duas vezes duplicaria tudo).
-- ------------------------------------------------------------
INSERT INTO AVALIACAO (ID_PRODUTO, ID_CLIENTE, NOME_CLIENTE, NOTA, COMENTARIO)
WITH alvo AS (
    SELECT ID FROM PRODUTO WHERE ATIVO = 1 ORDER BY ID LIMIT 12
),
declarado AS (
    SELECT 1 AS i, 'Marcelo S.' AS nome, 5 AS nota, 'Chegou bem embalado e antes do prazo. Recomendo demais, loja parceira!' AS comentario
    UNION ALL SELECT 2, 'Ana P.', 4, 'Produto original e de ótima qualidade. A foto bateu exatamente com o que recebi.'
    UNION ALL SELECT 3, 'Bruno T.', 5, 'Excelente custo-benefício. Já é a segunda compra que faço aqui.'
    UNION ALL SELECT 4, 'Carla M.', 3, 'Funciona bem, mas achei que a embalagem podia ter chegado com mais proteção.'
    UNION ALL SELECT 5, 'Diego R.', 5, 'Melhor preço que encontrei. Entrega rápida e nota fiscal certinha.'
    UNION ALL SELECT 6, 'Ester L.', 4, 'Muito bom! Só faltou um manual ilustrado, no mais produto impecável.'
)
SELECT a.ID, NULL, d.nome, d.nota, d.comentario
FROM alvo a
CROSS JOIN declarado d
WHERE NOT EXISTS (
    SELECT 1 FROM AVALIACAO V
    WHERE V.ID_PRODUTO = a.ID
      AND V.ID_CLIENTE IS NULL
      AND V.NOME_CLIENTE = d.nome
      AND V.NOTA = d.nota
);
