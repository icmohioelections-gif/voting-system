# CSV Upload Instructions

## 📄 Sample CSV File

A sample CSV file (`sample-voters.csv`) is included in this repository with 20 test voters ready to use.

## 📥 How to Download and Use

### Option 1: Download from GitHub
1. Go to: https://github.com/icmohioelections-gif/voting-system
2. Click on `sample-voters.csv`
3. Click "Raw" button to view the raw file
4. Right-click and "Save As" or copy the content
5. Save as `sample-voters.csv` on your computer

### Option 2: Create Your Own CSV

Use this format (save as `.csv` file):

```csv
election_code,first_name,last_name
VOTE001,John,Doe
VOTE002,Jane,Smith
VOTE003,Robert,Johnson
```

**Required Columns:**
- `election_code` - Unique identifier for each voter (required)
- `first_name` - Voter's first name (required)
- `last_name` - Voter's last name (optional, can be empty)

## 🚀 How to Upload

1. **Go to Admin Dashboard**
   - Visit: https://voting-system-five-rouge.vercel.app/admin
   - Or your local URL: http://localhost:3000/admin

2. **Navigate to Sync Tab**
   - Click on the "Sync" tab in the admin dashboard

3. **Upload CSV File**
   - Click "Choose File" or drag and drop your CSV file
   - Select `sample-voters.csv` (or your custom CSV)
   - Click "Upload CSV" button

4. **Verify Upload**
   - You should see a success message like: "✓ Successfully uploaded 20 voter(s)"
   - Go to "Voters" tab to see all uploaded voters
   - All voters should show "Not Voted" status initially

## ✅ Testing with Sample Data

After uploading, you can test the voting system:

1. **Test Login:**
   - Go to `/login`
   - Election Code: `VOTE001`
   - Name: `John` (or `Doe`)
   - Should successfully login

2. **Test Voting:**
   - After login, select a candidate
   - Submit vote
   - Should redirect to confirmation page

3. **Test Verification:**
   - Go to `/verify`
   - Enter: `VOTE002`
   - Should show Jane Smith's info
   - Can mark as voted

4. **Check Admin Dashboard:**
   - Go to `/admin` → Results tab
   - Should show vote counts
   - Go to `/admin` → Voters tab
   - Should show updated voting status

## 📝 CSV Format Requirements

- **Header row required** (first line must be column names)
- **Comma-separated values** (CSV format)
- **UTF-8 encoding** recommended
- **No quotes needed** (unless values contain commas)
- **Empty last_name is OK** (just leave empty after comma)

### Valid Examples:

```csv
election_code,first_name,last_name
ABC123,John,Doe
XYZ789,Jane,Smith
DEF456,Bob,
```

### Invalid Examples:

❌ Missing header:
```csv
VOTE001,John,Doe
VOTE002,Jane,Smith
```

❌ Missing required column:
```csv
first_name,last_name
John,Doe
```

❌ Missing first_name:
```csv
election_code,first_name,last_name
VOTE001,,Doe
```

## 🔄 Updating Existing Voters

If you upload a CSV with election codes that already exist, the system will **update** those voters (upsert behavior). This means:
- Existing voters will be updated with new information
- New voters will be added
- No duplicates will be created

## ⚠️ Common Issues

### Issue: "No valid voters found"
- **Solution:** Check that CSV has header row and at least one data row
- Ensure `election_code` and `first_name` columns exist
- Check for encoding issues (use UTF-8)

### Issue: "Missing election_code"
- **Solution:** Ensure column is named exactly `election_code` (case-sensitive)
- Can also accept: `electioncode` or `code` (case-insensitive)

### Issue: "Missing first_name"
- **Solution:** Ensure column is named exactly `first_name`
- Can also accept: `firstname` or `first` (case-insensitive)

### Issue: Upload succeeds but no voters appear
- **Solution:** Check Admin Dashboard → Voters tab
- Refresh the page
- Check browser console for errors

## 📊 Sample Data Included

The `sample-voters.csv` file includes:
- 20 test voters
- Election codes: VOTE001 through VOTE020
- Mix of common first and last names
- Ready to use for testing

You can use these to:
- Test login functionality
- Test voting process
- Test admin dashboard features
- Test vote counting and statistics

