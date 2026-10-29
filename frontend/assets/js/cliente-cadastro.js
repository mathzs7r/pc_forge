function pegarDadosCadastro() {
    const valor = (id) => document.getElementById(id).value.trim();
    return {
        nome: valor('nome'),
        cpf: valor('cpf'),
        cep: valor('cep'),
        nascimento: valor('nascimento'),
        rua: valor('rua'),
        numero: valor('numero'),
        bairro: valor('bairro'),
        cidade: valor('cidade'),
        uf: valor('uf').toUpperCase(),
        email: valor('email'),
        celular: valor('celular'),
        senha: document.getElementById('senha').value
    };
}

function mostrarErro(mensagem) {
    const el = document.getElementById('mensagem-erro');
    el.textContent = mensagem;
    el.style.display = 'block';
}

function esconderErro() {
    document.getElementById('mensagem-erro').style.display = 'none';
}

document.getElementById('form-cadastro').addEventListener('submit', async function (evento) {
    evento.preventDefault();
    esconderErro();
    const dados = pegarDadosCadastro();

    // Botão mostra "Enviando..." e bloqueia o duplo clique (evita cadastro duplo).
    const botaoEnviar = this.querySelector('button[type="submit"], input[type="submit"], button');

    await PCForgeUtil.comEstadoEnviando(botaoEnviar, async () => {
        try {
            try {
                await apiPost('/cliente', dados);
            } catch (error) {
                // Modo visualização: só simula o cadastro se a API estiver mesmo
                // fora do ar. Se a API respondeu, vale a resposta dela.
                if (!(error.rede && estaEmModoDemo())) throw error;
            }

            mostrarToast('Cadastro concluído! Agora é só entrar.', 'sucesso');
            setTimeout(() => { window.location.href = 'login.html'; }, 1200);
        } catch (error) {
            mostrarErro(error.message);
        }
    });
});
