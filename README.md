# Carbonix 

Full-stack demo for listing, discovering, and trading surplus renewable energy (and related environmental credits) with optional on-chain receipts via a small blockchain service.

## What it does

- Role-based accounts (producer, consumer, both, admin) with **Google sign-in** and profiles.
- Marketplace for listings with search, filters, and pagination.
- Purchase flow, transaction history, and downloadable receipts.
- Blockchain microservice: wallet creation, transaction submission, mining, and chain validation; hashes stored with trades.
- Dynamic pricing hints (Gemini), Razorpay payments, email notifications, Socket.io chat, and admin analytics.

## Stack

- **Frontend:** React (Vite), Tailwind, Radix UI, Recharts, Socket.io client  
- **API:** Node.js, Express, MongoDB (Mongoose)  
- **Chain service:** Python (Flask), SQLite  
- **Other:** JWT, Razorpay, Nodemailer, rate limiting (Joi)

## Authentication

Sign-in is **Google only** (email/password registration and login are disabled in the API). In [Google Cloud Console](https://console.cloud.google.com/), create OAuth 2.0 credentials and set the redirect URI to the same value as `GOOGLE_CALLBACK_URL` in `server/.env` (default: `http://localhost:8000/api/auth/google/callback`).

**OAuth redirect flow:** Browser opens `GET /api/auth/google?role=...` on the API (port **8000**) → Express redirects you to **accounts.google.com** → after consent, Google redirects to `GET /api/auth/google/callback?code=...&state=...` → the API issues a JWT and redirects the browser to `CLIENT_URL/auth/google/success?token=...` (Vite on **5173**). In Google Console, only the **callback** URL must be listed (not the `/google` start URL). Avoid spaces after `=` in `.env` values.

**Check config:** With the API running, open `http://localhost:8000/api/auth/oauth-config` — it shows the exact `callbackUrl` string that must appear under *Authorised redirect URIs* for this client ID.

## Run locally

**All services (recommended)**

- Windows: `start-all.bat`
- macOS/Linux: `./start-all.sh`

**Manual**

1. `blockchain-service`: run `setup.sh` / `setup.bat`, then `python app.py` (and optionally `python worker.py`).
2. `server`: `npm install` → `npm run dev` (API on **http://localhost:8000** when `PORT=8000`)
3. `client`: `npm install` → `npm run dev` (Vite on **http://localhost:5173**)

## Environment

**Server (`server/.env`):** `PORT`, `MONGODB_URI`, `MONGODB_URI_DIRECT` (optional), `MONGODB_DNS_SERVERS` (optional), `JWT_SECRET`, `JWT_EXPIRY`, `EMAIL_*`, `GOOGLE_*`, `RAZORPAY_*`, `CLIENT_URL`, `GEMINI_API_KEY`, `BLOCKCHAIN_SERVICE_URL`.

**Blockchain (`blockchain-service/.env`):** `FLASK_PORT`, `FLASK_ENV`, `NODE_SERVER_URL`, `SECRET_KEY`.

## Layout

```
Energy Trading P2P/
  client/              # React app
  server/              # Express API
  blockchain-service/  # Flask chain
  start-all.bat
  start-all.sh
```

## API highlights

**Express:** `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/credits/post`, `GET /api/credits`, `POST /api/credits/payment`, `GET /api/pricing/market/insights`

**Flask:** `GET /health`, `POST /wallet/create`, `POST /transaction/create`, `POST /mine`, `GET /chain`, `GET /chain/validate`

## Notes

The bundled chain is a teaching-style PoW implementation, not production infrastructure. Swap in a real network or custody model before any serious deployment.

## Demo flow

1. Sign in with Google and pick producer or consumer when prompted.  
2. Post a listing; buy from the marketplace.  
3. Open transaction history and receipt; note the chain hash when the blockchain service is running.  
4. Explore pricing insights, dashboards, and chat.
