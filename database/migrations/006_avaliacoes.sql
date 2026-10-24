-- ============================================================
-- MIGRACAO 006 — Avaliações de produto (estilo Mercado Livre)
-- ============================================================

CREATE TABLE IF NOT EXISTS AVALIACAO (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    PRODUTO_ID INT NOT NULL,
    CLIENTE_ID INT NOT NULL,
    NOTA TINYINT NOT NULL CHECK (NOTA BETWEEN 1 AND 5),
    COMENTARIO TEXT,
    CRIADO_EM TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (PRODUTO_ID) REFERENCES PRODUTO(ID) ON DELETE CASCADE,
    FOREIGN KEY (CLIENTE_ID) REFERENCES CLIENTE(ID) ON DELETE CASCADE,
    UNIQUE KEY uk_avaliacao_produto_cliente (PRODUTO_ID, CLIENTE_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Índice para listar avaliações de um produto rápido
CREATE INDEX idx_avaliacao_produto ON AVALIACAO(PRODUTO_ID);
