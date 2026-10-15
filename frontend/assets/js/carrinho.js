// Tela do carrinho: lista os itens, muda quantidade, remove e finaliza a compra.
(function () {
    const U = PCForgeUtil;
    const cliente = U.lerSessao('cliente');

    if (!cliente) {
        U.exigirLogin('cliente', 'Entre na sua conta pra ver o carrinho.');
        document.getElementById('carrinho-itens').innerHTML = '<p class="estado-vazio">Redirecionando pro login...</p>';
        return;
    }

    const elItens = document.getElementById('carrinho-itens');
    const elResumo = document.getElementById('carrinho-resumo');
    const selectEndereco = document.getElementById('endereco-entrega');
    const botaoFinalizar = document.getElementById('botao-finalizar');
    const botaoEsvaziar = document.getElementById('botao-esvaziar');
    const avisoSemEndereco = document.getElementById('aviso-sem-endereco');
    let ocupado = false; // trava cliques enquanto uma chamada está em andamento

    function mostrarErro(mensagem) {
        const el = document.getElementById('mensagem-erro');
        el.textContent = mensagem;
        el.style.display = 'block';
    }

    function esconderErro() {
        document.getElementById('mensagem-erro').style.display = 'none';
    }

    function render(resumo) {
        if (resumo.itens.length === 0) {
            elResumo.hidden = true;
            elItens.innerHTML = `<p class="estado-vazio">
                Seu carrinho está vazio.<br>
                <a href="produtos.html" style="color: var(--accent); font-weight: 700;">Ver a vitrine de produtos</a>
            </p>`;
            return;
        }

        elResumo.hidden = false;
        document.getElementById('resumo-itens').textContent = resumo.quantidade_total;
        document.getElementById('resumo-total').textContent = U.formatarPreco(resumo.total);

        elItens.innerHTML = resumo.itens.map((item) => {
            const urlFoto = urlImagemProduto({ ID: item.ID_PRODUTO, TEM_IMAGEM: item.TEM_IMAGEM, IMG_VERSAO: item.IMG_VERSAO, IMAGEM_URL: item.IMAGEM_URL });
            return `
            <div class="item-carrinho" data-id="${item.ID_PRODUTO}">
                <div class="item-principal">
                    <div class="item-thumb${urlFoto ? ' com-foto' : ''}">
                        ${urlFoto ? `<img src="${U.escapeHtml(urlFoto)}" alt="" loading="lazy">` : ''}
                        <span class="item-thumb-icone">📦</span>
                    </div>
                    <div>
                        <span class="item-nome">${U.escapeHtml(item.NOME)}</span>
                        <span class="item-preco-unit">${U.formatarPreco(item.PRECO)} cada</span>
                        <span class="item-loja">${U.escapeHtml(item.LOJA_NOME)}</span>
                    </div>
                </div>
                <div class="qtd-controle" role="group" aria-label="Quantidade de ${U.escapeHtml(item.NOME)}">
                    <button type="button" class="qtd-menos" aria-label="Diminuir" ${item.QUANTIDADE <= 1 ? 'disabled' : ''}>−</button>
                    <span class="qtd-valor">${item.QUANTIDADE}</span>
                    <button type="button" class="qtd-mais" aria-label="Aumentar" ${item.QUANTIDADE >= Carrinho.LIMITE_POR_ITEM ? 'disabled' : ''}>+</button>
                </div>
                <div class="item-carrinho-direita">
                    <span class="item-subtotal">${U.formatarPreco(item.SUBTOTAL)}</span>
                    <button type="button" class="item-excluir item-remover">Remover</button>
                </div>
            </div>`;
        }).join('');

        elItens.querySelectorAll('.item-thumb img').forEach((img) => {
            img.addEventListener('error', () => { img.parentElement.classList.remove('com-foto'); img.remove(); });
        });

        elItens.querySelectorAll('.item-carrinho').forEach((linha) => {
            const id = Number(linha.dataset.id);
            const item = resumo.itens.find((i) => i.ID_PRODUTO === id);
            linha.querySelector('.qtd-menos').addEventListener('click', () => executar(() => Carrinho.alterarQuantidade(id, item.QUANTIDADE - 1)));
            linha.querySelector('.qtd-mais').addEventListener('click', () => executar(() => Carrinho.alterarQuantidade(id, item.QUANTIDADE + 1)));
            linha.querySelector('.item-remover').addEventListener('click', () => executar(() => Carrinho.remover(id)));
        });
    }

    // Roda uma operação do carrinho e redesenha a tela com o resultado.
    async function executar(operacao) {
        if (ocupado) return;
        ocupado = true;
        esconderErro();
        try {
            render(await operacao());
        } catch (error) {
            if (!error.sessaoExpirada) mostrarToast(error.message, 'erro');
        } finally {
            ocupado = false;
        }
    }

    async function carregarEnderecos() {
        if (estaEmModoDemo()) {
            selectEndereco.innerHTML = '<option value="0">Endereço de exemplo (modo visualização)</option>';
            return;
        }
        try {
            const enderecos = await apiGet(`/perfil/cliente/${cliente.id}/enderecos`);
            selectEndereco.innerHTML = enderecos.map((e) =>
                `<option value="${e.ID}">${U.escapeHtml(`${e.RUA}, ${e.NUMERO} - ${e.BAIRRO}, ${e.CIDADE}/${e.ESTADO}`)}</option>`
            ).join('');
            avisoSemEndereco.hidden = enderecos.length > 0;
            botaoFinalizar.disabled = enderecos.length === 0;
        } catch (error) {
            if (!error.sessaoExpirada) mostrarErro(`Não consegui carregar seus endereços: ${error.message}`);
        }
    }

    document.getElementById('form-finalizar').addEventListener('submit', async function (evento) {
        evento.preventDefault();
        if (ocupado) return;
        ocupado = true;
        esconderErro();
        botaoFinalizar.disabled = true;

        try {
            const pedido = await Carrinho.finalizar({
                id_endereco: Number(selectEndereco.value),
                forma_pagamento: document.getElementById('forma-pagamento').value
            });
            document.getElementById('carrinho-conteudo').hidden = true;
            document.getElementById('pedido-concluido').hidden = false;
            document.getElementById('pedido-texto').innerHTML = pedido.demo
                ? `Pedido simulado no modo visualização — total de <strong>${U.formatarPreco(pedido.total)}</strong>.`
                : `Pedido <strong>#${pedido.id_compra}</strong> registrado — ${pedido.quantidade_total} ${pedido.quantidade_total === 1 ? 'item' : 'itens'}, total de <strong>${U.formatarPreco(pedido.total)}</strong> (${U.escapeHtml(pedido.forma_pagamento)}).`;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            if (!error.sessaoExpirada) mostrarErro(error.message);
            botaoFinalizar.disabled = false;
        } finally {
            ocupado = false;
        }
    });

    botaoEsvaziar.addEventListener('click', function () {
        if (!confirm('Tirar todos os produtos do carrinho?')) return;
        executar(() => Carrinho.esvaziar());
    });

    (async function iniciar() {
        try {
            render(await Carrinho.obter());
            await carregarEnderecos();
        } catch (error) {
            if (!error.sessaoExpirada) {
                elItens.innerHTML = `<p class="estado-vazio">Não foi possível carregar o carrinho. (${U.escapeHtml(error.message)})</p>`;
            }
        }
    })();
})();
