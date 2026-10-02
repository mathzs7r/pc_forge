const path = require('path');
// Carrega SEMPRE o backend/.env, não importa de qual pasta você rodou o node.
// (dotenv sozinho procura o .env na pasta atual do terminal — se você rodava
// "node backend/server.js" da raiz do projeto, ele não achava e todas as
// variáveis DB_* ficavam vazias.)
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');

// Pool de conexões: reaproveita conexões em vez de abrir uma nova a cada request.
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pc_forge',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// Usado na inicialização do servidor e na rota /saude: confere se o banco
// responde e se as tabelas principais existem.
pool.testarConexao = async function testarConexao() {
  const tabelasNecessarias = ['CLIENTE', 'ENDERECO', 'LOJA', 'PRODUTO'];
  const [linhas] = await pool.query('SHOW TABLES');
  const existentes = linhas.map((l) => String(Object.values(l)[0]).toUpperCase());
  const faltando = tabelasNecessarias.filter((t) => !existentes.includes(t));
  return { banco: process.env.DB_NAME || 'pc_forge', tabelas: existentes, faltando };
};

module.exports = pool;
