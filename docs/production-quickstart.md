# Production Deployment Quick Start

Quick reference checklist for deploying to production.

## 🚀 Services to Register

1. **Render** - [render.com](https://render.com)
   - Free account (GitHub OAuth)
   - For: PostgreSQL database + Backend API

2. **Vercel** - [vercel.com](https://vercel.com)
   - Free account (GitHub OAuth)
   - For: Frontend (Next.js)

3. **GitHub** - Already have this! ✅
   - For: Code repository + CI/CD

---

## 📋 Deployment Checklist

### Phase 1: Database Setup (5 minutes)

- [ ] **Create PostgreSQL on Render**
  - Dashboard → New + → PostgreSQL
  - Name: `f1-insight-hub-db`
  - Plan: Free (90 days) or Starter ($7/month)
  - **Save Internal Database URL** (you'll need this!)

### Phase 2: Backend Setup (10 minutes)

- [ ] **Create Web Service on Render**
  - Dashboard → New + → Web Service
  - Connect GitHub repository
  - Name: `f1-insight-hub-api`
  - Root Directory: `backend` (if needed)
  
- [ ] **Configure Build Command:**
  ```bash
  cd backend && pnpm install && pnpm prisma generate && pnpm prisma migrate deploy && pnpm build
  ```

- [ ] **Configure Start Command:**
  ```bash
  cd backend && pnpm start
  ```

- [ ] **Add Environment Variables:**
  - `NODE_ENV` = `production`
  - `PORT` = `10000`
  - `DATABASE_URL` = `[Internal Database URL from Phase 1]`
  - `CORS_ORIGIN` = `https://your-frontend.vercel.app` (update after Phase 3)
  - `ERGAST_API_BASE_URL` = `https://ergast.com/api/f1`

- [ ] **Save Service ID and API Key**
  - Settings → Service ID (copy)
  - Account → API Keys → Create new (copy)

### Phase 3: Frontend Setup (5 minutes)

- [ ] **Import Project to Vercel**
  - Dashboard → Add New → Project
  - Import GitHub repository
  - Root Directory: `frontend`

- [ ] **Add Environment Variable:**
  - `NEXT_PUBLIC_API_URL` = `https://your-backend.onrender.com`
  - (Replace with your actual Render backend URL)

- [ ] **Deploy**
  - Click "Deploy"
  - Wait for build to complete
  - **Copy your Vercel URL**

- [ ] **Save Vercel IDs**
  - Settings → General → Project ID (copy)
  - Settings → Team → Team ID (copy)
  - Settings → Tokens → Create token (copy)

- [ ] **Update Backend CORS**
  - Go back to Render
  - Update `CORS_ORIGIN` = `[Your Vercel URL]`
  - Save (auto-redeploys)

### Phase 4: GitHub Actions Setup (5 minutes)

- [ ] **Add GitHub Secrets**
  - Repository → Settings → Secrets and variables → Actions
  - Add all 6 secrets:
    - `RENDER_SERVICE_ID`
    - `RENDER_API_KEY`
    - `DATABASE_URL`
    - `VERCEL_TOKEN`
    - `VERCEL_ORG_ID`
    - `VERCEL_PROJECT_ID`

- [ ] **Test CI/CD**
  - Make a small commit
  - Push to `main`
  - Check Actions tab
  - Verify deployments

---

## 🔑 Required Information Checklist

Before starting, have ready:

- [ ] GitHub repository URL
- [ ] Email for Render account
- [ ] Email for Vercel account
- [ ] (Optional) OpenAI API key (for Phase 3 AI features)

After deployment, save:

- [ ] Render Database Internal URL
- [ ] Render Service ID
- [ ] Render API Key
- [ ] Backend URL: `https://your-service.onrender.com`
- [ ] Vercel Project ID
- [ ] Vercel Org ID
- [ ] Vercel Token
- [ ] Frontend URL: `https://your-project.vercel.app`

---

## ⚡ Quick Commands Reference

### Test Backend
```bash
curl https://your-backend.onrender.com/api/v1/races/current/schedule
```

### Test Frontend
```bash
# Just visit in browser:
https://your-project.vercel.app
```

### Check Swagger Docs
```bash
# Visit in browser:
https://your-backend.onrender.com/api-docs
```

---

## 🆘 Common Issues

**"Service not found"**
- Check Render service is running
- Free tier services spin down after 15 min inactivity

**"CORS error"**
- Verify `CORS_ORIGIN` in Render matches Vercel URL exactly
- Include `https://` and no trailing slash

**"Database connection failed"**
- Use Internal Database URL (not External)
- Check database is running in Render dashboard

**"Frontend can't connect to backend"**
- Verify `NEXT_PUBLIC_API_URL` in Vercel
- Check backend is accessible: `curl https://your-backend.onrender.com`

---

## 📚 Full Documentation

For detailed step-by-step instructions, see:
- [Complete Production Deployment Guide](./production-deployment.md)
- [CI/CD Setup Guide](./ci-cd-setup.md)
- [GitHub Secrets Guide](./github-secrets-guide.md)

---

## ✅ Final Verification

After deployment, verify:

- [ ] Backend API responds: `curl https://your-backend.onrender.com`
- [ ] Swagger docs accessible: `https://your-backend.onrender.com/api-docs`
- [ ] Frontend loads: Visit Vercel URL
- [ ] Frontend can call backend: Check browser DevTools → Network
- [ ] Database migrations ran: Check Render build logs
- [ ] GitHub Actions workflow runs: Check Actions tab

**🎉 You're live!**
