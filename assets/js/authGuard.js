/**
 * authGuard.js
 * Este script bloqueia o carregamento da página para verificar a autenticação.
 * Ele usa um XMLHttpRequest síncrono, o que geralmente é uma má prática,
 * mas é uma das maneiras mais confiáveis de impedir que um conteúdo
 * protegido seja renderizado (mesmo que por um instante) antes do
 * redirecionamento.
 */
 (function() {
    const API_URL = 'http://localhost:3000';
    
    // Pega o caminho atual da página
    const currentPage = window.location.pathname;

    // Se já estivermos na página de login, não fazemos nada
    if (currentPage.endsWith('login.html')) {
        return;
    }

    let user = null;
    try {
        // Tenta pegar o usuário do sessionStorage primeiro
        const storedUser = sessionStorage.getItem('currentUser');
        if (storedUser) {
            user = JSON.parse(storedUser);
            // Se tivermos o usuário, podemos pular a verificação de rede (opcional, mas mais rápido)
            // No entanto, para segurança máxima, verificamos com o servidor.
        }
    } catch (e) {
        console.error('Falha ao ler usuário do sessionStorage.', e);
        sessionStorage.removeItem('currentUser');
    }

    // Faz a verificação síncrona com o backend
    const xhr = new XMLHttpRequest();
    // 'false' torna a requisição síncrona (bloqueia o script)
    xhr.open('GET', `${API_URL}/auth/user`, false); 
    xhr.withCredentials = true; // Essencial para enviar o cookie de sessão
    xhr.send();

    if (xhr.status === 200) {
        // 200 OK: Usuário está autenticado
        try {
            // Salva os dados do usuário na sessão do navegador
            sessionStorage.setItem('currentUser', xhr.responseText);
        } catch (e) {
            console.error('Falha ao parsear ou salvar dados do usuário:', e);
            sessionStorage.removeItem('currentUser');
            // Se falhar, redireciona para o login por segurança
            window.location.href = 'login.html';
        }
    } else {
        // Não autenticado (401, 403) ou outro erro
        console.warn('Usuário não autenticado. Redirecionando para login.');
        sessionStorage.removeItem('currentUser'); // Limpa qualquer sessão antiga
        window.location.href = 'login.html';
    }
})();