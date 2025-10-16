// Aguarda o carregamento completo do HTML para garantir que todos os elementos existam
document.addEventListener('DOMContentLoaded', () => {

    // Seleciona os elementos do formulário
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');

    // Adiciona um "ouvinte" para o evento de 'submit' (envio) do formulário
    loginForm.addEventListener('submit', async (event) => {
        // 1. Previne o comportamento padrão do formulário (que é recarregar a página)
        event.preventDefault();

        // Limpa mensagens de erro antigas
        errorMessage.textContent = '';

        // 2. Pega os valores digitados pelo usuário
        const email = emailInput.value;
        const password = passwordInput.value;
        
        // A URL da nossa API de login
        const apiUrl = 'http://127.0.0.1:5000/api/login';

        try {
            // 3. Faz a requisição POST para a API usando fetch
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // Converte os dados de login para o formato JSON
                body: JSON.stringify({ email: email, password: password })
            });

            // Converte a resposta da API para JSON
            const data = await response.json();

            // 4. Verifica se a resposta da API foi bem-sucedida (status 200-299)
            if (response.ok) {
                // 5. Se o login deu certo (recebemos um token)
                // Guarda o token no armazenamento local do navegador
                localStorage.setItem('token', data.token);
                // Redireciona o usuário para a página do dashboard
                window.location.href = 'dashboard.html'; // <-- PRÓXIMA PÁGINA QUE VAMOS CRIAR
            } else {
                // 6. Se o login falhou (ex: credenciais inválidas)
                // Exibe a mensagem de erro que a API nos enviou
                errorMessage.textContent = data.message || 'Ocorreu um erro.';
            }

        } catch (error) {
            // Captura erros de rede (ex: API fora do ar)
            console.error('Erro na requisição:', error);
            errorMessage.textContent = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
        }
    });
});