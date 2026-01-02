# Troubleshooting Google Sheets API Error

## Error: "This operation is not supported for this document"

This error typically means one of the following:

### 1. Google Sheets API Not Enabled

**Check if API is enabled:**
1. Go to: https://console.cloud.google.com/apis/library/sheets.googleapis.com
2. Make sure you're in the correct project: `sublime-habitat-483019-a8`
3. If it says "Enable", click it
4. Wait a few minutes for it to propagate

### 2. Wrong Sheet Name

The code might be looking for "Sheet1" but your sheet might have a different name.

**Check your sheet name:**
1. Open your Google Sheet
2. Look at the bottom tabs - what's the name of the sheet?
3. If it's not "Sheet1", the sync might fail

**Solution**: The code now automatically detects the sheet name, but you can also:
- Rename your sheet tab to "Sheet1"
- Or update the code to use your sheet name

### 3. Sheet Format Issues

Make sure your sheet:
- Has a header row (row 1)
- Has data starting from row 2
- Uses standard Google Sheets format (not a converted Excel file with issues)

### 4. Service Account Permissions

Even if shared, sometimes permissions take time to propagate.

**Verify sharing:**
1. Open your Google Sheet
2. Click "Share"
3. Make sure `voting-system-sheets@sublime-habitat-483019-a8.iam.gserviceaccount.com` is listed
4. Make sure permission is "Editor" (not "Viewer")
5. If it's not there, add it again

### 5. Try Using the Sync Tab Instead

The Settings tab uses a different method. Try the "Sync" tab:
1. Go to Admin Dashboard
2. Click "Sync" tab (not "Settings")
3. Click "Sync from Google Sheets"
4. This uses the `GOOGLE_SHEETS_SPREADSHEET_ID` environment variable directly

### 6. Check API Quotas

If you've made many requests, you might have hit quota limits.

**Check quotas:**
1. Go to: https://console.cloud.google.com/apis/api/sheets.googleapis.com/quotas
2. Check if you're near any limits
3. Free tier allows 300 requests per minute per project

### 7. Test with a Simple Sheet

Create a test sheet to verify the setup:
1. Create a new Google Sheet
2. Add this data:
   ```
   election_code,first_name,last_name,has_voted,voted_at
   TEST001,Test,User,FALSE,
   TEST002,Test2,User2,FALSE,
   ```
3. Share with the service account email
4. Try syncing this test sheet
5. If this works, the issue is with your original sheet

### 8. Check Sheet ID

Make sure you're using the correct sheet ID:
- Your sheet ID: `163BMLKY3rzA6udXKJiuDMamGYlejd7_q`
- From URL: `https://docs.google.com/spreadsheets/d/163BMLKY3rzA6udXKJiuDMamGYlejd7_q/edit`

### 9. Verify Environment Variables

Double-check that credentials are correct:
1. Go to Vercel: https://vercel.com/mady-mohas-projects/voting-system/settings/environment-variables
2. Verify:
   - `GOOGLE_SHEETS_CLIENT_EMAIL` matches: `voting-system-sheets@sublime-habitat-483019-a8.iam.gserviceaccount.com`
   - `GOOGLE_SHEETS_PRIVATE_KEY` is set (should show as "Encrypted")
   - `GOOGLE_SHEETS_SPREADSHEET_ID` matches: `163BMLKY3rzA6udXKJiuDMamGYlejd7_q`

### 10. Redeploy

After making changes, redeploy:
1. Go to: https://vercel.com/mady-mohas-projects/voting-system/deployments
2. Click "Redeploy" on latest deployment
3. Wait for deployment to complete

## Quick Diagnostic Steps

1. ✅ Verify Google Sheets API is enabled
2. ✅ Verify service account email is shared with Editor permission
3. ✅ Try the "Sync" tab instead of "Settings" tab
4. ✅ Check sheet name (should be "Sheet1" or first sheet)
5. ✅ Verify environment variables in Vercel
6. ✅ Redeploy after any changes
7. ✅ Check API quotas

## Still Not Working?

If none of the above works, try:
1. Create a completely new Google Sheet
2. Share it with the service account
3. Test with that sheet
4. If that works, the issue is specific to your original sheet

Let me know which step resolves the issue!


