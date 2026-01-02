# Environment Variables Setup

## ✅ Supabase Credentials (Already Configured)

Your Supabase credentials are already set in `.env.local`:

- ✅ **NEXT_PUBLIC_SUPABASE_URL**: `https://nvfxbvntzryewptndvoj.supabase.co`
- ✅ **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Configured

## ⚠️ Still Needed

### 1. Supabase Service Role Key

1. Go to: https://supabase.com/dashboard/project/nvfxbvntzryewptndvoj/settings/api
2. Find **"service_role"** key (it's a secret key)
3. Copy it
4. Replace `YOUR_SERVICE_ROLE_KEY_HERE` in `.env.local`

### 2. Google Sheets API Credentials

You need to set up Google Service Account:

1. **Enable Google Sheets API**:
   - Go to: https://console.cloud.google.com
   - Create/select a project
   - Enable "Google Sheets API"

2. **Create Service Account**:
   - Go to: IAM & Admin → Service Accounts
   - Create new service account
   - Name: `voting-system-sheets`
   - Download JSON key file

3. **Extract from JSON**:
   - Open the downloaded JSON file
   - Copy `client_email` → `GOOGLE_SHEETS_CLIENT_EMAIL`
   - Copy `private_key` → `GOOGLE_SHEETS_PRIVATE_KEY`
   - Keep the `\n` characters in the private key

4. **Share Google Sheet**:
   - Open your sheet: https://docs.google.com/spreadsheets/d/163BMLKY3rzA6udXKJiuDMamGYlejd7_q/edit
   - Click "Share"
   - Add the service account email (from JSON)
   - Give it "Editor" permission

5. **Update `.env.local`**:
   ```env
   GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

## Current Status

- ✅ Database schema applied
- ✅ Tables created with RLS
- ✅ Supabase URL and Anon Key configured
- ⏳ Service Role Key needed (get from Supabase Dashboard)
- ⏳ Google Sheets credentials needed

## After Setting Up

1. Test locally: `npm run dev`
2. Visit: http://localhost:3000
3. Go to Admin → Sync to test Google Sheets connection

