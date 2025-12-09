# IE Call List V2 - Architecture Documentation

## Overview

The IE Call List V2 is a mobile-first Progressive Web App (PWA) for Inside Edition producers to find and call TV station contacts. Built with Next.js 14, it provides a fast, installable experience across all devices.

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 14 (App Router) | Full-stack React framework |
| Styling | Tailwind CSS v4 | Utility-first CSS |
| State | React Query + Zustand | Server state + UI state |
| Search | Fuse.js | Client-side fuzzy search |
| Database | SQLite (Turso for production) | Lightweight, edge-compatible |
| ORM | Prisma 6 | Type-safe database access |
| Validation | Zod + libphonenumber | Schema validation + phone formatting |
| Auth | JWT + bcrypt | Session-based PIN authentication |
| Deployment | Vercel | Serverless hosting |

## Architecture Diagram

```
[Mobile Browser / PWA]
         │
         ▼
[Next.js on Vercel]
    ├── /app (React, PWA)
    │   ├── /login - PIN authentication
    │   ├── /stations - Directory home
    │   ├── /stations/[id] - Station detail
    │   ├── /admin - Admin panel
    │   └── /settings - User settings
    └── /api (Route Handlers)
         ├── /auth - Login, logout, session
         ├── /markets - Station CRUD
         ├── /call-logs - Call tracking
         └── /admin - User management
              │
              ▼
         [SQLite / Turso]
```

## Key Design Decisions

### 1. PWA over Native App
- No app store approval needed
- Works on any device with a browser
- Instant updates
- `tel:` links open native dialer

### 2. SQLite over PostgreSQL
- Dataset is small (~210 markets, ~500 phones)
- Sub-10ms reads from edge with Turso
- No complex queries needed
- Simpler deployment

### 3. PIN Authentication over OAuth
- Internal tool, no external accounts needed
- Fast login (6 digits)
- Individual accountability for audit
- Easy PIN reset by admin

### 4. Client-side Search over Server Search
- Entire dataset fits in memory
- Fuse.js provides fuzzy matching for typos
- Zero network latency for search
- Works offline

## Data Flow

### Station Directory Flow
1. User opens `/stations`
2. Server renders page with all stations (SSR)
3. Client hydrates, enables Fuse.js search
4. User types search → instant filtering
5. User taps station → confirmation dialog
6. User confirms → `tel:` link opens dialer
7. Call logged to database

### Edit Flow
1. Admin navigates to station detail
2. Clicks "Edit" → form loads current values
3. Makes changes → submits form
4. API validates input with Zod
5. Prisma updates database
6. Change logged to EditLog with before/after values
7. Redirects back to detail view

## File Structure

```
ie-calllist/
├── app/                    # Next.js App Router pages
│   ├── api/               # API route handlers
│   ├── admin/             # Admin panel pages
│   ├── login/             # PIN login
│   ├── stations/          # Station directory
│   ├── logs/              # Call/edit history
│   └── settings/          # User settings
├── components/            # React components
├── domain/                # Business logic
│   ├── contracts.ts       # Zod schemas
│   ├── market.ts          # Timezone/feed logic
│   └── phone.ts           # Phone validation
├── lib/                   # Utilities
│   ├── db.ts              # Prisma client
│   ├── auth.ts            # Session management
│   ├── api.ts             # Fetch helpers
│   └── store.ts           # Zustand stores
└── prisma/
    ├── schema.prisma      # Database schema
    └── seed.ts            # Sample data
```

## Security Considerations

1. **Session cookies** - httpOnly, secure, sameSite
2. **PIN hashing** - bcrypt with salt rounds
3. **Role-based access** - Admin-only routes protected
4. **Audit logging** - All changes tracked with user ID
5. **Input validation** - Zod schemas on all API routes

## Performance Optimizations

1. **Server-side rendering** - Fast initial load
2. **React Query caching** - Reduced API calls
3. **Turso edge database** - Low-latency reads
4. **Static assets** - Vercel CDN
5. **PWA caching** - Offline station data

## Migration Path to Production

1. Create Turso database
2. Update `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`
3. Run `prisma db push` against Turso
4. Import station data via CSV upload
5. Create admin user via seed script
6. Deploy to Vercel

