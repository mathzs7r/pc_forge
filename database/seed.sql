-- ============================================================
-- DADOS DE EXEMPLO — PC Forge
-- Rode depois do schema.sql
-- Senha da loja e do cliente de exemplo: senha123
--   Loja:    contato@pcforge.com
--   Cliente: cliente@teste.com (ou CPF 123.456.789-09)
-- ============================================================

USE pc_forge;

INSERT INTO LOJA (NOME, CNPJ, ENDERECO, CELULAR, EMAIL, SENHA) VALUES
('Loja Exemplo PC Forge', '00.000.000/0001-00', 'Av. Tecnologia, 100 - São Paulo - SP', '11999990000', 'contato@pcforge.com', '$2b$10$bK2yK21Q4FUxfRHr6jncB.H.00oURgsM4XgzDRFmauUhHKbC0rF5u');

SET @id_loja = LAST_INSERT_ID();

INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG) VALUES
(@id_loja, 'Intel Core i5-14400F', 'Processador 10 núcleos, até 4.7 GHz, socket LGA 1700.', 'Processadores', 1299.90, 'placeholder.jpg', 1),
(@id_loja, 'AMD Ryzen 5 7600', 'Processador 6 núcleos / 12 threads, até 5.1 GHz, AM5.', 'Processadores', 1499.90, 'placeholder.jpg', 1),
(@id_loja, 'RTX 4060 8GB GDDR6', 'Placa de vídeo NVIDIA Ada Lovelace, DLSS 3, 115W.', 'Placas de Vídeo', 1899.90, 'placeholder.jpg', 1),
(@id_loja, 'RX 7600 8GB', 'Placa de vídeo AMD RDNA 3, 8GB GDDR6, ótimo custo-benefício.', 'Placas de Vídeo', 1699.90, 'placeholder.jpg', 1),
(@id_loja, 'Memória RAM 16GB DDR5 5600MHz', 'Kit 1x16GB DDR5, latência CL36, ideal para Ryzen 7000 / Intel 14ª gen.', 'Memória RAM', 449.90, 'placeholder.jpg', 1),
(@id_loja, 'SSD NVMe 1TB Gen4', 'SSD M.2 NVMe PCIe 4.0, até 7000 MB/s leitura.', 'Armazenamento', 399.90, 'placeholder.jpg', 1),
(@id_loja, 'Placa-mãe B650M WiFi', 'Chipset AMD B650, Wi-Fi 6, DDR5, PCIe 4.0.', 'Placas-mãe', 899.90, 'placeholder.jpg', 1),
(@id_loja, 'Fonte 650W 80 Plus Bronze', 'Fonte modular, PFC ativo, proteção completa.', 'Fontes', 349.90, 'placeholder.jpg', 1),
(@id_loja, 'Teclado Mecânico RGB Switch Red', 'Switch linear red, RGB por tecla, cabo USB-C destacável.', 'Periféricos', 279.90, 'placeholder.jpg', 1),
(@id_loja, 'Headset Gamer 7.1 Surround', 'Som surround virtual 7.1, microfone removível, USB.', 'Acessórios', 199.90, 'placeholder.jpg', 1);

-- Cliente de teste (mesma senha da loja: senha123) pra dar pra fazer login
-- sem precisar cadastrar antes. Idempotente: se a migração 002 já criou esse
-- cliente, nada é inserido de novo (não dá erro de CPF/e-mail duplicado).
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
