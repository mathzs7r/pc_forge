const express = require('express');
const pool = require('../db');
const { responderErro } = require('../utils/erros');
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

    try {
        const [linhas] = await pool.query(
            `SELECT P.ID, P.NOME, P.DESCRICAO, P.CATEGORIA, P.PRECO, P.CAMINHO_IMG,
                    (P.IMAGEM IS NOT NULL) AS TEM_IMAGEM,
                    UNIX_TIMESTAMP(P.ATUALIZADO_EM) AS IMG_VERSAO,
                    P.ID_LOJA,
                    L.NOME AS LOJA_NOME
             FROM PRODUTO P
             JOIN LOJA L ON L.ID = P.ID_LOJA
             WHERE P.ATIVO = 1${filtrarLoja ? ' AND P.ID_LOJA = ?' : ''}
             ORDER BY P.ID DESC`,
            filtrarLoja ? [idLoja] : []
        );
        res.json(linhas);
    } catch (error) {
        responderErro(res, error, 'GET /produtos');
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
                    UNIX_TIMESTAMP(ATUALIZADO_EM) AS IMG_VERSAO
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
            'SELECT IMAGEM, IMAGEM_TIPO FROM PRODUTO WHERE ID = ? AND ATIVO = 1',
            [id]
        );
        if (linhas.length === 0 || !linhas[0].IMAGEM) {
            return res.status(404).json({ resposta: 'Esse produto não tem foto.' });
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
