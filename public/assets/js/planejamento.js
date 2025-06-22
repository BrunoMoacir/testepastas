// VERSÃO FINAL E CORRIGIDA
function iniciarPaginaPlanejamento() {
    const API_BASE_URL = 'http://localhost:3000';

    // --- SELEÇÃO DE ELEMENTOS DO DOM ---
    const tbody = document.querySelector('#obligationsTable tbody');
    const reminderModal = document.getElementById('reminderModal');
    const confirmationModal = document.getElementById('confirmationModal');
    const createModal = document.getElementById('createObligationModal');

    // --- LÓGICA DE EVENTOS ---

    function setupEventListeners() {
        // Botões principais da página
        document.getElementById('viewSchedule').addEventListener('click', handleFilterByMonth);
        document.getElementById('clearSelection').addEventListener('click', handleClearFilter);
        document.getElementById('viewAllMonths').addEventListener('click', loadCronogramaData);
        document.getElementById('createObligationBtn').addEventListener('click', () => { createModal.style.display = 'block'; });

        // Botões de fechar/cancelar dos modais
        document.querySelector('.close-modal').addEventListener('click', () => { reminderModal.style.display = 'none'; });
        document.getElementById('cancelReminder').addEventListener('click', () => { reminderModal.style.display = 'none'; });
        document.querySelector('.close-confirmation-modal').addEventListener('click', () => { confirmationModal.style.display = 'none'; });
        document.querySelector('.close-create-modal').addEventListener('click', () => { createModal.style.display = 'none'; });
        document.getElementById('cancelCreation').addEventListener('click', () => { createModal.style.display = 'none'; });

        // Formulários dos modais
        document.getElementById('reminderForm').addEventListener('submit', handleReminderSubmit);
        document.getElementById('createObligationForm').addEventListener('submit', handleCreateObligation);
        
        // Fechar modal se clicar fora dele
        window.addEventListener('click', (event) => {
            if (event.target === reminderModal) reminderModal.style.display = 'none';
            if (event.target === confirmationModal) confirmationModal.style.display = 'none';
            if (event.target === createModal) createModal.style.display = 'none';
        });

        // Event Delegation para os botões da tabela
        tbody.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;

            const id = button.dataset.id;
            if (button.classList.contains('action-complete')) {
                markAsCompleted(button, id);
            } else if (button.classList.contains('action-reminder')) {
                addReminder(id);
            } else if (button.classList.contains('action-delete')) {
                deleteObligation(id);
            }
        });
    }

    // --- RENDERIZAÇÃO E CHAMADAS DE API ---

    async function loadCronogramaData() {
        try {
            const response = await fetch(`${API_BASE_URL}/cronograma`);
            if (!response.ok) throw new Error('Erro de rede.');
            renderObrigacoes(await response.json());
        } catch (error) {
            renderError('Não foi possível conectar à API.');
        }
    }

    function renderObrigacoes(obrigacoes) {
        tbody.innerHTML = '';
        if (!obrigacoes || obrigacoes.length === 0) {
            return renderError('Nenhuma obrigação encontrada.');
        }
        obrigacoes.forEach(obrigacao => {
            const row = document.createElement('tr');
            if (obrigacao.status === 'concluido') row.classList.add('completed');
            row.innerHTML = `
                <td>${obrigacao.descricao}</td><td>${obrigacao.mes}</td><td>${obrigacao.prazo}</td><td>${obrigacao.tipo}</td><td>${obrigacao.status}</td>
                <td class="action-buttons">
                    <button class="btn btn-success btn-sm action-complete" data-id="${obrigacao.id}">${obrigacao.status === 'concluido' ? 'Desfazer' : 'Concluído'}</button>
                    <button class="btn btn-primary btn-sm action-reminder" data-id="${obrigacao.id}">Lembrete</button>
                    <button class="btn btn-danger btn-sm action-delete" data-id="${obrigacao.id}">Apagar</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    function renderError(message) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">${message}</td></tr>`;
    }

    // --- FUNÇÕES DE AÇÃO ---
    
    async function markAsCompleted(button, id) {
        const newStatus = button.closest('tr').classList.contains('completed') ? 'pendente' : 'concluido';
        try {
            await fetch(`${API_BASE_URL}/cronograma/${id}`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus })
            });
            loadCronogramaData();
        } catch (error) { alert('Não foi possível salvar a alteração.'); }
    }

    async function deleteObligation(id) {
        if (!confirm('Tem certeza que deseja apagar esta obrigação?')) return;
        try {
            await fetch(`${API_BASE_URL}/cronograma/${id}`, { method: 'DELETE' });
            loadCronogramaData();
        } catch (error) { alert('Não foi possível apagar a obrigação.'); }
    }

    async function addReminder(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/cronograma/${id}`);
            if (!response.ok) throw new Error('Obrigação não encontrada.');
            const obrigacao = await response.json();
            document.getElementById('obligationId').value = id;
            document.getElementById('reminderMessage').value = `Lembrete: ${obrigacao.descricao}`;
            document.getElementById('reminderDate').min = new Date().toISOString().split('T')[0];
            reminderModal.style.display = 'block';
        } catch (error) { alert('Não foi possível buscar os dados da obrigação.'); }
    }

    async function handleReminderSubmit(event) {
        event.preventDefault();
        const obligationId = document.getElementById('obligationId').value;
        const date = document.getElementById('reminderDate').value;
        const message = document.getElementById('reminderMessage').value;
        if (!date) return alert("Por favor, selecione uma data para o lembrete.");

        const newReminder = { obrigacao_id: obligationId, titulo: message, data: date, status: 'ativo' };
        try {
            const response = await fetch(`${API_BASE_URL}/lembretes`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newReminder)
            });
            if (!response.ok) throw new Error('Falha ao salvar o lembrete.');
            const createdReminder = await response.json();
            const googleCalendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(createdReminder.titulo)}&dates=${createdReminder.data.replace(/-/g, '')}/${createdReminder.data.replace(/-/g, '')}`;
            document.getElementById('googleCalendarLink').href = googleCalendarLink;
            reminderModal.style.display = 'none';
            document.getElementById('reminderForm').reset();
            setTimeout(() => { confirmationModal.style.display = 'block'; }, 50);
        } catch (error) { alert('Não foi possível salvar o lembrete.'); }
    }

    async function handleCreateObligation(event) {
        event.preventDefault();
        const descricao = document.getElementById('newDescricao').value;
        const mes = document.getElementById('newMes').value;
        const prazoBruto = document.getElementById('newPrazo').value;
        const tipo = document.getElementById('newTipo').value;
        if (!descricao || !mes || !prazoBruto || !tipo) return alert('Por favor, preencha todos os campos.');
        const prazoFormatado = prazoBruto.split('-').reverse().join('/');
        const newObligation = { descricao, mes, prazo: prazoFormatado, tipo, status: 'pendente' };
        try {
            await fetch(`${API_BASE_URL}/cronograma`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newObligation)
            });
            createModal.style.display = 'none';
            document.getElementById('createObligationForm').reset();
            loadCronogramaData();
        } catch (error) { alert('Não foi possível salvar a nova obrigação.'); }
    }

    async function handleFilterByMonth() {
        const selectedMonth = document.getElementById('month').value;
        if (!selectedMonth) return loadCronogramaData();
        try {
            const response = await fetch(`${API_BASE_URL}/cronograma?mes=${selectedMonth}`);
            renderObrigacoes(await response.json());
        } catch (error) { alert("Não foi possível aplicar o filtro."); }
    }

    function handleClearFilter() {
        document.getElementById('month').value = '';
        loadCronogramaData();
    }

    // --- PONTO DE ENTRADA ---
    setupEventListeners();
    loadCronogramaData();
}