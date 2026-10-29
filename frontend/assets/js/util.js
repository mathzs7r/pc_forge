// Funções pequenas que as telas de carrinho e perfil têm em comum
// (formatar dinheiro/data, escapar HTML, ler a sessão). Uso: PCForgeUtil.formatarPreco(12.5)
window.PCForgeUtil = (function () {
    // Escapa TUDO que precisa escapar antes de entrar num HTML montado por string.
    // IMPORTANTE escapar as aspas (" e '): a função antiga usava textContent +
    // innerHTML, que escapa só < > &, e um texto vindo de um usuário (nome de
    // produto, por exemplo) podia SAIR de dentro de um atributo tipo
    // title="..." e injetar o que quisesse (XSS armazenado).
    function escapeHtml(texto) {
        return String(texto ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatarPreco(valor) {
        return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // "07/10/2026" (ou "07/10/2026 14:32" com comHora). Aceita Date ou texto ISO.
    function formatarData(valor, comHora) {
        const data = new Date(valor);
        if (Number.isNaN(data.getTime())) return '';
        const opcoes = comHora
            ? { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
            : { day: '2-digit', month: '2-digit', year: 'numeric' };
        return data.toLocaleString('pt-BR', opcoes);
    }

    // "10/2026"
    function mesAno(valor) {
        const data = new Date(valor);
        if (Number.isNaN(data.getTime())) return '';
        return data.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
    }

    // "2000-01-31" (como a API manda) -> "31/01/2000", sem passar por Date (evita virar o dia anterior por fuso).
    function dataIsoParaBr(iso) {
        const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso ?? ''));
        return partes ? `${partes[3]}/${partes[2]}/${partes[1]}` : '';
    }

    function primeiroNome(nomeCompleto) {
        return (nomeCompleto || '').trim().split(/\s+/)[0] || '';
    }

    // Quem está logado nesta aba: { id, nome, email, token } ou null.
    function lerSessao(tipo) {
        try {
            const sessao = JSON.parse(sessionStorage.getItem(tipo));
            return sessao && sessao.nome ? sessao : null;
        } catch {
            return null;
        }
    }

    function salvarSessao(tipo, sessao) {
        sessionStorage.setItem(tipo, JSON.stringify(sessao));
    }

    // Manda pra tela de login do tipo certo, com um aviso.
    function exigirLogin(tipo, mensagem) {
        if (typeof window.mostrarToast === 'function') window.mostrarToast(mensagem, 'aviso');
        setTimeout(() => {
            window.location.href = tipo === 'loja' ? 'loja-login.html' : 'login.html';
        }, 1200);
    }

    // ------------------------------------------------------------------
    // comEstadoEnviando(botao, acao)
    // ------------------------------------------------------------------
    // Desabilita o botão do formulário e mostra "Enviando..." durante a
    // requisição, e volta ao normal (com o texto original) no fim — de
    // sucesso OU de erro.
    //
    // Por quê: sem isso o usuário podia clicar duas vezes (dois cadastros
    // repetidos) e não recebia NENHUM sinal de que algo estava acontecendo.
    // Uso:
    //   await comEstadoEnviando(botao, async () => { await apiPost(...); });
    async function comEstadoEnviando(botao, acao) {
        if (botao && botao.disabled !== undefined) {
            const rótuloOriginal = botao.tagName === 'INPUT' ? botao.value : botao.textContent;
            if (botao.disabled) return; // já enviando: ignora o clique repetido
            botao.disabled = true;
            if (botao.tagName === 'INPUT') botao.value = 'Enviando...';
            else botao.textContent = 'Enviando...';
            try {
                return await acao();
            } finally {
                botao.disabled = false;
                if (botao.tagName === 'INPUT') botao.value = rótuloOriginal;
                else botao.textContent = rótuloOriginal;
            }
        }
        return acao();
    }


    // 5 estrelas (cheias/vazias) a partir de uma média 0–5. Reuso em
    // qualquer página: vitrine, produto, perfil público da loja.
    function estrelasHtml(media, extras) {
        const m = Number(media) || 0;
        const cheias = Math.round(m);
        let html = `<span class="estrelas ${extras || ''}" aria-label="${m.toFixed(1)} de 5">`;
        for (let i = 1; i <= 5; i++) {
            html += `<span class="estrela${i <= cheias ? ' cheia' : ''}">★</span>`;
        }
        return html + '</span>';
    }

    // ------------------------------------------------------------------
    // confirmar(mensagem, { ok, cancelar }) -> Promise<boolean>
    // ------------------------------------------------------------------
    // Confirmação no idioma visual do site (modal próprio), substituindo o
    // confirm() nativo do browser — que quebra a estética e no celular fica
    // espremido. Uso:
    //   if (await PCForgeUtil.confirmar('Excluir este endereço?')) { ... }
    function confirmar(mensagem, opcoes = {}) {
        return new Promise((resolver) => {
            const fundo = document.createElement('div');
            fundo.className = 'modal-fundo';
            fundo.setAttribute('role', 'dialog');
            fundo.setAttribute('aria-modal', 'true');
            fundo.innerHTML = `
                <div class="modal-caixa">
                    <h2>${escapeHtml(opcoes.titulo || 'Confirmar ação')}</h2>
                    <p class="subtitulo" style="text-align: left;">${escapeHtml(mensagem)}</p>
                    <div style="display: flex; gap: 10px; margin-top: 18px;">
                        <button type="button" class="modal-acao modal-acao-primario" data-acao="ok">
                            ${escapeHtml(opcoes.confirmar || 'Confirmar')}
                        </button>
                        <button type="button" class="modal-acao" data-acao="cancelar">
                            ${escapeHtml(opcoes.cancelar || 'Cancelar')}
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(fundo);

            const encerrar = (valor) => {
                fundo.remove();
                document.removeEventListener('keydown', aoTeclado);
                resolver(valor);
            };

            const aoTeclado = (evento) => {
                if (evento.key === 'Escape') encerrar(false);
            };
            document.addEventListener('keydown', aoTeclado);

            fundo.addEventListener('click', (evento) => {
                if (evento.target === fundo) return encerrar(false);
                const acao = evento.target.closest('[data-acao]');
                if (!acao) return;
                encerrar(acao.dataset.acao === 'ok');
            });

            // Foco inicial no botão de cancelar: Enter não dispara a ação
            // perigosa por acidente.
            const cancelarBtn = fundo.querySelector('[data-acao="cancelar"]');
            if (cancelarBtn) cancelarBtn.focus();
        });
    }

    return { escapeHtml, formatarPreco, formatarData, mesAno, dataIsoParaBr, primeiroNome, lerSessao, salvarSessao, exigirLogin, estrelasHtml, comEstadoEnviando, confirmar };
})();
