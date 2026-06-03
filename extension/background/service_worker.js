// ============================================================
//  Veridion — service_worker.js
//  Roda em segundo plano, sem acesso às páginas.
//  Responsabilidades:
//    1. Abrir login sempre que não houver sessão ativa
//    2. Responder mensagens do scanner.js e popup.js
//    3. Gerenciar o token JWT no chrome.storage.local
// ============================================================

const BACKEND_URL = 'https://veridion-5tjh.onrender.com'; // Trocar pela URL real quando definida

// ------------------------------------------------------------
//  Helpers
// ------------------------------------------------------------

/** Retorna true se houver token salvo no storage. */
async function isLoggedIn() {
  const { token } = await chrome.storage.local.get('token');
  return !!token;
}

/**
 * Abre a página de login em nova aba.
 * Se ela já estiver aberta, apenas foca nessa aba.
 */
async function openLoginPage() {
  const loginUrl = chrome.runtime.getURL('pages/login/login.html');
  const existing = await chrome.tabs.query({ url: loginUrl });

  if (existing.length > 0) {
    await chrome.tabs.update(existing[0].id, { active: true });
    await chrome.windows.update(existing[0].windowId, { focused: true });
  } else {
    await chrome.tabs.create({ url: loginUrl });
  }
}

// ------------------------------------------------------------
//  Gatilhos de instalação e ativação
// ------------------------------------------------------------

/** Na primeira instalação e em atualizações, verifica a sessão e recria o menu de contexto. */
chrome.runtime.onInstalled.addListener(async () => {
  // Remove antes de recriar para evitar erro de ID duplicado em atualizações
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id:       'veridion-analisar-imagem',
      title:    'Analisar imagem com IA (Veridion)',
      contexts: ['image'],
    });
  });

  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    await openLoginPage();
  }
});

/**
 * Quando o usuário clica no ícone da extensão na barra do Chrome.
 * (Só funciona se o manifest.json NÃO tiver "default_popup" definido.)
 * Se tiver popup definido, remova este bloco.
 */
chrome.action.onClicked.addListener(async () => {
  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    await openLoginPage();
  }
});

// ------------------------------------------------------------
//  Central de mensagens
//  scanner.js e popup.js se comunicam via chrome.runtime.sendMessage()
// ------------------------------------------------------------

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  // --- Verifica se está logado (chamado pelo scanner antes de analisar) ---
  if (message.type === 'CHECK_AUTH') {
    isLoggedIn().then(loggedIn => {
      sendResponse({ loggedIn });
    });
    return true; // Mantém o canal aberto para a resposta assíncrona
  }

  // --- Login bem-sucedido: salva o token vindo da página de login ---
  if (message.type === 'LOGIN_SUCCESS') {
    chrome.storage.local.set({ token: message.token, user: message.user }, () => {
      // Fecha a aba de login após salvar
      if (sender.tab) {
        chrome.tabs.remove(sender.tab.id);
      }
      sendResponse({ success: true });
    });
    return true;
  }

  // --- Logout: limpa storage e reabre login ---
  if (message.type === 'LOGOUT') {
    chrome.storage.local.clear(() => {
      openLoginPage();
      sendResponse({ success: true });
    });
    return true;
  }

  // --- Retorna o token para quem precisar (ex: scanner.js no fetch) ---
  if (message.type === 'GET_TOKEN') {
    chrome.storage.local.get('token', ({ token }) => {
      sendResponse({ token: token || null });
    });
    return true;
  }

  // --- Retorna os dados do usuário logado (ex: popup.js) ---
  if (message.type === 'GET_USER') {
    chrome.storage.local.get('user', ({ user }) => {
      sendResponse({ user: user || null });
    });
    return true;
  }
});

// ------------------------------------------------------------
//  Botão direito em imagens → Analisar com IA
// ------------------------------------------------------------

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== 'veridion-analisar-imagem') return;

  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    openLoginPage();
    return;
  }

  // Avisa o scanner para abrir o widget e mostrar carregando
  chrome.tabs.sendMessage(tab.id, { type: 'ANALISANDO_IMAGEM' });

  const { token } = await chrome.storage.local.get('token');

  try {
    const response = await fetch(`${BACKEND_URL}/analisar-imagem`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ url_imagem: info.srcUrl }),
    });

    const dados = await response.json();

    if (!response.ok) {
      chrome.tabs.sendMessage(tab.id, { type: 'IMAGEM_ANALISADA', erro: dados.erro || 'Erro no servidor.' });
      return;
    }

    chrome.tabs.sendMessage(tab.id, { type: 'IMAGEM_ANALISADA', dados });

  } catch (err) {
    chrome.tabs.sendMessage(tab.id, { type: 'IMAGEM_ANALISADA', erro: 'Falha ao conectar ao servidor.' });
  }
});