# ML Service Production Deployment Guide

Complete guide for deploying the F1 Insight Hub ML service (Python/FastAPI) to Render.

## Overview

The ML service handles:
- FastF1 data synchronization
- Driver data fetching and storage
- Future ML model inference endpoints

**Deployment Target:** Render (Python Web Service)

---

## Prerequisites

Before deploying the ML service, ensure you have:

1. ✅ **PostgreSQL database** already deployed on Render (from main deployment guide)
2. ✅ **Backend API** deployed on Render (or ready to deploy)
3. ✅ **GitHub repository** with ML service code pushed to `main` branch

---

## Step 1: Deploy ML Service on Render

### 1.1 Create Web Service

1. **Go to Render Dashboard**
   - Click **New +** → **Web Service**
   - **Connect your GitHub repository** (if not already connected)
   - Select your `f1-insight-hub` repository

2. **Configure Service:**
   - **Name**: `f1-insight-ml-service` (or your preferred name)
   - **Region**: Same as database and backend (for lower latency)
   - **Branch**: `main`
   - **Root Directory**: `ml` (important!)
   - **Runtime**: `Python 3`
   - **Build Command**: 
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command**: 
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Plan**: Free (spins down after inactivity) or Starter ($7/month for always-on)

### 1.2 Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `DATABASE_URL` | `[Internal Database URL]` | Use **Internal** URL from your PostgreSQL service (same as backend) |
| `FASTF1_CACHE_DIR` | `/opt/render/project/cache` | Persistent cache directory on Render |
| `PORT` | `10000` | Render auto-assigns via `$PORT`, but set default |
| `LOG_LEVEL` | `INFO` | Logging level |
| `ALLOWED_ORIGINS` | `https://your-backend.onrender.com` | Backend API URL (update after backend deployment) |

**Important Notes:**
- Use **Internal Database URL** (starts with `postgres://`) for `DATABASE_URL`
- `ALLOWED_ORIGINS` should match your backend API URL
- `FASTF1_CACHE_DIR` uses Render's persistent storage

### 1.3 Health Check Configuration

- **Health Check Path**: `/health`
- Render will automatically check this endpoint

### 1.4 Create Web Service

Click **"Create Web Service"** and wait for deployment (2-5 minutes).

**Save the service URL** (e.g., `https://f1-insight-ml-service.onrender.com`) - you'll need it for the backend configuration.

---

## Step 2: Update Backend Configuration

After the ML service is deployed, update your backend to use the production ML service URL.

### 2.1 Update Backend Environment Variables on Render

1. **Go to your Backend Service on Render**
2. **Navigate to Environment Variables**
3. **Add/Update:**
   - `PYTHON_ML_SERVICE_URL` = `https://f1-insight-ml-service.onrender.com`
     - Replace with your actual ML service URL

### 2.2 Verify Backend Connection

The backend should now call the ML service at:
```
POST https://your-ml-service.onrender.com/api/sync/drivers
```

---

## Step 3: Test Deployment

### 3.1 Test Health Check

```bash
curl https://your-ml-service.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "f1-insight-ml-service",
  "version": "1.0.0"
}
```

### 3.2 Test Driver Sync (via Backend)

```bash
curl -X POST https://your-backend.onrender.com/api/v1/sync/drivers \
  -H "Content-Type: application/json" \
  -d '{"seasons": [2024]}'
```

Expected response:
```json
{
  "success": true,
  "message": "Synced X drivers",
  "drivers_synced": 25
}
```

### 3.3 Verify Database

Check that drivers were inserted into your PostgreSQL database:
- Use Render's PostgreSQL dashboard → Connect → Query tool
- Or use Prisma Studio: `cd backend && pnpm prisma studio`

---

## Step 4: Update Frontend (if needed)

If your frontend needs to know the ML service URL (unlikely, as it goes through backend), add:

**Vercel Environment Variable:**
- `NEXT_PUBLIC_ML_SERVICE_URL` = `https://your-ml-service.onrender.com` (optional)

**Note:** The frontend typically doesn't need direct access to the ML service - it goes through the backend API.

---

## Troubleshooting

### Issue: ML Service fails to start

**Symptoms:** Service shows "Failed" status in Render dashboard

**Solutions:**
1. Check build logs in Render dashboard
2. Verify `requirements.txt` is in `ml/` directory
3. Ensure Python version matches (3.11+)
4. Check that `app/main.py` exists and is correct

### Issue: Database connection errors

**Symptoms:** `psycopg2.errors` in logs

**Solutions:**
1. Verify `DATABASE_URL` uses **Internal Database URL** (not External)
2. Ensure database is in same region as ML service
3. Check database credentials are correct

### Issue: CORS errors when backend calls ML service

**Symptoms:** `CORS policy` errors in backend logs

**Solutions:**
1. Update `ALLOWED_ORIGINS` in ML service to include backend URL
2. Format: `https://your-backend.onrender.com` (no trailing slash)
3. Restart ML service after updating environment variables

### Issue: FastF1 cache directory errors

**Symptoms:** Permission errors or cache not persisting

**Solutions:**
1. Ensure `FASTF1_CACHE_DIR` is set to `/opt/render/project/cache`
2. Render's persistent storage is at `/opt/render/project/`
3. Cache directory is created automatically by the app

### Issue: Service spins down (Free tier)

**Symptoms:** First request after inactivity is slow (cold start)

**Solutions:**
1. This is normal for Render's free tier
2. First request may take 30-60 seconds
3. Consider upgrading to Starter plan ($7/month) for always-on service
4. Or set up a cron job to ping the health endpoint every 10 minutes

---

## Monitoring

### Render Dashboard

Monitor your ML service:
- **Logs**: View real-time logs in Render dashboard
- **Metrics**: CPU, Memory, Request count
- **Events**: Deployments, restarts, errors

### Health Check

The `/health` endpoint is automatically checked by Render. If it fails:
- Render will restart the service
- Check logs for errors
- Verify database connection

---

## Cost Management

### Free Tier Limits

- **750 hours/month** free compute time
- **Service spins down** after 15 minutes of inactivity
- **Cold starts** take 30-60 seconds

### Upgrade to Starter ($7/month)

Benefits:
- **Always-on** service (no spin-down)
- **No cold starts**
- **Better performance** for production

---

## Next Steps

After ML service is deployed:

1. ✅ **Test driver sync** from frontend
2. ✅ **Monitor logs** for any errors
3. ✅ **Set up alerts** (if available in your Render plan)
4. ✅ **Document ML service URL** for team reference
5. ✅ **Update CI/CD** (if using GitHub Actions) to include ML service

---

## Quick Reference

**ML Service URL Format:**
```
https://[service-name].onrender.com
```

**Key Endpoints:**
- `GET /health` - Health check
- `POST /api/sync/drivers` - Sync drivers from FastF1
- `GET /api/sync/info` - Service information

**Environment Variables Summary:**
```bash
DATABASE_URL=postgres://... (Internal URL)
FASTF1_CACHE_DIR=/opt/render/project/cache
PORT=10000
LOG_LEVEL=INFO
ALLOWED_ORIGINS=https://your-backend.onrender.com
```

---

## Related Documentation

- [Main Production Deployment Guide](./production-deployment.md)
- [CI/CD Setup Guide](./ci-cd-setup.md)
- [Backend Deployment](./production-deployment.md#step-3-deploy-backend-api-on-render)
