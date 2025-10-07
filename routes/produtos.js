const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');

router.get('/', produtoController.listarAtivos);
router.get('/inativos', produtoController.listarInativos);
router.post('/', produtoController.criar);
router.put('/:id', produtoController.atualizar);
router.delete('/:id', produtoController.inativar);
router.post('/:id/reativar', produtoController.reativar);

module.exports = router;
