
const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const Usuario = sequelize.define('Usuario', {
    id_usuario: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true // Valida se o valor é um e-mail válido
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [8, 255] // Defina o comprimento mínimo e máximo da senha
        }
    },
    id_cliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Cliente', // Nome da tabela de clientes
            key: 'id_cliente' // Nome da chave primária em Cliente
        },
        onDelete: 'CASCADE' // Define o que acontece quando um cliente é deletado
    }
}, {
    tableName: 'Usuario',
    timestamps: false
});

module.exports = Usuario;