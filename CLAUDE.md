# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Veridion is a browser extension + Node.js API that analyzes website trustworthiness and generates a Trust Score (0–100). The extension collects page data and sends it to the backend, which runs multi-layer analysis and returns a score with a breakdown.

**Scope:** This repository has two parts — `backend/` (Node.js API) and `extension/` (Chrome Manifest V3). Both are in active development.

## Commands

All commands run from `backend/`:

```bash
npm run dev    # Start with nodemon (hot reload)
npm start      # Start in production mode
```

No test runner or linter is configured.

## Architecture

### Entry point
`backend/src/server/server.js` — loads Express, applies global middleware (Helmet, CORS, JSON body parser), registers all routes, starts the server.

### Request flow for POST /analisar-pagina (core feature)

```
paginaRoutes.js
  → analiseLimiter (rate limit)
  → tokenOpcional middleware (JWT optional)
  → paginaController.js
      ├── technicalAnalysis.js   (HTTPS check + WHOIS root domain age)
      ├── aiAnalysis.js          (Google Gemini 2.5 Flash — analyzes title + text)
      ├── communityAnalysis.js   (weighted community score from `votos` table)
      └── trustScore.js          (weights: IA 45% + community 30% + tech 25%;
                                   community excluded and weights redistributed when no votes)
  → saves to `analises` if user is authenticated
  → returns { score, veredicto, detalhe }
```

### Request flow for POST /analisar-imagem (right-click feature)

```
paginaRoutes.js
  → analiseLimiter
  → verificarToken (auth required)
  → paginaController.analisarImagem
      └── aiAnalysis.analisarImagens()  (Gemini Vision — detects AI-generated images)
  → returns { imagem_ia, imagem_confianca, veredicto }
```

### Auth pattern
- `middlewares/auth.js` exports `verificarToken` and `tokenOpcional`
- `tokenOpcional` — JWT accepted but not required; sets `req.usuario` if valid. Use on routes that save history when logged in but work without login too.
- `verificarToken` — required auth; returns 401 if missing or invalid
- `req.usuario` is `{ id, email }` from JWT payload

### Database
- `models/db.js` exports a `pg` Pool — import directly in controllers
- Fails fast on missing `DATABASE_URL`; pool errors are logged without crashing the process
- Supabase connection via `DATABASE_URL` env var with `ssl: { rejectUnauthorized: false }`
- Schema is in `models/schema.sql` — run once to create all tables

### Tables
| Table | Purpose |
|---|---|
| `usuarios` | User accounts |
| `votos` | Community votes — UNIQUE(usuario_id, dominio) enforces 1 vote/user/domain |
| `denuncias` | User reports |
| `analises` | History of analyses per user |

### Rate limiting
`middlewares/rateLimiter.js` exports four limiters:

| Limiter | Limit | Routes |
|---|---|---|
| `analiseLimiter` | 30 req/min | `/analisar-pagina`, `/analisar-imagem` |
| `voteLimiter` | 10 req/min | `/vote` |
| `reportLimiter` | 5 req/hour | `/report` |
| `authLimiter` | 10 failures/15min | `/login`, `/cadastro` |

`authLimiter` uses `skipSuccessfulRequests: true` — only failed attempts count toward the limit.

### Community score
`services/communityAnalysis.js` — weighted average by vote type: `confiavel` = 100, `suspeito` = 25, `golpe` = 0. When no votes exist, community is excluded from the Trust Score formula and its weight is redistributed proportionally to IA and Técnica.

### AI integration
`services/aiAnalysis.js` uses Google Gemini 2.5 Flash via `GEMINI_API_KEY`. Exports:
- `analisarConteudo({ titulo, conteudo })` — text analysis, returns `{ score, fatores }`
- `analisarImagens([url])` — AI-generated image detection, returns `{ imagem_ia, imagem_confianca }`

Both fall back gracefully (score 50 / false) if the key is missing or the API fails.

### WHOIS domain age
`services/technicalAnalysis.js` — queries WHOIS on the **root domain** (strips subdomains before lookup). Timeout: 2 seconds. Recognizes 8 date formats across major registrars.

## Environment variables

Copy `.env.example` to `.env`. Required vars:

```
DATABASE_URL=          # Supabase connection string
JWT_SECRET=            # Long random string
JWT_EXPIRES_IN=7d
PORT=3000
GEMINI_API_KEY=        # Google AI Studio key
```
