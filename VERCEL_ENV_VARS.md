# Vercel Environment Variables

Copy these environment variables to Vercel Dashboard when deploying:

## Required Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url

NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

GOOGLE_SHEETS_SPREADSHEET_ID=your_google_sheets_id

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

