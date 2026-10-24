-- ============================================================
-- MIGRACAO 007 — Logo da loja (URL ou path)
-- ============================================================

ALTER TABLE LOJA
    ADD COLUMN IF NOT EXISTS LOGO_URL VARCHAR(500) NULL AFTER TELEFONE;
