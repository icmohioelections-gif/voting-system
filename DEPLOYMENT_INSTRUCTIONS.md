# Deployment Instructions for ICM Voting System

## ✅ Changes Made

### 1. Admin Credentials Updated

**New Default Credentials (Development Only):**
- **Email**: `icm.elections@secure.local`
- **Password**: `ICM2024SecureAdmin!@#`

**⚠️ IMPORTANT:** These are default credentials. For production, you MUST set custom credentials via environment variables:
- `ADMIN_EMAIL` - Your admin email
- `ADMIN_PASSWORD` - Your secure admin password

### 2. Login Page Updated
- Removed placeholder showing `admin@admin.com`
- Now shows generic "Enter admin email" placeholder

## 🚀 Deployment Steps

### Step 1: Set Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project: `voting-system` (or create new)
3. Go to **Settings → Environment Variables**
4. Add the following variables:

#### Required Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://nvfxbvntzryewptndvoj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### Admin Credentials (Set Custom Values):

```
ADMIN_EMAIL=your-custom-admin@icm-elections.com
ADMIN_PASSWORD=YourSecurePassword123!@#
```

#### Google Sheets (Optional but Recommended):

```
GOOGLE_SHEETS_SPREADSHEET_ID=163BMLKY3rzA6udXKJiuDMamGYlejd7_q
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

#### App URL:

```
NEXT_PUBLIC_APP_URL=https://icm.vercel.app
```
*(Update this after deployment to your actual Vercel URL)*

**Important:**
- Select **All environments** (Production, Preview, Development) for each variable
- Click **Save** after adding each variable
- For `GOOGLE_SHEETS_PRIVATE_KEY`, include the entire key with `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

### Step 2: Rename Project to ICM

1. In Vercel Dashboard, go to your project
2. Click on **Settings**
3. Scroll to **General** section
4. Find **Project Name**
5. Change from `voting-system` to `icm`
6. Click **Save**

**Alternative via CLI:**
```bash
vercel project rename icm
```

### Step 3: Deploy to Vercel

#### Option A: Via Vercel CLI (Recommended)

```bash
cd /Users/mohammad/voting-system
vercel deploy --prod
```

#### Option B: Via GitHub (Auto-deploy)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Update admin credentials and deploy ICM"
   git push origin main
   ```

2. Vercel will automatically deploy if GitHub integration is enabled

#### Option C: Via Vercel Dashboard

1. Go to Vercel Dashboard
2. Click **Deployments**
3. Click **Redeploy** on the latest deployment (after setting env vars)

### Step 4: Verify Deployment

1. Visit your deployment URL (e.g., `https://icm.vercel.app`)
2. Test admin login with your custom credentials
3. Test voter login flow
4. Check admin dashboard

### Step 5: Update Database Migration

Don't forget to run the election settings migration:

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/nvfxbvntzryewptndvoj/editor)
2. Copy and paste the contents of `supabase/migration_election_settings.sql`
3. Click **Run**
4. Verify the `election_settings` table was created

## 🔐 Security Notes

1. **Never commit** `.env.local` to git
2. **Always use** environment variables in Vercel
3. **Change default** admin credentials in production
4. **Use strong passwords** for admin account (minimum 12 characters, mixed case, numbers, symbols)
5. **Keep** `SUPABASE_SERVICE_ROLE_KEY` secret - never expose it

## 📋 Post-Deployment Checklist

- [ ] Environment variables set in Vercel
- [ ] Project renamed to `icm`
- [ ] Deployment successful
- [ ] Admin login works with custom credentials
- [ ] Database migration (`election_settings`) applied
- [ ] Test voter login flow
- [ ] Test admin dashboard features
- [ ] Test election management features
- [ ] Update `NEXT_PUBLIC_APP_URL` to actual production URL

## 🆘 Troubleshooting

### Build Fails with "supabaseUrl is required"
- Check that all environment variables are set in Vercel
- Make sure variables are set for **Production**, **Preview**, and **Development**
- Redeploy after adding variables

### Admin Login Fails
- Verify `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set correctly in Vercel
- Check that you're using the custom credentials (not defaults)
- Clear browser cache and try again

### Database Connection Issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check Supabase dashboard to ensure project is active
- Verify RLS policies are set correctly

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Verify all environment variables are set
4. Ensure database migrations are applied
