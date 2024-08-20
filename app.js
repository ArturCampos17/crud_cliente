const express = require('express');
const app = express();
const db = require('./db/connection');
const clientesRoutes = require('./src/cliente');

const PORT = process.env.PORT || 3000;

// Middleware para interpretar JSON e URL-encoded
app.use(express.json()); // Para application/json
app.use(express.urlencoded({ extended: true })); // Para application/x-www-form-urlencoded

// Servir arquivos estáticos
app.use(express.static('public'));

// Rotas
app.use('/cliente', clientesRoutes);

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Conectar ao banco de dados
db.authenticate()
  .then(() => {
    console.log("Conectou ao banco com sucesso");
  })
  .catch(err => {
    console.error("Ocorreu um erro ao conectar ao banco", err);
  });

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado!');
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`O Express está rodando na porta ${PORT}`);
});
