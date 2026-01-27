# How to Get Render Deploy Hook URL

Step-by-step guide to find the deploy hook URL for your Render services (Backend and ML Service).

## What is a Deploy Hook?

A **deploy hook** is a special URL that triggers a manual deployment of your Render service. When GitHub Actions calls this URL, it tells Render to redeploy your service.

**Note:** Deploy hooks are **optional**. If you don't set them up, Render will automatically deploy when you push code to the connected branch. However, using deploy hooks gives you more control over when deployments happen.

---

## Step-by-Step Instructions

### For Backend Service

1. **Go to Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Log in to your account

2. **Navigate to Your Backend Service**
   - Click on your backend service (e.g., `f1-insight-hub-api`)
   - This opens the service details page

3. **Go to Settings Tab**
   - Click the **"Settings"** tab at the top of the page
   - Scroll down to find the **"Manual Deploy Hook"** section

4. **Copy the Deploy Hook URL**
   - You'll see a URL that looks like:
     ```
     https://api.render.com/deploy/srv-xxxxxxxxxxxxx?key=yyyyyyyyyyyyyyyy
     ```
   - Click the **"Copy"** button next to the URL
   - **Save this URL** - you'll need it for GitHub secrets

5. **Add to GitHub Secrets**
   - Go to your GitHub repository
   - **Settings** → **Secrets and variables** → **Actions**
   - Click **"New repository secret"**
   - Name: `RENDER_DEPLOY_HOOK_URL`
   - Value: Paste the deploy hook URL you copied
   - Click **"Add secret"**

---

### For ML Service

1. **Go to Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Log in to your account

2. **Navigate to Your ML Service**
   - Click on your ML service (e.g., `f1-insight-ml-service`)
   - This opens the service details page

3. **Go to Settings Tab**
   - Click the **"Settings"** tab at the top of the page
   - Scroll down to find the **"Manual Deploy Hook"** section

4. **Copy the Deploy Hook URL**
   - You'll see a URL that looks like:
     ```
     https://api.render.com/deploy/srv-xxxxxxxxxxxxx?key=yyyyyyyyyyyyyyyy
     ```
   - Click the **"Copy"** button next to the URL
   - **Save this URL** - you'll need it for GitHub secrets

5. **Add to GitHub Secrets**
   - Go to your GitHub repository
   - **Settings** → **Secrets and variables** → **Actions**
   - Click **"New repository secret"**
   - Name: `RENDER_ML_SERVICE_DEPLOY_HOOK_URL`
   - Value: Paste the deploy hook URL you copied
   - Click **"Add secret"**

---

## Visual Guide

### Render Dashboard Navigation

```
Render Dashboard
├── Your Services
│   ├── f1-insight-hub-api (Backend)
│   │   └── Settings Tab
│   │       └── Manual Deploy Hook ← Copy this URL
│   │
│   └── f1-insight-ml-service (ML Service)
│       └── Settings Tab
│           └── Manual Deploy Hook ← Copy this URL
```

### Settings Page Location

On the Settings tab, scroll down past:
- Environment Variables
- Health Check Path
- Auto-Deploy
- **Manual Deploy Hook** ← You'll find it here

---

## Important Notes

### Security
- **Keep deploy hook URLs secret** - they allow anyone to trigger deployments
- **Don't commit them to git** - always use GitHub secrets
- **Regenerate if exposed** - if a URL is leaked, regenerate it in Render

### Regenerating Deploy Hooks

If you need to regenerate a deploy hook:

1. Go to your service → **Settings** tab
2. Scroll to **"Manual Deploy Hook"** section
3. Click **"Regenerate"** button
4. Copy the new URL
5. Update the GitHub secret with the new URL

### Testing Deploy Hooks

You can test a deploy hook manually:

```bash
# Test backend deploy hook
curl -X POST "https://api.render.com/deploy/srv-xxxxxxxxxxxxx?key=yyyyyyyyyyyyyyyy"

# Test ML service deploy hook
curl -X POST "https://api.render.com/deploy/srv-zzzzzzzzzzzzzz?key=wwwwwwwwwwwwwwww"
```

If successful, you'll see a deployment start in the Render dashboard.

---

## Alternative: Auto-Deploy (No Deploy Hooks Needed)

If you prefer **not to use deploy hooks**, Render can auto-deploy when you push to your connected branch:

1. **Enable Auto-Deploy** (usually enabled by default)
   - Go to your service → **Settings** tab
   - Ensure **"Auto-Deploy"** is set to **"Yes"**
   - Select the branch (usually `main`)

2. **GitHub Actions will still work**
   - The workflow will skip the deploy hook step
   - Render will automatically deploy when code is pushed
   - You'll see a message: "Render auto-deploy is enabled, so deployment will happen automatically"

**Pros of Auto-Deploy:**
- Simpler setup (no deploy hooks needed)
- Automatic deployments on every push

**Pros of Deploy Hooks:**
- More control over when deployments happen
- Can trigger deployments from external systems
- Can deploy on-demand without pushing code

---

## Troubleshooting

### "Deploy hook not found" error

- **Verify the URL is correct** - Check for typos
- **Check the service exists** - Ensure the service ID in the URL matches your service
- **Regenerate the hook** - The key might have expired

### "Unauthorized" error

- **Check the key** - The key in the URL might be invalid
- **Regenerate the deploy hook** - Create a new one in Render

### Deploy hook works but deployment fails

- **Check Render logs** - The deployment might fail for other reasons (build errors, etc.)
- **Verify environment variables** - Missing env vars can cause deployment failures
- **Check service status** - Ensure the service is not paused or deleted

---

## Quick Reference

**GitHub Secret Names:**
- `RENDER_DEPLOY_HOOK_URL` - Backend service deploy hook
- `RENDER_ML_SERVICE_DEPLOY_HOOK_URL` - ML service deploy hook

**Where to Find:**
- Render Dashboard → Your Service → Settings Tab → Manual Deploy Hook

**Format:**
```
https://api.render.com/deploy/srv-<SERVICE_ID>?key=<DEPLOY_KEY>
```

---

## Summary

1. ✅ Go to Render Dashboard
2. ✅ Click your service (Backend or ML Service)
3. ✅ Click **Settings** tab
4. ✅ Scroll to **"Manual Deploy Hook"** section
5. ✅ Copy the URL
6. ✅ Add to GitHub Secrets with the correct name
7. ✅ Done! GitHub Actions will use it automatically

**Remember:** Deploy hooks are optional. If you don't set them up, Render will auto-deploy when you push code.
