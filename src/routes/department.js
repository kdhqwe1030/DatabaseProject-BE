const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department');

router.post('/departmentSearch', departmentController.searchDepartment);
router.post(
  '/departmentSearch/advisor',
  departmentController.searchDepartmentAdvisor
);

module.exports = router;
