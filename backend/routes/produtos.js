const express = require('express');
const pool = require('../db');
const { responderErro } = require('../utils/erros');
const { lerToken } = require('../utils/auth');
const { lerImagem } = require('../utils/imagem');

const router = express.Router();

// A foto do produto fica no próprio banco, na coluna PRODUTO.IMAGEM (MEDIUMBLOB,
// até 16 MB) junto com PRODUTO.IMAGEM_TIPO (ex: "image/jpeg").
//
// As LISTAS de produto nunca trazem os bytes da foto (ficariam enormes e o
// JSON não carrega binário). Elas trazem só:
//   TEM_IMAGEM  -> 1 se o produto tem foto, 0 se não tem
//   IMG_VERSAO  -> carimbo da última alteração; o front usa na URL da foto
//                  (?v=...) pra o navegador buscar a foto nova depois de uma troca
// e a foto em si é buscada em GET /produtos/:id/imagem.

// Resposta com erro de validação da foto (400 formato / 413 grande demais).
function responderErroImagem(res, erro) {
    return res.status(erro.status || 400).json({ resposta: erro.message });
}

// ------------------------------------------------------------
// LISTAR PRODUTOS (vitrine pública, não exige login)
// Opcional: GET /produtos?loja=3 mostra só os produtos daquela loja
// (é o que a página pública da loja usa).
// ------------------------------------------------------------
router.get('/produtos', async (req, res) => {
    const filtrarLoja = req.query.loja !== undefined;
    const idLoja = Number(req.query.loja);
    if (filtrarLoja && (!Number.isInteger(idLoja) || idLoja <= 0)) {
        return res.status(400).json({ resposta: 'Loja inválida.' });
    }

    // ----- Filtros -----
    // Busca por nome: ?nome=rtx  (procura em qualquer parte do nome)
    const nome = typeof req.query.nome === 'string' ? req.query.nome.trim() : '';

    // Ordenação por preço: ?ordem=menor_preco | maior_preco
    // (whitelist: nunca monta ORDER BY com texto que veio do usuário)
    const ordensPermitidas = {
        'menor_preco': 'P.PRECO ASC',
        'maior_preco': 'P.PRECO DESC'
    };
    const ordem = ordensPermitidas[req.query.ordem] || 'P.ID DESC';

    // Filtro por categoria: ?categoria=processador
    const categoria = typeof req.query.categoria === 'string' ? req.query.categoria.trim() : '';

    // Faixa de preço: ?preco_min=200&preco_max=700 (um dos dois é suficiente)
    const precoMin = req.query.preco_min !== undefined && req.query.preco_min !== '' ? Number(req.query.preco_min) : null;
    const precoMax = req.query.preco_max !== undefined && req.query.preco_max !== '' ? Number(req.query.preco_max) : null;
    if ((precoMin !== null && !Number.isFinite(precoMin)) || precoMin < 0) {
        return res.status(400).json({ resposta: 'Preço mínimo inválido.' });
    }
    if ((precoMax !== null && !Number.isFinite(precoMax)) || precoMax < 0) {
        return res.status(400).json({ resposta: 'Preço máximo inválido.' });
    }
    if (precoMin !== null && precoMax !== null && precoMin > precoMax) {
        return res.status(400).json({ resposta: 'O preço mínimo não pode ser maior que o máximo.' });
    }

    // Paginação: ?pagina=1 (padrão) traz os LIMITE primeiros,
    // ?pagina=2 traz do (LIMITE+1)º ao 2*LIMITEº produto, e assim por diante.
    const LIMITE = 10;
    const pagina = req.query.pagina !== undefined && req.query.pagina !== '' ? Number(req.query.pagina) : 1;
    if (!Number.isInteger(pagina) || pagina < 1) {
        return res.status(400).json({ resposta: 'Página inválida (use 1, 2, 3...).' });
    }
    const offset = (pagina - 1) * LIMITE;

    // Monta o WHERE com os filtros que vieram na URL
    const condicoes = ['P.ATIVO = 1'];
    const parametros = [];

    if (filtrarLoja) {
        condicoes.push('P.ID_LOJA = ?');
        parametros.push(idLoja);
    }
    if (nome) {
        condicoes.push('P.NOME LIKE ?');
        parametros.push(`%${nome}%`);
    }
    if (categoria) {
        condicoes.push('P.CATEGORIA = ?');
        parametros.push(categoria);
    }
    if (precoMin !== null) {
        condicoes.push('P.PRECO >= ?');
        parametros.push(precoMin);
    }
    if (precoMax !== null) {
        condicoes.push('P.PRECO <= ?');
        parametros.push(precoMax);
    }

    try {
        // Total de produtos que os filtros acham (sem LIMIT/OFFSET), pra o
        // frontend exibir "X resultados" igual ao Mercado Livre. Vai no header
        // X-Resultados-Total pra não mudar o formato da resposta (lista).
        const [total] = await pool.query(
            `SELECT COUNT(*) AS TOTAL
             FROM PRODUTO P
             JOIN LOJA L ON L.ID = P.ID_LOJA
             WHERE ${condicoes.join(' AND ')}`,
            parametros
        );
        res.set('X-Resultados-Total', String(total[0].TOTAL));

        const [linhas] = await pool.query(
            `SELECT P.ID, P.NOME, P.DESCRICAO, P.CATEGORIA, P.PRECO, P.CAMINHO_IMG,
                    (P.IMAGEM IS NOT NULL) AS TEM_IMAGEM,
                    UNIX_TIMESTAMP(P.ATUALIZADO_EM) AS IMG_VERSAO,
                    P.IMAGEM_URL,
                    P.ID_LOJA,
                    L.NOME AS LOJA_NOME
             FROM PRODUTO P
             JOIN LOJA L ON L.ID = P.ID_LOJA
             WHERE ${condicoes.join(' AND ')}
             ORDER BY ${ordem}
             LIMIT ${LIMITE} OFFSET ${offset}`,
            parametros
        );
        res.json(linhas);
    } catch (error) {
        responderErro(res, error, 'GET /produtos');
    }
});

// ------------------------------------------------------------
// CATEGORIAS EXISTENTES (chips do filtro no front)
// Sem duplicar: os produtos não são enviados, só os nomes únicos.
// ------------------------------------------------------------
router.get('/produtos/categorias', async (req, res) => {
    try {
        const filtrarLoja = req.query.loja !== undefined;
        const idLoja = Number(req.query.loja);
        const parametros = filtrarLoja ? [idLoja] : [];
        const [linhas] = await pool.query(
            `SELECT DISTINCT CATEGORIA FROM PRODUTO
             WHERE ATIVO = 1${filtrarLoja ? ' AND ID_LOJA = ?' : ''}
             ORDER BY CATEGORIA`,
            parametros
        );
        res.json(linhas.map((linha) => linha.CATEGORIA));
    } catch (error) {
        responderErro(res, error, 'GET /produtos/categorias');
    }
});

// ------------------------------------------------------------
// DETALHE DO PRODUTO (página do produto, estilo Mercado Livre)
// Traz o produto completo + a loja vendedora + média de estrelas
// do próprio produto e da loja (calculadas na hora, sempre atual).
// ------------------------------------------------------------
router.get('/produtos/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ resposta: 'ID de produto inválido.' });
    }

    try {
        const [linhas] = await pool.query(
            `SELECT P.ID, P.NOME, P.DESCRICAO, P.CATEGORIA, P.PRECO, P.CAMINHO_IMG,
                    (P.IMAGEM IS NOT NULL) AS TEM_IMAGEM,
                    UNIX_TIMESTAMP(P.ATUALIZADO_EM) AS IMG_VERSAO,
                    P.IMAGEM_URL,
                    P.ID_LOJA,
                    L.NOME AS LOJA_NOME,
                    L.DESCRICAO AS LOJA_DESCRICAO,
                    L.EMAIL AS LOJA_EMAIL,
                    (SELECT COUNT(*) FROM AVALIACAO A WHERE A.ID_PRODUTO = P.ID) AS AVALIACOES_QTD,
                    (SELECT ROUND(AVG(A.NOTA), 1) FROM AVALIACAO A WHERE A.ID_PRODUTO = P.ID) AS PRODUTO_NOTA,
                    (SELECT ROUND(AVG(A.NOTA), 1) FROM AVALIACAO A
                        JOIN PRODUTO P2 ON P2.ID = A.ID_PRODUTO
                        WHERE P2.ID_LOJA = P.ID_LOJA) AS LOJA_NOTA,
                    (SELECT COUNT(*) FROM AVALIACAO A JOIN PRODUTO P2 ON P2.ID = A.ID_PRODUTO
                        WHERE P2.ID_LOJA = P.ID_LOJA) AS LOJA_AVALIACOES_QTD
             FROM PRODUTO P
             JOIN LOJA L ON L.ID = P.ID_LOJA
             WHERE P.ID = ? AND P.ATIVO = 1`,
            [id]
        );
        if (linhas.length === 0) {
            return res.status(404).json({ resposta: 'Produto não encontrado.' });
        }
        res.json(linhas[0]);
    } catch (error) {
        responderErro(res, error, 'GET /produtos/:id');
    }
});

// ------------------------------------------------------------
// AVALIAÇÕES DO PRODUTO
// Devolve o resumo (média, total e quantas de cada estrela) e a
// lista completa, mais recente primeiro.
// ------------------------------------------------------------
router.get('/produtos/:id/avaliacoes', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ resposta: 'ID de produto inválido.' });
    }

    try {
        const [resumo] = await pool.query(
            `SELECT ROUND(AVG(NOTA), 1) AS MEDIA,
                    COUNT(*) AS TOTAL,
                    SUM(NOTA = 5) AS CINCO,
                    SUM(NOTA = 4) AS QUATRO,
                    SUM(NOTA = 3) AS TRES,
                    SUM(NOTA = 2) AS DOIS,
                    SUM(NOTA = 1) AS UM
             FROM AVALIACAO WHERE ID_PRODUTO = ?`,
            [id]
        );

        const [lista] = await pool.query(
            `SELECT ID, NOME_CLIENTE, NOTA, COMENTARIO, DATE_FORMAT(DATA, '%d/%m/%Y') AS DATA_BR
             FROM AVALIACAO
             WHERE ID_PRODUTO = ?
             ORDER BY DATA DESC
             LIMIT 60`,
            [id]
        );

        // SUM() devolve null quando não há linhas; normaliza pra 0
        const r = resumo[0];
        for (const chave of ['CINCO', 'QUATRO', 'TRES', 'DOIS', 'UM', 'TOTAL']) {
            r[chave] = Number(r[chave] || 0);
        }
        r.MEDIA = r.MEDIA === null ? null : Number(r.MEDIA);

        res.json({ resumo: r, lista });
    } catch (error) {
        responderErro(res, error, 'GET /produtos/:id/avaliacoes');
    }
});

// ------------------------------------------------------------
// POSTAR/ATUALIZAR AVALIAÇÃO (só cliente que COMPROU produto)
// Corpo: nota (1-5), comentario (opcional)
// Se o mesmo cliente já avaliou, atualiza a avaliação dela (upsert).
// ------------------------------------------------------------
router.post('/produtos/:id/avaliacao', async (req, res) => {
    const idProduto = Number(req.params.id);
    if (!Number.isInteger(idProduto) || idProduto <= 0) {
        return res.status(400).json({ resposta: 'ID de produto inválido.' });
    }

    // Token manual (exigirLogin compara req.params.id com o id do token,
    // mas aqui o :id da rota é o PRODUTO, não o cliente)
    const encontrado = /^Bearer\s+(\S+)$/i.exec(req.headers.authorization || '');
    const sessao = encontrado ? lerToken(encontrado[1]) : null;
    if (!sessao || sessao.t !== 'cliente') {
        return res.status(401).json({ resposta: 'Entre na sua conta de cliente para avaliar.' });
    }
    const idCliente = sessao.id;

    const { nota, comentario } = req.body || {};
    const notaNum = Number(nota);
    if (!Number.isInteger(notaNum) || notaNum < 1 || notaNum > 5) {
        return res.status(400).json({ resposta: 'Nota inválida: use de 1 a 5 estrelas.' });
    }
    const texto = typeof comentario === 'string' ? comentario.trim() : '';
    if (texto.length > 1000) {
        return res.status(400).json({ resposta: 'Comentário muito longo (máximo 1000 caracteres).' });
    }

    try {
        // 1) O produto existe e está à venda?
        const [produto] = await pool.query(
            'SELECT ID FROM PRODUTO WHERE ID = ? AND ATIVO = 1',
            [idProduto]
        );
        if (produto.length === 0) {
            return res.status(404).json({ resposta: 'Produto não encontrado.' });
        }

        // 2) Este cliente tem esse produto no histórico de compras?
        const [compras] = await pool.query(
            `SELECT P.ID
             FROM PRODUTO P
             JOIN POSSUI ON POSSUI.ID_PRODUTO = P.ID
             JOIN COMPRA C ON C.ID = POSSUI.ID_COMPRA
             WHERE P.ID = ? AND C.ID_CLIENTE = ?`,
            [idProduto, idCliente]
        );
        if (compras.length === 0) {
            return res.status(403).json({
                resposta: 'Só quem comprou esse produto pode avaliá-lo. Depois de receber a compra, volte aqui!'
            });
        }

        // 3) Nome atual do cliente (vai como "relüceia" na avaliação)
        const [cliente] = await pool.query(
            'SELECT NOME FROM CLIENTE WHERE ID = ?',
            [idCliente]
        );
        const nomeCliente = cliente.length > 0 ? cliente[0].NOME : 'Cliente PC Forge';

        // 4) Grava (ou atualiza a avaliação que ele já tinha feito).
        // Nome exibido: primeiro nome + inicial do sobrenome ("Bruno T."),
        // igual ao Mercado Livre — não expõe o nome completo no público.
        const partes = nomeCliente.trim().split(/\s+/);
        const nomeExibicao = partes.length > 1
            ? `${partes[0]} ${partes[partes.length - 1].charAt(0)}.`
            : partes[0];
        await pool.execute(
            `INSERT INTO AVALIACAO (ID_PRODUTO, ID_CLIENTE, NOME_CLIENTE, NOTA, COMENTARIO, DATA)
             VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
             ON DUPLICATE KEY UPDATE
                NOTA = VALUES(NOTA),
                COMENTARIO = VALUES(COMENTARIO),
                DATA = CURRENT_TIMESTAMP`,
            [idProduto, idCliente, nomeExibicao, notaNum, texto || null]
        );

        res.status(201).json({ resposta: 'Avaliação registrada. Obrigado por ajudar a comunidade PC Forge!' });
    } catch (error) {
        responderErro(res, error, 'POST /produtos/:id/avaliacao');
    }
});

// ------------------------------------------------------------
// LISTAR PRODUTOS DE UMA LOJA (painel da própria loja)
// ------------------------------------------------------------
router.get('/produtos/loja/:idLoja', async (req, res) => {
    const { idLoja } = req.params;
    try {
        const [linhas] = await pool.query(
            `SELECT ID, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG,
                    (IMAGEM IS NOT NULL) AS TEM_IMAGEM,
                    UNIX_TIMESTAMP(ATUALIZADO_EM) AS IMG_VERSAO,
                    IMAGEM_URL
             FROM PRODUTO WHERE ID_LOJA = ? AND ATIVO = 1 ORDER BY ID DESC`,
            [idLoja]
        );
        res.json(linhas);
    } catch (error) {
        responderErro(res, error, 'GET /produtos/loja/:idLoja');
    }
});

// ------------------------------------------------------------
// FOTO DO PRODUTO (devolve a imagem de verdade, lida do BLOB)
// Usada direto no <img src="http://localhost:3000/produtos/12/imagem">
// ------------------------------------------------------------
router.get('/produtos/:id/imagem', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ resposta: 'ID de produto inválido.' });
    }

    try {
        const [linhas] = await pool.query(
            'SELECT IMAGEM, IMAGEM_TIPO, IMAGEM_URL FROM PRODUTO WHERE ID = ? AND ATIVO = 1',
            [id]
        );
        if (linhas.length === 0 || (!linhas[0].IMAGEM && !linhas[0].IMAGEM_URL)) {
            return res.status(404).json({ resposta: 'Esse produto não tem foto.' });
        }

        // Sem BLOB mas com URL externa (foto real, migração 009): encaminha
        // o <img> do front pra URL na própria resposta (redirecionamento 302).
        if (!linhas[0].IMAGEM) {
            res.set('Cache-Control', 'public, max-age=86400');
            return res.redirect(302, linhas[0].IMAGEM_URL);
        }

        res.set('Content-Type', linhas[0].IMAGEM_TIPO || 'application/octet-stream');
        res.set('X-Content-Type-Options', 'nosniff');
        // A URL leva ?v=<IMG_VERSAO>, então cada troca de foto é uma URL nova
        // e dá pra deixar o navegador guardar a foto por um bom tempo.
        res.set('Cache-Control', 'public, max-age=86400');
        res.send(linhas[0].IMAGEM);
    } catch (error) {
        responderErro(res, error, 'GET /produtos/:id/imagem');
    }
});

// ------------------------------------------------------------
// CRIAR PRODUTO (loja logada cadastra um produto novo)
// Corpo: id_loja, nome, categoria, preco  (obrigatórios)
//        descricao, imagem                (opcionais)
// "imagem" = foto em base64 (com ou sem o prefixo "data:image/...;base64,")
// ------------------------------------------------------------
router.post('/produtos', async (req, res) => {
    const { id_loja, nome, descricao, categoria, preco, caminho_img, quantidade_img, imagem } = req.body || {};

    if (!id_loja || !nome || !categoria || !preco) {
        return res.status(400).json({ resposta: 'Loja, nome, categoria e preço são obrigatórios.' });
    }

    let foto = null;
    if (imagem) {
        try {
            foto = lerImagem(imagem);
        } catch (erro) {
            if (erro.deImagem) return responderErroImagem(res, erro);
            throw erro;
        }
    }

    try {
        const [lojaExiste] = await pool.query('SELECT ID FROM LOJA WHERE ID = ?', [id_loja]);
        if (lojaExiste.length === 0) {
            return res.status(404).json({ resposta: 'Loja não encontrada. Faça login novamente.' });
        }

        // execute() (e não query()) porque ele manda o BLOB em binário; o query()
        // escreveria a foto como texto hexadecimal, o dobro do tamanho no pacote.
        const [resultado] = await pool.execute(
            `INSERT INTO PRODUTO (ID_LOJA, NOME, DESCRICAO, CATEGORIA, PRECO, CAMINHO_IMG, QUANTIDADE_IMG, IMAGEM, IMAGEM_TIPO)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id_loja,
                nome,
                descricao || '',
                categoria,
                preco,
                caminho_img || 'placeholder.jpg',
                quantidade_img || 1,
                foto ? foto.buffer : null,
                foto ? foto.tipo : null
            ]
        );

        res.status(201).json({ resposta: 'Produto cadastrado com sucesso!', id: resultado.insertId });
    } catch (error) {
        responderErro(res, error, 'POST /produtos');
    }
});

// ------------------------------------------------------------
// ALTERAR PRODUTO (a loja só edita produto dela mesma)
// Sobre a foto:
//   - mandou "imagem"            -> troca a foto
//   - mandou remover_imagem=true -> apaga a foto (volta pro ícone)
//   - não mandou nenhum dos dois -> a foto atual continua como está
// ------------------------------------------------------------
router.put('/produtos/:id', async (req, res) => {
    const { id } = req.params;
    const { id_loja, nome, descricao, categoria, preco, caminho_img, quantidade_img, imagem, remover_imagem } = req.body || {};

    if (!id_loja) {
        return res.status(400).json({ resposta: 'Informe a loja dona do produto.' });
    }
    if (!nome || !categoria || !preco) {
        return res.status(400).json({ resposta: 'Nome, categoria e preço são obrigatórios.' });
    }

    let foto = null;
    if (imagem) {
        try {
            foto = lerImagem(imagem);
        } catch (erro) {
            if (erro.deImagem) return responderErroImagem(res, erro);
            throw erro;
        }
    }

    try {
        // Confere se o produto existe, está ativo e pertence mesmo a essa loja
        // antes de deixar alterar (evita uma loja editar produto de outra).
        const [produtoExistente] = await pool.query(
            'SELECT ID FROM PRODUTO WHERE ID = ? AND ID_LOJA = ? AND ATIVO = 1',
            [id, id_loja]
        );
        if (produtoExistente.length === 0) {
            return res.status(404).json({ resposta: 'Produto não encontrado ou não pertence a essa loja.' });
        }

        let trechoFoto = '';
        const parametros = [
            nome,
            descricao || '',
            categoria,
            preco,
            caminho_img || 'placeholder.jpg',
            quantidade_img || 1
        ];

        if (foto) {
            trechoFoto = ', IMAGEM = ?, IMAGEM_TIPO = ?';
            parametros.push(foto.buffer, foto.tipo);
        } else if (remover_imagem === true) {
            trechoFoto = ', IMAGEM = NULL, IMAGEM_TIPO = NULL';
        }

        parametros.push(id, id_loja);

        await pool.execute(
            `UPDATE PRODUTO
             SET NOME = ?, DESCRICAO = ?, CATEGORIA = ?, PRECO = ?, CAMINHO_IMG = ?, QUANTIDADE_IMG = ?${trechoFoto}
             WHERE ID = ? AND ID_LOJA = ?`,
            parametros
        );

        res.json({ resposta: 'Produto atualizado com sucesso!' });
    } catch (error) {
        responderErro(res, error, 'PUT /produtos/:id');
    }
});

// ------------------------------------------------------------
// EXCLUIR PRODUTO (a loja só apaga produto dela mesma)
//
// Isso é uma exclusão lógica (ATIVO = 0), não um DELETE de verdade.
// Um DELETE de verdade quebraria com erro de chave estrangeira sempre
// que o produto já tivesse sido vendido (ele fica referenciado na
// tabela POSSUI, do histórico de compras). Com ATIVO = 0 o produto some
// da vitrine e do painel da loja, mas o histórico continua íntegro.
// ------------------------------------------------------------
router.delete('/produtos/:id', async (req, res) => {
    const { id } = req.params;
    const { id_loja } = req.body || {};

    if (!id_loja) {
        return res.status(400).json({ resposta: 'Informe a loja dona do produto.' });
    }

    try {
        const [resultado] = await pool.query(
            'UPDATE PRODUTO SET ATIVO = 0 WHERE ID = ? AND ID_LOJA = ? AND ATIVO = 1',
            [id, id_loja]
        );
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ resposta: 'Produto não encontrado ou não pertence a essa loja.' });
        }
        res.json({ resposta: 'Produto excluído com sucesso.' });
    } catch (error) {
        responderErro(res, error, 'DELETE /produtos/:id');
    }
});

module.exports = router;
