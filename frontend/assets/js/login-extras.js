// ============================================================
// EXTRAS DAS TELAS DE LOGIN (cliente e loja):
// botão 👁 pra mostrar/ocultar a senha.
// ============================================================
(function () {
    function pronto(fn) {
        document.readyState === 'loading'
            ? document.addEventListener('DOMContentLoaded', fn)
            : fn();
    }

    pronto(function () {
        const campo = document.querySelector('.campo-senha');
        if (!campo) return;

        const input = campo.querySelector('input');
        const olho = campo.querySelector('.senha-olho');
        if (!input || !olho) return;

        olho.addEventListener('click', function () {
            const mostrando = input.type === 'text';
            input.type = mostrando ? 'password' : 'text';
            olho.textContent = mostrando ? '👁' : '🙈';
            olho.setAttribute('aria-pressed', String(!mostrando));
            olho.setAttribute('aria-label', mostrando ? 'Mostrar senha' : 'Ocultar senha');
        });
    });
})();
