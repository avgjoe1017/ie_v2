# Setting Up Turso Database Schema

Since Prisma's `db push` doesn't work directly with Turso's libsql protocol, we need to set up the schema using Turso's tools.

## Option 1: Using Turso Dashboard (Easiest)

1. Go to https://turso.tech/app
2. Click on your `ie-calllist` database
3. Click on the **"SQL Console"** or **"Query"** tab
4. Copy the contents of `prisma/schema.sql`
5. Paste into the SQL console
6. Click **"Run"** or **"Execute"**

## Option 2: Using Turso CLI (If installed)

```powershell
# Navigate to project directory
cd C:\Users\joeba\Documents\ie_v2\ie-calllist

# Run the schema file
Get-Content prisma\schema.sql | turso db shell ie-calllist
```

Or run it line by line:

```powershell
turso db shell ie-calllist
```

Then paste the SQL commands from `prisma/schema.sql`.

## Option 3: Let the App Create Tables (Automatic)

If you deploy the app without setting up the schema first, Prisma will attempt to create the tables automatically on first connection. However, this may not work reliably with Turso.

## Verify Schema

After running the schema, verify it worked:

### Using Turso Dashboard:
1. Go to SQL Console
2. Run: `SELECT name FROM sqlite_master WHERE type='table';`
3. You should see: User, Station, PhoneNumber, CallLog, EditLog

### Using Turso CLI:
```powershell
turso db shell ie-calllist "SELECT name FROM sqlite_master WHERE type='table';"
```

## Default Users Created

The schema creates two default users:

| User | PIN | Role | ID |
|------|-----|------|-----|
| Admin | `123456` | admin | admin-default |
| Producer | `111111` | producer | producer-test |

**⚠️ Important:** Change the admin PIN after first login!

## Next Steps

After setting up the schema:

1. ✅ Schema is set up in Turso
2. Deploy your app to Vercel (if not already done)
3. Visit your Vercel URL
4. Login with admin PIN: `123456`
5. Go to `/admin/import` to import your station data
6. Change the admin PIN in `/admin/users`

## Troubleshooting

**"Table already exists" error:**
- This is fine, it means tables are already created
- The `IF NOT EXISTS` clauses prevent errors

**Foreign key errors:**
- Make sure you run the entire schema file at once
- Tables must be created in the correct order

**Can't login:**
- Verify the User table has data: `SELECT * FROM User;`
- Check that PIN hashes are correct
- Try the default PINs: `123456` (admin) or `111111` (producer)

