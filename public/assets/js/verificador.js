function iniciarPaginaVerificador() {

    // Função para carregar conteúdo MEI do arquivo JSON
    async function carregarConteudoMEI() {
        try {
            // CORREÇÃO: O JS vai procurar por este arquivo dentro da pasta 'public'
            const response = await fetch('mei-content.json');
            if (!response.ok) throw new Error('Arquivo não encontrado');
            const data = await response.json();
            
            const container = document.getElementById('mei-content');
            container.innerHTML = ''; // Limpa o container antes de adicionar
            data.conteudoMEI.forEach(item => {
                const card = document.createElement('div');
                card.className = 'content-card';
                card.innerHTML = `
                    <h3>${item.titulo}</h3>
                    <p>${item.descricao}</p>
                `;
                container.appendChild(card);
            });
        } catch (error) {
            console.error('Erro ao carregar conteúdo MEI:', error);
            const container = document.getElementById('mei-content');
            container.innerHTML = `<p style="color: red; text-align: center;">Não foi possível carregar as informações sobre MEI.</p>`;
        }
    }

    // Função para configurar o verificador de URLs
    function configurarVerificadorURL() {
        const form = document.getElementById('url-form');
        const input = document.getElementById('url-input');
        const resultado = document.getElementById('resultado');
        
        form.addEventListener('submit', function(e) {
            e.preventDefault(); // Impede o recarregamento da página
            const url = input.value.trim();
            if (!url) return;
            
            // Lógica de verificação
            try {
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

    // PONTO DE ENTRADA DESTE SCRIPT
    carregarConteudoMEI();
    configurarVerificadorURL();
}