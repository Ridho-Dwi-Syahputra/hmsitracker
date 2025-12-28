// config/db.js
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'hmsi_tracker',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('📍 DB_HOST:', process.env.DB_HOST);
    console.error('📍 DB_USER:', process.env.DB_USER);
    console.error('📍 DB_NAME:', process.env.DB_NAME);
    console.error('📍 DB_PORT:', process.env.DB_PORT);
  } else {
    console.log('✅ Database connected successfully');
    connection.release();
  }
});

// promise wrapper biar bisa pakai async/await
const db = pool.promise();

module.exports = db;
