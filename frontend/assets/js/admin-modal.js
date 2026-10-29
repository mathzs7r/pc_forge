// Modal de ACESSO RESTRITO — aberto ao clicar na logo (navbar.js).
//
// Login do ADMINISTRADOR (usuário "adm"). A senha NÃO fica aqui:
// o form envia pra POST /admin/login no backend, que confere contra
// um hash bcrypt no servidor e devolve um token de sessão tipo "adm".
// Com a sessão ativa, a logo leva direto ao painel (painel-admin.html),
// o que supervisiona lojas parceiras, clientes, acessos e vendas.
(function () {
function ligarFoco(modal, abrirAposFechar) {
    modal.addEventListener('keydown', (evento) => {
        if (evento.key !== 'Tab') return;
        const focaveis = modal.querySelectorAll('button, input, a[href]');
        const primeiro = focaveis[0];
        const ultimo = focaveis[focaveis.length - 1];
        if (evento.shiftKey && document.activeElement === primeiro) {
            evento.preventDefault();
            ultimo.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
            evento.preventDefault();
            primeiro.focus();
        }
    });
}
    // Focus trap: segura o Tab DENTRO do modal enquanto ele estiver visível
    // (sem isso, quem navega por teclado saía para os elementos da página atrás).
    function ligarFocoNoTab(evento) {
        if (evento.key !== 'Tab') return;
        const modal = evento.currentTarget;
        const focaveis = [...modal.querySelectorAll('button, input, a[href]')].filter(
            (el) => !el.disabled && el.offsetParent !== null
        );
        if (focaveis.length === 0) return;
        const primeiro = focaveis[0];
        const ultimo = focaveis[focaveis.length - 1];
        if (evento.shiftKey && document.activeElement === primeiro) {
            evento.preventDefault();
            ultimo.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
            evento.preventDefault();
            primeiro.focus();
        }
    }

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

        // Quem abriu o modal (a logo), pra devolver o foco ao fechar.
        let gatilho = null;

        function fechar() {
            modal.hidden = true;
            if (gatilho && typeof gatilho.focus === 'function') gatilho.focus();
            gatilho = null;
        }

        window.abrirModalAdmin = async function () {
            // Há um "adm" guardado? Antes de levar ao painel, CONFERE o token
            // com a API. Token velho (API reiniciou, segredo mudou) dava o
            // loop de "Sessão expirada": painel tomava 401 e expulsava sem
            // nunca mostrar o formulário. Aqui, 401/rede fora -> apaga e abre
            // o login. Vai direto no fetch (sem o chamarApi) pra NÃO disparar
            // o aviso de sessão expirada/troca de página do api.js.
            if (sessionStorage.getItem('adm')) {
                try {
                    const guardada = JSON.parse(sessionStorage.getItem('adm'));
                    const r = await fetch(`${API_URL}/admin/visao`, {
                        headers: { Authorization: `Bearer ${guardada && guardada.token}` }
                    });
                    if (r.ok) {
                        window.location.href = 'painel-admin.html';
                        return;
                    }
                } catch { /* API fora do ar: cai no login abaixo */ }
                sessionStorage.removeItem('adm');
            }
            erro.style.display = 'none';
            form.reset();
            gatilho = document.activeElement; // (a logo) pro foco voltar ao fechar
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
        // Foco preso dentro do modal enquanto ele estiver aberto (Tab circula
        // apenas pelos elementos do próprio modal).
        modal.addEventListener('keydown', ligarFocoNoTab);

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
                // Vai pro painel PRIMEIRO: nenhum erro de UI (toast/foco) pode
                // deixar a pessoa presa na tela de login depois do login OK.
                window.location.href = 'painel-admin.html';
                fechar();
                mostrarToast(r.resposta, 'sucesso');
            } catch (error) {
                erro.textContent = error.message;
                erro.style.display = 'block';
            } finally {
                botao.disabled = false;
            }
        });
    });
})();
