# Run Database Migration

## Migration File: `supabase/migration_letter_templates.sql`

This migration creates the `letter_templates` table needed for the letter template feature.

## How to Run

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard/project/nvfxbvntzryewptndvoj/sql/new
2. Copy the entire contents of `supabase/migration_letter_templates.sql`
3. Paste into the SQL Editor
4. Click **Run** or press `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)
5. Verify success message

### Option 2: Via Supabase CLI (if installed)

```bash
supabase db push
```

## What This Migration Does

1. Creates `letter_templates` table
2. Inserts a default template
3. Creates indexes for performance
4. Sets up RLS (Row Level Security) policies
5. Creates triggers for `updated_at` timestamp

## Verification

After running the migration, verify:

1. Go to Supabase Dashboard → Table Editor
2. You should see `letter_templates` table
3. It should have 1 row (the default template)

## If Migration Fails

- Check if table already exists (might show "already exists" error - that's okay)
- Check Supabase project is active
- Verify you have proper permissions
