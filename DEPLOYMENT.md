# Deployment Guide

This guide walks you through deploying the Voting System to Vercel and configuring Supabase.

## Pre-Deployment Checklist

- [ ] Supabase project created and schema executed
- [ ] Google Sheets API enabled and service account created
- [ ] Google Sheet created and shared with service account
- [ ] Environment variables documented
- [ ] Candidates added to database
- [ ] Voters added to Google Sheet

## Step 1: Prepare GitHub Repository

1. Initialize git (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Voting System"
   ```

2. Create a new repository on GitHub

3. Push code:
   ```bash
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

### Via Vercel Dashboard (Recommended)

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Sign in with GitHub
3. Click "Import" next to your repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

5. Add Environment Variables:
   Click "Environment Variables" and add:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   GOOGLE_SHEETS_SPREADSHEET_ID=your_google_sheets_id
   GOOGLE_SHEETS_CLIENT_EMAIL=your_service_account_email
   GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

   **Important**: 
   - Set all variables for "Production", "Preview", and "Development" environments
   - For `GOOGLE_SHEETS_PRIVATE_KEY`, paste the entire key including newlines

6. Click "Deploy"

7. Wait for deployment to complete

### Via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Add environment variables:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add GOOGLE_SHEETS_SPREADSHEET_ID
   vercel env add GOOGLE_SHEETS_CLIENT_EMAIL
   vercel env add GOOGLE_SHEETS_PRIVATE_KEY
   vercel env add NEXT_PUBLIC_APP_URL
   ```

5. Deploy to production:
   ```bash
   vercel --prod
   ```

## Step 3: Update App URL

After deployment, update `NEXT_PUBLIC_APP_URL` in Vercel environment variables to match your deployment URL.

## Step 4: Verify Deployment

1. Visit your Vercel deployment URL
2. Test home page loads
3. Test login flow (create a test voter first)
4. Test admin dashboard
5. Test Google Sheets sync

## Step 5: Initial Data Setup

### Add Candidates

Using Supabase Dashboard SQL Editor:

```sql
INSERT INTO candidates (name, position) VALUES
('Candidate Name 1', 'Position 1'),
('Candidate Name 2', 'Position 2');
```

### Sync Voters

1. Ensure your Google Sheet has voter data
2. Visit `/admin` on your deployed app
3. Go to "Sync" tab
4. Click "Sync from Google Sheets"
5. Verify voters appear in "Voters" tab

## Step 6: Configure Custom Domain (Optional)

1. Go to Vercel Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` if needed

## Post-Deployment Security

- [ ] Verify RLS policies are active in Supabase
- [ ] Test that service role key is not exposed to client
- [ ] Verify Google Sheets service account has minimal permissions
- [ ] Enable Vercel deployment protection if needed
- [ ] Set up monitoring/alerts

## Monitoring

### Vercel Analytics
- Enable in Project Settings → Analytics

### Supabase Logs
- Monitor API usage in Supabase Dashboard
- Check for any RLS policy violations

### Google Sheets API
- Monitor usage in Google Cloud Console
- Set up quotas if needed

## Rollback

If deployment fails:

1. Go to Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click "..." → "Promote to Production"

## Troubleshooting Deployment Issues

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Environment Variables Not Working

- Verify variables are set for correct environment (Production/Preview)
- Check variable names match exactly (case-sensitive)
- Redeploy after adding new variables

### Database Connection Issues

- Verify Supabase URL and keys are correct
- Check Supabase project is active
- Verify network access (Supabase allows all IPs by default)

### Google Sheets API Errors

- Verify service account has access to sheet
- Check private key format (must include `\n`)
- Verify sheet ID is correct

## Next Steps

- Set up automated deployments on git push
- Configure custom domain
- Set up monitoring and alerts
- Review security settings
- Create backup procedures

