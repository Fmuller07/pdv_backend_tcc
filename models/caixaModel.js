const db = require('../db');

module.exports = {
  verificarCaixaAberto(callback) {
    db.query("SELECT * FROM caixa WHERE aberto = 1 LIMIT 1", callback);
  },

  abrirCaixa(callback) {
    db.query("INSERT INTO caixa (aberto, abertura) VALUES (1, NOW())", callback);
  },

  somarVendasSemFechamento(callback) {
    db.query("SELECT SUM(total) as total_vendido FROM vendas WHERE fechamento_id IS NULL OR fechamento_id = 0", callback);
  },

  criarRelatorio(total, callback) {
    db.query("INSERT INTO relatorios (data_fechamento, total_vendido) VALUES (NOW(), ?)", [total], callback);
  },

  atualizarVendasComFechamento(fechamentoId, callback) {
    db.query("UPDATE vendas SET fechamento_id = ? WHERE fechamento_id IS NULL OR fechamento_id = 0", [fechamentoId], callback);
  },

  fecharCaixa(callback) {
    db.query("UPDATE caixa SET aberto = 0, fechamento = NOW() WHERE aberto = 1 ORDER BY abertura DESC LIMIT 1", callback);
  },

  listarRelatorios(callback) {
    db.query("SELECT * FROM relatorios ORDER BY data_fechamento DESC", callback);
  },

  listarVendasDoFechamento(fechamentoId, callback) {
    db.query("SELECT * FROM vendas WHERE fechamento_id = ?", [fechamentoId], callback);
  },

  detalharRelatorio(id, callback) {
    const sql = `
      SELECT v.id AS venda_id, v.data, v.total,
             JSON_ARRAYAGG(JSON_OBJECT('produto_id', i.produto_id, 'quantidade', i.quantidade, 'preco', i.preco)) AS itens
      FROM vendas v
      LEFT JOIN venda_itens i ON v.id = i.venda_id
      WHERE v.fechamento_id = ?
      GROUP BY v.id
    `;
    db.query(sql, [id], callback);
  }
};
