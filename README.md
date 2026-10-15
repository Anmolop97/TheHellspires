# Coditech

A polished, responsive coding-error explainer with a local rule engine and optional Gemini AI. The API key is kept on the server, not in frontend JavaScript or browser storage.

## Requirements
- Node.js 20 or newer
- A Gemini API key for AI mode (Quick Fix works without one)

## Run locally
1. Extract this folder.
2. Open a terminal in the `coditech` folder.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy `.env.example` to `.env`.
   - Windows PowerShell: `Copy-Item .env.example .env`
   - macOS/Linux: `cp .env.example .env`
5. Open `.env` and replace `put_your_key_here` with your Gemini API key.
6. Start the server:
   ```bash
   npm start
   ```
7. Open **http://localhost:3000** in your browser.

Do not open `public/index.html` directly using `file://`; use the local server so `/api/debug` works.

## Security notes
- The Gemini key is read only by `server.js` from `.env`; it is never sent to the browser.
- `.env` is ignored by Git. Never commit your real key.
- The server applies Helmet security headers, request-size validation, a per-IP rate limit, a request timeout, and generic provider errors.
- The demo stores recent sessions in your browser's localStorage. Avoid pasting passwords, API keys, tokens, personal data, or confidential code. Use the Clear button to remove saved sessions.
- Rate limiting is in-memory and suitable for a local demo, not a multi-instance production deployment. Add authentication, persistent rate limiting, monitoring, and HTTPS before public launch.
- The included inline CSS/JS means CSP is disabled in Helmet for this starter. For production, split CSS and JS into separate files and enable a strict Content Security Policy.
- Browser localStorage is not encrypted. Do not use it for secrets.
- If deploying publicly, restrict access, set an intentional `ALLOWED_ORIGIN` if cross-origin access is needed, and configure quotas/billing on your AI provider account.

## What is included
- `public/index.html`: responsive Coditech interface and local quick-fix engine
- `server.js`: secure-ish server-side AI proxy; key is not exposed to the client
- `.env.example`: configuration template without a real key
- `package.json`: dependencies and run scripts
