const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Cliente = require('../models/Cliente');
const Usuario = require('../models/Usuario');
const sequelize = require('../db/connection');
const { removerCaracteresEspeciais, validarCPF, validarEmail, validarSenha } = require('./utils');

// Middleware de validação
const validarCliente = (req, res, next) => {
    const { nome, sobrenome, email, email_confirm, cpf, telefone, data_nascimento, sexo, password, password_confirm, nome_cidade, nome_estado, cep, bairro, logradouro, numero } = req.body;

    if (!nome || !sobrenome || !email || !email_confirm || !cpf || !telefone || !data_nascimento || !sexo || !password || !password_confirm || !nome_cidade || !nome_estado || !cep || !bairro || !logradouro || !numero) {
        return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    if (!validarCPF(cpf)) {
        return res.status(400).json({ error: 'CPF inválido.' });
    }

    if (!validarEmail(email)) {
        return res.status(400).json({ error: 'E-mail inválido.' });
    }

    if (email !== email_confirm) {
        return res.status(400).json({ error: 'E-mail e confirmação de e-mail não coincidem.' });
    }

    if (password !== password_confirm) {
        return res.status(400).json({ error: 'A senha e a confirmação da senha não coincidem.' });
    }

    if (!validarSenha(password)) {
        return res.status(400).json({ error: 'Senha inválida. A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial.' });
    }

    next();
};
///////////////////////////////////////////////////////////
////////////////// POST / CREATE /////////////////////////
/////////////////////////////////////////////////////////

router.post('/', validarCliente, async (req, res) => {
    const { nome, sobrenome, email, cpf, telefone, data_nascimento, sexo, password, nome_cidade, nome_estado, cep, bairro, logradouro, numero, complemento } = req.body;
    const cpfFormatado = removerCaracteresEspeciais(cpf);

    let transaction;
    try {
        console.log('Iniciando transação para criar cliente e usuário');

        // Inicia a transação
        transaction = await sequelize.transaction();

        // Verifica se o cliente já existe com o mesmo CPF
        const clienteExistente = await Cliente.findOne({
            where: { cpf: cpfFormatado },
            transaction
        });
        if (clienteExistente) {
            console.log('Cliente com CPF existente encontrado');
            await transaction.rollback();
            return res.status(409).json({ error: 'CPF já cadastrado.' });
        }

        // Verifica se o cliente já existe com o mesmo e-mail
        const clienteComEmail = await Cliente.findOne({
            where: { email },
            transaction
        });
        if (clienteComEmail) {
            console.log('Cliente com e-mail existente encontrado');
            await transaction.rollback();
            return res.status(409).json({ error: 'Cliente já cadastrado com este e-mail!' });
        }

        // Criptografa a senha antes de criar o usuário
        const hashedPassword = await bcrypt.hash(password, 10);

        // Cria um novo cliente
        const cliente = await Cliente.create({
            nome,
            sobrenome,
            email,
            cpf: cpfFormatado,
            telefone,
            data_nascimento,
            sexo,
            nome_cidade,
            nome_estado,
            cep,
            bairro,
            logradouro,
            numero,
            complemento
        }, { transaction });

        console.log('Cliente criado com sucesso:', cliente);

        // Cria um novo usuário associado ao cliente
        const usuario = await Usuario.create({
            email,
            password: hashedPassword,
            id_cliente: cliente.id_cliente
        }, { transaction });

        console.log('Usuário criado com sucesso:', usuario);

        // Confirma a transação
        await transaction.commit();

        console.log('Cliente e usuário criados com sucesso');

        res.status(201).json({ message: 'Cliente e Usuário criados com sucesso!', cliente, usuario });
    } catch (error) {
        console.error('Erro ao criar cliente e usuário:', error);
        if (transaction) await transaction.rollback();
        res.status(500).json({ error: error.message });
    }
});

///////////////////////////////////////////////////////////
////////////////// GET / READ ////////////////////////////
/////////////////////////////////////////////////////////

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const cliente = await Cliente.findByPk(id);
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente não encontrado.' });
        }

        const usuario = await Usuario.findOne({ where: { id_cliente: cliente.id_cliente } });
        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        res.status(200).json({ cliente, usuario });
    } catch (error) {
        console.error('Erro ao ler cliente e usuário:', error);
        res.status(500).json({ error: error.message });
    }
});

///////////////////////////////////////////////////////////
//////////////// PUT / UPDATE ////////////////////////////
/////////////////////////////////////////////////////////

router.put('/:id', validarCliente, async (req, res) => {
    const { id } = req.params;
    const { nome, sobrenome, email, cpf, telefone, data_nascimento, sexo, password, nome_cidade, nome_estado, cep, bairro, logradouro, numero, complemento } = req.body;
    const cpfFormatado = removerCaracteresEspeciais(cpf);

    let transaction;
    try {
        console.log('Iniciando transação para atualizar cliente e usuário');

        // Inicia a transação
        transaction = await sequelize.transaction();

        // Verifica se o cliente existe
        const cliente = await Cliente.findByPk(id);
        if (!cliente) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Cliente não encontrado.' });
        }

        // Atualiza o cliente
        await cliente.update({
            nome,
            sobrenome,
            email,
            cpf: cpfFormatado,
            telefone,
            data_nascimento,
            sexo,
            nome_cidade,
            nome_estado,
            cep,
            bairro,
            logradouro,
            numero,
            complemento
        }, { transaction });

        // Atualiza o usuário
        const usuario = await Usuario.findOne({ where: { id_cliente: cliente.id_cliente } });
        if (!usuario) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await usuario.update({ password: hashedPassword }, { transaction });
        }

        // Confirma a transação
        await transaction.commit();

        console.log('Cliente e usuário atualizados com sucesso');

        res.status(200).json({ message: 'Cliente e Usuário atualizados com sucesso!', cliente, usuario });
    } catch (error) {
        console.error('Erro ao atualizar cliente e usuário:', error);
        if (transaction) await transaction.rollback();
        res.status(500).json({ error: error.message });
    }
});

///////////////////////////////////////////////////////////
////////////////////// DELETE ////////////////////////////
/////////////////////////////////////////////////////////

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    let transaction;
    try {
        console.log('Iniciando transação para deletar cliente e usuário');

        // Inicia a transação
        transaction = await sequelize.transaction();

        // Verifica se o cliente existe
        const cliente = await Cliente.findByPk(id);
        if (!cliente) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Cliente não encontrado.' });
        }

        // Remove o usuário associado
        const usuario = await Usuario.findOne({ where: { id_cliente: cliente.id_cliente } });
        if (usuario) {
            await usuario.destroy({ transaction });
        }

        // Remove o cliente
        await cliente.destroy({ transaction });

        // Confirma a transação
        await transaction.commit();

        console.log('Cliente e usuário deletados com sucesso');

        res.status(200).json({ message: 'Cliente e Usuário deletados com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar cliente e usuário:', error);
        if (transaction) await transaction.rollback();
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
