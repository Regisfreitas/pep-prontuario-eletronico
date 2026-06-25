const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { initDb, pool } = require('../db');

initDb()
  .then(() => {
    console.log('Migrations concluídas.');
    return pool.end();
  })
  .catch((err) => {
    console.error('Erro ao executar migrations:', err.message);
    process.exit(1);
  });
