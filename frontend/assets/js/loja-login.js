function mostrarErro(mensagem) {
    const el = document.getElementById('mensagem-erro');
    el.textContent = mensagem;
    el.style.display = 'block';
}

function esconderErro() {
    document.getElementById('mensagem-erro').style.display = 'none';
}

// Destino depois do login da loja: ?voltar= do guard (acesso.js) se for
// caminho relativo seguro; senão o painel da loja, como sempre.
function destinoPosLogin() {
    const bruto = new URLSearchParams(window.location.search).get('voltar');
    if (!bruto || !/^[A-Za-z0-9._-]+\.html(\?.*)?$/.test(bruto)) return 'painel-loja.html';
    return bruto;
}

document.getElementById('form-login-loja').addEventListener('submit', async function (evento) {
    evento.preventDefault();
    esconderErro();

    const identificador = document.getElementById('identificador').value.trim();
    const senha = document.getElementById('senha').value;

    // Botão mostra "Enviando..." e bloqueia o duplo clique durante o login.
    const botaoEnviar = this.querySelector('button[type="submit"], input[type="submit"], button');

    await PCForgeUtil.comEstadoEnviando(botaoEnviar, async () => {
        try {
            let loja;

            try {
                const corpo = await apiPost('/loja/login', { identificador, senha });
                // O token é a prova de login que o perfil da loja exige da API.
                loja = { ...corpo.loja, token: corpo.token };
            } catch (error) {
                // Modo visualização: só simula o login se a API estiver fora do ar.
                if (!(error.rede && estaEmModoDemo())) throw error;
                loja = { id: 0, nome: identificador.split('@')[0] || 'Loja Visitante', email: identificador };
            }

            sessionStorage.setItem('loja', JSON.stringify(loja));
            window.location.href = destinoPosLogin();
        } catch (error) {
            mostrarErro(error.message);
        }
    });
});
