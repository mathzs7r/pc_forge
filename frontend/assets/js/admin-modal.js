// Modal de acesso de visualização — aberto ao clicar na logo (ver
// navbar.js). Usuário "adm" / senha "1234" ativa o modo visualização
// (assets/js/demo.js), que troca as chamadas de API por dados fixos.
//
// De novo: isso é só um atalho de teste, não é autenticação de verdade.
// Qualquer pessoa que olhar o código-fonte vê usuário e senha aqui embaixo.
(function () {
    const USUARIO_ADM = 'adm';
    const SENHA_ADM = '1234';

    function criarModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-fundo';
        modal.id = 'modal-admin';
        modal.hidden = true;
        modal.innerHTML = `
            <div class="modal-caixa">
                <button type="button" class="modal-fechar" id="fechar-modal-admin" aria-label="Fechar">&times;</button>
                <h2>Acesso restrito</h2>
                <p class="subtitulo">Login de visualização — funciona sem a API rodando</p>
                <form id="form-admin">
                    <label for="admin-usuario">Usuário</label>
                    <input type="text" id="admin-usuario" autocomplete="off" required>

                    <label for="admin-senha">Senha</label>
                    <input type="password" id="admin-senha" required>

                    <input type="submit" value="Entrar">

                    <p id="admin-erro" class="mensagem-erro"></p>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    document.addEventListener('DOMContentLoaded', function () {
        const modal = criarModal();
        const form = modal.querySelector('#form-admin');
        const erro = modal.querySelector('#admin-erro');

        function fechar() {
            modal.hidden = true;
        }

        window.abrirModalAdmin = function () {
            erro.style.display = 'none';
            form.reset();
            modal.hidden = false;
            modal.querySelector('#admin-usuario').focus();
        };

        modal.querySelector('#fechar-modal-admin').addEventListener('click', fechar);
        modal.addEventListener('click', function (evento) {
            if (evento.target === modal) fechar();
        });
        document.addEventListener('keydown', function (evento) {
            if (evento.key === 'Escape' && !modal.hidden) fechar();
        });

        form.addEventListener('submit', function (evento) {
            evento.preventDefault();
            const usuario = modal.querySelector('#admin-usuario').value.trim();
            const senha = modal.querySelector('#admin-senha').value;

            if (usuario === USUARIO_ADM && senha === SENHA_ADM) {
                ativarModoDemo();
                fechar();
                window.location.href = 'produtos.html';
            } else {
                erro.textContent = 'Usuário ou senha incorretos.';
                erro.style.display = 'block';
            }
        });
    });
})();
