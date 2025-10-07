const Fiado = require('../models/fiadoModel');

module.exports = {
  listar(req, res) {
    Fiado.listarClientesComFiado((err, clientes) => {
      if (err) return res.status(500).json({ error: err });
      res.json(clientes);
    });
  }
};
