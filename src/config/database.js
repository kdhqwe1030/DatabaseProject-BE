const mysql = require('mysql2');
require('dotenv').config({ path: './.env' });

const db = mysql.createConnection({
  port: process.env.PORT,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: false,
});

db.connect((err) => {
  if (err) {
    console.error('MySQL 연결 실패:', err);
  } else {
    console.log('MySQL에 연결되었습니다.');
  }
});

module.exports = db;
