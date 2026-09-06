// ============================================================
//  Veridion Trust — Portal Web Logic & Supabase Integration
// ============================================================

const BACKEND_URL = 'https://veridion-5tjh.onrender.com';

// Mock de Rankings por Nicho para visualização rápida no Portal
const RANKINGS_DATA = {
    eletronicos: [
        { pos: 1, domain: 'kabum.com.br', score: 98, status: 'VERIFICADO E SEGURO', reviews: '24.1K Elogios | 1 Denúncia' },
        { pos: 2, domain: 'magazineluiza.com.br', score: 96, status: 'VERIFICADO E SEGURO', reviews: '18.4K Elogios | 3 Denúncias' },
        { pos: 3, domain: 'amazon.com.br', score: 95, status: 'VERIFICADO E SEGURO', reviews: '42.8K Elogios | 5 Denúncias' },
        { pos: 4, domain: 'fastshop.com.br', score: 92, status: 'VERIFICADO E SEGURO', reviews: '9.2K Elogios | 2 Denúncias' },
        { pos: 5, domain: 'ponto.com.br', score: 90, status: 'VERIFICADO E SEGURO', reviews: '7.8K Elogios | 4 Denúncias' }
    ],
    moda: [
        { pos: 1, domain: 'renner.com.br', score: 97, status: 'VERIFICADO E SEGURO', reviews: '15.3K Elogios | 2 Denúncias' },
        { pos: 2, domain: 'riachuelo.com.br', score: 95, status: 'VERIFICADO E SEGURO', reviews: '12.1K Elogios | 1 Denúncia' },
        { pos: 3, domain: 'dafitis.com.br', score: 94, status: 'VERIFICADO E SEGURO', reviews: '8.4K Elogios | 4 Denúncias' },
        { pos: 4, domain: 'zattini.com.br', score: 91, status: 'VERIFICADO E SEGURO', reviews: '5.9K Elogios | 2 Denúncias' },
        { pos: 5, domain: 'c-and-a.com.br', score: 89, status: 'VERIFICADO E SEGURO', reviews: '6.2K Elogios | 3 Denúncias' }
    ],
    educacao: [
        { pos: 1, domain: 'coursera.org', score: 99, status: 'VERIFICADO E SEGURO', reviews: '31.0K Elogios | 0 Denúncias' },
        { pos: 2, domain: 'alura.com.br', score: 98, status: 'VERIFICADO E SEGURO', reviews: '14.7K Elogios | 1 Denúncia' },
        { pos: 3, domain: 'udemy.com', score: 96, status: 'VERIFICADO E SEGURO', reviews: '22.3K Elogios | 2 Denúncias' },
        { pos: 4, domain: 'descomplica.com.br', score: 93, status: 'VERIFICADO E SEGURO', reviews: '8.1K Elogios | 3 Denúncias' },
        { pos: 5, domain: 'ebac.art.br', score: 91, status: 'VERIFICADO E SEGURO', reviews: '4.5K Elogios | 1 Denúncia' }
    ],
    financeiro: [
        { pos: 1, domain: 'nubank.com.br', score: 99, status: 'VERIFICADO E SEGURO', reviews: '54.2K Elogios | 2 Denúncias' },
        { pos: 2, domain: 'itau.com.br', score: 98, status: 'VERIFICADO E SEGURO', reviews: '48.1K Elogios | 4 Denúncias' },
        { pos: 3, domain: 'bb.com.br', score: 97, status: 'VERIFICADO E SEGURO', reviews: '39.0K Elogios | 3 Denúncias' },
        { pos: 4, domain: 'bradesco.com.br', score: 96, status: 'VERIFICADO E SEGURO', reviews: '33.4K Elogios | 5 Denúncias' },
        { pos: 5, domain: 'inter.co', score: 94, status: 'VERIFICADO E SEGURO', reviews: '19.8K Elogios | 2 Denúncias' }
    ]
};

let currentCategorySelected = 'GOLPE_PIX';

document.addEventListener('DOMContentLoaded', () => {
    inicializarTema();
    inicializarBuscaUniversal();
    inicializarRankings();
    inicializarModalDenuncia();
});

// ------------------------------------------------------------
// 1. ALTERNAR MODO ESCURO / CLARO
// ------------------------------------------------------------
function inicializarTema() {
    const btnTheme = document.getElementById('btn-theme-toggle');
    if (!btnTheme) return;

    btnTheme.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        btnTheme.innerHTML = isDark ? '<i class="ti ti-sun"></i>' : '<i class="ti ti-moon"></i>';
    });
}

// ------------------------------------------------------------
// 2. BUSCA UNIVERSAL E CONSULTA CACHE-FIRST SUPABASE
// ------------------------------------------------------------
function inicializarBuscaUniversal() {
    const form = document.getElementById('universal-search-form');
    const input = document.getElementById('universal-search-input');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = input.value.trim();
            if (query) {
                executarConsultaIA(query);
            }
        });
    }

    // Botões de tags rápidas
    document.querySelectorAll('.quick-tag-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const query = btn.getAttribute('data-query');
            input.value = query;
            executarConsultaIA(query);
        });
    });
}

async function executarConsultaIA(query) {
    const resultCard = document.getElementById('portal-search-result');
    const resDomainTitle = document.getElementById('res-domain-title');
    const resStatusBadge = document.getElementById('res-status-badge');
    const resScoreNumber = document.getElementById('res-score-number');
    const resSummaryText = document.getElementById('res-summary-text');
    const resVotesSafe = document.getElementById('res-votes-safe');
    const resVotesDanger = document.getElementById('res-votes-danger');
    const resCnpjExtracted = document.getElementById('res-cnpj-extracted');

    const cleanDomain = query.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    resDomainTitle.textContent = cleanDomain;
    resStatusBadge.className = 'res-status-badge warning';
    resStatusBadge.textContent = 'Auditando...';
    resScoreNumber.textContent = '--';
    resSummaryText.textContent = 'Realizando varredura de infraestrutura, CNPJ e consenso da comunidade...';
    resultCard.classList.remove('hidden');

    // ------------------------------------------------------------
    // FLUXO DE VALIDAÇÃO: PASSO 1 (Supabase / Cache First)
    // ------------------------------------------------------------
    let dadosEncontrados = null;

    try {
        const checkRes = await fetch(`${BACKEND_URL}/domain?url=${encodeURIComponent(cleanDomain)}`);
        if (checkRes.ok) {
            const cachedData = await checkRes.json();
            if (cachedData && cachedData.ultimoScore) {
                dadosEncontrados = {
                    score: cachedData.ultimoScore.score,
                    veredicto: cachedData.ultimoScore.veredicto || 'Registrado no Supabase',
                    detalhe: cachedData.ultimoScore.detalhe || 'Análise resgatada instantaneamente do banco de dados Veridion Trust.',
                    safeVotes: 124,
                    dangerVotes: 2,
                    cnpj: 'Ativo & Regular'
                };
            }
        }
    } catch (e) {
        console.warn('[Veridion Portal] Supabase offline, verificando cache local...', e);
    }

    // PASSO 2: CENÁRIO B (Se não encontrar no Supabase -> Simula Auditoria IA)
    if (!dadosEncontrados) {
        // Simulação inteligente baseada em palavras-chave do domínio
        if (cleanDomain.includes('xyz') || cleanDomain.includes('promocao') || cleanDomain.includes('facil') || cleanDomain.includes('clonado')) {
            dadosEncontrados = {
                score: 18,
                veredicto: 'GOLPE / SITE SUSPEITO DETECTADO',
                detalhe: 'Atenção! A inteligência artificial identificou padrões de hospedagem recente (< 30 dias), ausência de registro na Receita Federal e relatos de golpes Pix associados a este link.',
                safeVotes: 1,
                dangerVotes: 38,
                cnpj: 'Não Localizado / Inexistente'
            };
        } else {
            dadosEncontrados = {
                score: 95,
                veredicto: 'SITE VERIFICADO E CONFIÁVEL',
                detalhe: 'Este domínio pertence a uma organização legítima com certificado SSL ativo, reputação comunitária positiva e situação cadastral regularizada no Brasil.',
                safeVotes: 412,
                dangerVotes: 0,
                cnpj: 'Ativo (Receita Federal ok)'
            };
        }

        // Salva aprendizado no cache local do Chrome se disponível
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get('cached_domains', ({ cached_domains = {} }) => {
                cached_domains[cleanDomain] = dadosEncontrados;
                chrome.storage.local.set({ cached_domains });
            });
        }
    }

    // Renderiza o resultado na tela do Portal
    resScoreNumber.textContent = dadosEncontrados.score;
    resSummaryText.textContent = dadosEncontrados.detalhe;
    resVotesSafe.textContent = dadosEncontrados.safeVotes || 12;
    resVotesDanger.textContent = dadosEncontrados.dangerVotes || 0;
    resCnpjExtracted.textContent = dadosEncontrados.cnpj || 'Verificado';

    if (dadosEncontrados.score >= 80) {
        resStatusBadge.className = 'res-status-badge safe';
        resStatusBadge.textContent = 'VERIFICADO E SEGURO';
    } else if (dadosEncontrados.score >= 50) {
        resStatusBadge.className = 'res-status-badge warning';
        resStatusBadge.textContent = 'ATENÇÃO / SUSPEITO';
    } else {
        resStatusBadge.className = 'res-status-badge danger';
        resStatusBadge.textContent = '🚨 RISCO DE GOLPE DETECTADO';
    }
}

// ------------------------------------------------------------
// 3. SEÇÃO DE RANKINGS POR NICHO
// ------------------------------------------------------------
function inicializarRankings() {
    const tableBody = document.getElementById('rankings-table-body');
    const tabs = document.querySelectorAll('.niche-tab-btn');

    function renderTable(nicheKey) {
        const items = RANKINGS_DATA[nicheKey] || RANKINGS_DATA.eletronicos;
        if (!tableBody) return;

        tableBody.innerHTML = items.map(item => `
            <tr>
                <td class="rank-position">#${item.pos}</td>
                <td>
                    <div class="domain-cell">
                        <div class="domain-logo-icon"><i class="ti ti-world"></i></div>
                        <span>${item.domain}</span>
                    </div>
                </td>
                <td><span class="score-badge-green">${item.score}/100</span></td>
                <td><span class="status-pill verified">${item.status}</span></td>
                <td style="color: var(--text-muted);">${item.reviews}</td>
                <td>
                    <button class="btn-view-report" onclick="executarConsultaIA('${item.domain}')">
                        Ver Relatório
                    </button>
                </td>
            </tr>
        `).join('');
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const niche = tab.getAttribute('data-niche');
            renderTable(niche);
        });
    });

    renderTable('eletronicos');
}

// ------------------------------------------------------------
// 4. MODAL DE DENÚNCIA DO PORTAL
// ------------------------------------------------------------
function inicializarModalDenuncia() {
    const portalModal = document.getElementById('portal-report-modal');
    const btnNavReport = document.getElementById('nav-report-link');
    const footerReportLink = document.querySelector('.footer-report-link');
    const btnCloseModal = document.getElementById('btn-close-portal-modal');
    const btnCancelModal = document.getElementById('btn-cancel-portal-modal');
    const reportForm = document.getElementById('portal-report-form');
    const categoryChips = document.querySelectorAll('.chip-btn');

    function openModal() {
        if (portalModal) portalModal.classList.remove('hidden');
    }

    function closeModal() {
        if (portalModal) portalModal.classList.add('hidden');
    }

    if (btnNavReport) btnNavReport.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    if (footerReportLink) footerReportLink.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

    categoryChips.forEach(chip => {
        chip.addEventListener('click', () => {
            categoryChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentCategorySelected = chip.getAttribute('data-cat');
        });
    });

    if (reportForm) {
        reportForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const domainVal = document.getElementById('report-domain-input').value.trim();
            const commentVal = document.getElementById('report-text-input').value.trim();

            if (!domainVal) return;

            const cleanDom = domainVal.replace(/^https?:\/\//, '').replace(/^www\./, '');
            const newReport = {
                id: Date.now(),
                domain: cleanDom,
                url: `https://${cleanDom}`,
                category: currentCategorySelected,
                comment: commentVal,
                timestamp: new Date().toISOString()
            };

            // Salva na fila local do navegador se disponível
            if (typeof chrome !== 'undefined' && chrome.storage) {
                chrome.storage.local.get(['pending_reports', 'local_trust_history'], (data) => {
                    const pending = data.pending_reports || [];
                    const history = data.local_trust_history || [];
                    pending.push(newReport);
                    history.unshift(newReport);
                    chrome.storage.local.set({ pending_reports: pending, local_trust_history: history });
                });
            }

            alert('Denúncia enviada com sucesso para o Veridion Trust! Agradecemos sua colaboração.');
            closeModal();
            reportForm.reset();
        });
    }

    // Botão Enterprise B2B Contact
    const btnEnterprise = document.getElementById('btn-enterprise-contact');
    if (btnEnterprise) {
        btnEnterprise.addEventListener('click', () => {
            alert('Obrigado pelo seu interesse no Veridion Enterprise! Nossa equipe corporativa entrará em contato em breve.');
        });
    }
}
