const db = require('../db');

module.exports = {
  listar(callback) {
    const sql = `
      SELECT 
        v.id as venda_id, 
        v.data, 
        v.total,
        v.forma_pagamento,
        v.cliente_id,
        c.nome as cliente_nome,
        p.nome as produto_nome, 
        p.id as produto_id,
        vi.quantidade, 
        vi.preco
      FROM vendas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      JOIN venda_itens vi ON v.id = vi.venda_id
      JOIN produtos p ON vi.produto_id = p.id
      ORDER BY v.data DESC, v.id DESC
    `;
    
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Erro ao listar vendas:', err);
        return callback(err);
      }
      callback(null, results);
    });
  },

  buscarPorId(id, callback) {
    // Validação do ID
    if (!id || isNaN(parseInt(id))) {
      const error = new Error('ID da venda inválido');
      return callback(error);
    }

    const sql = `
      SELECT 
        v.id as venda_id, 
        v.data, 
        v.total,
        v.forma_pagamento,
        v.cliente_id,
        c.nome as cliente_nome,
        c.email as cliente_email,
        p.nome as produto_nome, 
        p.id as produto_id,
        vi.quantidade, 
        vi.preco,
        (vi.quantidade * vi.preco) as subtotal
      FROM vendas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      JOIN venda_itens vi ON v.id = vi.venda_id
      JOIN produtos p ON vi.produto_id = p.id
      WHERE v.id = ?
      ORDER BY p.nome
    `;
    
    db.query(sql, [parseInt(id)], (err, results) => {
      if (err) {
        console.error(`Erro ao buscar venda ID ${id}:`, err);
        return callback(err);
      }
      
      if (!results || results.length === 0) {
        const error = new Error(`Venda com ID ${id} não encontrada`);
        error.code = 'NOT_FOUND';
        return callback(error);
      }
      
      callback(null, results);
    });
  },

  // Método adicional para buscar resumo das vendas (sem itens)
  listarResumo(callback) {
    const sql = `
      SELECT 
        v.id,
        v.data,
        v.total,
        v.forma_pagamento,
        c.nome as cliente_nome,
        COUNT(vi.id) as total_itens
      FROM vendas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      LEFT JOIN venda_itens vi ON v.id = vi.venda_id
      GROUP BY v.id, v.data, v.total, v.forma_pagamento, c.nome
      ORDER BY v.data DESC, v.id DESC
    `;
    
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Erro ao listar resumo de vendas:', err);
        return callback(err);
      }
      callback(null, results);
    });
  },

  // Método para buscar vendas por período
  listarPorPeriodo(dataInicio, dataFim, callback) {
    if (!dataInicio || !dataFim) {
      const error = new Error('Datas de início e fim são obrigatórias');
      return callback(error);
    }

    const sql = `
      SELECT 
        v.id as venda_id, 
        v.data, 
        v.total,
        v.forma_pagamento,
        c.nome as cliente_nome,
        p.nome as produto_nome, 
        vi.quantidade, 
        vi.preco
      FROM vendas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      JOIN venda_itens vi ON v.id = vi.venda_id
      JOIN produtos p ON vi.produto_id = p.id
      WHERE v.data BETWEEN ? AND ?
      ORDER BY v.data DESC, v.id DESC
    `;
    
    db.query(sql, [dataInicio, dataFim], (err, results) => {
      if (err) {
        console.error('Erro ao listar vendas por período:', err);
        return callback(err);
      }
      callback(null, results);
    });
  },

  // Método para estatísticas de vendas
  obterEstatisticas(callback) {
    const sql = `
      SELECT 
        COUNT(*) as total_vendas,
        COALESCE(SUM(total), 0) as faturamento_total,
        AVG(total) as ticket_medio,
        COUNT(DISTINCT cliente_id) as clientes_ativos,
        forma_pagamento,
        COUNT(*) as vendas_por_forma_pagamento
      FROM vendas
      GROUP BY forma_pagamento
      ORDER BY vendas_por_forma_pagamento DESC
    `;
    
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Erro ao obter estatísticas de vendas:', err);
        return callback(err);
      }
      callback(null, results);
    });
  }
};