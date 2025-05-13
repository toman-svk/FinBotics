const express = require('express');
const router = express.Router();
const controller = require('../controllers/financialAnalysisController');

router.get('/', controller.getAll);
router.post('/', controller.create);
router.delete('/:id', controller.deleteRecord);

module.exports = router;
