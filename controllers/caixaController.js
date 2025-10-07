const Caixa = require('../models/caixaModel');

module.exports = {
  abrir(req, res) {
    Caixa.verificarCaixaAberto((err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length) return res.status(400).json({ error: "Já existe um caixa aberto!" });
      Caixa.abrirCaixa((err2, result) => {
        if (err2) return res.status(500).json({ error: err2 });
        res.json({ success: true, caixa_id: result.insertId });
      });
    });
  },

  fechar(req, res) {
    Caixa.somarVendasSemFechamento((err, results) => {
      if (err) return res.status(500).json({ error: err });
      const total_vendido = results[0].total_vendido || 0;
      Caixa.criarRelatorio(total_vendido, (err2, result) => {
        if (err2) return res.status(500).json({ error: err2 });
        const fechamentoId = result.insertId;
        Caixa.atualizarVendasComFechamento(fechamentoId, (err3) => {
          if (err3) return res.status(500).json({ error: err3 });
          Caixa.fecharCaixa((err4) => {
            if (err4) return res.status(500).json({ error: err4 });
            res.json({ success: true, fechamentoId, total_vendido });
          });
        });
      });
    });
  },

  status(req, res) {
    Caixa.verificarCaixaAberto((err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (!results || results.length === 0) return res.json({ aberto: false });
      res.json({ aberto: true, caixa_id: results[0].id, abertura: results[0].abertura });
    });
  },

  listarRelatorios(req, res) {
    Caixa.listarRelatorios((err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    });
  },

  listarVendasDeFechamento(req, res) {
    Caixa.listarVendasDoFechamento(req.params.id, (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    });
  },

  listarVendasDeFechamentoParaRotaAntiga(req, res) {
    // rota compatível: /relatorios/:id/vendas
    Caixa.listarVendasDoFechamento(req.params.id, (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    });
  },

  detalharRelatorio(req, res) {
    Caixa.detalharRelatorio(req.params.id, (err, rows) => {
      if (err) return res.status(500).json({ error: err });
      res.json(rows);
    });
  }
};
