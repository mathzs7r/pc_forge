// Rate limit simples, em memória, pra proteger as rotas de LOGIN contra
// força bruta (alguém tentando milhares de senhas contra um e-mail).
//
// Por quê feito à mão: o projeto evita dependências extras (o próprio
// token de sessão é HMAC à mão em utils/auth.js). Pra um portfólio isso
// resolve; se um dia virar produção real de verdade, troque por
// "express-rate-limit" com um store compartilhado (Redis).
//
// Como funciona: uma janela deslizante por IP. Cada tentativa guarda um
// carimbo de tempo; se as últimas JANELA_SEGUNDOS contam mais que MAXIMO,
// a requisição recebe 429 e nem chega na rota. A memória é limpa
// periodicamente pra não crescer pra sempre.
const JANELA_SEGUNDOS = 15 * 60; // 15 minutos
const MAXIMO = 20;               // até 20 tentativas de login por IP a cada 15 min

// Chave -> array de timestamps (ms). Chave = método:ip.
const registros = new Map();

// IPs atrás de um proxy (que é o caso comum em publicação) chegam aqui;
// o Express preenche req.ip com o cliente REAL quando se confia no proxy.
function chaveDaRequisicao(req) {
    return `${req.method}:${req.ip}`;
}

// Devolve o middleware. Use UMA instância por proteção que você quiser
// (cada login merece sua própria contagem, então criamos uma nova aqui).
function limitarTentativas({ maximo = MAXIMO, janelaSegundos = JANELA_SEGUNDOS } = {}) {
    const limpeza = setInterval(() => {
        const agora = Date.now();
        for (const [chave, carimbos] of registros) {
            const vivos = carimbos.filter((t) => agora - t < janelaSegundos * 1000);
            if (vivos.length === 0) registros.delete(chave);
            else registros.set(chave, vivos);
        }
    }, 10 * 60 * 1000); // a cada 10 min
    // Em modo de teste/dev (nodemon reinicia muito) o timer não segura o processo.
    limpeza.unref?.();

    return function limitador(req, res, next) {
        const agora = Date.now();
        const chave = chaveDaRequisicao(req);
        const carimbos = (registros.get(chave) || []).filter(
            (t) => agora - t < janelaSegundos * 1000
        );

        if (carimbos.length >= maximo) {
            // 429 = "Too Many Requests"
            return res.status(429).json({
                resposta: 'Muitas tentativas seguidas. Espere alguns minutos e tente de novo.'
            });
        }

        carimbos.push(agora);
        registros.set(chave, carimbos);
        next();
    };
}

module.exports = { limitarTentativas };
