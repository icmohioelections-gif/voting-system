# Quick Start Guide

Get your voting system running in 5 minutes!

## 🚀 Fast Setup

### 1. GitHub Repository

```bash
cd /Users/mohammad/voting-system
git init
git add .
git commit -m "Initial commit"
# Create repo on GitHub, then:
git remote add origin <YOUR_REPO_URL>
git push -u origin main
```

### 2. Supabase (2 minutes)

1. Open: https://supabase.com/dashboard/project/nvfxbvntzryewptndvoj
2. Go to **SQL Editor**
3. Copy & paste contents of `supabase/schema.sql`
4. Click **Run**
5. Go to **Settings → API**, copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### 3. Google Sheets (3 minutes)

1. **Enable API**: https://console.cloud.google.com
   - Create project → Enable "Google Sheets API"
   - Create Service Account → Download JSON key

2. **Prepare Sheet**: https://docs.google.com/spreadsheets/d/163BMLKY3rzA6udXKJiuDMamGYlejd7_q/edit
   - Add header row: `election_code | first_name | last_name | has_voted | voted_at`
   - Share with service account email (from JSON) → Editor access

3. **Get Sheet ID**: From URL: `163BMLKY3rzA6udXKJiuDMamGYlejd7_q`

### 4. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://nvfxbvntzryewptndvoj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from_supabase>
SUPABASE_SERVICE_ROLE_KEY=<from_supabase>

GOOGLE_SHEETS_SPREADSHEET_ID=163BMLKY3rzA6udXKJiuDMamGYlejd7_q
GOOGLE_SHEETS_CLIENT_EMAIL=<from_json>
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n<from_json>\n-----END PRIVATE KEY-----\n"

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Test Locally

```bash
npm run dev
```

Visit: http://localhost:3000

### 6. Add Data

**Add Candidates** (Supabase SQL Editor):
```sql
INSERT INTO candidates (name, position) VALUES ('Candidate 1', 'President');
```

**Sync Voters** (Admin Dashboard):
1. Add voters to Google Sheet
2. Visit http://localhost:3000/admin
3. Click "Sync" tab → "Sync from Google Sheets"

### 7. Deploy to Vercel

1. Go to: https://vercel.com/new
2. Import GitHub repo
3. Add all env vars
4. Deploy!

## ✅ Done!

Your voting system is ready! 🎉

## Need Help?

See `SETUP_INSTRUCTIONS.md` for detailed steps.

