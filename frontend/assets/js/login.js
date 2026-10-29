function mostrarErro(mensagem) {
    const el = document.getElementById('mensagem-erro');
    el.textContent = mensagem;
    el.style.display = 'block';
}

function esconderErro() {
    document.getElementById('mensagem-erro').style.display = 'none';
}

// Destino depois do login: se o guard acesso.js guardou a página que a
// pessoa tentou abrir (?voltar=), devolve pra LÁ. Só vale caminho RELATIVO
// e seguro (arquivo .html com query) — bloca "http://", "//", "javascript:".
function destinoPosLogin() {
    const bruto = new URLSearchParams(window.location.search).get('voltar');
    if (!bruto || !/^[A-Za-z0-9._-]+\.html(\?.*)?$/.test(bruto)) return 'produtos.html';
    return bruto;
}

document.getElementById('form-login').addEventListener('submit', async function (evento) {
    evento.preventDefault();
    esconderErro();

    const identificador = document.getElementById('identificador').value.trim();
    const senha = document.getElementById('senha').value;

    // Botão mostra "Enviando..." e bloqueia o duplo clique durante o login.
    const botaoEnviar = this.querySelector('button[type="submit"], input[type="submit"], button');

    await PCForgeUtil.comEstadoEnviando(botaoEnviar, async () => {
        try {
            let cliente;

            try {
                const corpo = await apiPost('/login', { identificador, senha });
                // O token é a prova de login que o carrinho e o perfil exigem da API.
                cliente = { ...corpo.cliente, token: corpo.token };
            } catch (error) {
                if (error.rede) {
                    // Modo visualização: só simula o login se a API estiver mesmo fora
                    // do ar. Se a API respondeu (mesmo "senha errada"), vale a resposta dela.
                    if (!estaEmModoDemo()) throw error;
                    cliente = { id: 0, nome: identificador.split('@')[0] || 'Visitante', email: identificador };
                } else {
                    // Credencial recusada como cliente — pode ser o ADMINISTRADOR
                    // ("adm"). Tenta o login de admin com as mesmas credenciais:
                    // deu certo, guarda a sessão "adm" e vai direto ao painel.
                    try {
                        const r = await apiPost('/admin/login', { usuario: identificador, senha });
                        sessionStorage.setItem('adm', JSON.stringify({ id: r.admin.id, nome: r.admin.nome, token: r.token }));
                        mostrarToast(r.resposta || 'Bem-vindo, Administrador!', 'sucesso');
                        setTimeout(() => { window.location.href = 'painel-admin.html'; }, 700);
                        return;
                    } catch (erroAdmin) {
                        // Não era admin: mostra o erro de credenciais do cliente.
                        if (erroAdmin.rede) throw error;
                        throw error.status === 401
                            ? new Error('Usuário ou senha inválidos.')
                            : error;
                    }
                }
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

            setTimeout(() => { window.location.href = destinoPosLogin(); }, 900);
        } catch (error) {
            mostrarErro(error.message);
        }
    });
});
