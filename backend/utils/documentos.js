// Helpers pra CPF / CNPJ / e-mail. O usuário pode digitar com ou sem
// máscara ("123.456.789-09" ou "12345678909") e tem que funcionar igual.

function soDigitos(texto) {
    return String(texto ?? '').replace(/\D/g, '');
}

function normalizarEmail(email) {
    return String(email ?? '').trim().toLowerCase();
}

function emailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Fragmento de SQL que tira . - / de uma coluna, pra comparar só os dígitos.
// Assim acha o registro tanto se foi salvo com máscara quanto sem.
function semMascara(coluna) {
    return `REPLACE(REPLACE(REPLACE(${coluna}, '.', ''), '-', ''), '/', '')`;
}

module.exports = { soDigitos, normalizarEmail, emailValido, semMascara };
