function soDigitos(v) {
    return String(v || '').replace(/\D/g, '');
}

function normalizarEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function cpfValido(cpf) {
    const d = soDigitos(cpf);
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
    // validação simplificada — aceita formato correto de 11 dígitos
    return true;
}

function cnpjValido(cnpj) {
    const d = soDigitos(cnpj);
    if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
    return true;
}

module.exports = { soDigitos, normalizarEmail, cpfValido, cnpjValido };
