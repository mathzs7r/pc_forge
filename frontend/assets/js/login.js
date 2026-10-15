function mostrarErro(mensagem) {
    const el = document.getElementById('mensagem-erro');
    el.textContent = mensagem;
    el.style.display = 'block';
}

function esconderErro() {
    document.getElementById('mensagem-erro').style.display = 'none';
}

document.getElementById('form-login').addEventListener('submit', async function (evento) {
    evento.preventDefault();
    esconderErro();

    const identificador = document.getElementById('identificador').value.trim();
    const senha = document.getElementById('senha').value;

    try {
        let cliente;

        try {
            const corpo = await apiPost('/login', { identificador, senha });
            // O token é a prova de login que o carrinho e o perfil exigem da API.
            cliente = { ...corpo.cliente, token: corpo.token };
        } catch (error) {
            // Modo visualização: só simula o login se a API estiver mesmo fora
            // do ar. Se a API respondeu (mesmo "senha errada"), vale a resposta dela.
            if (!(error.rede && estaEmModoDemo())) throw error;
            cliente = { id: 0, nome: identificador.split('@')[0] || 'Visitante', email: identificador };
        }

        sessionStorage.setItem('cliente', JSON.stringify(cliente));

        // O produto pretendido NÃO é removido aqui: a vitrine (produtos.js) o coloca
        // no carrinho assim que carregar, já com a sessão pronta.
        const pretendido = sessionStorage.getItem('produtoPretendido');
        if (pretendido) {
            const produto = JSON.parse(pretendido);
            mostrarToast(`Bem-vindo(a), ${cliente.nome}! Vamos colocar "${produto.nome}" no seu carrinho.`, 'sucesso');
        } else {
            mostrarToast(`Bem-vindo(a), ${cliente.nome}!`, 'sucesso');
        }

        setTimeout(() => { window.location.href = 'produtos.html'; }, 900);
    } catch (error) {
        mostrarErro(error.message);
    }
});
