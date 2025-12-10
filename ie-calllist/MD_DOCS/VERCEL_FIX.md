# Fix: Prisma SQLite Provider Validation Error

## The Problem

Prisma's SQLite provider validates the `DATABASE_URL` at build time and requires it to start with `file:`, but Turso uses `libsql://` protocol.

## The Solution

Set `DATABASE_URL` to a dummy file path for Prisma validation, while using `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` for the actual connection.

## Steps to Fix in Vercel

### 1. Update DATABASE_URL

Go to **Vercel → Settings → Environment Variables**

Find `DATABASE_URL` and **edit** it to:
```
file:./prisma/prod.db
```

### 2. Verify Other Variables

Make sure these are still set correctly:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `file:./prisma/prod.db` ← **Changed!** |
| `TURSO_DATABASE_URL` | `libsql://ie-calllist-avgjoe1017.aws-us-west-2.turso.io` |
| `TURSO_AUTH_TOKEN` | `eyJhbGci...` (your token) |
| `SESSION_SECRET` | `642a5ebc03699069a42a0f6eac6a2f48` |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL |

### 3. Redeploy

- Go to **Deployments** tab
- Click **"..."** on latest deployment
- Click **"Redeploy"**

## How It Works

The `lib/db.ts` code checks for `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`:

```typescript
if (tursoUrl && tursoToken) {
  // Use Turso connection
  const databaseUrl = `${tursoUrl}?authToken=${tursoToken}`;
  return new PrismaClient({
    datasources: { db: { url: databaseUrl } }
  });
}
// Otherwise use DATABASE_URL (local dev)
return new PrismaClient();
```

So even though `DATABASE_URL` is set to `file:./prisma/prod.db`, the actual connection uses the Turso URL constructed from `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`.

## After Fixing

Once redeployed:
1. Visit your Vercel URL
2. Login with PIN: `123456`
3. Go to `/admin/import` to upload station data
4. Change admin PIN in `/admin/users`

✅ Your app should now work!

