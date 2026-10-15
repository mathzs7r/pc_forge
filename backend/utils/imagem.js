// Valida e converte a foto de produto que chega da tela (ou do RapidAPI).
//
// A foto chega como texto base64 dentro do JSON, por exemplo:
//    "data:image/jpeg;base64,/9j/4AAQSkZJRg..."   (formato do FileReader/canvas)
//    "/9j/4AAQSkZJRg..."                          (só o base64 puro também vale)
// Aqui ela vira um Buffer (bytes de verdade) — é isso que vai pra coluna BLOB.
//
// O tipo da imagem NÃO é confiado no que o cliente diz: a gente olha os
// primeiros bytes do arquivo ("assinatura"/magic bytes). Assim ninguém
// consegue guardar um .html ou .exe fingindo ser "image/png". SVG fica de
// fora de propósito: ele pode carregar JavaScript.

const LIMITE_BYTES = 5 * 1024 * 1024; // 5 MB depois de decodificado

function detectarTipo(buf) {
    if (buf.length >= 3 && buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) {
        return 'image/jpeg';
    }
    if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) {
        return 'image/png';
    }
    if (buf.length >= 6) {
        const cabecalho = buf.subarray(0, 6).toString('latin1');
        if (cabecalho === 'GIF87a' || cabecalho === 'GIF89a') return 'image/gif';
    }
    if (buf.length >= 12 &&
        buf.subarray(0, 4).toString('latin1') === 'RIFF' &&
        buf.subarray(8, 12).toString('latin1') === 'WEBP') {
        return 'image/webp';
    }
    return null;
}

function erroImagem(mensagem, status = 400) {
    const erro = new Error(mensagem);
    erro.status = status;
    erro.deImagem = true;
    return erro;
}

// Devolve { buffer, tipo } ou lança um erro com .status (400/413) e uma
// mensagem pronta pra mostrar pro usuário.
function lerImagem(entrada) {
    if (typeof entrada !== 'string' || entrada.trim() === '') {
        throw erroImagem('Foto inválida.');
    }

    let base64 = entrada.trim();
    const dataUrl = /^data:[^;,]+;base64,/i.exec(base64);
    if (dataUrl) base64 = base64.slice(dataUrl[0].length);
    base64 = base64.replace(/\s/g, '');

    if (base64 === '' || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) {
        throw erroImagem('A foto não veio em base64 válido.');
    }

    // Confere o tamanho ANTES de decodificar (base64 ocupa 4 letras a cada 3 bytes).
    const tamanhoEstimado = Math.floor(base64.length * 3 / 4);
    if (tamanhoEstimado > LIMITE_BYTES) {
        throw erroImagem(`A foto é grande demais (máximo ${LIMITE_BYTES / 1024 / 1024} MB).`, 413);
    }

    const buffer = Buffer.from(base64, 'base64');
    if (buffer.length === 0) {
        throw erroImagem('A foto veio vazia.');
    }

    const tipo = detectarTipo(buffer);
    if (!tipo) {
        throw erroImagem('Formato de foto não suportado. Use JPG, PNG, WEBP ou GIF.');
    }

    return { buffer, tipo };
}

module.exports = { lerImagem, detectarTipo, LIMITE_BYTES };
