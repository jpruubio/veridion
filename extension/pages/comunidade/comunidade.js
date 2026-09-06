// ============================================================
//  Veridion AI — Reclame Aqui Light Mode SaaS Logic
// ============================================================

const BACKEND_URL = 'https://veridion-5tjh.onrender.com';

// Mock de Dados dos Top 10 por Nicho (Padrão Print 1)
const TOP10_RANKINGS = {
    marketplaces: [
        { rank: '1º', name: 'Mercado Livre', domain: 'mercadolivre.com.br', score: '9.5', evals: '14.2k' },
        { rank: '2º', name: 'Amazon Brasil', domain: 'amazon.com.br', score: '9.4', evals: '11.8k' },
        { rank: '3º', name: 'Shopee Brasil', domain: 'shopee.com.br', score: '9.0', evals: '9.6k' },
        { rank: '4º', name: 'Magalu', domain: 'magazineluiza.com.br', score: '8.8', evals: '8.1k' },
        { rank: '5º', name: 'Casas Bahia', domain: 'casasbahia.com.br', score: '8.5', evals: '6.4k' },
        { rank: '6º', name: 'Fast Shop', domain: 'fastshop.com.br', score: '8.4', evals: '4.9k' },
        { rank: '7º', name: 'Kabum', domain: 'kabum.com.br', score: '8.3', evals: '5.2k' },
        { rank: '8º', name: 'Netshoes', domain: 'netshoes.com.br', score: '8.1', evals: '3.8k' },
        { rank: '9º', name: 'Carrefour', domain: 'carrefour.com.br', score: '8.0', evals: '3.1k' },
        { rank: '10º', name: 'Americanas', domain: 'americanas.com.br', score: '7.8', evals: '4.5k' }
    ],
    noticias: [
        { rank: '1º', name: 'G1 Globo', domain: 'g1.globo.com', score: '9.3', evals: '18.5k' },
        { rank: '2º', name: 'UOL Notícias', domain: 'noticias.uol.com.br', score: '9.2', evals: '15.2k' },
        { rank: '3º', name: 'CNN Brasil', domain: 'cnnbrasil.com.br', score: '9.1', evals: '12.1k' },
        { rank: '4º', name: 'Estadão', domain: 'estadao.com.br', score: '9.0', evals: '9.8k' },
        { rank: '5º', name: 'Folha de S.Paulo', domain: 'folha.uol.com.br', score: '8.9', evals: '10.4k' },
        { rank: '6º', name: 'R7 Notícias', domain: 'noticias.r7.com', score: '8.7', evals: '7.6k' },
        { rank: '7º', name: 'Poder360', domain: 'poder360.com.br', score: '8.6', evals: '6.2k' },
        { rank: '8º', name: 'Metrópoles', domain: 'metropoles.com', score: '8.5', evals: '8.9k' },
        { rank: '9º', name: 'Valor Econômico', domain: 'valor.globo.com', score: '8.4', evals: '4.1k' },
        { rank: '10º', name: 'Jovem Pan News', domain: 'jovempan.com.br', score: '8.2', evals: '9.3k' }
    ],
    geral: [
        { rank: '1º', name: 'Google Brasil', domain: 'google.com.br', score: '9.8', evals: '45.1k' },
        { rank: '2º', name: 'YouTube', domain: 'youtube.com', score: '9.7', evals: '38.9k' },
        { rank: '3º', name: 'Wikipedia', domain: 'pt.wikipedia.org', score: '9.5', evals: '24.3k' },
        { rank: '4º', name: 'Gov.br', domain: 'gov.br', score: '9.4', evals: '31.0k' },
        { rank: '5º', name: 'Instagram', domain: 'instagram.com', score: '9.2', evals: '29.5k' },
        { rank: '6º', name: 'WhatsApp Web', domain: 'web.whatsapp.com', score: '9.1', evals: '28.2k' },
        { rank: '7º', name: 'LinkedIn Brasil', domain: 'linkedin.com', score: '9.0', evals: '16.7k' },
        { rank: '8º', name: 'ChatGPT OpenAI', domain: 'chatgpt.com', score: '8.9', evals: '22.4k' },
        { rank: '9º', name: 'Nubank', domain: 'nubank.com.br', score: '8.8', evals: '27.8k' },
        { rank: '10º', name: 'Itaú Unibanco', domain: 'itau.com.br', score: '8.7', evals: '19.4k' }
    ],
    piores: [
        { rank: '1º', name: 'Promoção Falsa Insta', domain: 'promocao-falsa-insta.xyz', score: '1.2', evals: '842 denúncias' },
        { rank: '2º', name: 'Loja do Golpe', domain: 'lojadogolpe.online', score: '1.4', evals: '619 denúncias' },
        { rank: '3º', name: 'Nike Outlet Desconto', domain: 'nike-outlet-desconto.online', score: '1.5', evals: '512 denúncias' },
        { rank: '4º', name: 'Feirão Eletro Clonado', domain: 'feirao-eletro.site', score: '1.6', evals: '430 denúncias' },
        { rank: '5º', name: 'Pix Premiado Oficial', domain: 'pix-premiado-oficial.net', score: '1.7', evals: '780 denúncias' },
        { rank: '6º', name: 'Leilão Detran Falso', domain: 'leilao-detran.org', score: '1.8', evals: '390 denúncias' },
        { rank: '7º', name: 'Vagas Home Office Golpe', domain: 'vagas-homeoffice.xyz', score: '1.9', evals: '290 denúncias' },
        { rank: '8º', name: 'iPhone Promo 50%', domain: 'iphone-promocao.top', score: '2.0', evals: '410 denúncias' },
        { rank: '9º', name: 'Suporte WhatsApp Fake', domain: 'suporte-wa.info', score: '2.1', evals: '350 denúncias' },
        { rank: '10º', name: 'Renegocia Crédito Falso', domain: 'renegocia-credito.online', score: '2.2', evals: '480 denúncias' }
    ]
};

// Base de Dados de Empresas para Resultados de Busca
const COMPANIES_DATABASE = {
    nike: [
        {
            key: 'nike_oficial',
            name: 'Nike do Brasil',
            domain: 'nike.com.br',
            category: 'Esportes - Produtos e Artigos Esportivos',
            score: '8.2',
            status: 'Boa',
            badgeClass: '',
            resolvedPct: '77.5%',
            complaintsCount: '3.070',
            age: '12 anos no Veridion',
            cnpj: '59.546.515/0001-34 (Ativo)',
            views: '291 mil',
            about: 'A Nike é uma das maiores marcas do mundo no segmento esportivo. Comercializa em seu site oficial itens como roupas, calçados de alto desempenho, acessórios e lançamentos exclusivos.',
            complaints: [
                { title: 'Atraso na entrega de tênis Air Force 1', status: 'Respondida', date: 'Há 2 dias' },
                { title: 'Tamanho incorreto enviado no pedido', status: 'Em análise', date: 'Há 3 dias' },
                { title: 'Solicitação de reembolso de produto devolvido', status: 'Resolvido', date: 'Há 5 dias' }
            ]
        },
        {
            key: 'nike_outlet_fake',
            name: 'Nike Outlet Promo (Suspeito)',
            domain: 'nike-outlet-desconto.online',
            category: 'E-Commerce Não Verificado / Risco',
            score: '1.5',
            status: 'Não Recomendada',
            badgeClass: 'badge-danger',
            resolvedPct: '0%',
            complaintsCount: '512 denúncias',
            age: 'Registrado há 14 dias',
            cnpj: 'CNPJ Inexistente / Falso',
            views: '12 mil',
            about: 'ALERTA DE SEGURANÇA: Este site apresenta padrão característico de e-commerce falso com promoções enganosas de tênis Nike. Não insira dados de cartão de crédito.',
            complaints: [
                { title: 'Pix enviado e site saiu do ar', status: 'Não respondida', date: 'Há 1 dia' },
                { title: 'Produto falso e cobrança indevida', status: 'Não respondida', date: 'Há 2 dias' }
            ]
        },
        {
            key: 'nike_store_sp',
            name: 'Nike Store SP',
            domain: 'nikestoresp.com',
            category: 'Lojas Físicas & Revendedores',
            score: '7.8',
            status: 'Regular',
            badgeClass: '',
            resolvedPct: '68.0%',
            complaintsCount: '45',
            age: '5 anos no Veridion',
            cnpj: '12.345.678/0001-90',
            views: '15 mil',
            about: 'Revendedor autorizado de produtos esportivos e tênis Nike na região de São Paulo.',
            complaints: [
                { title: 'Atendimento na loja física', status: 'Respondida', date: 'Há 1 semana' }
            ]
        },
        {
            key: 'nike_jordan_fake',
            name: 'Nike Air Jordan Brasil (Falso)',
            domain: 'jordan-brasil.net',
            category: 'Cópia Não Autorizada',
            score: '1.8',
            status: 'Não Recomendada',
            badgeClass: 'badge-danger',
            resolvedPct: '0%',
            complaintsCount: '190 denúncias',
            age: 'Registrado há 1 mês',
            cnpj: 'CNPJ Não Identificado',
            views: '8 mil',
            about: 'Página clonada que utiliza logotipos protegidos da linha Air Jordan sem autorização.',
            complaints: [
                { title: 'Golpe do tênis Jordan por R$ 99', status: 'Não respondida', date: 'Há 3 dias' }
            ]
        }
    ]
};

// Reclamações Detalhadas para o Painel da Banca
const MOCK_DETAILED_COMPLAINTS = [
    {
        id: 1,
        user: "Lucas M. (São Paulo - SP)",
        date: "Há 2 horas",
        title: "Atraso na entrega de tênis Air Force 1 no pedido #94820",
        category: "Entrega / Logística",
        status: "ANSWERED",
        statusLabel: "Respondida",
        badgeClass: "badge-status-verified",
        text: "Fiz a compra de um tênis Nike Air Force 1 com prazo de entrega de 3 dias úteis. Já se passaram 7 dias e o código de rastreamento não atualiza na transportadora.",
        reply: "Olá Lucas! Pedimos desculpas pelo atraso. Identificamos uma instabilidade na transportadora parceira, mas seu produto já foi reexpedido com prioridade e chegará até amanhã."
    },
    {
        id: 2,
        user: "Mariana R. (Rio de Janeiro - RJ)",
        date: "Há 1 dia",
        title: "Solicitação de devolução e estorno de valor não processada",
        category: "Estorno / Troca",
        status: "RESOLVED",
        statusLabel: "Resolvido",
        badgeClass: "badge-status-verified",
        text: "Efetuei a devolução da jaqueta Windrunner no prazo de 7 dias conforme o código de postagem. O pacote chegou ao centro de distribuição mas o estorno não caiu na fatura.",
        reply: "Concluído com sucesso! O estorno no valor de R$ 499,90 foi processado diretamente junto à administradora do seu cartão de crédito."
    },
    {
        id: 3,
        user: "Fernando K. (Belo Horizonte - MG)",
        date: "Há 2 dias",
        title: "Tamanho de numeração enviado menor do que o pedido",
        category: "Troca de Produto",
        status: "UNANSWERED",
        statusLabel: "Não respondida",
        badgeClass: "badge-status-not-rec",
        text: "Comprei a numeração 41 do tênis Pegasus 40 e me enviaram a caixa com o tamanho 39. Preciso da troca urgente antes da minha maratona no domingo.",
        reply: null
    },
    {
        id: 4,
        user: "Beatriz S. (Curitiba - PR)",
        date: "Há 3 dias",
        title: "Cobrança duplicada no checkout via Pix",
        category: "Pagamento / Checkout",
        status: "RESOLVED",
        statusLabel: "Resolvido",
        badgeClass: "badge-status-verified",
        text: "Ao tentar concluir o Pix ocorreu um erro de timeout na tela e acabei gerando um segundo QR Code. O dinheiro foi debitado duas vezes na minha conta bancária.",
        reply: "Problema resolvido! Identificamos a duplicidade no gateway e efetuamos o estorno do valor sobressalente de R$ 320,00 via Pix instantâneo."
    }
];

// 3 Abas Oficiais do Menu Superior
const btnTrust = document.getElementById('nav-btn-trust');
const btnSearch = document.getElementById('nav-btn-search');
const btnConfig = document.getElementById('nav-btn-config');

const sectionTrust = document.getElementById('section-trust');
const sectionSearch = document.getElementById('section-search');
const sectionConfig = document.getElementById('section-config');

let currentDomainName = 'mercadolivre.com.br';
let selectedCategory = 'GOLPE_PIX';
let currentActiveFilter = 'ALL';
let showOnlyMyReports = false;
let selectedPaymentPlan = 'Enterprise';

document.addEventListener('DOMContentLoaded', () => {
    inicializarNavegacaoAbas();
    inicializarActionCards();
    inicializarHeroSearchComRedirecionamento();
    inicializarBuscaURL();
    carregarRankingsPadrao();
    inicializarNicheComparison();
    inicializarFeedVeridionTrust();
    inicializarModalDenuncia();
    inicializarEnterpriseB2B();
    inicializarPagamentoPix();
    inicializarPreferenciasExtensao();
    inicializarHistoricoAtividade();
    inicializarModalDetalhesEnterprise();
    inicializarAbasSubPerfilEmpresa();
    inicializarPainelEmpresaGrowth();
});

// ------------------------------------------------------------
// 1. NAVEGAÇÃO ENTRE AS ABAS DA EXTENSÃO (INCLUINDO PAINEL EMPRESA)
// ------------------------------------------------------------
function inicializarNavegacaoAbas() {
    const btnPainelEmpresa = document.getElementById('nav-btn-painel-empresa');
    const btnTrust = document.getElementById('nav-btn-trust');
    const btnSearch = document.getElementById('nav-btn-search');
    const btnConfig = document.getElementById('nav-btn-config');

    const sectionPainelEmpresa = document.getElementById('section-painel-empresa');
    const sectionTrust = document.getElementById('section-trust');
    const sectionSearch = document.getElementById('section-search');
    const sectionConfig = document.getElementById('section-config');

    function ativarAba(btnAtivo, secaoAtiva) {
        [btnPainelEmpresa, btnTrust, btnSearch, btnConfig].forEach(b => b && b.classList.remove('active'));
        [sectionPainelEmpresa, sectionTrust, sectionSearch, sectionConfig].forEach(s => {
            if (s) {
                s.classList.remove('active');
                s.classList.add('hidden');
            }
        });

        if (btnAtivo) btnAtivo.classList.add('active');
        if (secaoAtiva) {
            secaoAtiva.classList.remove('hidden');
            secaoAtiva.classList.add('active');
        }
    }

    if (btnPainelEmpresa) {
        btnPainelEmpresa.addEventListener('click', () => {
            ativarAba(btnPainelEmpresa, sectionPainelEmpresa);
        });
    }

    if (btnTrust) {
        btnTrust.addEventListener('click', () => {
            ativarAba(btnTrust, sectionTrust);
            loadVeridionTrustData(currentDomainName);
        });
    }

    if (btnSearch) {
        btnSearch.addEventListener('click', () => {
            ativarAba(btnSearch, sectionSearch);
        });
    }

    if (btnConfig) {
        btnConfig.addEventListener('click', () => {
            ativarAba(btnConfig, sectionConfig);
            carregarDadosConfig();
        });
    }

    if (window.location.hash === '#config') {
        if (btnConfig) btnConfig.click();
    } else if (window.location.hash === '#painel-empresa') {
        if (btnPainelEmpresa) btnPainelEmpresa.click();
    }
}

// ------------------------------------------------------------
// 1.1 SUB-ABAS DO PERFIL DA EMPRESA (GERAL, SOBRE, RECLAMAÇÕES, DESCONTOS, PROBLEMAS)
// ------------------------------------------------------------
function inicializarAbasSubPerfilEmpresa() {
    const tabBtns = document.querySelectorAll('.c-tab-btn');
    const tabPanels = {
        geral: document.getElementById('company-tab-panel-geral'),
        sobre: document.getElementById('company-tab-panel-sobre'),
        reclamacoes: document.getElementById('company-tab-panel-reclamacoes'),
        descontos: document.getElementById('company-tab-panel-descontos'),
        problemas: document.getElementById('company-tab-panel-problemas')
    };

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-company-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            Object.keys(tabPanels).forEach(key => {
                if (tabPanels[key]) {
                    if (key === targetTab) {
                        tabPanels[key].classList.remove('hidden');
                        tabPanels[key].classList.add('active');
                    } else {
                        tabPanels[key].classList.add('hidden');
                        tabPanels[key].classList.remove('active');
                    }
                }
            });
        });
    });

    renderDetailedComplaintsFeed('ALL');

    document.querySelectorAll('.c-filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.c-filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const filterKey = chip.getAttribute('data-cfilter');
            renderDetailedComplaintsFeed(filterKey);
        });
    });

    document.querySelectorAll('.btn-copy-coupon').forEach(btn => {
        btn.addEventListener('click', () => {
            const code = btn.getAttribute('data-code');
            navigator.clipboard.writeText(code).then(() => {
                const orig = btn.innerHTML;
                btn.innerHTML = '<i class="ti ti-check"></i> Copiado!';
                btn.style.background = '#10B981';
                setTimeout(() => {
                    btn.innerHTML = orig;
                    btn.style.background = '#3533CB';
                }, 2000);
            });
        });
    });
}

function renderDetailedComplaintsFeed(filterKey) {
    const listEl = document.getElementById('full-complaints-feed-list');
    if (!listEl) return;

    let items = MOCK_DETAILED_COMPLAINTS;
    if (filterKey !== 'ALL') {
        items = MOCK_DETAILED_COMPLAINTS.filter(c => c.status === filterKey);
    }

    if (items.length === 0) {
        listEl.innerHTML = '<p class="empty-feed">Nenhuma reclamação encontrada para o filtro selecionado.</p>';
        return;
    }

    listEl.innerHTML = items.map(c => `
        <div class="full-complaint-card">
            <div class="f-comp-top">
                <span class="f-user-name"><i class="ti ti-user"></i> ${c.user} • ${c.date}</span>
                <span class="${c.badgeClass}">${c.statusLabel}</span>
            </div>
            <h4 class="f-comp-title">${c.title}</h4>
            <p class="f-comp-text">"${c.text}"</p>
            <button class="btn-ver-reclamacao"><i class="ti ti-eye"></i> Ver reclamação completa</button>
            ${c.reply ? `
                <div class="f-brand-reply-box">
                    <strong><i class="ti ti-corner-down-right"></i> Resposta Oficial da Empresa:</strong>
                    <span>${c.reply}</span>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// ------------------------------------------------------------
// 2. PREENCHIMENTO DAS 4 COLUNAS DE RANKINGS POR NICHO (PRINT 1)
// ------------------------------------------------------------
function carregarRankingsPadrao() {
    const listMarketplaces = document.getElementById('rank-marketplaces-list');
    const listNoticias = document.getElementById('rank-noticias-list');
    const listGeral = document.getElementById('rank-geral-list');
    const listPiores = document.getElementById('rank-piores-list');

    function renderColumn(targetEl, items, isRedTag = false) {
        if (!targetEl) return;
        targetEl.innerHTML = items.map(item => `
            <div class="ranking-col-row" style="cursor:pointer;" data-domain="${item.domain}">
                <span class="col-rank-num">${item.rank}</span>
                <div class="col-domain-info">
                    <strong class="col-domain-name">${item.name}</strong>
                    <span class="col-eval-count">${item.evals}</span>
                </div>
                <span class="col-score-tag ${isRedTag ? 'red-tag' : ''}">${item.score}</span>
            </div>
        `).join('');

        targetEl.querySelectorAll('.ranking-col-row').forEach(row => {
            row.addEventListener('click', () => {
                const domain = row.getAttribute('data-domain');
                pesquisarDominio(domain);
            });
        });
    }

    renderColumn(listMarketplaces, TOP10_RANKINGS.marketplaces);
    renderColumn(listNoticias, TOP10_RANKINGS.noticias);
    renderColumn(listGeral, TOP10_RANKINGS.geral);
    renderColumn(listPiores, TOP10_RANKINGS.piores, true);
}

// ------------------------------------------------------------
// 3. ABA PESQUISAR URL (FLUXO DADOS + RESULTADOS BUSCA + RECLAME AQUI)
// ------------------------------------------------------------
function inicializarBuscaURL() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const shortcuts = document.querySelectorAll('.search-shortcut-chip');

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) pesquisarDominio(query);
        });
    }

    shortcuts.forEach(chip => {
        chip.addEventListener('click', () => {
            const query = chip.getAttribute('data-query');
            if (searchInput) searchInput.value = query;
            pesquisarDominio(query);
        });
    });

    // Botão Voltar da página completa da empresa
    const btnBack = document.getElementById('btn-back-to-search-results');
    if (btnBack) {
        btnBack.addEventListener('click', () => {
            const fullPage = document.getElementById('company-profile-full-page');
            const resultsContainer = document.getElementById('search-company-results-container');
            
            if (fullPage) fullPage.classList.add('hidden');
            if (resultsContainer) resultsContainer.classList.remove('hidden');
        });
    }

    const btnHeroClaim = document.getElementById('btn-hero-claim');
    if (btnHeroClaim) {
        btnHeroClaim.addEventListener('click', () => {
            const modalDomain = document.getElementById('modal-report-domain');
            if (modalDomain) modalDomain.value = currentDomainName;
            abrirModalDenuncia();
        });
    }

    const btnHeroVisit = document.getElementById('btn-hero-visit-site');
    if (btnHeroVisit) {
        btnHeroVisit.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Link de acesso ao site desativado por segurança durante a simulação de auditoria.');
        });
    }
}

async function pesquisarDominio(query) {
    const cleanQuery = query.toLowerCase().trim();
    currentDomainName = cleanQuery;

    const defaultRankings = document.getElementById('search-default-rankings-container');
    const companyResultsContainer = document.getElementById('search-company-results-container');
    const companyFullPage = document.getElementById('company-profile-full-page');
    const queryTitleLabel = document.getElementById('search-results-query-title');
    const resultsGrid = document.getElementById('companies-results-grid');
    const countCompaniesEl = document.getElementById('count-found-companies');
    const showingTextEl = document.getElementById('showing-count-text');

    if (defaultRankings) defaultRankings.classList.add('hidden');
    if (companyFullPage) companyFullPage.classList.add('hidden');
    if (companyResultsContainer) companyResultsContainer.classList.remove('hidden');

    if (queryTitleLabel) queryTitleLabel.innerText = `Resultados da busca por "${query}"`;

    let matches = COMPANIES_DATABASE.nike;
    if (!cleanQuery.includes('nike')) {
        matches = [
            {
                key: 'search_item_1',
                name: cleanQuery.toUpperCase(),
                domain: cleanQuery.includes('.') ? cleanQuery : `${cleanQuery}.com.br`,
                category: 'E-commerce e Serviços Online',
                score: cleanQuery.includes('xyz') ? '1.8' : '9.5',
                status: cleanQuery.includes('xyz') ? 'Não Recomendada' : 'Excelente',
                badgeClass: cleanQuery.includes('xyz') ? 'badge-danger' : '',
                resolvedPct: cleanQuery.includes('xyz') ? '0%' : '92.4%',
                complaintsCount: cleanQuery.includes('xyz') ? '340 denúncias' : '1.200',
                age: 'Verificado por IA',
                cnpj: 'CNPJ Cadastrado na Receita Federal',
                views: '45 mil',
                about: `Empresa e domínio ${cleanQuery} auditado e monitorado pela tecnologia Veridion AI.`,
                complaints: [
                    { title: 'Dúvida sobre prazo de entrega', status: 'Respondida', date: 'Há 1 dia' },
                    { title: 'Troca de produto realizada', status: 'Resolvido', date: 'Há 4 dias' }
                ]
            }
        ];
    }

    if (countCompaniesEl) countCompaniesEl.innerText = matches.length;
    if (showingTextEl) showingTextEl.innerText = `Exibindo ${matches.length} de ${matches.length} empresas`;

    if (resultsGrid) {
        resultsGrid.innerHTML = matches.map(comp => `
            <div class="company-result-card">
                <div class="c-card-top-row">
                    <div style="display:flex; gap:12px; align-items:center;">
                        <div class="c-logo-placeholder">${comp.name.charAt(0)}</div>
                        <div class="c-info-group">
                            <h4>${comp.name}</h4>
                            <span>${comp.domain} • ${comp.category}</span>
                        </div>
                    </div>
                    <span class="c-rep-badge ${comp.badgeClass}">${comp.status} (${comp.score}/10)</span>
                </div>
                <div class="c-card-footer-row">
                    <span><i class="ti ti-check text-green"></i> ${comp.resolvedPct} resolvidas • ${comp.complaintsCount}</span>
                    <div style="display:flex; gap:8px;">
                        <button class="btn-visit-site-disabled" data-visit="true">
                            <i class="ti ti-external-link"></i> Acessar site
                        </button>
                        <button class="btn-view-company-action" data-key="${comp.key}">Ver empresa &rarr;</button>
                    </div>
                </div>
            </div>
        `).join('');

        // Liga ouvintes dinâmicos sem usar onclick inline (compatibilidade estrita CSP)
        resultsGrid.querySelectorAll('.btn-visit-site-disabled').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                alert('Link de acesso ao site desativado por segurança em ambiente de auditoria.');
            });
        });

        resultsGrid.querySelectorAll('.btn-view-company-action').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.getAttribute('data-key');
                abrirPerfilEmpresaDirect(key);
            });
        });
    }

    const { cached_domains = {} } = await chrome.storage.local.get('cached_domains');
    cached_domains[cleanQuery] = {
        score: cleanQuery.includes('xyz') ? 18 : 95,
        detalhe: 'Pesquisa efetuada',
        timestamp: Date.now()
    };
    await chrome.storage.local.set({ cached_domains });
}

window.abrirPerfilEmpresaDirect = function(companyKey) {
    let targetCompany = null;
    Object.keys(COMPANIES_DATABASE).forEach(cat => {
        const found = COMPANIES_DATABASE[cat].find(c => c.key === companyKey);
        if (found) targetCompany = found;
    });

    if (!targetCompany) {
        targetCompany = {
            name: currentDomainName.toUpperCase(),
            domain: currentDomainName,
            category: 'E-commerce e Serviços Online',
            score: currentDomainName.includes('xyz') ? '1.8' : '9.5',
            status: currentDomainName.includes('xyz') ? 'Não Recomendada' : 'Excelente',
            resolvedPct: currentDomainName.includes('xyz') ? '0%' : '92.4%',
            complaintsCount: '1.200',
            age: 'Verificado por IA',
            cnpj: 'CNPJ Cadastrado na Receita Federal',
            views: '45 mil',
            about: `Empresa e domínio ${currentDomainName} auditado e monitorado pela tecnologia Veridion AI.`,
            complaints: [
                { title: 'Dúvida sobre entrega do pedido', status: 'Respondida', date: 'Há 1 dia' },
                { title: 'Solicitação de suporte técnico', status: 'Resolvido', date: 'Há 3 dias' }
            ]
        };
    }

    const companyResultsContainer = document.getElementById('search-company-results-container');
    const companyFullPage = document.getElementById('company-profile-full-page');

    if (companyResultsContainer) companyResultsContainer.classList.add('hidden');
    if (companyFullPage) companyFullPage.classList.remove('hidden');

    window.scrollTo({ top: 120, behavior: 'smooth' });

    const nameTitle = document.getElementById('company-name-title');
    const categoryMeta = document.getElementById('company-category-meta');
    const repStatus = document.getElementById('company-rep-status');
    const resolutionRate = document.getElementById('company-resolution-rate');
    const isSafeTitle = document.getElementById('company-is-safe-title');
    const sayTitle = document.getElementById('company-say-title');
    const infoTitle = document.getElementById('company-info-title');
    const scoreLarge = document.getElementById('company-score-large');
    const respondedPct = document.getElementById('company-responded-pct');
    const repeatPct = document.getElementById('company-repeat-pct');
    const solutionPct = document.getElementById('company-solution-pct');
    const aboutText = document.getElementById('company-about-text');
    const cnpjVal = document.getElementById('company-cnpj-val');
    const yearsVal = document.getElementById('company-years-val');
    const complaintsList = document.getElementById('company-complaints-list');
    const logoAvatar = document.getElementById('company-logo-avatar');

    document.querySelectorAll('.target-company-name-span').forEach(sp => sp.innerText = targetCompany.name);
    const fullAbout = document.getElementById('target-company-full-about');
    if (fullAbout) fullAbout.innerText = targetCompany.about;
    const cnpjFull = document.getElementById('target-company-cnpj-full');
    if (cnpjFull) cnpjFull.innerText = targetCompany.cnpj;
    const domainFull = document.getElementById('target-company-domain-full');
    if (domainFull) domainFull.innerText = `${targetCompany.domain} (Certificado SSL EV Válido)`;

    if (nameTitle) nameTitle.innerText = targetCompany.name;
    if (logoAvatar) logoAvatar.innerHTML = `<span class="brand-logo-text">${targetCompany.name.slice(0, 4).toUpperCase()}</span>`;
    if (categoryMeta) categoryMeta.innerText = `${targetCompany.category} • +${targetCompany.views || '291 mil'} visualizações • Informações de marca`;
    if (repStatus) repStatus.innerText = `${targetCompany.status} (${targetCompany.score} / 10)`;
    if (resolutionRate) resolutionRate.innerHTML = `<i class="ti ti-check"></i> Resolve <strong>${targetCompany.resolvedPct}</strong> das reclamações`;
    if (isSafeTitle) isSafeTitle.innerText = targetCompany.name;
    if (sayTitle) sayTitle.innerText = targetCompany.name;
    if (infoTitle) infoTitle.innerText = targetCompany.name;
    if (scoreLarge) scoreLarge.innerHTML = `${targetCompany.score}<small>/10</small>`;
    if (respondedPct) respondedPct.innerText = '98.4%';
    if (repeatPct) repeatPct.innerText = '74.2%';
    if (solutionPct) solutionPct.innerText = targetCompany.resolvedPct;
    if (aboutText) aboutText.innerText = targetCompany.about;
    if (cnpjVal) cnpjVal.innerText = targetCompany.cnpj;
    if (yearsVal) yearsVal.innerText = targetCompany.age;

    if (complaintsList && targetCompany.complaints) {
        complaintsList.innerHTML = targetCompany.complaints.map(c => `
            <div class="complaint-item-box">
                <strong style="display:block; color:var(--text-primary); margin-bottom:2px;">${c.title}</strong>
                <div style="display:flex; justify-content:space-between; font-size:10.5px; color:var(--text-muted);">
                    <span style="color:${c.status === 'Resolvido' ? '#047857' : '#3533CB'}; font-weight:800;">${c.status}</span>
                    <span>${c.date}</span>
                </div>
            </div>
        `).join('');
    }
};

// ------------------------------------------------------------
// 4. FERRAMENTAS PARA VOCÊ (ACTION CARDS NEUTROS)
// ------------------------------------------------------------
function inicializarActionCards() {
    const cardReclamar = document.getElementById('card-action-reclamar');
    const cardMinhas = document.getElementById('card-action-minhas');
    const cardDetectar = document.getElementById('card-action-detectar');
    const cardGuia = document.getElementById('card-action-guia');

    if (cardReclamar) {
        cardReclamar.addEventListener('click', () => {
            abrirModalDenuncia();
        });
    }

    if (cardMinhas) {
        cardMinhas.addEventListener('click', () => {
            showOnlyMyReports = !showOnlyMyReports;
            loadVeridionTrustData(currentDomainName);
        });
    }

    if (cardDetectar) {
        cardDetectar.addEventListener('click', () => {
            if (btnSearch) btnSearch.click();
        });
    }

    if (cardGuia) {
        cardGuia.addEventListener('click', () => {
            showOnlyMyReports = false;
            loadVeridionTrustData(currentDomainName);
            const feedBox = document.getElementById('feed-container-box');
            if (feedBox) feedBox.scrollIntoView({ behavior: 'smooth' });
        });
    }
}

// ------------------------------------------------------------
// 5. REDIRECIONAMENTO AUTOMÁTICO DA BUSCA DO VERIDION TRUST
// ------------------------------------------------------------
function inicializarHeroSearchComRedirecionamento() {
    const heroForm = document.getElementById('trust-hero-search-form');
    const heroInput = document.getElementById('trust-hero-search-input');
    const quickChips = document.querySelectorAll('.quick-chip');

    function redirecionarEPesquisar(query) {
        if (!query) return;
        const cleanQuery = query.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
        
        if (btnSearch) btnSearch.click();
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = cleanQuery;

        pesquisarDominio(cleanQuery);
    }

    if (heroForm) {
        heroForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = heroInput.value.trim();
            redirecionarEPesquisar(query);
        });
    }

    quickChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const query = chip.getAttribute('data-query');
            if (heroInput) heroInput.value = query;
            redirecionarEPesquisar(query);
        });
    });
}

// ------------------------------------------------------------
// 6. DIVIDIDO POR NICHOS (MELHORES VS PIORES EMPRESAS)
// ------------------------------------------------------------
function inicializarNicheComparison() {
    const buttons = document.querySelectorAll('.niche-scroll-btn');
    const bestList = document.getElementById('best-companies-list');
    const worstList = document.getElementById('worst-companies-list');

    function renderNicheData(nicheKey) {
        const data = NICHE_COMPANIES_DATA[nicheKey] || NICHE_COMPANIES_DATA.cama_mesa_banho;
        
        if (bestList) {
            bestList.innerHTML = data.best.map(b => `
                <div class="ranking-row-item">
                    <span class="badge-rank rank-green">${b.pos}</span>
                    <div class="company-info-col">
                        <strong class="company-name">${b.name}</strong>
                        <span class="company-domain">${b.domain}</span>
                    </div>
                    <div class="score-status-col text-right">
                        <span class="badge-status-verified">Selo Verificado</span>
                        <strong class="score-green-val">${b.score}</strong>
                    </div>
                </div>
            `).join('');
        }

        if (worstList) {
            worstList.innerHTML = data.worst.map(w => `
                <div class="ranking-row-item">
                    <span class="badge-rank rank-red">${w.pos}</span>
                    <div class="company-info-col">
                        <strong class="company-name">${w.name}</strong>
                        <span class="company-domain">${w.domain}</span>
                    </div>
                    <div class="score-status-col text-right">
                        <span class="badge-status-not-rec">${w.status}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const niche = btn.getAttribute('data-niche');
            renderNicheData(niche);
        });
    });
}

// ------------------------------------------------------------
// 7. DADOS E FEED DO VERIDION TRUST
// ------------------------------------------------------------
async function loadVeridionTrustData(domainName) {
    const domainEl = document.getElementById('trust-domain-name');
    currentDomainName = domainName || 'mercadolivre.com.br';
    if (domainEl) domainEl.innerText = currentDomainName;

    try {
        let reports = [];

        try {
            const res = await fetch(`${BACKEND_URL}/community/site?domain=${encodeURIComponent(currentDomainName)}`);
            if (res.ok) {
                const data = await res.json();
                reports = data.denuncias || [];
            }
        } catch (e) {
            console.warn('[Veridion Trust] Supabase offline, buscando histórico local...', e);
        }

        const { local_trust_history = [] } = await chrome.storage.local.get('local_trust_history');
        
        const idsExistentes = new Set(reports.map(r => r.id));
        if (!reports || reports.length === 0) {
            reports = [
                {
                    id: 101,
                    domain: "eletro-promocoes.xyz",
                    url: "https://eletro-promocoes.xyz",
                    category: "GOLPE_PIX",
                    comment: "Tentei comprar uma fritadeira Air Fryer por R$ 89 num link patrocinado do Facebook e o valor foi transferido para uma conta física de larvas no Pix.",
                    timestamp: "2026-02-14T10:30:00Z"
                },
                {
                    id: 102,
                    domain: "renner-outlet.online",
                    url: "https://renner-outlet.online",
                    category: "SITE_CLONADO",
                    comment: "Clonaram o site da Renner com os mesmos produtos e preços 70% mais baratos. O Veridion disparou o alerta vermelho de fraude a tempo.",
                    timestamp: "2026-02-14T08:15:00Z"
                },
                {
                    id: 103,
                    domain: "nubaunk-fatura.com",
                    url: "https://nubaunk-fatura.com",
                    category: "GOLPE_PIX",
                    comment: "Recebi uma mensagem no WhatsApp com o link nubaunk-fatura.com. A IA identificou o golpe de escrita parecida imediatamente.",
                    timestamp: "2026-02-13T16:45:00Z"
                },
                {
                    id: 104,
                    domain: "rastreio-correios-taxa.net",
                    url: "https://rastreio-correios-taxa.net",
                    category: "GOLPE_PIX",
                    comment: "Falsa taxa de entrega de encomenda dos Correios. Pediam R$ 27,90 no Pix para liberar um suposto pacote retido em Curitiba.",
                    timestamp: "2026-02-12T14:20:00Z"
                },
                {
                    id: 105,
                    domain: "downloads-gratis.site",
                    url: "https://downloads-gratis.site",
                    category: "CONTEUDO_18",
                    comment: "Site de download de jogos camuflava redirecionamento para conteúdo impróprio e pop-ups de vírus.",
                    timestamp: "2026-02-10T11:00:00Z"
                },
                {
                    id: 106,
                    domain: "portal-noticias-brasil.xyz",
                    url: "https://portal-noticias-brasil.xyz",
                    category: "FAKE_NEWS",
                    comment: "Notícia falsa sobre encerramento de programa social usada para coletar CPF e dados bancários das pessoas.",
                    timestamp: "2026-02-08T09:10:00Z"
                }
            ];
        }

        let filteredReports = reports;
        
        if (showOnlyMyReports) {
            filteredReports = local_trust_history || [];
        }

        if (currentActiveFilter !== 'ALL') {
            filteredReports = filteredReports.filter(r => (r.category || r.motivo) === currentActiveFilter);
        }

        const totalReports = reports.length;
        const countEl = document.getElementById('trust-reports-count');
        if (countEl) countEl.innerHTML = `<i class="ti ti-info-circle"></i> ${totalReports} Denúncias Registradas`;

        const approvalPct = totalReports > 0 ? Math.max(10, 100 - (totalReports * 15)) : 85;
        const scoreBarEl = document.getElementById('trust-score-bar');
        const approvalPctEl = document.getElementById('trust-approval-pct');
        if (scoreBarEl) scoreBarEl.style.width = `${approvalPct}%`;
        if (approvalPctEl) approvalPctEl.innerText = `${approvalPct}% Aprovado`;

        const commentsList = document.getElementById('trust-comments-list');
        if (commentsList) {
            if (filteredReports.length > 0) {
                commentsList.innerHTML = filteredReports.slice(0, 3).map(r => `
                    <div class="comment-card flex-comment-row">
                        <div>
                            <span class="category-badge">${(r.category || r.motivo || 'GOLPE').replace('_', ' ')}</span>
                            <p>${r.comment || r.comentario || 'Denúncia registrada sem comentário.'}</p>
                            <small><i class="ti ti-clock"></i> ${new Date(r.timestamp || r.criado_em || Date.now()).toLocaleDateString('pt-BR')} — Domínio: <strong>${r.domain || r.url || currentDomainName}</strong></small>
                        </div>
                        <button class="btn-report-details"><i class="ti ti-info-circle"></i> Ver detalhes</button>
                    </div>
                `).join('');
            } else {
                commentsList.innerHTML = '<p class="empty-feed">Nenhum relato encontrado para os filtros selecionados.</p>';
            }
        }
    } catch (err) {
        console.error('Erro ao carregar dados do Veridion Trust:', err);
    }
}

function inicializarFeedVeridionTrust() {
    loadVeridionTrustData(currentDomainName);

    document.querySelectorAll('.chip-filter').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.chip-filter').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentActiveFilter = chip.getAttribute('data-filter');
            loadVeridionTrustData(currentDomainName);
        });
    });

    const btnB2B = document.getElementById('btn-b2b-enterprise-trigger');
    if (btnB2B) {
        btnB2B.addEventListener('click', () => {
            btnConfig.click();
        });
    }
}

// ------------------------------------------------------------
// 8. MODAL DE DENÚNCIA
// ------------------------------------------------------------
function abrirModalDenuncia() {
    const modal = document.getElementById('report-modal');
    if (modal) modal.classList.remove('hidden');
}

function inicializarModalDenuncia() {
    const modal = document.getElementById('report-modal');
    const btnClose = document.getElementById('btn-close-modal');
    const btnCancel = document.getElementById('btn-cancel-modal');
    const btnSubmit = document.getElementById('btn-submit-report');
    const catBtns = document.querySelectorAll('.btn-category');

    if (btnClose && modal) btnClose.addEventListener('click', () => modal.classList.add('hidden'));
    if (btnCancel && modal) btnCancel.addEventListener('click', () => modal.classList.add('hidden'));

    catBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            catBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedCategory = btn.getAttribute('data-category');
        });
    });

    if (btnSubmit) {
        btnSubmit.addEventListener('click', async () => {
            const domainInput = document.getElementById('modal-report-domain');
            const commentInput = document.getElementById('report-comment');

            const domainVal = domainInput ? domainInput.value.trim() : currentDomainName;
            const commentVal = commentInput ? commentInput.value.trim() : '';

            const cleanDom = domainVal.replace(/^https?:\/\//, '').replace(/^www\./, '');
            const newReport = {
                id: Date.now(),
                domain: cleanDom,
                url: `https://${cleanDom}`,
                category: selectedCategory,
                comment: commentVal,
                timestamp: new Date().toISOString()
            };

            const { pending_reports = [], local_trust_history = [] } = await chrome.storage.local.get(['pending_reports', 'local_trust_history']);
            pending_reports.push(newReport);
            local_trust_history.unshift(newReport);

            await chrome.storage.local.set({ pending_reports, local_trust_history });

            alert('Denúncia registrada com sucesso no Veridion Trust!');
            if (modal) modal.classList.add('hidden');
            if (domainInput) domainInput.value = '';
            if (commentInput) commentInput.value = '';

            loadVeridionTrustData(cleanDom);
            carregarHistoricoPessoal();
        });
    }
}

// ------------------------------------------------------------
// 9. MODAL DE PAGAMENTO PIX & ATUALIZAÇÃO DO PLANO
// ------------------------------------------------------------
function inicializarPagamentoPix() {
    const modalPayment = document.getElementById('payment-pix-modal');
    const btnClosePayment = document.getElementById('btn-close-payment-modal');
    const btnCopyPixKey = document.getElementById('btn-copy-pix-key');
    const btnConfirmPayment = document.getElementById('btn-confirm-pix-payment');
    const pixInput = document.getElementById('pix-key-input');
    const modalTitle = document.getElementById('payment-modal-title');

    document.querySelectorAll('.btn-open-payment-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalDetails = document.getElementById('enterprise-details-modal');
            if (modalDetails) modalDetails.classList.add('hidden');

            selectedPaymentPlan = btn.getAttribute('data-plan') || 'Enterprise';
            const price = btn.getAttribute('data-price') || '54,90';
            
            if (modalTitle) modalTitle.innerText = `Ativação do Plano Veridion ${selectedPaymentPlan} (R$ ${price}/mês)`;
            if (modalPayment) modalPayment.classList.remove('hidden');
        });
    });

    if (btnClosePayment && modalPayment) {
        btnClosePayment.addEventListener('click', () => modalPayment.classList.add('hidden'));
    }

    if (btnCopyPixKey && pixInput) {
        btnCopyPixKey.addEventListener('click', () => {
            pixInput.select();
            navigator.clipboard.writeText(pixInput.value).then(() => {
                const origText = btnCopyPixKey.innerHTML;
                btnCopyPixKey.innerHTML = '<i class="ti ti-check"></i> Copiado!';
                btnCopyPixKey.style.background = '#10B981';
                setTimeout(() => {
                    btnCopyPixKey.innerHTML = origText;
                    btnCopyPixKey.style.background = '#3533CB';
                }, 2000);
            });
        });
    }

    if (btnConfirmPayment) {
        btnConfirmPayment.addEventListener('click', async () => {
            const isEnt = selectedPaymentPlan === 'Enterprise';
            await chrome.storage.local.set({ isEnterprise: isEnt, isPremium: true });

            if (modalPayment) modalPayment.classList.add('hidden');

            const btnPainelNav = document.getElementById('nav-btn-painel-empresa');
            if (isEnt && btnPainelNav) {
                btnPainelNav.classList.remove('hidden');
            }

            atualizarExibicaoPlanoAtual(isEnt ? 'Enterprise' : 'Premium');
            configurarTogglesPremiumVisual(true, isEnt);
            configurarTogglesEnterpriseVisual(isEnt);

            alert(`⚡ Pagamento efetuado com Sucesso!\n\nSeu ${selectedPaymentPlan === 'Enterprise' ? 'Plano Veridion Enterprise' : 'Plano Veridion Premium'} foi ativado com sucesso!`);
        });
    }
}

// ------------------------------------------------------------
// 10. MODAL DE DETALHES COMPLETOS DO PLANO ENTERPRISE
// ------------------------------------------------------------
function inicializarModalDetalhesEnterprise() {
    const btnOpen = document.getElementById('btn-open-enterprise-details');
    const btnClose = document.getElementById('btn-close-enterprise-details');
    const modalDetails = document.getElementById('enterprise-details-modal');

    if (btnOpen && modalDetails) {
        btnOpen.addEventListener('click', () => {
            modalDetails.classList.remove('hidden');
        });
    }

    if (btnClose && modalDetails) {
        btnClose.addEventListener('click', () => {
            modalDetails.classList.add('hidden');
        });
    }
}

// ------------------------------------------------------------
// 11. PREFERÊNCIAS DA EXTENSÃO (BLOQUEIOS E LIBERAÇÕES VISUAIS)
// ------------------------------------------------------------
function configurarTogglesPremiumVisual(isPremium, isEnterprise) {
    const togglePix = document.getElementById('toggle-pix-checker');
    const rowPix = document.getElementById('row-toggle-pix-checker');
    if (!togglePix) return;

    const parentLabel = togglePix.parentElement;
    const isUnlocked = isPremium || isEnterprise;

    if (isUnlocked) {
        togglePix.disabled = false;
        if (parentLabel) parentLabel.classList.remove('switch-disabled');

        togglePix.onchange = async () => {
            await chrome.storage.local.set({ pixCheckerAtivo: togglePix.checked });
        };
    } else {
        togglePix.disabled = true;
        togglePix.checked = false;
        if (parentLabel) parentLabel.classList.add('switch-disabled');

        if (rowPix) {
            rowPix.onclick = (e) => {
                e.preventDefault();
                alert('👑 Recurso Exclusivo do Plano VIP Premium!\n\nEsta função de Identificador de Pix Fake & CNPJ Laranja é exclusiva para assinantes Premium ou Enterprise.\n\nAssine por R$ 9,90/mês para liberar.');
                
                const modalPayment = document.getElementById('payment-pix-modal');
                const modalTitle = document.getElementById('payment-modal-title');
                selectedPaymentPlan = 'Premium';
                if (modalTitle) modalTitle.innerText = 'Ativação do Plano Veridion Premium (R$ 9,90/mês)';
                if (modalPayment) modalPayment.classList.remove('hidden');
            };
        }
    }
}

function configurarTogglesEnterpriseVisual(isEnterprise) {
    const toggleMeetings = document.getElementById('toggle-meetings-summary');
    const toggleProposal = document.getElementById('toggle-proposal-writer');
    const rowMeetings = document.getElementById('row-toggle-meetings');
    const rowProposal = document.getElementById('row-toggle-proposal');

    [ { toggle: toggleMeetings, row: rowMeetings, key: 'resumoReunioesAtivo' },
      { toggle: toggleProposal, row: rowProposal, key: 'redatorPropostasAtivo' }
    ].forEach(({ toggle, row, key }) => {
        if (!toggle) return;
        const parentLabel = toggle.parentElement;

        if (isEnterprise) {
            toggle.disabled = false;
            if (parentLabel) parentLabel.classList.remove('switch-disabled');

            toggle.onchange = async () => {
                const data = {};
                data[key] = toggle.checked;
                await chrome.storage.local.set(data);
            };
        } else {
            toggle.disabled = true;
            toggle.checked = false;
            if (parentLabel) parentLabel.classList.add('switch-disabled');

            if (row) {
                row.onclick = (e) => {
                    e.preventDefault();
                    alert('👑 Recurso Exclusivo do Plano Veridion Enterprise B2B!\n\nEste recurso corporativo (Resumo de Reuniões & Redator WebMCP) é exclusivo para assinantes Enterprise.\n\nAssine por R$ 54,90/mês para liberar.');
                    
                    const modalPayment = document.getElementById('payment-pix-modal');
                    const modalTitle = document.getElementById('payment-modal-title');
                    selectedPaymentPlan = 'Enterprise';
                    if (modalTitle) modalTitle.innerText = 'Ativação do Plano Veridion Enterprise B2B (R$ 54,90/mês)';
                    if (modalPayment) modalPayment.classList.remove('hidden');
                };
            }
        }
    });
}

async function inicializarPreferenciasExtensao() {
    const toggleActive = document.getElementById('toggle-active-extension');
    const toggleTypo = document.getElementById('toggle-typo-blocker');
    const toggleAdult = document.getElementById('toggle-adult-blocker');

    const { desativadoWidget, desativarTyposquatting, bloqueadorAdultoTeste, isEnterprise, isPremium } = 
        await chrome.storage.local.get(['desativadoWidget', 'desativarTyposquatting', 'bloqueadorAdultoTeste', 'isEnterprise', 'isPremium']);

    if (toggleActive) {
        toggleActive.checked = !desativadoWidget;
        toggleActive.addEventListener('change', async () => {
            await chrome.storage.local.set({ desativadoWidget: !toggleActive.checked });
        });
    }

    if (toggleTypo) {
        toggleTypo.checked = !desativarTyposquatting;
        toggleTypo.addEventListener('change', async () => {
            await chrome.storage.local.set({ desativarTyposquatting: !toggleTypo.checked });
        });
    }

    if (toggleAdult) {
        toggleAdult.checked = !!bloqueadorAdultoTeste;
        toggleAdult.addEventListener('change', async () => {
            await chrome.storage.local.set({ bloqueadorAdultoTeste: toggleAdult.checked });
        });
    }

    configurarTogglesPremiumVisual(!!isPremium, !!isEnterprise);
    configurarTogglesEnterpriseVisual(!!isEnterprise);
}

// ------------------------------------------------------------
// 12. EXIBIÇÃO DO PLANO ATUAL DO USUÁRIO NO PERFIL
// ------------------------------------------------------------
function atualizarExibicaoPlanoAtual(tipoPlano) {
    const planDisplay = document.getElementById('user-current-plan-display');
    if (!planDisplay) return;

    if (tipoPlano === 'Enterprise') {
        planDisplay.className = 'user-plan-badge-box plan-enterprise-active';
        planDisplay.innerHTML = '<i class="ti ti-briefcase"></i> Plano Veridion Enterprise';
    } else if (tipoPlano === 'Premium') {
        planDisplay.className = 'user-plan-badge-box plan-premium-active';
        planDisplay.innerHTML = '<i class="ti ti-bolt"></i> Plano Veridion Premium';
    } else {
        planDisplay.className = 'user-plan-badge-box plan-free-active';
        planDisplay.innerHTML = '<i class="ti ti-shield"></i> Plano Veridion Free';
    }
}

async function carregarDadosConfig() {
    try {
        const { isEnterprise, isPremium } = await chrome.storage.local.get(['isEnterprise', 'isPremium']);
        const btnPainelNav = document.getElementById('nav-btn-painel-empresa');

        if (isEnterprise) {
            if (btnPainelNav) btnPainelNav.classList.remove('hidden');
            atualizarExibicaoPlanoAtual('Enterprise');
            configurarTogglesPremiumVisual(true, true);
            configurarTogglesEnterpriseVisual(true);
        } else if (isPremium) {
            if (btnPainelNav) btnPainelNav.classList.add('hidden');
            atualizarExibicaoPlanoAtual('Premium');
            configurarTogglesPremiumVisual(true, false);
            configurarTogglesEnterpriseVisual(false);
        } else {
            if (btnPainelNav) btnPainelNav.classList.add('hidden');
            atualizarExibicaoPlanoAtual('Free');
            configurarTogglesPremiumVisual(false, false);
            configurarTogglesEnterpriseVisual(false);
        }

        const { user } = await chrome.runtime.sendMessage({ type: 'GET_USER' });
        if (user) {
            const nameEl = document.getElementById('profile-name');
            const emailEl = document.getElementById('profile-email');
            if (nameEl) nameEl.value = user.nome_completo || user.nome || 'Antonio Oliveira';
            if (emailEl) emailEl.value = user.email || 'yuri@gmail.com';
        }
    } catch (e) {
        console.warn('[Veridion Config] Perfil local:', e);
    }

    carregarHistoricoPessoal();
}

function inicializarHistoricoAtividade() {
    const tabComments = document.getElementById('tab-btn-comments');
    const tabAnalyses = document.getElementById('tab-btn-analyses');
    const sectionComments = document.getElementById('history-comments-section');
    const sectionAnalyses = document.getElementById('history-analyses-section');

    if (tabComments && tabAnalyses) {
        tabComments.addEventListener('click', () => {
            tabComments.classList.add('active');
            tabAnalyses.classList.remove('active');
            if (sectionComments) sectionComments.classList.remove('hidden');
            if (sectionAnalyses) sectionAnalyses.classList.add('hidden');
        });

        tabAnalyses.addEventListener('click', () => {
            tabAnalyses.classList.add('active');
            tabComments.classList.remove('active');
            if (sectionAnalyses) sectionAnalyses.classList.remove('hidden');
            if (sectionComments) sectionComments.classList.add('hidden');
        });
    }
}

const DEFAULT_MOCK_DENUNCIAS = [
    {
        domain: 'promocao-falsa-insta.xyz',
        date: '14/02/2026 às 14:32',
        marked: '🛑 Voto: Golpe no Pix',
        comment: 'Site clonado do Instagram prometendo iPhone 15 Pro Max por R$ 199 no Pix. Cuidado!',
        badgeClass: 'badge-danger'
    },
    {
        domain: 'nike-outlet-desconto.online',
        date: '10/02/2026 às 09:15',
        marked: '🕵️ Voto: Site Clonado',
        comment: 'E-commerce falso utilizando fotos e logotipo da Nike sem autorização.',
        badgeClass: 'badge-danger'
    },
    {
        domain: 'leilao-detran.org',
        date: '05/02/2026 às 18:20',
        marked: '🛑 Voto: Golpe no Pix',
        comment: 'Página falsa de leilão de veículos cobrando taxa antecipada de transferência.',
        badgeClass: 'badge-danger'
    },
    {
        domain: 'pix-premiado-oficial.net',
        date: '28/01/2026 às 11:05',
        marked: '🛑 Voto: Golpe no Pix',
        comment: 'Golpe da roleta de prêmios exigindo taxa para liberar suposto saldo Pix.',
        badgeClass: 'badge-danger'
    }
];

const DEFAULT_MOCK_ANALISES = [
    {
        domain: 'mercadolivre.com.br',
        date: 'Hoje às 11:05',
        marked: '✅ Confiável (Score 95/100)',
        comment: 'Domínio oficial verificado com SSL EV, CNPJ ativo na Receita Federal e reputação colaborativa ativa.',
        badgeClass: ''
    },
    {
        domain: 'amazon.com.br',
        date: 'Ontem às 19:40',
        marked: '✅ Confiável (Score 94/100)',
        comment: 'E-commerce oficial auditado com 100% de integridade de catálogo e pagamentos seguros.',
        badgeClass: ''
    },
    {
        domain: 'promocao-falsa-insta.xyz',
        date: '14/02/2026 às 14:32',
        marked: '🛑 Perigo (Score 12/100)',
        comment: 'Domínio malicioso com servidores anônimos no exterior e alto risco de fraude financeira.',
        badgeClass: 'badge-danger'
    },
    {
        domain: 'nubank.com.br',
        date: '12/02/2026 às 16:15',
        marked: '✅ Confiável (Score 98/100)',
        comment: 'Portal oficial bancário com protocolo SSL EV de alta segurança.',
        badgeClass: ''
    },
    {
        domain: 'kabum.com.br',
        date: '10/02/2026 às 10:20',
        marked: '✅ Confiável (Score 92/100)',
        comment: 'Loja oficial de tecnologia auditada pela comunidade do Veridion Trust.',
        badgeClass: ''
    }
];

async function carregarHistoricoPessoal() {
    const listDenuncias = document.getElementById('personal-denuncias-list');
    const listAnalises = document.getElementById('personal-analises-list');

    const { local_trust_history = [], cached_domains = {} } = 
        await chrome.storage.local.get(['local_trust_history', 'cached_domains']);

    if (listDenuncias) {
        let denunciasToRender = local_trust_history.map(item => ({
            domain: item.domain || item.url || 'Domínio',
            date: new Date(item.timestamp || Date.now()).toLocaleDateString('pt-BR'),
            marked: `Voto: ${(item.category || item.motivo || 'GOLPE').replace('_', ' ')}`,
            comment: item.comment || item.comentario || 'Sem comentário.',
            badgeClass: 'badge-danger'
        }));

        if (denunciasToRender.length === 0) {
            denunciasToRender = DEFAULT_MOCK_DENUNCIAS;
        }

        listDenuncias.innerHTML = denunciasToRender.slice(0, 3).map(item => `
            <div class="activity-item-card">
                <div class="act-item-header">
                    <strong class="act-domain-name"><i class="ti ti-world"></i> ${item.domain}</strong>
                    <span class="act-date">${item.date}</span>
                </div>
                <div class="act-marked-row">
                    <span class="act-marked-label">O que você marcou:</span>
                    <span class="c-rep-badge ${item.badgeClass}">${item.marked}</span>
                </div>
                <p class="act-user-comment">"${item.comment}"</p>
                <div class="act-actions-row">
                    <button class="btn-view-ai-response"><i class="ti ti-sparkles"></i> Ver resposta da IA</button>
                </div>
            </div>
        `).join('');
    }

    if (listAnalises) {
        const domainsList = Object.keys(cached_domains);
        let analisesToRender = domainsList.map(domainKey => {
            const item = cached_domains[domainKey];
            return {
                domain: domainKey,
                date: new Date(item.timestamp || Date.now()).toLocaleDateString('pt-BR'),
                marked: `Score ${item.score || 95}/100`,
                comment: item.detalhe || 'Verificado por IA',
                badgeClass: (item.score || 95) < 30 ? 'badge-danger' : ''
            };
        });

        if (analisesToRender.length === 0) {
            analisesToRender = DEFAULT_MOCK_ANALISES;
        }

        listAnalises.innerHTML = analisesToRender.slice(0, 3).map(item => `
            <div class="activity-item-card">
                <div class="act-item-header">
                    <strong class="act-domain-name"><i class="ti ti-world"></i> ${item.domain}</strong>
                    <span class="act-date">${item.date}</span>
                </div>
                <div class="act-marked-row">
                    <span class="act-marked-label">O que você marcou:</span>
                    <span class="c-rep-badge ${item.badgeClass}">${item.marked}</span>
                </div>
                <p class="act-user-comment">${item.comment}</p>
                <div class="act-actions-row">
                    <button class="btn-view-ai-response"><i class="ti ti-sparkles"></i> Ver resposta da IA</button>
                </div>
            </div>
        `).join('');
    }
}

function inicializarEnterpriseB2B() {
    const btnLogout = document.getElementById('btn-config-logout');

    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            await chrome.runtime.sendMessage({ type: 'LOGOUT' });
        });
    }
}

// ------------------------------------------------------------
// 13. LÓGICA DO PAINEL EMPRESA GROWTH (B2B ENTERPRISE DASHBOARD)
// ------------------------------------------------------------
function inicializarPainelEmpresaGrowth() {
    const modalEdit = document.getElementById('modal-company-edit');
    const btnOpenEdit = document.getElementById('btn-edit-company-info');
    const btnCloseEdit = document.getElementById('btn-close-company-edit');
    const btnSaveEdit = document.getElementById('btn-save-company-edit');

    if (btnOpenEdit && modalEdit) btnOpenEdit.addEventListener('click', () => modalEdit.classList.remove('hidden'));
    if (btnCloseEdit && modalEdit) btnCloseEdit.addEventListener('click', () => modalEdit.classList.add('hidden'));
    if (btnSaveEdit && modalEdit) {
        btnSaveEdit.addEventListener('click', () => {
            modalEdit.classList.add('hidden');
            alert('✅ Informações da empresa Growth Suplementos atualizadas com sucesso!');
        });
    }

    const modalCoupon = document.getElementById('modal-company-coupon');
    const btnOpenCoupon = document.getElementById('btn-open-add-coupon-modal');
    const btnCloseCoupon = document.getElementById('btn-close-company-coupon');
    const btnSaveCoupon = document.getElementById('btn-save-company-coupon');

    if (btnOpenCoupon && modalCoupon) btnOpenCoupon.addEventListener('click', () => modalCoupon.classList.remove('hidden'));
    if (btnCloseCoupon && modalCoupon) btnCloseCoupon.addEventListener('click', () => modalCoupon.classList.add('hidden'));
    if (btnSaveCoupon && modalCoupon) {
        btnSaveCoupon.addEventListener('click', () => {
            const codeInput = document.getElementById('input-coupon-code');
            const descInput = document.getElementById('input-coupon-desc');
            const couponsList = document.getElementById('company-coupons-list');
            
            const code = (codeInput && codeInput.value ? codeInput.value : 'GROWTHOFF').toUpperCase();
            const desc = (descInput && descInput.value ? descInput.value : 'Cupom exclusivo cadastrado');

            if (couponsList) {
                const newBox = document.createElement('div');
                newBox.className = 'company-coupon-box';
                newBox.innerHTML = `
                    <div class="coupon-box-top">
                        <strong class="coupon-code-title">${code}</strong>
                        <span class="coupon-badge-active">Ativo</span>
                    </div>
                    <p class="coupon-desc">${desc}</p>
                    <small class="coupon-used">Criado agora • 0 utilizações</small>
                `;
                couponsList.prepend(newBox);
            }

            modalCoupon.classList.add('hidden');
            if (codeInput) codeInput.value = '';
            if (descInput) descInput.value = '';
            alert(`🎟️ Cupom ${code} publicado com sucesso no perfil público da Growth!`);
        });
    }

    const modalReply = document.getElementById('modal-company-reply');
    const btnCloseReply = document.getElementById('btn-close-company-reply');
    const btnSendReply = document.getElementById('btn-send-complaint-reply');
    const replyTargetCust = document.getElementById('reply-modal-target-cust');

    let activeReplyBtn = null;

    document.querySelectorAll('.btn-reply-complaint').forEach(btn => {
        btn.addEventListener('click', () => {
            activeReplyBtn = btn;
            const custName = btn.getAttribute('data-cust-name') || 'Cliente';
            if (replyTargetCust) replyTargetCust.innerText = `Cliente: ${custName}`;
            if (modalReply) modalReply.classList.remove('hidden');
        });
    });

    if (btnCloseReply && modalReply) btnCloseReply.addEventListener('click', () => modalReply.classList.add('hidden'));
    if (btnSendReply && modalReply) {
        btnSendReply.addEventListener('click', () => {
            const replyTextEl = document.getElementById('input-reply-text');
            const text = (replyTextEl && replyTextEl.value ? replyTextEl.value : 'Olá! Agradecemos o contato. Nossa equipe de atendimento solucionou sua solicitação prioritariamente.');

            if (activeReplyBtn) {
                const card = activeReplyBtn.parentElement;
                if (card) {
                    const badge = card.querySelector('.c-rep-badge');
                    if (badge) {
                        badge.className = 'c-rep-badge';
                        badge.style.background = '#ECFDF5';
                        badge.style.color = '#047857';
                        badge.innerText = 'Respondida & Resolvida';
                    }

                    activeReplyBtn.style.display = 'none';

                    const replyBox = document.createElement('div');
                    replyBox.className = 'comp-reply-box';
                    replyBox.innerHTML = `
                        <strong style="color:var(--indigo);">Resposta Oficial da Growth:</strong>
                        <p style="margin:2px 0 0; font-size:12px; color:var(--text-primary);">${text}</p>
                    `;
                    card.appendChild(replyBox);
                }
            }

            modalReply.classList.add('hidden');
            if (replyTextEl) replyTextEl.value = '';
            alert('💬 Resposta oficial da Growth enviada e registrada no Veridion Trust!');
        });
    }

    const modalSeal = document.getElementById('modal-company-seal');
    const btnOpenSeal = document.getElementById('btn-request-ai-seal');
    const btnCloseSeal = document.getElementById('btn-close-company-seal');
    const btnConfirmSeal = document.getElementById('btn-confirm-seal-request');

    if (btnOpenSeal && modalSeal) btnOpenSeal.addEventListener('click', () => modalSeal.classList.remove('hidden'));
    if (btnCloseSeal && modalSeal) btnCloseSeal.addEventListener('click', () => modalSeal.classList.add('hidden'));
    if (btnConfirmSeal && modalSeal) {
        btnConfirmSeal.addEventListener('click', () => {
            modalSeal.classList.add('hidden');
            alert('✨ Selo "Verificado por Veridion IA" emitido e ativado para o domínio oficial da Growth!');
        });
    }

    const btnContactVip = document.getElementById('btn-contact-support-vip');
    if (btnContactVip) {
        btnContactVip.addEventListener('click', () => {
            alert('🎧 Atendimento VIP 24/7:\n\nSeu gerente de conta exclusivo (Felipe Mendes) foi notificado. Entraremos em contato via WhatsApp/Telefone em até 15 minutos!');
        });
    }
}
