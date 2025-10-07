const db = require('../db');

module.exports = {
  listarClientesComFiado(callback) {
    db.query('SELECT id, nome, fiado FROM clientes', (err, results) => {
      if (err) return callback(err);
      const filtrados = (results || []).filter(c => Number(c.fiado) > 0);
      callback(null, filtrados);
    });
  }
};
