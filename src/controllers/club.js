const db = require('../config/database');

// 동아리 정보 조회
const searchClub = (req, res) => {
  const { department_id, department_name, club_name } = req.body;

  // Club, Department, Advisor 테이블 JOIN
  let query = `
    SELECT 
      c.club_id,
      d.department_name,
      c.club_name,
      c.club_location,
      c.founded_date,
      a.advisor_name
    FROM Club c
    LEFT JOIN Department d ON c.Edepartment_id = d.department_id
    LEFT JOIN Advisor a ON c.Eadvisor_id = a.advisor_id
    WHERE 1=1
  `;

  const params = [];

  // 조건 추가
  if (department_id) {
    query += ' AND d.department_id LIKE ?';
    params.push(`%${department_id}%`);
  }
  if (department_name) {
    query += ' AND d.department_name LIKE ?';
    params.push(`%${department_name}%`);
  }
  if (club_name) {
    query += ' AND c.club_name LIKE ?';
    params.push(`%${club_name}%`);
  }

  // 정렬 추가 (동아리 코드 기준)
  query += ' ORDER BY c.club_id';

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
  searchClub,
};
