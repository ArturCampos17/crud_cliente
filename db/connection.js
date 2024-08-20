const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './db/app.db',
  pool: {
    max: 5,         // Número máximo de conexões no pool
    min: 0,         // Número mínimo de conexões no pool
    acquire: 30000, // Tempo máximo de espera para uma conexão (em ms)
    idle: 10000     // Tempo máximo de inatividade de uma conexão (em ms)
  }
});

module.exports = sequelize