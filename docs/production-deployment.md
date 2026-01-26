# Production Deployment Guide

Complete step-by-step guide for deploying F1 Insight Hub to production.

## Overview

This guide covers deploying:
- **Database**: PostgreSQL on Render
- **Backend API**: Node.js/Express on Render
- **Frontend**: Next.js on Vercel

All services use free tiers where possible.

---

## Step 1: Register Accounts

### 1.1 Render Account (Backend + Database)

1. Go to [render.com](https://render.com)
2. Sign up for a free account (GitHub OAuth recommended)
3. Verify your email address

**Free Tier Limits:**
- Services spin down after 15 minutes of inactivity
- 750 hours/month free (enough for always-on services)
- PostgreSQL: 90 days free trial, then $7/month (or use Railway free tier)

### 1.2 Vercel Account (Frontend)

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended for easy integration)
3. Import your GitHub repository

**Free Tier (Hobby Plan):**
- Unlimited deployments
- Automatic HTTPS
- Global CDN
- Perfect for personal projects

### 1.3 GitHub Repository

Ensure your code is pushed to GitHub:
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

---

## Step 2: Set Up PostgreSQL Database on Render

### 2.1 Create PostgreSQL Database

1. **Go to Render Dashboard**
   - Click **New +** → **PostgreSQL**

2. **Configure Database:**
   - **Name**: `f1-insight-hub-db` (or your preferred name)
   - **Database**: `f1_insight_hub` (or your preferred name)
   - **User**: Auto-generated (or custom)
   - **Region**: Choose closest to your users
   - **PostgreSQL Version**: Latest stable (15+)
   - **Plan**: Free (90 days) or Starter ($7/month)

3. **Click "Create Database"**

4. **Wait for Database to be Ready**
   - Status will show "Available" when ready
   - This takes 2-3 minutes

### 2.2 Get Database Connection String

1. **In Render Dashboard**, click on your database
2. **Copy the "Internal Database URL"** (for Render services)
3. **Also copy "External Database URL"** (for local development/testing)

**Connection String Format:**
```
postgresql://user:password@hostname:5432/database_name
```

**Important:** Save this connection string securely - you'll need it for:
- Backend environment variables
- GitHub Actions secrets
- Local development

---

## Step 3: Deploy ML Service on Render (Optional but Recommended)

> **Note:** If you're using FastF1 data synchronization, deploy the ML service before the backend.

See **[ML Service Deployment Guide](./ml-service-deployment.md)** for complete instructions.

**Quick Summary:**
1. Create Python Web Service on Render
2. Root Directory: `ml`
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Environment Variables:
   - `DATABASE_URL` (Internal URL)
   - `FASTF1_CACHE_DIR=/opt/render/project/cache`
   - `ALLOWED_ORIGINS` (Backend URL)

**Save the ML service URL** (e.g., `https://f1-insight-ml-service.onrender.com`) for backend configuration.

---

## Step 4: Deploy Backend API on Render

### 4.1 Create Web Service

1. **In Render Dashboard**
   - Click **New +** → **Web Service**
   - **Connect your GitHub repository**
   - Select your `f1-insight-hub` repository

2. **Configure Service:**
   - **Name**: `f1-insight-hub-api` (or your preferred name)
   - **Region**: Same as database (for lower latency)
   - **Branch**: `main`
   - **Root Directory**: Leave empty (or `backend` if needed)
   - **Runtime**: `Node`
   - **Build Command**: 
     ```bash
     cd backend && pnpm install && pnpm prisma generate && pnpm prisma migrate deploy && pnpm build
     ```
   - **Start Command**: 
     ```bash
     cd backend && pnpm start
     ```
   - **Plan**: Free (spins down after inactivity) or Starter ($7/month for always-on)

3. **Environment Variables** (click "Advanced" → "Add Environment Variable"):
   
   Add these variables:
   
   | Variable Name | Value | Notes |
   |--------------|-------|-------|
   | `NODE_ENV` | `production` | |
   | `PORT` | `10000` | Render assigns port via `$PORT` |
   | `DATABASE_URL` | `[Internal Database URL from Step 2.2]` | Use **Internal** URL |
   | `CORS_ORIGIN` | `https://your-frontend.vercel.app` | Update after frontend deployment |
   | `ERGAST_API_BASE_URL` | `https://ergast.com/api/f1` | |
   | `PYTHON_ML_SERVICE_URL` | `https://your-ml-service.onrender.com` | ML service URL (if deployed) |
   | `OPENAI_API_KEY` | `[Your OpenAI API key]` | Optional, for Phase 3 AI features |

   **Important Notes:**
   - Use **Internal Database URL** (starts with `postgres://`) for `DATABASE_URL`
   - `CORS_ORIGIN` will be your Vercel frontend URL (update after Step 4)
   - `PORT` should be `10000` or use `$PORT` (Render auto-assigns)

4. **Click "Create Web Service"**

5. **Wait for Deployment**
   - First deployment takes 5-10 minutes
   - Watch the build logs for any errors
   - Service URL will be: `https://your-service-name.onrender.com`

### 4.2 Get Service ID for GitHub Actions

1. **In Render Dashboard**, click on your web service
2. **Go to Settings** tab
3. **Copy the "Service ID"** (you'll need this for GitHub secrets)

### 4.3 Get Render API Key

1. **In Render Dashboard**, click your profile icon (top right)
2. **Go to Account Settings** → **API Keys**
3. **Click "Create API Key"**
4. **Name it**: `github-actions` (or similar)
5. **Copy the API key** (save securely - you can't view it again)

---

## Step 5: Deploy Frontend on Vercel

### 5.1 Import Project

1. **Go to [vercel.com/dashboard](https://vercel.com/dashboard)**
2. **Click "Add New..."** → **Project**
3. **Import your GitHub repository**
   - Select `f1-insight-hub` repository
   - Click **Import**

### 5.2 Configure Project

1. **Project Settings:**
   - **Project Name**: `f1-insight-hub` (or your preferred name)
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend` (important!)
   - **Build Command**: `cd ../.. && pnpm build --filter=frontend` or `pnpm build` (if in root)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `pnpm install` (or leave default)

2. **Environment Variables** (click "Environment Variables"):
   
   Add this variable:
   
   | Variable Name | Value | Environment |
   |--------------|-------|-------------|
   | `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com` | Production, Preview, Development |

   **Important:**
   - Replace `your-backend.onrender.com` with your actual Render backend URL
   - Use `NEXT_PUBLIC_` prefix (required for client-side access)
   - Add to all environments (Production, Preview, Development)

3. **Click "Deploy"**

4. **Wait for Deployment**
   - First deployment takes 3-5 minutes
   - Vercel will build and deploy automatically
   - Your site will be at: `https://your-project.vercel.app`

### 5.3 Get Vercel IDs for GitHub Actions

1. **In Vercel Dashboard**, go to your project
2. **Go to Settings** → **General**
   - **Project ID**: Copy this (you'll need it)
3. **Go to Settings** → **Team** (or your profile)
   - **Team/Org ID**: Copy this (you'll need it)
4. **Go to Settings** → **Tokens**
   - **Create Token**: Name it `github-actions`
   - **Copy the token** (save securely - you can't view it again)

### 5.4 Update Backend CORS

1. **Go back to Render Dashboard**
2. **Edit your backend service**
3. **Update Environment Variable:**
   - `CORS_ORIGIN`: Change to your Vercel URL: `https://your-project.vercel.app`
4. **Save and Redeploy** (or it will auto-redeploy)

---

## Step 6: Configure GitHub Actions Secrets

### 6.1 Add Secrets to GitHub

1. **Go to your GitHub repository**
2. **Settings** → **Secrets and variables** → **Actions**
3. **Click "New repository secret"**

4. **Add these 6 secrets:**

   | Secret Name | Value | Where to Find |
   |------------|-------|---------------|
   | `RENDER_SERVICE_ID` | Your Render web service ID | Render Dashboard → Service → Settings |
   | `RENDER_API_KEY` | Your Render API key | Render Dashboard → Account → API Keys |
   | `DATABASE_URL` | Your database connection string | Render Dashboard → Database → Internal URL |
   | `VERCEL_TOKEN` | Your Vercel token | Vercel Dashboard → Settings → Tokens |
   | `VERCEL_ORG_ID` | Your Vercel org/team ID | Vercel Dashboard → Settings → Team |
   | `VERCEL_PROJECT_ID` | Your Vercel project ID | Vercel Dashboard → Project → Settings → General |

5. **Save each secret**

### 6.2 Test GitHub Actions

1. **Make a small change** (e.g., update README)
2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Test CI/CD pipeline"
   git push origin main
   ```
3. **Go to GitHub** → **Actions** tab
4. **Watch the workflow run**
5. **Verify deployments** on Render and Vercel dashboards

---

## Step 7: Verify Production Deployment

### 7.1 Test Backend API

1. **Check Swagger Documentation:**
   - Visit: `https://your-backend.onrender.com/api-docs`
   - Should show Swagger UI with all endpoints

2. **Test an Endpoint:**
   ```bash
   curl https://your-backend.onrender.com/api/v1/races/current/schedule
   ```
   - Should return JSON response

3. **Check Health:**
   ```bash
   curl https://your-backend.onrender.com/
   ```
   - Should return: `{"success": true, "data": {"status": "OK"}, ...}`

### 7.2 Test Frontend

1. **Visit your Vercel URL:**
   - `https://your-project.vercel.app`

2. **Test Pages:**
   - Home page loads
   - Navigate to `/drivers`, `/schedule`, `/circuits`
   - Check that API calls work (open browser DevTools → Network tab)

3. **Check for Errors:**
   - Open browser console (F12)
   - Look for any API errors or CORS issues

### 7.3 Common Issues

**CORS Errors (e.g. "Cross-Origin Request Blocked"):**
- Update `CORS_ORIGIN` in Render to your Vercel URL: `https://f1-insights-hub-frontend.vercel.app`
- Use no trailing slash. Comma-separated for multiple origins: `http://localhost:3000,https://f1-insights-hub-frontend.vercel.app`
- Redeploy the backend after changing env vars

**Database Connection Errors:**
- Verify `DATABASE_URL` uses Internal URL (not External)
- Check database is running in Render dashboard

**API Not Responding:**
- Check Render service logs
- Verify service didn't spin down (free tier)
- Check environment variables are set correctly

**Frontend Can't Connect to Backend:**
- Verify `NEXT_PUBLIC_API_URL` in Vercel matches Render URL
- Check browser console for errors
- Verify CORS is configured correctly

---

## Step 8: Configure Custom Domains (Optional)

### 8.1 Backend Custom Domain (Render)

1. **In Render Dashboard**, go to your service
2. **Settings** → **Custom Domains**
3. **Add your domain** (e.g., `api.yourdomain.com`)
4. **Follow DNS configuration instructions**
5. **Update `CORS_ORIGIN`** to include new domain

### 8.2 Frontend Custom Domain (Vercel)

1. **In Vercel Dashboard**, go to your project
2. **Settings** → **Domains**
3. **Add your domain** (e.g., `yourdomain.com`)
4. **Follow DNS configuration instructions**
5. **Update `NEXT_PUBLIC_API_URL`** if backend domain changed

---

## Step 9: Monitor and Maintain

### 9.1 Set Up Monitoring

**Render:**
- Check service logs regularly
- Set up email alerts for service failures
- Monitor database usage

**Vercel:**
- Check deployment logs
- Monitor analytics (if enabled)
- Set up deployment notifications

### 9.2 Database Maintenance

1. **Regular Backups:**
   - Render PostgreSQL: Automatic daily backups (Starter plan+)
   - Free tier: Manual backups via `pg_dump`

2. **Monitor Database Size:**
   - Render Dashboard → Database → Metrics
   - Free tier: 1GB limit

### 9.3 Cost Management

**Free Tier Limits:**
- **Render**: Services spin down after 15 min inactivity
- **Vercel**: Unlimited (Hobby plan)
- **Render PostgreSQL**: 90 days free, then $7/month

**Upgrade Options:**
- **Render Starter**: $7/month (always-on services)
- **Render PostgreSQL**: $7/month (after free trial)

---

## Quick Reference Checklist

- [ ] Render account created
- [ ] Vercel account created
- [ ] GitHub repository pushed
- [ ] PostgreSQL database created on Render
- [ ] Database connection string saved
- [ ] Backend web service created on Render
- [ ] Backend environment variables configured
- [ ] Backend deployed and accessible
- [ ] Render Service ID and API key saved
- [ ] Frontend project imported to Vercel
- [ ] Frontend environment variables configured
- [ ] Frontend deployed and accessible
- [ ] Vercel IDs and token saved
- [ ] GitHub Actions secrets configured
- [ ] CI/CD pipeline tested
- [ ] CORS updated with frontend URL
- [ ] All endpoints tested
- [ ] Frontend tested and working

---

## Support and Troubleshooting

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **GitHub Actions**: Check Actions tab for detailed logs
- **Project Issues**: Check `docs/ci-cd-setup.md` for CI/CD troubleshooting

---

## Next Steps

After successful deployment:

1. **Set up monitoring** and alerts
2. **Configure custom domains** (if desired)
3. **Set up database backups**
4. **Test all features** in production
5. **Share your deployed app!** 🎉
