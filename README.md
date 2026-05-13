# Veridion

> Extensão de navegador que analisa a confiabilidade de sites em tempo real, gerando um **Trust Score** baseado em análise técnica, inteligência artificial e votos da comunidade.

---

## Sobre o projeto

O Veridion ajuda usuários a identificar fake news, golpes, sites maliciosos e conteúdos manipulativos enquanto navegam. A extensão coleta dados da página atual e os envia para uma API que realiza análises em múltiplas camadas, retornando uma pontuação de 0 a 100 com um breakdown explicando cada fator.

---

## Como funciona

Extensão → API → Análise (técnica + IA + comunidade) → Trust Score → Retorno



| Camada | O que analisa |
|---|---|
| Técnica | HTTPS, idade do domínio via WHOIS |
| IA | Linguagem sensacionalista, padrões de fake news *(em integração)* |
| Comunidade | Votos de usuários: confiável, suspeito ou golpe |

### Veredictos

| Score | Veredicto |
|---|---|
| 0 – 30 | Perigo |
| 31 – 60 | Suspeito |
| 61 – 85 | Moderadamente confiável |
| 86 – 100 | Confiável |

---

## Stack

**Backend**
- Node.js + Express
- PostgreSQL
- JWT + bcrypt
- Helmet + express-rate-limit

**Extensão**
- JavaScript + HTML + CSS
- Manifest V3

---

## API

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/cadastro` | — | Cria novo usuário |
| `POST` | `/login` | — | Autentica e retorna token JWT |
| `POST` | `/analyze` | Opcional | Analisa uma URL e retorna Trust Score |
| `POST` | `/vote` | Obrigatória | Registra voto da comunidade |
| `POST` | `/report` | Obrigatória | Reporta problema com um site |
| `GET` | `/domain` | — | Consulta votos e score público de um domínio |
| `GET` | `/ping` | — | Verifica se o servidor está ativo |

### Exemplo de resposta — POST /analyze

```json
{
  "dominio": "exemplo.com",
  "score": 72,
  "veredicto": "Moderadamente confiável",
  "breakdown": [
    { "fator": "HTTPS ativo", "impacto": "+15" },
    { "fator": "Domínio com 4 ano(s)", "impacto": "+10" },
    { "fator": "Comunidade: 8 voto(s) confiável", "impacto": "+28" },
    { "fator": "Análise de IA indisponível", "impacto": "0" }
  ]
}
Rodando localmente
Pré-requisitos
Node.js 18+
PostgreSQL
Instalação

git clone https://github.com/seu-usuario/veridion.git
cd veridion/backend
npm install
cp .env.example .env
Edite o .env com suas credenciais antes de continuar.

Banco de dados

psql -U postgres -d veridion_db -f src/models/schema.sql
Iniciando

# Produção
npm start

# Desenvolvimento (hot reload)
npm run dev
O servidor sobe em http://localhost:3000.

Variáveis de ambiente
Veja o arquivo .env.example para a lista completa.

Variável	Descrição
PORT	Porta do servidor (padrão: 3000)
DB_HOST	Host do PostgreSQL
DB_NAME	Nome do banco de dados
DB_USER	Usuário do banco
DB_PASSWORD	Senha do banco
JWT_SECRET	Chave secreta para assinar tokens
JWT_EXPIRES_IN	Tempo de expiração do token (ex: 7d)
Estrutura do projeto

backend/
├── src/
│   ├── controllers/     # Lógica de cada rota
│   ├── middlewares/     # Auth JWT, rate limiting
│   ├── models/          # Conexão com banco + schema SQL
│   ├── routes/          # Definição das rotas
│   ├── services/        # Motor de análise e Trust Score
│   └── server/          # Entrada do servidor
├── .env.example
└── package.json
Segurança
Helmet (headers HTTP seguros)
Rate limiting por IP (30 req/min em /analyze, 10 req/min em /vote)
Senhas com bcrypt (salt rounds: 10)
Autenticação via JWT
Anti-spam de votos: 1 voto por usuário por domínio
Validação de inputs em todas as rotas
Projeto acadêmico
Desenvolvido como Trabalho de Conclusão de Curso (TCC) no curso técnico de Desenvolvimento de Sistemas.
