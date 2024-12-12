const db = require('../config/database');

// 학과 정보 조회
const searchDepartment = (req, res) => {
  const { department_id, department_name } = req.body;
  let query = 'SELECT * FROM Department WHERE 1=1';
  const params = [];

  if (department_id) {
    query += ' AND department_id LIKE ?';
    params.push(`%${department_id}%`);
  }
  if (department_name) {
    query += ' AND department_name LIKE ?';
    params.push(`%${department_name}%`);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('Error executing query');
      return;
    }
    res.json(results);
  });
};

// 학과별 지도교수 조회
const searchDepartmentAdvisor = (req, res) => {
  const { department_id, department_name } = req.body;
  let query = `
    SELECT 
      a.advisor_id,
      d.department_name,
      a.advisor_name,
      a.phone_number,
      a.lab_location,
      a.study_field
    FROM Advisor a
    JOIN Department d ON a.Edepartment_id = d.department_id
    WHERE 1=1
  `;
  const params = [];

  if (department_id) {
    query += ' AND d.department_id LIKE ?';
    params.push(`%${department_id}%`);
  }
  if (department_name) {
    query += ' AND d.department_name LIKE ?';
    params.push(`%${department_name}%`);
  }

  query += ' ORDER BY a.advisor_id';

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Error executing query' });
      return;
    }
    res.json(results);
  });
};

module.exports = {
  searchDepartment,
  searchDepartmentAdvisor,
};
