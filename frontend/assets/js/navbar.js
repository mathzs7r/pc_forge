// Navbar compartilhada — detecta quem está logado e monta os links certos.
(function () {
    function lerSessao() {
        try {
            const cliente = sessionStorage.getItem("cliente") || localStorage.getItem("cliente");
            const loja = sessionStorage.getItem("loja") || localStorage.getItem("loja");
            const admin = sessionStorage.getItem("admin") || localStorage.getItem("admin");
            return {
                cliente: cliente ? JSON.parse(cliente) : null,
                loja: loja ? JSON.parse(loja) : null,
                admin: admin ? JSON.parse(admin) : null
            };
        } catch (_) {
            return { cliente: null, loja: null, admin: null };
        }
    }

    function sair(tipo) {
        try {
            if (tipo === "cliente" || !tipo) {
                sessionStorage.removeItem("tokenCliente");
                sessionStorage.removeItem("cliente");
                localStorage.removeItem("tokenCliente");
                localStorage.removeItem("cliente");
            }
            if (tipo === "loja" || !tipo) {
                sessionStorage.removeItem("tokenLoja");
                sessionStorage.removeItem("loja");
                localStorage.removeItem("tokenLoja");
                localStorage.removeItem("loja");
            }
            if (tipo === "adm" || !tipo) {
                sessionStorage.removeItem("tokenAdmin");
                sessionStorage.removeItem("admin");
                localStorage.removeItem("tokenAdmin");
                localStorage.removeItem("admin");
            }
        } catch (_) {}
        location.href = "produtos.html";
    }

    function montarNavbar() {
        const el = document.getElementById("navbar") || document.querySelector("nav.navbar");
        if (!el) return;
        const s = lerSessao();
        let html = '<a class="nav-brand" href="produtos.html">PC Forge</a><div class="nav-links">';
        html += '<a href="produtos.html">Catálogo</a>';
        if (s.cliente) {
            html += '<a href="carrinho.html">Carrinho</a>';
            html += '<a href="perfil-cliente.html">' + (s.cliente.nome || "Minha conta") + '</a>';
            html += '<a href="#" data-sair="cliente">Sair</a>';
        } else if (s.loja) {
            html += '<a href="painel-loja.html">Painel da loja</a>';
            html += '<a href="perfil-loja.html">' + (s.loja.nome || "Minha loja") + '</a>';
            html += '<a href="#" data-sair="loja">Sair</a>';
        } else if (s.admin) {
            html += '<a href="painel-admin.html">Admin</a>';
            html += '<a href="#" data-sair="adm">Sair</a>';
        } else {
            html += '<a href="login.html">Entrar (cliente)</a>';
            html += '<a href="loja-login.html">Entrar (loja)</a>';
            html += '<a href="cliente-cadastro.html">Cadastrar</a>';
        }
        html += '</div>';
        el.innerHTML = html;
        el.querySelectorAll("[data-sair]").forEach((a) => {
            a.addEventListener("click", (e) => {
                e.preventDefault();
                sair(a.getAttribute("data-sair"));
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", montarNavbar);
    } else {
        montarNavbar();
    }

    window.pcForgeSair = sair;
    window.pcForgeSessao = lerSessao;
})();
