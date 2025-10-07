const express = require('express');
const router = express.Router();
const vendaController = require('../controllers/vendaController');

router.post('/', vendaController.registrar); // cria venda
router.get('/', vendaController.listar); // listar todas
router.get('/:id', vendaController.buscarPorId); // detalhes

module.exports = router;
