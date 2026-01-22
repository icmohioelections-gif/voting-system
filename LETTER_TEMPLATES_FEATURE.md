# Letter Templates Feature

## Overview

A comprehensive letter template management system with TinyMCE editor, allowing admins to create, edit, and manage letter templates for voter communications.

## Features

### 1. Template Editor Page
- **Location:** `/admin/templates`
- **Features:**
  - TinyMCE rich text editor
  - Create, edit, and delete templates
  - Set default template
  - Template variable support
  - Real-time preview

### 2. Template Variables

Available variables in templates:
- `{{full_name}}` - Full name (first + last)
- `{{first_name}}` - First name
- `{{last_name}}` - Last name
- `{{election_code}}` - Election code
- `{{#last_name}}...{{/last_name}}` - Conditional content (only shows if last_name exists)

### 3. Individual Voter Actions

In the Voters table, each voter now has:
- **Download Button** - Downloads individual letter as HTML
- **Email Button** - Opens email input to send letter to voter

### 4. Bulk Download

- **Bulk Download Letters** button in Voters tab
- Downloads all letters in a single HTML file
- Uses the default template (or specified template)

## Database Setup

**Important:** Run the migration before using templates:

1. Go to Supabase SQL Editor
2. Execute: `supabase/migration_letter_templates.sql`
3. This creates the `letter_templates` table with a default template

## API Endpoints

### Template Management
- `GET /api/admin/letter-templates` - Get all templates
- `GET /api/admin/letter-templates?id={id}` - Get specific template
- `GET /api/admin/letter-templates?default=true` - Get default template
- `POST /api/admin/letter-templates` - Create new template
- `PATCH /api/admin/letter-templates` - Update template
- `DELETE /api/admin/letter-templates?id={id}` - Delete template

### Letter Generation
- `GET /api/admin/voters/letter?election_code={code}` - Generate letter for single voter
- `GET /api/admin/voters/letters?template_id={id}` - Bulk download with specific template
- `POST /api/admin/voters/email-letter` - Email letter to voter

## Usage

### Creating a Template

1. Go to `/admin/templates`
2. Click **"+ New"** button
3. Enter template name
4. Use TinyMCE editor to design your template
5. Use variables like `{{full_name}}` and `{{election_code}}`
6. Check "Set as default" if this should be the default template
7. Click **"Create Template"**

### Editing a Template

1. Go to `/admin/templates`
2. Click on a template from the list
3. Make changes in the editor
4. Click **"Save Template"**

### Using Templates

**Individual Download:**
- Go to `/admin/voters`
- Click **"Download"** button next to any voter
- Letter is generated using the default template

**Bulk Download:**
- Go to `/admin/voters`
- Click **"Bulk Download Letters"**
- All letters are generated and downloaded

**Email Letter:**
- Go to `/admin/voters`
- Click **"Email"** button next to any voter
- Enter email address
- Click **"Send"**

## Email Configuration

**Note:** Email sending requires an email service configuration. Currently, the endpoint returns a placeholder message.

To enable email sending, configure one of:
- **Resend** (recommended)
- **SendGrid**
- **AWS SES**
- **SMTP**

Then update `/api/admin/voters/email-letter/route.ts` with your email service.

## Template Examples

### Basic Template
```html
<div style="padding: 40px;">
  <h2>Voting Instructions</h2>
  <p>Dear {{full_name}},</p>
  <p>Your Election Code: <strong>{{election_code}}</strong></p>
</div>
```

### Advanced Template with Conditional
```html
<div style="padding: 40px;">
  <h2>Voting Instructions</h2>
  <p>Dear {{first_name}}{{#last_name}} {{last_name}}{{/last_name}},</p>
  <p>Your Election Code: <strong>{{election_code}}</strong></p>
</div>
```

## TinyMCE Configuration

- **API Key:** Currently using "no-api-key" (free tier)
- **To get API key:** Visit https://www.tiny.cloud/ and get a free API key
- **Set in environment:** `NEXT_PUBLIC_TINYMCE_API_KEY=your-key`

## File Structure

```
app/
  admin/
    templates/
      page.tsx          # Template editor page
  api/
    admin/
      letter-templates/
        route.ts        # Template CRUD API
      voters/
        letter/
          route.ts      # Single letter generation
        email-letter/
          route.ts      # Email sending API
components/
  admin/
    VoterActions.tsx    # Download/Email buttons component
    VotersTable.tsx     # Updated with actions column
supabase/
  migration_letter_templates.sql  # Database migration
```

## Next Steps

1. ✅ Run database migration
2. ✅ Access template editor at `/admin/templates`
3. ⚠️ Configure email service (optional)
4. ⚠️ Get TinyMCE API key (optional, for production)
