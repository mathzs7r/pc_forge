function mostrarErro(mensagem) {
    const el = document.getElementById('mensagem-erro');
    el.textContent = mensagem;
    el.style.display = 'block';
}

function esconderErro() {
    document.getElementById('mensagem-erro').style.display = 'none';
}

document.getElementById('form-cadastro-loja').addEventListener('submit', async function (evento) {
    evento.preventDefault();
    esconderErro();

    const valor = (id) => document.getElementById(id).value.trim();
    const dados = {
        nome: valor('nome'),
        cnpj: valor('cnpj'),
        endereco: valor('endereco'),
        email: valor('email'),
        celular: valor('celular'),
        senha: document.getElementById('senha').value
    };

    try {
        try {
            await apiPost('/loja', dados);
        } catch (error) {
            // Modo visualização: só simula se a API estiver fora do ar.
            if (!(error.rede && estaEmModoDemo())) throw error;
        }

        mostrarToast('Loja cadastrada com sucesso! Agora é só entrar.', 'sucesso');
        setTimeout(() => { window.location.href = 'loja-login.html'; }, 1200);
    } catch (error) {
        mostrarErro(error.message);
    }
});
