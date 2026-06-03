# Veridion

> Extensão de navegador que analisa a confiabilidade de sites em tempo real, gerando um **Trust Score** baseado em análise técnica, inteligência artificial e votos da comunidade.

---

## Sobre o projeto

O Veridion ajuda usuários a identificar fake news, golpes, sites maliciosos e conteúdos manipulativos enquanto navegam. A extensão coleta dados da página atual e os envia para uma API que realiza análises em múltiplas camadas, retornando uma pontuação de 0 a 100 com um breakdown explicando cada fator.

---

## Como funciona

### Análise de página

Extensão → API → Análise (técnica + IA + comunidade) → Trust Score → Retorno

| Camada | O que analisa | Peso |
|---|---|---|
| IA (Gemini 2.5 Flash) | Linguagem, padrões de fake news, clickbait, manipulação | 45% |
| Técnica | HTTPS, idade do domínio via WHOIS | 25% |
| Comunidade | Votos de usuários: confiável, suspeito ou golpe | 30% |

> Quando não há votos da comunidade, o peso é redistribuído proporcionalmente entre IA e Técnica.

Os votos da comunidade têm pesos diferentes conforme a gravidade: `confiável` = 100, `suspeito` = 25, `golpe` = 0. O score de comunidade é a média ponderada desses valores.

### Análise de imagem

O usuário pode clicar com o **botão direito em qualquer imagem** da página e selecionar "Analisar imagem com IA (Veridion)". O Gemini detecta se a imagem foi gerada por IA e exibe o resultado diretamente no widget.

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
- PostgreSQL (Supabase)
- Google Gemini 2.5 Flash (análise de conteúdo e imagens)
- JWT + bcrypt
- Helmet + express-rate-limit

**Extensão**
- JavaScript + HTML + CSS
- Chrome Manifest V3

---

## API

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/cadastro` | — | Cria novo usuário |
| `POST` | `/login` | — | Autentica e retorna token JWT |
| `POST` | `/analisar-pagina` | Opcional | Analisa página completa (usado pela extensão) |
| `POST` | `/analisar-imagem` | Obrigatória | Detecta se uma imagem foi gerada por IA (botão direito) |
| `POST` | `/vote` | Obrigatória | Registra voto da comunidade |
| `POST` | `/report` | Obrigatória | Denuncia um site |
| `GET` | `/domain` | — | Consulta votos e score público de um domínio |
| `GET` | `/analises` | Obrigatória | Histórico de análises do usuário |
| `GET` | `/ping` | — | Verifica se o servidor está ativo |

### Exemplo de resposta — POST /analisar-pagina

```json
{
  "score": 74,
  "veredicto": "Moderadamente confiável",
  "detalhe": "HTTPS ativo (+15) • Domínio com 6 ano(s) (+10) • Escrita objetiva (+12) • Sem fontes citadas (-8)"
}
```

### Exemplo de resposta — POST /analisar-imagem

```json
{
  "imagem_ia": true,
  "imagem_confianca": 87,
  "veredicto": "Imagem gerada por IA (87% de confiança)"
}
```

---

## Rodando localmente

**Pré-requisitos:** Node.js 18+, conta no Supabase, chave da API do Google Gemini.

```bash
git clone https://github.com/seu-usuario/veridion.git
cd veridion/backend
npm install
cp .env.example .env
```

Edite o `.env` com suas credenciais antes de continuar.

**Banco de dados**

```bash
psql "<DATABASE_URL>" -f src/models/schema.sql
```

**Iniciando**

```bash
# Desenvolvimento (hot reload)
npm run dev

# Produção
npm start
```

O servidor sobe em `http://localhost:3000`.

---

## Variáveis de ambiente

Veja o arquivo `.env.example` para a lista completa.

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string do Supabase |
| `JWT_SECRET` | Chave secreta para assinar tokens |
| `JWT_EXPIRES_IN` | Tempo de expiração do token (ex: `7d`) |
| `PORT` | Porta do servidor (padrão: `3000`) |
| `GEMINI_API_KEY` | Chave da API do Google AI Studio |

---

## Estrutura do projeto

```
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
```

---

## Segurança

- Helmet (headers HTTP seguros)
- Rate limiting por IP:
  - 30 req/min em `/analisar-pagina` e `/analisar-imagem`
  - 10 req/min em `/vote`
  - 5 req/hora em `/report`
  - 10 tentativas/15min em `/login` e `/cadastro` (apenas falhas)
- Senhas com bcrypt (salt rounds: 10, limite de 72 caracteres)
- Autenticação via JWT
- Anti-spam de votos: 1 voto por usuário por domínio
- Validação de inputs com limites de tamanho em todas as rotas

---

> Desenvolvido como Trabalho de Conclusão de Curso (TCC) no curso técnico de Desenvolvimento de Sistemas.
