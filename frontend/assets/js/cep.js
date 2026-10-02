// Busca de endereço por CEP (ViaCEP), usada no cadastro de cliente.
function limparEnderecoCep() {
    ['rua', 'bairro', 'cidade', 'uf'].forEach(function (id) {
        const campo = document.getElementById(id);
        campo.value = '';
        campo.placeholder = id === 'uf' ? 'UF' : '';
    });
}

function preencherEnderecoCep(conteudo) {
    if (!('erro' in conteudo)) {
        document.getElementById('rua').value = conteudo.logradouro;
        document.getElementById('bairro').value = conteudo.bairro;
        document.getElementById('cidade').value = conteudo.localidade;
        document.getElementById('uf').value = conteudo.uf;
        document.getElementById('numero').focus();
    } else {
        limparEnderecoCep();
        mostrarToast('CEP não encontrado.', 'erro');
    }
}

// O ViaCEP não manda cabeçalho de CORS pra requisições fetch comuns,
// então usamos o formato JSONP dele mesmo (callback via <script>).
window.preencherEnderecoCep = preencherEnderecoCep;

function pesquisarCep(valor) {
    const cep = valor.replace(/\D/g, '');

    if (cep === '') {
        limparEnderecoCep();
        return;
    }

    if (!/^[0-9]{8}$/.test(cep)) {
        limparEnderecoCep();
        mostrarToast('Formato de CEP inválido.', 'erro');
        return;
    }

    // Antes escrevia "..." dentro dos campos — inclusive no UF, que só
    // aceita 2 letras — e isso ia parar no banco se a pessoa enviasse o
    // formulário antes da resposta chegar. Agora usa só o placeholder.
    ['rua', 'bairro', 'cidade', 'uf'].forEach(function (id) {
        const campo = document.getElementById(id);
        campo.value = '';
        campo.placeholder = 'Buscando...';
    });

    const script = document.createElement('script');
    script.src = `https://viacep.com.br/ws/${cep}/json/?callback=preencherEnderecoCep`;
    script.onload = function () { script.remove(); };
    script.onerror = function () {
        script.remove();
        limparEnderecoCep();
        mostrarToast('Não consegui consultar o CEP agora. Preencha o endereço à mão.', 'aviso');
    };
    document.body.appendChild(script);
}
