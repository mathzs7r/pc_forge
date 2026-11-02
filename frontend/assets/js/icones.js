// ============================================================
// icones.js — ícones SVG inline do site (no lugar dos emojis)
//
// Uso:  window.PCForgeIcones.svg('processadores')
//       window.PCForgeIcones.categoria('Placas de Vídeo')
// Devolvem uma string SVG pronta pra entrar no innerHTML.
// Todos usam currentColor e viewBox 24px, então herdam a cor
// e o tamanho do CSS (font-size ou width/height no wrapper).
// ============================================================
window.PCForgeIcones = (function () {
    const caminhos = {
        processadores:
            '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>',
        'placas de video':
            '<path d="M3 9h18v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9z"/><path d="M6 5h12c2 0 3 1.5 3 4H3c0-2.5 1-4 3-4z"/><circle cx="8.5" cy="14" r="1.8"/><circle cx="14.5" cy="14" r="1.8"/>',
        'memória ram':
            '<rect x="4" y="6" width="16" height="11" rx="1.5"/><path d="M8 17v3M12 17v3M16 17v3M8 9.5v4M12 9.5v4M16 9.5v4"/>',
        armazenamento:
            '<rect x="6" y="3.5" width="12" height="17" rx="2"/><circle cx="12" cy="17" r="1.4"/><path d="M9 6.5h6"/>',
        'placas-mãe':
            '<rect x="4" y="4" width="16" height="16" rx="1.5"/><rect x="8" y="8" width="6" height="6"/><path d="M16.5 8v2M16.5 12v2M4 17h3M9 20v-2"/>',
        fontes:
            '<path d="M13 3L5 13h6l-1 8 8-11h-6l1-7z" stroke-linejoin="round"/>',
        periféricos:
            '<rect x="4" y="6" width="16" height="9" rx="1.5"/><path d="M8 18h8M12 15v3M7 9.5h2M11 9.5h2M15 9.5h2M7 12h2M11 12h2M15 12h2"/>',
        acessórios:
            '<path d="M4 13a8 8 0 0 1 16 0"/><rect x="3" y="13" width="4" height="6" rx="1.5"/><rect x="17" y="13" width="4" height="6" rx="1.5"/><path d="M19 19c0 2-2 2.6-5 2.6"/>',
        gabinetes:
            '<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="8.5" cy="6.5" r="0.9"/><path d="M8 10h8M8 13h8M8 16h5"/>',
        refrigeração:
            '<circle cx="12" cy="12" r="2"/><path d="M12 10c0-4 2-6 4-7 0 4-2 6-4 7zM14 12c4 0 6 2 7 4-4 0-6-2-7-4zM12 14c0 4-2 6-4 7 0-4 2-6 4-7zM10 12c-4 0-6-2-7-4 4 0 6 2 7 4z"/>',
        sistemas:
            '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/>',
        serviços:
            '<path d="M14.5 6.5a4 4 0 0 1 5.2 5.2l-8.5 8.5a2 2 0 0 1-2.8 0l-1.6-1.6a2 2 0 0 1 0-2.8l7.7-9.3z"/><path d="M9 15l6-6"/>',
        default:
            '<rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 20v-2h6v2M8 8h8M8 11h8"/>',
        todas:
            '<path d="M4 6h16M4 12h16M4 18h10"/>',
        ok:
            '<path d="M20 6.5L9.5 17 4 11.5"/>',
        x:
            '<path d="M6 6l12 12M18 6L6 18"/>',
        caminhao:
            '<path d="M2 7h12v9H4a2 2 0 0 1-2-2V7z"/><path d="M14 10h4l3 3.5V16h-7z"/><circle cx="7" cy="18" r="1.7"/><circle cx="17" cy="18" r="1.7"/>',
        fogo:
            '<path d="M12 21c4 0 6.5-2.6 6.5-6 0-4.4-4-5.4-3.4-10.4C11.4 6 9.9 8.6 9.9 11c-1.2-.6-1.9-1.9-1.7-3.6C6 9 5.5 11.5 5.5 15c0 3.4 2.5 6 6.5 6z" stroke-linejoin="round"/>',
        coracao:
            '<path d="M12 20.3C7 16.6 3.5 13.5 3.5 9.6 3.5 7 5.6 5 8.1 5c1.6 0 3 .8 3.9 2.1C12.9 5.8 14.3 5 15.9 5c2.5 0 4.6 2 4.6 4.6 0 3.9-3.5 7-8.5 10.7z" stroke-linejoin="round"/>',
        coracao_cheio:
            '<path d="M12 20.3C7 16.6 3.5 13.5 3.5 9.6 3.5 7 5.6 5 8.1 5c1.6 0 3 .8 3.9 2.1C12.9 5.8 14.3 5 15.9 5c2.5 0 4.6 2 4.6 4.6 0 3.9-3.5 7-8.5 10.7z" stroke-linejoin="round" fill="currentColor"/>',
        olho:
            '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
        olho_fechado:
            '<path d="M3 3l18 18"/><path d="M10.6 5.7A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.5 3.2M6.6 7A16.6 16.6 0 0 0 2.5 12S6 18.5 12 18.5a9 9 0 0 0 3.4-.7"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
        cadeado:
            '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
        aviso:
            '<path d="M12 4L2.8 19.5a1.2 1.2 0 0 0 1 1.8h16.4a1.2 1.2 0 0 0 1-1.8L12 4z" stroke-linejoin="round"/><path d="M12 10v4.5"/>',
        caixa:
            '<path d="M3 7l9-4 9 4v10l-9 4-9-4V7z"/><path d="M3 7l9 4 9-4M12 11v9"/>',
        seta:
            '<path d="M5 12h14M13 6l6 6-6 6"/>'
    };

    function svg(nome, classe) {
        const caminho = caminhos[nome] || caminhos.default;
        const cls = classe ? ` ${classe}` : '';
        return `<svg class="icone-svg${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true">${caminho}</svg>`;
    }

    // Aceita o nome da categoria vindo do banco e devolve o SVG correspondente.
    const CHAVES = {
        'processadores': 'processadores',
        'placas de vídeo': 'placas de video',
        'placas de video': 'placas de video',
        'memória ram': 'memória ram',
        'memoria ram': 'memória ram',
        'armazenamento': 'armazenamento',
        'placas-mãe': 'placas-mãe',
        'placas-mae': 'placas-mãe',
        'fontes': 'fontes',
        'periféricos': 'periféricos',
        'perifericos': 'periféricos',
        'acessórios': 'acessórios',
        'acessorios': 'acessórios',
        'gabinetes': 'gabinetes',
        'refrigeração': 'refrigeração',
        'refrigeracao': 'refrigeração',
        'sistemas operacionais': 'sistemas',
        'serviços': 'serviços',
        'servicos': 'serviços'
    };

    function categoria(nomeCategoria) {
        return svg(CHAVES[(nomeCategoria || '').toLowerCase()] || 'default');
    }

    function icone(nome) {
        return svg(CHAVES[nome] || nome);
    }

    return { svg, categoria, icone };
})();
