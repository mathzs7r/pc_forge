const TIPOS_PERMITIDOS = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const TAMANHO_MAX = 5 * 1024 * 1024; // 5 MB

/**
 * Lê uma imagem enviada em base64 (data URL ou só o base64 puro).
 * Retorna { buffer, tipo } ou lança erro com .status e .message.
 */
function lerImagem(entrada) {
    if (!entrada) {
        const e = new Error('Nenhuma imagem enviada.');
        e.status = 400;
        throw e;
    }

    let tipo = 'image/jpeg';
    let base64 = String(entrada).trim();

    const match = base64.match(/^data:([\w/+.-]+);base64,(.+)$/i);
    if (match) {
        tipo = match[1].toLowerCase();
        base64 = match[2];
    }

    if (!TIPOS_PERMITIDOS.has(tipo)) {
        const e = new Error('Formato de imagem não suportado. Use JPG, PNG, WEBP ou GIF.');
        e.status = 400;
        throw e;
    }

    let buffer;
    try {
        buffer = Buffer.from(base64, 'base64');
    } catch {
        const e = new Error('Imagem inválida (base64 corrompido).');
        e.status = 400;
        throw e;
    }

    if (!buffer.length) {
        const e = new Error('Imagem vazia.');
        e.status = 400;
        throw e;
    }
    if (buffer.length > TAMANHO_MAX) {
        const e = new Error('A foto é grande demais. Máximo 5 MB.');
        e.status = 413;
        throw e;
    }

    return { buffer, tipo };
}

module.exports = { lerImagem, TIPOS_PERMITIDOS, TAMANHO_MAX };
