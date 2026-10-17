# SMS Finance Service - Production Deployment & Client Delivery Guide

This guide provides step-by-step instructions to deploy the decoupled full-stack **SMS Finance Service** application (Spring Boot 3 backend + React Vite frontend) to cloud hosting platforms (e.g., Render / Railway + Vercel) and verify everything before handing live URLs over to clients.

---

## 1. System Architecture Overview

```mermaid
flowchart LR
    ClientBrowser[Client Browser / Desktop / Mobile]
    VercelEdge[Vercel Edge / CDN\nReact SPA]
    RenderBackend[Render / Railway Container\nSpring Boot 3 Docker]
    PostgresDB[(Managed PostgreSQL\nNeon / Supabase / Render)]

    ClientBrowser -->|HTTPS Requests| VercelEdge
    ClientBrowser -->|REST API /api/* & /uploads/*| RenderBackend
    RenderBackend -->|JDBC / SSL Connection| PostgresDB
```

---

## 2. Step 1: Push Code to Git (GitHub or GitLab)

Open PowerShell in the project root (`d:\Service\Finance service`) and execute:

```powershell
# Set git path if not in system environment
$env:PATH = "C:\Program Files\Git\cmd;$env:PATH"

# Check status
git status

# Add your remote repository (replace with your actual GitHub / GitLab repo URL)
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
# Or if origin already exists:
# git remote set-url origin https://github.com/<your-username>/<your-repo-name>.git

# Rename branch to main and push
git branch -M main
git push -u origin main
```

---

## 3. Step 2: Deploy Backend to Render (or Railway)

### Option A: Render.com (Recommended Free/Budget Tier)
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository (`SMS Finance Service`).
4. Set the following settings:
   - **Name**: `sms-finance-api`
   - **Region**: Choose closest to your clients (e.g., *Singapore*, *Frankfurt*, or *Ohio*)
   - **Root Directory**: `backend`
   - **Environment**: **Docker** (Render will automatically detect `backend/Dockerfile`)
   - **Branch**: `main`
   - **Health Check Path**: `/api/health`
5. Under **Environment Variables**, add:
   | Key | Value | Description |
   |---|---|---|
   | `PORT` | `8080` | Container web port |
   | `SPRING_PROFILES_ACTIVE` | `prod` | Activates production profile |
   | `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` (or `*` during initial setup) | Allowed frontend domains |
   | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://<db-host>:5432/<db-name>` | PostgreSQL JDBC URL (or use Render PostgreSQL) |
   | `SPRING_DATASOURCE_USERNAME` | `<db-user>` | PostgreSQL username |
   | `SPRING_DATASOURCE_PASSWORD` | `<db-password>` | PostgreSQL password |
6. Click **Create Web Service**.
7. Once deployed, copy your live backend URL (e.g. `https://sms-finance-api.onrender.com`).

---

## 4. Step 3: Deploy Frontend to Vercel

1. Log in to [Vercel](https://vercel.com) with GitHub.
2. Click **Add New...** → **Project**.
3. Select your `SMS Finance Service` repository.
4. In the Project Configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`frontend`**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:
   | Key | Value | Description |
   |---|---|---|
   | `VITE_API_BASE_URL` | `https://sms-finance-api.onrender.com/api` | Your live backend API URL with `/api` |
6. Click **Deploy**.
7. Copy your live frontend URL (e.g., `https://sms-finance-service.vercel.app`).

---

## 5. Step 4: Link Frontend and Backend (CORS Alignment)

To prevent Cross-Origin Resource Sharing (CORS) blocks:
1. Go back to your backend hosting (Render / Railway dashboard).
2. Update the environment variable:
   ```env
   CORS_ALLOWED_ORIGINS=https://sms-finance-service.vercel.app
   ```
3. Trigger a redeploy or restart the backend service.

---

## 6. Step 5: Verification & Client Acceptance Checklist

Before handing the live URL over to the client, perform this quick 5-point verification:

| Checkpoint | Test Action | Expected Result | Pass/Fail |
|---|---|---|---|
| **1. Liveness Probe** | Open `https://<backend-url>/api/health` in browser | Returns `{"status":"UP","service":"SMS Finance Service",...}` | [ ] |
| **2. SPA Page Reload** | In frontend, click around tabs then press browser **Refresh (F5)** | Page reloads without 404 (handled by `vercel.json` rewrites) | [ ] |
| **3. Live Data Fetch** | Open Frontend Dashboard | Customer and loan metrics load cleanly without network errors | [ ] |
| **4. Loan Creation Wizard** | Create a test borrower and loan with interest calculation | Loan appears in the table with accurate interest & principal breakdown | [ ] |
| **5. Collateral Upload & View** | Upload a test document/photo for collateral and click *View Document* | Modal previews the image/PDF seamlessly | [ ] |

---

## 7. Client Handover Template

Copy and send this message to the client once verified:

```text
Hi [Client Name],

The SMS Finance Service fullstack management platform is live and ready for testing!

🔗 Web Portal: https://sms-finance-service.vercel.app
🔗 Backend API Health: https://sms-finance-api.onrender.com/api/health

Credentials & access guidelines are attached. Let us know if you have any questions or feedback.

Best regards,
DevOps & Engineering Team
```
