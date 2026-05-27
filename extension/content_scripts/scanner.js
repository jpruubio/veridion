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
  <div id="veridion-widget-container">
    <div id="veridion-panel">
      <div class="ver-header">Veridion</div>
      <div class="ver-subtitle">Segurança e Veracidade</div>

      <div class="ver-status">
        <p id="ver-texto-status">Pronto para analisar esta página.</p>
      </div>

      <div id="ver-resultado" class="ver-resultado" style="display:none;">
        <div class="ver-score-wrap">
          <div id="ver-score-circulo" class="ver-score-circulo">--</div>
          <div id="ver-veredicto" class="ver-veredicto-texto">--</div>
        </div>
        <div id="ver-imagem-info" class="ver-imagem-info" style="display:none;"></div>
        <div id="ver-detalhe" class="ver-detalhe"></div>
      </div>

      <button id="ver-btn-analisar" class="ver-btn">Analisar Página com IA</button>
      <button id="ver-btn-logout" class="ver-btn ver-btn-secundario">Sair da conta</button>
    </div>

    <div id="veridion-floating-btn">V</div>
  </div>
`;

document.body.insertAdjacentHTML('beforeend', widgetHTML);

// ------------------------------------------------------------
//  2. Referências aos elementos
// ------------------------------------------------------------

const widget      = document.getElementById('veridion-widget-container');
const btnFloat    = document.getElementById('veridion-floating-btn');
const btnAnalisar = document.getElementById('ver-btn-analisar');
const btnLogout   = document.getElementById('ver-btn-logout');
const textoStatus = document.getElementById('ver-texto-status');
const resultado   = document.getElementById('ver-resultado');
const scoreCirculo = document.getElementById('ver-score-circulo');
const veredictoEl  = document.getElementById('ver-veredicto');
const imagemInfo   = document.getElementById('ver-imagem-info');
const detalheEl    = document.getElementById('ver-detalhe');

// ------------------------------------------------------------
//  3. Drag do botão flutuante
// ------------------------------------------------------------

let isDragging = false;
let startX, startY, initialLeft, initialTop;

btnFloat.addEventListener('mousedown', (e) => {
  isDragging = false;
  startX = e.clientX;
  startY = e.clientY;
  const rect = widget.getBoundingClientRect();
  initialLeft = rect.left;
  initialTop  = rect.top;
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
});

function onMouseMove(e) {
  isDragging = true;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  widget.style.bottom = 'auto';
  widget.style.right  = 'auto';
  widget.style.left   = `${initialLeft + dx}px`;
  widget.style.top    = `${initialTop  + dy}px`;
}

function onMouseUp(e) {
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
  const moveuPouco = Math.abs(e.clientX - startX) < 5 && Math.abs(e.clientY - startY) < 5;
  if (!isDragging || moveuPouco) {
    widget.classList.toggle('open');
  }
}

// ------------------------------------------------------------
//  4. Coleta de dados da página
// ------------------------------------------------------------

/** Extrai o texto visível principal da página (máx. 4000 chars para não estourar o prompt). */
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

/** Coleta as URLs das imagens presentes na página (máx. 5). */
function coletarImagens() {
  const imgs = Array.from(document.querySelectorAll('img'))
    .map(img => img.src)
    .filter(src => src && src.startsWith('http'))
    .slice(0, 5);
  return imgs;
}

// ------------------------------------------------------------
//  5. Exibição de resultado
// ------------------------------------------------------------

/**
 * Aplica o resultado da análise no widget.
 * @param {number}   score      - 0 a 100
 * @param {string}   veredicto  - Texto curto do veredicto
 * @param {string}   detalhe    - Explicação da IA
 * @param {string|null} imagemMsg - Mensagem sobre as imagens (ou null)
 */
function exibirResultado(score, veredicto, detalhe, imagemMsg = null) {
  scoreCirculo.textContent = score;

  // Cor do score baseada no valor
  scoreCirculo.className = 'ver-score-circulo';
  if (score >= 70)      scoreCirculo.classList.add('ver-score-alto');
  else if (score >= 40) scoreCirculo.classList.add('ver-score-medio');
  else                  scoreCirculo.classList.add('ver-score-baixo');

  veredictoEl.textContent = veredicto;
  detalheEl.textContent   = detalhe;

  if (imagemMsg) {
    imagemInfo.textContent = imagemMsg;
    imagemInfo.style.display = 'block';
  }

  resultado.style.display = 'block';
}

function resetarUI() {
  resultado.style.display    = 'none';
  imagemInfo.style.display   = 'none';
  btnAnalisar.disabled       = false;
  btnAnalisar.textContent    = 'Analisar Página com IA';
  btnAnalisar.style.opacity  = '1';
}

// ------------------------------------------------------------
//  6. Análise principal
// ------------------------------------------------------------

btnAnalisar.addEventListener('click', async () => {
  // Verifica autenticação antes de qualquer coisa
  const authResp = await chrome.runtime.sendMessage({ type: 'CHECK_AUTH' });
  if (!authResp.loggedIn) {
    textoStatus.textContent = 'Você precisa estar logado para analisar.';
    await chrome.runtime.sendMessage({ type: 'LOGOUT' });
    return;
  }

  // Pega o token para incluir no cabeçalho da requisição
  const { token } = await chrome.runtime.sendMessage({ type: 'GET_TOKEN' });

  // Feedback visual de carregamento
  resetarUI();
  btnAnalisar.textContent   = 'Analisando...';
  btnAnalisar.style.opacity = '0.7';
  btnAnalisar.disabled      = true;
  textoStatus.textContent   = 'Coletando dados da página...';

  const texto   = coletarTexto();
  const imagens = coletarImagens();
  const url     = window.location.href;
  const titulo  = document.title;

  textoStatus.textContent = 'Enviando para o servidor...';

  try {
    const response = await fetch(`${BACKEND_URL}/analisar-pagina`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ url, titulo, texto, imagens }),
    });

    if (!response.ok) {
      throw new Error(`Erro do servidor: ${response.status}`);
    }

    const dados = await response.json();

    // Esperamos que o back-end retorne:
    // { score: number, veredicto: string, detalhe: string, imagem_ia: boolean, imagem_confianca: number }
    textoStatus.textContent = 'Análise concluída!';

    const imagemMsg = dados.imagem_ia !== undefined
      ? `Imagens: ${dados.imagem_ia ? `IA detectada (${dados.imagem_confianca}% de certeza)` : 'Nenhuma IA detectada'}`
      : null;

    exibirResultado(dados.score, dados.veredicto, dados.detalhe, imagemMsg);

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