# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Veridion is a browser extension + Node.js API that analyzes website trustworthiness and generates a Trust Score (0–100). The extension collects page data and sends it to the backend, which runs multi-layer analysis and returns a score with a breakdown.

**Scope:** This repository has two parts — `backend/` (Node.js API) and `extension/` (Chrome Manifest V3). Backend development only; do not touch the extension.

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

### Request flow for POST /analyze (core feature)

```
analyzeRoutes.js
  → tokenOpcional middleware (JWT optional)
  → analiseLimiter (rate limit)
  → analyzeController.js
      ├── technicalAnalysis.js   (HTTPS check + WHOIS domain age)
      ├── aiAnalysis.js          (stub — returns neutral score 50)
      ├── DB query on `votos`    (community score)
      └── trustScore.js          (weights: tech 35% + IA 30% + community 35%)
  → saves to `analises` if user is authenticated
  → returns { dominio, score, veredicto, breakdown[] }
```

### Auth pattern
- `middlewares/auth.js` exports `verificarToken` — use on routes that require login
- `analyzeRoutes.js` uses `tokenOpcional` — JWT is accepted but not required; sets `req.usuario` if valid
- `req.usuario` is `{ id, email }` from JWT payload

### Database
- `models/db.js` exports a `pg` Pool — import directly in controllers
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
`middlewares/rateLimiter.js` exports two limiters: `analiseLimiter` (30/min for `/analyze`) and `voteLimiter` (10/min for `/vote`).

### AI integration (stub)
`services/aiAnalysis.js` currently returns a neutral score of 50. To integrate a real LLM, replace the body of `analisarConteudo()` with the API call — the interface is already wired into the analysis pipeline.

## Environment variables

Copy `.env.example` to `.env`. Required vars:

```
DATABASE_URL=          # Supabase connection string
JWT_SECRET=            # Long random string
JWT_EXPIRES_IN=7d
PORT=3000
```
