# Deployment Checklist

Use this checklist to ensure all steps are completed before going live.

## Pre-Deployment

### 1. Turso Database Setup
- [ ] Install Turso CLI: `irm get.tur.so/install.ps1 | iex` (Windows) or `curl -sSfL https://get.tur.so/install.sh | bash`
- [ ] Login to Turso: `turso auth login`
- [ ] Create database: `turso db create ie-calllist`
- [ ] Get database URL: `turso db show ie-calllist --url` (copy this value)
- [ ] Create auth token: `turso db tokens create ie-calllist` (copy this value)
- [ ] Push schema to Turso: `DATABASE_URL="libsql://your-db.turso.io?authToken=your-token" npx prisma db push`

### 2. PWA Icons
- [ ] Convert SVG icons to PNG format (use online converter or ImageMagick)
- [ ] Replace placeholder icons in `/public/icons/` with actual IE logo icons
- [ ] Verify all icon sizes exist: 72, 96, 128, 144, 152, 192, 384, 512
- [ ] Test PWA installation on iOS and Android devices

### 3. Environment Variables
- [ ] Generate SESSION_SECRET: `npx tsx scripts/generate-session-secret.ts`
- [ ] Note your Vercel deployment URL (will be available after first deploy)

## Vercel Deployment

### 4. Initial Deployment
- [ ] Connect GitHub repository to Vercel
- [ ] Set root directory to `ie-calllist` (if needed)
- [ ] Deploy project (first deployment will fail without env vars - that's expected)

### 5. Environment Variables in Vercel
Go to **Settings → Environment Variables** and add:

- [ ] `DATABASE_URL` = `libsql://your-db.turso.io` (from step 1)
- [ ] `TURSO_DATABASE_URL` = `libsql://your-db.turso.io` (same as above)
- [ ] `TURSO_AUTH_TOKEN` = `your-token` (from step 1)
- [ ] `SESSION_SECRET` = `your-32-char-string` (from step 3)
- [ ] `NEXT_PUBLIC_APP_URL` = `https://your-project.vercel.app` (your Vercel URL)

**Important:** Select **Production**, **Preview**, and **Development** for each variable.

### 6. Redeploy
- [ ] Redeploy project in Vercel dashboard
- [ ] Wait for build to complete
- [ ] Check build logs for any errors

## Post-Deployment

### 7. Database Setup
- [ ] Create admin user in Turso database (see PRODUCTION_INSTRUCTIONS.md)
- [ ] Import station data via `/admin/import` page
- [ ] Verify data appears correctly in app

### 8. Testing
- [ ] Test login with admin PIN
- [ ] Test search functionality
- [ ] Test call logging
- [ ] Test station editing (admin only)
- [ ] Test on mobile device
- [ ] Test PWA installation
- [ ] Test offline functionality

### 9. Security
- [ ] Change default admin PIN
- [ ] Verify SESSION_SECRET is strong and random
- [ ] Review user list and remove test accounts
- [ ] Enable 2FA on Vercel account (recommended)

## Production Monitoring

### 10. Ongoing Maintenance
- [ ] Set up Vercel analytics (optional)
- [ ] Monitor error logs in Vercel dashboard
- [ ] Set up database backups (see PRODUCTION_INSTRUCTIONS.md)
- [ ] Schedule periodic Turso token rotation

## Troubleshooting

If deployment fails:
1. Check Vercel build logs for specific errors
2. Verify all 5 environment variables are set correctly
3. Ensure database URL starts with `libsql://`
4. Verify Turso token is complete (not truncated)
5. Check that Prisma schema matches database structure

For detailed troubleshooting, see `MD_DOCS/VERCEL_ENV_SETUP.md`.

