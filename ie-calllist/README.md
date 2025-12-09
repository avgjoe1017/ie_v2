# IE Call List V2

A mobile-first web app for Inside Edition producers to find and call TV station contacts instantly.

## Features

- 📱 **Mobile-first PWA** - Install on any phone, works offline
- 🔍 **Fuzzy search** - Find stations by market, call letters, or city
- 📞 **Tap-to-call** - One tap to open phone dialer
- 🎯 **Feed filters** - Filter by 3PM, 5PM, or 6PM feeds
- 📊 **Audit trail** - All calls and edits logged
- 👥 **Role-based access** - Producer and Admin roles
- 🌙 **Dark mode** - System-aware theme switching

## Quick Start

```bash
# Install dependencies
npm install

# Set up database
npx prisma db push
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Test credentials:**
- Admin PIN: `123456`
- Producer PIN: `111111`

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS v4
- **Database:** SQLite (Prisma ORM)
- **Search:** Fuse.js
- **State:** React Query + Zustand
- **Auth:** JWT + bcrypt

## Project Structure

```
ie-calllist/
├── app/              # Next.js pages and API routes
├── components/       # React components
├── domain/           # Business logic
├── lib/              # Utilities
├── prisma/           # Database schema
└── public/           # Static assets
```

## Documentation

- [Architecture](MD_DOCS/ARCHITECTURE.md) - Technical design decisions
- [Progress](PROGRESS.md) - Development changelog
- [Production](PRODUCTION_INSTRUCTIONS.md) - Deployment guide

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio |

## Environment Variables

```bash
DATABASE_URL="file:./prisma/dev.db"
SESSION_SECRET="your-secret-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Production (Turso)
TURSO_DATABASE_URL="libsql://your-db.turso.io"
TURSO_AUTH_TOKEN="your-token"
```

## License

Confidential - CBS / Inside Edition
