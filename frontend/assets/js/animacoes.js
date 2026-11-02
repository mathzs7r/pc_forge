// ============================================================
// animacoes.js — revelação suave dos elementos quando aparecem
// na tela (InterseçãoObserver), no lugar de animar tudo de uma vez.
//
// Uso: adicione a classe "revelar" aos elementos (ou deixe o script
// observar seletivas automáticas) e inclua este arquivo na página.
// Stagger: defina --atraso (ex: style="--atraso:.08s") ou o script
// aplica um atraso crescente entre irmãos.
// Respeita prefers-reduced-motion: nesse caso revela sem animar.
// ============================================================
(function () {
    const reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const SELETORES = [
        '.revelar',
        '.cartao-produto',
        '.stat-card',
        '.venda-linha',
        '.hero-imagem',
        '.painel-form-card'
    ];

    function preparar(elemento) {
        if (elemento.dataset.revelado) return;
        elemento.dataset.revelado = '1';
        elemento.classList.add('pre-revelar');
        if (!elemento.style.getPropertyValue('--atraso')) {
            // atraso crescente entre irmãos (até 6 limite pra não ficar lento)
            const irmaos = Array.from(elemento.parentElement ? elemento.parentElement.children : [])
                .filter((el) => el.classList && el.classList.contains('pre-revelar'));
            const indice = Math.min(irmaos.indexOf(elemento), 5);
            if (indice > 0) elemento.style.setProperty('--atraso', `${indice * 0.07}s`);
        }
    }

    function iniciar() {
        if (reduzMovimento) {
            // sem animação: só garante que nada fica invisível
            document.querySelectorAll(SELETORES.join(',')).forEach((el) => el.classList.add('revelado'));
            return;
        }

        const elementos = document.querySelectorAll(SELETORES.join(','));
        const observador = new IntersectionObserver((entradas) => {
            entradas.forEach((entrada) => {
                if (!entrada.isIntersecting) return;
                entrada.target.classList.add('revelado');
                observador.unobserve(entrada.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        elementos.forEach((elemento) => {
            preparar(elemento);
            observador.observe(elemento);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciar);
    } else {
        iniciar();
    }
})();
