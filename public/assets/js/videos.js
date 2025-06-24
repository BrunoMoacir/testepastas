function iniciarPaginaVideos() {
    // --- SELEÇÃO DE ELEMENTOS ---
    const addVideoBtn = document.getElementById('addVideoBtn');
    const addVideoForm = document.getElementById('addVideoForm');
    const videoUrlInput = document.getElementById('videoUrl');
    const videoTitleInput = document.getElementById('videoTitle');
    const videoDescriptionInput = document.getElementById('videoDescription');
    const confirmAddBtn = document.getElementById('confirmAdd');
    const cancelAddBtn = document.getElementById('cancelAdd');
    const videoContainer = document.getElementById('videoContainer');

    // --- LÓGICA DE EVENTOS ---

    // Adiciona evento ao botão "Adicionar Vídeo"
    addVideoBtn.addEventListener('click', () => {
        addVideoForm.classList.remove('hidden');
        addVideoBtn.style.display = 'none';
    });

    // Adiciona evento ao botão "Cancelar"
    cancelAddBtn.addEventListener('click', () => {
        addVideoForm.classList.add('hidden');
        addVideoBtn.style.display = 'block';
    });

    // Adiciona evento ao botão "Confirmar"
    confirmAddBtn.addEventListener('click', addNewVideo);

    // Adiciona evento para deletar vídeos (usando event delegation)
    videoContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-btn')) {
            const videoCard = event.target.closest('.video-card');
            if (confirm('Tem certeza que deseja excluir este vídeo?')) {
                videoCard.remove();
            }
        }
    });

    // --- FUNÇÕES ---

    function extractVideoId(url) {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : null;
    }

    function addNewVideo() {
        const url = videoUrlInput.value.trim();
        const title = videoTitleInput.value.trim() || 'Novo Vídeo sobre MEI';
        const description = videoDescriptionInput.value.trim() || 'Conteúdo educativo sobre Microempreendedor Individual.';
        
        if (!url) return alert('Por favor, insira um link do YouTube.');
        
        const videoId = extractVideoId(url);
        if (!videoId) return alert('Link do YouTube inválido.');

        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        videoCard.innerHTML = `
            <div class="video-wrapper">
                <iframe src="https://www.youtube.com/embed/${videoId}" title="${title}" frameborder="0" allowfullscreen></iframe>
            </div>
            <div class="video-description">
                <h3>${title}</h3>
                <p>${description}</p>
            </div>
            <button class="delete-btn" title="Excluir vídeo">🗑️</button>
        `;
        videoContainer.appendChild(videoCard);
        
        // Limpa e esconde o formulário
        videoUrlInput.value = '';
        videoTitleInput.value = '';
        videoDescriptionInput.value = '';
        addVideoForm.classList.add('hidden');
        addVideoBtn.style.display = 'block';
    }
}
document.addEventListener('DOMContentLoaded', iniciarPaginaVideos);