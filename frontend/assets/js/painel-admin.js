// ============================================================
// painel-admin.js — painel do ADMINISTRADOR ("acesso restrito")
//
// Números + listas de gestão: lojas parceiras, clientes, acessos
// que o site teve e produtos vendidos. NÃO tem produtos em si —
// catálogo é coisa da loja (painel-loja.html), aqui é supervisão.
//
//   GET /admin/visao     -> totalizadores
//   GET /admin/lojas     -> lista das lojas parceiras
//   GET /admin/clientes  -> lista dos clientes
//
// As três exigem o token do tipo "adm" (o api.js leva o token da
// sessão "adm" automaticamente). Sem sessão: avisa e manda embora.
// ============================================================
(function () {
    const $ = (id) => document.getElementById(id);
    const U = PCForgeUtil;

    const sessao = (() => {
        try { return JSON.parse(sessionStorage.getItem('adm')); } catch { return null; }
    })();

    if (!sessao || !sessao.token) {
        $('login-necessario').hidden = false;
        $('painel-conteudo').hidden = true;
        $('nome-admin').textContent = 'Acesso restrito';
        setTimeout(() => { window.location.href = 'login.html'; }, 3200);
        return;
    }

    if (sessao.nome) $('nome-admin').textContent = sessao.nome;

    // sessão válida: libera o corpo do painel (o HTML vem oculto)
    $('painel-conteudo').hidden = false;

    // formata data e moeda com o util compartilhado
    const dinheiro = (v) => U.formatarPreco(Number(v) || 0);

    function card(rotulo, valor, extra) {
        return `
            <div class="stat-card">
                <span>${rotulo}</span>
                <strong>${valor}</strong>
                ${extra ? `<small class="stat-extra">${extra}</small>` : ''}
            </div>
        `;
    }

    function linhaLoja(l) {
        return `
            <div class="adm-linha">
                <div>
                    <span class="venda-nome">${U.escapeHtml(l.NOME)}</span>
                    <small>${U.escapeHtml(l.EMAIL)} · loja desde ${U.escapeHtml(U.mesAno(l.CRIADO_EM))}</small>
                </div>
                <span class="venda-total">${Number(l.PRODUTOS_ATIVOS)} produtos · ${Number(l.VENDIDOS)} vendidos</span>
            </div>
        `;
    }

    function linhaCliente(c) {
        return `
            <div class="adm-linha">
                <div>
                    <span class="venda-nome">${U.escapeHtml(c.NOME)}</span>
                    <small>${U.escapeHtml(c.EMAIL)} · cliente desde ${U.escapeHtml(U.mesAno(c.CRIADO_EM))}</small>
                </div>
                <span class="venda-total">${Number(c.COMPRAS)} ${Number(c.COMPRAS) === 1 ? 'pedido' : 'pedidos'}</span>
            </div>
        `;
    }

    async function carregar() {
        try {
            const [visao, lojas, clientes] = await Promise.all([
                apiGet('/admin/visao'),
                apiGet('/admin/lojas'),
                apiGet('/admin/clientes'),
            ]);

            $('stats').innerHTML = [
                card('Lojas parceiras', visao.LOJAS),
                card('Clientes', visao.CLIENTES),
                card('Produtos vendidos', visao.PRODUTOS_VENDIDOS, `Faturamento: ${dinheiro(visao.FATURAMENTO)}`),
                card('Acessos ao site', visao.ACESSOS_TOTAL.toLocaleString('pt-BR'),
                    `${visao.ACESSOS_HOJE} hoje · ${visao.ACESSOS_SEMANA} na semana`),
            ].join('');

            $('lista-lojas').innerHTML = lojas.length
                ? lojas.map(linhaLoja).join('')
                : '<p class="estado-vazio">Nenhuma loja parceira ainda.</p>';

            $('lista-clientes').innerHTML = clientes.length
                ? clientes.map(linhaCliente).join('')
                : '<p class="estado-vazio">Nenhum cliente cadastrado ainda.</p>';

            $('acessos-detalhe').innerHTML = `
                <div><dt>Total de acessos</dt><dd>${visao.ACESSOS_TOTAL.toLocaleString('pt-BR')}</dd></div>
                <div><dt>Acessos hoje</dt><dd>${visao.ACESSOS_HOJE}</dd></div>
                <div><dt>Últimos 7 dias</dt><dd>${visao.ACESSOS_SEMANA}</dd></div>
            `;
        } catch (error) {
            if (!error.sessaoExpirada) {
                mostrarToast(`Não consegui carregar o painel: ${error.message}`, 'erro');
            }
        }
    }

    $('botao-sair').addEventListener('click', function () {
        sessionStorage.removeItem('adm');
        mostrarToast('Sessão do administrador encerrada.', 'info');
        setTimeout(() => { window.location.href = 'login.html'; }, 600);
    });

    carregar();
})();
