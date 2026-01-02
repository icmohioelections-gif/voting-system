# Quick Google Sheets API Setup (5 Minutes)

## Fast Track Setup

### 1. Create Service Account (2 min)

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" → "Service Account"
3. Name: `voting-system-sheets`
4. Click "Create and Continue" → "Continue" → "Done"

### 2. Download JSON Key (1 min)

1. Click on the service account you just created
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key" → "JSON"
4. File downloads automatically

### 3. Share Sheet (1 min)

1. Open: https://docs.google.com/spreadsheets/d/163BMLKY3rzA6udXKJiuDMamGYlejd7_q/edit
2. Click "Share"
3. Paste the service account email (from JSON file, field: `client_email`)
4. Set permission to "Editor"
5. Uncheck "Notify people"
6. Click "Share"

### 4. Add to Vercel (1 min)

1. Go to: https://vercel.com/mady-mohas-projects/voting-system/settings/environment-variables
2. Add variable 1:
   - Key: `GOOGLE_SHEETS_CLIENT_EMAIL`
   - Value: Copy `client_email` from JSON
   - Select all environments
   - Save
3. Add variable 2:
   - Key: `GOOGLE_SHEETS_PRIVATE_KEY`
   - Value: Copy entire `private_key` from JSON (including BEGIN/END lines)
   - Select all environments
   - Save

### 5. Redeploy

1. Go to: https://vercel.com/mady-mohas-projects/voting-system/deployments
2. Click "Redeploy" on latest deployment
3. Wait 1-2 minutes

### 6. Test

1. Go to: https://voting-system-five-rouge.vercel.app/admin
2. Click "Settings" tab
3. Paste your sheet URL
4. Click "Sync from Sheet URL"
5. ✅ Done!

## Where to Find Values in JSON

Open the downloaded JSON file and find:
- `client_email`: Use this for GOOGLE_SHEETS_CLIENT_EMAIL
- `private_key`: Use entire value (with BEGIN/END) for GOOGLE_SHEETS_PRIVATE_KEY

For detailed instructions, see: `GOOGLE_SHEETS_API_SETUP.md`


