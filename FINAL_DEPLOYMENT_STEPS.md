# 🚀 Final Deployment Steps

## Step 1: Push to GitHub (Run These Commands Locally)

Since git authentication is needed, please run these commands in your terminal:

```bash
cd /Users/mohammad/voting-system
git remote add origin https://github.com/icmohioelections-gif/voting-system.git
git branch -M main
git push -u origin main
```

**Note**: If you get authentication errors, you may need to:
- Use GitHub Desktop to push
- Set up a Personal Access Token
- Or authenticate via `gh auth login` if you have GitHub CLI

## Step 2: Deploy to Vercel

Once code is pushed to GitHub, you have two options:

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/new
2. Sign in with GitHub
3. Click "Import" next to `icmohioelections-gif/voting-system`
4. Configure:
   - Framework: Next.js (auto-detected)
   - Root Directory: `./`
5. **Add Environment Variables** (click "Environment Variables"):
   
   Add these one by one (set for Production, Preview, Development):

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   ```
   
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```
   
   ```
   GOOGLE_SHEETS_SPREADSHEET_ID=163BMLKY3rzA6udXKJiuDMamGYlejd7_q
   ```
   
   ```
   GOOGLE_SHEETS_CLIENT_EMAIL=YOUR_SERVICE_ACCOUNT_EMAIL
   ```
   
   ```
   GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
   ```
   
   ```
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

6. Click **Deploy**
7. Wait for deployment
8. After first deploy, go to Settings → Environment Variables
9. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL (e.g., `https://voting-system.vercel.app`)
10. Redeploy

### Option B: Deploy via Vercel CLI

If you have Vercel CLI installed:

```bash
cd /Users/mohammad/voting-system
npm install -g vercel
vercel login
vercel
# Follow prompts, add env vars when asked
vercel --prod
```

## Step 3: After Deployment

1. **Add Candidates**: 
   - Go to Supabase SQL Editor
   - Run: `INSERT INTO candidates (name, position) VALUES ('Candidate 1', 'President');`

2. **Set up Google Sheets API** (if not done):
   - See `ENV_SETUP.md` for instructions
   - Update Vercel environment variables with Google Sheets credentials
   - Redeploy

3. **Sync Voters**:
   - Visit your deployed app: `/admin`
   - Go to "Sync" tab
   - Click "Sync from Google Sheets"

## ✅ Done!

Your voting system will be live! 🎉

## Quick Links

- **GitHub**: https://github.com/icmohioelections-gif/voting-system
- **Supabase**: https://supabase.com/dashboard/project/nvfxbvntzryewptndvoj
- **Vercel**: https://vercel.com/new

