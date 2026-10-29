// ============================================================
// MÁSCARAS DE FORMULÁRIO
// Formata enquanto digita: CPF, CNPJ, CEP, celular e moeda.
//
// Como usar no HTML: adicione o atributo data-mascara ao input.
//   <input data-mascara="cpf"     placeholder="000.000.000-00">
//   <input data-mascara="cnpj"    placeholder="00.000.000/0000-00">
//   <input data-mascara="cep"     placeholder="00000-000">
//   <input data-mascara="celular" placeholder="(00) 00000-0000">
//   <input data-mascara="moeda"   placeholder="1.299,90">  (preço R$)
//
// O BACKEND NÃO PRECISA SABER DISSO: ele já limpa pontuação com
// soDigitos() antes de validar, e o preço de moeda é convertido
// de "1.299,90" para número no JS da página que envia.
// ============================================================
(function () {
    const SÓ_DÍGITOS = /\D/g;

    // devolve o texto com só os dígitos, limitado a `max` caracteres
    const digitos = (valor, max) => valor.replace(SÓ_DÍGITOS, '').slice(0, max);

    function aplicarMascara(tipo, valor) {
        switch (tipo) {
            case 'cpf': {
                const d = digitos(valor, 11);
                return d
                    .replace(/(\d{3})(\d)/, '$1.$2')
                    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
                    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
            }
            case 'cnpj': {
                const d = digitos(valor, 14);
                return d
                    .replace(/^(\d{2})(\d)/, '$1.$2')
                    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
                    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
                    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5');
            }
            case 'cep': {
                const d = digitos(valor, 8);
                return d.replace(/^(\d{5})(\d)/, '$1-$2');
            }
            case 'celular': {
                const d = digitos(valor, 11); // DD + 9 dígitos (celular)
                return d
                    .replace(/^(\d{2})(\d)/, '($1) $2')
                    .replace(/^(\(\d{2}\) \d{5})(\d)/, '$1-$2');
            }
            case 'moeda': {
                // digita 129990 -> "1.299,90" (cada tecla desloca centavos,
                // igual caixinha de caixa eletrônico). Recorta zeros à esquerda.
                let d = digitos(valor, 11).replace(/^0+(?=\d)/, '');
                if (!d) return '';
                const n = Number(d) / 100;
                return n.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            }
            default:
                return valor;
        }
    }

    function montar() {
        document.querySelectorAll('input[data-mascara]').forEach((campo) => {
            // evita colocar o listener 2x se este script rodar de novo
            if (campo.dataset.mascaraLigada) return;
            campo.dataset.mascaraLigada = '1';

            campo.addEventListener('input', function () {
                const mascarado = aplicarMascara(campo.dataset.mascara, campo.value);
                if (mascarado !== campo.value) campo.value = mascarado;
            });

            // já formata o que veio preenchido no HTML (edição de perfil)
            if (campo.value) {
                const mascarado = aplicarMascara(campo.dataset.mascara, campo.value);
                if (mascarado !== campo.value) campo.value = mascarado;
            }
        });
    }

    // roda no load e fica disponível pra páginas que montam o form via JS
    document.readyState === 'loading'
        ? document.addEventListener('DOMContentLoaded', montar)
        : montar();
    window.pcForgeMascaras = { aplicarMascara, montar };
})();
