// BACKEND_URL vem de shared/config.js, carregado antes deste arquivo no config.html

// Navegação para a Comunidade
document.getElementById('nav-btn-comunidade').addEventListener('click', () => {
    window.open(chrome.runtime.getURL('pages/comunidade/comunidade.html'), '_blank');
});

// Abas de Histórico
const tabComments = document.getElementById('tab-btn-comments');
const tabAnalyses = document.getElementById('tab-btn-analyses');
const sectionComments = document.getElementById('history-comments-section');
const sectionAnalyses = document.getElementById('history-analyses-section');

tabComments.addEventListener('click', () => {
    tabComments.classList.add('active');
    tabAnalyses.classList.remove('active');
    sectionComments.classList.add('active');
    sectionAnalyses.classList.remove('active');
});

tabAnalyses.addEventListener('click', () => {
    tabAnalyses.classList.add('active');
    tabComments.classList.remove('active');
    sectionAnalyses.classList.add('active');
    sectionComments.classList.remove('active');
});

// Modais
const upgradeModal = document.getElementById('upgrade-modal');
const btnUpgradeTrigger = document.getElementById('btn-plan-upgrade');
const btnUpgradeClose = document.getElementById('upgrade-modal-close');
const btnCopyPixKey = document.getElementById('btn-copy-pix-key');
const btnPayConfirm = document.getElementById('upgrade-modal-pay-confirm');
const upgradeSuccessBox = document.getElementById('upgrade-success-message');

if (btnUpgradeTrigger) {
    btnUpgradeTrigger.addEventListener('click', () => {
        upgradeSuccessBox.classList.add('hidden');
        upgradeModal.classList.remove('hidden');
    });
}

if (btnUpgradeClose) {
    btnUpgradeClose.addEventListener('click', () => upgradeModal.classList.add('hidden'));
}

if (btnCopyPixKey) {
    btnCopyPixKey.addEventListener('click', () => {
        const input = document.getElementById('pix-copy-input');
        if (input) {
            input.select();
            navigator.clipboard.writeText(input.value);
            btnCopyPixKey.innerHTML = '<i class="ti ti-check"></i> Chave Copiada!';
            setTimeout(() => {
                btnCopyPixKey.innerHTML = '<i class="ti ti-copy"></i> Copiar Chave Pix';
            }, 2500);
        }
    });
}

if (btnPayConfirm) {
    btnPayConfirm.addEventListener('click', async () => {
        // Salva estado premium no storage local
        await chrome.storage.local.set({ isPremium: true });
        
        // Exibe caixa de sucesso
        upgradeSuccessBox.classList.remove('hidden');
        btnPayConfirm.disabled = true;
        btnPayConfirm.innerHTML = '<i class="ti ti-crown"></i> Plano Premium Ativo!';
        
        // Atualiza a UI do plano
        atualizarUIPlanoPremium();

        setTimeout(() => {
            upgradeModal.classList.add('hidden');
            btnPayConfirm.disabled = false;
            btnPayConfirm.innerHTML = '<i class="ti ti-check"></i> Já efetuei o pagamento';
        }, 1800);
    });
}

function atualizarUIPlanoPremium() {
    chrome.storage.local.get('isPremium', ({ isPremium }) => {
        if (isPremium) {
            const btnUpgrade = document.getElementById('btn-plan-upgrade');
            if (btnUpgrade) {
                btnUpgrade.textContent = '⚡ Plano Premium Ativo';
                btnUpgrade.style.background = 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)';
                btnUpgrade.style.color = 'white';
            }
            
            const profileHeaderTitle = document.querySelector('.profile-panel h3');
            if (profileHeaderTitle) {
                let badgeEl = document.getElementById('premium-profile-badge');
                if (!badgeEl) {
                    badgeEl = document.createElement('span');
                    badgeEl.id = 'premium-profile-badge';
                    badgeEl.className = 'offline-badge';
                    badgeEl.style.background = '#e8f5e9';
                    badgeEl.style.color = '#2e7d32';
                    badgeEl.style.borderColor = '#a5d6a7';
                    badgeEl.innerHTML = '<i class="ti ti-crown"></i> Veridion Premium';
                    profileHeaderTitle.appendChild(badgeEl);
                }
            }
        }
    });
}

// Modal de Avatares
const avatarModal = document.getElementById('avatar-modal');
const btnChangeAvatar = document.getElementById('btn-change-avatar');
const btnAvatarClose = document.getElementById('avatar-modal-close');
const avatarImgEl = document.getElementById('profile-avatar-img');

let selectedAvatarName = 'avatar1.svg';

btnChangeAvatar.addEventListener('click', () => avatarModal.classList.remove('hidden'));
btnAvatarClose.addEventListener('click', () => avatarModal.classList.add('hidden'));

document.querySelectorAll('.avatar-select-item').forEach(item => {
    item.addEventListener('click', (e) => {
        const avatar = e.target.getAttribute('data-avatar');
        selectedAvatarName = avatar;
        avatarImgEl.src = `avatars/${avatar}`;
        avatarModal.classList.add('hidden');
    });
});

// Inicialização de Página
document.addEventListener('DOMContentLoaded', async () => {
    const authResp = await chrome.runtime.sendMessage({ type: 'CHECK_AUTH' });
    if (!authResp.loggedIn) {
        window.location.href = '../login/login.html';
        return;
    }

    // Carrega preferências do Chrome storage
    carregarPreferencias();

    // Carrega Perfil do Servidor
    await carregarPerfil();
});

// Gerenciamento de preferências locais no chrome.storage
async function carregarPreferencias() {
    const settings = await chrome.storage.local.get(['desativadoWidget', 'bloqueadorFalsos', 'bloqueadorAdulto', 'darkMode']);
    
    // Switch de ativação da extensão
    const activeWidgetInput = document.getElementById('toggle-active-extension');
    activeWidgetInput.checked = !settings.desativadoWidget;
    activeWidgetInput.addEventListener('change', (e) => {
        chrome.storage.local.set({ desativadoWidget: !e.target.checked });
    });

    // Switch de typosquatting
    const typoBlockerInput = document.getElementById('toggle-typo-blocker');
    typoBlockerInput.checked = settings.bloqueadorFalsos !== false;
    typoBlockerInput.addEventListener('change', (e) => {
        chrome.storage.local.set({ bloqueadorFalsos: e.target.checked });
    });

    // Switch do bloqueador adulto (+18 mockado)
    const adultBlockerInput = document.getElementById('toggle-adult-blocker');
    adultBlockerInput.checked = !!settings.bloqueadorAdulto;
    adultBlockerInput.addEventListener('change', (e) => {
        chrome.storage.local.set({ bloqueadorAdulto: e.target.checked });
    });

    // Switch de dark mode
    const darkModeInput = document.getElementById('toggle-dark-mode');
    darkModeInput.checked = !!settings.darkMode;
    toggleTheme(!!settings.darkMode);
    
    darkModeInput.addEventListener('change', (e) => {
        const isDark = e.target.checked;
        toggleTheme(isDark);
        chrome.storage.local.set({ darkMode: isDark });
    });
}

function toggleTheme(isDark) {
    if (isDark) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// Botão de Logout
const btnLogoutConfig = document.getElementById('btn-config-logout');
if (btnLogoutConfig) {
    btnLogoutConfig.addEventListener('click', async () => {
        await chrome.runtime.sendMessage({ type: 'LOGOUT' });
    });
}

// Carregar Perfil, análises e denúncias com resiliência offline total
async function carregarPerfil() {
    let token = null;
    let user = null;

    try {
        const authData = await chrome.runtime.sendMessage({ type: 'GET_TOKEN' });
        token = authData ? authData.token : null;
        const userData = await chrome.runtime.sendMessage({ type: 'GET_USER' });
        user = userData ? userData.user : null;
    } catch (err) {
        console.warn('[Veridion Config] Erro ao recuperar sessão do Chrome:', err);
    }

    try {
        if (!token) throw new Error('Token de autenticação não encontrado');

        const res = await fetch(`${BACKEND_URL}/usuario/perfil`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error(`Servidor respondeu com HTTP ${res.status}`);

        const dados = await res.json();
        if (dados && dados.usuario) {
            await chrome.storage.local.set({ userProfileCache: dados });
            renderizarDadosPerfil(dados, false);
            return;
        }
        throw new Error('Retorno de perfil inválido do servidor');

    } catch (e) {
        console.warn('[Veridion Config] Backend indisponível ou offline. Carregando dados locais...', e.message);
        
        const { userProfileCache, local_trust_history = [] } = await chrome.storage.local.get(['userProfileCache', 'local_trust_history']);
        
        if (userProfileCache && userProfileCache.usuario) {
            renderizarDadosPerfil(userProfileCache, true);
        } else {
            const dadosFallback = {
                usuario: {
                    nome_completo: (user && (user.nome_completo || user.nome)) || 'Usuário Veridion',
                    email: (user && user.email) || 'usuario@veridion.ai',
                    avatar_url: 'avatar1.svg'
                },
                denuncias: local_trust_history || [],
                votos: [],
                analises: []
            };
            renderizarDadosPerfil(dadosFallback, true);
        }
    }
}

function renderizarDadosPerfil(dados, isOffline = false) {
    if (!dados || !dados.usuario) return;

    const nameInput = document.getElementById('profile-name');
    const emailInput = document.getElementById('profile-email');

    if (nameInput) nameInput.value = dados.usuario.nome_completo || '';
    if (emailInput) emailInput.value = dados.usuario.email || '';
    
    if (dados.usuario.avatar_url && avatarImgEl) {
        selectedAvatarName = dados.usuario.avatar_url;
        avatarImgEl.src = `avatars/${dados.usuario.avatar_url}`;
    }

    const existingOfflineBadge = document.getElementById('offline-profile-badge');
    if (existingOfflineBadge) existingOfflineBadge.remove();

    atualizarUIPlanoPremium();

    let denunciasFinal = Array.isArray(dados.denuncias) ? dados.denuncias : [];
    if (isOffline) {
        chrome.storage.local.get(['local_trust_history'], ({ local_trust_history = [] }) => {
            const idsExistentes = new Set(denunciasFinal.map(d => d.id));
            (local_trust_history || []).forEach(lh => {
                if (lh && !idsExistentes.has(lh.id)) denunciasFinal.unshift(lh);
            });
            renderizarMinhasDenuncias(denunciasFinal, dados.votos || []);
        });
    } else {
        renderizarMinhasDenuncias(denunciasFinal, dados.votos || []);
    }

    renderizarMinhasVerificacoes(dados.analises || []);
}

function renderizarMinhasDenuncias(denuncias = [], votos = []) {
    const listEl = document.getElementById('personal-denuncias-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const safeDenuncias = Array.isArray(denuncias) ? denuncias : [];
    const safeVotos = Array.isArray(votos) ? votos : [];

    const items = [
        ...safeDenuncias.map(d => ({ ...d, tipoItem: 'denuncia' })),
        ...safeVotos.map(v => ({ ...v, tipoItem: 'voto' }))
    ];

    items.sort((a, b) => {
        const dA = new Date(a.criado_em || a.timestamp || 0);
        const dB = new Date(b.criado_em || b.timestamp || 0);
        return dB - dA;
    });

    if (items.length === 0) {
        listEl.innerHTML = '<p class="no-activity">Você ainda não enviou denúncias ou votos.</p>';
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'activity-card';

        const domName = item.dominio || item.domain || item.url || 'domínio';
        const rawDate = item.criado_em || item.timestamp || Date.now();
        const formattedDate = isNaN(new Date(rawDate)) ? 'Recente' : new Date(rawDate).toLocaleDateString('pt-BR');
        const starsVal = typeof item.estrelas === 'number' ? item.estrelas : (item.stars || 5);

        if (item.tipoItem === 'denuncia') {
            let estrelasHTML = '';
            for (let i = 1; i <= 5; i++) {
                estrelasHTML += `<i class="ti ti-star${i <= starsVal ? '-filled' : ''}"></i>`;
            }

            let respostaHTML = '';
            if (item.respondido && item.resposta_empresa) {
                respostaHTML = `
                    <div class="activity-response">
                        <div class="activity-response-lbl">Resposta da Empresa:</div>
                        <p>"${item.resposta_empresa}"</p>
                    </div>
                `;
            } else {
                respostaHTML = `<div class="activity-date">Aguardando resposta da empresa</div>`;
            }

            card.innerHTML = `
                <div class="activity-card-header">
                    <a class="activity-domain" data-domain="${domName}">${domName}</a>
                    <span class="activity-date">${formattedDate}</span>
                </div>
                <div class="activity-stars">
                    ${estrelasHTML}
                    <span class="activity-badge-type">Reclamação</span>
                </div>
                <p class="activity-comment">${(item.comentario || item.comment) ? `"${item.comentario || item.comment}"` : '<em>Sem comentário escrito.</em>'}</p>
                ${respostaHTML}
            `;
        } else {
            let badgeClass = 'voto-ok';
            let votoLabel = '👍 Confiável';
            if (item.voto === 'suspeito') { badgeClass = 'voto-warn'; votoLabel = '⚠️ Suspeito'; }
            if (item.voto === 'golpe') { badgeClass = 'voto-bad'; votoLabel = '🚨 Golpe'; }

            card.innerHTML = `
                <div class="activity-card-header">
                    <a class="activity-domain" data-domain="${domName}">${domName}</a>
                    <span class="activity-date">${formattedDate}</span>
                </div>
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                    <span class="activity-voto-badge ${badgeClass}">${votoLabel}</span>
                    <span class="activity-badge-type">Voto Comunitário</span>
                </div>
                <p class="activity-comment">${item.comentario ? `"${item.comentario}"` : '<em>Sem comentário escrito.</em>'}</p>
            `;
        }

        listEl.appendChild(card);
    });
}

function renderizarMinhasVerificacoes(analises = []) {
    const listEl = document.getElementById('personal-analises-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const safeAnalises = Array.isArray(analises) ? analises : [];

    if (safeAnalises.length === 0) {
        listEl.innerHTML = '<p class="no-activity">Nenhuma página analisada ainda.</p>';
        return;
    }

    safeAnalises.forEach(a => {
        const card = document.createElement('div');
        card.className = 'activity-card';

        const score = typeof a.score === 'number' ? a.score : 100;
        let badgeClass = 'warn';
        if (score >= 80) badgeClass = 'ok';
        if (score <= 40) badgeClass = 'bad';

        const domName = a.dominio || a.url || 'domínio';
        const rawDate = a.criado_em || a.timestamp || Date.now();
        const formattedDate = isNaN(new Date(rawDate)) ? 'Recente' : new Date(rawDate).toLocaleDateString('pt-BR');

        card.innerHTML = `
            <div class="activity-card-header">
                <span class="activity-domain">${domName}</span>
                <span class="activity-date">${formattedDate}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="activity-date">${a.veredicto || 'Página Verificada'}</span>
                <span class="activity-score-badge ${badgeClass}">${score}/100</span>
            </div>
        `;
        listEl.appendChild(card);
    });
}

// Salvar Perfil
const profileForm = document.getElementById('profile-form');
profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome_completo = document.getElementById('profile-name').value.trim();
    
    const { token } = await chrome.runtime.sendMessage({ type: 'GET_TOKEN' });

    try {
        const res = await fetch(`${BACKEND_URL}/usuario/perfil`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                nome_completo,
                avatar_url: selectedAvatarName
            })
        });

        if (!res.ok) throw new Error('Falha ao atualizar dados do perfil.');

        const dados = await res.json();
        
        // Atualiza os dados locais de sessão no Chrome storage
        await chrome.storage.local.set({ user: dados.usuario });
        
        alert('Perfil atualizado com sucesso!');
        carregarPerfil();

    } catch (e) {
        console.error(e);
        alert('Erro ao salvar alterações do perfil.');
    }
});
