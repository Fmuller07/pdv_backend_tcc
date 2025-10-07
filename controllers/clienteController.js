const Cliente = require('../models/clienteModel');

module.exports = {
  listar(req, res) {
    Cliente.listar((err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  },

  criar(req, res) {
    Cliente.criar(req.body, (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ id: result.insertId, ...req.body });
    });
  },

  atualizar(req, res) {
    Cliente.atualizar(req.params.id, req.body, (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.affectedRows === 0) return res.status(404).json({ error: "Cliente não encontrado" });
      res.json({ id: req.params.id, ...req.body });
    });
  },

  deletar(req, res) {
    Cliente.deletar(req.params.id, (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.affectedRows === 0) return res.status(404).json({ error: "Cliente não encontrado" });
      res.json({ success: true, message: "Cliente excluído com sucesso!" });
    });
  }
};
