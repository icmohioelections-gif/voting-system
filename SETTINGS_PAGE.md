# Settings Page - Features

## ✅ New Features Added

### 1. Settings Tab in Admin Dashboard

A new "Settings" tab has been added to the Admin Dashboard with the following features:

#### Database Reset
- **Purpose**: Clean the database and start fresh
- **Functionality**: Deletes ALL votes, voters, and candidates
- **Safety**: Double confirmation required before deletion
- **Warning**: Action cannot be undone

#### Google Sheet URL Sync
- **Purpose**: Sync voters directly from a Google Sheet URL
- **How it works**: 
  - Uses CSV export method (works with publicly accessible sheets)
  - Falls back to Google Sheets API if credentials are configured
- **No authentication needed** for public sheets!

## 📋 How to Use

### Google Sheet URL Sync

1. **Make your Google Sheet public** (if not already):
   - Open your Google Sheet
   - Click "Share" button (top right)
   - Change access to "Anyone with the link" → "Viewer"
   - Copy the URL

2. **Sync from Settings**:
   - Go to Admin Dashboard → Settings tab
   - Paste your Google Sheet URL
   - Click "Sync from Sheet URL"
   - Voters will be imported automatically

### Database Reset

1. **Go to Settings Tab**
2. **Click "Reset Database (Delete All Data)"**
3. **Confirm twice** (safety measure)
4. **All data will be deleted**:
   - All votes
   - All voters
   - All candidates

## 🔧 Technical Details

### Google Sheet URL Format
The system accepts URLs in this format:
```
https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit?gid={GID}
```

The system automatically:
- Extracts the spreadsheet ID
- Extracts the GID (sheet tab)
- Uses CSV export URL: `https://docs.google.com/spreadsheets/d/{ID}/export?format=csv&gid={GID}`

### CSV Format Expected
The Google Sheet should have this format:
```csv
election_code,first_name,last_name,has_voted,voted_at
ABC123,John,Doe,FALSE,
XYZ789,Jane,Smith,FALSE,
```

### API Endpoints

#### POST `/api/admin/sync-sheet-url`
- Accepts: `{ sheet_url: string }`
- Returns: `{ success: boolean, message: string, synced: number }`
- Works with public sheets (CSV export) or private sheets (if API credentials configured)

#### POST `/api/admin/reset-db`
- Deletes all data from votes, voters, and candidates tables
- Returns: `{ success: boolean, message: string }`
- Requires double confirmation on frontend

## ⚠️ Important Notes

1. **Public Sheets**: The CSV export method only works if the sheet is publicly accessible (view permission). If not, you'll need to configure Google Sheets API credentials.

2. **Sheet Format**: The sheet should have a header row and data starting from row 2.

3. **Reset Database**: This is a destructive operation. Use with caution. All data will be permanently deleted.

4. **Fallback to API**: If CSV export fails and you have Google Sheets API credentials configured, the system will automatically try using the API method.

## 🎯 Benefits

- ✅ **No API credentials needed** for public sheets
- ✅ **Easy sync** - just paste the URL
- ✅ **Clean setup** - reset database with one click
- ✅ **Safe** - double confirmation for destructive operations
- ✅ **Flexible** - works with both public and private sheets


