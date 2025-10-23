document.addEventListener('DOMContentLoaded', () => {

    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    const resourcesTbody = document.getElementById('resources-tbody');
    const logoutButton = document.getElementById('logout-button');
    const addResourceBtn = document.getElementById('add-resource-btn');

    const modal = document.getElementById('resource-modal');
    const closeButton = document.querySelector('.close-button');
    const resourceForm = document.getElementById('resource-form');
    const modalTitle = document.getElementById('modal-title');
    const resourceIdInput = document.getElementById('resource-id');
    
    const confirmModal = document.getElementById('confirm-modal');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmYesBtn = document.getElementById('confirm-yes-btn');
    const confirmNoBtn = document.getElementById('confirm-no-btn');
    
    let resourceIdToDelete = null;

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

    const closeModal = () => {
        modal.style.display = 'none';
        document.documentElement.classList.remove('modal-open');
        document.body.classList.remove('modal-open');
    };
    
    const closeConfirmModal = () => {
        confirmModal.style.display = 'none';
        document.documentElement.classList.remove('modal-open');
        document.body.classList.remove('modal-open');
        resourceIdToDelete = null; 
    };

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });

    addResourceBtn.addEventListener('click', () => {
        resourceForm.reset();
        resourceIdInput.value = '';
        modalTitle.textContent = 'Adicionar Novo Recurso';
        modal.style.display = 'block';
        document.documentElement.classList.add('modal-open');
        document.body.classList.add('modal-open');
    });

    closeButton.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target == modal) closeModal();
        if (event.target == confirmModal) closeConfirmModal(); 
    });

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

            } else {
                showNotification(`Erro: ${data.message}`, 'error');
            }
        } catch (error) {
            showNotification('Ocorreu um erro de rede.', 'error');
        }
    });

    resourcesTbody.addEventListener('click', async (event) => {
        const target = event.target;

        if (target.classList.contains('btn-delete')) {
            const resourceId = target.dataset.id;
            resourceIdToDelete = resourceId; 

            const resourceName = target.closest('tr').children[1].textContent;
            confirmMessage.textContent = `Tem certeza de que deseja excluir "${resourceName}"?`;

            confirmModal.style.display = 'block';
            document.documentElement.classList.add('modal-open');
            document.body.classList.add('modal-open');
        }
        
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
    
    confirmNoBtn.addEventListener('click', closeConfirmModal);
    
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
                    fetchAndRenderResources(); 
                } else {
                    showNotification(`Erro: ${data.message}`, 'error');
                }
            } catch (error) {
                showNotification('Ocorreu um erro de rede.', 'error');
            }
            closeConfirmModal(); 
        }
    });

    fetchAndRenderResources();

});