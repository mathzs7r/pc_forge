// ============================================================
// KITS DE UPGRADE — presets "da casa" que pré-selecionam peças
// reais do catálogo no "Monte seu PC" (sem banco, sem backend):
//
//   * Upgrade Básico        -> LGA1700 de entrada (H610M + i3 + 16GB DDR4)
//   * Upgrade Force         -> AM5 + RTX 4060 + SSD + fonte (plataforma nova)
//   * O Melhor da Forja     -> topo completo (X670E + Ryzen 9 + RTX 4090 + ...)
//
// Como funciona: cada peça do kit tem um TERMO de busca (vai como
// nome= na API) e uma REGEX pra confirmar o casamento. Ganha a versão
// MAIS BARATA daquele termo — o catálogo tem duplicatas "Edição Max/Plus"
// mais caras. Peça que não resolver esconde o kit inteiro (nunca mostra
// kit pela metade).
//
// Nada é vendido como "kit fechado": é atalho de configuração, o cliente
// troca o que quiser antes de enviar pro carrinho.
// ============================================================
window.PCForgeKits = (function () {

    // Mesma ordem das ETAPAS do montar.js (a build precisa ser um bloco
    // contínuo desde a placa-mãe; todos os kits abaixo são contíguos).
    const ORDEM = ['placa-mae', 'processador', 'memoria', 'gpu', 'armazenamento', 'fonte', 'cooler', 'gabinete', 'so'];

    const CATEGORIA_POR_ETAPA = {
        'placa-mae': 'Placas-mãe',
        'processador': 'Processadores',
        'memoria': 'Memória RAM',
        'gpu': 'Placas de Vídeo',
        'armazenamento': 'Armazenamento',
        'fonte': 'Fontes',
        'cooler': 'Refrigeração',
        'gabinete': 'Gabinetes',
        'so': 'Sistemas Operacionais' // categoria escondida na vitrine, mas consultável por categoria (igual o montar.js faz)
    };

    // termo = vai como ?nome= na API (busca por parte do nome, LIKE).
    // regex = confirma o casamento; com ela dá pra distinguir
    // "RTX 4060 8GB" de "RTX 4060 Ti 16GB", por exemplo.
    const KITS = [
        {
            id: 'basico',
            icone: '🧱',
            nome: 'Upgrade Básico',
            tagline: 'Sai do PC antigo pra uma plataforma LGA1700 completa por pouco.',
            pecas: [
                { etapa: 'placa-mae', termo: 'H610M', regex: /h610m/i },
                { etapa: 'processador', termo: 'i3-12100F', regex: /i3-12100f/i },
                { etapa: 'memoria', termo: '16GB (2x8) DDR4', regex: /16gb \(2x8\) ddr4/i }
            ]
        },
        {
            id: 'force',
            icone: '⚡',
            nome: 'Upgrade Force',
            tagline: 'Plataforma AM5 zerada: RTX 4060, SSD NVMe e fonte 650W.',
            pecas: [
                { etapa: 'placa-mae', termo: 'B650M', regex: /b650m/i },
                { etapa: 'processador', termo: 'Ryzen 5 7600X', regex: /ryzen 5 7600/i },
                { etapa: 'memoria', termo: '16GB DDR5', regex: /16gb ddr5/i },
                { etapa: 'gpu', termo: 'RTX 4060', regex: /rtx 4060 8gb/i },
                { etapa: 'armazenamento', termo: 'SSD NVMe 1TB', regex: /ssd nvme 1tb/i },
                { etapa: 'fonte', termo: '650W', regex: /650w/i }
            ]
        },
        {
            id: 'forja',
            icone: '🔨',
            nome: 'O Melhor Upgrade da Forja',
            tagline: 'O topo da forja: RTX 4090, Ryzen 9 e tudo em dia — Windows 10 inclusa.',
            pecas: [
                { etapa: 'placa-mae', termo: 'X670E', regex: /x670e/i },
                { etapa: 'processador', termo: 'Ryzen 9 7950X', regex: /ryzen 9 7950x/i },
                { etapa: 'memoria', termo: '64GB DDR5', regex: /64gb ddr5/i },
                { etapa: 'gpu', termo: 'RTX 4090', regex: /rtx 4090 24gb/i },
                { etapa: 'armazenamento', termo: 'SSD NVMe 2TB Gen4', regex: /2tb gen4/i },
                { etapa: 'fonte', termo: '1200W', regex: /1200w/i },
                { etapa: 'cooler', termo: 'Water Cooler 360mm', regex: /water cooler 360mm/i },
                { etapa: 'gabinete', termo: 'Full Tower E-ATX', regex: /full tower e-atx/i },
                { etapa: 'so', termo: 'Windows 10', regex: /windows 10/i }
            ]
        }
    ];

    function escapeHtml(texto) {
        return String(texto ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function preco(valor) {
        return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // ------------------------------------------------------------
    // resolução de peças
    // ------------------------------------------------------------
    const cacheBusca = new Map(); // `${categoria}®${termo}` -> Promise<peca|null>

    function escolherMaisBarato(lista, regex) {
        // SEM fallback: se a regex não casar com nada da categoria,
        // devolvemos null (o kit fica indisponível na hora certa) — nunca
        // escolhemos "a peça mais barata qualquer", senão um kit da RTX
        // 4090 sairia com fonte de 600W só por ser a menor da categoria.
        const achados = lista.filter((p) => p && p.NOME && regex.test(p.NOME));
        if (achados.length === 0) return null;
        achados.sort((a, b) => Number(a.PRECO) - Number(b.PRECO));
        return achados[0];
    }

    // Devolve Promise<peca|null>. null = termo não achou nada (kit indisponível).
    function buscarPeca(etapa, termo, regex) {
        const categoria = CATEGORIA_POR_ETAPA[etapa];
        const chave = `${categoria}®${termo}`;
        if (!cacheBusca.has(chave)) {
            let promessa;
            if (typeof estaEmModoDemo === 'function' && estaEmModoDemo()) {
                // mesmo filtro dos produtos, mas feito no navegador
                promessa = Promise.resolve(escolherMaisBarato(PRODUTOS_DEMO, regex));
            } else {
                const caminho = `/produtos?nome=${encodeURIComponent(termo)}`
                    + `&categoria=${encodeURIComponent(categoria)}&ordem=menor_preco&pagina=1`;
                promessa = apiGet(caminho)
                    .then((lista) => escolherMaisBarato(Array.isArray(lista) ? lista : [], regex))
                    .catch(() => {
                        cacheBusca.delete(chave); // falha não fica presa no cache
                        return null;
                    });
            }
            cacheBusca.set(chave, promessa);
        }
        return cacheBusca.get(chave);
    }

    // Resolve TODAS as peças de um kit. Devolve { kit, pecas } onde pecas[etapa]
    // é o produto (ou null se faltou algo) — quem aplica decide se pode.
    async function resolverKit(kit) {
        const pares = await Promise.all(kit.pecas.map(async (part) => ({
            etapa: part.etapa,
            peca: await buscarPeca(part.etapa, part.termo, part.regex)
        })));
        const pecas = {};
        for (const par of pares) pecas[par.etapa] = par.peca;
        return { kit, pecas };
    }

    async function resolverKitPorId(idKit) {
        const kit = KITS.find((k) => k.id === idKit);
        if (!kit) return null;
        return resolverKit(kit);
    }

    // nº de peças e total de um kit JÁ resolvido (pra exibir nos cards do montar)
    function contarKit(resolvido) {
        const pecas = (resolvido && resolvido.pecas) || {};
        let qtd = 0, soma = 0;
        for (const valor of Object.values(pecas)) {
            if (!valor) continue;
            qtd += 1;
            soma += Number(valor.PRECO) || 0;
        }
        return { qtd, total: soma };
    }

    return { KITS, ORDEM, resolverKit, resolverKitPorId, contarKit, escapeHtml, preco };
})();
