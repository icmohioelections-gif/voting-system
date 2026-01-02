# VoteSecure - Secure Online Voting System

A modern, secure, and user-friendly online voting platform built with Next.js, TypeScript, and Supabase. Designed for organizations that need a reliable, auditable voting system with real-time results and comprehensive admin controls.

![VoteSecure](https://img.shields.io/badge/VoteSecure-Secure%20Voting-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)

## 🎯 Overview

VoteSecure is a comprehensive voting platform that enables organizations to conduct secure online elections. It features a clean, Apple-inspired UI design, real-time vote tracking, session management, and integration with Google Sheets for voter management.

## ✨ Key Features

### 🗳️ For Voters
- **Secure Authentication**: Login using election code and name verification
- **Candidate Profiles**: View candidates with photos, positions, and descriptions
- **One-Time Voting**: Secure vote submission with duplicate prevention
- **5-Day Voting Window**: Flexible voting period from account creation
- **Session Management**: 30-minute active sessions with automatic timeout
- **Terms & Conditions**: Explicit consent before vote submission
- **Vote Confirmation**: Thank you page after successful submission

### 👨‍💼 For Administrators
- **Live Results Dashboard**: Real-time vote counts with visual progress bars
- **Fast Voter Management**: TanStack Table with search, sort, and pagination
- **Login Status Tracking**: Monitor which voters are currently logged in
- **Candidate Management**: Add candidates with photos and descriptions
- **Multiple Data Sources**: 
  - CSV file upload
  - Google Sheets API integration
  - Google Sheet URL sync (public or private sheets)
- **Database Management**: Reset database for clean slate
- **Voter Analytics**: Track login times, vote status, and participation

### 🔒 Security Features
- **Session-Based Authentication**: Secure token-based sessions
- **No Double Voting**: Database-level vote uniqueness enforcement
- **Session Expiry**: Automatic logout after 30 minutes of inactivity
- **Route Protection**: Server-side verification on all voting endpoints
- **Voter Lock**: Voters cannot login after voting
- **Admin Session Isolation**: Admin access forces voter logout

### 🎨 User Experience
- **Modern UI Design**: Apple-inspired minimalist interface
- **Smooth Animations**: Elegant transitions and micro-interactions
- **Custom Typography**: ANTON for headings, Alexandria for body text
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Support**: Full dark mode compatibility
- **Real-Time Updates**: Live vote counts and statistics

## 🛠️ Technology Stack

- **Framework**: Next.js 16.1 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Data Tables**: TanStack Table (React Table v8)
- **Authentication**: Session-based with JWT
- **External Integrations**: Google Sheets API
- **Deployment**: Vercel
- **Fonts**: Google Fonts (ANTON, Alexandria)

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Google Cloud account (for Sheets API - optional)
- Vercel account (for deployment)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/icmohioelections-gif/voting-system.git
cd voting-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase/schema.sql`
3. Get your credentials from Settings → API:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### 4. Configure Environment Variables

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Sheets (Optional - for sync functionality)
GOOGLE_SHEETS_SPREADSHEET_ID=your_sheet_id
GOOGLE_SHEETS_CLIENT_EMAIL=your_service_account_email
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key\n-----END PRIVATE KEY-----\n"

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### For Administrators

#### Adding Candidates
1. Navigate to `/admin/candidates`
2. Fill in candidate details:
   - Name (required)
   - Position (required)
   - Photo URL (optional)
   - Description (optional)
3. Click "Add Candidate"

#### Managing Voters

**Option 1: Google Sheets Sync (Recommended)**
1. Go to `/admin/settings`
2. Prepare your Google Sheet with one of these formats:
   - **Detailed Format**: `election_code | first_name | last_name | has_voted | voted_at`
   - **Simple Format**: Just names in the first column (codes auto-generated)
3. Make sheet public or configure API credentials
4. Enter the Google Sheet URL and click "Sync from Sheet URL"

**Option 2: CSV Upload**
1. Go to `/admin/settings`
2. Prepare a CSV file with headers: `election_code,first_name,last_name`
3. Upload the CSV file
4. Click "Upload CSV"

**Option 3: Manual Entry**
1. Go to `/admin/voters`
2. Fill in voter details and election code
3. Click "Add Voter"

#### Viewing Results
- Navigate to `/admin/results`
- View live vote counts with visual progress bars
- See total voters, votes cast, and turnout percentage

#### Database Management
- Go to `/admin/settings`
- Use "Reset Database" to clear all data (use with caution!)

### For Voters

1. Visit the home page
2. Click "Online Voting"
3. Enter your election code and name
4. Review candidates and select your choice
5. Agree to terms and submit your vote
6. View confirmation message

## 🗂️ Project Structure

```
voting-system/
├── app/
│   ├── admin/              # Admin dashboard routes
│   │   ├── [tab]/         # Dynamic tab routing
│   │   └── AdminDashboard.tsx
│   ├── api/               # API routes
│   │   ├── admin/         # Admin endpoints
│   │   ├── auth/          # Authentication endpoints
│   │   ├── candidates/    # Candidate endpoints
│   │   ├── vote/          # Voting endpoints
│   │   └── verify/        # Verification endpoints
│   ├── confirmation/      # Vote confirmation page
│   ├── login/             # Voter login page
│   ├── vote/              # Voting interface
│   └── page.tsx           # Home page
├── components/
│   ├── admin/             # Admin-specific components
│   │   └── VotersTable.tsx
│   ├── Logo.tsx           # Logo component
│   └── NavBar.tsx         # Navigation bar
├── lib/
│   ├── election-codes.ts  # Election code generation
│   ├── google-sheets.ts   # Google Sheets integration
│   ├── sessions.ts        # Session management
│   └── supabase.ts        # Supabase client
├── public/
│   └── assets/            # Static assets (logos, images)
├── supabase/
│   └── schema.sql         # Database schema
└── README.md
```

## 🔐 Security Considerations

- **Session Security**: 30-minute session timeout with automatic cleanup
- **Vote Integrity**: Database constraints prevent duplicate votes
- **Authentication**: Server-side verification on all critical endpoints
- **Data Privacy**: RLS (Row Level Security) policies enabled
- **Session Isolation**: Admin and voter sessions cannot coexist

## 🌐 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add all environment variables from `.env.local`
4. Deploy!

Or use Vercel CLI:

```bash
npm i -g vercel
vercel
vercel --prod
```

## 📊 Database Schema

### Tables

- **voters**: Stores voter information and voting status
- **candidates**: Stores candidate information
- **votes**: Stores individual votes (one per voter)
- **sessions**: Tracks active voting sessions

### Key Fields

- `election_code`: Unique 10-character alphanumeric code for each voter
- `has_voted`: Boolean flag preventing duplicate votes
- `is_logged_in`: Real-time login status tracking
- `voting_start_date`: Starting point for 5-day voting window

## 🔄 Google Sheets Integration

VoteSecure supports two methods for syncing voter data from Google Sheets:

1. **Public Sheet Method**: Sheet must be publicly accessible (view permission)
2. **API Method**: Uses Google Service Account credentials (more secure)

See `GOOGLE_SHEETS_API_SETUP.md` for detailed setup instructions.

## 🎨 Design Philosophy

VoteSecure follows Apple's design principles:
- **Minimalism**: Clean, uncluttered interfaces
- **Clarity**: Clear visual hierarchy and typography
- **Consistency**: Unified design language throughout
- **Feedback**: Smooth animations and transitions
- **Accessibility**: High contrast, readable fonts

## 📝 Default Setup

The system comes with:
- 2 default candidates (Candidate 1, Candidate 2) for quick testing
- Session management enabled
- 30-minute session timeout
- 5-day voting window

## 🐛 Troubleshooting

### Common Issues

**Google Sheets sync fails:**
- Ensure sheet is public OR API credentials are configured
- Check service account has access to the sheet
- Verify environment variables are set correctly

**Voters can't login:**
- Check election code and name match exactly
- Verify voter hasn't already voted
- Ensure voting window hasn't expired (5 days)

**Admin dashboard shows errors:**
- Verify all environment variables are set
- Check Supabase connection
- Review browser console for errors

## 📚 Documentation

- `GOOGLE_SHEETS_API_SETUP.md` - Google Sheets integration guide
- `GOOGLE_SHEET_FORMAT.md` - Supported sheet formats
- `TROUBLESHOOTING_GOOGLE_SHEETS.md` - Common issues and solutions
- `TEST_CASES.md` - Testing scenarios

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is proprietary and confidential.

## 🆘 Support

For issues, questions, or feature requests, please contact the development team.

## 🎯 Roadmap

Potential future enhancements:
- [ ] Email notifications for voters
- [ ] Export results to PDF/Excel
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] SMS verification
- [ ] Ballot tracking system
- [ ] Custom election configurations
- [ ] Voter invitation system

---

**Built with ❤️ for secure, transparent elections**
