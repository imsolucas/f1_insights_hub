# GitHub Actions Troubleshooting

## Fixed Issues

### Issue: `turborepo/setup-action` not found

**Error:**
```
Error: Unable to resolve action turborepo/setup-action, repository not found
```

**Solution:**
- Removed `turborepo/setup-action` steps from workflow
- Turborepo is automatically installed via `pnpm install`, so no separate setup action is needed

## Required GitHub Secrets

Make sure these secrets are configured in GitHub (Settings → Secrets and variables → Actions):

### Backend (Render)
- `RENDER_SERVICE_ID` - Your Render service ID
- `RENDER_API_KEY` - Your Render API key  
- `DATABASE_URL` - Your PostgreSQL connection string
  - Format: `postgresql://user:password@host:port/database`
  - Use the **Internal Database URL** from Render

### Frontend (Vercel)
- `VERCEL_TOKEN` - Vercel authentication token
- `VERCEL_ORG_ID` - Vercel organization/team ID
- `VERCEL_PROJECT_ID` - Vercel project ID

## Testing the Workflow

1. **Commit and push the fixed workflow:**
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "Fix: Remove turborepo/setup-action (not needed)"
   git push origin main
   ```

2. **Check GitHub Actions:**
   - Go to your repository → **Actions** tab
   - Watch the workflow run
   - Verify all jobs pass

3. **If verify job fails:**
   - Check the logs for specific errors
   - Common issues:
     - Missing `DATABASE_URL` secret
     - TypeScript errors
     - Lint errors
     - Build failures

## Common Issues

### "DATABASE_URL not found"
- Add `DATABASE_URL` secret in GitHub
- Use the Internal Database URL from Render

### "Prisma Client not generated"
- Ensure `DATABASE_URL` secret is set
- Check that Prisma schema is valid

### "Build fails"
- Check for TypeScript errors locally: `pnpm typecheck`
- Check for lint errors: `pnpm lint`
- Test build locally: `pnpm build`

### "Deployment fails"
- Verify Render service ID and API key are correct
- Check Render dashboard for service status
- Verify Vercel credentials are correct

## Workflow Structure

The workflow has 3 jobs:

1. **verify** - Runs on every push/PR
   - Typecheck, lint, build
   - Must pass before deployment

2. **deploy-backend** - Runs on push to `main`
   - Deploys to Render
   - Only runs if verify passes

3. **deploy-frontend** - Runs on push to `main`
   - Deploys to Vercel
   - Only runs if verify passes

## Next Steps

After fixing the workflow:
1. ✅ Commit and push the changes
2. ✅ Verify workflow runs successfully
3. ✅ Check deployments on Render and Vercel
4. ✅ Test your deployed applications
