// ============================================================
// imagem.js — prepara a foto do produto antes de mandar pra API.
//
// Foto de celular costuma ter 3–8 MB. Mandar isso cru encheria o banco
// (a foto vira BLOB lá dentro) e deixaria a vitrine lenta. Então, antes
// de enviar, a foto é reduzida aqui mesmo no navegador (lado maior até
// 1200 px, JPEG) — vira algo em torno de 100–400 KB e a qualidade
// continua ótima pra um card de produto.
//
// Uso:
//   const dataUrl = await prepararImagemParaUpload(arquivoDoInputFile);
//   // dataUrl = "data:image/jpeg;base64,...."  -> vai no campo "imagem" da API
// ============================================================
const FORMATOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const LIMITE_ARQUIVO_ORIGINAL = 15 * 1024 * 1024; // recusa fotos de mais de 15 MB já na escolha
const LIMITE_API = 5 * 1024 * 1024;                // o mesmo limite da API
const LIMITE_SEM_REDUZIR = 400 * 1024;             // fotos já pequenas seguem como estão
const LADO_MAXIMO = 1200;                          // px
const TAMANHO_ALVO_BASE64 = 1_500_000;             // ~1,1 MB de imagem

function lerArquivoComoDataUrl(arquivo) {
    return new Promise((resolve, reject) => {
        const leitor = new FileReader();
        leitor.onload = () => resolve(leitor.result);
        leitor.onerror = () => reject(new Error('Não consegui ler esse arquivo.'));
        leitor.readAsDataURL(arquivo);
    });
}

function abrirImagem(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Não consegui abrir essa imagem. Tente outra (JPG, PNG, WEBP ou GIF).'));
        img.src = src;
    });
}

async function prepararImagemParaUpload(arquivo) {
    if (!FORMATOS_ACEITOS.includes(arquivo.type)) {
        throw new Error('Formato não suportado. Use JPG, PNG, WEBP ou GIF.');
    }
    if (arquivo.size > LIMITE_ARQUIVO_ORIGINAL) {
        throw new Error('Essa foto é muito grande (mais de 15 MB). Escolha uma menor.');
    }

    const original = await lerArquivoComoDataUrl(arquivo);

    // Já é pequena: manda como está (e GIFs pequenos mantêm a animação).
    if (arquivo.size <= LIMITE_SEM_REDUZIR) return original;

    const img = await abrirImagem(original);
    const escala = Math.min(1, LADO_MAXIMO / Math.max(img.naturalWidth, img.naturalHeight));
    const largura = Math.max(1, Math.round(img.naturalWidth * escala));
    const altura = Math.max(1, Math.round(img.naturalHeight * escala));

    const canvas = document.createElement('canvas');
    canvas.width = largura;
    canvas.height = altura;
    const ctx = canvas.getContext('2d');
    // Fundo branco: PNG com transparência viraria preto ao converter pra JPEG.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, largura, altura);
    ctx.drawImage(img, 0, 0, largura, altura);

    let qualidade = 0.85;
    let reduzida = canvas.toDataURL('image/jpeg', qualidade);
    while (reduzida.length > TAMANHO_ALVO_BASE64 && qualidade > 0.45) {
        qualidade -= 0.1;
        reduzida = canvas.toDataURL('image/jpeg', qualidade);
    }

    // Raro: a "reduzida" ficou maior que a original (imagem já bem comprimida).
    if (reduzida.length >= original.length && arquivo.size <= LIMITE_API) return original;

    return reduzida;
}
