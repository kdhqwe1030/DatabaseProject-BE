const express = require('express');
const mysql = require('mysql2');
require('dotenv').config({ path: './.env' });

const app = express();

// MySQL 연결 설정
const db = mysql.createConnection({
  port: process.env.PORT,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: false,
});

// MySQL 연결
db.connect((err) => {
  if (err) {
    console.error('MySQL 연결 실패:', err);
  } else {
    console.log('MySQL에 연결되었습니다.');
  }
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:5000`);
});
