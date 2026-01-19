# 🚀 Quick Deploy Guide

## Current Status

✅ **Code**: Ready and committed locally  
✅ **Database**: Schema applied to Supabase  
✅ **Environment**: Supabase keys configured  
⏳ **GitHub**: Need to authenticate and push  
⏳ **Vercel**: Ready to deploy after GitHub push  

## Step 1: Push to GitHub

You need to authenticate with GitHub first. Choose one method:

### Method A: GitHub Desktop (Easiest)

1. Download GitHub Desktop if needed: https://desktop.github.com
2. Open GitHub Desktop
3. File → Add Local Repository
4. Select: `/Users/mohammad/voting-system`
5. Click "Publish repository"
6. Repository will be: `icmohioelections-gif/voting-system`
7. Click "Publish repository"

### Method B: Command Line with Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scope: `repo`
4. Copy the token
5. Run:

```bash
cd /Users/mohammad/voting-system
git remote set-url origin https://YOUR_TOKEN@github.com/icmohioelections-gif/voting-system.git
git push -u origin main
```

### Method C: SSH Key (If you have one set up)

```bash
cd /Users/mohammad/voting-system
git remote set-url origin git@github.com:icmohioelections-gif/voting-system.git
git push -u origin main
```

## Step 2: Deploy to Vercel

Once code is on GitHub, you have two options:

### Option A: Via Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/new
2. Sign in with GitHub
3. Click "Import" next to `icmohioelections-gif/voting-system`
4. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
5. **Add Environment Variables** (click "Environment Variables"):
   
   Copy from `VERCEL_ENV_VARS.md` or add these:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   GOOGLE_SHEETS_SPREADSHEET_ID=your_google_sheets_id
   GOOGLE_SHEETS_CLIENT_EMAIL=YOUR_EMAIL_HERE
   GOOGLE_SHEETS_PRIVATE_KEY="YOUR_KEY_HERE"
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   **Important**: 
   - Set all variables for Production, Preview, and Development
   - For `GOOGLE_SHEETS_PRIVATE_KEY`, paste the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
   - Keep `NEXT_PUBLIC_APP_URL` as `http://localhost:3000` for now (update after first deploy)

6. Click **Deploy**
7. Wait for deployment to complete
8. Copy your deployment URL
9. Go to Settings → Environment Variables
10. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL (e.g., `https://your-app.vercel.app`)
11. Redeploy

### Option B: Let me deploy via MCP

Once you've pushed to GitHub, tell me and I can try deploying via Vercel MCP tools.

## Step 3: Initialize Data

### Add Candidates

1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/nvfxbvntzryewptndvoj/editor
2. Run:

```sql
INSERT INTO candidates (name, position) VALUES
('Candidate 1', 'President'),
('Candidate 2', 'President');
```

### Sync Voters from Google Sheets

1. Make sure your Google Sheet is set up (see `ENV_SETUP.md`)
2. Add voters to the sheet
3. Visit your deployed app: `https://your-app.vercel.app/admin`
4. Go to "Sync" tab
5. Click "Sync from Google Sheets"

## ✅ Done!

Your voting system should now be live! 🎉

## Quick Links

- **GitHub Repo**: https://github.com/icmohioelections-gif/voting-system
- **Supabase Dashboard**: https://supabase.com/dashboard/project/nvfxbvntzryewptndvoj
- **Vercel Dashboard**: https://vercel.com/new
- **Google Sheets**: https://docs.google.com/spreadsheets/d/163BMLKY3rzA6udXKJiuDMamGYlejd7_q/edit

