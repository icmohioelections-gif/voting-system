# Vercel Environment Variables

Copy these environment variables to Vercel Dashboard when deploying:

## Required Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://nvfxbvntzryewptndvoj.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52Znhidm50enJ5ZXdwdG5kdm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyOTYwNzIsImV4cCI6MjA4Mjg3MjA3Mn0.F1kzc5QtcLZKvTZtq-7htiHXi624YU0vv1oIUfy3XwQ

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52Znhidm50enJ5ZXdwdG5kdm9qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzI5NjA3MiwiZXhwIjoyMDgyODcyMDcyfQ.TsRdyn9_QHfYBneTlJUk1a-0nLd6jEMKhsfu4gSVsL0

GOOGLE_SHEETS_SPREADSHEET_ID=163BMLKY3rzA6udXKJiuDMamGYlejd7_q

GOOGLE_SHEETS_CLIENT_EMAIL=YOUR_SERVICE_ACCOUNT_EMAIL_HERE

GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## How to Add in Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to: **Settings → Environment Variables**
3. Add each variable:
   - **Key**: Variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value**: Variable value
   - **Environment**: Select all (Production, Preview, Development)
4. Click **Save**
5. Redeploy your project

## Important Notes

- ⚠️ **GOOGLE_SHEETS_CLIENT_EMAIL** and **GOOGLE_SHEETS_PRIVATE_KEY** still need to be configured
- Set **NEXT_PUBLIC_APP_URL** to your Vercel deployment URL after first deploy
- All variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Service role key is secret - keep it secure

