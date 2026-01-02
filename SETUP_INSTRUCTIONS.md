# Quick Setup Instructions

Follow these steps to get your voting system up and running:

## 1. GitHub Repository Setup

```bash
cd /Users/mohammad/voting-system

# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: Secure Voting System"

# Create a new repository on GitHub, then:
git remote add origin <YOUR_GITHUB_REPO_URL>
git branch -M main
git push -u origin main
```

## 2. Supabase Setup

1. **Create Project**: Go to https://supabase.com/dashboard/project/nvfxbvntzryewptndvoj (your existing project)

2. **Run Schema SQL**:
   - Navigate to SQL Editor in Supabase dashboard
   - Copy contents of `supabase/schema.sql`
   - Paste and execute

3. **Get Credentials**:
   - Go to Settings → API
   - Copy:
     - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
     - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`

## 3. Google Sheets Setup

### Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Enable "Google Sheets API"
4. Go to "IAM & Admin" → "Service Accounts"
5. Create Service Account:
   - Name: `voting-system-sheets`
   - Role: Editor (or custom role with Sheets access)
6. Create JSON key and download
7. Note the `client_email` from JSON

### Prepare Your Google Sheet

1. Open your sheet: https://docs.google.com/spreadsheets/d/163BMLKY3rzA6udXKJiuDMamGYlejd7_q/edit
2. Format as follows (starting from row 1):

   | election_code | first_name | last_name | has_voted | voted_at |
   |--------------|------------|-----------|-----------|----------|
   | abc123       | John       | Doe       | FALSE     |          |

3. **Share the sheet** with the service account email (from step above) with "Editor" permission
4. Get Sheet ID from URL: `163BMLKY3rzA6udXKJiuDMamGYlejd7_q`

## 4. Environment Variables

Create `.env.local` file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://nvfxbvntzryewptndvoj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

GOOGLE_SHEETS_SPREADSHEET_ID=163BMLKY3rzA6udXKJiuDMamGYlejd7_q
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: 
- For `GOOGLE_SHEETS_PRIVATE_KEY`, copy the entire private key from JSON file including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines
- Replace `\n` actual newlines with `\n` string (the file should have actual line breaks)

## 5. Add Initial Data

### Add Candidates (via Supabase SQL Editor)

```sql
INSERT INTO candidates (name, position) VALUES
('Candidate 1', 'President'),
('Candidate 2', 'President');
```

### Sync Voters

1. Add voters to your Google Sheet (columns A-E)
2. Run the app: `npm run dev`
3. Visit: http://localhost:3000/admin
4. Go to "Sync" tab
5. Click "Sync from Google Sheets"

## 6. Test Locally

```bash
npm run dev
```

Visit:
- Home: http://localhost:3000
- Verify: http://localhost:3000/verify
- Login: http://localhost:3000/login
- Admin: http://localhost:3000/admin

## 7. Deploy to Vercel

### Option A: Via GitHub (Recommended)

1. Push code to GitHub (from step 1)
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Add all environment variables from `.env.local`
5. Deploy!

### Option B: Via Vercel CLI

```bash
npm install -g vercel
vercel
# Follow prompts, add env vars when asked
vercel --prod
```

## 8. Post-Deployment

1. Update `NEXT_PUBLIC_APP_URL` in Vercel to your production URL
2. Test all flows on production
3. Sync voters from Google Sheets via Admin Dashboard

## Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Google Sheets API errors
- Verify service account email has access to sheet
- Check private key format (must include newlines)
- Verify sheet ID is correct

### Supabase connection errors
- Verify URLs and keys are correct
- Check Supabase project is active
- Ensure schema.sql was executed successfully

### Build errors on Vercel
- Check environment variables are set correctly
- Verify all dependencies in package.json
- Check build logs in Vercel dashboard

## Next Steps

- Customize UI/styling as needed
- Add more security features if required
- Set up monitoring and alerts
- Configure custom domain

