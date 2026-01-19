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
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GOOGLE_SHEETS_SPREADSHEET_ID=your_google_sheets_id
GOOGLE_SHEETS_CLIENT_EMAIL=YOUR_SERVICE_ACCOUNT_EMAIL
GOOGLE_SHEETS_PRIVATE_KEY="YOUR_PRIVATE_KEY"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

