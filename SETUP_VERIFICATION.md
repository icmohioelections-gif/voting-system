# Setup Verification Checklist

## ✅ What's Already Configured

Based on your setup, here's what's confirmed:

### Google Sheets API Credentials
- ✅ **Service Account Email**: `voting-system-sheets@sublime-habitat-483019-a8.iam.gserviceaccount.com`
- ✅ **Project ID**: `sublime-habitat-483019-a8`
- ✅ **Credentials in Vercel**: 
  - `GOOGLE_SHEETS_CLIENT_EMAIL` - Set for all environments
  - `GOOGLE_SHEETS_PRIVATE_KEY` - Set for all environments
  - `GOOGLE_SHEETS_SPREADSHEET_ID` - Set for all environments

### Database
- ✅ Supabase database configured
- ✅ All migrations applied
- ✅ Tables created with RLS

### Code
- ✅ Settings page with Google Sheet URL sync
- ✅ Database reset functionality
- ✅ Google Sheets API integration
- ✅ CSV fallback method
- ✅ API method with credentials

## ⚠️ Final Step Required

### Share Google Sheet with Service Account

**THIS IS CRITICAL** - Your Google Sheet must be shared with the service account email for the sync to work.

1. **Open your Google Sheet**:
   - https://docs.google.com/spreadsheets/d/163BMLKY3rzA6udXKJiuDMamGYlejd7_q/edit

2. **Click "Share"** (top right)

3. **Add Service Account Email**:
   - Paste: `voting-system-sheets@sublime-habitat-483019-a8.iam.gserviceaccount.com`
   - Set permission to: **"Editor"** (needed for updating voter status)
   - **Uncheck** "Notify people" (service accounts don't have email)
   - Click **"Share"**

4. **Verify**:
   - The service account should now appear in the "Share" dialog
   - Permission should show as "Editor"

## 🧪 How to Test

Once the sheet is shared, test the integration:

### Option 1: Use Settings Page (Recommended)

1. Go to: https://voting-system-five-rouge.vercel.app/admin
2. Click **"Settings"** tab
3. Paste your Google Sheet URL:
   ```
   https://docs.google.com/spreadsheets/d/163BMLKY3rzA6udXKJiuDMamGYlejd7_q/edit?gid=1938208231
   ```
4. Click **"Sync from Sheet URL"**
5. You should see: ✓ Successfully synced X voters from Google Sheets

### Option 2: Use Sync Tab (Legacy Method)

1. Go to: https://voting-system-five-rouge.vercel.app/admin
2. Click **"Sync"** tab
3. Click **"Sync from Google Sheets"**
4. Uses the `GOOGLE_SHEETS_SPREADSHEET_ID` from environment variables

## 📋 Google Sheet Format

Make sure your Google Sheet has this format:

| election_code | first_name | last_name | has_voted | voted_at |
|--------------|------------|-----------|-----------|----------|
| ABC123       | John       | Doe       | FALSE     |          |
| XYZ789       | Jane       | Smith     | FALSE     |          |

- **Header row** is required (row 1)
- **Data starts from row 2**
- `election_code` and `first_name` are required
- `last_name` is optional
- `has_voted` should be TRUE/FALSE or empty
- `voted_at` should be timestamp or empty

## 🔍 Troubleshooting

### Error: "Permission denied" or "Access denied"
- **Solution**: Make sure you've shared the Google Sheet with the service account email
- Check that permission is set to "Editor" (not "Viewer")

### Error: "No key or keyFile set"
- **Solution**: Credentials are already in Vercel, but you need to **redeploy** for them to take effect
- Go to: https://vercel.com/mady-mohas-projects/voting-system/deployments
- Click "Redeploy" on the latest deployment

### Error: "API not enabled"
- **Solution**: Make sure Google Sheets API is enabled in Google Cloud Console
- Go to: https://console.cloud.google.com/apis/library/sheets.googleapis.com
- Click "Enable" if not already enabled

### Sheet syncs but updates fail
- **Solution**: Service account needs "Editor" permission (not "Viewer")
- Re-share the sheet with Editor permission

## ✅ Complete Verification Checklist

- [x] Google Cloud Project created
- [x] Google Sheets API enabled
- [x] Service Account created
- [x] JSON key file downloaded
- [x] Service account email copied
- [x] Private key copied
- [x] GOOGLE_SHEETS_CLIENT_EMAIL added to Vercel
- [x] GOOGLE_SHEETS_PRIVATE_KEY added to Vercel
- [ ] **Google Sheet shared with service account email** ← **DO THIS NOW**
- [ ] Service account has "Editor" permission on sheet
- [ ] Redeploy to Vercel (if credentials were just added)
- [ ] Test sync successful

## 🚀 Next Steps

1. **Share the Google Sheet** with the service account (see above)
2. **Redeploy** (if you just added credentials):
   - Go to: https://vercel.com/mady-mohas-projects/voting-system/deployments
   - Click "Redeploy" on latest deployment
   - Wait 1-2 minutes
3. **Test the sync** using the Settings page
4. **Add some test voters** to your Google Sheet and sync again

## 📝 Summary

Your setup is **99% complete**! You just need to:
1. Share the Google Sheet with: `voting-system-sheets@sublime-habitat-483019-a8.iam.gserviceaccount.com`
2. Set permission to "Editor"
3. Test the sync

Once that's done, your private Google Sheets will sync automatically! 🎉


