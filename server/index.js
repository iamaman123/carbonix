/**
 * Vercel entry: default export must be the Express app (see Vercel “Express on Vercel”).
 * MongoDB on Vercel: src/app.js connects on first request when VERCEL is set.
 * Local dev: `npm run dev` → local.js (connect + listen + Socket.IO).
 */
import app from "./src/app.js";

export default app;
