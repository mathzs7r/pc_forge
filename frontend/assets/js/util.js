// Funções pequenas que as telas de carrinho e perfil têm em comum
// (formatar dinheiro/data, escapar HTML, ler a sessão). Uso: PCForgeUtil.formatarPreco(12.5)
window.PCForgeUtil = (function () {
    function escapeHtml(texto) {
        const div = document.createElement('div');
        div.textContent = texto ?? '';
        return div.innerHTML;
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

    return { escapeHtml, formatarPreco, formatarData, mesAno, dataIsoParaBr, primeiroNome, lerSessao, salvarSessao, exigirLogin, estrelasHtml };
})();
