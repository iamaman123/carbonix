# 🏆 Devfolio/Hackathon Submission Form: Carbonix

*Copy and paste the sections below directly into your hackathon submission page!*

---

### **Project Name**
Carbonix

### **Elevator Pitch (Tagline)**
A peer-to-peer carbon credit trading platform empowering renewable energy producers to sell directly to buyers—eliminating brokers and accelerating Net Zero.

---

## 📖 Project Story: About the Project
*(Copy this entire markdown section into the "About the Project" text box.)*

## Inspiration
With India's aggressive pledge to reach Net Zero by 2070 and the recent implementation of the **Carbon Credit Trading Scheme (CCTS) 2023**, the demand for verifiable carbon offsetting has skyrocketed. However, we noticed a massive flaw in the current market: it is deeply monopolized by brokers. Middlemen take anywhere from a 20% to 40% cut of carbon credit sales, hurting sustainable producers and inflating costs for buyers. 

We were inspired to build **Carbonix**: a platform that democratizes the energy market by cutting out the gatekeepers and creating a transparent, peer-to-peer (P2P) bridge directly between verified renewable energy producers and conscious consumers.

## What it does
Carbonix is an end-to-end P2P trading ecosystem with three distinct, role-based workflows:
1. **Consumers (Buyers):** Log in seamlessly via Google OAuth to browse verified energy credits (backed by Verra, Gold Standard, ACR). They can view dynamic market analytics, calculate their carbon footprint, and confidently purchase credits using our integrated real-time **Razorpay** checkout system. 
2. **Producers (Sellers):** Consumers can upgrade their accounts by submitting a seller proposal. Once approved, Producers get access to advanced dashboards to list their energy generation, track real-time revenue, and utilize **Gemini AI Market Insights** to dynamically auto-price their credits competitively based on market demand.
3. **Administrators:** A secure oversight portal to manage producers, verify certifications, monitor platform-wide analytics, and ensure a fraud-free environment.

## How we built it
We engineered Carbonix to be robust, secure, and beautiful.
- **Frontend architecture:** React 19 bootstrapped with Vite for blindingly fast HMR. We designed the highly responsive UI using Tailwind CSS, Framer Motion for micro-animations, and Radix UI primitives for complete accessibility. We also integrated an interactive 3D WebGL globe to map global carbon registries.
- **Backend architecture:** Node.js and Express powering a secure REST API. Data is persistently stored using MongoDB (Mongoose).
- **Core Integrations:** We implemented strict Google OAuth 2.0 for security, **Razorpay** for frictionless transaction settlement, and **Socket.io** for real-time frontend updates. 
- **AI Integration:** We leveraged the **Google Gemini API** to power both our 24/7 intelligent platform assistant and our contextual, real-time market pricing engine.

## Challenges we ran into
Building a financial-grade marketplace within a hackathon timeframe was incredibly demanding. 
1. **Complex Multi-Role State Management:** Transitioning a user dynamically from a "Consumer" to an approved "Producer" required strict JWT token invalidation, complex middleware routing, and deep MongoDB aggregation pipelines to ensure sellers couldn't spoof buyer environments and vice versa.
2. **AI Context Window Tunneling:** Making our Gemini integration "smart" required feeding it live marketplace data. We had to build a specialized proxy cache that safely injected live database metrics into Gemini's context window without risking prompt-injection or lagging the UI. 
3. **Payment Integrity:** Integrating Razorpay required flawless webhook handling to ensure internet outages didn't result in paid users receiving zero carbon credits on their dashboards.

## Accomplishments that we're proud of
We are incredibly proud of successfully bypassing the "broker" problem. We built a system where a solar farm in Rajasthan can literally sell pure, certified carbon offsets to a tech startup in Bangalore in under *3 clicks*. We are also extremely proud of the platform's UI/UX—it looks like a premium, enterprise-grade application ready for deployment.

## What we learned
We gained an immense appreciation for the regulatory side of renewable energy (understanding Verra vs. Gold Standard markets). Technically, we mastered complex React router protections, Razorpay webhook validation, and prompt-engineering for LLMs in live financial contexts.

## What's next for Carbonix
Our immediate next steps include migrating the receipt and ownership registry to a scalable Layer-2 Blockchain (like Polygon) to guarantee public, cryptographic immutability of carbon offsets so they can never be "double-spent." We also plan to build an onboarding flow for massive enterprise-scale suppliers.

---

### **Built With (Tags/Checkboxes)**
React
Node.Js
Express
MongoDB
Vite
Tailwind CSS
Framer Motion
Google OAuth

---

## 📋 Additional Info (For Judges only)

**How does your project create environmental impact?**
Carbonix cuts out brokers taking 40% cuts, allowing renewable producers to keep 100% of revenue. This financial boost accelerates solar/wind expansion, reducing fossil-fuel reliance and helping India reach Net Zero while making offsetting affordable.

**What technologies did you use?**
Built with MERN (MongoDB, Express, Node). UI uses Tailwind and Framer Motion. We integrated Google OAuth for secure role-based access, Razorpay for real-time checkout simulation, and specialized algorithms for live market analytics and data fetching.

**What challenges did you face?**
Securing multi-role accounts (Buyers & Sellers). We wrote rigorous backend validation and complex MongoDB schemas to prevent credit double-spending, stop self-purchasing, and strictly segment API access to ensure a fraud-proof P2P trading ecosystem.
