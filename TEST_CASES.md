# Voting System - Test Cases & Testing Guide

This document provides comprehensive test cases and instructions for testing the voting system.

## 🎯 Testing Overview

The voting system supports two modes:
1. **Online Voting**: Voters log in and cast votes through the web interface
2. **In-Person Verification**: Election committee verifies voters and marks them as voted

## 📋 Prerequisites

Before testing, ensure you have:
- ✅ Application deployed and accessible
- ✅ Admin dashboard access
- ✅ Supabase database connected
- ✅ At least 2-3 test candidates added
- ✅ Test voters added (via CSV upload or Google Sheets)

## 🧪 Test Cases

### 1. Admin Setup Tests

#### 1.1 Add Candidates
**Steps:**
1. Go to Supabase Dashboard → SQL Editor
2. Run the following SQL:
```sql
INSERT INTO candidates (name, position) VALUES
('Alice Johnson', 'President'),
('Bob Smith', 'President'),
('Carol Williams', 'Vice President'),
('David Brown', 'Vice President');
```

**Expected Result:**
- Candidates are added to the database
- They appear in Admin Dashboard → Candidates tab

#### 1.2 Upload Voters via CSV
**Steps:**
1. Create a CSV file with the following content:
```csv
election_code,first_name,last_name
VOTE001,John,Doe
VOTE002,Jane,Smith
VOTE003,Bob,Johnson
VOTE004,Alice,Williams
VOTE005,Charlie,Brown
```

2. Go to Admin Dashboard → Sync tab
3. Click "Choose File" and select your CSV
4. Click "Upload CSV"

**Expected Result:**
- Success message showing number of voters uploaded
- Voters appear in Admin Dashboard → Voters tab
- All voters show "Not Voted" status

#### 1.3 View Voters List
**Steps:**
1. Go to Admin Dashboard → Voters tab
2. Check the voters list

**Expected Result:**
- All uploaded voters are displayed
- Columns: Election Code, Name, Status, Voted At
- Status shows "Not Voted" for new voters

---

### 2. Online Voting Flow Tests

#### 2.1 Login with Valid Credentials
**Steps:**
1. Navigate to `/login`
2. Enter a valid election code (e.g., `VOTE001`)
3. Enter matching first name or last name (e.g., `John` or `Doe`)
4. Click "Login"

**Expected Result:**
- Successfully redirects to `/vote` page
- Voter information is displayed
- Candidate list is shown

#### 2.2 Login with Invalid Election Code
**Steps:**
1. Navigate to `/login`
2. Enter invalid election code (e.g., `INVALID123`)
3. Enter any name
4. Click "Login"

**Expected Result:**
- Error message: "Invalid election code"
- Stays on login page

#### 2.3 Login with Wrong Name
**Steps:**
1. Navigate to `/login`
2. Enter valid election code (e.g., `VOTE001`)
3. Enter wrong name (e.g., `WrongName`)
4. Click "Login"

**Expected Result:**
- Error message: "Name does not match election code"
- Stays on login page

#### 2.4 Login with Already Voted Voter
**Steps:**
1. First, complete a vote for a voter (see Test 2.5)
2. Try to login again with the same election code and name

**Expected Result:**
- Error message: "You have already voted"
- Stays on login page

#### 2.5 Cast a Vote
**Steps:**
1. Login with valid credentials
2. On the vote page, select a candidate
3. Click "Submit Vote"

**Expected Result:**
- Redirects to `/confirmation` page
- Success message displayed
- Vote is recorded in database
- Voter status updated to "Voted" in Admin Dashboard

#### 2.6 Attempt Double Voting
**Steps:**
1. After casting a vote, try to access `/vote` directly
2. Or try to vote again through the interface

**Expected Result:**
- System prevents duplicate voting
- Appropriate error message shown
- Only one vote is recorded per voter

---

### 3. In-Person Verification Flow Tests

#### 3.1 Verify Voter (Check Status)
**Steps:**
1. Navigate to `/verify`
2. Enter a valid election code (e.g., `VOTE002`)
3. Click "Verify"

**Expected Result:**
- Voter information is displayed:
  - Election Code
  - First Name
  - Last Name
  - Voting Status (Not Voted / Voted)
- If voted, shows when they voted

#### 3.2 Mark Voter as Voted (In-Person)
**Steps:**
1. On `/verify` page, enter election code for a voter who hasn't voted
2. Click "Verify" to see their info
3. Click "Mark as Voted" button

**Expected Result:**
- Success message displayed
- Voter status updated to "Voted" in database
- Timestamp recorded
- Voter cannot vote online after this

#### 3.3 Verify Already Voted Voter
**Steps:**
1. Navigate to `/verify`
2. Enter election code for a voter who already voted
3. Click "Verify"

**Expected Result:**
- Voter information shown
- Status displays "Voted"
- Shows timestamp of when they voted
- "Mark as Voted" button is disabled or not shown

---

### 4. Admin Dashboard Tests

#### 4.1 View Voting Results
**Steps:**
1. After some votes have been cast
2. Go to Admin Dashboard → Results tab

**Expected Result:**
- Statistics displayed:
  - Total Voters
  - Votes Cast
  - Turnout Percentage
- Results list shows:
  - Candidates sorted by vote count (highest first)
  - Vote count for each candidate
  - Candidate name and position

#### 4.2 View Voters List
**Steps:**
1. Go to Admin Dashboard → Voters tab

**Expected Result:**
- Complete list of all voters
- Shows voting status for each
- Shows timestamp when voted (if applicable)
- Can see which voters have voted and which haven't

#### 4.3 View Candidates List
**Steps:**
1. Go to Admin Dashboard → Candidates tab

**Expected Result:**
- All candidates displayed
- Shows candidate name and position
- Organized in a grid or list format

---

### 5. Edge Cases & Error Handling

#### 5.1 Empty CSV Upload
**Steps:**
1. Create an empty CSV file
2. Try to upload it

**Expected Result:**
- Error message: "No valid voters found in CSV file"

#### 5.2 CSV with Missing Required Columns
**Steps:**
1. Create CSV with only `first_name` column (missing `election_code`)
2. Try to upload

**Expected Result:**
- Error message indicating missing columns
- Upload fails

#### 5.3 CSV with Duplicate Election Codes
**Steps:**
1. Create CSV with duplicate election codes:
```csv
election_code,first_name,last_name
VOTE001,John,Doe
VOTE001,Jane,Smith
```

2. Upload CSV

**Expected Result:**
- System handles duplicates (upsert behavior)
- Last entry overwrites previous one
- Success message shows number uploaded

#### 5.4 Vote with Invalid Candidate ID
**Steps:**
1. Login successfully
2. Try to submit vote with invalid candidate ID (via browser dev tools)

**Expected Result:**
- Server validates candidate ID
- Returns error if invalid
- Vote is not recorded

#### 5.5 Concurrent Voting Attempt
**Steps:**
1. Login with same credentials in two different browsers/tabs
2. Try to vote in both simultaneously

**Expected Result:**
- Database constraints prevent duplicate votes
- Only first vote succeeds
- Second attempt fails with appropriate error

---

### 6. Data Integrity Tests

#### 6.1 Verify Vote Count Accuracy
**Steps:**
1. Cast votes for different candidates
2. Count votes manually
3. Compare with Admin Dashboard results

**Expected Result:**
- Vote counts match exactly
- All votes are accounted for

#### 6.2 Verify Voter Status Consistency
**Steps:**
1. Cast a vote online
2. Check voter status in Admin Dashboard
3. Check voter status in `/verify` page

**Expected Result:**
- Status is consistent across all views
- Timestamp matches when vote was cast

#### 6.3 Verify Database Constraints
**Steps:**
1. Try to add voter with duplicate election_code (via SQL or API)
2. Try to add vote with invalid voter_id

**Expected Result:**
- Database enforces unique constraints
- Foreign key constraints prevent invalid references
- Appropriate errors returned

---

## 🚀 Quick Test Script

Here's a quick manual test script to verify the system end-to-end:

```bash
# 1. Setup (via Supabase SQL Editor)
INSERT INTO candidates (name, position) VALUES
('Test Candidate 1', 'President'),
('Test Candidate 2', 'President');

# 2. Upload Voters (via Admin Dashboard CSV Upload)
# CSV Content:
election_code,first_name,last_name
TEST001,Test,User1
TEST002,Test,User2
TEST003,Test,User3

# 3. Test Online Voting
# - Login: election_code=TEST001, name=Test
# - Vote for Candidate 1
# - Verify redirect to confirmation

# 4. Test In-Person Verification
# - Go to /verify
# - Enter election_code=TEST002
# - Mark as voted
# - Verify status update

# 5. Check Results
# - Go to Admin Dashboard → Results
# - Verify TEST001 and TEST002 show as voted
# - Verify vote count for Candidate 1 = 1

# 6. Test Duplicate Prevention
# - Try to login with TEST001 again
# - Should fail with "already voted" error

# 7. Final Verification
# - Admin Dashboard → Voters tab
# - Verify 2 voters show "Voted" status
# - Verify 1 voter shows "Not Voted" status
```

---

## 📊 Test Data Templates

### CSV Template for Voters
```csv
election_code,first_name,last_name
VOTE001,John,Doe
VOTE002,Jane,Smith
VOTE003,Bob,Johnson
VOTE004,Alice,Williams
VOTE005,Charlie,Brown
```

### SQL Template for Candidates
```sql
INSERT INTO candidates (name, position) VALUES
('Alice Johnson', 'President'),
('Bob Smith', 'President'),
('Carol Williams', 'Vice President'),
('David Brown', 'Vice President');
```

---

## ✅ Checklist

Use this checklist to ensure all features are tested:

- [ ] Candidates can be added via SQL
- [ ] Voters can be uploaded via CSV
- [ ] Voters list displays correctly
- [ ] Login with valid credentials works
- [ ] Login with invalid credentials fails appropriately
- [ ] Online voting flow works end-to-end
- [ ] Vote confirmation page displays
- [ ] Double voting is prevented
- [ ] In-person verification works
- [ ] Mark as voted works for in-person voting
- [ ] Admin results display correctly
- [ ] Vote counts are accurate
- [ ] Statistics (turnout, etc.) are correct
- [ ] CSV upload handles errors gracefully
- [ ] All error messages are user-friendly

---

## 🐛 Common Issues & Solutions

### Issue: CSV upload fails
**Solution:** 
- Ensure CSV has header row
- Check that election_code and first_name columns exist
- Verify CSV is valid (no encoding issues)

### Issue: Votes not showing in results
**Solution:**
- Check that candidates exist in database
- Verify vote was successfully recorded
- Refresh admin dashboard

### Issue: Login fails even with correct credentials
**Solution:**
- Check voter exists in database
- Verify election_code matches exactly (case-sensitive)
- Check name matches (first_name OR last_name)

### Issue: Cannot mark as voted
**Solution:**
- Verify voter exists
- Check voter hasn't already voted
- Verify API endpoint is accessible

---

## 📝 Notes

- All election codes are case-sensitive
- Name matching is case-insensitive but must match exactly
- Votes are permanent and cannot be changed once cast
- Voter data can be updated via CSV upload (upsert behavior)
- Google Sheets sync requires API credentials (optional feature)


