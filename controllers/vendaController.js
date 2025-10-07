const db = require('../db');
const VendaModel = require('../models/vendaModel');
const Cliente = require('../models/clienteModel');

function queryConn(conn, sql, params) {
  return new Promise((resolve, reject) => {
    conn.query(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
  });
}

function getConnection() {
  return new Promise((resolve, reject) => {
    db.getConnection((err, conn) => err ? reject(err) : resolve(conn));
  });
}

module.exports = {
  async registrar(req, res) {
    const { produtos, cliente_id, forma_pagamento } = req.body;
    
    // Validações iniciais
    if (!produtos || !Array.isArray(produtos) || produtos.length === 0) {
      return res.status(400).json({ error: "Nenhum item informado" });
    }

    // Validar dados dos produtos
    for (const [index, produto] of produtos.entries()) {
      if (!produto.id || !produto.quantidade || !produto.preco) {
        return res.status(400).json({ 
          error: `Produto na posição ${index + 1} está com dados incompletos` 
        });
      }
      if (produto.quantidade <= 0) {
        return res.status(400).json({ 
          error: `Quantidade inválida para o produto na posição ${index + 1}` 
        });
      }
    }

    const total = produtos.reduce((acc, p) => {
      const preco = Number(p.preco) || 0;
      const quantidade = Number(p.quantidade) || 0;
      return acc + (preco * quantidade);
    }, 0);

    let conn;
    try {
      conn = await getConnection();
      await queryConn(conn, 'START TRANSACTION');

      // 1) Verifica estoques e existência dos produtos (com lock)
      for (const [index, p] of produtos.entries()) {
        const rows = await queryConn(conn, 
          "SELECT estoque, nome FROM produtos WHERE id = ? FOR UPDATE", 
          [p.id]
        );
        
        if (!rows || rows.length === 0) {
          throw new Error(`Produto ID ${p.id} não encontrado`);
        }
        
        const produto = rows[0];
        if (produto.estoque < p.quantidade) {
          throw new Error(`Estoque insuficiente para ${produto.nome || 'o produto'}. Disponível: ${produto.estoque}, Solicitado: ${p.quantidade}`);
        }
      }

      // 2) Inserir venda
      const insertVenda = await queryConn(conn,
        "INSERT INTO vendas (cliente_id, total, forma_pagamento, data) VALUES (?, ?, ?, NOW())",
        [cliente_id || null, total, forma_pagamento || null]
      );

      const vendaId = insertVenda.insertId;

      // 3) Inserir itens (bulk) - com validação adicional
      const valores = produtos.map(i => [
        vendaId, 
        i.id, 
        i.quantidade, 
        Number(i.preco) || 0
      ]);
      
      await queryConn(conn, 
        "INSERT INTO venda_itens (venda_id, produto_id, quantidade, preco) VALUES ?", 
        [valores]
      );

      // 4) Atualizar estoque (melhorado)
      const updatePromises = produtos.map(p => 
        queryConn(conn, 
          "UPDATE produtos SET estoque = estoque - ? WHERE id = ?", 
          [p.quantidade, p.id]
        )
      );
      await Promise.all(updatePromises);

      // 5) Se fiado, atualizar cliente (com validação do cliente)
      if (forma_pagamento && forma_pagamento.toString().trim().toLowerCase() === 'fiado') {
        if (!cliente_id) {
          throw new Error("Cliente é obrigatório para vendas fiado");
        }
        
        // Verificar se cliente existe
        const clienteRows = await queryConn(conn, 
          "SELECT id FROM clientes WHERE id = ?", 
          [cliente_id]
        );
        
        if (!clienteRows || clienteRows.length === 0) {
          throw new Error("Cliente não encontrado");
        }
        
        await queryConn(conn, 
          "UPDATE clientes SET fiado = COALESCE(fiado, 0) + ? WHERE id = ?", 
          [total, cliente_id]
        );
      }

      await queryConn(conn, 'COMMIT');
      
      res.json({ 
        message: "Venda finalizada com sucesso!", 
        vendaId, 
        total,
        produtos: produtos.length
      });

    } catch (err) {
      if (conn) {
        try { 
          await queryConn(conn, 'ROLLBACK'); 
        } catch (rollbackError) {
          console.error("Erro no ROLLBACK:", rollbackError);
        }
      }
      
      console.error("Erro em finalizar venda:", err);
      
      // Determinar status HTTP apropriado
      let status = 500;
      if (err.message.includes('Estoque insuficiente') || 
          err.message.includes('não encontrado') ||
          err.message.includes('dados incompletos') ||
          err.message.includes('Quantidade inválida')) {
        status = 400;
      }
      
      res.status(status).json({ 
        error: err.message || "Erro interno no servidor" 
      });
    } finally {
      // Garantir que a conexão seja sempre liberada
      if (conn) {
        conn.release();
      }
    }
  },

  async listar(req, res) {
    try {
      const results = await new Promise((resolve, reject) => {
        VendaModel.listar((err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      // Transformar em estrutura por venda (agrupar)
      const vendas = {};
      results.forEach(r => {
        if (!vendas[r.venda_id]) {
          vendas[r.venda_id] = {
            id: r.venda_id,
            data: r.data,
            cliente: r.cliente_nome || "Cliente não informado",
            total: r.total,
            forma_pagamento: r.forma_pagamento,
            itens: []
          };
        }
        vendas[r.venda_id].itens.push({
          produto: r.produto_nome,
          quantidade: r.quantidade,
          preco: r.preco
        });
      });
      
      res.json(Object.values(vendas));
    } catch (err) {
      console.error("Erro ao listar vendas:", err);
      res.status(500).json({ error: "Erro interno ao listar vendas" });
    }
  },

  async buscarPorId(req, res) {
    try {
      const results = await new Promise((resolve, reject) => {
        VendaModel.buscarPorId(req.params.id, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      if (!results || results.length === 0) {
        return res.status(404).json({ error: "Venda não encontrada" });
      }

      // Agrupar itens da venda
      const venda = {
        id: results[0].venda_id,
        data: results[0].data,
        cliente: results[0].cliente_nome || "Cliente não informado",
        total: results[0].total,
        forma_pagamento: results[0].forma_pagamento,
        cliente_id: results[0].cliente_id,
        itens: []
      };
      
      results.forEach(r => {
        venda.itens.push({ 
          produto: r.produto_nome, 
          quantidade: r.quantidade, 
          preco: r.preco,
          produto_id: r.produto_id
        });
      });
      
      res.json(venda);
    } catch (err) {
      console.error("Erro ao buscar venda:", err);
      res.status(500).json({ error: "Erro interno ao buscar venda" });
    }
  }
};