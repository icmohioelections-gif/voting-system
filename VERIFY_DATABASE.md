# ✅ Database Verification Guide

## How to Verify Database Tables

### Option 1: Via API Endpoint (After Deployment)

Once deployed, visit:
```
https://icm-voting.vercel.app/api/admin/check-db
```

This will check all required tables and return their status.

### Option 2: Via Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/nvfxbvntzryewptndvoj/editor
2. Click on "Table Editor" in the left sidebar
3. You should see these tables:
   - ✅ `election_settings`
   - ✅ `letter_templates`
   - ✅ `voters`
   - ✅ `candidates`
   - ✅ `votes`

### Option 3: Via SQL Query

Run this in Supabase SQL Editor:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('election_settings', 'letter_templates', 'voters', 'candidates', 'votes')
ORDER BY table_name;
```

### Option 4: Check Specific Table

```sql
-- Check election_settings table
SELECT * FROM election_settings;

-- Check letter_templates table
SELECT * FROM letter_templates;

-- Check if voting_start_date column exists in voters
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'voters' 
  AND column_name = 'voting_start_date';
```

## Required Tables Status

After running migrations, you should have:

- ✅ `election_settings` - Stores election configuration
- ✅ `letter_templates` - Stores letter templates
- ✅ `voters` - Voter information (with `voting_start_date` column)
- ✅ `candidates` - Candidate information
- ✅ `votes` - Vote records

## Migration Files

1. **election_settings**: `supabase/migration_election_settings.sql`
2. **letter_templates**: `supabase/migration_letter_templates.sql`
3. **voting_start_date**: `supabase/migration_add_features.sql`

All migrations should be run in Supabase SQL Editor.
