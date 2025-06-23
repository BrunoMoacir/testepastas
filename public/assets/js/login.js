// ===================================================================
// ARQUIVO ÚNICO E COMPLETO DE LÓGICA DE LOGIN E CONTROLE (VERSÃO FINAL)
// ===================================================================

const LOGIN_URL = 'login.html';
const HOME_URL = 'index.html';
// IMPORTANTE: Esta deve ser a URL do seu Web Service no Render
const API_URL = 'https://api-labirinto-fiscal.onrender.com/usuarios';

let db_usuarios = [];
let usuarioCorrente = {};

/**
 * Ponto de entrada do script. Roda quando o HTML está pronto.
 */
function initApp() {
    const path = window.location.pathname;
    const estamosNaPaginaLogin = path.endsWith('/' + LOGIN_URL) || path.endsWith('/');

    if (estamosNaPaginaLogin) {
        setupLoginPage();
    } else {
        handleAuthentication();
    }
}

/**
 * Configura os formulários e botões da PÁGINA DE LOGIN.
 */
function setupLoginPage() {
    const loginForm = document.getElementById('login-form');
    const btnSalvar = document.getElementById('btn_salvar');
    const loginButton = loginForm ? loginForm.querySelector('button[type=submit]') : null;

    if (loginForm && loginButton) {
        // MUDANÇA: Desabilita o botão de login enquanto carrega os usuários
        loginButton.disabled = true;
        loginButton.textContent = 'Carregando...';
        loginForm.addEventListener('submit', processaFormLogin);
    }
    if (btnSalvar) {
        btnSalvar.addEventListener('click', processaFormCadastro);
    }
    
    // Carrega os usuários e reabilita o botão quando terminar
    carregarUsuarios(loginButton); 
}

/**
 * Gerencia a autenticação em TODAS AS OUTRAS PÁGINAS.
 */
function handleAuthentication() {
    const usuarioJSON = sessionStorage.getItem('usuarioCorrente');

    if (!usuarioJSON) {
        sessionStorage.setItem('returnURL', window.location.pathname);
        window.location.href = LOGIN_URL;
        return;
    }
    
    usuarioCorrente = JSON.parse(usuarioJSON);
    showUserInfo('userInfo', 'logout-container');
    
    const path = window.location.pathname;
    if (path.endsWith('/planejamento.html')) {
        if (typeof iniciarPaginaPlanejamento === 'function') iniciarPaginaPlanejamento();
    } else if (path.endsWith('/index.html')) {
        if (typeof iniciarPaginaInicial === 'function') iniciarPaginaInicial();
    } // ... adicione outras páginas aqui ...
}

// ... (O resto das funções como processaFormLogin, processaFormCadastro, etc. continuam as mesmas) ...

function processaFormLogin(event) {
    event.preventDefault();
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (loginUser(email, password)) {
        const returnUrl = sessionStorage.getItem('returnURL') || HOME_URL;
        window.location.href = returnUrl.includes(LOGIN_URL) ? HOME_URL : returnUrl;
    } else {
        alert('Email ou senha inválidos!');
    }
}

function processaFormCadastro() {
    // ... (código da função sem alteração) ...
}

/**
 * Carrega a lista de usuários da API e habilita o botão de login ao final.
 * @param {HTMLButtonElement} loginButton - O botão de login a ser habilitado.
 */
function carregarUsuarios(loginButton) {
    fetch(API_URL)
        .then(res => {
            if (!res.ok) { throw new Error('A API não respondeu corretamente'); }
            return res.json();
        })
        .then(data => { 
            db_usuarios = data; 
            console.log('Base de usuários online carregada com sucesso.'); 
            // MUDANÇA: Habilita o botão de login quando os dados chegam
            if (loginButton) {
                loginButton.disabled = false;
                loginButton.textContent = 'Login';
            }
        })
        .catch(err => {
            console.error("Falha CRÍTICA ao carregar usuários.", err);
            alert("ERRO: Não foi possível conectar ao servidor de dados. Recarregue a página.");
            // MUDANÇA: Informa o erro no botão
            if (loginButton) {
                loginButton.textContent = 'Erro ao Carregar';
            }
        });
}

function loginUser(email, senha) {
    if (db_usuarios.length === 0) {
        console.warn("Tentativa de login com base de usuários vazia.");
        return false;
    }
    const usuarioEncontrado = db_usuarios.find(user => user.email === email && user.senha === senha);
    if (usuarioEncontrado) {
        sessionStorage.setItem('usuarioCorrente', JSON.stringify(usuarioEncontrado));
        return true;
    }
    return false;
}

function logoutUser() {
    sessionStorage.removeItem('usuarioCorrente');
    window.location.href = LOGIN_URL;
}

function showUserInfo(infoElementId, logoutElementId) {
    // ... (código da função sem alteração) ...
}

// --- PONTO DE ENTRADA DO SCRIPT ---
document.addEventListener('DOMContentLoaded', initApp);