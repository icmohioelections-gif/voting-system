# Quick Test Guide

## 🚀 Quick Start Testing

### 1. Add Test Candidates (via Supabase)

Go to Supabase Dashboard → SQL Editor and run:

```sql
INSERT INTO candidates (name, position) VALUES
('Alice Johnson', 'President'),
('Bob Smith', 'President');
```

### 2. Upload Test Voters (via Admin Dashboard)

1. Create a CSV file with this content:
```csv
election_code,first_name,last_name
TEST001,John,Doe
TEST002,Jane,Smith
TEST003,Bob,Johnson
```

2. Go to: `https://voting-system-five-rouge.vercel.app/admin`
3. Click the **Sync** tab
4. Upload your CSV file
5. Click "Upload CSV"

### 3. Test Online Voting

1. Go to: `https://voting-system-five-rouge.vercel.app/login`
2. Login with:
   - Election Code: `TEST001`
   - Name: `John` (or `Doe`)
3. Select a candidate and vote
4. Verify redirect to confirmation page

### 4. Test In-Person Verification

1. Go to: `https://voting-system-five-rouge.vercel.app/verify`
2. Enter election code: `TEST002`
3. Click "Verify" to see voter info
4. Click "Mark as Voted" to mark them as voted

### 5. Check Results

1. Go to: `https://voting-system-five-rouge.vercel.app/admin`
2. Click **Results** tab to see voting statistics
3. Click **Voters** tab to see voter status

## ✅ Expected Results

- ✅ TEST001 should show as "Voted" in admin dashboard
- ✅ TEST002 should show as "Voted" (if marked via verify page)
- ✅ TEST003 should show as "Not Voted"
- ✅ Results tab shows vote counts for candidates
- ✅ Trying to login with TEST001 again should fail with "already voted" error

## 📝 CSV Format

Required columns:
- `election_code` (required, unique)
- `first_name` (required)
- `last_name` (optional)

Example:
```csv
election_code,first_name,last_name
VOTE001,John,Doe
VOTE002,Jane,Smith
VOTE003,Bob,
```

## 🔗 Important Links

- **Live App**: https://voting-system-five-rouge.vercel.app
- **Admin Dashboard**: https://voting-system-five-rouge.vercel.app/admin
- **Supabase Dashboard**: https://supabase.com/dashboard/project/nvfxbvntzryewptndvoj

For detailed test cases, see `TEST_CASES.md`


