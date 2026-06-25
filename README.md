# ApexFinance — Premium Personal Finance Tracker

A premium, highly responsive Personal Finance & Expense Tracking web application featuring a dual User/Admin role-based interface, dynamic CMS-controlled configuration, and local caching/persistence.

---

## ⚡ Quick Start: 1-Click Launch

Because you might not have Node.js or Python installed locally on your system yet, the application includes a **zero-dependency standalone preview page**:

1. Navigate to the project directory:
   `C:\ALL ANTI-GRAVITY PROJECTS\Expense website`
2. Double-click the `index.html` file to open the dashboard directly in any browser (Chrome, Edge, Firefox, Safari).
3. **No server, no installation, and no CORS issues!**

---

## 🔑 Demo Access Credentials

To test the role-based dashboard states:
* **Standard User Account:**
  * **Email:** `user@finance.com`
  * **Password:** `user123` *(Or click the fingerprint icon for a simulated Face ID/biometric login experience!)*
* **Admin CMS Account:**
  * **Email:** `admin@finance.com`
  * **Password:** `admin123`

---

## 🛠️ Modular React Compilation

Once you install **Node.js** on your system, you can transition to the modular compilation setup:

1. Open a terminal in the root directory:
   ```bash
   cd "C:\ALL ANTI-GRAVITY PROJECTS\Expense website"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the hot-reloading development server:
   ```bash
   npm run dev
   ```
4. Build the production package:
   ```bash
   npm run build
   ```

---

## 💾 Database Integration (Supabase/Postgres)

To move data out of local storage and onto a secure remote PostgreSQL database:

1. Create a project at [supabase.com](https://supabase.com).
2. Run the SQL schema script provided in your [implementation_plan.md](file:///C:/Users/PRAGATI%20%20GUPTA/.gemini/antigravity-ide/brain/d64b653e-f98b-4ff0-bcba-dfa4e47e327b/implementation_plan.md) inside the Supabase SQL Editor to initialize the tables (`profiles`, `transactions`, `categories`, `budgets`, `loans`, `cms_settings`).
3. Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. Uncomment the Supabase client block in `src/services/supabaseClient.js` to enable automatic real-time sync.

---

## 🚀 Live Hosting Deployment

To deploy this application to production:

* **Vercel CLI:**
  ```bash
  npm i -g vercel
  vercel
  ```
* **Netlify CLI:**
  ```bash
  npm i -g netlify-cli
  netlify deploy --prod
  ```