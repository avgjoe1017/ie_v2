# INSIDE EDITION CALL LIST
## V2 Product Specification

**Station Contact Directory**

Version 2.0 — December 2025

*CONFIDENTIAL — CBS / Inside Edition*

---

# 1. Overview

## 1.1 What This Is

A mobile-first web app for Inside Edition producers to find and call TV station contacts instantly. 210 markets, tap-to-call, done.

## 1.2 What This Is Not

V2 is intentionally limited to the contact directory. Broadcast alerts are out of scope:

| Version | Scope |
|---------|-------|
| **V2** | Contact directory + tap-to-call |
| V3 | Voice broadcast alerts (robocall) |
| V4 | Text alerts (SMS fallback) |

## 1.3 Success Criteria

- Producer finds and calls any station in under 5 seconds
- Works on any phone via browser (PWA installable)
- All calls logged for audit trail
- Station data editable with change tracking

---

# 2. Users

## 2.1 Producers

IE producers in the New York control room. They need to call stations fast — during live broadcasts, breaking news, or feed coordination.

**Primary workflow:** Open app → search "Market 47" or "Chicago" → tap → call.

## 2.2 Admins

Technical staff who update station contacts when numbers change. Same app, just use the edit function.

---

# 3. Features

## 3.1 Station Directory (Home Screen)

A searchable list of all 210 TV markets.

### Station Card

Each card shows:

- **Feed + Status** — "3PM" / "5PM" / "6PM" badge (color-coded) with optional status pill (LIVE/RERACK/MIGHT)
- **Call letters** — Station ID (e.g., "WLS-TV")
- **Market name** — City/region (e.g., "CHICAGO, IL")
- **Air time** — Local time + ET (e.g., "3:00 PM local / 4:00 PM ET")
- **Primary phone** — First contact number + label
- **Chevron** — Tap for detail view

**Example card:**
```
┌────────────────────────────────────────┐
│ [3PM] [RERACK]                      >  │
│ WLS-TV                                 │
│ CHICAGO, IL                            │
│ 3:00 PM local / 4:00 PM ET             │
│ Joshua Baranoff: 678-459-7853          │
└────────────────────────────────────────┘
```

**Feed Badge Colors:**
- 3PM → Amber
- 5PM → Green  
- 6PM → Purple

**Status Pill Colors:**
| Status | Meaning | Display |
|--------|---------|---------|
| LIVE | Station takes feed live | Green pill |
| RERACK | Station records, plays later | Yellow pill |
| MIGHT | Uncertain / conditional | Gray pill |
| (blank) | Standard | No pill shown |

### Search

- Fuzzy search via Fuse.js (typo-tolerant)
- Searches: market number, market name, call letters
- Results update as you type

### Filters

**Feed filter:** Toggle buttons — **All** | **3pm** | **5pm** | **6pm**

Filters by satellite feed time. Color-coded to match card badges.

## 3.2 Tap-to-Call

Tap a station card → confirmation dialog appears:

```
┌─────────────────────────────┐
│  Call Chicago - WLS?        │
│  News Desk: (312) 555-1234  │
│                             │
│  [Cancel]         [Call]    │
└─────────────────────────────┘
```

- **Cancel** — Dismiss, no logging
- **Call** — Opens phone dialer via `tel:` link, logs the call

Call is logged when user taps "Call" — not on connection (we can't detect that with `tel:` links).

## 3.3 Station Detail

Tap the chevron on any card to see full station info:

- Feed + broadcast status
- Call letters + market name
- Market number (DMA rank)
- Air time (local + ET)
- **All phone numbers** (up to 4, with labels)
- Tap any number to call (same confirmation flow)
- Edit button (top right)

**Example:**
```
WLS-TV — CHICAGO, IL
Market #3 | 3PM Feed | RERACK

Air Time: 3:00 PM local / 4:00 PM ET

CONTACTS
📞 Joshua Baranoff      678-459-7853
📞 Operations           281-602-5611

[Edit]
```

## 3.4 Station Edit

Admin function. Accessed via Edit button on detail screen.

**Editable fields:**
- Call letters
- Market name
- Feed assignment (3pm / 5pm / 6pm)
- Broadcast status (Live / Rerack / Might / None)
- Air time local
- Air time ET

**Phone management:**
- Edit existing contacts (label + number)
- Reorder contacts (drag or up/down buttons)
- Add new phone (up to 4 max)
- Delete phone (minimum 1 required)

**Validation:**
- Phone numbers validated via libphonenumber
- Formatted to E.164 on save

**Audit:**
- All changes logged with field, old value, new value, user, timestamp
- Viewable in Edit History

## 3.5 Admin Panel (Web)

A separate, simple web interface for quick database edits. Accessed at `/admin`.

**Why separate from the app?**
- Producers use the app on phones for calling
- Admins need a spreadsheet-like view for bulk data management
- Desktop-optimized for efficiency

### Access

- Same PIN system (individual PINs)
- Only users with `role: admin` can access
- Direct URL: `calllist.example.com/admin`

### Features

**Station Table View:**
- All stations in a sortable, filterable table
- Columns: Market #, Call Letters, Market Name, Feed, Status, Air Time (Local), Air Time (ET), Primary Phone
- Click any row to edit inline
- Bulk select + bulk edit (e.g., change 10 stations to RERACK)

**Quick Edit:**
- Click cell → edit in place
- Tab to next field
- Changes save automatically (with debounce)
- All changes logged to EditLog with user + timestamp

**Edit History (Audit Trail):**
- View all changes made via admin panel
- Filter by station, user, or date range
- Shows: what changed, old value → new value, who, when
- Exportable for compliance reporting

**Filters:**
- Filter by feed (3pm / 5pm / 6pm)
- Search by name, call letters, or market number

**Bulk Import:**
- Upload CSV to update multiple stations
- Preview changes before applying
- Shows diff: "Market 47: status changing from LIVE to RERACK"

**User Management (super admin only):**
- Create new users with PIN
- Reset PINs
- Set roles (producer / admin)
- Deactivate users

## 3.6 Call History

Accessed via phone icon in header.

- Chronological list grouped by date (Today, Yesterday, etc.)
- Each entry: market name, phone number, label, timestamp
- Shows calls made by current user only (or all, for admins — TBD)

## 3.7 Edit History

Accessed via Settings → View Edit History.

- All station data changes
- Shows: field changed, old → new value, who, when
- Searchable by market

## 3.8 Settings

- **Theme:** Light / Dark / System
- **Edit History:** Link
- **Report Issue:** Opens email to support
- **Sign Out:** Clears session, returns to PIN screen
- **Version:** App version display

---

# 4. Authentication

## 4.1 Individual PINs

Each producer gets a unique 6-digit PIN. No email, no password, no OAuth.

### User Table

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | Display name ("Joe", "Sarah") |
| pinHash | String | Bcrypt hash of PIN |
| role | Enum | "producer" \| "admin" |
| createdAt | DateTime | |

### Flow

1. Open app → PIN entry screen
2. Enter 6-digit PIN
3. Backend looks up user by PIN hash
4. If found: create session, store in httpOnly cookie
5. Session includes userId → all actions attributed to that user
6. Session expires after 7 days of inactivity

### Audit Attribution

With individual PINs:
- `CallLog.calledBy` → actual user ID
- `EditLog.editedBy` → actual user ID

No more "producer" placeholder. Real accountability.

## 4.2 Security Assumptions

- App accessible on CBS internal network or behind SSO proxy
- PIN-only auth not intended for public internet
- If PIN compromised, admin can reset it

---

# 5. Data Model

## 5.1 How the Data Works

A single market (like Chicago) can have **multiple entries** — one per feed. For example, WLS-TV Chicago appears twice in the data:
- 3:00 PM feed → airs at 3:00 PM local, different contacts
- 6:00 PM feed → airs at 3:37 AM local, different contacts

Each feed entry has its own set of phone numbers and may have a different broadcast status.

## 5.2 CSV Structure (Source of Truth)

```
Feed, Status, Rank, Station, City, Air Time, ET Time, Main Name, Main Phone, #2 Name, Phone #2, #3 Name, Phone #3, #4 Name, Phone #4
```

| Column | Example | Description |
|--------|---------|-------------|
| Feed | 6:00 PM | Satellite feed time (3pm, 5pm, 6pm) |
| Status | RERACK | LIVE, RERACK, MIGHT, or blank |
| Rank | 3 | Nielsen DMA market number |
| Station | WLS-TV | Call letters |
| City | CHICAGO, IL | Market name |
| Air Time | 3:37 AM | Local air time |
| ET Time | 4:37 AM | Eastern time |
| Main Name | Atlanta Hub | Primary contact label |
| Main Phone | 678-421-6902 | Primary phone |
| #2-4 | ... | Up to 3 additional contacts |

## 5.3 Entities

### User

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | Display name |
| pinHash | String | Bcrypt hash |
| role | Enum | "producer" \| "admin" |
| createdAt | DateTime | |

### Station

Each row in the CSV becomes a Station record. Same market + different feed = separate records.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| marketNumber | Integer | Nielsen DMA rank (1-210) |
| marketName | String | City/region ("CHICAGO, IL") |
| callLetters | String | Station ID ("WLS-TV") |
| feed | Enum | "3pm" \| "5pm" \| "6pm" |
| broadcastStatus | Enum? | "live" \| "rerack" \| "might" \| null |
| airTimeLocal | String | Local air time ("3:37 AM") |
| airTimeET | String | Eastern time ("4:37 AM") |
| isActive | Boolean | Soft delete flag |
| phones | PhoneNumber[] | Up to 4 contacts |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Unique constraint:** `(marketNumber, feed)` — one entry per market per feed.

### PhoneNumber

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| stationId | UUID | FK to Station |
| label | String | "Atlanta Hub", "News Desk", etc. |
| number | String | E.164 format |
| sortOrder | Integer | 1-4, determines display order |
| createdAt | DateTime | |

Phone #1 (sortOrder=1) is the primary contact shown on cards.

### CallLog

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| stationId | UUID | FK to Station |
| phoneId | UUID | FK to PhoneNumber |
| phoneNumber | String | Snapshot of number called |
| calledBy | UUID | FK to User |
| createdAt | DateTime | When call was initiated |

### EditLog

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| stationId | UUID | FK to Station |
| field | String | What changed |
| oldValue | String | Previous value |
| newValue | String | New value |
| editedBy | UUID | FK to User |
| createdAt | DateTime | |

---

# 6. Technical Architecture

## 6.1 Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| State | React Query (server state) + Zustand (UI filters) |
| Search | Fuse.js (client-side) |
| Database | SQLite via Turso |
| ORM | Prisma |
| Validation | Zod + libphonenumber |
| Deployment | Vercel (single deployment) |

## 6.2 Why This Stack

**Next.js on Vercel (single deployment):**
- No separate backend needed for V2
- API routes handle all server logic
- No long-running jobs (that's V3)
- Serverless is fine for simple CRUD + auth

**Turso (SQLite at the edge):**
- 210 markets, ~500 phone numbers — tiny dataset
- Sub-10ms reads from edge
- No Postgres complexity needed

**Fuse.js (client-side search):**
- Dataset fits in memory
- Fuzzy matching for typos
- No search infrastructure

## 6.3 Architecture

```
[Producer Phone / Browser]
           │
           ▼
[Next.js on Vercel]
    ├── /app (React, PWA)
    └── /api (Route Handlers)
           │
           ▼
[Turso SQLite]
```

One deployment. One bill. One mental model.

## 6.4 Preserved from V1

These domain modules are battle-tested and carry over:

- **market.ts** — `TIMEZONE_MAP`, `parseAirTime()`, `getBroadcastTimeLabel()`
- **phone.ts** — Validation, E.164 formatting
- **contracts.ts** — Shared Zod schemas

---

# 7. API Routes

All routes under `/api/`. Auth required on all except `/api/auth/login`.

## 7.1 Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Validate PIN, create session |
| POST | `/api/auth/logout` | Clear session |
| GET | `/api/auth/me` | Get current user |

## 7.2 Markets

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/markets` | List all markets with phones |
| GET | `/api/markets/[id]` | Single market detail |
| PUT | `/api/markets/[id]` | Update market (logs changes) |
| PATCH | `/api/markets/[id]/phones/[phoneId]/primary` | Set primary |

## 7.3 Logs

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/call-logs` | Get call history |
| POST | `/api/call-logs` | Log a call |
| GET | `/api/edit-logs` | Get edit history |

## 7.4 Admin

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/admin/import` | CSV import (admin only) |
| POST | `/api/admin/bulk` | Bulk update stations (admin only) |
| GET | `/api/admin/users` | List users (admin only) |
| POST | `/api/admin/users` | Create user (admin only) |
| PUT | `/api/admin/users/[id]` | Update user / reset PIN (admin only) |
| DELETE | `/api/admin/users/[id]` | Deactivate user (admin only) |

---

# 8. PWA Configuration

## 8.1 Manifest

```json
{
  "name": "IE Call List",
  "short_name": "Call List",
  "start_url": "/stations",
  "display": "standalone",
  "theme_color": "#2563eb",
  "background_color": "#ffffff",
  "icons": [...]
}
```

## 8.2 Behavior

- Installable on iOS (Add to Home Screen) and Android (Install App)
- Launches fullscreen, no browser chrome
- `tel:` links open native phone dialer
- Works offline for viewing cached station data (calls require network)

---

# 9. File Structure

```
ie-calllist/
├── app/
│   ├── layout.tsx              # Root layout, PWA meta
│   ├── page.tsx                # Redirect to /stations or /login
│   ├── login/
│   │   └── page.tsx            # PIN entry
│   ├── stations/
│   │   ├── page.tsx            # Station directory (home)
│   │   └── [id]/
│   │       ├── page.tsx        # Station detail
│   │       └── edit/page.tsx   # Station edit
│   ├── logs/
│   │   ├── calls/page.tsx      # Call history
│   │   └── edits/page.tsx      # Edit history
│   ├── settings/
│   │   └── page.tsx            # Settings
│   ├── admin/
│   │   ├── layout.tsx          # Admin layout (checks role)
│   │   ├── page.tsx            # Station table view
│   │   ├── users/page.tsx      # User management
│   │   └── import/page.tsx     # CSV import
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   └── me/route.ts
│       ├── markets/
│       │   ├── route.ts        # GET all, POST create
│       │   └── [id]/
│       │       ├── route.ts    # GET one, PUT update, PATCH inline
│       │       └── phones/[phoneId]/primary/route.ts
│       ├── call-logs/
│       │   └── route.ts
│       ├── edit-logs/
│       │   └── route.ts
│       └── admin/
│           ├── import/route.ts
│           ├── users/route.ts
│           └── bulk/route.ts   # Bulk edit operations
├── components/
│   ├── StationCard.tsx
│   ├── StationList.tsx
│   ├── SearchBar.tsx
│   ├── FeedFilter.tsx
│   ├── StatusBadge.tsx         # LIVE/RERACK/MIGHT pills
│   ├── CallDialog.tsx
│   ├── PhoneList.tsx
│   ├── PinInput.tsx
│   └── admin/
│       ├── StationTable.tsx    # Editable table
│       ├── InlineEdit.tsx      # Click-to-edit cell
│       ├── BulkActions.tsx     # Multi-select toolbar
│       └── ImportPreview.tsx   # CSV diff view
├── lib/
│   ├── db.ts                   # Prisma client
│   ├── auth.ts                 # Session helpers
│   └── api.ts                  # Fetch wrapper
├── domain/
│   ├── market.ts               # Timezone logic
│   ├── phone.ts                # Validation
│   └── contracts.ts            # Zod schemas
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   ├── manifest.json
│   └── icons/
├── README.md
└── package.json
```

---

# 10. Environment Variables

```bash
# Database
DATABASE_URL=libsql://your-db.turso.io
DATABASE_AUTH_TOKEN=xxx

# Auth
SESSION_SECRET=xxx  # For cookie signing

# Optional
NEXT_PUBLIC_APP_URL=https://calllist.example.com
```

That's it. No Twilio keys, no S3 buckets. V2 is simple.

---

# 11. Implementation Plan

## Week 1: Foundation

- [ ] Next.js 14 project with Tailwind
- [ ] Prisma schema + Turso setup
- [ ] CSV parser for ie_data_as_of_12-6.csv format
- [ ] Seed script to import all stations from CSV
- [ ] PIN auth with session cookies
- [ ] User management (admin creates PINs)

## Week 2: Core UI

- [ ] Station directory with search + filters
- [ ] Station cards with feed + status badges
- [ ] Tap-to-call with confirmation dialog
- [ ] Call logging on confirm
- [ ] Station detail screen
- [ ] Phone list with tap-to-call
- [ ] Station edit screen (in-app)
- [ ] Phone add/edit/delete
- [ ] Edit logging

## Week 3: Admin Panel + Polish

- [ ] Admin panel layout (role check)
- [ ] Station table with inline editing
- [ ] Bulk select + bulk edit
- [ ] CSV import with preview
- [ ] User management (create, reset PIN, deactivate)
- [ ] Edit history screen (app)
- [ ] Call history screen (app)
- [ ] Settings screen
- [ ] Dark mode

## Week 4: PWA + Deploy

- [ ] PWA manifest + service worker
- [ ] Offline caching for station data
- [ ] Install prompts
- [ ] Deploy to Vercel
- [ ] Turso production database
- [ ] User acceptance testing
- [ ] Documentation

---

# 12. Future Versions

## V3: Voice Broadcast

- Audio recording in browser
- Twilio voice integration
- Robocall to all stations / feed groups
- Press-1 confirmation
- Answering Machine Detection
- Delivery status tracking
- Alert history

**New infrastructure needed:**
- Long-running server (Railway) or job queue (Inngest)
- Audio storage (R2)
- FFmpeg for audio conversion
- Twilio account with sufficient CPS

## V4: Text Alerts

- SMS fallback for mobile numbers
- Twilio SMS integration
- Delivery tracking
- isMobile flag on phone numbers

---

# Appendix: Why Not V1's Stack?

| V1 | V2 | Why |
|----|-----|-----|
| Expo + React Native | Next.js | PWA is simpler, no native builds |
| NativeWind | Tailwind | Standard Tailwind, no translation layer |
| expo-av | (not needed) | Voice recording is V3 |
| Better Auth | PIN + cookies | Internal tool, no OAuth needed |
| Hono on Railway | Next.js API routes | Single deployment, V2 has no long jobs |
| Reanimated | (not needed) | No complex animations |

V2 is smaller, simpler, and shippable in 4 weeks.

---

*— END OF V2 SPECIFICATION —*
