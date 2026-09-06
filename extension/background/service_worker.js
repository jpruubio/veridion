// ============================================================
//  Veridion — service_worker.js
//  Roda em segundo plano, sem acesso às páginas.
//  Responsabilidades:
//    1. Abrir login sempre que não houver sessão ativa
//    2. Responder mensagens do scanner.js e popup.js
//    3. Gerenciar o token JWT no chrome.storage.local
// ============================================================

const BACKEND_URL = 'https://veridion-5tjh.onrender.com';

// ------------------------------------------------------------
//  Helpers
// ------------------------------------------------------------

/** Retorna true se houver token salvo no storage. */
async function isLoggedIn() {
  try {
    const { token } = await chrome.storage.local.get('token');
    return !!token;
  } catch (e) {
    return false;
  }
}

/**
 * Abre a página de login em nova aba.
 * Se ela já estiver aberta, apenas foca nessa aba.
 */
async function openLoginPage() {
  try {
    const loginUrl = chrome.runtime.getURL('pages/login/login.html');
    const existing = await chrome.tabs.query({ url: loginUrl });

    if (existing && existing.length > 0) {
      await chrome.tabs.update(existing[0].id, { active: true });
      if (existing[0].windowId) {
        await chrome.windows.update(existing[0].windowId, { focused: true });
      }
    } else {
      await chrome.tabs.create({ url: loginUrl });
    }
  } catch (err) {
    console.warn('[service_worker] Erro ao abrir página de login:', err);
  }
}

// ------------------------------------------------------------
//  Fila de Sincronização Offline (Veridion Trust Sync Queue)
// ------------------------------------------------------------

async function syncPendingReports() {
  try {
    const { pending_reports = [], token } = await chrome.storage.local.get(['pending_reports', 'token']);
    if (!pending_reports || !pending_reports.length) return;

    console.log(`[service_worker] Tentando sincronizar ${pending_reports.length} denúncia(s) pendente(s)...`);
    const remaining = [];

    for (const report of pending_reports) {
      try {
        const response = await fetch(`${BACKEND_URL}/report`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            url: report.url,
            motivo: report.category || report.motivo || 'golpe',
            estrelas: report.stars || 5,
            comentario: report.comment || report.comentario || ''
          })
        });

        if (!response.ok) {
          remaining.push(report);
        } else {
          console.log(`[service_worker] Denúncia para ${report.domain || report.url} sincronizada com sucesso!`);
        }
      } catch (e) {
        remaining.push(report);
      }
    }

    await chrome.storage.local.set({ pending_reports: remaining });
  } catch (err) {
    console.warn('[service_worker] Erro na sincronização de denúncias:', err);
  }
}

// ------------------------------------------------------------
//  Gatilhos de instalação e ativação
// ------------------------------------------------------------

chrome.runtime.onInstalled.addListener((details) => {
  try {
    chrome.contextMenus.removeAll(() => {
      if (chrome.runtime.lastError) {}
      chrome.contextMenus.create({
        id:       'veridion-analisar-imagem',
        title:    'Analisar imagem com IA (Veridion)',
        contexts: ['image'],
      }, () => {
        if (chrome.runtime.lastError) {}
      });
    });

    isLoggedIn().then(loggedIn => {
      if (!loggedIn) {
        openLoginPage();
      }
    }).catch(err => console.warn('[service_worker] Erro ao checar login:', err));

    syncPendingReports().catch(() => {});
  } catch (err) {
    console.warn('[service_worker] Erro onInstalled:', err);
  }
});

chrome.runtime.onStartup.addListener(() => {
  syncPendingReports().catch(err => console.warn('[service_worker] Erro onStartup:', err));
});

chrome.action.onClicked.addListener(async (tab) => {
  try {
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
      await openLoginPage();
      return;
    }
    
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_WIDGET' }, () => {
        if (chrome.runtime.lastError) {}
      });
    }
  } catch (err) {
    console.warn('[service_worker] Erro ao clicar no ícone:', err);
  }
});

// ------------------------------------------------------------
//  Central de mensagens
// ------------------------------------------------------------

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.type) return false;

  if (message.type === 'SYNC_REPORTS') {
    syncPendingReports()
      .then(() => sendResponse({ success: true }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (message.type === 'CHECK_AUTH') {
    isLoggedIn()
      .then(loggedIn => sendResponse({ loggedIn }))
      .catch(err => sendResponse({ loggedIn: false, error: err.message }));
    return true;
  }

  if (message.type === 'LOGIN_SUCCESS') {
    chrome.storage.local.set({ token: message.token, user: message.user }, () => {
      if (sender.tab && sender.tab.id) {
        chrome.tabs.remove(sender.tab.id).catch(() => {});
      }
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'LOGOUT') {
    chrome.storage.local.clear(() => {
      openLoginPage().catch(() => {});
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'GET_TOKEN') {
    chrome.storage.local.get('token', ({ token }) => {
      sendResponse({ token: token || null });
    });
    return true;
  }

  if (message.type === 'GET_USER') {
    chrome.storage.local.get('user', ({ user }) => {
      sendResponse({ user: user || null });
    });
    return true;
  }

  if (message.type === 'UPDATE_BADGE') {
    const score = message.score;
    if (score === null || score === undefined) {
      chrome.action.setBadgeText({ text: '' });
      sendResponse({ success: true });
      return false;
    }

    let text = score.toString();
    let color = '#3533cb';

    if (message.isImage) {
      if (message.isIa) {
        text = 'IA';
        color = '#d32f2f';
      } else {
        text = 'Real';
        color = '#3533cb';
      }
    } else {
      if (score <= 30) {
        color = '#d32f2f';
      } else if (score <= 60) {
        color = '#f57c00';
      }
    }

    chrome.action.setBadgeText({ text: text });
    chrome.action.setBadgeBackgroundColor({ color: color });
    sendResponse({ success: true });
    return false;
  }

  return false;
});

// ------------------------------------------------------------
//  Botão direito em imagens → Analisar com IA
// ------------------------------------------------------------

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== 'veridion-analisar-imagem') return;

  try {
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
      openLoginPage();
      return;
    }

    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'ANALISANDO_IMAGEM', url: info.srcUrl }, () => {
        if (chrome.runtime.lastError) {}
      });
    }

    const { token } = await chrome.storage.local.get('token');

    const response = await fetch(`${BACKEND_URL}/analisar-imagem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ url_imagem: info.srcUrl }),
    });

    const dados = await response.json();

    if (tab && tab.id) {
      if (!response.ok) {
        chrome.tabs.sendMessage(tab.id, { type: 'IMAGEM_ANALISADA', erro: dados.erro || 'Erro no servidor.' }, () => {
          if (chrome.runtime.lastError) {}
        });
        return;
      }

      chrome.tabs.sendMessage(tab.id, { type: 'IMAGEM_ANALISADA', dados }, () => {
        if (chrome.runtime.lastError) {}
      });
    }
  } catch (err) {
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'IMAGEM_ANALISADA', erro: 'Falha ao conectar ao servidor.' }, () => {
        if (chrome.runtime.lastError) {}
      });
    }
  }
});