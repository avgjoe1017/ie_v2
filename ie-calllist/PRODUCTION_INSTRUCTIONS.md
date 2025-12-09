# IE Call List V2 - Production Deployment Instructions

## Prerequisites

- Node.js 18+ installed
- Vercel account
- Turso account (for production database)

## Local Development

### 1. Install Dependencies
```bash
cd ie-calllist
npm install
```

### 2. Set Up Environment
Create `.env.local`:
```bash
DATABASE_URL="file:./prisma/dev.db"
SESSION_SECRET="your-32-char-secret-here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize Database
```bash
npx prisma db push
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Test Login
- Admin: PIN `123456`
- Producer: PIN `111111`

## Production Deployment

### 1. Create Turso Database

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Create database
turso db create ie-calllist

# Get database URL
turso db show ie-calllist --url

# Create auth token
turso db tokens create ie-calllist
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd ie-calllist
vercel
```

### 3. Configure Environment Variables in Vercel

Add these in Vercel dashboard → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `libsql://your-db.turso.io` |
| `TURSO_DATABASE_URL` | `libsql://your-db.turso.io` |
| `TURSO_AUTH_TOKEN` | `your-turso-token` |
| `SESSION_SECRET` | `random-32-char-string` |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` |

### 4. Push Schema to Production

```bash
DATABASE_URL="libsql://your-db.turso.io?authToken=your-token" npx prisma db push
```

### 5. Create Admin User

Option A: Use Turso Shell
```bash
turso db shell ie-calllist

INSERT INTO User (id, name, pinHash, role, createdAt) 
VALUES ('admin-1', 'Admin Name', '$2a$10$...', 'admin', datetime('now'));
```

Option B: Create a setup script (one-time)
```bash
# In ie-calllist directory with production env vars
npx tsx scripts/create-admin.ts
```

### 6. Import Station Data

1. Go to `https://your-domain.vercel.app/admin/import`
2. Login with admin PIN
3. Upload CSV file with station data
4. Review import results

## CSV Format for Import

```csv
Feed,Status,Rank,Station,City,Air Time,ET Time,Main Name,Main Phone,#2 Name,Phone #2,#3 Name,Phone #3,#4 Name,Phone #4
6:00 PM,LIVE,1,WCBS-TV,"NEW YORK",5:00 PM,5:00 PM,Control Room,212-555-1234,News Desk,212-555-5678,,,
3:00 PM,RERACK,3,WLS-TV,"CHICAGO, IL",3:00 PM,4:00 PM,Joshua Baranoff,678-459-7853,Operations,281-602-5611,,,
```

## PWA Installation

### iOS
1. Open app URL in Safari
2. Tap Share button
3. Tap "Add to Home Screen"
4. Name it "IE Call List"
5. Tap "Add"

### Android
1. Open app URL in Chrome
2. Tap three-dot menu
3. Tap "Install app" or "Add to Home Screen"
4. Confirm installation

## Maintenance

### Update Station Data
- Use Admin Panel at `/admin` for individual edits
- Use CSV Import at `/admin/import` for bulk updates

### Reset User PIN
1. Login as admin
2. Go to `/admin/users`
3. Find user, click "Edit"
4. Enter new 6-digit PIN
5. Save

### View Audit Logs
- Call history: `/logs/calls`
- Edit history: `/logs/edits`

### Database Backup
```bash
# Export Turso database
turso db shell ie-calllist ".dump" > backup.sql
```

## Troubleshooting

### "Invalid PIN" on login
- Check that users exist in database
- Verify PIN was hashed with bcrypt (not plaintext)

### Calls not logging
- Check browser console for API errors
- Verify session is valid (not expired)

### Search not working
- Clear browser cache
- Check for JavaScript errors in console

### PWA not installing
- Ensure HTTPS is enabled
- Check manifest.json is accessible
- Verify icons exist in /public/icons/

## Security Checklist

- [ ] Change default admin PIN
- [ ] Set strong SESSION_SECRET
- [ ] Enable HTTPS (Vercel does this automatically)
- [ ] Review user list for unnecessary accounts
- [ ] Rotate Turso auth token periodically

