# Push to GitHub & Deploy Instructions

## GitHub Push Issue

The git push failed due to authentication. You need to authenticate with GitHub first.

### Option 1: Use GitHub CLI (Recommended)

```bash
cd /Users/mohammad/voting-system
gh auth login
git push -u origin main
```

### Option 2: Use Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Generate new token (classic) with `repo` scope
3. Run:

```bash
cd /Users/mohammad/voting-system
git remote set-url origin https://YOUR_TOKEN@github.com/icmohioelections-gif/voting-system.git
git push -u origin main
```

### Option 3: Use SSH (If you have SSH key set up)

```bash
cd /Users/mohammad/voting-system
git remote set-url origin git@github.com:icmohioelections-gif/voting-system.git
git push -u origin main
```

### Option 4: Manual Push via GitHub Desktop

1. Open GitHub Desktop
2. Add repository: `/Users/mohammad/voting-system`
3. Push to origin

## After Pushing to GitHub

Once code is pushed, I can deploy to Vercel using MCP tools, or you can deploy via Vercel Dashboard.

## Environment Variables for Vercel

You'll need these values (already in .env.local):

```
NEXT_PUBLIC_SUPABASE_URL=https://nvfxbvntzryewptndvoj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52Znhidm50enJ5ZXdwdG5kdm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyOTYwNzIsImV4cCI6MjA4Mjg3MjA3Mn0.F1kzc5QtcLZKvTZtq-7htiHXi624YU0vv1oIUfy3XwQ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52Znhidm50enJ5ZXdwdG5kdm9qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzI5NjA3MiwiZXhwIjoyMDgyODcyMDcyfQ.TsRdyn9_QHfYBneTlJUk1a-0nLd6jEMKhsfu4gSVsL0
GOOGLE_SHEETS_SPREADSHEET_ID=163BMLKY3rzA6udXKJiuDMamGYlejd7_q
GOOGLE_SHEETS_CLIENT_EMAIL=YOUR_SERVICE_ACCOUNT_EMAIL
GOOGLE_SHEETS_PRIVATE_KEY="YOUR_PRIVATE_KEY"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

