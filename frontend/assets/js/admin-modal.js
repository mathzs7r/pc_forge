// Modal de ACESSO RESTRITO — aberto ao clicar na logo (navbar.js).
//
// Login do ADMINISTRADOR (usuário "adm"). A senha NÃO fica aqui:
// o form envia pra POST /admin/login no backend, que confere contra
// um hash bcrypt no servidor e devolve um token de sessão tipo "adm".
// Com a sessão ativa, a logo leva direto ao painel (painel-admin.html),
// o que supervisiona lojas parceiras, clientes, acessos e vendas.
(function () {
    function criarModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-fundo';
        modal.id = 'modal-admin';
        modal.hidden = true;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'titulo-modal-admin');
        modal.innerHTML = `
            <div class="modal-caixa">
                <button type="button" class="modal-fechar" id="fechar-modal-admin" aria-label="Fechar">&times;</button>
                <h2 id="titulo-modal-admin">Acesso restrito</h2>
                <p class="subtitulo">Área do administrador — o que manda em tudo</p>
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
            // Sessão de administrador ativa: a logo leva direto ao painel
            if (sessionStorage.getItem('adm')) {
                window.location.href = 'painel-admin.html';
                return;
            }
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

        form.addEventListener('submit', async function (evento) {
            evento.preventDefault();
            erro.style.display = 'none';
            erro.textContent = '';

            const botao = form.querySelector('input[type="submit"]');
            botao.disabled = true;
            try {
                const r = await apiPost('/admin/login', {
                    usuario: modal.querySelector('#admin-usuario').value.trim(),
                    senha: modal.querySelector('#admin-senha').value,
                });
                sessionStorage.setItem('adm', JSON.stringify({ id: r.admin.id, nome: r.admin.nome, token: r.token }));
                fechar();
                mostrarToast(r.resposta, 'sucesso');
                window.location.href = 'painel-admin.html';
            } catch (error) {
                erro.textContent = error.message;
                erro.style.display = 'block';
            } finally {
                botao.disabled = false;
            }
        });
    });
})();
