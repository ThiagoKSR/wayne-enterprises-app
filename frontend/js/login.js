document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        errorMessage.textContent = '';

        const email = emailInput.value;
        const password = passwordInput.value;
        
        const apiUrl = 'http://127.0.0.1:5000/api/login';

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({ email: email, password: password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                window.location.href = 'dashboard.html';
            } else {

                errorMessage.textContent = data.message || 'Ocorreu um erro.';
            }

        } catch (error) {
            console.error('Erro na requisição:', error);
            errorMessage.textContent = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
        }
    });
});