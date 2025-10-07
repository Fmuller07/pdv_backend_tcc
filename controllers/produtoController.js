const Produto = require('../models/produtoModel');

module.exports = {
  listarAtivos(req, res) {
    Produto.listarAtivos((err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  },

  listarInativos(req, res) {
    Produto.listarInativos((err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  },

  criar(req, res) {
    Produto.criar(req.body, (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ id: result.insertId, ...req.body, ativo: 1 });
    });
  },

  atualizar(req, res) {
    Produto.atualizar(req.params.id, req.body, (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.affectedRows === 0) return res.status(404).json({ error: "Produto não encontrado" });
      res.json({ id: req.params.id, ...req.body });
    });
  },

  inativar(req, res) {
    Produto.inativar(req.params.id, (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.affectedRows === 0) return res.status(404).json({ error: "Produto não encontrado" });
      res.json({ success: true, message: "Produto inativado com sucesso!" });
    });
  },

  reativar(req, res) {
    Produto.reativar(req.params.id, (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.affectedRows === 0) return res.status(404).json({ error: "Produto não encontrado" });
      res.json({ success: true, message: "Produto reativado!" });
    });
  }
};
