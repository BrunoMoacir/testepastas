function iniciarPaginaQuiz() {
    const API_BASE_URL = 'https://api-labirinto-fiscal.onrender.com';

    // Variáveis e seleção de elementos (sem alterações)
    let quizData = {};
    let perguntaAtual = 0;
    let respostasUsuario = [];
    const elements = {
        tituloQuiz: document.querySelector('.quiz-header h1'),
        descricaoQuiz: document.querySelector('.quiz-header p'),
        progressoBar: document.querySelector('.progresso-bar'),
        perguntaTexto: document.querySelector('.pergunta-texto'),
        opcoesContainer: document.querySelector('.opcoes-container'),
        btnVoltar: document.querySelector('.btn-voltar'),
        btnPular: document.querySelector('.btn-pular'),
        btnProximo: document.querySelector('.btn-proximo'),
        quizContainer: document.querySelector('.quiz-container')
    };

    async function carregarQuiz() {
        try {
            const response = await fetch(`${API_BASE_URL}/quizzes`);
            if (!response.ok) throw new Error('API não respondeu corretamente');
            const data = await response.json();
            quizData = Array.isArray(data) ? data[0] : data;
            if (!quizData || !quizData.perguntas) throw new Error('Dados do quiz em formato inválido');
            iniciarQuiz();
        } catch (error) {
            console.error('Erro ao carregar o quiz:', error);
            elements.perguntaTexto.textContent = 'Erro ao carregar o quiz. Verifique o Console (F12).';
        }
    }
    
    // ... (as funções iniciarQuiz, renderizarPergunta, avançar, voltar, etc. continuam aqui, sem alterações) ...

    function iniciarQuiz() {
        perguntaAtual = 0;
        respostasUsuario = [];
        elements.tituloQuiz.textContent = quizData.titulo;
        elements.descricaoQuiz.textContent = quizData.descricao;
        elements.btnProximo.style.display = 'inline-block';
        elements.btnPular.style.display = 'inline-block';
        elements.btnVoltar.style.display = 'inline-block';
        elements.btnVoltar.textContent = 'Voltar';
        elements.btnProximo.addEventListener('click', avancarPergunta);
        elements.btnVoltar.addEventListener('click', voltarPergunta);
        elements.btnPular.addEventListener('click', pularPergunta);
        elements.quizContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('refazer-quiz')) {
                iniciarQuiz();
            }
        });
        renderizarPergunta();
    }
    
    function renderizarPergunta() {
        const pergunta = quizData.perguntas[perguntaAtual];
        const progresso = ((perguntaAtual + 1) / quizData.perguntas.length) * 100;
        elements.progressoBar.style.width = `${progresso}%`;
        elements.perguntaTexto.textContent = pergunta.texto;
        elements.opcoesContainer.innerHTML = '';
        pergunta.opcoes.forEach(opcao => {
            const opcaoElement = document.createElement('label');
            opcaoElement.className = 'opcao';
            opcaoElement.innerHTML = `<input type="${pergunta.tipo}" name="resposta" value="${opcao.valor}"> <span>${opcao.texto}</span>`;
            elements.opcoesContainer.appendChild(opcaoElement);
        });
        elements.btnVoltar.disabled = perguntaAtual === 0;
    }
    
    function avancarPergunta() {
        const opcaoSelecionada = document.querySelector('input[name="resposta"]:checked');
        if (!opcaoSelecionada) return alert('Por favor, selecione uma opção para continuar.');
        respostasUsuario.push({ perguntaId: quizData.perguntas[perguntaAtual].id, resposta: opcaoSelecionada.value });
        if (perguntaAtual < quizData.perguntas.length - 1) {
            perguntaAtual++;
            renderizarPergunta();
        } else {
            finalizarQuiz();
        }
    }
    
    function voltarPergunta() {
        if (perguntaAtual > 0) {
            perguntaAtual--;
            respostasUsuario.pop();
            renderizarPergunta();
        }
    }
    
    function pularPergunta() {
        if (confirm('Deseja pular esta pergunta?')) {
             if (perguntaAtual < quizData.perguntas.length - 1) {
                perguntaAtual++;
                renderizarPergunta();
            } else {
                finalizarQuiz();
            }
        }
    }

    async function finalizarQuiz() {
        const contagem = {};
        respostasUsuario.forEach(resp => { contagem[resp.resposta] = (contagem[resp.resposta] || 0) + 1; });
        const perfil = Object.keys(contagem).length ? Object.keys(contagem).reduce((a, b) => contagem[a] > contagem[b] ? a : b) : 'A';
        const resultado = quizData.resultados.chaveResultado[perfil];

        // Esconde os botões e limpa o texto da pergunta
        elements.btnProximo.style.display = 'none';
        elements.btnPular.style.display = 'none';
        elements.btnVoltar.style.display = 'none';
        elements.perguntaTexto.innerHTML = '';
        
        // Monta a tela de resultado
        elements.opcoesContainer.innerHTML = `
            <div class="tela-resultado">
                <h1>${quizData.titulo}</h1>
                <h2>${resultado.perfil}</h2>
                <p>${resultado.descricao}</p>
                <div id="curiosidades-box"></div>  <button class="refazer-quiz btn">Refazer Quiz</button>
            </div>`;

        // ====================================================================
        // === BLOCO DE CÓDIGO RESTAURADO PARA BUSCAR AS CURIOSIDADES ===
        // ====================================================================
        try {
            const response = await fetch(`${API_BASE_URL}/curiosidades`);
            const curiosidades = await response.json();
            const curiosidadeEncontrada = curiosidades.find(item => item.categoria === resultado.perfil);
            if (curiosidadeEncontrada) {
                exibirCuriosidades(curiosidadeEncontrada);
            }
        } catch (error) {
            console.error('Erro ao buscar curiosidades:', error);
        }
        // ====================================================================

        await enviarRespostas();
    }

    // NOVA FUNÇÃO RESTAURADA para exibir as curiosidades
    function exibirCuriosidades(dados) {
        const curiosidadesBox = document.getElementById('curiosidades-box');
        if (!curiosidadesBox) return;
        curiosidadesBox.innerHTML = `
            <div class="curiosidades-box">
                <h3>Você Sabia?</h3>
                <p class="destaque">${dados.curiosidade}</p>
                <p>${dados.reflexao}</p>
                <div class="dado-chave">${dados.dado_chave}</div>
            </div>
        `;
    }

    async function enviarRespostas() {
        try {
            await fetch(`${API_BASE_URL}/respostas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    usuario: typeof usuarioCorrente !== 'undefined' ? usuarioCorrente.login : 'anonimo',
                    respostas: respostasUsuario,
                    data: new Date().toISOString()
                })
            });
        } catch (error) {
            console.error('Erro ao enviar respostas:', error);
        }
    }

    // Ponto de entrada do script do quiz
    carregarQuiz();
}
document.addEventListener('DOMContentLoaded', iniciarPaginaQuiz);