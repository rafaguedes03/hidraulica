// Conexão com o MySQL. Os dados de acesso vêm do arquivo .env (veja .env.example).
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// "pool" = um conjunto de conexões reaproveitadas entre as requisições.
const banco = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hidraulica_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 3000
});

/** Devolve true se o MySQL estiver respondendo. */
export async function testarConexao() {
  try {
    const conexao = await banco.getConnection();
    conexao.release();
    return true;
  } catch {
    return false;
  }
}

/** Erros que significam "o MySQL não está disponível", e não um problema na consulta. */
export function ehErroDeConexao(erro) {
  const codigos = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'EHOSTUNREACH', 'PROTOCOL_CONNECTION_LOST',
    'ER_ACCESS_DENIED_ERROR', 'ER_BAD_DB_ERROR', 'ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR'];
  return !!erro && (codigos.includes(erro.code) || erro.fatal === true);
}

export default banco;
