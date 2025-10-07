const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// controllers que usaremos para compatibilidade de endpoints antigos
const produtoController = require('./controllers/produtoController');
const vendaController = require('./controllers/vendaController');
const caixaController = require('./controllers/caixaController');

// rotas organizadas (MVC)
app.use('/produtos', require('./routes/produtos'));
app.use('/vendas', require('./routes/vendas'));
app.use('/fiados', require('./routes/fiado'));
app.use('/clientes', require('./routes/clientes'));
app.use('/caixa', require('./routes/caixa'));

// Endpoints mantidos exatamente como no seu server.js original
app.get('/produtos-inativos', produtoController.listarInativos); // compatibilidade
app.post('/finalizar-venda', vendaController.registrar); // compatibilidade (antigo /finalizar-venda)
app.get('/relatorios', caixaController.listarRelatorios); // compatibilidade
app.get('/relatorios/:id/vendas', caixaController.listarVendasDeFechamento); // compatibilidade

app.listen(5000, () => console.log('Servidor rodando na porta 5000'));
