# Production Deployment Checklist

Complete checklist for deploying F1 Insight Hub to production with ML service.

## Pre-Deployment

### Code Quality ✅
- [x] **Linting passes**: `pnpm lint` (all packages)
- [x] **Type checking passes**: `pnpm typecheck` (all packages)
- [x] **Build succeeds**: `pnpm build` (all packages)
- [x] **No critical errors**: All tests pass (if applicable)

### Code Changes
- [x] **Fixed linting error**: Removed unused `ApiError` import from `sync-controller.ts`
- [x] **All changes committed**: Ready to push to `main` branch

---

## Deployment Steps

### Phase 1: Database Setup
- [ ] **PostgreSQL on Render**
  - [ ] Database created
  - [ ] Internal Database URL saved
  - [ ] Database accessible

### Phase 2: ML Service Deployment (NEW)
- [ ] **ML Service on Render**
  - [ ] Python Web Service created
  - [ ] Root Directory: `ml`
  - [ ] Build Command: `pip install -r requirements.txt`
  - [ ] Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - [ ] Environment Variables configured:
    - [ ] `DATABASE_URL` (Internal URL)
    - [ ] `FASTF1_CACHE_DIR=/opt/render/project/cache`
    - [ ] `ALLOWED_ORIGINS` (Backend URL)
    - [ ] `PORT=10000`
    - [ ] `LOG_LEVEL=INFO`
  - [ ] Health check: `/health` endpoint working
  - [ ] ML Service URL saved: `https://your-ml-service.onrender.com`
  - [ ] (Optional) Deploy Hook URL saved for GitHub Actions

### Phase 3: Backend Deployment
- [ ] **Backend on Render**
  - [ ] Web Service created
  - [ ] Root Directory: `backend`
  - [ ] Build Command: `cd backend && pnpm install && pnpm prisma generate && pnpm prisma migrate deploy && pnpm build`
  - [ ] Start Command: `cd backend && pnpm start`
  - [ ] Environment Variables configured:
    - [ ] `NODE_ENV=production`
    - [ ] `PORT=10000`
    - [ ] `DATABASE_URL` (Internal URL)
    - [ ] `CORS_ORIGIN` (Frontend URL - update after Phase 4)
    - [ ] `ERGAST_API_BASE_URL=https://ergast.com/api/f1`
    - [ ] `PYTHON_ML_SERVICE_URL` (ML Service URL from Phase 2)
  - [ ] Backend URL saved: `https://your-backend.onrender.com`
  - [ ] (Optional) Deploy Hook URL saved for GitHub Actions

### Phase 4: Frontend Deployment
- [ ] **Frontend on Vercel**
  - [ ] Project imported from GitHub
  - [ ] Root Directory: `frontend`
  - [ ] Environment Variables configured:
    - [ ] `NEXT_PUBLIC_API_URL` (Backend URL from Phase 3)
  - [ ] Frontend URL saved: `https://your-project.vercel.app`
  - [ ] CORS updated in Backend (Phase 3)

### Phase 5: GitHub Actions CI/CD
- [ ] **GitHub Secrets Configured**
  - [ ] `DATABASE_URL` (PostgreSQL connection string)
  - [ ] `RENDER_DEPLOY_HOOK_URL` (Backend - optional)
  - [ ] `RENDER_ML_SERVICE_DEPLOY_HOOK_URL` (ML Service - optional)
  - [ ] `VERCEL_TOKEN` (if using Vercel CLI deployment)
  - [ ] `VERCEL_ORG_ID` (if using Vercel CLI deployment)
  - [ ] `VERCEL_PROJECT_ID` (if using Vercel CLI deployment)

- [ ] **Workflow Tested**
  - [ ] Push to `main` branch
  - [ ] Verify workflow runs successfully
  - [ ] Check deployments on Render and Vercel

---

## Post-Deployment Verification

### ML Service
- [ ] **Health Check**: `curl https://your-ml-service.onrender.com/health`
  - Expected: `{"status": "healthy", "service": "f1-insight-ml-service", ...}`
- [ ] **Service Info**: `curl https://your-ml-service.onrender.com/api/sync/info`
- [ ] **Logs**: Check Render dashboard for any errors

### Backend
- [ ] **Health Check**: `curl https://your-backend.onrender.com/`
  - Expected: `{"success": true, "data": {"status": "OK"}, ...}`
- [ ] **API Docs**: Visit `https://your-backend.onrender.com/api-docs`
- [ ] **Driver Sync**: Test via frontend or API
  ```bash
  curl -X POST https://your-backend.onrender.com/api/v1/sync/drivers \
    -H "Content-Type: application/json" \
    -d '{"seasons": [2024]}'
  ```

### Frontend
- [ ] **Homepage loads**: Visit `https://your-project.vercel.app`
- [ ] **Drivers page**: Visit `/drivers` and verify starting grid displays
- [ ] **Sync button works**: Click "Sync from FastF1" and verify it works
- [ ] **No console errors**: Check browser DevTools
- [ ] **API calls succeed**: Check Network tab in DevTools

### Database
- [ ] **Drivers synced**: Verify drivers exist in database
- [ ] **Data integrity**: Check a few driver records manually

---

## Troubleshooting

### ML Service Issues
- **Service won't start**: Check build logs, verify `requirements.txt` exists
- **Database connection fails**: Verify `DATABASE_URL` uses Internal URL
- **CORS errors**: Update `ALLOWED_ORIGINS` to include backend URL

### Backend Issues
- **Can't connect to ML service**: Verify `PYTHON_ML_SERVICE_URL` is correct
- **Database errors**: Check `DATABASE_URL` and database status
- **CORS errors**: Update `CORS_ORIGIN` with frontend URL

### Frontend Issues
- **Can't connect to backend**: Verify `NEXT_PUBLIC_API_URL` is correct
- **Sync button doesn't work**: Check backend logs, verify ML service is accessible

---

## Quick Reference

**Service URLs:**
- ML Service: `https://your-ml-service.onrender.com`
- Backend: `https://your-backend.onrender.com`
- Frontend: `https://your-project.vercel.app`

**Key Endpoints:**
- ML Health: `GET /health`
- ML Sync: `POST /api/sync/drivers`
- Backend Health: `GET /`
- Backend Sync: `POST /api/v1/sync/drivers`

**Documentation:**
- [Complete Deployment Guide](./production-deployment.md)
- [ML Service Deployment](./ml-service-deployment.md)
- [GitHub Secrets Guide](./github-secrets-guide.md)

---

## Next Steps After Deployment

1. **Monitor logs** for first 24 hours
2. **Test all features** in production
3. **Set up alerts** (if available in your plan)
4. **Document any issues** encountered
5. **Share your deployed app!** 🎉

---

**Last Updated**: After ML service integration
**Status**: Ready for production deployment ✅
