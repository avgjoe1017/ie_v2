# 🚀 Ready to Deploy!

All environment variables are ready. Follow these steps to deploy to Vercel.

## Your Environment Variables

Copy these exact values into Vercel:

```
DATABASE_URL=libsql://ie-calllist-avgjoe1017.aws-us-west-2.turso.io

TURSO_DATABASE_URL=libsql://ie-calllist-avgjoe1017.aws-us-west-2.turso.io

TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjUzNDI2MTYsImlkIjoiMWVkNzVhYmUtZGNhOC00N2MxLThhMDUtODYxNmY1OWJhMGQ1IiwicmlkIjoiYzJkM2IxODItMWQzMC00Y2I1LWFiNmYtODZmYmY2YTYwM2EwIn0.YRQZRfGMNMxlGjZJVMgeT9LP9Pq9xLEMoWlVG9h4ThHW2aQSqn55FNN0S1QkHYgG7R_Rjc1LZSQImvJQ4PNzCA

SESSION_SECRET=642a5ebc03699069a42a0f6eac6a2f48

NEXT_PUBLIC_APP_URL=https://your-project-name.vercel.app
```

## Deployment Steps

### 1. Push to GitHub (if not already done)

```powershell
git add .
git commit -m "Ready for production deployment"
git push origin master
```

### 2. Deploy to Vercel

1. Go to https://vercel.com
2. Click **"Add New Project"**
3. Import your GitHub repository: `avgjoe1017/ie_v2`
4. **Important:** Set root directory to `ie-calllist`
5. Click **"Deploy"**

*Note: First deployment will fail - that's expected without environment variables*

### 3. Add Environment Variables

1. In Vercel project → **Settings** → **Environment Variables**
2. Add each of the 5 variables above:
   - Click "Add New"
   - Paste variable name (e.g., `DATABASE_URL`)
   - Paste value
   - Select **Production**, **Preview**, and **Development**
   - Click "Save"
3. Repeat for all 5 variables

**⚠️ Important:** After adding all variables, update `NEXT_PUBLIC_APP_URL` with your actual Vercel URL (e.g., `https://ie-calllist.vercel.app`)

### 4. Redeploy

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait for build to complete

### 5. Push Database Schema

After successful deployment, run this locally:

```powershell
$env:DATABASE_URL="libsql://ie-calllist-avgjoe1017.aws-us-west-2.turso.io?authToken=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjUzNDI2MTYsImlkIjoiMWVkNzVhYmUtZGNhOC00N2MxLThhMDUtODYxNmY1OWJhMGQ1IiwicmlkIjoiYzJkM2IxODItMWQzMC00Y2I1LWFiNmYtODZmYmY2YTYwM2EwIn0.YRQZRfGMNMxlGjZJVMgeT9LP9Pq9xLEMoWlVG9h4ThHW2aQSqn55FNN0S1QkHYgG7R_Rjc1LZSQImvJQ4PNzCA"
npx prisma db push
```

### 6. Create Admin User

Use Turso dashboard SQL editor or run locally:

```sql
INSERT INTO User (id, name, pinHash, role, createdAt) 
VALUES (
  'admin-1', 
  'Admin', 
  '$2a$10$YourHashedPINHere', 
  'admin', 
  datetime('now')
);
```

Or use the seed script:
```powershell
npm run db:seed
```

### 7. Import Station Data

1. Visit `https://your-vercel-url.vercel.app/admin/import`
2. Login with admin PIN (default: `123456` if using seed)
3. Upload your CSV file
4. Verify import

## Testing Checklist

- [ ] App loads without errors
- [ ] Login works
- [ ] Search functionality works
- [ ] Call logging works
- [ ] Station editing works (admin)
- [ ] PWA installs on mobile

## Troubleshooting

**Build fails:**
- Check all 5 environment variables are set correctly
- Verify no typos in variable names
- Check Vercel build logs for specific errors

**Database connection errors:**
- Verify `DATABASE_URL` and `TURSO_DATABASE_URL` match exactly
- Check that `TURSO_AUTH_TOKEN` is complete (not truncated)
- Ensure Prisma schema was pushed successfully

**App loads but errors:**
- Check browser console for specific errors
- Verify `SESSION_SECRET` is set
- Check `NEXT_PUBLIC_APP_URL` matches your Vercel domain

## 🎉 You're Ready!

Everything is configured. Just follow the steps above and you'll be live in about 15 minutes!

