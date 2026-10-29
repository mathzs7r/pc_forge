// ============================================================
// toast.js — notificação temporária no canto da tela, no lugar do
// alert() nativo do navegador. Inclua este script (e o toast.css)
// em qualquer página e use window.mostrarToast(...) em vez de alert().
//
// Uso:
//   mostrarToast('Produto cadastrado com sucesso!', 'sucesso');
//   mostrarToast('Não foi possível excluir o produto.', 'erro');
//   mostrarToast('Verifique os campos.', 'aviso');
//   mostrarToast('Algo pra avisar.'); // tipo padrão: 'info'
// ============================================================
(function () {
    const DURACAO_PADRAO = 4500;
    const DURACAO_ERRO = 8000; // erro precisa de mais tempo pra ser lido
    const ICONES = { sucesso: '✓', erro: '✕', aviso: '!', info: 'i' };

    function garantirContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            // role/aria-live no CONTAINER: garante que leitor de tela anuncie
            // os avisos mesmo se o role do toast individual muda depois.
            container.setAttribute('role', 'region');
            container.setAttribute('aria-label', 'Notificações');
            container.setAttribute('aria-live', 'polite');
            container.setAttribute('aria-atomic', 'false');
            document.body.appendChild(container);
        }
        return container;
    }

    function mostrarToast(mensagem, tipo = 'info', duracao) {
        const container = garantirContainer();
        const tempo = duracao ?? (tipo === 'erro' ? DURACAO_ERRO : DURACAO_PADRAO);

        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        toast.setAttribute('role', tipo === 'erro' ? 'alert' : 'status');

        const icone = document.createElement('span');
        icone.className = 'toast-icone';
        icone.textContent = ICONES[tipo] || ICONES.info;

        const texto = document.createElement('span');
        texto.className = 'toast-texto';
        texto.textContent = mensagem;

        const botaoFechar = document.createElement('button');
        botaoFechar.type = 'button';
        botaoFechar.className = 'toast-fechar';
        botaoFechar.setAttribute('aria-label', 'Fechar');
        botaoFechar.innerHTML = '&times;';

        toast.append(icone, texto, botaoFechar);
        container.appendChild(toast);

        let removido = false;
        function remover() {
            if (removido) return;
            removido = true;
            clearTimeout(temporizador);
            toast.classList.add('toast-saindo');
            toast.addEventListener('animationend', () => toast.remove(), { once: true });
        }

        botaoFechar.addEventListener('click', remover);
        const temporizador = setTimeout(remover, tempo);

        return toast;
    }

    // Expõe globalmente pra qualquer outro script da página poder chamar.
    window.mostrarToast = mostrarToast;
})();
