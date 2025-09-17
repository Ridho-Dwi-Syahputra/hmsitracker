// config/db.js
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'hmsi_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// promise wrapper biar bisa pakai async/await
const db = pool.promise();

module.exports = db;
