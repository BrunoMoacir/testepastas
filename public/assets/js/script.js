function iniciarPaginaInicial() {
    
    // ===================================================
    // PARTE 1: LÓGICA DA SEÇÃO DE DÚVIDAS (JÁ EXISTENTE)
    // ===================================================
    const answers = {
        'irpj': { question: "O que é IRPJ?", answer: "O Imposto de Renda da Pessoa Jurídica (IRPJ) é um tributo federal que incide sobre o lucro das empresas..." },
        'onde-comecar': { question: "Onde eu começo?", answer: "O melhor ponto de partida é entender sua situação: você é pessoa física (CPF) ou jurídica (CNPJ)?..." },
        'irpf': { question: "O que é Imposto de Renda (IRPF)?", answer: "O Imposto de Renda da Pessoa Física (IRPF) é um tributo federal cobrado anualmente sobre os ganhos de cidadãos..." },
        'nao-declarar': { question: "O que acontece se eu não declarar meus impostos?", answer: "Não declarar impostos, estando obrigado, pode deixar seu CPF 'pendente de regularização'..." },
        'nota-fiscal': { question: "Preciso emitir nota fiscal? Como faço?", answer: "Sim, empresas (CNPJ) e muitos autônomos precisam emitir nota fiscal para registrar suas operações..." },
        'pagar-mei': { question: "Como faço para pagar os impostos do meu MEI?", answer: "O imposto do MEI é pago através do Documento de Arrecadação do Simples Nacional (DAS)..." },
        'tipos-impostos': { question: "Quais são os principais tipos de impostos no Brasil?", answer: "Os impostos se dividem em Federais (Imposto de Renda, INSS), Estaduais (ICMS) e Municipais (ISS)..." },
        'restituicao': { question: "O que é a restituição do Imposto de Renda?", answer: "A restituição é a devolução do dinheiro que você pagou a mais de imposto durante o ano..." }
    };

    const questionsList = document.getElementById('questions-list');
    const answerBox = document.getElementById('answer-box');
    
    if (questionsList && answerBox) {
        const allQuestions = questionsList.querySelectorAll('li');
        questionsList.addEventListener('click', (event) => {
            if (event.target && event.target.nodeName === 'LI') {
                const key = event.target.dataset.key;
                allQuestions.forEach(li => li.classList.remove('active'));
                event.target.classList.add('active');
                if (answers[key]) {
                    answerBox.innerHTML = `<h3>${answers[key].question}</h3><p>${answers[key].answer}</p>`;
                }
            }
        });
    }

    // ============================================================
    // PARTE 2: LÓGICA DA CALCULADORA DE DAS (ADICIONADA AQUI)
    // ============================================================
    const calculateBtn = document.getElementById('calculate-das-btn');
    
    // Verificação para garantir que o botão existe na página
    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            // 1. Pega os valores dos campos
            const activity = document.getElementById('activity-type').value;
            const revenue = parseFloat(document.getElementById('monthly-revenue').value) || 0;

            // 2. Valores base para 2025 (INSS: 5% do salário mínimo de R$1.518,00)
            const VALOR_INSS = 75.90;
            const VALOR_ICMS = 1.00;
            const VALOR_ISS = 5.00;
            let dasValue = 0;

            // 3. Calcula o valor do DAS com base na atividade
            switch (activity) {
                case 'comercio_industria':
                    dasValue = VALOR_INSS + VALOR_ICMS;
                    break;
                case 'servicos':
                    dasValue = VALOR_INSS + VALOR_ISS;
                    break;
                case 'comercio_servicos':
                    dasValue = VALOR_INSS + VALOR_ICMS + VALOR_ISS;
                    break;
            }

            // 4. Verifica o limite de faturamento (Limite anual de R$ 81.000 / 12 meses)
            const LIMITE_MENSAL_PROPORCIONAL = 6750.00;
            let warningMessage = '';
            let resultClass = 'result-box';

            if (revenue > 0 && revenue > LIMITE_MENSAL_PROPORCIONAL) {
                warningMessage = `<p class="limit-alert">⚠️ **Atenção:** Seu faturamento neste mês ultrapassou a média de R$ 6.750,00. Monitore seu faturamento anual para não exceder o teto de R$ 81.000,00 do MEI.</p>`;
                resultClass = 'result-box warning';
            }

            // 5. Exibe o resultado na tela
            const resultDiv = document.getElementById('das-result');
            resultDiv.className = resultClass;
            resultDiv.innerHTML = `
                <h3>R$ ${dasValue.toFixed(2).replace('.', ',')}</h3>
                <p>Este é o valor fixo do seu DAS para a atividade selecionada. Ele não muda com o faturamento mensal.</p>
                ${warningMessage}
            `;
        });
    }
}