const http = require('http');

function req(method, path, token, body) {
    return new Promise((ok, fail) => {
        const data = body ? JSON.stringify(body) : null;
        const r = http.request({ host: 'localhost', port: 3000, path, method, headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: 'Bearer ' + token } : {}),
            'Content-Length': data ? Buffer.byteLength(data) : 0
        } }, res => {
            const b = [];
            res.on('data', c => b.push(c));
            res.on('end', () => ok({ s: res.statusCode, b: Buffer.concat(b).toString() }));
        });
        r.on('error', fail);
        if (data) r.write(data);
        r.end();
    });
}
const j = (r) => JSON.parse(r.b);

(async () => {
    console.log('saude:', await req('GET', '/saude').then(r => r.b.slice(0, 40)));

    // ===== cliente =====
    const c = await req('POST', '/login', null, { identificador: 'cliente01@demo.pcforge', senha: '12345678' });
    const cj = j(c);
    console.log('login cliente:', c.s);
    const ct = cj.token, cid = cj.cliente.id;

    const p = await req('GET', `/perfil/cliente/${cid}/pedidos`, ct);
    const pl = j(p);
    console.log('pedidos cliente:', p.s, '· qtd', pl.length, '· status1 =', pl[0] && pl[0].STATUS);

    await req('POST', `/perfil/cliente/${cid}/favoritos`, ct, { id_produto: 510 });
    const f1b = await req('POST', `/perfil/cliente/${cid}/favoritos`, ct, { id_produto: 510 });
    console.log('favoritar 510 (2x, sem erro esperado):', f1b.s, f1b.b);
    const f2 = await req('GET', `/perfil/cliente/${cid}/favoritos`, ct);
    const fl = j(f2);
    console.log('favoritos GET:', f2.s, 'qtd:', fl.length, fl[0] && { NOME: fl[0].NOME, TEM_IMAGEM: fl[0].TEM_IMAGEM, LOJA_NOME: fl[0].LOJA_NOME });
    const f3 = await req('DELETE', `/perfil/cliente/${cid}/favoritos/510`, ct);
    console.log('desfavoritar:', f3.s, f3.b);

    // ===== loja =====
    const l = await req('POST', '/loja/login', null, { identificador: 'loja05@demo.pcforge', senha: '12345678' });
    const lj = j(l);
    console.log('login loja:', l.s, lj.resposta || 'sem resposta');
    if (lj.token) {
        const pdRes = await req('GET', '/perfil/loja/11/pedidos', lj.token);
        const pd = j(pdRes);
        console.log('pedidos loja:', pdRes.s, '· qtd:', Array.isArray(pd) ? pd.length : JSON.stringify(pd).slice(0, 80));
        if (Array.isArray(pd) && pd[0]) {
            console.log('pedido 1:', JSON.stringify({ ID: pd[0].ID, STATUS: pd[0].STATUS, TOTAL_LOJA: pd[0].TOTAL_LOJA, QTD_ITENS: pd[0].QTD_ITENS, COMPRADOR: pd[0].COMPRADOR, cidade: pd[0].CIDADE + '/' + pd[0].ESTADO, itens: pd[0].ITENS.length }));
            const m = await req('PUT', `/perfil/loja/11/pedidos/${pd[0].ID}/status`, lj.token, { status: 'PAGO' });
            console.log('mudar status:', m.s, m.b);
            const m2 = await req('PUT', '/perfil/loja/11/pedidos/999999/status', lj.token, { status: 'PAGO' });
            console.log('compra alheia (403 esperado):', m2.s, m2.b.slice(0, 70));
            const m3 = await req('PUT', `/perfil/loja/11/pedidos/${pd[0].ID}/status`, lj.token, { status: 'BOBBA' });
            console.log('status inválido (400 esperado):', m3.s, m3.b.slice(0, 70));
            const voltar = await req('PUT', `/perfil/loja/11/pedidos/${pd[0].ID}/status`, lj.token, { status: pd[0].STATUS });
            console.log('status restaurado:', voltar.s);
        }
    }
})().catch(e => console.error('ERRO', e.message));
