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
      ├── aiAnalysis.js          (Google Gemini 3.5 Flash — analyzes title + text)
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
| `usuarios` | User accounts. `nome` is set at signup; `nome_completo`/`avatar_url` are editable profile fields (`GET/POST /usuario/perfil`), separate from `nome` |
| `votos` | Community votes — UNIQUE(usuario_id, dominio) enforces 1 vote/user/domain. Upserted via `INSERT ... ON CONFLICT` |
| `denuncias` | User reports on a domain (`POST /report`). `descricao` is legacy/unused — the active free-text field is `comentario` |
| `denuncias_imagens` | Reports on a specific image (`POST /report-image`) — separate from `denuncias` |
| `analises` | History of analyses per user. Timestamp column is `analisado_em`; controllers alias it `AS criado_em` in SELECTs so API responses always use `criado_em` |
| `reset_tokens` | Password-reset tokens (`POST /esqueci-senha`, `POST /redefinir-senha`) — random 32-byte hex, expires in 1h, single-use (`usado`) |

`models/schema.sql` uses `CREATE TABLE IF NOT EXISTS` and `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` throughout, so it's safe to re-run against an existing (e.g. Supabase) database to reconcile missing columns/tables — it won't touch existing data.

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
`services/aiAnalysis.js` uses Google Gemini (`gemini-3.5-flash`) via `GEMINI_API_KEY`, through the `@google/genai` SDK (`GoogleGenAI`, `genAI.models.generateContent({ model, contents, config })` — not the deprecated `@google/generative-ai`). The client is instantiated once at module load (not per request).

Exports:
- `analisarConteudo({ titulo, conteudo, dominio })` — text analysis; `dominio` is optional context for the model; returns `{ score, fatores }`
- `analisarImagens([url])` — AI-generated image detection; fetches image, sends as base64 inline data; returns `{ imagem_ia, imagem_confianca }`. Results are cached in-memory per image URL (`imagemCache`, 24h TTL) so re-analyzing the same image returns the same verdict instead of re-querying the model

Scoring prompt anchors: 0–20 fraud/disinfo, 21–40 suspicious, 41–60 neutral, 61–80 probably trustworthy, 81–100 high credibility. Scores outside 20–85 require explicit evidence in the text. Both functions fall back gracefully (score 50 / false) if the key is missing or the API fails.

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
RESEND_API_KEY=        # Resend key — sends the password-reset email in POST /esqueci-senha
```

`RESEND_API_KEY` has no fallback like `GEMINI_API_KEY` does — if it's missing or invalid, `POST /esqueci-senha` fails (caught by the generic try/catch, returns 500) instead of degrading gracefully.

## Extension (`extension/`)

Chrome Manifest V3. Key pieces:
- `manifest.json` — background service worker (classic, not `type: module`, so it can use `importScripts`), one content script on `<all_urls>`, and standalone pages (login, cadastro, portal, comunidade, config) opened via `chrome.tabs.create`
- `shared/config.js` — single source of truth for `BACKEND_URL`. Loaded via `importScripts()` in the service worker, first in the `js` array for the content script, and via an extra `<script>` tag (before the page's own script) on every extension page. Don't redeclare `BACKEND_URL` locally in any file — add the `<script>`/`importScripts` reference instead
- `background/service_worker.js` — auth state in `chrome.storage.local` (`token`, `user`), opens the login page when logged out, retries queued reports (`pending_reports`) on install/startup, handles the right-click "Analisar imagem com IA" context menu
- `content_scripts/scanner.js` — injects the floating widget on every page; also runs independent, undocumented-elsewhere security features: a typosquatting banner (Levenshtein distance against a hardcoded `FAMOUS_DOMAINS` list), a Pix-code checkout scanner + clipboard-hijack guard (Pix shield features are gated behind a hardcoded `isEnterprise`/`isPremium` check — no real paywall/billing exists yet), and Google search result badges. The domain trust-score cache-first flow has a 24h TTL (`CACHE_TTL_MS`), checked against both the backend's `/domain` response and the local `chrome.storage.local` fallback

## Known issues / pending

Found during a full-repo consistency pass (branch `fix/consistency-audit`, off `main` at `0f67592`). What's fixed is reflected in the sections above.

**Still open:**
1. **`schema.sql` changes haven't been applied to the live Supabase database.** The file only affects a database when it's actually run against one (`psql "<DATABASE_URL>" -f backend/src/models/schema.sql`) — editing the file in the repo doesn't migrate production. Every `ALTER`/constraint addition in it is idempotent (`IF NOT EXISTS`, or a `pg_constraint` existence check for the one `CHECK` constraint retrofit), so it's safe to run against the existing Supabase database without touching current data.

**Resolved:**
- ~~`POST /esqueci-senha` has no fallback if `RESEND_API_KEY` is missing/invalid~~ — fixed: the Resend call is now in its own try/catch; a send failure is logged but still returns the generic 200 (the response was already generic for anti-enumeration, and the reset token is already persisted regardless of email delivery).
- ~~`denuncias_imagens.motivo` CHECK constraint only applies to a fresh table~~ — fixed: `schema.sql` now has a `DO $$ ... $$` block that adds the constraint by name (`denuncias_imagens_motivo_check`) if missing, so re-running the file retrofits it on an existing Supabase table too. Still needs the file to actually be run (see item 1).
- Mock data in `communityController` (`obterRankings`, and the `nike.com.br`/`nike.com` branch in `obterDetalhesSite`) — confirmed intentional, kept for a demo. Not a bug.
- `imageReportController`'s `MOTIVOS_VALIDOS` (`imagem_fake`, `conteudo_inadequado`, `direitos_autorais`, `outro`) — confirmed as the right categories.
