const whois = require('whois');

function extrairDominio(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

// WHOIS só funciona em domínios registrados, não subdomínios.
// blog.example.com → example.com | sub.example.com.br → example.com.br
function extrairDominioRaiz(hostname) {
  const partes = hostname.split('.');
  if (partes.length <= 2) return hostname;

  const sufixosCompostos = [
    'co.uk', 'org.uk', 'me.uk', 'net.uk',
    'com.br', 'org.br', 'net.br', 'gov.br', 'edu.br',
    'com.au', 'co.au', 'net.au',
    'co.nz', 'com.ar', 'com.mx',
  ];

  if (sufixosCompostos.includes(partes.slice(-2).join('.'))) {
    return partes.slice(-3).join('.');
  }
  return partes.slice(-2).join('.');
}

function parseDataWhois(texto) {
  const padroes = [
    /Creation Date:\s*(.+)/i,
    /Created(?:\s+on)?:\s*(.+)/i,
    /Registered(?:\s+on)?:\s*(.+)/i,
    /Registration Date:\s*(.+)/i,
    /Registration Time:\s*(.+)/i,
    /Domain Registration Date:\s*(.+)/i,
    /domain_dateregistered:\s*(.+)/i,
    /activate:\s*(.+)/i,
  ];

  for (const padrao of padroes) {
    const match = texto.match(padrao);
    if (match) {
      // Remove informação extra após a data (ex: "2020-01-15  before 2021-01-15")
      const candidato = match[1].trim().split(/\s{2,}|\s+before\s+/i)[0].trim();
      const data = new Date(candidato);
      if (!isNaN(data)) return data;
    }
  }
  return null;
}

function consultarWhois(dominio) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(null), 2000);
    whois.lookup(dominio, (err, data) => {
      clearTimeout(timeout);
      if (err || !data) return resolve(null);
      resolve(data);
    });
  });
}

async function analisarTecnico(url) {
  const fatores = [];
  let score = 50;

  const ehHttps = url.startsWith('https://');
  if (ehHttps) {
    score += 15;
    fatores.push({ fator: 'HTTPS ativo', impacto: '+15' });
  } else {
    score -= 20;
    fatores.push({ fator: 'Sem HTTPS (conexão insegura)', impacto: '-20' });
  }

  const dominio = extrairDominio(url);
  if (!dominio) {
    fatores.push({ fator: 'URL inválida', impacto: '0' });
    return { score: Math.max(0, Math.min(100, score)), fatores };
  }

  const dominioRaiz = extrairDominioRaiz(dominio);
  const dadosWhois  = await consultarWhois(dominioRaiz);

  if (dadosWhois) {
    const dataCriacao = parseDataWhois(dadosWhois);
    if (dataCriacao) {
      const mesesDeVida = (Date.now() - dataCriacao.getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (mesesDeVida < 6) {
        score -= 20;
        fatores.push({ fator: 'Domínio recente (menos de 6 meses)', impacto: '-20' });
      } else if (mesesDeVida > 24) {
        score += 10;
        const anos = Math.floor(mesesDeVida / 12);
        fatores.push({ fator: `Domínio com ${anos} ano(s)`, impacto: '+10' });
      } else {
        fatores.push({ fator: 'Domínio com menos de 2 anos', impacto: '0' });
      }
    } else {
      fatores.push({ fator: 'Idade do domínio não identificada', impacto: '0' });
    }
  } else {
    fatores.push({ fator: 'Consulta WHOIS indisponível', impacto: '0' });
  }

  return { score: Math.max(0, Math.min(100, score)), fatores };
}

module.exports = { analisarTecnico, extrairDominio };
