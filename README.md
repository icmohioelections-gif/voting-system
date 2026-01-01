# Voting System

A secure, auditable web-based voting application supporting both in-person verification and online voting, built with Next.js, Supabase, and Google Sheets.

## Features

- **In-Person Verification Mode**: Election committee can verify voters and mark them as voted
- **Online Voting Mode**: Voters can cast votes using election code + name authentication
- **Google Sheets Integration**: Voter registry synced with Google Sheets as source of truth
- **Secure & Auditable**: Row-level security, vote locking, and comprehensive audit trail
- **Admin Dashboard**: View results, manage voters, and sync data

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Row Level Security)
- **Integration**: Google Sheets API
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Google Cloud Project with Sheets API enabled
- Google Service Account credentials

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd voting-system
npm install
```

### 2. Supabase Setup

1. Create a new project at [Supabase](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Copy your project URL and API keys:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### 3. Google Sheets Setup

1. Create a Google Sheet with the following structure:

   | election_code | first_name | last_name | has_voted | voted_at |
   |--------------|------------|-----------|-----------|----------|
   | abc123       | John       | Doe       | FALSE     |          |
   | xyz789       | Jane       |           | FALSE     |          |

2. Enable Google Sheets API:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable "Google Sheets API"
   - Create a Service Account
   - Download JSON credentials
   - Share your Google Sheet with the service account email (found in credentials)

3. Extract credentials from JSON:
   - `client_email`: Service account email
   - `private_key`: Private key (keep the `\n` newlines or use `.replace(/\\n/g, '\n')`)

### 4. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

GOOGLE_SHEETS_SPREADSHEET_ID=your_google_sheets_id
GOOGLE_SHEETS_CLIENT_EMAIL=your_service_account_email
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: 
- Get `GOOGLE_SHEETS_SPREADSHEET_ID` from your Google Sheet URL: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
- For `GOOGLE_SHEETS_PRIVATE_KEY`, wrap the entire key in quotes and preserve `\n` characters

### 5. Initialize Data

1. **Add Candidates**: Use Supabase dashboard or SQL to add candidates:
   ```sql
   INSERT INTO candidates (name, position) VALUES
   ('John Doe', 'President'),
   ('Jane Smith', 'President');
   ```

2. **Sync Voters**: 
   - Populate your Google Sheet with voter data
   - Go to Admin Dashboard → Sync tab
   - Click "Sync from Google Sheets"

### 6. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/new)
3. Import your GitHub repository
4. Add all environment variables from `.env.local`
5. Deploy

### Option 2: Deploy via Vercel CLI

```bash
npm install -g vercel
vercel
# Follow prompts and add environment variables
```

**Important**: Make sure to add all environment variables in Vercel dashboard under Project Settings → Environment Variables.

## Usage

### In-Person Verification

1. Navigate to `/verify`
2. Enter voter's election code
3. Verify voter information
4. Mark as voted if voting in person

### Online Voting

1. Voter navigates to `/login`
2. Enters election code and name (first name OR last name)
3. Selects candidate on `/vote` page
4. Submits vote
5. Receives confirmation

### Admin Dashboard

Navigate to `/admin` to:
- View voting results and statistics
- View all voters and their voting status
- View candidates
- Sync data from Google Sheets

## Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Service Role Isolation**: Admin operations use service role key
- **Vote Locking**: Once voted, voter cannot vote again
- **Unique Constraints**: Database enforces one vote per voter
- **Audit Trail**: All votes timestamped and tracked

## Google Sheets Format

Your Google Sheet should follow this format:

**Column A**: `election_code` (text, unique)
**Column B**: `first_name` (text, required)
**Column C**: `last_name` (text, optional)
**Column D**: `has_voted` (boolean: TRUE/FALSE)
**Column E**: `voted_at` (timestamp, auto-filled when voted)

The system will automatically update columns D and E when votes are cast.

## Architecture

```
Frontend (Next.js)
    ↓
API Routes (/app/api/*)
    ↓
Supabase Admin Client (service role)
    ↓
PostgreSQL Database (with RLS)
    ↕
Google Sheets API (read/write)
```

## Troubleshooting

### "Invalid election code" error
- Verify the election code exists in Google Sheets
- Run sync from Admin Dashboard
- Check Supabase database directly

### Google Sheets sync fails
- Verify service account has access to the sheet
- Check that sheet ID is correct
- Ensure private key is properly formatted with `\n` characters

### Vote submission fails
- Check voter hasn't already voted
- Verify candidate ID is valid
- Check Supabase logs for errors

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
