# VoteSecure Admin - WordPress Plugin

A WordPress plugin that provides admin dashboard functionality for the VoteSecure voting system. This plugin allows you to manage voters, candidates, and view voting results directly from your WordPress admin panel.

## Features

- **Dashboard**: View live voting results with vote counts and statistics
- **Voters Management**: Add, view, and manage voters with search functionality
- **Candidates Management**: Add and manage election candidates
- **CSV Import**: Bulk import voters from CSV files
- **Google Sheets Sync**: Sync voters from Google Sheets
- **Settings Panel**: Configure Supabase and Google Sheets credentials
- **Database Reset**: Clear all data for fresh elections

## Requirements

- WordPress 5.8 or higher
- PHP 7.4 or higher
- Supabase account (for database backend)
- Google Cloud account (optional, for Sheets integration)

## Installation

1. Download the plugin folder `wp-voting-system`
2. Upload it to your WordPress installation's `wp-content/plugins/` directory
3. Activate the plugin through the WordPress admin panel
4. Navigate to **VoteSecure** in the admin menu
5. Go to **Settings** and configure your credentials

## Configuration

### Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the database schema from `supabase/schema.sql`
3. Get your credentials from Settings → API:
   - Project URL
   - `anon` public key
   - `service_role` secret key
4. Enter these in VoteSecure → Settings

### Google Sheets Setup (Optional)

1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable the Google Sheets API
3. Create a Service Account and download the JSON key
4. Share your Google Sheet with the service account email
5. Enter the credentials in VoteSecure → Settings

## Usage

### Dashboard

The dashboard shows:
- Total voters count
- Votes cast count
- Voter turnout percentage
- Live vote counts per candidate with progress bars

### Managing Voters

1. **Add Single Voter**: Use the form to add individual voters
2. **Generate Code**: Click "Generate" to auto-create election codes
3. **CSV Import**: Upload a CSV file with voter data
4. **Google Sheets Sync**: Enter a sheet URL to sync voters

#### CSV Format

Supported formats:
```csv
election_code,first_name,last_name
ABC123DEFG,John,Doe
XYZ789HIJK,Jane,Smith
```

Or simple format (codes will be auto-generated):
```csv
name
John Doe
Jane Smith
```

### Managing Candidates

1. Click **Candidates** in the menu
2. Use the form to add new candidates
3. Click **Add Default Candidates** for quick setup

### Settings

Configure:
- **Supabase URL**: Your Supabase project URL
- **Supabase Anon Key**: Public API key
- **Supabase Service Role Key**: Secret admin key
- **Google Sheets Spreadsheet ID**: Default sheet ID
- **Google Sheets Client Email**: Service account email
- **Google Sheets Private Key**: Service account private key
- **Voter Portal URL**: URL of your Next.js voting app

## Election Code Format

Election codes are 10 characters:
- First 5 letters: From voter's name (padded with 'X' if needed)
- Next 4 characters: Random numbers (0-9)
- Last character: Random letter (A-Z)

Example: `JOHNX1234A`

## Security

- All AJAX requests require nonce verification
- Capability checks ensure only administrators can access
- Sensitive credentials are stored securely in WordPress options
- Input sanitization and output escaping throughout

## Future Development

This plugin is designed with a database abstraction layer that will support:
- WordPress database backend (custom tables)
- Migration tools between Supabase and WordPress
- Dual-mode operation (switch between backends)

## File Structure

```
wp-voting-system/
├── vote-secure-admin.php          # Main plugin file
├── includes/
│   ├── class-election-codes.php   # Election code generation
│   ├── class-supabase-client.php  # Supabase API integration
│   ├── class-google-sheets-api.php # Google Sheets integration
│   └── class-database-manager.php # Database abstraction layer
├── admin/
│   ├── class-admin-pages.php      # Admin page helpers
│   ├── views/
│   │   ├── settings-page.php      # Settings page
│   │   ├── results-page.php       # Dashboard/results page
│   │   ├── voters-page.php        # Voters management
│   │   ├── candidates-page.php    # Candidates management
│   │   └── partials/
│   │       ├── voters-table.php   # Voter row template
│   │       └── candidate-card.php # Candidate card template
│   └── assets/
│       ├── css/admin.css          # Admin styles
│       └── js/admin.js            # Admin JavaScript
└── api/
    └── class-ajax-handlers.php    # AJAX request handlers
```

## Support

For issues and feature requests, please use the GitHub repository:
https://github.com/icmohioelections-gif/voting-system

## License

GPL v2 or later

