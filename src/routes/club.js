const express = require('express');
const router = express.Router();
const clubController = require('../controllers/club');

// 동아리 검색 API 라우트
router.post('/clubSearch', clubController.searchClub);

module.exports = router;
