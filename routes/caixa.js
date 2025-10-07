const express = require('express');
const router = express.Router();
const caixaController = require('../controllers/caixaController');

router.post('/abrir', caixaController.abrir);
router.post('/fechar', caixaController.fechar);
router.get('/status', caixaController.status);

// rotas mais específicas (também mantidas via server.js)
router.get('/relatorios', caixaController.listarRelatorios);
router.get('/relatorios/:id', caixaController.detalharRelatorio);
router.get('/relatorios/:id/vendas', caixaController.listarVendasDeFechamento);

module.exports = router;
