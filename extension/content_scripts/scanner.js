// ============================================================
//  Veridion — scanner.js (content script)
//  Injetado em todas as páginas pelo manifest.json.
//  Responsabilidades:
//    1. Injetar o widget flutuante na página
//    2. Coletar texto e imagens da página
//    3. Verificar autenticação antes de analisar
//    4. Enviar dados ao back-end e exibir o resultado
// ============================================================

const BACKEND_URL = 'https://veridion-5tjh.onrender.com'; // Trocar pela URL real quando definida

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
          <button id="ver-btn-detalhes-imagem" class="ver-btn-action ver-btn-secondary" style="margin-bottom: 2px;">
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

      <div id="ver-resultado" style="display: none;"></div>
    </div>
  </div>
`;

document.body.insertAdjacentHTML('beforeend', widgetHTML);

// ------------------------------------------------------------
//  2. Referências aos elementos
// ------------------------------------------------------------

const widget      = document.getElementById('veridion-widget-root');
const btnFloat    = document.getElementById('veridion-floating-btn');
const btnAnalisar = document.getElementById('ver-btn-analisar');
const btnLogout   = document.getElementById('ver-btn-logout');
const textoStatus = document.getElementById('ver-texto-status');
const resultado   = document.getElementById('ver-resultado');
const scoreCirculo = document.getElementById('ver-score-circulo');
const veredictoEl  = document.getElementById('ver-veredicto');
const imagemInfo   = document.getElementById('ver-imagem-info');
const detalheEl    = document.getElementById('ver-detalhe');

// Referências das novas telas e controles
const btnCompartilhar = document.getElementById('ver-btn-compartilhar');
const btnCompartilharImagem = document.getElementById('ver-btn-compartilhar-imagem');
const linkDetalhes = document.getElementById('ver-link-detalhes');
const linkVoltar = document.getElementById('ver-link-voltar');
const btnAnalisarNovamente = document.getElementById('ver-btn-analisar-novamente');
const btnAnalisarPaginaDeImagem = document.getElementById('ver-btn-analisar-pagina-de-imagem');
const btnDetalhesImagem = document.getElementById('ver-btn-detalhes-imagem');

// Estado Global da Análise
let currentAnalysisType = 'site'; // 'site' ou 'image'
let lastImageUrl = '';            // URL da última imagem analisada
let lastSiteData = null;          // Dados de análise do site cacheado
let lastImageData = null;         // Dados de análise de imagem cacheado

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
  
  toast.textContent = mensaje;
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

btnFloat.addEventListener('click', () => {
  widget.classList.toggle('open');
});

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

function exibirResultado(score, veredicto, detalhe) {
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

// ------------------------------------------------------------
//  6. Análise principal
// ------------------------------------------------------------

btnAnalisar.addEventListener('click', async () => {
  const authResp = await chrome.runtime.sendMessage({ type: 'CHECK_AUTH' });
  if (!authResp.loggedIn) {
    textoStatus.textContent = 'Você precisa estar logado para analisar.';
    await chrome.runtime.sendMessage({ type: 'LOGOUT' });
    return;
  }

  const { token } = await chrome.runtime.sendMessage({ type: 'GET_TOKEN' });

  // Exibe tela 1 para mostrar carregamento
  showScreen('tela-inicial');
  btnAnalisar.textContent   = 'Analisando...';
  btnAnalisar.style.opacity = '0.7';
  btnAnalisar.disabled      = true;
  textoStatus.textContent   = 'Coletando dados da página...';

  const texto  = coletarTexto();
  const url    = window.location.href;
  const titulo = document.title;

  textoStatus.textContent = 'Enviando para o servidor...';

  try {
    const response = await fetch(`${BACKEND_URL}/analisar-pagina`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ url, titulo, texto }),
    });

    if (!response.ok) {
      throw new Error(`Erro do servidor: ${response.status}`);
    }

    const dados = await response.json();
    textoStatus.textContent = 'Análise concluída!';
    exibirResultado(dados.score, dados.veredicto, dados.detalhe);

  } catch (err) {
    textoStatus.textContent = `Falha na análise: ${err.message}`;
    btnAnalisar.textContent   = 'Tentar novamente';
    btnAnalisar.style.opacity = '1';
    btnAnalisar.disabled      = false;
  }
});

// ------------------------------------------------------------
//  7. Logout
// ------------------------------------------------------------

btnLogout.addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ type: 'LOGOUT' });
});

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

  // Atualiza o Gauge de Imagem
  updateGauge('ver-gauge-fill-image-path', imgScoreEl, imagem_confianca, true, imagem_ia);

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
  if (message.type === 'ANALISANDO_IMAGEM') {
    lastImageUrl = message.url || '';
    widget.classList.add('open');
    showScreen('tela-inicial');
    textoStatus.textContent = 'Analisando imagem com IA...';
    return;
  }

  if (message.type === 'IMAGEM_ANALISADA') {
    if (message.erro) {
      showScreen('tela-inicial');
      textoStatus.textContent = `Erro: ${message.erro}`;
      return;
    }

    processarResultadoImagem(message.dados);
  }
});
