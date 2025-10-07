const db = require('../db');

module.exports = {
  listar(callback) {
    db.query("SELECT * FROM clientes", callback);
  },

  criar(cliente, callback) {
    const { nome, email, telefone, endereco } = cliente;
    db.query(
      "INSERT INTO clientes (nome, email, telefone, endereco) VALUES (?, ?, ?, ?)",
      [nome, email, telefone, endereco],
      callback
    );
  },

  atualizar(id, cliente, callback) {
    const { nome, email, telefone, endereco } = cliente;
    db.query(
      "UPDATE clientes SET nome=?, email=?, telefone=?, endereco=? WHERE id=?",
      [nome, email, telefone, endereco, id],
      callback
    );
  },

  deletar(id, callback) {
    db.query("DELETE FROM clientes WHERE id=?", [id], callback);
  },

  adicionarFiado(cliente_id, valor, callback) {
    db.query("UPDATE clientes SET fiado = COALESCE(fiado,0) + ? WHERE id = ?", [valor, cliente_id], callback);
  }
};
