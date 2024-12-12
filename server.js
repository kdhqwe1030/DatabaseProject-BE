const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: './.env' });

const app = express();
const departmentRoutes = require('./src/routes/department');

app.use(cors());
app.use(express.json());

// 라우트 설정
app.use('/api', departmentRoutes);

// 서버 실행
app.listen(5000, () => {
  console.log(`Server is running on http://localhost:5000`);
});
