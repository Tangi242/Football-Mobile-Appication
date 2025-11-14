import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: process.env.ENV_FILE || '.env' });

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '12345',
  database: process.env.DB_NAME || 'football',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.on('error', (error) => {
    console.error('MySQL Pool Error:', error.message);
});

export const query = async (sql, params = []) => {
    const [rows] = await pool.execute(sql, params);
    return rows;
};

export default pool;

