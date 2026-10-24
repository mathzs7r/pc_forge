-- ============================================================
-- MIGRACAO 008 — Acesso restrito do ADMINISTRADOR + log de acessos
-- ============================================================
-- ACESSO_LOG: uma linha por carregamento de página no site público
-- (a navbar registra). O painel do administrador soma o total e o
-- de hoje. Cada visita é anônima: só página e horário, sem dados
-- pessoais da pessoa que acessou.
-- ============================================================

USE pc_forge;

CREATE TABLE IF NOT EXISTS ACESSO_LOG (
    ID     INT AUTO_INCREMENT PRIMARY KEY,
    PAGINA VARCHAR(200) NULL,
    DATA   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX ix_acesso_data (DATA)
);
