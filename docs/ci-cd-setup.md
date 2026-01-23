# CI/CD Setup Guide

This document explains the GitHub Actions CI/CD pipeline setup for F1 Insight Hub.

## Overview

The CI/CD pipeline automatically:
1. **Verifies** code quality (typecheck, lint, build) on every push and PR
2. **Deploys** to production (Vercel + Render) when code is pushed to `main` branch

## Workflow Structure

### 1. Verify Job

Runs on every push and pull request to ensure code quality:

- ✅ Checkout code
- ✅ Setup pnpm (v10.28.0) and Node.js (v18)
- ✅ Install dependencies
- ✅ Setup Turborepo
- ✅ Generate Prisma Client
- ✅ Type check (`pnpm typecheck`)
- ✅ Lint (`pnpm lint`)
- ✅ Build (`pnpm build`)

**If any step fails, the pipeline stops and deployment is blocked.**

### 2. Deploy Backend Job

Runs only on pushes to `main` branch (after verify passes):

- ✅ Checkout code
- ✅ Setup environment (pnpm, Node.js, Turbo)
- ✅ Install dependencies
- ✅ Generate Prisma Client
- ✅ Build backend
- ✅ Deploy to Render
- ✅ Wait for deployment
- ℹ️ Note about migrations (see below)

### 3. Deploy Frontend Job

Runs only on pushes to `main` branch (after verify passes):

- ✅ Checkout code
- ✅ Setup environment (pnpm, Node.js, Turbo)
- ✅ Install dependencies
- ✅ Build frontend (verification)
- ✅ Deploy to Vercel (production)

## Required GitHub Secrets

You need to configure the following secrets in your GitHub repository:

### For Backend (Render)

1. **`RENDER_SERVICE_ID`**
   - Your Render backend service ID
   - Found in Render dashboard → Your Service → Settings → Service ID

2. **`RENDER_API_KEY`**
   - Your Render API key
   - Generate at: Render Dashboard → Account Settings → API Keys

3. **`DATABASE_URL`** (for Prisma generate in CI)
   - PostgreSQL connection string
   - Format: `postgresql://user:password@host:port/database`
   - Used only for generating Prisma Client during CI, not for actual database access

### For Frontend (Vercel)

1. **`VERCEL_TOKEN`**
   - Your Vercel authentication token
   - Generate at: Vercel Dashboard → Settings → Tokens

2. **`VERCEL_ORG_ID`**
   - Your Vercel organization ID
   - Found in Vercel dashboard URL or team settings

3. **`VERCEL_PROJECT_ID`**
   - Your Vercel project ID
   - Found in Vercel project settings

## Setting Up Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the exact name and value

## Database Migrations

### Important Note

Prisma migrations should be configured to run **automatically on Render**, not from GitHub Actions.

### Render Configuration

In your Render service settings, configure the build command to include migrations:

```bash
cd backend && pnpm install && pnpm prisma generate && pnpm prisma migrate deploy && pnpm build && pnpm start
```

Or set up a separate post-deploy script in Render:

```bash
cd backend && pnpm prisma migrate deploy
```

This ensures migrations run in the same environment as your application, with proper database access.

## Workflow Triggers

- **On Push to `main`**: Runs verify → deploy-backend → deploy-frontend
- **On Pull Request to `main`**: Runs verify only (no deployment)

## Manual Workflow Execution

You can manually trigger the workflow:

1. Go to **Actions** tab in GitHub
2. Select **CI/CD Pipeline**
3. Click **Run workflow**
4. Choose branch and click **Run workflow**

## Troubleshooting

### Build Fails

- Check the **Verify** job logs for type errors, lint errors, or build failures
- Fix issues locally first: `pnpm typecheck`, `pnpm lint`, `pnpm build`

### Deployment Fails

**Backend (Render):**
- Verify `RENDER_SERVICE_ID` and `RENDER_API_KEY` are correct
- Check Render dashboard for service status
- Ensure Render service is configured correctly

**Frontend (Vercel):**
- Verify all three Vercel secrets are set correctly
- Check Vercel dashboard for deployment status
- Ensure Vercel project is linked to the repository

### Prisma Client Generation Fails

- Verify `DATABASE_URL` secret is set and valid
- The connection string should be accessible from GitHub Actions (use a read-only connection if possible)
- Prisma Client generation doesn't require database access, but the connection string format must be valid

## Best Practices

1. **Always test locally first**: Run `pnpm typecheck`, `pnpm lint`, and `pnpm build` before pushing
2. **Review PRs carefully**: The verify job runs on PRs, so review any failures before merging
3. **Monitor deployments**: Check Render and Vercel dashboards after deployment
4. **Keep secrets updated**: Rotate API keys periodically for security
5. **Use environment-specific configs**: Ensure production environment variables are set in Render/Vercel dashboards

## Workflow File Location

The workflow is defined in: `.github/workflows/deploy.yml`

## Related Documentation

- [Deployment Guide](./deployment.md) - Detailed deployment instructions
- [Database Setup](./database-setup.md) - PostgreSQL and Prisma setup
- [README.md](../README.md) - Project overview and setup
