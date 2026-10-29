-- ============================================================
-- MIGRAÇÃO 016 — PREÇOS REAIS DE MERCADO (BRL)
--
-- O catálogo tinha preços aleatórios (RTX 4090 por R$ 2.600,
-- pendrive 128GB por R$ 845...). Aqui cada peça recebe o preço
-- aproximado de mercado brasileiro, casando pelo comecinho do
-- nome (PREFIXO). O casamento pega o prefixo mais LONGO primeiro,
-- então "AMD Ryzen 5 7600X" nunca herda o preço do "7600".
--
-- Duplicados "Ed. N" / "— Edição Max" herdam o preço da peça-base
-- com variação determinística de -4% a +4% derivada do ID (1% por
-- dígito), pra não parecer tabela clonada.
--
-- Idempotente: pode reaplicar sem estragar (sempre reposiciona
-- pro mesmo preço, pois a variação depende só do ID).
-- ============================================================

USE pc_forge;

DROP TEMPORARY TABLE IF EXISTS PRECOS_BASE;
CREATE TEMPORARY TABLE PRECOS_BASE (
    PREFIXO VARCHAR(120) NOT NULL PRIMARY KEY,
    PRECO   DECIMAL(10,2) NOT NULL
);

-- ---------- Processadores (bruta e núcleos) ----------
INSERT INTO PRECOS_BASE (PREFIXO, PRECO) VALUES
('Intel Core i3-12100F', 649),
('Intel Core i5-12400F', 899),
('Intel Core i5-13400F', 1099),
('Intel Core i5-14400F', 1199),
('Intel Core i5-14600K', 2099),
('Intel Core i7-12700F', 1499),
('Intel Core i7-13700K', 2299),
('Intel Core i7-14700K', 2599),
('Intel Core i9-12900K', 2399),
('Intel Core i9-13900K', 3299),
('Intel Core i9-14900K', 3499),
('Intel Core Ultra 5', 1999),
('Intel Core Ultra 7', 2699),
('AMD Ryzen 3', 499),
('AMD Ryzen 5 5500', 649),
('AMD Ryzen 5 5600X', 999),
('AMD Ryzen 5 5600', 799),
('AMD Ryzen 5 7600X', 1299),
('AMD Ryzen 5 7600', 1099),
('AMD Ryzen 7 5700X', 1099),
('AMD Ryzen 7 5800X3D', 1699),
('AMD Ryzen 7 5800X', 1199),
('AMD Ryzen 7 7700X', 1799),
('AMD Ryzen 7 7700', 1599),
('AMD Ryzen 9 5900X', 1699),
('AMD Ryzen 9 7900X', 2399),
('AMD Ryzen 9 7950X', 2899);

-- ---------- Placas de vídeo ----------
INSERT INTO PRECOS_BASE (PREFIXO, PRECO) VALUES
('GTX 1650', 899),
('RTX 3050', 1099),
('RTX 3060 12GB', 1399),
('RTX 3080 10GB', 3999),
('RTX 4050 Laptop', 1199),
('RTX 4060 Ti 16GB', 2999),
('RTX 4060 Ti 8GB', 2399),
('RTX 4060 8GB GDDR6', 1899),
('RTX 4060 8GB', 1899),
('RTX 4070 Ti Super', 4799),
('RTX 4070 Ti', 4499),
('RTX 4070 Super', 3999),
('RTX 4070', 2999),
('RTX 4080', 7499),
('RTX 4090', 12999),
('RX 6500 XT', 799),
('RX 6600 8GB', 1049),
('RX 6700 XT', 1899),
('RX 6800', 2499),
('RX 7600 XT', 2099),
('RX 7600 8GB', 1699),
('RX 7700 XT', 2499),
('RX 7800 XT', 2999),
('RX 7900 XTX', 5499),
('RX 7900 XT', 4499),
('Arc A770', 1999),
('Arc A750', 1299);

-- ---------- Placas-mãe ----------
INSERT INTO PRECOS_BASE (PREFIXO, PRECO) VALUES
('A520M', 449),
('B450M', 549),
('B550M Gaming', 699),
('Gaming Plus B550', 899),
('MAG B550 Tomahawk', 999),
('Placa-mãe B550 Tomahawk', 999),
('ROG Strix B550-F', 1199),
('X570S', 1399),
('B650 Aorus', 1299),
('B650M WiFi', 999),
('Placa-mãe B650M WiFi', 999),
('B660M', 999),
('Placa-mãe B660M WiFi', 999),
('B760M WiFi', 1199),
('Prime B760M', 1199),
('H610M', 599),
('Placa-mãe H610M DDR4', 599),
('MPG Z790 Edge', 1999),
('ProArt X670E', 2499),
('Steel Legend B650', 1299),
('TUF Gaming B650', 1399),
('X670E Gaming', 1999),
('Z690', 1299),
('Z790 DDR5', 1799);

-- ---------- Memória RAM ----------
INSERT INTO PRECOS_BASE (PREFIXO, PRECO) VALUES
('8GB DDR4 2666MHz', 169),
('8GB DDR4 3200MHz', 189),
('Memória 8GB DDR4 3200MHz', 189),
('16GB DDR4 2666MHz', 249),
('16GB DDR4 3200MHz', 279),
('16GB DDR4 3600MHz', 299),
('32GB DDR4 3200MHz', 499),
('32GB DDR4 3600MHz', 549),
('64GB DDR4 3200MHz', 999),
('8GB DDR5 4800MHz', 229),
('16GB DDR5 5200MHz', 329),
('Memória 16GB DDR5 5200MHz', 329),
('Memória RAM 16GB DDR5 5600MHz', 349),
('16GB DDR5 5600MHz', 349),
('16GB DDR5 6000MHz CL30', 449),
('32GB DDR5 5600MHz', 649),
('32GB DDR5 6000MHz', 699),
('32GB DDR5 6400MHz', 849),
('48GB DDR5 5600MHz', 799),
('64GB DDR5 5600MHz', 1099),
('2x8GB DDR4 3200 RGB', 379),
('2x16GB DDR4 3600 RGB', 599),
('2x16GB DDR5 6000 RGB', 799),
('Kit 16GB (2x8) DDR4 3600MHz', 299),
('Kit 32GB (2x16) DDR5 6000MHz', 799);

-- ---------- Armazenamento ----------
INSERT INTO PRECOS_BASE (PREFIXO, PRECO) VALUES
('SSD SATA 240GB', 179),
('SSD SATA 480GB', 219),
('SSD SATA 1TB', 349),
('SSD NVMe 250GB', 199),
('SSD NVMe 500GB Gen3', 259),
('SSD NVMe 500GB Gen4', 299),
('SSD NVMe 1TB Gen3', 399),
('SSD NVMe 1TB Gen4', 449),
('SSD NVMe 2TB Gen4', 799),
('SSD NVMe 2TB Gen5', 1099),
('SSD NVMe 4TB Gen4', 1399),
('HD 1TB 7200RPM', 289),
('HD 2TB 7200RPM', 399),
('HD 4TB', 599),
('HD Externo 5TB', 699),
('SSD Externo 1TB USB-C', 499),
('SSD Portátil 2TB', 599),
('Pendrive 128GB USB 3.2', 79),
('Cartão MicroSD 128GB', 89),
('Cartão MicroSD 256GB', 149);

-- ---------- Fontes ----------
INSERT INTO PRECOS_BASE (PREFIXO, PRECO) VALUES
('Fonte 450W 80 Plus Bronze', 279),
('Fonte 450W 80 Plus', 249),
('Fonte 450W PFC Ativo', 199),
('Fonte 500W 80 Plus Bronze', 299),
('Fonte 500W White', 249),
('Fonte 550W Full Modular', 449),
('Fonte 550W 80 Plus Bronze', 329),
('Fonte 600W 80 Plus White', 279),
('Fonte 600W Bronze', 349),
('Fonte 650W 80 Plus Bronze', 379),
('Fonte 650W 80 Plus Gold', 549),
('Fonte 650W Semi Modular', 449),
('Fonte 700W Gold', 499),
('Fonte 750W 80 Plus Gold', 599),
('Fonte 750W Modular Gold', 599),
('Fonte 800W Gold Modular', 649),
('Fonte 850W Modular Platinum', 899),
('Fonte 850W 80 Plus Gold', 699),
('Fonte 900W Platinum', 999),
('Fonte 1000W 80 Plus Gold', 999),
('Fonte 1050W Titanium', 1299),
('Fonte 1200W 80 Plus Platinum', 1499);

-- ---------- Gabinetes ----------
INSERT INTO PRECOS_BASE (PREFIXO, PRECO) VALUES
('Gabinete Full Tower E-ATX até 400mm', 699),
('Gabinete Full Tower ATX até 380mm', 549),
('Gabinete Full Tower', 499),
('Gabinete mATX com 2 fans', 249),
('Gabinete Mid Tower ATX até 300mm', 299),
('Gabinete Mid Tower ATX até 330mm Gaming', 349),
('Gabinete Mid Tower ATX Mesh até 320mm', 329),
('Gabinete Mid Tower ATX Mesh até 340mm Branco', 359),
('Gabinete Mid Tower ATX RGB até 330mm', 379),
('Gabinete Mid Tower ATX Silent até 310mm', 449),
('Gabinete Mid Tower RGB', 349),
('Gabinete Mini Tower mATX até 280mm', 199),
('Gabinete Mini Tower mATX Mesh até 290mm', 229);

-- o casamento pega o prefixo mais LONGO: "…até 330mm Gaming" nunca
-- herda o preço de "…até 300mm".

-- ---------- Monitores ----------
INSERT INTO PRECOS_BASE (PREFIXO, PRECO) VALUES
('Monitor 24" 75Hz IPS', 649),
('Monitor 27" 144Hz', 999),
('Monitor 32" 165Hz Curvo', 1399);

-- ---------- Periféricos ----------
INSERT INTO PRECOS_BASE (PREFIXO, PRECO) VALUES
('Caixa de Som 2.1', 249),
('Combo Teclado + Mouse', 199),
('Controle PS5 DualSense', 449),
('Controle Xbox Series', 429),
('Headset Gamer 7.1 Surround', 199),
('Headset 7.1 Surround', 199),
('Headset 7.1 USB', 149),
('Headset com Cancelamento', 299),
('Headset Drivers 50mm', 229),
('Headset Wireless', 249),
('Microfone USB Cardioide', 399),
('Microfone USB Condensador', 349),
('Mouse Ergonômico Vertical', 299),
('Mouse Gamer 16000 DPI', 249),
('Mouse Gamer 8000 DPI', 129),
('Mouse Gamer Wireless', 349),
('Mouse Sem Fio 16000 DPI', 249),
('Mousepad Grande RGB', 79),
('Mousepad XXL', 99),
('Teclado 60% RGB', 299),
('Teclado Mecânico Blue Switch', 249),
('Teclado Mecânico Red Switch', 229),
('Teclado Mecânico RGB Switch Red', 209),
('Teclado Mecânico RGB Red', 219),
('Teclado Mecânico TKL Brown', 359),
('Teclado Membrana RGB', 89),
('Teclado Numpad', 199),
('Webcam 4K', 299),
('Webcam Full HD 1080p', 149);

-- ---------- Acessórios / Refrigeração ----------
INSERT INTO PRECOS_BASE (PREFIXO, PRECO) VALUES
('Adaptador USB-C Hub', 119),
('Base Notebook Cooler', 149),
('Cabo DisplayPort 2m', 49),
('Cabo HDMI 2.1 2m', 59),
('Cabo SATA 3.0', 19),
('Controladora RGB', 99),
('Cooler Box Intel', 99),
('Cooler CPU Torre Dual Fan', 129),
('Extensor PCIe Riser', 89),
('Filtro de Linha 6 tomadas', 39),
('Hub USB 3.0 4 portas', 79),
('Kit 3 Fans 120mm', 99),
('Kit Limpeza PC', 49),
('LED RGB Fita 5m', 59),
('Organizador de Cabos', 39),
('Pasta Térmica 4g', 29),
('Suporte Monitor Articulado', 199),
('Ventoinha 120mm RGB', 39),
('Cooler a Ar 120mm', 99),
('Water Cooler 240mm', 429),
('Water Cooler 360mm', 599);

-- ---------- ATUALIZAÇÃO ----------
-- Pega o prefixo mais longo que casa com o começo do nome; aplica a
-- variação de ID (-4% a +4%) e arredonda pro centavo.
UPDATE PRODUTO P
SET P.PRECO = ROUND(
        (SELECT B.PRECO * (1 + ((P.ID % 9) - 4) / 100.0)
         FROM PRECOS_BASE B
         WHERE P.NOME LIKE CONCAT(B.PREFIXO, '%')
         ORDER BY LENGTH(B.PREFIXO) DESC
         LIMIT 1), 2)
WHERE EXISTS (
    SELECT 1 FROM PRECOS_BASE B2 WHERE P.NOME LIKE CONCAT(B2.PREFIXO, '%')
);

-- ---------- Serviços: montagem R$ 0,10 + frete GRÁTIS ----------
UPDATE PRODUTO SET PRECO = 0.10,
    DESCRICAO = 'Montagem do seu PC na bancada da loja: cabeamento organizado, teste de estabilidade, drivers atualizados e sistema instalado. Você só tira da caixa e liga na tomada.'
WHERE NOME = 'Serviço de Montagem';

UPDATE PRODUTO SET PRECO = 0.00,
    DESCRICAO = 'Envio do computador já montado, testado e embalado em caixa reforçada. Por nossa conta: frete grátis pra toda entrega de PC montado.'
WHERE NOME = 'Frete do PC Montado';

DROP TEMPORARY TABLE PRECOS_BASE;
