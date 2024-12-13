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

const searchClubMembers = (req, res) => {
  const { club_name } = req.body;

  let query = `
    SELECT 
      s.student_id,
      s.name,
      s.phone_number,
      s.sex,
      d.department_name,
      a.advisor_name
    FROM Student s
    JOIN StudentClubRelationship scr ON s.student_id = scr.Estudent_id
    JOIN Club c ON scr.Eclub_id = c.club_id
    JOIN Department d ON s.Edepartment_id = d.department_id
    LEFT JOIN Advisor a ON s.Eadvisor_id = a.advisor_id
    WHERE 1=1
  `;

  const params = [];

  if (club_name) {
    query += ' AND c.club_name LIKE ?';
    params.push(`%${club_name}%`);
  }

  query += ' ORDER BY s.student_id';

  console.log('Executing query:', query);
  console.log('Parameters:', params);

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({
        error: 'Database query failed',
        details: err.message,
      });
      return;
    }
    res.json(results);
  });
};

const searchClubAdvisor = (req, res) => {
  const { club_name } = req.body;

  let query = `
    SELECT DISTINCT
      a.advisor_id,
      d.department_name,
      a.advisor_name, 
      a.phone_number,
      a.lab_location,
      a.study_field,
      c.club_name
    FROM Advisor a
    JOIN Club c ON c.Eadvisor_id = a.advisor_id  
    JOIN Department d ON a.Edepartment_id = d.department_id
    WHERE 1=1
  `;

  const params = [];

  if (club_name) {
    query += ' AND c.club_name LIKE ?';
    params.push(`%${club_name}%`);
  }

  query += ' ORDER BY a.advisor_id';

  console.log('Executing query:', query);
  console.log('Parameters:', params);

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({
        error: 'Database query failed',
        details: err.message,
      });
      return;
    }
    res.json(results);
  });
};

const modifyClub = (req, res) => {
  const {
    club_id,
    department_name,
    club_name,
    club_location,
    founded_date,
    advisor_name,
  } = req.body;
  const formattedDate = new Date(founded_date).toISOString().split('T')[0];

  // 1. department_name으로 department_id 조회
  const getDepartmentId = `
    SELECT department_id 
    FROM Department 
    WHERE department_name = ?`;

  // 2. advisor_name으로 advisor_id 조회
  const getAdvisorId = `
    SELECT advisor_id 
    FROM Advisor 
    WHERE advisor_name = ?`;

  // 3. Club 테이블 업데이트 쿼리
  const updateClub = `
    UPDATE Club 
    SET 
      club_name = ?,
      club_location = ?,
      founded_date = ?,
      Edepartment_id = ?,
      Eadvisor_id = ?
    WHERE club_id = ?`;

  db.beginTransaction((err) => {
    if (err) {
      console.error('Transaction error:', err);
      return res.status(500).json({ error: 'Transaction error' });
    }

    // department_id 조회
    db.query(getDepartmentId, [department_name], (err, deptResults) => {
      if (err || !deptResults.length) {
        return db.rollback(() => {
          res.status(400).json({ error: 'Invalid department name' });
        });
      }

      const department_id = deptResults[0].department_id;

      // advisor_id 조회
      db.query(getAdvisorId, [advisor_name], (err, advisorResults) => {
        if (err || !advisorResults.length) {
          return db.rollback(() => {
            res.status(400).json({ error: 'Invalid advisor name' });
          });
        }

        const advisor_id = advisorResults[0].advisor_id;

        // Club 테이블 업데이트
        db.query(
          updateClub,
          [
            club_name,
            club_location,
            formattedDate,
            department_id,
            advisor_id,
            club_id,
          ],
          (err, updateResult) => {
            if (err) {
              return db.rollback(() => {
                console.error('Update error:', err);
                res.status(500).json({ error: 'Update failed' });
              });
            }

            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({ error: 'Commit failed' });
                });
              }

              // 업데이트 후 최신 데이터 조회하여 반환
              const query = `
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
                ORDER BY c.club_id`;

              db.query(query, (err, results) => {
                if (err) {
                  console.error('Error fetching updated data:', err);
                  res
                    .status(500)
                    .json({ error: 'Error fetching updated data' });
                  return;
                }
                res.json(results);
              });
            });
          }
        );
      });
    });
  });
};

const deleteClub = (req, res) => {
  const { club_id } = req.body;

  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: 'Transaction failed' });
    }

    // 1. 먼저 ClubFinance 삭제
    db.query('DELETE FROM ClubFinance WHERE Eclub_id = ?', [club_id], (err) => {
      if (err) {
        return db.rollback(() => {
          console.error('Error deleting finances:', err);
          res.status(500).json({ error: 'Delete finances failed' });
        });
      }

      // 2. 그 다음 ClubActivity 삭제
      db.query(
        'DELETE FROM ClubActivity WHERE Eclub_id = ?',
        [club_id],
        (err) => {
          if (err) {
            return db.rollback(() => {
              console.error('Error deleting activities:', err);
              res.status(500).json({ error: 'Delete activities failed' });
            });
          }

          // 3. StudentClubRelationship 삭제
          db.query(
            'DELETE FROM StudentClubRelationship WHERE Eclub_id = ?',
            [club_id],
            (err) => {
              if (err) {
                return db.rollback(() => {
                  console.error('Error deleting relationships:', err);
                  res
                    .status(500)
                    .json({ error: 'Delete relationships failed' });
                });
              }

              // 4. 마지막으로 Club 삭제
              db.query(
                'DELETE FROM Club WHERE club_id = ?',
                [club_id],
                (err, result) => {
                  if (err) {
                    return db.rollback(() => {
                      console.error('Error deleting club:', err);
                      res.status(500).json({ error: 'Delete club failed' });
                    });
                  }

                  // 5. 삭제 완료 후 남은 클럽 목록 조회
                  const query = `
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
              ORDER BY c.club_id
            `;

                  db.query(query, (err, results) => {
                    if (err) {
                      return db.rollback(() => {
                        console.error('Error fetching updated list:', err);
                        res
                          .status(500)
                          .json({ error: 'Error fetching updated list' });
                      });
                    }

                    db.commit((err) => {
                      if (err) {
                        return db.rollback(() => {
                          res.status(500).json({ error: 'Commit failed' });
                        });
                      }
                      res.json(results);
                    });
                  });
                }
              );
            }
          );
        }
      );
    });
  });
};
module.exports = {
  searchClub,
  searchClubMembers,
  searchClubAdvisor,
  modifyClub,
  deleteClub,
};
