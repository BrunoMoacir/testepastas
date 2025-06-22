// VERSÃO FINAL CORRIGIDA DO verificador.js

function iniciarPaginaVerificador() {

    // --- FUNÇÕES DA PÁGINA ---

    // Função que configura o formulário de verificação de URL
    function configurarVerificadorURL() {
        const form = document.getElementById('url-form');
        const input = document.getElementById('url-input');
        const resultado = document.getElementById('resultado');

        // Garante que o código não quebre se os elementos não existirem
        if (!form || !input || !resultado) {
            console.error("Elementos do formulário de verificação não encontrados.");
            return;
        }
        
        form.addEventListener('submit', function(e) {
            e.preventDefault(); // Impede o recarregamento da página
            const url = input.value.trim();
            if (!url) return;
            
            // Lógica de verificação
            try {
                // Limpa a URL para análise (remove http, https, www, etc.)
                let urlLimpa = url.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

                if (urlLimpa.endsWith('.gov.br')) {
                    resultado.innerHTML = `✅ Site oficial do governo: <strong>${urlLimpa}</strong>`;
                    resultado.className = 'resultado sucesso';
                } else {
                    resultado.innerHTML = `❌ Site não oficial: <strong>${urlLimpa}</strong>`;
                    resultado.className = 'resultado erro';
                }
            } catch (error) {
                resultado.innerHTML = `URL inválida.`;
                resultado.className = 'resultado erro';
            }
        });
    }

    // Função que configura o checklist (se você implementou a melhoria)
    function setupChecklist() {
        const cards = document.querySelectorAll('.link-card');
        if (cards.length === 0) return; // Sai se não houver cards

        // Carrega o estado salvo do checklist
        function carregarEstado() {
            cards.forEach(card => {
                const topicId = card.dataset.topic;
                const checkbox = card.querySelector('.form-check-input');
                if (topicId && checkbox) {
                    const isCompleted = localStorage.getItem('checklist-' + topicId) === 'true';
                    if (isCompleted) {
                        card.classList.add('completed');
                        checkbox.checked = true;
                    }
                }
            });
        }

        // Adiciona o "escutador" para cada card
        cards.forEach(card => {
            const checkbox = card.querySelector('.form-check-input');
            const topicId = card.dataset.topic;

            if (checkbox && topicId) {
                checkbox.addEventListener('change', () => {
                    if (checkbox.checked) {
                        card.classList.add('completed');
                        localStorage.setItem('checklist-' + topicId, 'true');
                    } else {
                        card.classList.remove('completed');
                        localStorage.setItem('checklist-' + topicId, 'false');
                    }
                });
            }
        });

        carregarEstado();
    }


    // --- PONTO DE ENTRADA (INICIALIZAÇÃO) ---
    // Chama as funções para configurar a página
    console.log("Iniciando a página do Verificador...");
    configurarVerificadorURL();
    setupChecklist(); 
}