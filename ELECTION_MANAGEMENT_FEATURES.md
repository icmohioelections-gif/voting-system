# Election Management Features

## Overview

New election management features have been added to the admin panel, allowing administrators to:
- Regenerate election codes with configurable validity periods
- Start the election process
- End the election process
- View real-time election status

## Database Migration

**Important:** Before using these features, you must run the database migration:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migration_election_settings.sql`
4. Execute the migration

This will create the `election_settings` table that stores election configuration.

## New Features

### 1. Regenerate Election Codes

**Location:** Admin Panel → Settings Tab → Election Management

**What it does:**
- Resets the voting period for all voters
- Sets a new `voting_start_date` for all voters to the current time
- Configures the voting period duration (3, 5, 7 days, or custom)

**How to use:**
1. Navigate to Admin Panel → Settings
2. Scroll to "Election Management" section
3. Enter the number of days for validity (or use quick buttons: 3, 5, or 7 days)
4. Click "Regenerate Election Codes"
5. Confirm the action

**Note:** This action affects ALL voters, resetting their voting period regardless of whether they've already voted.

### 2. Start Election

**Location:** Admin Panel → Settings Tab → Election Management

**What it does:**
- Marks the election as "active"
- Sets the voting period for all eligible voters (those who haven't voted yet)
- Configures the voting period duration

**How to use:**
1. Navigate to Admin Panel → Settings
2. Scroll to "Start Election" section
3. Enter the number of days for the voting period (or use quick buttons)
4. Click "Start Election"
5. Confirm the action

**Note:** Only voters who haven't voted yet will have their voting period set.

### 3. End Election

**Location:** Admin Panel → Settings Tab → Election Management

**What it does:**
- Marks the election as "ended"
- Prevents all voters from voting
- Shows final statistics

**How to use:**
1. Navigate to Admin Panel → Settings
2. Scroll to "End Election" section
3. Click "End Election"
4. Confirm the action

### 4. Election Status Display

**Location:** Admin Panel → Settings Tab → Election Management

The status section shows:
- Current election status (Not Started, Active, Ended)
- Voting period duration
- Time remaining (if election is active)
- Total voters and votes cast
- Turnout percentage

## Technical Changes

### API Endpoints

New API endpoints have been created:

1. **POST `/api/admin/election/regenerate-codes`**
   - Regenerates codes for all voters
   - Body: `{ validity_days: number }`

2. **POST `/api/admin/election/start`**
   - Starts the election
   - Body: `{ validity_days: number }`

3. **POST `/api/admin/election/end`**
   - Ends the election
   - No body required

4. **GET `/api/admin/election/status`**
   - Returns current election status and statistics

### Updated Routes

The following routes have been updated to use configurable voting periods:

- `/api/auth/login` - Now checks election status and uses configurable days
- `/api/auth/verify-session` - Now checks election status and uses configurable days
- `/api/vote` - Now checks election status before allowing votes

### Database Schema

New table: `election_settings`
- `id`: UUID (fixed: 00000000-0000-0000-0000-000000000000)
- `voting_period_days`: INTEGER (default: 5)
- `election_status`: TEXT ('not_started', 'active', 'ended')
- `election_start_date`: TIMESTAMP
- `election_end_date`: TIMESTAMP
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

## Fixes

### Voting Period Expired Message

The "voting period expired" message now:
- Uses the configurable voting period days instead of hardcoded 5 days
- Shows the correct number of days in the error message
- Checks election status before allowing login/voting

## Usage Workflow

### Typical Election Workflow:

1. **Setup Phase:**
   - Add voters (via CSV, Google Sheets, or manual entry)
   - Add candidates
   - Configure voting period (default: 5 days)

2. **Start Election:**
   - Go to Settings → Election Management
   - Click "Start Election"
   - Set voting period (e.g., 5 days)
   - Confirm

3. **During Election:**
   - Monitor status in Settings → Election Management
   - View results in Results tab
   - Voters can vote using their election codes

4. **If Needed - Regenerate Codes:**
   - If you need to extend or reset voting period
   - Go to Settings → Election Management
   - Click "Regenerate Election Codes"
   - Set new validity period
   - Confirm

5. **End Election:**
   - When voting period is over or you want to close voting
   - Go to Settings → Election Management
   - Click "End Election"
   - Confirm
   - View final statistics

## Notes

- The voting period is now configurable (1-365 days)
- Quick buttons are provided for common periods (3, 5, 7 days)
- Custom periods can be entered manually
- Election status is checked before allowing any voting actions
- All voters are affected by "Regenerate Codes" action
- Only non-voted voters are affected by "Start Election" action
