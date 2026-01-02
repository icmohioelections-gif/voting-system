# Google Sheet Format Guide

The voting system now supports **two formats** for your Google Sheet:

## Format 1: Simple Name-Only Format (Recommended) ✅

**Just list names in column A** - that's it! The system will:
- Automatically generate 10-character election codes
- Parse names into first name and last name
- Handle header rows automatically

### Example:

| Name |
|------|
| Aamir Mar Jan |
| Abdukhamid |
| Abdul Jabbar Abro |
| Abdul Mannan Masood |
| Abid Yaqub |

**OR without header:**

| Aamir Mar Jan |
| Abdukhamid |
| Abdul Jabbar Abro |
| Abdul Mannan Masood |
| Abid Yaqub |

### How it works:
- Put each voter's name in column A
- Optional: Add a header row (e.g., "Name", "Voter Name", etc.) - the system detects it automatically
- System automatically:
  - Generates unique 10-character election codes
  - Splits names into first name and last name
  - Creates voter records

## Format 2: Detailed Format (Advanced)

If you want to control election codes and other details:

### With Header Row:

| election_code | first_name | last_name | has_voted | voted_at |
|---------------|------------|-----------|-----------|----------|
| ABC123XYZ7 | John | Doe | FALSE | |
| XYZ789ABC1 | Jane | Smith | FALSE | |

### Without Header Row:

| ABC123XYZ7 | John | Doe | FALSE | |
| XYZ789ABC1 | Jane | Smith | FALSE | |

### Columns:
1. **election_code** (required): 10-character alphanumeric code
2. **first_name** (required): Voter's first name
3. **last_name** (optional): Voter's last name
4. **has_voted** (optional): TRUE/FALSE or leave empty
5. **voted_at** (optional): Timestamp or leave empty

## Your Current Sheet

Based on your sheet, you're using **Format 1** (Simple Name-Only), which is perfect! ✅

Your sheet has:
- Names in column A
- No header row needed (system handles it)
- System will auto-generate election codes

## How Election Codes Are Generated

When using the simple format, codes are generated from names:
- Takes first 8 characters from the name (uppercase, alphanumeric only)
- Adds a 2-digit index number
- Result: 10-character code like `AAMIRMAR01`, `ABDUKHAM02`, etc.

**Example:**
- "Aamir Mar Jan" → Code: `AAMIRMAR01`
- "Abdukhamid" → Code: `ABDUKHAM02`
- "Abdul Jabbar Abro" → Code: `ABDULJAB03`

## Best Practices

1. **One name per row** in column A
2. **Optional header**: Add "Name" or "Voter Name" in row 1 if you want
3. **Keep it simple**: Just names is all you need!
4. **No empty rows**: Skip blank rows in your data

## Testing

After syncing, you can:
1. Check the "Voters" tab in Admin Dashboard
2. See the auto-generated election codes
3. Share these codes with voters for login

## Switching Between Formats

You can switch formats anytime:
- **Simple format**: Just names in column A
- **Detailed format**: Add election_code column and other columns

The system automatically detects which format you're using!


