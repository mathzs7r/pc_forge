function mostrarErro(mensagem) {
    const el = document.getElementById('mensagem-erro');
    el.textContent = mensagem;
    el.style.display = 'block';
}

function esconderErro() {
    document.getElementById('mensagem-erro').style.display = 'none';
}

document.getElementById('form-login-loja').addEventListener('submit', async function (evento) {
    evento.preventDefault();
    esconderErro();

    const identificador = document.getElementById('identificador').value.trim();
    const senha = document.getElementById('senha').value;

    try {
        let loja;

        try {
            const corpo = await apiPost('/loja/login', { identificador, senha });
            loja = corpo.loja;
        } catch (error) {
            // Modo visualização: só simula o login se a API estiver fora do ar.
            if (!(error.rede && estaEmModoDemo())) throw error;
            loja = { id: 0, nome: identificador.split('@')[0] || 'Loja Visitante', email: identificador };
        }

        sessionStorage.setItem('loja', JSON.stringify(loja));
        window.location.href = 'painel-loja.html';
    } catch (error) {
        mostrarErro(error.message);
    }
});
