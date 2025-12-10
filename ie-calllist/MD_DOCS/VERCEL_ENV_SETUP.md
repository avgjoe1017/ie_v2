# Vercel Environment Variables Setup Guide

This guide walks you through setting up all required environment variables for production deployment on Vercel.

## Prerequisites

1. **Turso CLI installed** (if not already):
   ```bash
   # Windows (PowerShell)
   irm get.tur.so/install.ps1 | iex
   
   # Or using curl (if available)
   curl -sSfL https://get.tur.so/install.sh | bash
   ```

2. **Turso account logged in**:
   ```bash
   turso auth login
   ```

3. **Database created** (if not already):
   ```bash
   turso db create ie-calllist
   ```

## Step-by-Step Setup

### Step 1: Get Turso Database URL

Run this command to get your database URL:

```bash
turso db show ie-calllist --url
```

**Expected output format:**
```
libsql://ie-calllist-xxxxx.turso.io
```

**Copy this value** - you'll need it for both `DATABASE_URL` and `TURSO_DATABASE_URL`.

### Step 2: Generate Turso Auth Token

Run this command to create an authentication token:

```bash
turso db tokens create ie-calllist
```

**Expected output format:**
```
eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoi... (long string)
```

**Copy this entire token** - you'll need it for `TURSO_AUTH_TOKEN`.

### Step 3: Generate SESSION_SECRET

Run this script to generate a secure random 32-character string:

```bash
npx tsx scripts/generate-session-secret.ts
```

**Or manually generate one:**
- Use any random 32-character string
- Can be letters, numbers, or special characters
- Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

**Copy this value** - you'll need it for `SESSION_SECRET`.

### Step 4: Get Your Vercel URL

After deploying to Vercel, your app URL will be:
- Format: `https://your-project-name.vercel.app`
- Or your custom domain if configured

**Copy this URL** - you'll need it for `NEXT_PUBLIC_APP_URL`.

### Step 5: Add Variables to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable one by one:

#### Variable 1: `DATABASE_URL`
- **Name:** `DATABASE_URL`
- **Value:** `libsql://ie-calllist-xxxxx.turso.io` (from Step 1)
- **Environment:** Select **Production**, **Preview**, and **Development** (or just Production if preferred)

#### Variable 2: `TURSO_DATABASE_URL`
- **Name:** `TURSO_DATABASE_URL`
- **Value:** `libsql://ie-calllist-xxxxx.turso.io` (same as Step 1)
- **Environment:** Select **Production**, **Preview**, and **Development**

#### Variable 3: `TURSO_AUTH_TOKEN`
- **Name:** `TURSO_AUTH_TOKEN`
- **Value:** `eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...` (from Step 2)
- **Environment:** Select **Production**, **Preview**, and **Development**

#### Variable 4: `SESSION_SECRET`
- **Name:** `SESSION_SECRET`
- **Value:** `your-32-char-random-string` (from Step 3)
- **Environment:** Select **Production**, **Preview**, and **Development**

#### Variable 5: `NEXT_PUBLIC_APP_URL`
- **Name:** `NEXT_PUBLIC_APP_URL`
- **Value:** `https://your-project-name.vercel.app` (from Step 4)
- **Environment:** Select **Production**, **Preview**, and **Development**

### Step 6: Redeploy

After adding all environment variables:

1. Go to **Deployments** tab in Vercel
2. Click the **"..."** menu on the latest deployment
3. Select **"Redeploy"**
4. Or push a new commit to trigger automatic redeployment

## Quick Reference Table

| Variable Name | Value Source | Example |
|---------------|--------------|---------|
| `DATABASE_URL` | `turso db show ie-calllist --url` | `libsql://ie-calllist-xxxxx.turso.io` |
| `TURSO_DATABASE_URL` | Same as above | `libsql://ie-calllist-xxxxx.turso.io` |
| `TURSO_AUTH_TOKEN` | `turso db tokens create ie-calllist` | `eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...` |
| `SESSION_SECRET` | `npx tsx scripts/generate-session-secret.ts` | `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL | `https://your-project.vercel.app` |

## Verification

After redeployment, verify the setup:

1. Visit your Vercel URL
2. Try logging in with a test PIN
3. Check Vercel logs for any database connection errors
4. If errors occur, double-check:
   - All 5 variables are set
   - Values are copied correctly (no extra spaces)
   - Database URL starts with `libsql://`
   - Token is the full string from Turso

## Troubleshooting

### "SESSION_SECRET environment variable is required"
- Ensure `SESSION_SECRET` is set in Vercel
- Redeploy after adding the variable

### Database connection errors
- Verify `DATABASE_URL` and `TURSO_DATABASE_URL` match exactly
- Check that `TURSO_AUTH_TOKEN` is the full token (not truncated)
- Ensure the database exists: `turso db list`

### App URL issues
- Make sure `NEXT_PUBLIC_APP_URL` matches your actual Vercel URL
- Include `https://` prefix
- No trailing slash

## Security Notes

- **Never commit** these values to git
- Rotate `TURSO_AUTH_TOKEN` periodically for security
- Use a strong, random `SESSION_SECRET`
- Keep these values secure and don't share them publicly

