# 🧪 Testing Guide - All Features

## ✅ Correct Deployment URLs

**Production Deployment:** `voting-system-f194nsapq-calcanx.vercel.app`
**Production Alias:** `voting-system-calcanx.vercel.app`
**ICM Domain:** `https://icm-voting.vercel.app`

---

## 🎯 Feature Testing Locations

### 1. ✅ Admin Credentials
**Test Location:** https://icm-voting.vercel.app/admin/login
- **Email:** `admin@admin.com`
- **Password:** `admin`

---

### 2. ✅ Letter Template Page
**Test Location:** https://icm-voting.vercel.app/admin/templates

**How to Access:**
1. Login to admin panel: https://icm-voting.vercel.app/admin/login
2. Go to **Voters** tab
3. Click **"Edit Templates"** button in the header
4. OR directly visit: https://icm-voting.vercel.app/admin/templates

**What to Test:**
- ✅ TinyMCE editor loads
- ✅ Create new template
- ✅ Edit existing template
- ✅ Delete template
- ✅ Set default template
- ✅ Template variables ({{full_name}}, {{election_code}}, etc.)

**Expected Behavior:**
- Editor should load with default template
- You can create/edit templates with rich text
- Templates are saved to database

---

### 3. ✅ Download/Email Letters for Individual Voters
**Test Location:** https://icm-voting.vercel.app/admin/voters

**How to Access:**
1. Login to admin panel: https://icm-voting.vercel.app/admin/login
2. Go to **Voters** tab
3. Look for **"Actions"** column in the voters table
4. Each voter row has two buttons:
   - **Download** button (blue) - Downloads letter as HTML
   - **Email** button (green) - Opens email input popup

**What to Test:**
- ✅ Click "Download" button - should download HTML file
- ✅ Click "Email" button - should show email input popup
- ✅ Enter email and click "Send" - should send email (if configured)

**Expected Behavior:**
- Download button downloads `voter-letter-{election_code}.html`
- Email button shows popup with email input field
- Email functionality requires email service configuration

---

### 4. ✅ Generate New Election Codes with Validity Duration
**Test Location:** https://icm-voting.vercel.app/admin/voters

**How to Access:**
1. Login to admin panel: https://icm-voting.vercel.app/admin/login
2. Go to **Voters** tab
3. Look for **"Generate New Election Codes"** section at the top
4. OR go to **Settings** tab → **"Election Management"** section

**What to Test:**
- ✅ Enter validity days (1-365)
- ✅ Use quick buttons: 3, 5, 7 days
- ✅ Click "Generate New Codes" button
- ✅ Confirm dialog appears
- ✅ Codes are regenerated with new validity period

**Expected Behavior:**
- Input accepts 1-365 days
- Quick buttons set the value
- Confirmation dialog before regenerating
- Success message after completion
- All voters get new voting period

---

## 📋 Complete Test Checklist

### Admin Login
- [ ] Login with `admin@admin.com` / `admin`
- [ ] Access admin dashboard

### Letter Templates (Feature #2)
- [ ] Navigate to `/admin/templates`
- [ ] See default template loaded
- [ ] Create a new template
- [ ] Edit template content in TinyMCE
- [ ] Save template
- [ ] Set template as default
- [ ] Delete a template

### Download/Email Letters (Feature #3)
- [ ] Go to `/admin/voters`
- [ ] See "Actions" column in table
- [ ] Click "Download" button for a voter
- [ ] Verify HTML file downloads
- [ ] Click "Email" button
- [ ] Enter email address
- [ ] Send email (may show placeholder message if email not configured)

### Generate New Codes (Feature #4)
- [ ] Go to `/admin/voters`
- [ ] Find "Generate New Election Codes" section
- [ ] Enter custom validity days (e.g., 10)
- [ ] Click quick button (3, 5, or 7 days)
- [ ] Click "Generate New Codes"
- [ ] Confirm in dialog
- [ ] See success message

---

## 🔗 Direct Test Links

**Base URL:** `https://icm-voting.vercel.app`

1. **Admin Login:**
   - https://icm-voting.vercel.app/admin/login

2. **Letter Templates:**
   - https://icm-voting.vercel.app/admin/templates

3. **Voters (with Actions & Generate Codes):**
   - https://icm-voting.vercel.app/admin/voters

4. **Settings (Election Management):**
   - https://icm-voting.vercel.app/admin/settings

---

## ⚠️ Troubleshooting

### If Templates Page Shows 404:
- Check that migration was run successfully
- Verify `letter_templates` table exists in Supabase
- Check browser console for errors

### If Download/Email Buttons Don't Appear:
- Make sure you're logged in as admin
- Check that voters exist in the table
- Verify `VoterActions` component is imported in `VotersTable.tsx`

### If Generate Codes Doesn't Work:
- Check browser console for API errors
- Verify `election_settings` table exists
- Check that API route `/api/admin/election/regenerate-codes` exists

---

## 📝 Notes

- All features are deployed to: `voting-system-f194nsapq-calcanx.vercel.app`
- ICM domain: `https://icm-voting.vercel.app` should point to this deployment
- Database migration must be completed for templates to work
- Email functionality requires email service configuration (Resend, SendGrid, etc.)
