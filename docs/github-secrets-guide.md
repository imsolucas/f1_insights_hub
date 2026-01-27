# GitHub Secrets Setup Guide

Quick reference for setting up required secrets for CI/CD.

## Required Secrets

### Backend (Render)

| Secret Name | Description | Where to Find |
|------------|-------------|---------------|
| `RENDER_SERVICE_ID` | Your Render backend service ID | Render Dashboard → Your Service → Settings → Service ID |
| `RENDER_API_KEY` | Your Render API key | Render Dashboard → Account Settings → API Keys → Create API Key |
| `RENDER_DEPLOY_HOOK_URL` | Backend deploy hook URL (optional) | Render Dashboard → Your Service → Settings → Manual Deploy Hook |
| `DATABASE_URL` | PostgreSQL connection string | Render Dashboard → Database → Internal Database URL |

### Frontend (Vercel)

| Secret Name | Description | Where to Find |
|------------|-------------|---------------|
| `VERCEL_TOKEN` | Vercel authentication token | Vercel Dashboard → Settings → Tokens → Create Token |
| `VERCEL_ORG_ID` | Vercel organization/team ID | Vercel Dashboard → Team Settings → General → Team ID |
| `VERCEL_PROJECT_ID` | Vercel project ID | Vercel Dashboard → Project Settings → General → Project ID |

## Setup Steps

1. **Go to GitHub Repository**
   - Navigate to your repository on GitHub

2. **Open Secrets Settings**
   - Click **Settings** tab
   - In the left sidebar, click **Secrets and variables** → **Actions**

3. **Add Each Secret**
   - Click **New repository secret**
   - Enter the secret name (exactly as shown above)
   - Enter the secret value
   - Click **Add secret**

4. **Get Deploy Hook URLs (Optional)**
   - See [Render Deploy Hook Guide](./render-deploy-hook-guide.md) for detailed instructions
   - **Quick steps:**
     1. Go to Render Dashboard → Your Service → Settings tab
     2. Scroll to "Manual Deploy Hook" section
     3. Copy the URL
     4. Add as GitHub secret: `RENDER_DEPLOY_HOOK_URL` or `RENDER_ML_SERVICE_DEPLOY_HOOK_URL`

5. **Verify Secrets**
   - All required secrets should be listed (6-7 depending on whether you use deploy hooks)
   - Secrets are encrypted and cannot be viewed after creation

## Important Notes

- **Secret names are case-sensitive** - Use exact names as shown
- **DATABASE_URL format**: `postgresql://user:password@host:port/database`
- **Vercel tokens** should have appropriate permissions (read/write for deployments)
- **Render API keys** should be kept secure and rotated periodically

## Testing Secrets

After setting up secrets, test the workflow:

1. Make a small change to your code
2. Push to `main` branch
3. Go to **Actions** tab in GitHub
4. Watch the workflow run
5. Check for any errors related to missing or incorrect secrets

## Troubleshooting

### "Secret not found" error
- Verify secret name is spelled correctly
- Ensure secret was added to the correct repository
- Check that you're using the secret in the correct workflow file

### "Invalid API key" error
- Regenerate the API key/token
- Ensure the key has proper permissions
- Check expiration date (if applicable)

### "Service not found" error (Render)
- Verify `RENDER_SERVICE_ID` matches your actual service ID
- Ensure the service exists and is accessible with your API key

### "Project not found" error (Vercel)
- Verify `VERCEL_PROJECT_ID` matches your actual project ID
- Ensure the project is linked to your GitHub repository
- Check that your Vercel token has access to the project
