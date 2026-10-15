-- ============================================================
-- MIGRAÇÃO 002 — Cliente de teste
-- ============================================================
-- Cria um cliente de exemplo pra você poder fazer login no site logo
-- depois de rodar "npm run migrate", sem precisar cadastrar antes:
--
--   E-mail: cliente@teste.com   (ou CPF 123.456.789-09)
--   Senha:  senha123
--
-- É seguro rodar mais de uma vez: só insere se o cliente ainda não
-- existir (a checagem é por e-mail OU CPF), e o endereço só entra se o
-- cliente ainda não tiver nenhum.
--
-- Atenção: é conta de TESTE. Se um dia for publicar o site de verdade,
-- apague esse cliente:  DELETE FROM CLIENTE WHERE EMAIL = 'cliente@teste.com';
-- (o endereço dele é apagado junto, por causa do ON DELETE CASCADE).
-- ============================================================

USE pc_forge;

INSERT INTO CLIENTE (NOME, CPF, EMAIL, CELULAR, NASCIMENTO, SENHA)
SELECT 'Cliente Teste', '123.456.789-09', 'cliente@teste.com', '(11) 99999-0000', '2000-01-01',
       '$2b$10$bK2yK21Q4FUxfRHr6jncB.H.00oURgsM4XgzDRFmauUhHKbC0rF5u'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM CLIENTE
    WHERE EMAIL = 'cliente@teste.com' OR CPF = '123.456.789-09'
);

INSERT INTO ENDERECO (ID_CLIENTE, CEP, RUA, NUMERO, BAIRRO, CIDADE, ESTADO)
SELECT C.ID, '01001-000', 'Praça da Sé', '100', 'Sé', 'São Paulo', 'SP'
FROM CLIENTE C
WHERE C.EMAIL = 'cliente@teste.com'
  AND NOT EXISTS (SELECT 1 FROM ENDERECO E WHERE E.ID_CLIENTE = C.ID);
