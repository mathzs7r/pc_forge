-- ============================================================
-- DUMP — banco pc_forge (schema atualizado + dados de exemplo)
-- ============================================================
-- ⚠️  ATENÇÃO (atualizado): este dump é ANTIGO. Reflete apenas o
--     schema.sql + migrações 001 a 004 + seed.sql. NÃO tem:
--       AVALIACAO (006), LOJA.LOGO* (007), ACESSO_LOG (008),
--       catalogo completo 005, PRODUTO.IMAGEM_URL (009).
--
--     Como usar Corretamente:
--       1. Importe este dump (cria banco + dados antigos), OU rode "npm run migrate:seed".
--       2. RODE "npm run migrate" dentro de backend/ — o migration.js aplica
--          as migrações 005 a 009 e deixa o banco NO ESTADO ATUAL.
--     Recomendado de verdade (banco 100% gerado pelo MySQL):
--       npm run migrate:seed   →  mysqldump -u root -p --databases pc_forge > pc_forge_dump.sql
-- Os produtos de exemplo vêm SEM foto (IMAGEM = NULL): a vitrine mostra o
-- ícone da categoria até a loja adicionar uma foto pelo painel.
--
-- Este arquivo foi atualizado à mão no formato do mysqldump. Se quiser um
-- dump 100% gerado pelo MySQL, rode "npm run migrate:seed" num banco novo e
-- exporte com:  mysqldump -u root -p --databases pc_forge > pc_forge_dump.sql
--
-- Como importar (cria o banco pc_forge do zero com tudo dentro):
--   mysql -u root -p < pc_forge_dump.sql
--
-- Logins de teste já cadastrados nesse dump (senha de ambos: senha123):
--   Loja:    contato@pcforge.com    ("Loja Exemplo PC Forge")
--   Cliente: cliente@teste.com      (ou CPF 123.456.789-09)
--
-- ATENÇÃO: este dump começa cada tabela com DROP TABLE IF EXISTS — importar
-- apaga o que você já tinha cadastrado nas tabelas do pc_forge.
-- ============================================================

CREATE DATABASE IF NOT EXISTS pc_forge
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pc_forge;

/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.14-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: pc_forge
-- ------------------------------------------------------
-- Server version	10.11.14-MariaDB-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `CARRINHO_ITEM`
--

DROP TABLE IF EXISTS `CARRINHO_ITEM`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `CARRINHO_ITEM` (
  `ID_CLIENTE` int(11) NOT NULL,
  `ID_PRODUTO` int(11) NOT NULL,
  `QUANTIDADE` int(11) NOT NULL DEFAULT 1,
  `ADICIONADO_EM` timestamp NULL DEFAULT current_timestamp(),
  `ATUALIZADO_EM` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`ID_CLIENTE`,`ID_PRODUTO`),
  KEY `fk_carrinho_produto` (`ID_PRODUTO`),
  CONSTRAINT `fk_carrinho_cliente` FOREIGN KEY (`ID_CLIENTE`) REFERENCES `CLIENTE` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `fk_carrinho_produto` FOREIGN KEY (`ID_PRODUTO`) REFERENCES `PRODUTO` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CARRINHO_ITEM`
--

LOCK TABLES `CARRINHO_ITEM` WRITE;
/*!40000 ALTER TABLE `CARRINHO_ITEM` DISABLE KEYS */;
/*!40000 ALTER TABLE `CARRINHO_ITEM` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CLIENTE`
--

DROP TABLE IF EXISTS `CLIENTE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `CLIENTE` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `NOME` varchar(150) NOT NULL,
  `CPF` varchar(14) NOT NULL,
  `EMAIL` varchar(150) NOT NULL,
  `CELULAR` varchar(15) NOT NULL,
  `NASCIMENTO` date NOT NULL,
  `SENHA` varchar(255) NOT NULL,
  `CRIADO_EM` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`ID`),
  UNIQUE KEY `CPF` (`CPF`),
  UNIQUE KEY `EMAIL` (`EMAIL`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CLIENTE`
--

LOCK TABLES `CLIENTE` WRITE;
/*!40000 ALTER TABLE `CLIENTE` DISABLE KEYS */;
INSERT INTO `CLIENTE` VALUES
(1,'Cliente Teste','123.456.789-09','cliente@teste.com','(11) 99999-0000','2000-01-01','$2b$10$bK2yK21Q4FUxfRHr6jncB.H.00oURgsM4XgzDRFmauUhHKbC0rF5u','2026-09-29 12:40:36');
/*!40000 ALTER TABLE `CLIENTE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `COMPRA`
--

DROP TABLE IF EXISTS `COMPRA`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `COMPRA` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `ID_CLIENTE` int(11) NOT NULL,
  `ID_ENDERECO` int(11) NOT NULL,
  `DATA` datetime NOT NULL DEFAULT current_timestamp(),
  `FORMA_PAGAMENTO` varchar(50) NOT NULL,
  `VALOR_INICIAL` decimal(10,2) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `fk_compra_cliente` (`ID_CLIENTE`),
  KEY `fk_compra_endereco` (`ID_ENDERECO`),
  CONSTRAINT `fk_compra_cliente` FOREIGN KEY (`ID_CLIENTE`) REFERENCES `CLIENTE` (`ID`),
  CONSTRAINT `fk_compra_endereco` FOREIGN KEY (`ID_ENDERECO`) REFERENCES `ENDERECO` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `COMPRA`
--

LOCK TABLES `COMPRA` WRITE;
/*!40000 ALTER TABLE `COMPRA` DISABLE KEYS */;
/*!40000 ALTER TABLE `COMPRA` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ENDERECO`
--

DROP TABLE IF EXISTS `ENDERECO`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ENDERECO` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `ID_CLIENTE` int(11) NOT NULL,
  `CEP` varchar(9) NOT NULL,
  `RUA` varchar(150) NOT NULL,
  `NUMERO` varchar(10) NOT NULL,
  `BAIRRO` varchar(100) NOT NULL,
  `CIDADE` varchar(100) NOT NULL,
  `ESTADO` char(2) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `fk_endereco_cliente` (`ID_CLIENTE`),
  CONSTRAINT `fk_endereco_cliente` FOREIGN KEY (`ID_CLIENTE`) REFERENCES `CLIENTE` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ENDERECO`
--

LOCK TABLES `ENDERECO` WRITE;
/*!40000 ALTER TABLE `ENDERECO` DISABLE KEYS */;
INSERT INTO `ENDERECO` VALUES
(1,1,'01001-000','Praça da Sé','100','Sé','São Paulo','SP');
/*!40000 ALTER TABLE `ENDERECO` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `LOJA`
--

DROP TABLE IF EXISTS `LOJA`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `LOJA` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `NOME` varchar(150) NOT NULL,
  `CNPJ` varchar(18) NOT NULL,
  `ENDERECO` varchar(200) NOT NULL,
  `CELULAR` varchar(15) NOT NULL,
  `EMAIL` varchar(150) NOT NULL,
  `SENHA` varchar(255) NOT NULL,
  `CRIADO_EM` timestamp NULL DEFAULT current_timestamp(),
  `DESCRICAO` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `CNPJ` (`CNPJ`),
  UNIQUE KEY `EMAIL` (`EMAIL`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LOJA`
--

LOCK TABLES `LOJA` WRITE;
/*!40000 ALTER TABLE `LOJA` DISABLE KEYS */;
INSERT INTO `LOJA` VALUES
(1,'Loja Exemplo PC Forge','00.000.000/0001-00','Av. Tecnologia, 100 - São Paulo - SP','11999990000','contato@pcforge.com','$2b$10$bK2yK21Q4FUxfRHr6jncB.H.00oURgsM4XgzDRFmauUhHKbC0rF5u','2026-09-29 12:40:36',NULL);
/*!40000 ALTER TABLE `LOJA` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `POSSUI`
--

DROP TABLE IF EXISTS `POSSUI`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `POSSUI` (
  `ID_COMPRA` int(11) NOT NULL,
  `ID_PRODUTO` int(11) NOT NULL,
  `VALOR_UNITARIO` decimal(10,2) NOT NULL,
  `QUANTIDADE` int(11) NOT NULL,
  PRIMARY KEY (`ID_COMPRA`,`ID_PRODUTO`),
  KEY `fk_possui_produto` (`ID_PRODUTO`),
  CONSTRAINT `fk_possui_compra` FOREIGN KEY (`ID_COMPRA`) REFERENCES `COMPRA` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `fk_possui_produto` FOREIGN KEY (`ID_PRODUTO`) REFERENCES `PRODUTO` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `POSSUI`
--

LOCK TABLES `POSSUI` WRITE;
/*!40000 ALTER TABLE `POSSUI` DISABLE KEYS */;
/*!40000 ALTER TABLE `POSSUI` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PRODUTO`
--

DROP TABLE IF EXISTS `PRODUTO`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `PRODUTO` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `ID_LOJA` int(11) NOT NULL,
  `NOME` varchar(150) NOT NULL,
  `DESCRICAO` varchar(255) NOT NULL,
  `CATEGORIA` varchar(80) NOT NULL,
  `PRECO` decimal(10,2) NOT NULL,
  `CAMINHO_IMG` varchar(255) NOT NULL,
  `QUANTIDADE_IMG` int(11) DEFAULT 1,
  `ATIVO` tinyint(1) NOT NULL DEFAULT 1,
  `CRIADO_EM` timestamp NULL DEFAULT current_timestamp(),
  `ATUALIZADO_EM` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `IMAGEM` mediumblob DEFAULT NULL,
  `IMAGEM_TIPO` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `idx_produto_loja_ativo` (`ID_LOJA`,`ATIVO`),
  CONSTRAINT `fk_produto_loja` FOREIGN KEY (`ID_LOJA`) REFERENCES `LOJA` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PRODUTO`
--

LOCK TABLES `PRODUTO` WRITE;
/*!40000 ALTER TABLE `PRODUTO` DISABLE KEYS */;
INSERT INTO `PRODUTO` VALUES
(1,1,'Intel Core i5-14400F','Processador 10 núcleos, até 4.7 GHz, socket LGA 1700.','Processadores',1299.90,'placeholder.jpg',1,1,'2026-09-29 12:40:36','2026-09-29 12:40:36',NULL,NULL),
(2,1,'AMD Ryzen 5 7600','Processador 6 núcleos / 12 threads, até 5.1 GHz, AM5.','Processadores',1499.90,'placeholder.jpg',1,1,'2026-09-29 12:40:36','2026-09-29 12:40:36',NULL,NULL),
(3,1,'RTX 4060 8GB GDDR6','Placa de vídeo NVIDIA Ada Lovelace, DLSS 3, 115W.','Placas de Vídeo',1899.90,'placeholder.jpg',1,1,'2026-09-29 12:40:36','2026-09-29 12:40:36',NULL,NULL),
(4,1,'RX 7600 8GB','Placa de vídeo AMD RDNA 3, 8GB GDDR6, ótimo custo-benefício.','Placas de Vídeo',1699.90,'placeholder.jpg',1,1,'2026-09-29 12:40:36','2026-09-29 12:40:36',NULL,NULL),
(5,1,'Memória RAM 16GB DDR5 5600MHz','Kit 1x16GB DDR5, latência CL36, ideal para Ryzen 7000 / Intel 14ª gen.','Memória RAM',449.90,'placeholder.jpg',1,1,'2026-09-29 12:40:36','2026-09-29 12:40:36',NULL,NULL),
(6,1,'SSD NVMe 1TB Gen4','SSD M.2 NVMe PCIe 4.0, até 7000 MB/s leitura.','Armazenamento',399.90,'placeholder.jpg',1,1,'2026-09-29 12:40:36','2026-09-29 12:40:36',NULL,NULL),
(7,1,'Placa-mãe B650M WiFi','Chipset AMD B650, Wi-Fi 6, DDR5, PCIe 4.0.','Placas-mãe',899.90,'placeholder.jpg',1,1,'2026-09-29 12:40:36','2026-09-29 12:40:36',NULL,NULL),
(8,1,'Fonte 650W 80 Plus Bronze','Fonte modular, PFC ativo, proteção completa.','Fontes',349.90,'placeholder.jpg',1,1,'2026-09-29 12:40:36','2026-09-29 12:40:36',NULL,NULL),
(9,1,'Teclado Mecânico RGB Switch Red','Switch linear red, RGB por tecla, cabo USB-C destacável.','Periféricos',279.90,'placeholder.jpg',1,1,'2026-09-29 12:40:36','2026-09-29 12:40:36',NULL,NULL),
(10,1,'Headset Gamer 7.1 Surround','Som surround virtual 7.1, microfone removível, USB.','Acessórios',199.90,'placeholder.jpg',1,1,'2026-09-29 12:40:36','2026-09-29 12:40:36',NULL,NULL);
/*!40000 ALTER TABLE `PRODUTO` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_MIGRACOES`
--

DROP TABLE IF EXISTS `_MIGRACOES`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `_MIGRACOES` (
  `ARQUIVO` varchar(255) NOT NULL,
  `APLICADA_EM` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`ARQUIVO`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_MIGRACOES`
--

LOCK TABLES `_MIGRACOES` WRITE;
/*!40000 ALTER TABLE `_MIGRACOES` DISABLE KEYS */;
INSERT INTO `_MIGRACOES` VALUES
('001_produto_exclusao_logica.sql','2026-09-29 12:40:36'),
('002_cliente_teste.sql','2026-09-29 12:40:36'),
('003_produto_imagem_blob.sql','2026-09-29 12:40:36'),
('004_carrinho_e_perfil.sql','2026-09-29 12:40:36');
/*!40000 ALTER TABLE `_MIGRACOES` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-30 11:21:36
