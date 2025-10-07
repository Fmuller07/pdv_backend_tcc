const db = require('../db');

module.exports = {
  listarAtivos(callback) {
    db.query("SELECT * FROM produtos WHERE ativo = 1", callback);
  },

  listarInativos(callback) {
    db.query("SELECT * FROM produtos WHERE ativo = 0", callback);
  },

  criar(dados, callback) {
    const { nome, codigo, precocusto, preco, estoque } = dados;
    db.query(
      "INSERT INTO produtos (nome, codigo, precocusto, preco, estoque, ativo) VALUES (?, ?, ?, ?, ?, 1)",
      [nome, codigo, precocusto, preco, estoque],
      callback
    );
  },

  atualizar(id, dados, callback) {
    const { nome, codigo, precocusto, preco, estoque } = dados;
    db.query(
      "UPDATE produtos SET nome=?, codigo=?, precocusto=?, preco=?, estoque=? WHERE id=?",
      [nome, codigo, precocusto, preco, estoque, id],
      callback
    );
  },

  inativar(id, callback) {
    db.query("UPDATE produtos SET ativo = 0 WHERE id = ?", [id], callback);
  },

  reativar(id, callback) {
    db.query("UPDATE produtos SET ativo = 1 WHERE id = ?", [id], callback);
  },

  buscarEstoque(id, callback) {
    db.query("SELECT estoque FROM produtos WHERE id = ?", [id], callback);
  },

  reduzirEstoque(id, quantidade, callback) {
    db.query("UPDATE produtos SET estoque = estoque - ? WHERE id = ?", [quantidade, id], callback);
  }
};
