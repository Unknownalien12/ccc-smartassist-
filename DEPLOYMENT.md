# Deployment Guide for CCC SmartAssist

This project is structured as a Vite (React) frontend and a PHP backend. For production, we recommend:
- **Frontend**: [Vercel](https://vercel.com/)
- **Backend & Database**: [Railway](https://railway.app/)

## 1. Backend & Database (Railway)

### Step A: Database Setup
1. Log in to [Railway](https://railway.app/).
2. Click **New Project** > **Provision MySQL**.
3. Once the database is ready, go to the **Data** tab.
4. Click **Import SQL** and upload `backend/database with data ready to use.sql`.

### Step B: PHP Backend Setup
1. Connect your GitHub repository to Railway.
2. Add a new service from your repository.
3. Set the **Root Directory** to `backend`.
    - *Alternatively, if you want to host the whole repo, you can set the start command to run a PHP server.*
4. In the **Variables** tab, add the following (connecting them to your MySQL service):
   - `MYSQLHOST`: `${{MySQL API Host}}`
   - `MYSQLPORT`: `${{MySQL API Port}}`
   - `MYSQLUSER`: `${{MySQL API User}}`
   - `MYSQLPASSWORD`: `${{MySQL API Password}}`
   - `MYSQLDATABASE`: `${{MySQL API Database}}`
   - `ALLOWED_ORIGIN`: `https://your-vercel-domain.vercel.app` (Add this later after Vercel setup)

## 2. Frontend (Vercel)

### Step A: Preparation
1. Ensure your code is pushed to a GitHub repository.

### Step B: Vercel Setup
1. Go to [Vercel](https://vercel.com/) and click **Add New** > **Project**.
2. Import your repository.
3. In **Build & Development Settings**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://your-railway-backend-url.railway.app` (Get this from Railway's Public Domain)
5. Click **Deploy**.

## 3. Post-Deployment
- Once Vercel gives you a URL (e.g., `ccc-smartassist.vercel.app`), go back to Railway and update `ALLOWED_ORIGIN` to that URL for security.

## Summary of Changes Made
1. **`backend/db.php`**: Updated to use environment variables for database connection (compatible with Railway).
2. **`services/apiService.ts`**: Updated to use `VITE_API_URL` environment variable for the backend endpoint.
3. **`package.json`**: Fixed build scripts to be cross-platform (works on Vercel/Linux).
