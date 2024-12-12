const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config({ path: './.env' });

const app = express();

app.use(cors());
app.use(express.json());

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
// 학과 정보 조회 API
app.post('/api/departmentSearch', (req, res) => {
  const { department_id, department_name } = req.body;

  // 기본 SQL 쿼리
  let query = 'SELECT * FROM Department WHERE 1=1';
  const params = [];

  // 조건 추가
  if (department_id) {
    query += ' AND department_id LIKE ?';
    params.push(`%${department_id}%`);
  }
  if (department_name) {
    query += ' AND department_name LIKE ?';
    params.push(`%${department_name}%`);
  }

  // 쿼리 실행
  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Error executing query');
      return;
    }
    res.json(results);
  });
});
// 서버 실행
app.listen(5000, () => {
  console.log(`Server is running on http://localhost:5000`);
});
