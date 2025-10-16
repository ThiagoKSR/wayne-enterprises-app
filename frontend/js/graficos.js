document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const logoutButton = document.getElementById('logout-button');

    // Proteção da Rota: Se não há token, expulsa o usuário
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // Lógica de Logout (igual à do dashboard)
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });

    // Função para renderizar o gráfico
    const renderStatusChart = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/stats', {
                headers: { 'x-access-token': token }
            });
            const statsData = await response.json();

            const labels = statsData.map(item => item.status);
            const data = statsData.map(item => item.count);
            
            const ctx = document.getElementById('statusChart').getContext('2d');
            
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: ['rgba(75, 192, 192, 0.7)', 'rgba(255, 99, 132, 0.7)', 'rgba(255, 206, 86, 0.7)'],
                        borderColor: ['#1a1a1a'],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'top', labels: { color: '#f0f0f0', font: { size: 14 } } }
                    }
                }
            });
        } catch (error) {
            console.error('Erro ao buscar dados para o gráfico:', error);
        }
    };

    // Executa a função para desenhar o gráfico assim que a página carrega
    renderStatusChart();
});