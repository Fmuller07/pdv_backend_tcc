const mysql = require('mysql2');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',       // usuário padrão do XAMPP
  password: '',       // deixe em branco se não tiver senha
  database: 'pdv_tcc2.2'
});

// Adiciona tabela relatorios
// CREATE TABLE relatorios (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   data_fechamento DATETIME NOT NULL,
//   total_vendido DECIMAL(10,2) NOT NULL
// );
// Adiciona coluna fechamento_id em vendas
// ALTER TABLE vendas ADD COLUMN fechamento_id INT;

module.exports = db;
