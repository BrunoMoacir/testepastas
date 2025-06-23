// ===================================================================
// ARQUIVO ÚNICO E COMPLETO DE LÓGICA DE LOGIN E CONTROLE
// ===================================================================

// --- 1. CONFIGURAÇÕES GLOBAIS ---
const LOGIN_URL = 'login.html';
const HOME_URL = 'index.html';
const API_URL = 'https://api-labirinto-fiscal.onrender.com';

let db_usuarios = [];
let usuarioCorrente = {};

// --- 2. FUNÇÕES DE LÓGICA PRINCIPAL ---

/**
 * Ponto de entrada do script. Age como um roteador.
 */
function initApp() {
    const estamosNaPaginaLogin = window.location.pathname.endsWith('/' + LOGIN_URL);

    if (estamosNaPaginaLogin) {
        // Se estamos na página de login, configura os formulários dela
        setupLoginPage();
    } else {
        // Se estamos em qualquer outra página, gerencia a autenticação
        handleAuthentication();
    }
}

/**
 * Configura os formulários e botões da PÁGINA DE LOGIN.
 */
function setupLoginPage() {
    carregarUsuarios(); // Carrega os usuários para poder validar o login
    const loginForm = document.getElementById('login-form');
    const btnSalvar = document.getElementById('btn_salvar');

    if (loginForm) {
        loginForm.addEventListener('submit', processaFormLogin);
    }
    if (btnSalvar) {
        btnSalvar.addEventListener('click', processaFormCadastro);
    }
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
    
    // Chama o script da página específica
    if (window.location.pathname.endsWith('/planejamento.html')) {
        if (typeof iniciarPaginaPlanejamento === 'function') iniciarPaginaPlanejamento();
    } else if (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html')) {
        if (typeof iniciarPaginaInicial === 'function') iniciarPaginaInicial();
    } else if (window.location.pathname.endsWith('/quiz.html')) {
        if (typeof iniciarPaginaQuiz === 'function') iniciarPaginaQuiz();
    } else if (window.location.pathname.endsWith('/verificador.html')) {
        if (typeof iniciarPaginaVerificador === 'function') iniciarPaginaVerificador();
    }
    else if (window.location.pathname.endsWith('/verificador.html')) {
        if (typeof iniciarPaginaVerificador === 'function') {
            iniciarPaginaVerificador();
        }
    } else if (window.location.pathname.endsWith('/videos.html')) {
        // CONDIÇÃO FINAL ADICIONADA AQUI
        if (typeof iniciarPaginaVideos === 'function') {
            iniciarPaginaVideos();
        }
    }
}

// --- 3. PROCESSAMENTO DE FORMULÁRIOS (Usado pela Página de Login) ---

function processaFormLogin(event) {
    event.preventDefault(); // Impede o recarregamento
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
    const nome = document.getElementById('txt_nome').value;
    const email = document.getElementById('txt_email').value;
    const login = document.getElementById('txt_login').value || email; // Usa email como login se vazio
    const senha = document.getElementById('txt_senha').value;
    const senha2 = document.getElementById('txt_senha2').value;

    if (!nome || !email || !senha) return alert('Por favor, preencha nome, email e senha.');
    if (senha !== senha2) return alert('As senhas não coincidem!');

    addUser(nome, login, senha, email);
}

// --- 4. FUNÇÕES DE DADOS E API ---

function carregarUsuarios() {
    fetch(API_URL)
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .then(data => { db_usuarios = data; console.log('Base de usuários carregada.'); })
        .catch(err => console.error("Falha ao carregar usuários.", err));
}

function loginUser(email, senha) {
    const usuarioEncontrado = db_usuarios.find(user => user.email === email && user.senha === senha);
    if (usuarioEncontrado) {
        sessionStorage.setItem('usuarioCorrente', JSON.stringify(usuarioEncontrado));
        return true;
    }
    return false;
}

function addUser(nome, login, senha, email) {
    const novoUsuario = { nome, login, senha, email };
    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoUsuario)
    })
    .then(res => res.ok ? res.json() : Promise.reject(res))
    .then(() => {
        alert("Usuário cadastrado com sucesso! Por favor, faça o login.");
        location.reload(); // Recarrega a página de login para limpar os campos
    })
    .catch(err => console.error("Falha ao cadastrar usuário.", err));
}

function logoutUser() {
    sessionStorage.removeItem('usuarioCorrente');
    window.location.href = LOGIN_URL;
}

// --- 5. FUNÇÕES DE INTERFACE (Usado pelas Páginas Autenticadas) ---

function showUserInfo(infoElementId, logoutElementId) {
    const userInfoEl = document.getElementById(infoElementId);
    const logoutEl = document.getElementById(logoutElementId);

    if (usuarioCorrente && usuarioCorrente.nome) {
        if (userInfoEl) userInfoEl.innerHTML = `Olá, ${usuarioCorrente.nome}!`;
        if (logoutEl) {
            logoutEl.innerHTML = `<a href="#" id="logout-link" class="logout">SAIR</a>`;
            document.getElementById('logout-link').addEventListener('click', (e) => {
                e.preventDefault();
                logoutUser();
            });
        }
    }
}

// --- PONTO DE ENTRADA DO SCRIPT ---
document.addEventListener('DOMContentLoaded', initApp);