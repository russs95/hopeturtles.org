/**
 * config/db.js
 * Hope Turtle Database Connection
 * --------------------------------
 * Provides a shared MySQL connection pool using mysql2.
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const db = await mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Verify connection on startup
try {
  const [rows] = await db.query('SELECT NOW() AS connected_at');
  console.log(`✅ MySQL connected successfully at ${rows[0].connected_at}`);
} catch (err) {
  console.error('❌ MySQL connection failed:', err.message);
  process.exit(1);
}
