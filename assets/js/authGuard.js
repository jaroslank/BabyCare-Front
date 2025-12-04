/**
 * authGuard.js
 * Este script bloqueia o carregamento da página para verificar a autenticação.
 * Ele usa um XMLHttpRequest síncrono, o que geralmente é uma má prática,
 * mas é uma das maneiras mais confiáveis de impedir que um conteúdo
 * protegido seja renderizado (mesmo que por um instante) antes do
 * redirecionamento.
 */
 (function () {
    // Aponta para o seu Back-end
    const API_BASE = 'https://babycare-api.onrender.com';

    // Suas páginas do front-end
    const LOGIN_PAGE = 'login.html';
    const HOME_PAGE = '/dashboard.html';

    /**
     * Adiciona o listener para o botão de login
     */
    function setupLoginButton() {
        const loginButton = document.querySelector('[data-action="login-google"]');
        if (loginButton) {
            loginButton.addEventListener('click', () => {
                // Redireciona para a rota de autenticação do Google no backend
                // Esta é a rota definida em authRoutes.js
                window.location.href = `${API_BASE}/auth/google`;
            });
        }
    }

    /**
     * Controla a visibilidade dos elementos com base no status de login
     * Isso corrige o problema do botão "display: none" no login.html
     */
    function updateAuthVisibility(isLoggedIn) {
        document.querySelectorAll('[data-auth="guest"]').forEach(el => {
            el.style.display = isLoggedIn ? 'none' : 'block';
        });
        document.querySelectorAll('[data-auth="user"]').forEach(el => {
            el.style.display = isLoggedIn ? 'block' : 'none';
        });
    }

    /**
     * Função principal de verificação
     */
    async function ensureAuthenticated() {
        try {
            // Tenta verificar a sessão no back-end (na rota /auth/user)
            const res = await fetch(`${API_BASE}/auth/user`, {
                credentials: 'include' // ESSENCIAL para enviar o cookie de sessão
            });

            if (!res.ok) {
                throw new Error('Sessão inválida');
            }
            const user = await res.json();
            if (!user) {
                throw new Error('Usuário não autenticado');
            }

            // --- Usuário está LOGADO ---
            try {
                sessionStorage.setItem('currentUser', JSON.stringify(user));
            } catch (e) {
                console.warn('Não foi possível salvar a sessão no sessionStorage');
            }

            // ATUALIZADO: Mostra elementos de 'usuário'
            updateAuthVisibility(true);

            // Se o usuário logado está na página de login, redireciona para o dashboard
            if (window.location.pathname.endsWith(LOGIN_PAGE)) {
                window.location.replace(HOME_PAGE);
            }
            // Se estiver em outra página (ex: dashboard), apenas deixa carregar

        } catch (err) {
            // --- Usuário NÃO está LOGADO ---
            console.warn(err.message);
            sessionStorage.removeItem('currentUser'); // Limpa dados antigos

            // ATUALIZADO: Mostra elementos de 'visitante' (botão de login)
            updateAuthVisibility(false);

            // Se o usuário não está logado E não está na página de login, força o login
            if (!window.location.pathname.endsWith(LOGIN_PAGE)) {
                window.location.replace(LOGIN_PAGE);
            }
            // Se estiver na página de login, deixa carregar (o updateAuthVisibility já mostrou o botão)
        }
    }

    // Adiciona o listener do botão de login assim que o DOM carregar
    // Isso garante que o botão exista antes de tentarmos adicionar o evento
    document.addEventListener('DOMContentLoaded', setupLoginButton);

    // Roda a verificação de autenticação
    ensureAuthenticated();

})();