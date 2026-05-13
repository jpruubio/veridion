const whois = require('whois');

function extrairDominio(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function parseDataWhois(texto) {
  const padroes = [
    /Creation Date:\s*(.+)/i,
    /created:\s*(.+)/i,
    /Registered on:\s*(.+)/i,
    /domain_dateregistered:\s*(.+)/i,
  ];
  for (const padrao of padroes) {
    const match = texto.match(padrao);
    if (match) {
      const data = new Date(match[1].trim());
      if (!isNaN(data)) return data;
    }
  }
  return null;
}

function consultarWhois(dominio) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(null), 5000);
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

  const dadosWhois = await consultarWhois(dominio);
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
