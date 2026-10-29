// ============================================================
// GUARD DE LOGIN POR URL — acesso.js
//
// Incluído no <head> das páginas que exigem sessão:
//   <script src="assets/js/acesso.js" data-exige="cliente"></script>
//
//   data-exige="sessao"  -> aceita cliente OU loja logada (catálogo)
//   data-exige="cliente" -> só sessão de cliente (montar, carrinho, perfil)
//   data-exige="loja"    -> só sessão de loja (painel, perfil da loja)
//   data-exige="adm"     -> só sessão de administrador
//
// Roda ANTES do HTML da página (head), então quem abre a URL sem login
// é levado pro login.html sem ver o conteúdo "piscar". A página tentada
// vai no ?voltar= — login.js / loja-login.js devolvem pra lá depois de
// entrar (só se for caminho relativo do próprio site).
//
// IMPORTANTE: é proteção de NAVEGAÇÃO (front-end), não de segurança —
// as rotas GET da API continuam públicas. Fechamento de verdade exigiria
// token no backend.
// ============================================================
(function () {
    const script = document.currentScript;
    const tipo = (script && script.dataset && script.dataset.exige) || 'sessao';

    function sessao(chave) {
        try {
            const valor = JSON.parse(sessionStorage.getItem(chave));
            return valor && (valor.token || valor.id !== undefined) ? valor : null;
        } catch {
            return null;
        }
    }

    let logado;
    if (tipo === 'cliente') logado = !!sessao('cliente');
    else if (tipo === 'loja') logado = !!sessao('loja');
    else if (tipo === 'adm') logado = !!sessao('adm');
    else logado = !!(sessao('cliente') || sessao('loja'));

    if (logado) return;

    // pág+query que ele tentou abrir (só o nome do arquivo: guard vale por página)
    const voltar = window.location.pathname.split('/').pop() + window.location.search;
    window.location.replace('login.html?voltar=' + encodeURIComponent(voltar));
})();
