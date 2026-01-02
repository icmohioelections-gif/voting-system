# Google Sheets API Setup Guide

This guide will help you set up Google Sheets API to sync private Google Sheets.

## Step-by-Step Instructions

### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project** (or select existing)
   - Click the project dropdown at the top
   - Click "New Project"
   - Project name: `voting-system` (or any name you prefer)
   - Click "Create"

3. **Select Your Project**
   - Make sure your new project is selected in the dropdown

### Step 2: Enable Google Sheets API

1. **Navigate to APIs & Services**
   - In the left menu, click "APIs & Services" → "Library"
   - Or go directly to: https://console.cloud.google.com/apis/library

2. **Enable Google Sheets API**
   - Search for "Google Sheets API"
   - Click on "Google Sheets API"
   - Click the "Enable" button
   - Wait for it to enable (usually takes a few seconds)

### Step 3: Create Service Account

1. **Go to Service Accounts**
   - In the left menu, click "APIs & Services" → "Credentials"
   - Or go directly to: https://console.cloud.google.com/apis/credentials

2. **Create Service Account**
   - Click "Create Credentials" at the top
   - Select "Service Account"
   - **Service account name**: `voting-system-sheets`
   - **Service account ID**: Will auto-generate (e.g., `voting-system-sheets@your-project.iam.gserviceaccount.com`)
   - Click "Create and Continue"

3. **Grant Role** (Optional - can skip)
   - Click "Continue" (role not required for API access)
   - Click "Done"

### Step 4: Create and Download JSON Key

1. **Find Your Service Account**
   - In the Credentials page, scroll down to "Service Accounts"
   - Click on the service account you just created (`voting-system-sheets`)

2. **Create Key**
   - Go to the "Keys" tab
   - Click "Add Key" → "Create new key"
   - Select "JSON" format
   - Click "Create"
   - The JSON file will automatically download

3. **Save the JSON File**
   - Keep this file safe! It contains your credentials
   - **Important**: Never commit this file to Git (it's already in .gitignore)

### Step 5: Extract Credentials from JSON

1. **Open the Downloaded JSON File**
   - It will look something like this:
   ```json
   {
     "type": "service_account",
     "project_id": "your-project-id",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "voting-system-sheets@your-project.iam.gserviceaccount.com",
     "client_id": "...",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
     "client_x509_cert_url": "..."
   }
   ```

2. **Copy the Values You Need**
   - `client_email`: This is your `GOOGLE_SHEETS_CLIENT_EMAIL`
     - Example: `voting-system-sheets@your-project.iam.gserviceaccount.com`
   - `private_key`: This is your `GOOGLE_SHEETS_PRIVATE_KEY`
     - Copy the ENTIRE key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
     - Keep all the `\n` characters (newlines)

### Step 6: Share Google Sheet with Service Account

1. **Open Your Google Sheet**
   - Go to: https://docs.google.com/spreadsheets/d/163BMLKY3rzA6udXKJiuDMamGYlejd7_q/edit

2. **Share with Service Account**
   - Click the "Share" button (top right)
   - In the "Add people and groups" field, paste the **service account email** (the `client_email` from JSON)
   - Set permission to "Editor" (needed for updating voter status)
   - Uncheck "Notify people" (service accounts don't have email)
   - Click "Share"

### Step 7: Add Credentials to Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/mady-mohas-projects/voting-system/settings/environment-variables
   - Or: Dashboard → Your Project → Settings → Environment Variables

2. **Add Environment Variables**

   **Variable 1: GOOGLE_SHEETS_CLIENT_EMAIL**
   - Key: `GOOGLE_SHEETS_CLIENT_EMAIL`
   - Value: Paste the `client_email` from your JSON file
   - Environments: Select all (Production, Preview, Development)
   - Click "Save"

   **Variable 2: GOOGLE_SHEETS_PRIVATE_KEY**
   - Key: `GOOGLE_SHEETS_PRIVATE_KEY`
   - Value: Paste the entire `private_key` from JSON, including:
     ```
     -----BEGIN PRIVATE KEY-----
     (the key content)
     -----END PRIVATE KEY-----
     ```
   - **Important**: Keep the newlines as `\n` or paste as-is
   - Environments: Select all (Production, Preview, Development)
   - Click "Save"

3. **Verify Variables Are Set**
   - You should see both variables listed
   - Values will show as "Encrypted"

### Step 8: Redeploy (if needed)

1. **Trigger a New Deployment**
   - Go to: https://vercel.com/mady-mohas-projects/voting-system/deployments
   - Click "Redeploy" on the latest deployment
   - Or push a new commit to trigger auto-deploy

2. **Wait for Deployment**
   - Deployment usually takes 1-2 minutes
   - Wait for it to complete

### Step 9: Test the Integration

1. **Go to Admin Dashboard**
   - Visit: https://voting-system-five-rouge.vercel.app/admin
   - Navigate to "Settings" tab

2. **Test Google Sheet Sync**
   - Paste your Google Sheet URL:
     ```
     https://docs.google.com/spreadsheets/d/163BMLKY3rzA6udXKJiuDMamGYlejd7_q/edit?gid=1938208231
     ```
   - Click "Sync from Sheet URL"
   - You should see a success message with the number of voters synced

## ✅ Verification Checklist

- [ ] Google Cloud Project created
- [ ] Google Sheets API enabled
- [ ] Service Account created
- [ ] JSON key file downloaded
- [ ] Service account email copied
- [ ] Private key copied
- [ ] Google Sheet shared with service account email
- [ ] Service account has "Editor" permission on sheet
- [ ] GOOGLE_SHEETS_CLIENT_EMAIL added to Vercel
- [ ] GOOGLE_SHEETS_PRIVATE_KEY added to Vercel
- [ ] Deployment completed
- [ ] Test sync successful

## 🔒 Security Notes

- ✅ The JSON key file is already in `.gitignore` - it won't be committed
- ✅ Service accounts are safer than OAuth for server-side operations
- ✅ The service account only has access to sheets you explicitly share
- ✅ Private keys are encrypted in Vercel
- ⚠️ Never share your JSON key file or commit it to Git

## 🐛 Troubleshooting

### Error: "No key or keyFile set"
- **Solution**: Make sure both `GOOGLE_SHEETS_CLIENT_EMAIL` and `GOOGLE_SHEETS_PRIVATE_KEY` are set in Vercel
- Check that values are correct (no extra spaces)
- Redeploy after adding variables

### Error: "Permission denied" or "Access denied"
- **Solution**: Make sure you've shared the Google Sheet with the service account email
- Check that service account has "Editor" permission (not just "Viewer")
- The email must match exactly (copy-paste from JSON file)

### Error: "API not enabled"
- **Solution**: Go back to Google Cloud Console and verify Google Sheets API is enabled
- Wait a few minutes after enabling for it to propagate

### Sheet syncs but updates fail
- **Solution**: Service account needs "Editor" permission (not "Viewer")
- Re-share the sheet with Editor permission

## 📝 Quick Reference

**Service Account Email Format:**
```
{service-account-name}@{project-id}.iam.gserviceaccount.com
```

**Private Key Format:**
```
-----BEGIN PRIVATE KEY-----
(actual key content with newlines)
-----END PRIVATE KEY-----
```

**Your Sheet ID:**
```
163BMLKY3rzA6udXKJiuDMamGYlejd7_q
```

## 🎯 Next Steps

Once setup is complete:
1. Your private Google Sheets will sync automatically
2. The system will update voter status in the sheet when votes are cast
3. You can use the Settings tab to sync anytime
4. No need to make sheets public anymore!

