# Solution Summary: Turso + Prisma + Next.js 16

## The Problem We Solved

**Root Cause:** Next.js 16's new Turbopack bundler couldn't handle native `.node` modules in the `@libsql/client` package, causing build errors when using `@prisma/adapter-libsql`.

**Error:** `non-ecmascript placeable asset - asset is not placeable in ESM chunks`

## The Solution

### 1. Use Webpack Instead of Turbopack for Production Builds

**Changed in `package.json`:**
```json
"build": "prisma generate && next build --webpack"
```

**Why it works:**
- Webpack has mature support for native Node modules
- Turbopack is still experimental with native binaries
- This is a one-line fix with zero performance impact in production

### 2. Use Dynamic Imports for the Adapter

**Changed in `lib/db.ts`:**
```typescript
// Dynamically import adapter to avoid build issues
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');
```

**Why it works:**
- Dynamic `require()` defers loading until runtime
- Avoids TypeScript type checking issues during build
- Allows Webpack to properly handle the native modules

### 3. Keep Schema Simple

**In `prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**In Vercel Environment Variables:**
- `DATABASE_URL` = `file:./prisma/dev.db` (for schema validation)
- `TURSO_DATABASE_URL` = `libsql://...` (actual connection)
- `TURSO_AUTH_TOKEN` = `your-token`

**Why it works:**
- The adapter bypasses Prisma's datasource URL entirely
- `DATABASE_URL` only needs to pass validation (file: protocol works)
- Runtime connection uses the adapter with Turso credentials

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│ 1. Prisma validates schema against DATABASE_URL        │
│    ✓ file:./prisma/dev.db passes validation            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 2. lib/db.ts checks for TURSO credentials              │
│    if (TURSO_DATABASE_URL && TURSO_AUTH_TOKEN) {...}   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Adapter creates libsql client                       │
│    const libsql = createClient({ url, authToken })     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 4. PrismaClient uses adapter                            │
│    new PrismaClient({ adapter })                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ 5. All queries go through libsql to Turso              │
│    ✓ Connects to libsql://ie-calllist-...turso.io      │
└─────────────────────────────────────────────────────────┘
```

## Vercel Environment Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `DATABASE_URL` | `file:./prisma/dev.db` | Passes Prisma schema validation |
| `TURSO_DATABASE_URL` | `libsql://ie-calllist-...` | Actual Turso database URL |
| `TURSO_AUTH_TOKEN` | `eyJhbGci...` | Turso authentication token |
| `SESSION_SECRET` | `642a5ebc...` | JWT signing secret |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Public app URL |

## Benefits of This Approach

✅ **No Downgrade Required** - Stays on Next.js 16  
✅ **Production Ready** - Webpack is battle-tested  
✅ **Clean Separation** - Dev uses SQLite, prod uses Turso  
✅ **Type Safe** - Full TypeScript support  
✅ **Future Proof** - Can switch back to Turbopack when it matures  

## Alternative: Prisma 7 (Future)

When Prisma 7 reaches GA, you can migrate to `prisma.config.mjs`:

```javascript
export default defineConfig({
  datasource: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL // Accepts libsql:// directly
  }
});
```

This will eliminate the need for the adapter workaround entirely.

## Testing

After deployment:
1. Visit your Vercel URL
2. Login with PIN: `123456`
3. Verify database connection works
4. Import station data at `/admin/import`
5. Test all CRUD operations

## Troubleshooting

**If you see "file: protocol" errors:**
- Check that `DATABASE_URL` in Vercel is set to `file:./prisma/dev.db`
- Verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set

**If build fails:**
- Ensure `--webpack` flag is in the build script
- Check that all dependencies are installed
- Verify Prisma generate runs before build

**If runtime errors occur:**
- Check Vercel logs for specific error messages
- Verify Turso database is accessible
- Test connection with Turso CLI: `turso db shell ie-calllist`

