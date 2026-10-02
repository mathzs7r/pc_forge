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
    const ICONES = { sucesso: '✓', erro: '✕', aviso: '!', info: 'i' };

    function garantirContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    function mostrarToast(mensagem, tipo = 'info', duracao = DURACAO_PADRAO) {
        const container = garantirContainer();

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
        const temporizador = setTimeout(remover, duracao);

        return toast;
    }

    // Expõe globalmente pra qualquer outro script da página poder chamar.
    window.mostrarToast = mostrarToast;
})();
