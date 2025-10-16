document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SELEÇÃO DE ELEMENTOS E VERIFICAÇÃO INICIAL ---
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // Elementos principais
    const resourcesTbody = document.getElementById('resources-tbody');
    const logoutButton = document.getElementById('logout-button');
    const addResourceBtn = document.getElementById('add-resource-btn');

    // Elementos do Modal de Formulário
    const modal = document.getElementById('resource-modal');
    const closeButton = document.querySelector('.close-button');
    const resourceForm = document.getElementById('resource-form');
    const modalTitle = document.getElementById('modal-title');
    const resourceIdInput = document.getElementById('resource-id');
    
    // Elementos do Novo Modal de Confirmação
    const confirmModal = document.getElementById('confirm-modal');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmYesBtn = document.getElementById('confirm-yes-btn');
    const confirmNoBtn = document.getElementById('confirm-no-btn');
    
    let resourceIdToDelete = null; // Variável para guardar o ID do item a ser deletado

    // --- 2. FUNÇÕES AUXILIARES ---

    const showNotification = (message, type = 'success') => {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        container.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            notification.addEventListener('transitionend', () => notification.remove());
        }, 3000);
    };

    const fetchAndRenderResources = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/recursos', {
                headers: { 'x-access-token': token }
            });
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                window.location.href = 'index.html';
                return;
            }
            const data = await response.json();
            resourcesTbody.innerHTML = '';
            data.forEach(recurso => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${recurso.id}</td>
                    <td>${recurso.nome}</td>
                    <td>${recurso.tipo}</td>
                    <td>${recurso.status}</td>
                    <td>${recurso.descricao}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" data-id="${recurso.id}">Editar</button>
                            <button class="btn-delete" data-id="${recurso.id}">Excluir</button>
                        </div>
                    </td>
                `;
                resourcesTbody.appendChild(row);
            });
        } catch (error) {
            console.error('Erro ao buscar recursos:', error);
            showNotification('Falha ao carregar recursos.', 'error');
        }
    };

    // Função de fechar o modal de formulário
    const closeModal = () => {
        modal.style.display = 'none';
        document.documentElement.classList.remove('modal-open');
        document.body.classList.remove('modal-open');
    };
    
    // Nova função para fechar o modal de confirmação
    const closeConfirmModal = () => {
        confirmModal.style.display = 'none';
        document.documentElement.classList.remove('modal-open');
        document.body.classList.remove('modal-open');
        resourceIdToDelete = null; // Limpa o ID
    };

    // --- 3. EVENT LISTENERS (OUVINTES DE EVENTOS) ---

    // Logout
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });

    // Abrir modal de Adicionar
    addResourceBtn.addEventListener('click', () => {
        resourceForm.reset();
        resourceIdInput.value = '';
        modalTitle.textContent = 'Adicionar Novo Recurso';
        modal.style.display = 'block';
        document.documentElement.classList.add('modal-open');
        document.body.classList.add('modal-open');
    });

    // Fechar modal de formulário (no 'X' ou fora)
    closeButton.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target == modal) closeModal();
        if (event.target == confirmModal) closeConfirmModal(); // Fecha o modal de confirmação também
    });

    // Envio do formulário (Criar ou Editar)
    resourceForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = resourceIdInput.value;
        const method = id ? 'PUT' : 'POST';
        const apiUrl = id ? `http://127.0.0.1:5000/api/recursos/${id}` : 'http://127.0.0.1:5000/api/recursos';
        const resourceData = {
            nome: document.getElementById('nome').value,
            tipo: document.getElementById('tipo').value,
            status: document.getElementById('status').value,
            descricao: document.getElementById('descricao').value,
        };
        try {
            const response = await fetch(apiUrl, {
                method,
                headers: { 'Content-Type': 'application/json', 'x-access-token': token },
                body: JSON.stringify(resourceData)
            });
            const data = await response.json();
            if (response.ok) {
                closeModal();
                showNotification(`Recurso ${id ? 'atualizado' : 'adicionado'} com sucesso!`, 'success');
                await fetchAndRenderResources();
                // Não precisamos mais do renderStatusChart() aqui
            } else {
                showNotification(`Erro: ${data.message}`, 'error');
            }
        } catch (error) {
            showNotification('Ocorreu um erro de rede.', 'error');
        }
    });

    // Cliques na Tabela (Editar ou Excluir)
    resourcesTbody.addEventListener('click', async (event) => {
        const target = event.target;

        // Lógica de DELETAR (agora abre o modal)
        if (target.classList.contains('btn-delete')) {
            const resourceId = target.dataset.id;
            resourceIdToDelete = resourceId; // Guarda o ID
            // Personaliza a mensagem
            const resourceName = target.closest('tr').children[1].textContent;
            confirmMessage.textContent = `Tem certeza de que deseja excluir "${resourceName}"?`;
            // Abre o modal de confirmação
            confirmModal.style.display = 'block';
            document.documentElement.classList.add('modal-open');
            document.body.classList.add('modal-open');
        }
        
        // Lógica de EDITAR (continua a mesma)
        if (target.classList.contains('btn-edit')) {
            const resourceId = target.dataset.id;
             try {
                const response = await fetch(`http://127.0.0.1:5000/api/recursos/${resourceId}`, {
                    headers: { 'x-access-token': token }
                });
                if (!response.ok) throw new Error('Recurso não encontrado.');
                const recursoParaEditar = await response.json();
                
                modalTitle.textContent = `Editar Recurso #${recursoParaEditar.id}`;
                resourceIdInput.value = recursoParaEditar.id;
                document.getElementById('nome').value = recursoParaEditar.nome;
                document.getElementById('tipo').value = recursoParaEditar.tipo;
                document.getElementById('status').value = recursoParaEditar.status;
                document.getElementById('descricao').value = recursoParaEditar.descricao;

                modal.style.display = 'block';
                document.documentElement.classList.add('modal-open');
                document.body.classList.add('modal-open');
            } catch (error) {
                showNotification(error.message, 'error');
            }
        }
    });
    
    // --- NOVOS LISTENERS PARA O MODAL DE CONFIRMAÇÃO ---
    
    // Botão "Não" ou "Cancelar"
    confirmNoBtn.addEventListener('click', closeConfirmModal);
    
    // Botão "Sim" ou "Excluir"
    confirmYesBtn.addEventListener('click', async () => {
        if (resourceIdToDelete) {
            try {
                const response = await fetch(`http://127.0.0.1:5000/api/recursos/${resourceIdToDelete}`, {
                    method: 'DELETE',
                    headers: { 'x-access-token': token }
                });
                const data = await response.json();
                if (response.ok) {
                    showNotification('Recurso deletado com sucesso!', 'success');
                    fetchAndRenderResources(); // Atualiza a tabela
                } else {
                    showNotification(`Erro: ${data.message}`, 'error');
                }
            } catch (error) {
                showNotification('Ocorreu um erro de rede.', 'error');
            }
            closeConfirmModal(); // Fecha o modal após a ação
        }
    });


    // --- 4. EXECUÇÃO INICIAL ---
    fetchAndRenderResources();
    // (Não chamamos mais o renderStatusChart() aqui)

}); // Fim do document.addEventListener