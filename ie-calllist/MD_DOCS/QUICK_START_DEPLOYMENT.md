# Quick Start: Deploy to Production

This is a condensed guide to get your app deployed to Vercel quickly.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Git repository pushed to GitHub
- [ ] Vercel account created
- [ ] Turso account created (free tier available)

## Step 1: Set Up Turso Database (5 minutes)

### Option A: Automated (Windows PowerShell)
```powershell
.\scripts\setup-turso.ps1
```

### Option B: Manual
```bash
# Install Turso CLI (Windows)
irm get.tur.so/install.ps1 | iex

# Login
turso auth login

# Create database
turso db create ie-calllist

# Get URL and token
turso db show ie-calllist --url
turso db tokens create ie-calllist
```

**Save these values** - you'll need them for Vercel.

## Step 2: Deploy to Vercel (5 minutes)

1. Go to https://vercel.com
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Set root directory to `ie-calllist` (if needed)
5. Click **"Deploy"**

**Note:** First deployment will fail without environment variables - that's expected!

## Step 3: Add Environment Variables (5 minutes)

1. In Vercel project → **Settings** → **Environment Variables**
2. Add these 5 variables:

| Variable | Value | How to Get |
|----------|-------|------------|
| `DATABASE_URL` | `libsql://...` | From Step 1 |
| `TURSO_DATABASE_URL` | `libsql://...` | Same as above |
| `TURSO_AUTH_TOKEN` | `eyJ...` | From Step 1 |
| `SESSION_SECRET` | `32 chars` | Run: `npx tsx scripts/generate-session-secret.ts` |
| `NEXT_PUBLIC_APP_URL` | `https://...` | Your Vercel URL after deployment |

3. Select **Production**, **Preview**, **Development** for each
4. Click **Save**

## Step 4: Redeploy (2 minutes)

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait for build to complete

## Step 5: Set Up Database (5 minutes)

1. Push Prisma schema to Turso:
   ```bash
   DATABASE_URL="libsql://your-db.turso.io?authToken=your-token" npx prisma db push
   ```

2. Create admin user (see `PRODUCTION_INSTRUCTIONS.md`)

3. Import station data:
   - Visit `https://your-app.vercel.app/admin/import`
   - Login with admin PIN
   - Upload CSV file

## Step 6: Test (5 minutes)

- [ ] Login works
- [ ] Search works
- [ ] Call logging works
- [ ] Station editing works (admin)
- [ ] PWA installs on mobile

## Total Time: ~30 minutes

## Need Help?

- **Detailed guide:** `MD_DOCS/VERCEL_ENV_SETUP.md`
- **Full checklist:** `MD_DOCS/DEPLOYMENT_CHECKLIST.md`
- **Production instructions:** `PRODUCTION_INSTRUCTIONS.md`

## Common Issues

**Build fails:**
- Check all 5 environment variables are set
- Verify DATABASE_URL starts with `libsql://`
- Check build logs in Vercel dashboard

**Database connection errors:**
- Verify TURSO_AUTH_TOKEN is complete (not truncated)
- Check database exists: `turso db list`
- Ensure schema is pushed: `npx prisma db push`

**App loads but shows errors:**
- Check browser console for specific errors
- Verify SESSION_SECRET is set
- Check NEXT_PUBLIC_APP_URL matches your Vercel domain

