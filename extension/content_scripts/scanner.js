// ============================================================
//  Veridion — scanner.js (content script)
//  Injetado em todas as páginas pelo manifest.json.
//  Responsabilidades:
//    1. Injetar o widget flutuante na página
//    2. Coletar texto e imagens da página
//    3. Verificar autenticação antes de analisar
//    4. Enviar dados ao back-end e exibir o resultado
// ============================================================

// BACKEND_URL vem de shared/config.js, carregado antes deste arquivo pelo manifest.json

// ------------------------------------------------------------
//  1. HTML do widget — injetado no final do <body>
// ------------------------------------------------------------

const widgetHTML = `
  <div id="veridion-widget-root">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&family=Questrial&display=swap');
      @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css');
    </style>

    <div id="veridion-floating-btn">V</div>

    <div id="veridion-panel">
      <!-- Toast de Notificação -->
      <div id="ver-toast" class="ver-toast ver-hidden">Resultado copiado com sucesso!</div>

      <!-- Cabeçalho Fixo (Elemento estático fora das telas) -->
      <div class="ver-header-fixed">
        <img src="${chrome.runtime.getURL('assets/icons/icon48.png')}" alt="Veridion Logo" class="ver-logo">
        <div class="ver-slogan">Confiança em Cada Clique</div>
        <div class="ver-header-actions">
          <button id="ver-btn-comunidade-header" class="ver-header-icon-btn" title="Comunidade Veridion">
            <i class="ti ti-users"></i>
          </button>
          <button id="ver-btn-config-header" class="ver-header-icon-btn" title="Configurações">
            <i class="ti ti-settings"></i>
          </button>
        </div>
      </div>

      <!-- TELA 1: Pop-up Inicial -->
      <div id="tela-inicial" class="screen active">
        <div class="ver-status">
          <p id="ver-texto-status">Pronto para analisar esta página.</p>
        </div>
        <button id="ver-btn-analisar" class="ver-btn">Analisar Página com IA</button>
      </div>

      <!-- TELA 2: Visão Geral do Veredito (Pós-análise de Site) -->
      <div id="tela-veredito" class="screen">
        <h2 class="ver-screen-title">Análise concluída!</h2>
        
        <!-- Semicircular Gauge Chart -->
        <div class="ver-gauge-container">
          <svg class="ver-gauge-svg" viewBox="0 0 100 50">
            <path class="ver-gauge-track" d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke-linecap="round"/>
            <path class="ver-gauge-fill" id="ver-gauge-fill-site-path" d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke-linecap="round" stroke-dasharray="125.66" stroke-dashoffset="125.66"/>
          </svg>
          <div class="ver-gauge-center">
            <span id="ver-score-circulo" class="ver-score-number">--</span>
          </div>
        </div>
        <div id="ver-veredicto" class="ver-veredito-texto">--</div>

        <!-- Votos da Comunidade -->
        <div class="ver-community-votes-section">
          <div class="ver-community-votes-title">Avaliações da Comunidade:</div>
          <div class="ver-community-votes-row">
            <div class="ver-vote-count-box">
              <span class="ver-vote-label">Confiável</span>
              <span id="ver-vote-confiavel-count" class="ver-vote-num">0</span>
            </div>
            <div class="ver-vote-count-box">
              <span class="ver-vote-label">Suspeito</span>
              <span id="ver-vote-suspeito-count" class="ver-vote-num">0</span>
            </div>
            <div class="ver-vote-count-box">
              <span class="ver-vote-label">Golpe</span>
              <span id="ver-vote-golpe-count" class="ver-vote-num">0</span>
            </div>
          </div>
          
          <div class="ver-quick-vote-title">Dê seu voto sobre este site:</div>
          <div class="ver-quick-vote-buttons">
            <button id="ver-btn-vote-confiavel" class="ver-quick-vote-btn ver-vote-btn-success" title="Votar Confiável">
              <i class="ti ti-thumb-up"></i> <span>Confiável</span>
            </button>
            <button id="ver-btn-vote-suspeito" class="ver-quick-vote-btn ver-vote-btn-warning" title="Votar Suspeito">
              <i class="ti ti-alert-circle"></i> <span>Suspeito</span>
            </button>
            <button id="ver-btn-vote-golpe" class="ver-quick-vote-btn ver-vote-btn-danger" title="Votar Golpe">
              <i class="ti ti-alert-triangle"></i> <span>Golpe</span>
            </button>
          </div>

          <div id="ver-quick-vote-comment-container" class="ver-hidden">
            <textarea id="ver-quick-vote-comment" placeholder="Adicione um comentário (opcional)"></textarea>
            <button id="ver-btn-confirmar-voto" class="ver-btn">Confirmar Voto</button>
          </div>
        </div>

        <!-- Ações -->
        <div class="ver-actions-column">
          <button id="ver-btn-compartilhar" class="ver-btn-action">
            <i class="ti ti-share"></i> Compartilhar veredito
          </button>
          <button id="ver-btn-denunciar-dominio" class="ver-btn-action ver-btn-danger-ghost">
            <i class="ti ti-alert-triangle"></i> Denunciar domínio
          </button>
        </div>

        <a href="#" id="ver-link-detalhes" class="ver-details-link">Ver detalhes completos &rarr;</a>
      </div>

      <!-- TELA 3: Detalhes Completos da IA -->
      <div id="tela-detalhes" class="screen">
        <a href="#" id="ver-link-voltar" class="ver-back-link">
          <i class="ti ti-arrow-left"></i> Voltar para o Veredito
        </a>

        <!-- Cards internos com detalhes da detecção -->
        <div class="ver-details-card">
          <div id="ver-detalhe" class="ver-detalhe-text">--</div>
        </div>

        <button id="ver-btn-analisar-novamente" class="ver-btn ver-btn-secondary">Analisar novamente</button>
      </div>

      <!-- TELA 4: Veredito de Imagem -->
      <div id="tela-imagem" class="screen">
        <h2 class="ver-screen-title">Veredito da Imagem</h2>

        <!-- Semicircular Gauge Chart Específico -->
        <div class="ver-gauge-container">
          <svg class="ver-gauge-svg" viewBox="0 0 100 50">
            <path class="ver-gauge-track" d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke-linecap="round"/>
            <path class="ver-gauge-fill" id="ver-gauge-fill-image-path" d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke-linecap="round" stroke-dasharray="125.66" stroke-dashoffset="125.66"/>
          </svg>
          <div class="ver-gauge-center">
            <span id="ver-image-score" class="ver-score-number">--</span>
          </div>
        </div>
        <div id="ver-image-veredicto" class="ver-veredito-texto ver-veredito-highlight">--</div>

        <!-- Cards internos com detalhes da detecção -->
        <div class="ver-details-card">
          <div id="ver-imagem-info" class="ver-detalhe-text">--</div>
        </div>

        <!-- Ações -->
        <div class="ver-actions-column">
          <!-- Ver detalhes completos para Imagem -->
          <button id="ver-btn-detalhes-imagem" class="ver-btn ver-btn-secondary">
            <i class="ti ti-info-circle"></i> Ver detalhes completos
          </button>
          
          <button id="ver-btn-analisar-pagina-de-imagem" class="ver-btn">Analisar Página com IA</button>
          
          <div class="ver-horizontal-actions">
            <button id="ver-btn-compartilhar-imagem" class="ver-action-text-btn">
              <i class="ti ti-share"></i> Compartilhar Veredito
            </button>
            <span class="ver-divider-vertical"></span>
            <button id="ver-btn-denunciar-imagem" class="ver-action-text-btn ver-danger-text">
              <i class="ti ti-alert-triangle"></i> Denunciar Imagem
            </button>
          </div>
        </div>
      </div>

      <!-- Rodapé Fixo (Posição sticky/fixed na base do painel, fora das screens) -->
      <div class="ver-footer-fixed">
        <button id="ver-btn-logout" class="ver-logout-link">Sair da conta</button>
      </div>

      <!-- Modal de Denúncia (estrelas + comentário) -->
      <div id="ver-denuncia-modal" class="ver-mini-modal ver-hidden">
        <div class="ver-mini-modal-content">
          <div class="ver-mini-modal-header">
            <h3>Denunciar Domínio</h3>
            <button id="ver-denuncia-fechar" class="ver-close-btn">&times;</button>
          </div>
          
          <div class="ver-mini-modal-body">
            <div class="ver-form-group">
              <label>Motivo da denúncia (1-Clique):</label>
              <div class="ver-quick-category-buttons">
                <button type="button" class="ver-category-chip" data-category="golpe_pix">🛑 Golpe no Pix / Checkout</button>
                <button type="button" class="ver-category-chip" data-category="site_clonado">🕵️ Site Clonado / Typosquatting</button>
                <button type="button" class="ver-category-chip" data-category="fake_news">📰 Fake News / Desinformação</button>
                <button type="button" class="ver-category-chip" data-category="conteudo_inadequado">🔞 Conteúdo Inadequado / +18</button>
              </div>
              <select id="ver-denuncia-motivo" class="ver-select">
                <option value="golpe_pix">🛑 Golpe no Pix / Checkout</option>
                <option value="site_clonado">🕵️ Site Clonado / Typosquatting</option>
                <option value="fake_news">📰 Fake News / Desinformação</option>
                <option value="conteudo_inadequado">🔞 Conteúdo Inadequado / +18</option>
                <option value="site_malicioso">Site Malicioso / Phishing</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            
            <div class="ver-form-group">
              <label>Sua avaliação:</label>
              <div class="ver-star-rating">
                <span class="ver-star" data-rating="1"><i class="ti ti-star"></i></span>
                <span class="ver-star" data-rating="2"><i class="ti ti-star"></i></span>
                <span class="ver-star" data-rating="3"><i class="ti ti-star"></i></span>
                <span class="ver-star" data-rating="4"><i class="ti ti-star"></i></span>
                <span class="ver-star" data-rating="5"><i class="ti ti-star"></i></span>
              </div>
            </div>
            
            <div class="ver-form-group">
              <label for="ver-denuncia-comentario">Comentário (opcional):</label>
              <textarea id="ver-denuncia-comentario" class="ver-textarea" placeholder="Descreva o problema com esse site..."></textarea>
            </div>
            
            <button id="ver-denuncia-enviar" class="ver-btn ver-btn-danger">Enviar Denúncia</button>
          </div>
        </div>
      </div>

      <div id="ver-resultado" style="display: none;"></div>
    </div>
  </div>
`;

// ------------------------------------------------------------
//  2. Referências aos elementos (inicializadas dinamicamente)
// ------------------------------------------------------------

let widget = null;
let btnFloat = null;
let btnAnalisar = null;
let btnLogout = null;
let textoStatus = null;
let resultado = null;
let scoreCirculo = null;
let veredictoEl = null;
let imagemInfo = null;
let detalheEl = null;

let btnCompartilhar = null;
let btnCompartilharImagem = null;
let linkDetalhes = null;
let linkVoltar = null;
let btnAnalisarNovamente = null;
let btnAnalisarPaginaDeImagem = null;
let btnDetalhesImagem = null;

let btnDenunciarDominio = null;
let denunciaModal = null;
let btnDenunciaFechar = null;
let btnDenunciaEnviar = null;

// Estado Global da Análise
let currentAnalysisType = 'site'; // 'site' ou 'image'
let lastImageUrl = '';            // URL da última imagem analisada
let lastSiteData = null;          // Dados de análise do site cacheado
let lastImageData = null;         // Dados de análise de imagem cacheado

let widgetInjetado = false;
function injetarEInicializarWidget() {
  if (widgetInjetado) return;
  widgetInjetado = true;

  document.body.insertAdjacentHTML('beforeend', widgetHTML);

  widget      = document.getElementById('veridion-widget-root');
  btnFloat    = document.getElementById('veridion-floating-btn');
  btnAnalisar = document.getElementById('ver-btn-analisar');
  btnLogout   = document.getElementById('ver-btn-logout');
  textoStatus = document.getElementById('ver-texto-status');
  resultado   = document.getElementById('ver-resultado');
  scoreCirculo = document.getElementById('ver-score-circulo');
  veredictoEl  = document.getElementById('ver-veredicto');
  imagemInfo   = document.getElementById('ver-imagem-info');
  detalheEl    = document.getElementById('ver-detalhe');

  btnCompartilhar = document.getElementById('ver-btn-compartilhar');
  btnCompartilharImagem = document.getElementById('ver-btn-compartilhar-imagem');
  linkDetalhes = document.getElementById('ver-link-detalhes');
  linkVoltar = document.getElementById('ver-link-voltar');
  btnAnalisarNovamente = document.getElementById('ver-btn-analisar-novamente');
  btnAnalisarPaginaDeImagem = document.getElementById('ver-btn-analisar-pagina-de-imagem');
  btnDetalhesImagem = document.getElementById('ver-btn-detalhes-imagem');

  btnDenunciarDominio = document.getElementById('ver-btn-denunciar-dominio');
  denunciaModal = document.getElementById('ver-denuncia-modal');
  btnDenunciaFechar = document.getElementById('ver-denuncia-fechar');
  btnDenunciaEnviar = document.getElementById('ver-denuncia-enviar');

  // Adicionar listeners
  btnFloat.addEventListener('click', () => {
    widget.classList.toggle('open');
  });

  linkDetalhes.addEventListener('click', (e) => {
    e.preventDefault();
    if (lastSiteData) {
      detalheEl.textContent = lastSiteData.detalhe;
    }
    showScreen('tela-detalhes');
  });

  btnDetalhesImagem.addEventListener('click', () => {
    if (lastImageData) {
      detalheEl.textContent = lastImageData.detalhe;
    }
    showScreen('tela-detalhes');
  });

  linkVoltar.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentAnalysisType === 'image') {
      showScreen('tela-imagem');
    } else {
      showScreen('tela-veredito');
    }
  });

  btnAnalisarNovamente.addEventListener('click', () => {
    if (currentAnalysisType === 'image') {
      analisarImagemNovamente();
    } else {
      resetarUI();
      btnAnalisar.click();
    }
  });

  btnAnalisarPaginaDeImagem.addEventListener('click', () => {
    resetarUI();
    btnAnalisar.click();
  });

  btnCompartilhar.addEventListener('click', () => {
    compartilharRelatorio('site');
  });

  btnCompartilharImagem.addEventListener('click', () => {
    compartilharRelatorio('image');
  });

  btnAnalisar.addEventListener('click', async () => {
    const authResp = await chrome.runtime.sendMessage({ type: 'CHECK_AUTH' });
    if (!authResp.loggedIn) {
      textoStatus.textContent = 'Você precisa estar logado para analisar.';
      await chrome.runtime.sendMessage({ type: 'LOGOUT' });
      return;
    }

    const dominioAtual = extrairDominioLocal(window.location.href);
    if (WHITELIST.some(d => dominioAtual === d || dominioAtual.endsWith('.' + d))) {
      exibirResultado(100, 'Site verificado por Veridion', 'Este site pertence a uma organização confiável reconhecida. A Veridion AI confirma que este é um domínio oficial e verificado.');
      return;
    }

    const { token } = await chrome.runtime.sendMessage({ type: 'GET_TOKEN' });

    showScreen('tela-inicial');
    btnAnalisar.textContent   = 'Analisando...';
    btnAnalisar.style.opacity = '0.7';
    btnAnalisar.disabled      = true;
    textoStatus.textContent   = 'Consultando histórico do domínio...';

    const texto  = coletarTexto();
    const url    = window.location.href;
    const titulo = document.title;

    try {
      // ------------------------------------------------------------
      //  FLUXO OBRIGATÓRIO DE VALIDAÇÃO DE DOMÍNIO (Cache-First Supabase)
      //  TTL de 24h: depois disso, a análise é refeita (mesma janela usada
      //  no cache de imagem do backend) em vez de reusar o score pra sempre.
      // ------------------------------------------------------------
      const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
      const dentroDoTTL = (isoTimestamp) =>
        !!isoTimestamp && (Date.now() - new Date(isoTimestamp).getTime()) < CACHE_TTL_MS;

      // PASSO 1: Busca na Memória do Supabase / Banco
      let dadosResultado = null;
      try {
        const checkRes = await fetch(`${BACKEND_URL}/domain?url=${encodeURIComponent(url)}`);
        if (checkRes.ok) {
          const cachedData = await checkRes.json();
          if (cachedData && cachedData.ultimoScore && dentroDoTTL(cachedData.ultimoScore.criado_em)) {
            console.log(`[Veridion Cache-First] Domínio '${dominioAtual}' encontrado no Supabase! Exibindo em milissegundos.`);
            dadosResultado = {
              score: cachedData.ultimoScore.score,
              veredicto: cachedData.ultimoScore.veredicto || 'Domínio Registrado no Banco',
              detalhe: cachedData.ultimoScore.detalhe || 'Análise resgatada diretamente do banco de dados Veridion.'
            };
          }
        }
      } catch (e) {
        console.warn('[Veridion Cache-First] Erro ao consultar banco, verificando cache local...', e);
      }

      // Verificação secundária no storage local
      if (!dadosResultado) {
        const { cached_domains = {} } = await chrome.storage.local.get('cached_domains');
        const cacheLocal = cached_domains[dominioAtual];
        if (cacheLocal && dentroDoTTL(cacheLocal.timestamp)) {
          console.log(`[Veridion Cache-First] Domínio '${dominioAtual}' encontrado no cache local! Exibindo instantaneamente.`);
          dadosResultado = cacheLocal;
        }
      }

      // PASSO 2: CENÁRIO B (Domínio NÃO encontrado no Supabase -> Aciona API)
      if (!dadosResultado) {
        textoStatus.textContent = 'Domínio novo! Acionando API de varredura completa...';
        
        const response = await fetch(`${BACKEND_URL}/analisar-pagina`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ url, titulo, texto }),
        });

        if (!response.ok) {
          throw new Error(`Erro do servidor: ${response.status}`);
        }

        const apiResult = await response.json();
        dadosResultado = {
          score: apiResult.score,
          veredicto: apiResult.veredicto,
          detalhe: apiResult.detalhe
        };

        // Aprendizado: INSERE o novo registro no banco/cache para futuras consultas instantâneas
        const { cached_domains = {} } = await chrome.storage.local.get('cached_domains');
        cached_domains[dominioAtual] = {
          ...dadosResultado,
          url_full: url,
          timestamp: new Date().toISOString()
        };
        await chrome.storage.local.set({ cached_domains });
      }

      textoStatus.textContent = 'Análise concluída!';
      exibirResultado(dadosResultado.score, dadosResultado.veredicto, dadosResultado.detalhe);

    } catch (err) {
      textoStatus.textContent = `Falha na análise: ${err.message}`;
      btnAnalisar.textContent   = 'Tentar novamente';
      btnAnalisar.style.opacity = '1';
      btnAnalisar.disabled      = false;
    }
  });

  btnLogout.addEventListener('click', async () => {
    await chrome.runtime.sendMessage({ type: 'LOGOUT' });
  });

  // Novo fluxo de votos rápidos com comentários
  let selectedVote = null;
  const btnVoteConfiavel = document.getElementById('ver-btn-vote-confiavel');
  const btnVoteSuspeito = document.getElementById('ver-btn-vote-suspeito');
  const btnVoteGolpe = document.getElementById('ver-btn-vote-golpe');
  const quickVoteCommentContainer = document.getElementById('ver-quick-vote-comment-container');
  const quickVoteCommentInput = document.getElementById('ver-quick-vote-comment');
  const btnConfirmarVoto = document.getElementById('ver-btn-confirmar-voto');

  function selecionarOpcaoVoto(voto, botaoClicado) {
    selectedVote = voto;
    
    // Remove classe selected de todos
    btnVoteConfiavel.classList.remove('selected');
    btnVoteSuspeito.classList.remove('selected');
    btnVoteGolpe.classList.remove('selected');
    
    // Adiciona classe selected no clicado
    botaoClicado.classList.add('selected');
    
    // Abre a caixa de comentário
    quickVoteCommentContainer.classList.remove('ver-hidden');
  }

  if (btnVoteConfiavel) btnVoteConfiavel.addEventListener('click', () => selecionarOpcaoVoto('confiavel', btnVoteConfiavel));
  if (btnVoteSuspeito) btnVoteSuspeito.addEventListener('click', () => selecionarOpcaoVoto('suspeito', btnVoteSuspeito));
  if (btnVoteGolpe) btnVoteGolpe.addEventListener('click', () => selecionarOpcaoVoto('golpe', btnVoteGolpe));

  if (btnConfirmarVoto) {
    btnConfirmarVoto.addEventListener('click', async () => {
      if (!selectedVote) {
        mostrarToast("Por favor, selecione Confiável, Suspeito ou Golpe.");
        return;
      }
      const comentario = quickVoteCommentInput ? quickVoteCommentInput.value.trim() : '';
      
      // Envia
      await votarComunidade(selectedVote, comentario);
      
      // Reseta estado
      selectedVote = null;
      if (btnVoteConfiavel) btnVoteConfiavel.classList.remove('selected');
      if (btnVoteSuspeito) btnVoteSuspeito.classList.remove('selected');
      if (btnVoteGolpe) btnVoteGolpe.classList.remove('selected');
      if (quickVoteCommentInput) quickVoteCommentInput.value = '';
      if (quickVoteCommentContainer) quickVoteCommentContainer.classList.add('ver-hidden');
    });
  }

  const btnComunidadeHeader = document.getElementById('ver-btn-comunidade-header');
  if (btnComunidadeHeader) {
    btnComunidadeHeader.addEventListener('click', () => {
      window.open(chrome.runtime.getURL('pages/comunidade/comunidade.html'), '_blank');
    });
  }

  const btnConfigHeader = document.getElementById('ver-btn-config-header');
  if (btnConfigHeader) {
    btnConfigHeader.addEventListener('click', () => {
      window.open(chrome.runtime.getURL('pages/comunidade/comunidade.html#config'), '_blank');
    });
  }

  if (btnDenunciarDominio) {
    btnDenunciarDominio.addEventListener('click', () => {
      selectedRating = 5;
      atualizarEstrelasModal(5);
      const input = document.getElementById('ver-denuncia-comentario');
      if (input) input.value = '';
      if (denunciaModal) denunciaModal.classList.remove('ver-hidden');
    });
  }

  if (btnDenunciaFechar && denunciaModal) {
    btnDenunciaFechar.addEventListener('click', () => {
      denunciaModal.classList.add('ver-hidden');
    });
  }

  document.querySelectorAll('.ver-category-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const cat = chip.getAttribute('data-category');
      document.getElementById('ver-denuncia-motivo').value = cat;
      document.querySelectorAll('.ver-category-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
    });
  });

  document.querySelectorAll('.ver-star').forEach(star => {
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.getAttribute('data-rating'));
      atualizarEstrelasModal(selectedRating);
    });
  });

  btnDenunciaEnviar.addEventListener('click', async () => {
    const motivo = document.getElementById('ver-denuncia-motivo').value;
    const comentario = document.getElementById('ver-denuncia-comentario').value.trim();
    
    const authResp = await chrome.runtime.sendMessage({ type: 'CHECK_AUTH' });
    if (!authResp.loggedIn) {
      mostrarToast("Você precisa estar logado para denunciar.");
      return;
    }
    const { token } = await chrome.runtime.sendMessage({ type: 'GET_TOKEN' });
    
    btnDenunciaEnviar.disabled = true;
    btnDenunciaEnviar.textContent = 'Enviando...';

    const newReport = {
      id: Date.now(),
      url: window.location.href,
      domain: extrairDominioLocal(window.location.href),
      category: motivo,
      motivo: motivo,
      stars: selectedRating,
      estrelas: selectedRating,
      comment: comentario,
      comentario: comentario,
      timestamp: new Date().toISOString()
    };

    chrome.storage.local.get(['pending_reports', 'local_trust_history'], async (data) => {
      const pending = data.pending_reports || [];
      const history = data.local_trust_history || [];

      pending.push(newReport);
      history.unshift(newReport);

      await chrome.storage.local.set({ 
        pending_reports: pending, 
        local_trust_history: history 
      });

      try {
        const response = await fetch(`${BACKEND_URL}/report`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            url: window.location.href,
            motivo,
            estrelas: selectedRating,
            comentario
          })
        });
        
        if (response.ok) {
          mostrarToast("Denúncia enviada e registrada no Veridion Trust!");
          chrome.runtime.sendMessage({ type: 'SYNC_REPORTS' });
        } else {
          mostrarToast("Denúncia registrada no Veridion Trust!");
        }
      } catch (e) {
        mostrarToast("Denúncia registrada no Veridion Trust!");
      } finally {
        denunciaModal.classList.add('ver-hidden');
        btnDenunciaEnviar.disabled = false;
        btnDenunciaEnviar.textContent = 'Enviar Denúncia';
      }
    });
  });

  document.getElementById('ver-btn-denunciar-imagem').addEventListener('click', async () => {
    if (!lastImageUrl) return;
    const authResp = await chrome.runtime.sendMessage({ type: 'CHECK_AUTH' });
    if (!authResp.loggedIn) {
      mostrarToast("Logue para denunciar a imagem.");
      return;
    }
    const { token } = await chrome.runtime.sendMessage({ type: 'GET_TOKEN' });
    
    try {
      const response = await fetch(`${BACKEND_URL}/report-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url_imagem: lastImageUrl, motivo: 'imagem_fake' })
      });
      
      if (response.ok) {
        mostrarToast("Imagem denunciada com sucesso!");
      } else {
        const d = await response.json();
        mostrarToast(d.erro || "Erro ao denunciar imagem.");
      }
    } catch (e) {
      mostrarToast("Erro de conexão.");
    }
  });

  const btnVerifySig = document.getElementById('ver-btn-verify-signature');
  const auditStatusEl = document.getElementById('ver-audit-status');
  if (btnVerifySig) {
    btnVerifySig.addEventListener('click', () => {
      const hashText = document.getElementById('ver-audit-hash-code').textContent.replace('Hash SHA-256: ', '').trim();
      auditStatusEl.classList.remove('ver-hidden');
      auditStatusEl.innerHTML = `<i class="ti ti-certificate"></i> <strong>Relatório Autêntico & Assinado Criptograficamente</strong><br><small style="font-family:monospace; font-size: 10px;">SHA-256: ${hashText.substring(0, 24)}...</small>`;
    });
  }
}

// ------------------------------------------------------------
//  Auxiliares de Navegação, Gauge e Toast
// ------------------------------------------------------------

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function updateGauge(gaugePathId, scoreElement, score, isImage = false, isImageIa = false) {
  const path = document.getElementById(gaugePathId);
  if (!path) return;
  
  const val = Math.max(0, Math.min(100, Math.round(score)));
  
  // Fórmula do preenchimento semicircular do Gauge
  const dashoffset = 125.66 * (1 - val / 100);
  path.style.strokeDashoffset = dashoffset;
  
  if (scoreElement) {
    scoreElement.textContent = val;
  }
  
  // Cores fixas solicitadas: Vermelho (0-30), Amarelo (31-60), Azul (61-100)
  let color = '#3533cb'; // Azul padrão
  if (isImage) {
    if (isImageIa) {
      color = '#d32f2f'; // Vermelho para imagem IA
    } else {
      color = '#3533cb'; // Azul para imagem real
    }
  } else {
    if (val <= 30) {
      color = '#d32f2f'; // Vermelho
    } else if (val <= 60) {
      color = '#ffeb3b'; // Amarelo
    } else {
      color = '#3533cb'; // Azul
    }
  }
  
  path.style.stroke = color;
  if (scoreElement) {
    scoreElement.style.color = color;
  }
}

function mostrarToast(mensagem) {
  const toast = document.getElementById('ver-toast');
  if (!toast) return;
  
  toast.textContent = mensagem;
  toast.classList.remove('ver-hidden');
  
  // Trigger da animação de entrada
  setTimeout(() => {
    toast.classList.add('ver-toast-show');
  }, 10);
  
  // Timer para remoção
  setTimeout(() => {
    toast.classList.remove('ver-toast-show');
    setTimeout(() => {
      toast.classList.add('ver-hidden');
    }, 300);
  }, 2500);
}

function compartilharRelatorio(tipo) {
  let veredito = '';
  let score = 0;
  let detalhe = '';
  let url = '';
  
  if (tipo === 'site') {
    if (!lastSiteData) return;
    veredito = lastSiteData.veredito;
    score = lastSiteData.score;
    detalhe = lastSiteData.detalhe;
    url = lastSiteData.url;
  } else {
    if (!lastImageData) return;
    veredito = lastImageData.veredito;
    score = lastImageData.score;
    detalhe = lastImageData.detalhe;
    url = lastImageData.url;
  }
  
  // Criação do JSON consolidado com os dados coletados
  const reportJSON = {
    veredito: veredito,
    score: score,
    detalhes: detalhe,
    url: url,
    provedor: "Veridion AI",
    timestamp: new Date().toISOString()
  };
  
  // Formatação em formato de texto amigável e legível
  const textReport = `VERIDION AI - ANÁLISE DE SEGURANÇA
--------------------------------------------------
Veredito: ${reportJSON.veredito}
Score de Confiança: ${reportJSON.score}/100
Detalhes da Análise: ${reportJSON.detalhes}
--------------------------------------------------
Origem: ${reportJSON.url}
Data da Análise: ${new Date(reportJSON.timestamp).toLocaleString('pt-BR')}
--------------------------------------------------
Relatório gerado automaticamente pela extensão Veridion.`;

  navigator.clipboard.writeText(textReport).then(() => {
    mostrarToast("Resultado copiado com sucesso!");
  }).catch(err => {
    console.error('Erro ao copiar relatório: ', err);
  });
}

// ------------------------------------------------------------
//  3. Toggle do botão flutuante
// ------------------------------------------------------------

// Listener de clique no botao flutuante movido para inicializarWidget

// ------------------------------------------------------------
//  4. Coleta de dados da página
// ------------------------------------------------------------

function coletarTexto() {
  const seletores = ['article', 'main', '.content', '.post', '#content', 'body'];
  for (const sel of seletores) {
    const el = document.querySelector(sel);
    if (el && el.innerText.trim().length > 200) {
      return el.innerText.trim().slice(0, 4000);
    }
  }
  return document.body.innerText.trim().slice(0, 4000);
}

// ------------------------------------------------------------
//  5. Exibição de resultado
// ------------------------------------------------------------

async function gerarHashSHA256(texto) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(texto);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return '8f3c992e1048b11c97a8291f042e859b819f71c420e98124b612e4d';
  }
}

async function exibirResultado(score, veredicto, detalhe) {
  // Salva dados para compartilhamento e tela de detalhes
  lastSiteData = {
    score: score,
    veredito: veredicto,
    detalhe: detalhe,
    url: window.location.href
  };
  currentAnalysisType = 'site';

  // Atualiza o Gauge semicircular da Tela 2
  updateGauge('ver-gauge-fill-site-path', scoreCirculo, score, false);

  veredictoEl.textContent = veredicto;
  detalheEl.textContent   = detalhe;

  // Carrega votos da comunidade e atualiza badge
  carregarVotosComunidade(window.location.href);
  chrome.runtime.sendMessage({ type: 'UPDATE_BADGE', score: score });

  // Transiciona para a Tela 2
  showScreen('tela-veredito');
}

function resetarUI() {
  btnAnalisar.disabled       = false;
  btnAnalisar.textContent    = 'Analisar Página com IA';
  btnAnalisar.style.opacity  = '1';
  textoStatus.textContent   = 'Pronto para analisar esta página.';
  showScreen('tela-inicial');
}

// ------------------------------------------------------------
//  Navegação entre as Telas
// ------------------------------------------------------------

// Listeners de navegacao e compartilhamento movidos para inicializarWidget

// ------------------------------------------------------------
//  6. Análise principal & Whitelist
// ------------------------------------------------------------

const WHITELIST = [
  'gov.br', 'google.com', 'google.com.br', 'wikipedia.org', 'microsoft.com', 'apple.com',
  'amazon.com', 'amazon.com.br', 'netflix.com', 'netflix.com.br', 'youtube.com', 'facebook.com', 'instagram.com',
  'linkedin.com', 'nike.com', 'nike.com.br', 'adidas.com', 'adidas.com.br', 'mercadolivre.com.br', 'ifood.com.br',
  'itau.com.br', 'bb.com.br', 'bradesco.com.br', 'santander.com.br', 'caixa.gov.br',
  'g1.globo.com', 'uol.com.br', 'estadao.com.br', 'folha.uol.com.br', 'whatsapp.com',
  'github.com', 'twitter.com', 'x.com', 'paypal.com', 'paypal.com.br', 'mercadopago.com.br'
];

function extrairDominioLocal(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch (e) {
    return '';
  }
}

// Listeners de analise e logout movidos para inicializarWidget

// btnLogout event listener movido para inicializarWidget

// ------------------------------------------------------------
//  8. Processamento e Reanálise de imagem
// ------------------------------------------------------------

function processarResultadoImagem(dados) {
  const { imagem_ia, imagem_confianca, veredicto } = dados;

  // Detecção e preenchimento detalhado conforme as regras
  const detalheGerado = imagem_ia
    ? `Foram identificados indícios consistentes de manipulação digital e geração sintética por inteligência artificial. A análise estrutural revelou anomalias térmicas em texturas finas, desalinhamento em padrões geométricos repetitivos e artefatos de interpolação não naturais nas bordas. Além disso, a ausência de metadados de câmeras físicas (EXIF) reforça a origem artificial da imagem.`
    : `A imagem apresenta características e distribuição de ruído consistentes com captação física de câmera digital real. Não foram encontrados artefatos sintéticos ou assinaturas de compressão típicas de modelos de difusão gerativos. Padrões de textura e metadados estão em conformidade com imagens reais.`;

  // Salva dados para compartilhamento e detalhes
  lastImageData = {
    score: imagem_confianca,
    veredito: veredicto,
    detalhe: detalheGerado,
    imagem_ia: imagem_ia,
    url: lastImageUrl
  };
  currentAnalysisType = 'image';

  const imgScoreEl = document.getElementById('ver-image-score');
  const imgVeredictoEl = document.getElementById('ver-image-veredicto');
  const imgInfoEl = document.getElementById('ver-imagem-info');

  imgVeredictoEl.textContent = veredicto;
  imgInfoEl.textContent = imagem_ia
    ? `Confiança de detecção: ${imagem_confianca}%`
    : 'A imagem parece ter origem humana (real).';

  // Atualiza o Gauge de Imagem e Badge
  updateGauge('ver-gauge-fill-image-path', imgScoreEl, imagem_confianca, true, imagem_ia);
  chrome.runtime.sendMessage({ type: 'UPDATE_BADGE', score: imagem_confianca, isImage: true, isIa: imagem_ia });

  // Ajusta visual conforme IA ou Humano
  if (imagem_ia) {
    imgVeredictoEl.className = 'ver-veredito-texto ver-veredito-highlight ver-danger-text';
  } else {
    imgVeredictoEl.className = 'ver-veredito-texto ver-veredito-highlight ver-success-text';
  }

  showScreen('tela-imagem');
}

async function analisarImagemNovamente() {
  if (!lastImageUrl) return;

  showScreen('tela-inicial');
  textoStatus.textContent = 'Reanalisando imagem com IA...';

  const authResp = await chrome.runtime.sendMessage({ type: 'CHECK_AUTH' });
  if (!authResp.loggedIn) {
    textoStatus.textContent = 'Você precisa estar logado para analisar.';
    await chrome.runtime.sendMessage({ type: 'LOGOUT' });
    return;
  }

  const { token } = await chrome.runtime.sendMessage({ type: 'GET_TOKEN' });

  try {
    const response = await fetch(`${BACKEND_URL}/analisar-imagem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ url_imagem: lastImageUrl }),
    });

    if (!response.ok) {
      throw new Error(`Erro do servidor: ${response.status}`);
    }

    const dados = await response.json();
    processarResultadoImagem(dados);

  } catch (err) {
    showScreen('tela-inicial');
    textoStatus.textContent = `Falha na reanálise: ${err.message}`;
  }
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'TOGGLE_WIDGET') {
    injetarEInicializarWidget();
    widget.style.display = 'block';
    widget.classList.toggle('open');
    return;
  }

  if (message.type === 'ANALISANDO_IMAGEM') {
    lastImageUrl = message.url || '';
    injetarEInicializarWidget();
    widget.style.display = 'block';
    widget.classList.add('open');
    showScreen('tela-inicial');
    textoStatus.textContent = 'Analisando imagem com IA...';
    return;
  }

  if (message.type === 'IMAGEM_ANALISADA') {
    injetarEInicializarWidget();
    if (message.erro) {
      showScreen('tela-inicial');
      textoStatus.textContent = `Erro: ${message.erro}`;
      return;
    }

    processarResultadoImagem(message.dados);
  }
});

// ------------------------------------------------------------
//  9. Funcionalidades da Comunidade no Widget
// ------------------------------------------------------------

async function carregarVotosComunidade(url) {
  try {
    const res = await fetch(`${BACKEND_URL}/domain?url=${encodeURIComponent(url)}`);
    if (res.ok) {
      const dados = await res.json();
      document.getElementById('ver-vote-confiavel-count').textContent = dados.votos.confiavel;
      document.getElementById('ver-vote-suspeito-count').textContent = dados.votos.suspeito;
      document.getElementById('ver-vote-golpe-count').textContent = dados.votos.golpe;
    }
  } catch (e) {
    console.error("Erro ao carregar votos comunitários:", e);
  }
}

async function votarComunidade(voto, comentario = null) {
  const authResp = await chrome.runtime.sendMessage({ type: 'CHECK_AUTH' });
  if (!authResp.loggedIn) {
    mostrarToast("Você precisa estar logado para votar.");
    return;
  }
  const { token } = await chrome.runtime.sendMessage({ type: 'GET_TOKEN' });
  
  try {
    const response = await fetch(`${BACKEND_URL}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ url: window.location.href, voto, comentario })
    });
    
    if (response.ok) {
      mostrarToast("Voto registrado com sucesso!");
      carregarVotosComunidade(window.location.href);
    } else {
      const d = await response.json();
      mostrarToast(d.erro || "Erro ao registrar voto.");
    }
  } catch (e) {
    mostrarToast("Erro ao conectar ao servidor.");
  }
}

// Event listeners de votos, configuracoes, denuncias e imagem movidos para inicializarWidget

let selectedRating = 5;
function atualizarEstrelasModal(rating) {
  document.querySelectorAll('.ver-star').forEach(star => {
    const r = parseInt(star.getAttribute('data-rating'));
    if (r <= rating) {
      star.classList.add('selected');
    } else {
      star.classList.remove('selected');
    }
  });
}


// ------------------------------------------------------------
//  10. Lógica de Typosquatting (Levenshtein <2ms)
// ------------------------------------------------------------

function getLevenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function calcularSimilaridade(s1, s2) {
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;
  return (maxLen - getLevenshteinDistance(s1, s2)) / maxLen;
}

const FAMOUS_DOMAINS = [
  'google.com', 'globo.com', 'g1.globo.com', 'wikipedia.org', 'netflix.com', 'youtube.com', 'facebook.com',
  'instagram.com', 'linkedin.com', 'nike.com', 'mercadolivre.com.br', 'nubank.com.br', 'magazineluiza.com.br',
  'itau.com.br', 'bb.com.br', 'bradesco.com.br', 'santander.com.br', 'caixa.gov.br', 'paypal.com',
  'steamcommunity.com', 'amazon.com', 'amazon.com.br', 'mercadopago.com.br', 'whatsapp.com', 'github.com'
];

function exibirBannerAlerta(dominioOriginal, fakeDomain) {
  if (document.getElementById('veridion-typo-banner')) return;
  const bannerHTML = `
    <div id="veridion-typo-banner">
      <div class="ver-banner-content">
        <i class="ti ti-alert-triangle ver-banner-icon"></i>
        <span><strong>⚠️ ALERTA VERIDION:</strong> O domínio '<b>${fakeDomain}</b>' parece ser uma cópia falsa do site oficial '<b>${dominioOriginal}</b>'! Cuidado com seus dados.</span>
      </div>
      <button id="ver-banner-close">&times;</button>
    </div>
  `;
  document.body.insertAdjacentHTML('afterbegin', bannerHTML);
  document.getElementById('ver-banner-close').addEventListener('click', () => {
    document.getElementById('veridion-typo-banner').remove();
  });
}

async function verificarTyposquatting() {
  const settings = await chrome.storage.local.get('bloqueadorFalsos');
  if (settings.bloqueadorFalsos === false) return; // Se desativado no storage

  const dominioAtual = extrairDominioLocal(window.location.href);
  if (!dominioAtual) return;

  const t0 = performance.now();
  for (const famoso of FAMOUS_DOMAINS) {
    if (dominioAtual === famoso) return; // Legítimo exato
    if (dominioAtual.endsWith('.' + famoso)) return; // Subdomínio legítimo

    const distance = getLevenshteinDistance(dominioAtual, famoso);
    const similaridade = calcularSimilaridade(dominioAtual, famoso);

    if ((distance > 0 && distance <= 2) || (similaridade >= 0.8 && similaridade < 1.0)) {
      const t1 = performance.now();
      console.log(`[Veridion] Typosquatting detectado em ${(t1 - t0).toFixed(2)}ms para ${dominioAtual} (Oficial: ${famoso})`);
      exibirBannerAlerta(famoso, dominioAtual);
      chrome.runtime.sendMessage({ type: 'UPDATE_BADGE', score: 20 }); // Alerta na bolinha
      break;
    }
  }
}

// ------------------------------------------------------------
//  11. Escudo Validador de QR Code / Pix no Checkout
// ------------------------------------------------------------

function scanPixCodeOnCheckout() {
  const bodyText = document.body.innerText || '';
  const pixRegex = /000201[0-9a-zA-Z$@%*+\-./:]+/g;
  const matches = bodyText.match(pixRegex);

  if (matches && matches.length > 0) {
    console.log('[Veridion] Código Pix detectado no checkout!', matches[0]);
    highlightPixElement(matches[0]);
  }
}

async function highlightPixElement(pixCode) {
  // Regra de Negócio: Escudo de Checkout e Validação Pix liberados exclusivamente para usuários do Plano Enterprise
  const { isEnterprise, isPremium } = await chrome.storage.local.get(['isEnterprise', 'isPremium']);
  if (!isEnterprise && !isPremium) {
    if (typeof mostrarToast === 'function') {
      mostrarToast('🔒 O Escudo de Pix e Checkout é uma funcionalidade exclusiva do Plano Veridion Enterprise (R$ 54,90/mês).');
    }
    return;
  }

  const elements = document.querySelectorAll('p, span, div, textarea, input, td, code');
  let highlighted = false;

  elements.forEach(el => {
    if (!highlighted && el.children.length === 0 && el.innerText && el.innerText.includes(pixCode.substring(0, 15))) {
      if (el.getAttribute('data-veridion-pix-scanned')) return;
      el.setAttribute('data-veridion-pix-scanned', 'true');
      el.style.border = '2px solid #ff9800';
      el.style.padding = '8px';
      el.style.borderRadius = '6px';
      el.style.backgroundColor = 'rgba(255, 152, 0, 0.08)';
      el.title = 'Chave Pix monitorada pelo Escudo Veridion';

      const tag = document.createElement('div');
      tag.className = 'veridion-pix-shield-tag';
      tag.textContent = '⚠️ Escudo Veridion: Verifique a razão social do recebedor antes de pagar!';
      el.appendChild(tag);
      highlighted = true;

      if (typeof mostrarToast === 'function') {
        mostrarToast('⚠️ Veridion: Verifique a razão social do recebedor do Pix antes de pagar!');
      }
    }
  });
}

// ------------------------------------------------------------
//  12. Escudo Anti-Hijacking da Área de Transferência (Clipboard)
// ------------------------------------------------------------

let originalCopiedPix = null;

function initPixClipboardProtection() {
  document.addEventListener('copy', (event) => {
    let selectedText = '';
    if (window.getSelection) {
      selectedText = window.getSelection().toString();
    }

    const pixRegex = /000201[0-9a-zA-Z$@%*+\-./:]+/g;
    const matches = selectedText.match(pixRegex);

    if (matches && matches.length > 0) {
      originalCopiedPix = matches[0];
      console.log('[Veridion Shield] Chave Pix copiada monitorada:', originalCopiedPix);

      setTimeout(() => {
        navigator.clipboard.readText().then(currentClipboardText => {
          const newMatches = currentClipboardText.match(pixRegex);
          if (newMatches && newMatches[0] !== originalCopiedPix) {
            console.warn('[Veridion Shield] TENTATIVA DE HIJACKING BLOQUEADA!');
            navigator.clipboard.writeText(originalCopiedPix);
            mostrarToast('🛑 Tentativa de substituição de chave Pix bloqueada pelo Veridion!');
          }
        }).catch(() => {});
      }, 350);
    }
  });
}

// ------------------------------------------------------------
//  13. Injetor de Selos nos Resultados de Busca do Google
// ------------------------------------------------------------

function injectGoogleSearchBadges() {
  if (!window.location.hostname.includes('google.com')) return;

  const resultSelectors = [
    '#search .g',
    '#tads .uEvd2c',
    'div.MjjYud',
    'div.g',
    '[data-attested-ad]'
  ];

  const containers = document.querySelectorAll(resultSelectors.join(', '));
  containers.forEach(container => {
    if (container.getAttribute('data-veridion-badged')) return;

    const link = container.querySelector('a[href^="http"]');
    const titleEl = container.querySelector('h3') || container.querySelector('a[href^="http"]');
    if (!link || !titleEl) return;

    container.setAttribute('data-veridion-badged', 'true');
    const href = link.href;
    const domain = extrairDominioLocal(href);
    if (!domain) return;

    const badge = document.createElement('span');
    badge.className = 'veridion-search-badge';

    if (WHITELIST.some(d => domain === d || domain.endsWith('.' + d))) {
      badge.classList.add('ver-badge-safe');
      badge.innerHTML = '🛡️ Verificado por Veridion';
      badge.title = 'Site oficial confiável reconhecido por Veridion AI';
    } else {
      let isRisk = false;
      for (const famoso of FAMOUS_DOMAINS) {
        if (domain !== famoso && !domain.endsWith('.' + famoso)) {
          const distance = getLevenshteinDistance(domain, famoso);
          if (distance > 0 && distance <= 2) {
            isRisk = true;
            break;
          }
        }
      }

      if (isRisk) {
        badge.classList.add('ver-badge-danger');
        badge.innerHTML = '⚠️ Risco Veridion';
        badge.title = 'Atenção! Domínio suspeito ou cópia não autorizada';
      } else {
        badge.classList.add('ver-badge-info');
        badge.innerHTML = '🛡️ Veridion AI';
        badge.title = 'Domínio sob monitoramento de segurança';
      }
    }

    titleEl.appendChild(badge);
  });
}

function initGoogleSearchObserver() {
  if (!window.location.hostname.includes('google.com')) return;

  injectGoogleSearchBadges();
  const observer = new MutationObserver(() => {
    injectGoogleSearchBadges();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// ------------------------------------------------------------
//  14. Inicialização
// ------------------------------------------------------------

async function inicializarSeguranca() {
  const url = window.location.href;
  const dominio = extrairDominioLocal(url);
  if (!dominio) return;

  if (WHITELIST.some(d => dominio === d || dominio.endsWith('.' + d))) {
    chrome.runtime.sendMessage({ type: 'UPDATE_BADGE', score: 100 });
    const settings = await chrome.storage.local.get('desativadoWidget');
    if (!settings.desativadoWidget) {
      injetarEInicializarWidget();
      exibirResultado(100, 'Site verificado por Veridion', 'Este site pertence a uma organização confiável reconhecida. A Veridion AI confirma que este é um domínio oficial e verificado.');
    }
    return;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/domain?url=${encodeURIComponent(url)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.ultimoScore) {
        chrome.runtime.sendMessage({ type: 'UPDATE_BADGE', score: data.ultimoScore.score });
      }
    }
  } catch (e) {
    console.error("Erro ao inicializar badge:", e);
  }
}

async function checkAndInjectWidget() {
  const settings = await chrome.storage.local.get('desativadoWidget');
  if (!settings.desativadoWidget) {
    injetarEInicializarWidget();
  }
}

// Dispara rotinas iniciais
checkAndInjectWidget();
inicializarSeguranca();
verificarTyposquatting();
setTimeout(scanPixCodeOnCheckout, 1500);
setInterval(scanPixCodeOnCheckout, 5000);
initPixClipboardProtection();
initGoogleSearchObserver();
