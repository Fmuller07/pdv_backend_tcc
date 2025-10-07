const express = require('express');
const router = express.Router();
const fiadoController = require('../controllers/fiadoController');

router.get('/', fiadoController.listar);

module.exports = router;
