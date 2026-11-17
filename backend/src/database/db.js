import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool = null;

try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hidraulica_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
} catch (err) {
  console.warn('⚠️ Pool MySQL não pôde ser instanciado:', err.message);
}

export async function testConnection() {
  if (!pool) return false;
  try {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (err) {
    return false;
  }
}

export default pool;
