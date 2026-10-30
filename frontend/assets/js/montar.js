// ============================================================
// "MONTE SEU PC" — wizard de montagem com filtragem de
// compatibilidade ao vivo (Pichau/PCPartPicker style).
// Dependências: api.js, compatibilidade.js, carrinho-api.js,
//               util.js (PCForgeUtil), demo.js, toast.js.
// ============================================================
(function () {
    // Acesso restrito: a montagem (e o envio pro carrinho) é ferramenta de
    // CLIENTE. Sem sessão de cliente, avisa e manda pro login — igual o
    // carrinho.html faz. O return impede manter o restante do IIFE rodando.
    if (window.PCForgeUtil && !window.PCForgeUtil.lerSessao('cliente')) {
        window.PCForgeUtil.exigirLogin('cliente', 'Entre na sua conta pra montar seu PC.');
        const listaGuarda = document.getElementById('montar-lista');
        if (listaGuarda) {
            listaGuarda.innerHTML = '<p class="estado-vazio">Redirecionando pro login...</p>';
        }
        return;
    }
    // Ordem importa: peça-mãe primeiro (determina soquete/DDR), depois o resto.
    const ETAPAS = [
        { id: 'placa-mae', categoria: 'Placas-mãe', titulo: 'Placa-mãe', desc: 'Começa por ela — o soquete e a memória batem aqui' },
        { id: 'processador', categoria: 'Processadores', titulo: 'Processador', desc: 'Só entra o que casa com o soquete da sua placa-mãe' },
        { id: 'memoria', categoria: 'Memória RAM', titulo: 'Memória', desc: 'Padrão igual ao da placa-mãe, no erro zero' },
        { id: 'gpu', categoria: 'Placas de Vídeo', titulo: 'Placa de vídeo', desc: 'Onde o jogo acontece' },
        { id: 'armazenamento', categoria: 'Armazenamento', titulo: 'Armazenamento', desc: 'SSD NVMe pro sistema, HD se a verba pedir' },
        { id: 'fonte', categoria: 'Fontes', titulo: 'Fonte', desc: 'Potência calculada pro que você escolheu' },
        { id: 'cooler', categoria: 'Refrigeração', titulo: 'Cooler', desc: 'Temperatura na régua, performance estável' },
        { id: 'gabinete', categoria: 'Gabinetes', titulo: 'Gabinete', desc: 'Fecha a build: tudo dentro, tudo respirando' },
        { id: 'so', categoria: 'Sistemas Operacionais', titulo: 'Sistema', desc: 'Windows ou Linux, instalado com a sua compra' }
    ];

    const CHAVE_MONTAGEM = 'pcforge_montagem';
    const PRECO_MONTAGEM = 0.10; // "Serviço de Montagem" (migração 016)
    const FRETE_MONTADO = 0;     // frete grátis no PC montado (migração 016)
    const TEMPO_LIMITE_MS = 12000; // aborta a carga se a API travar

    // ------------------------------------------------------------
    // estado: escolhas por etapa + modo de entrega (peças vs montado)
    // ------------------------------------------------------------
    let escolhas = {};
    let etapaAtual = ETAPAS[0].id;
    let modo = 'pecas';            // 'pecas' = cliente monta | 'montada' = loja monta
    let mostrarIncompativeis = false;
    let buscaAtual = '';

    function lerEstado() {
        try { escolhas = JSON.parse(sessionStorage.getItem(CHAVE_MONTAGEM)) || {}; } catch { escolhas = {}; }
        etapaAtual = sessionStorage.getItem(CHAVE_MONTAGEM + '_etapa') || ETAPAS[0].id;
        modo = sessionStorage.getItem(CHAVE_MONTAGEM + '_modo') === 'montada' ? 'montada' : 'pecas';
        // etapa antiga pode não existir mais se mudar o array acima
        if (!ETAPAS.some((e) => e.id === etapaAtual)) etapaAtual = ETAPAS[0].id;

        // sanitização: só vale um BLOCO CONTÍNUO desde a primeira etapa
        // (escolhas órfãs de versões antigas/ordem antiga são descartadas)
        let i = 0;
        while (i < ETAPAS.length && escolhas[ETAPAS[i].id]) i++;
        for (let j = i; j < ETAPAS.length; j++) delete escolhas[ETAPAS[j].id];
        if (!ETAPAS.some((e) => e.id === etapaAtual)) etapaAtual = ETAPAS[0].id;
    }

    function salvarEstado() {
        sessionStorage.setItem(CHAVE_MONTAGEM, JSON.stringify(escolhas));
        sessionStorage.setItem(CHAVE_MONTAGEM + '_etapa', etapaAtual);
        sessionStorage.setItem(CHAVE_MONTAGEM + '_modo', modo);
    }

    // ------------------------------------------------------------
    // catálogo: baixa TODAS as páginas da categoria (cache por página aberta).
    // Cada request aborta em 12s: se a API travar a página NUNCA fica no
    // "carregando..." infinito — cai no estado de erro com "tentar de novo".
    // ------------------------------------------------------------
    const cacheCategoria = {}; // preço e peças da categoria, por carregamento da página

    async function baixarCategoria(categoria) {
        if (cacheCategoria[categoria]) return cacheCategoria[categoria];
        const pecas = [];
        let total = null;
        let pagina = 1;
        while (true) {
            const { dados, headers } = await apiGetComMeta(
                `/produtos?categoria=${encodeURIComponent(categoria)}&pagina=${pagina}`,
                { timeout: TEMPO_LIMITE_MS }
            );
            if (total === null && headers.get('X-Resultados-Total')) total = Number(headers.get('X-Resultados-Total'));
            if (!Array.isArray(dados) || dados.length === 0) break;
            pecas.push(...dados);
            if (total !== null && pecas.length >= total) break;
            pagina++;
            if (pagina > 60) break; // trava de segurança: nunca o "praticamente eterno"
        }
        pecas.sort((a, b) => a.PRECO - b.PRECO);
        cacheCategoria[categoria] = pecas;
        return pecas;
    }

    // ------------------------------------------------------------
    // helpers
    // ------------------------------------------------------------
    function escapeHtml(t) { return PCForgeUtil.escapeHtml(t); }
    function preco(t) { return PCForgeUtil.formatarPreco(Number(t) || 0); }
    const Compat = window.pcForgeCompat;

    // chip com a spec-chave da peça (socket, DDR, watts...)
    function chipSpec(peca) {
        const a = Compat.analisar(peca);
        const itens = [];
        if (a.socket) itens.push(a.socket);
        if (a.ddr) itens.push(a.ddr);
        if (a.tdp) itens.push(a.tdp + 'W TDP');
        if (a.watts) itens.push(a.watts + 'W');
        if (a.mm) itens.push('GPU até ' + a.mm + 'mm');
        if (a.comprimento) itens.push(a.comprimento + 'mm');
        if (a.padrao) itens.push(a.padrao);
        if (itens.length === 0) return '<span class="chip-spec chip-nada">sem dados técnicos</span>';
        return itens.map((i) => `<span class="chip-spec">${escapeHtml(i)}</span>`).join('');
    }

    // ------------------------------------------------------------
    // trilha de etapas (nav esquerda)
    // ------------------------------------------------------------
    // ------------------------------------------------------------
    // primeira etapa SEM escolha: tudo depois dela fica trancada
    // (a montagem precisa seguir a ordem certa)
    // ------------------------------------------------------------
    function indicePrimeiroVazio() {
        const i = ETAPAS.findIndex((e) => !escolhas[e.id]);
        return i === -1 ? ETAPAS.length : i;
    }

    function renderEtapas() {
        const nav = document.getElementById('montar-etapas');
        const primeiroVazio = indicePrimeiroVazio();
        const indiceAtual = ETAPAS.findIndex((e) => e.id === etapaAtual);
        nav.innerHTML = ETAPAS.map((etapa, indice) => {
            const escolhida = escolhas[etapa.id];
            const conflito = escolhida && Compat.resumo(escolhas).conflitos.some((c) => c.etapa === etapa.id); // eslint-disable-line
            const trancada = indice > primeiroVazio;
            const classe = ['etapa', etapa.id === etapaAtual ? 'atual' : '', escolhida ? 'feita' : '', conflito ? 'conflito' : '', trancada ? 'trancada' : ''].join(' ');
            const estado = escolhida ? (conflito ? '✕' : '✓') : trancada ? '🔒' : String(indice + 1);
            return `
                <button type="button" class="${classe}" data-id="${etapa.id}" ${trancada ? 'disabled title="escolha as peças anteriores primeiro"' : ''}>
                    <span class="etapa-flag">${estado}</span>
                    <span class="etapa-textos">
                        <strong>${etapa.titulo}</strong>
                        <em>${escolhida ? escapeHtml(escolhida.NOME) : trancada ? '🔒 escolha as anteriores' : etapa.desc}</em>
                    </span>
                </button>`;
        }).join('');

        nav.querySelectorAll('.etapa').forEach((botao) => {
            botao.addEventListener('click', function () {
                if (this.disabled) return;
                etapaAtual = this.dataset.id;
                mostrarIncompativeis = false;
                buscaAtual = '';
                salvarEstado();
                carregarEtapaAtual();
            });
        });
    }

    // ------------------------------------------------------------
    // lista de peças da etapa atual
    // ------------------------------------------------------------
    function etapaPorId(id) { return ETAPAS.find((e) => e.id === etapaAtual) || ETAPAS[0]; }

    let pecasDaEtapa = []; // memoradas pra o handler do campo de busca redesenhar só os cartões

    // redesenha APENAS os cartões (a busca está fora — foco preservado)
    function atualizarCartoes() {
        const etapa = etapaPorId(etapaAtual);
        const escolhida = escolhas[etapa.id];
        const pecas = pecasDaEtapa;

        const cartao = (peca, incompativel) => {
            const teste = Compat.compativel(etapa.id, peca, escolhas);
            const aviso = teste.aviso ? `<span class="peca-aviso">⚠ ${escapeHtml(teste.aviso)}</span>` : '';
            const motivo = teste.motivo ? `<span class="peca-motivo">✕ ${escapeHtml(teste.motivo)}</span>` : '';
            const identica = escolhida && String(escolhida.ID) === String(peca.ID);
            return `
                <button type="button" class="peca${identica ? ' escolhida' : ''}${incompativel ? ' fora' : ''}" data-id="${peca.ID}" ${incompativel ? 'disabled' : ''}>
                    <span class="peca-foto" data-imagem="${urlImagemProduto(peca) || ''}"></span>
                    <span class="peca-info">
                        <strong>${escapeHtml(peca.NOME)}</strong>
                        <span class="peca-lojas">${escapeHtml(peca.LOJA_NOME || '')}</span>
                        ${chipSpec(peca)}
                        ${aviso}${motivo}
                    </span>
                    <span class="peca-preco">${preco(peca.PRECO)}</span>
                </button>`;
        };

        const termo = buscaAtual.trim().toLowerCase();
        const emBusca = (lista) => termo ? lista.filter((p) => p.NOME.toLowerCase().includes(termo)) : lista;
        const cheias = emBusca(pecas.filter((p) => Compat.compativel(etapa.id, p, escolhas).ok));
        const fora = emBusca(pecas.filter((p) => !Compat.compativel(etapa.id, p, escolhas).ok));

        const cont = document.getElementById('lista-pecas');
        if (!cont) return;
        cont.innerHTML = `
            ${cheias.length === 0 && fora.length === 0 ? '<p class="estado-vazio">Nenhum resultado pra esse termo nesta categoria.</p>' : ''}
            ${cheias.map((p) => cartao(p, false)).join('')}
            ${mostrarIncompativeis ? fora.map((p) => cartao(p, true)).join('')
                : fora.length ? `<button type="button" class="ver-incompativeis">mostrar ${fora.length} incompatível(is) ✕</button>` : ''}`;

        // fotos: imagem quando o produto tem, ícone 📦 quando não
        cont.querySelectorAll('.peca-foto').forEach((el) => {
            const url = el.dataset.imagem;
            if (url) {
                const img = document.createElement('img');
                img.src = url;
                img.alt = '';
                img.loading = 'lazy';
                img.addEventListener('error', () => { el.classList.add('sem-foto'); img.remove(); });
                el.appendChild(img);
            } else el.classList.add('sem-foto');
        });

        cont.querySelectorAll('.peca:not(.fora)').forEach((botao) => {
            botao.addEventListener('click', function () {
                const peca = pecas.find((p) => String(p.ID) === String(this.dataset.id));
                if (!peca) return;
                escolhas[etapa.id] = { ID: peca.ID, NOME: peca.NOME, PRECO: peca.PRECO, LOJA_NOME: peca.LOJA_NOME, CATEGORIA: peca.CATEGORIA };
                const indice = ETAPAS.findIndex((e) => e.id === etapa.id);
                if (indice < ETAPAS.length - 1) etapaAtual = ETAPAS[indice + 1].id;
                mostrarIncompativeis = false;
                buscaAtual = '';
                salvarEstado();
                carregarEtapaAtual();
                window.mostrarToast(`${peca.NOME} garantiu o lugar na build.`, 'sucesso');
            });
        });

        const verIncomp = cont.querySelector('.ver-incompativeis');
        if (verIncomp) verIncomp.addEventListener('click', () => { mostrarIncompativeis = true; atualizarCartoes(); });
    }

    function renderLista(pecas) {
        const etapa = etapaPorId(etapaAtual);
        const escolhida = escolhas[etapa.id];
        pecasDaEtapa = pecas;

        document.getElementById('montar-lista').innerHTML = `
            <div class="lista-cabecalho">
                <h2>${etapa.titulo}</h2>
                <p>${escolhida ? '<strong class="chip-escolhida">✓ escolhida:</strong> ' + escapeHtml(escolhida.NOME) : etapa.desc}</p>
                <input id="lista-busca" class="lista-busca" type="search" placeholder="buscar nesta lista..." value="${escapeHtml(buscaAtual)}" aria-label="Buscar peça na lista">
            </div>
            <div class="lista-pecas" id="lista-pecas"></div>
            ${escolhida ? '<a href="#" class="lista-proxima" id="ir-proxima">continuar para a próxima etapa →</a>' : ''}`;

        atualizarCartoes();

        const busca = document.getElementById('lista-busca');
        if (busca) {
            // redesenha SÓ os cartões: o input fica intacto (foco some com innerHTML novo)
            busca.addEventListener('input', function () { buscaAtual = this.value; atualizarCartoes(); });
            busca.addEventListener('keydown', (e) => { if (e.key === 'Enter') e.preventDefault(); });
        }

        const proxima = document.getElementById('ir-proxima');
        if (proxima) {
            proxima.addEventListener('click', (e) => {
                e.preventDefault();
                const indice = ETAPAS.findIndex((x) => x.id === etapaAtual);
                if (indice < ETAPAS.length - 1) {
                    etapaAtual = ETAPAS[indice + 1].id;
                    mostrarIncompativeis = false;
                    salvarEstado();
                    carregarEtapaAtual();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }
    }

    // ------------------------------------------------------------
    // resumo (painel da direita)
    // ------------------------------------------------------------
    function renderResumo() {
        const resumo = Compat.resumo(escolhas) || { consumo: 60, conflitos: [], avisoFonte: null, recomendada: null };
        const chamados = Object.keys(escolhas);

        let total = chamados.reduce((soma, k) => soma + (Number(escolhas[k].PRECO) || 0), 0);
        const montado = modo === 'montada';
        if (montado) total += PRECO_MONTAGEM + FRETE_MONTADO;
        const cliente = (() => { try { return JSON.parse(sessionStorage.getItem('cliente')); } catch { return null; } })();
        const fonteW = escolhas.fonte ? (Compat.analisar(escolhas.fonte).watts || 0) : 0;
        const podeComprar = !!(cliente && cliente.id !== undefined);
        const faltam = ETAPAS.length - chamados.length;

        const consumoBarra = fonteW ? (() => {
            const pct = Math.min(100, Math.round((resumo.consumo / fonteW) * 100));
            return `
                <div class="consumo">
                    <div class="consumo-linha"><span>consumo estimado</span><b>${resumo.consumo}W de ${fonteW}W</b></div>
                    <div class="consumo-trilha"><span class="consumo-preenchimento${pct > 90 || resumo.consumo > fonteW ? ' cheio' : ''}" style="width:${pct}%"></span></div>
                </div>`;
        })() : '';

        const conflitos = [
            ...resumo.conflitos.map((c) => `<li><b>${escapeHtml(ETAPAS.find((e) => e.id === c.etapa).titulo)}:</b> ${escapeHtml(c.motivo)} <span class="conflito-fonte">(${escapeHtml(c.peca)})</span></li>`),
            resumo.avisoFonte ? `<li>⚠ ${escapeHtml(resumo.avisoFonte)}</li>` : ''
        ].filter(Boolean).join('');

        document.getElementById('montar-resumo').innerHTML = `
            <h2>Sua build</h2>
            ${chamados.length === 0 ? '<p class="resumo-vazio">Escolha a placa-mãe pra começar.</p>' : `
            <ul class="resumo-itens">
                ${chamados.map((k) => `
                    <li>
                        <span class="resumo-nome">${escapeHtml(escolhas[k].NOME)}</span>
                        <span class="resumo-preco">${preco(escolhas[k].PRECO)}</span>
                        <button type="button" class="resumo-remover" data-id="${k}" title="Remover">✕</button>
                    </li>
                `).join('')}
            </ul>`}
            ${consumoBarra}
            ${resumo.avisoFonte ? '<p class="resumo-aviso">⚠ ' + escapeHtml(resumo.avisoFonte) + '</p>' : ''}
            ${chamados.length === 0 ? '' : conflitos ? `<ul class="resumo-conflitos">${conflitos}</ul>` : '<p class="resumo-ok">✓ Tudo compatível.</p>'}

            <!-- modalidade: montar sozinho ou levar montado -->
            <div class="resumo-modos" role="group" aria-label="Como você quer receber">
                <button type="button" class="modo-pilula${modo === 'pecas' ? ' ativa' : ''}" data-modo="pecas">
                    Só as peças <em>(eu mesmo monto)</em>
                </button>
                <button type="button" class="modo-pilula${montado ? ' ativa' : ''}" data-modo="montada">
                    Montado na loja <em>(montagem R$ ${PRECO_MONTAGEM.toFixed(2).replace('.', ',')} + frete grátis)</em>
                </button>
            </div>

            <div class="resumo-total">
                <span>total</span><b id="resumo-total-valor">${preco(total)}</b>
                ${montado ? '<em class="modo-nota">montagem R$ 0,10 · instalação do sistema · frete grátis</em>' : ''}
                ${chamados.length > 0 && faltam > 0 ? `<em>faltam ${faltam} etapa(s)</em>` : ''}
            </div>
            <button type="button" class="resumo-carrinho" ${podeComprar && chamados.length > 0 ? '' : 'disabled'}>
                Enviar tudo pro carrinho
            </button>
            ${podeComprar ? '' : '<p class="resumo-aviso">entre com sua conta pra continuar a compra</p>'}
            ${chamados.length ? '<button type="button" class="resumo-limpar">Limpar build</button>' : ''}
        `;

        document.querySelectorAll('.resumo-modos .modo-pilula').forEach((b) => {
            b.addEventListener('click', function () {
                modo = this.dataset.modo === 'montada' ? 'montada' : 'pecas';
                salvarEstado();
                renderResumo();
            });
        });

        // remover uma peça: apaga ela + tudo que vem DEPOIS dela na ordem
        // (escolher mobo nova invalida CPU/RAM antigas — o fluxo volta pra ela)
        document.querySelectorAll('.resumo-remover').forEach((b) => {
            b.addEventListener('click', function () {
                const chave = this.dataset.id;
                const indice = ETAPAS.findIndex((e) => e.id === chave);
                if (indice === -1) { delete escolhas[chave]; }
                else {
                    for (let i = indice; i < ETAPAS.length; i++) delete escolhas[ETAPAS[i].id];
                    etapaAtual = ETAPAS[Math.min(indice, indicePrimeiroVazio())].id;
                }
                mostrarIncompativeis = false;
                salvarEstado();
                renderResumo();
                carregarEtapaAtual();
            });
        });

        const botaoCarrinho = document.querySelector('.resumo-carrinho');
        if (botaoCarrinho && !botaoCarrinho.disabled) {
            botaoCarrinho.addEventListener('click', async function () {
                const itens = chamados.map((k) => escolhas[k]);
                const opcoesDoEnvio = montado
                    ? { grupo: (crypto.randomUUID ? crypto.randomUUID() : 'grupo-' + Date.now() + '-' + Math.floor(Math.random() * 1e9)), montada: true }
                    : {};
                await PCForgeUtil.comEstadoEnviando(botaoCarrinho, async () => {
                    let ok = 0;
                    for (const peca of itens) {
                        try {
                            await window.Carrinho.adicionar(peca, 1, opcoesDoEnvio);
                            ok++;
                            window.mostrarToast(`${peca.NOME} (${ok}/${itens.length}) no carrinho.`, 'sucesso');
                        } catch (erro) {
                            if (erro.sessaoExpirada) return;
                            window.mostrarToast(`Não deu com "${peca.NOME}": ${erro.message}`, 'erro');
                        }
                    }
                    if (montado) {
                        try {
                            const servicos = await baixarCategoria('Serviços');
                            const extras = [
                                servicos.find((s) => s.NOME === 'Serviço de Montagem'),
                                servicos.find((s) => s.NOME === 'Frete do PC Montado')
                            ].filter(Boolean);
                            for (const extra of extras) {
                                await window.Carrinho.adicionar(extra, 1, opcoesDoEnvio);
                            }
                            if (extras.length) {
                                window.mostrarToast('Serviço de montagem acertado — frete grátis, sistema já instalado. 🔧', 'sucesso');
                            }
                        } catch (erro) {
                            if (!erro.sessaoExpirada) window.mostrarToast(`Montagem não reservada: ${erro.message}`, 'erro');
                        }
                    }

                    // fim do fluxo: pêndulo de sucesso + estado zerado pra começar outra
                    if (ok > 0 || itens.length === 0) {
                        escolhas = {}; etapaAtual = ETAPAS[0].id; buscaAtual = '';
                        mostrarIncompativeis = false;
                        salvarEstado();
                        renderEtapas(); renderResumo();
                        try { sessionStorage.removeItem('carrinho_qtd'); } catch { /* só cache */ }
                        await Carrinho.atualizarContador();
                        document.getElementById('montar-lista').innerHTML = `
                            <div class="montagem-enviada">
                                <span class="enviada-flag">✓</span>
                                <h2>Montagem organizada!</h2>
                                <p>Suas peças já estão no carrinho${montado ? ' — e a loja vai montar tudo pra você: teste, cabeamento e sistema instalado' : ''}. Falta só o endereço e o pagamento.</p>
                                <div class="enviada-acoes">
                                    <a href="carrinho.html" class="botao-solido">Concluir a compra</a>
                                    <button type="button" class="botao-fantasma montar-outro">Montar outro PC</button>
                                </div>
                            </div>`;
                        document.querySelector('.montar-outro').addEventListener('click', () => {
                            escolhas = {}; etapaAtual = ETAPAS[0].id;
                            salvarEstado();
                            renderTudo();
                            carregarEtapaAtual();
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                });
            });
        }

        const limpar = document.querySelector('.resumo-limpar');
        if (limpar) limpar.addEventListener('click', async function () {
            const ok = await PCForgeUtil.confirmar('Limpar a build inteira?');
            if (!ok) return;
            escolhas = {}; etapaAtual = ETAPAS[0].id;
            salvarEstado(); renderTudo();
        });
    }

    // ------------------------------------------------------------
    // ciclo completo
    // ------------------------------------------------------------
    function renderTudo() { renderEtapas(); renderResumo(); }

    async function carregarEtapaAtual() {
        const etapa = etapaPorId(etapaAtual);
        try {
            let pecas = await baixarCategoria(etapa.categoria);
            if (etapa.id === 'cooler') {
                // coolers vivem em "Refrigeração" (torres/waters) e em
                // "Acessórios" (Box Intel etc.): unimos os dois grupos
                const outros = await baixarCategoria('Acessórios');
                pecas = [
                    ...outros.filter((p) => /cool(er)?\s?box|cool(er)?\s?cpu|torre|water\s?cool/.test(p.NOME.toLowerCase())),
                    ...pecas
                ];
                // dedup por nome (alguns existem nas duas categorias)
                const vistos = new Set();
                pecas = pecas.filter((p) => !vistos.has(p.NOME.toLowerCase()) && vistos.add(p.NOME.toLowerCase()));
            }
            renderEtapas(); renderResumo(); renderLista(pecas);
        } catch (erro) {
            if (erro.sessaoExpirada) return;
            //Nunca deixar o "carregando..." pendente: qualquer falha dá
            // um estado claro com botão de tentar de novo.
            const lista = document.getElementById('montar-lista');
            if (!lista) return;
            lista.innerHTML = `
                <div class="estado-erro-carga">
                    <p class="estado-vazio">Não deu pra carregar ${escapeHtml(etapa.titulo)} agora${erro.rede ? ' — a API parece estar fora do ar' : ' — tente de novo em instantes'}.</p>
                    <button type="button" class="ver-incompativeis botao-retentar">↻ Tentar de novo</button>
                </div>`;
            lista.querySelector('.botao-retentar').addEventListener('click', function () {
                lista.innerHTML = '<p class="estado-carregando">Preparando o catálogo...</p>';
                carregarEtapaAtual();
            });
        }
    }

    lerEstado();

    // Eliminada a barra de kits na página, o arranque fica
    // apenas com o wizard normal.
    try {
        renderTudo();
        carregarEtapaAtual();
    } catch (erro) {
        // se algo quebrar antes mesmo da primeira carga, a queda de lista já
        // nem acontece: mostra o problema no lugar da lista com o "tentar de novo"
        console.error('[montar] erro no arranque:', erro);
        const lista = document.getElementById('montar-lista');
        if (lista) {
            lista.innerHTML = `
                <div class="estado-erro-carga">
                    <p class="estado-vazio">Algo travou na montagem (${escapeHtml(erro.message)}).</p>
                    <button type="button" class="ver-incompativeis botao-retentar">↻ Tentar de novo</button>
                </div>`;
            lista.querySelector('.botao-retentar').addEventListener('click', () => window.location.reload());
        }
    }

    // voltar de outra aba mudando a sessão: remonta
    window.addEventListener('beforeunload', salvarEstado);
})();
