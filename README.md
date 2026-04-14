# Carbonix

Carbonix is a premium, fully-featured peer-to-peer (P2P) carbon credit trading platform that connects renewable energy producers directly with buyers without brokers or markups. It facilitates trading of verified carbon credits aligned with India's 2070 net-zero goals, the UN Paris Agreement, and the Carbon Credit Trading Scheme (CCTS 2023).

## What it does

- **Role-Based Accounts:** Distinct flows for Producers, Consumers, and Admins via secure **Google Sign-In**. Includes an approval request workflow for new sellers.
- **P2P Marketplace:** Discover and trade verifiable carbon credits with live dynamic pricing, project tracking, directory browsing, and search/filters.
- **Analytics & Dashboards:** Distinct and comprehensive dashboard modules (Buyer Analytics, Seller Analytics, Combined Dashboard) tracking total earnings, carbon balances, and active marketplace insights.
- **AI-Powered Integration:** Dynamic AI pricing insights and analytics powered by the Gemini API.
- **Impact Visualization:** Interactive responsive 3D globe tracking carbon hubs and projects, plus integrated carbon footprint calculators to assess your direct emission impact.
- **Seamless Checkout:** Real-time integrated payments via Razorpay (including same-day settlements workflow mockups), downloadable receipts, and transaction history tracking.

## Technology Stack

- **Frontend:** React 19 (Vite), Tailwind CSS, Framer Motion, Radix UI, Recharts for robust visualizations
- **API & Backend:** Node.js, Express, MongoDB (Mongoose), Socket.io for live updates
- **Integrations:** Gemini API for AI features, Razorpay, Nodemailer, Google OAuth 2.0, Passport

## Authentication

Sign-in is **Google exclusively** (email/password registration is restricted via API to ensure authenticity). 

In [Google Cloud Console](https://console.cloud.google.com/), create OAuth 2.0 credentials and set the redirect URI to match `GOOGLE_CALLBACK_URL` in your `server/.env`.
- Local Example: `http://localhost:8000/api/auth/google/callback`
- Production Example: `https://<YOUR-API-URL>/api/auth/google/callback`

After Google consent, the API issues a JWT token and redirects your browser to the client app where you will be securely authenticated.

## Run locally

**1. Server / API**
```bash
cd server
npm install
npm run dev
```
*(Runs by default on http://localhost:8000)*

**2. Client / Frontend**
```bash
cd client
npm install
npm run dev
```
*(Runs by default on http://localhost:5173)*

## Environment Setup

**Server (`server/.env`):**
Required keys: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `CLIENT_URL`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `GEMINI_API_KEY`. (An `.env.example` file is included in your source).

## Roles & Admin Access

- **CONSUMER** (Default): Buy energy credits on the marketplace. Can request producer access.
- **PRODUCER**: Can post carbon credits and energy bounds for sale, view seller analytics, and access the producer dashboard.
- **admin**: Has a full admin panel for blogs, transactions, users, and producer requests.

To grant an account test admin credentials locally, ensure your database connection is active and run:
```bash
cd server
npm run ensure-admin
```

## Demo Flow

1. **Sign In:** Use Google to sign in (default status: Consumer).
2. **Setup:** Request producer access via the "Become a Producer" prompt if you wish to sell. Use the server script to fast-track approvals or assign Admin roles. 
3. **Trade Elements:** Post a credit listing directly or explore the marketplace to securely purchase carbon offsets.
4. **Data Tools:** Dive into marketplace pricing insights and run the Carbon Calculator directly on the landing page!
