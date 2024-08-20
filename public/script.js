document.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita o envio padrão do formulário

    // Coletar os dados do formulário
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    // Validar o formulário
    if (!validarFormulario()) {
        return; // Se a validação falhar, não prosseguir com o envio
    }

    try {
        // Fazer a requisição para a API
        const response = await fetch('http://localhost:3000/cliente', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            // Sucesso - Cliente e Usuário criado
            const result = await response.json();
            alert('Usuário cadastrado com sucesso!');
            console.log(result);
        } else if (response.status === 409) {
            // Conflito - Usuário já existe
            alert('Usuário já cadastrado!');
        } else {
            // Outro erro
            const errorData = await response.json();
            alert('Erro: ' + errorData.error);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro ao tentar cadastrar o usuário.');
    }
});


///////////////////////////////////////////////////////////
///////////////// VALIDADR SENHA E EMAIL /////////////////
/////////////////////////////////////////////////////////

function validarFormulario() {
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const emailConfirm = document.getElementById('email_confirm').value.trim();
    const password = document.getElementById('password').value.trim();
    const passwordConfirm = document.getElementById('password_confirm').value.trim();
    const cpf = document.getElementById('cpf').value.trim();

    // Verificação de campos obrigatórios
    if (!nome || !email || !emailConfirm || !cpf || !password || !passwordConfirm) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return false;
    }

    // Validação de email
    if (!validarEmail(email)) {
        alert('E-mail inválido.');
        return false;
    }

    // Verificação de correspondência dos e-mails
    if (email !== emailConfirm) {
        alert('E-mail e confirmação de e-mail não coincidem.');
        return false;
    }

    // Verificação de correspondência das senhas
    if (password !== passwordConfirm) {
        alert('A senha e a confirmação da senha não coincidem.');
        return false;
    }
    
    // Validação da senha
    if (!validarSenha(password)) {
        alert('Senha inválida. A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial.');
        return false;
    }

    return true; // Se tudo estiver válido, retorna true
}

function validarEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function validarSenha(password) {
    const senhaPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return senhaPattern.test(password);
}

///////////////////////////////////////////////////////////
//////////////// FORMATAÇÃO DOS CAMPOS ///////////////////
/////////////////////////////////////////////////////////

document.getElementById('cpf').addEventListener('input', function (e) {
    let cpf = e.target.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos

    if (cpf.length <= 11) {
        cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
        cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
        cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }

    e.target.value = cpf;
});

document.getElementById('telefone').addEventListener('input', function (e) {
    let telefone = e.target.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos

    if (telefone.length <= 11) {
        telefone = telefone.replace(/^(\d{2})(\d)/, '($1) $2');
        telefone = telefone.replace(/(\d)(\d{4})$/, '$1 $2');
        telefone = telefone.replace(/(\d{4})(\d{4})$/, '$1-$2');
    }

    e.target.value = telefone;
});


document.getElementById('cep').addEventListener('input', function (e) {
    let cep = e.target.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos

    if (cep.length <= 8) {
        cep = cep.replace(/(\d{5})(\d)/, '$1-$2');
    }

    e.target.value = cep;
});

///////////////////////////////////////////////////////////
//////////////////////// BUSCA CEP ///////////////////////
/////////////////////////////////////////////////////////

document.getElementById('cep').addEventListener('blur', function (e) {
    const cep = e.target.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos

    if (cep.length === 8) { // Verifica se o CEP tem 8 dígitos
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(data => {
                if (data.erro) {
                    // Exibe a mensagem de erro se o CEP não for encontrado
                    document.getElementById('error-message').textContent = 'CEP não encontrado';
                    document.getElementById("nome_cidade").value = '';
                    document.getElementById("nome_estado").value = '';
                    document.getElementById("logradouro").value = '';
                    document.getElementById("complemento").value = '';
                    document.getElementById("bairro").value = '';
                } else {
                    // Preenche os campos com os dados do CEP encontrado
                    document.getElementById("nome_cidade").value = data.localidade || '';
                    document.getElementById("nome_estado").value = data.uf || '';
                    document.getElementById("logradouro").value = data.logradouro || '';
                    document.getElementById("complemento").value = data.complemento || '';
                    document.getElementById("bairro").value = data.bairro || '';
                    document.getElementById('error-message').textContent = ''; // Limpa a mensagem de erro
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                document.getElementById('error-message').textContent = 'Erro ao buscar CEP';
            });
    } else {
        document.getElementById('error-message').textContent = 'CEP inválido';
        // Limpa os campos caso o CEP não tenha 8 dígitos
        document.getElementById("nome_cidade").value = '';
        document.getElementById("nome_estado").value = '';
        document.getElementById("logradouro").value = '';
        document.getElementById("complemento").value = '';
        document.getElementById("bairro").value = '';
    }
});

///////////////////////////////////////////////////////////
//////////////////////// VER SENHA ///////////////////////
/////////////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', function () {
    const togglePassword = document.querySelector('#togglePassword');
    const password = document.querySelector('#password');
    const togglePasswordConfirm = document.querySelector('#togglePasswordConfirm');
    const passwordConfirm = document.querySelector('#password_confirm');

    if (togglePassword && password) {
        togglePassword.addEventListener('click', function () {
            const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
            password.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    if (togglePasswordConfirm && passwordConfirm) {
        togglePasswordConfirm.addEventListener('click', function () {
            const type = passwordConfirm.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordConfirm.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }
});
///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////


