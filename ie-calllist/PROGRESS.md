# IE Call List V2 - Development Progress

## December 8, 2025

### Initial Project Setup
**Time:** Session start
**Changes:**
- Initialized Next.js 14 project with TypeScript and Tailwind CSS v4
- Installed core dependencies:
  - `@prisma/client`, `prisma` - Database ORM
  - `@tanstack/react-query` - Server state management
  - `zustand` - UI state management
  - `fuse.js` - Client-side fuzzy search
  - `zod` - Schema validation
  - `libphonenumber-js` - Phone number validation/formatting
  - `bcryptjs` - PIN hashing
  - `jose` - JWT token handling

**Decision:** Used Prisma 6 instead of Prisma 7 due to breaking changes in configuration. Prisma 7 requires explicit adapter configuration that was causing issues with local SQLite.

### Database Schema Created
**Time:** Same session
**Changes:**
- Created Prisma schema with 5 models:
  - `User` - PIN-authenticated users with roles
  - `Station` - TV market stations with feed/status
  - `PhoneNumber` - Contact numbers with labels
  - `CallLog` - Audit trail for calls
  - `EditLog` - Audit trail for data changes
- Unique constraint on `(marketNumber, feed)` to support same market with multiple feeds

**Decision:** Used separate PhoneNumber model instead of JSON array to enable proper querying and foreign key relationships.

### Domain Modules Implemented
**Time:** Same session
**Files created:**
- `domain/contracts.ts` - Zod schemas for all entities
- `domain/market.ts` - Timezone mapping, feed/status config
- `domain/phone.ts` - Phone validation and E.164 formatting

**Decision:** Kept timezone mapping even though we're not doing real-time conversion in V2 - will be useful for V3 broadcast alerts.

### Authentication System
**Time:** Same session
**Changes:**
- Implemented PIN-based auth with bcrypt hashing
- JWT sessions stored in httpOnly cookies
- 7-day session expiry
- Role-based access (producer/admin)

**Decision:** Used JWT instead of database sessions for stateless verification. Simpler deployment without session store.

### UI Components Built
**Time:** Same session
**Components created:**
- `Header` - Navigation with call history and settings links
- `SearchBar` - Fuzzy search input
- `FeedFilter` - Feed toggle buttons (3PM/5PM/6PM)
- `StationCard` - Market card with tap-to-call
- `StationList` - Filtered/sorted list with Fuse.js
- `CallDialog` - Confirmation modal before calling
- `PhoneList` - Contact list for detail view
- `PinInput` - 6-digit PIN entry with paste support
- `StatusBadge` - LIVE/RERACK/MIGHT pills
- `FeedBadge` - Color-coded feed labels

**Decision:** Used Zustand for CallDialog state to allow opening from any StationCard without prop drilling.

### Pages Implemented
**Time:** Same session
**Pages created:**
- `/login` - PIN entry screen
- `/stations` - Station directory home
- `/stations/[id]` - Station detail view
- `/stations/[id]/edit` - Station editing (admin)
- `/logs/calls` - Call history
- `/logs/edits` - Edit history
- `/settings` - Theme, logout
- `/admin` - Station table view
- `/admin/users` - User management
- `/admin/import` - CSV import

### API Routes Implemented
**Time:** Same session
**Routes created:**
- `POST /api/auth/login` - PIN validation
- `POST /api/auth/logout` - Clear session
- `GET /api/auth/me` - Current user
- `GET /api/markets` - List stations
- `GET /api/markets/[id]` - Station detail
- `PUT /api/markets/[id]` - Update station
- `POST /api/markets/[id]/phones` - Add phone
- `PUT /api/markets/[id]/phones/[phoneId]` - Update phone
- `DELETE /api/markets/[id]/phones/[phoneId]` - Delete phone
- `GET /api/call-logs` - Call history
- `POST /api/call-logs` - Log call
- `GET /api/edit-logs` - Edit history
- `POST /api/admin/import` - CSV import
- `POST /api/admin/bulk` - Bulk updates
- `GET/POST /api/admin/users` - User CRUD

### PWA Configuration
**Time:** Same session
**Changes:**
- Created `manifest.json` with app metadata
- Set up viewport and theme colors
- Added Apple touch icon placeholders

**Decision:** Icons are placeholders - actual icons should be generated from IE logo before production.

### Database Seeded
**Time:** Same session
**Data created:**
- 2 test users (Admin PIN: 123456, Producer PIN: 111111)
- 6 sample stations with multiple feeds
- Phone numbers with various configurations

### Station Data Imported
**Time:** Same session
**Changes:**
- Created `scripts/import-csv.ts` to parse and import CSV data
- Imported all 146 rows from `ie data as of 12-6.csv`
- Successfully imported **139 unique stations** with **212 phone numbers**
- Station breakdown by feed:
  - 3PM: 72 stations
  - 5PM: 15 stations  
  - 6PM: 52 stations

**Decision:** Used a custom CSV parser to handle the specific format of the IE data file. Phone numbers are normalized to E.164 format (+1XXXXXXXXXX) for consistent storage.

### UI Layout Updates
**Time:** Same session
**Changes:**
- Made market rank prominently visible on left side of each card (large number in rounded box)
- Changed station list from responsive grid to single-column list layout
- Improved card layout with horizontal flex for better information hierarchy

**Decision:** Single column list is better for mobile-first experience and quickly scanning market numbers in order.

### Design Refinement
**Time:** Same session
**Changes:**
- Reduced font sizes throughout the app for a cleaner, more compact look
- Updated StationCard with refined layout:
  - Smaller market number indicator (9x9 rounded box)
  - Call letters + feed badge on same row
  - Status shown as colored text (not filled pill) next to air time
  - Phone icon with contact info row
  - More compact vertical spacing
- Updated FeedFilter with subtle styling:
  - Smaller buttons with rounded-md corners
  - Active state uses feed color for colored filters
  - Inactive state is plain text with hover effect
- Updated Header:
  - Reduced height from 14 to 11
  - Smaller icons (18px)
  - Lighter borders
- Updated SearchBar:
  - Cleaner focus states with ring-offset
  - Better placeholder styling
- Updated PinInput:
  - Border-2 styling for better focus indication
  - More refined sizing
- Color refinements:
  - Used emerald instead of green for 5PM and LIVE status
  - Used violet instead of purple for 6PM
  - Added dark mode variants to all color configs
  - Softer background colors (50 shades + opacity for dark)
- Changed font from DM Sans to Inter for cleaner, more professional look

**Decision:** Design inspired by modern fintech/business app UI patterns - clean lines, subtle colors, compact information density. Status shown as colored text (like "Shipped", "Confirmed" in inspiration) rather than filled badges for a more refined look.

---

## December 8, 2025 - Sticky Theme Integration

### UI Theme Update Using Sticky Patterns
**Time:** Current session
**Changes:**
- Integrated Sticky Mobile theme patterns as a design system, not a direct copy
- Adapted patterns to work with Next.js/React/Tailwind architecture
- Maintained IE brand colors (red primary) while using Sticky spacing and layout patterns

**Components Updated:**

1. **Header Component** (`components/Header.tsx`)
   - Converted to Sticky `header-fixed header-logo-center` pattern
   - Center-aligned title: "INSIDE EDITION CALL LIST"
   - Left: Back button (when on detail pages)
   - Right: Theme toggle (light/dark/system)
   - Fixed positioning with proper z-index

2. **Bottom Navigation** (`components/BottomNav.tsx`)
   - New component using Sticky `footer-bar` pattern
   - Three items: Directory (home), History (clock), Settings (gear)
   - Active state highlighting with IE red color
   - Fixed bottom positioning with safe area support

3. **Station List** (`components/StationList.tsx`)
   - Converted to Sticky contacts list pattern
   - Full-height card with scrollable content inside
   - Uses `list-group list-custom-large` pattern
   - Scroll container with max-height for proper mobile scrolling

4. **Station Card** (`components/StationCard.tsx`)
   - Redesigned to match Sticky `list-custom-large` item pattern
   - Feed badge as colored icon (3/5/6) on left
   - Station name as main text
   - Market name + air time as secondary text
   - Right chevron for navigation
   - Tap anywhere to trigger call action sheet

5. **Call Dialog** (`components/CallDialog.tsx`)
   - Converted to Sticky action sheet pattern
   - Slides up from bottom (not centered modal)
   - Handle bar at top for visual affordance
   - Red "Call Now" button matching IE brand
   - Proper backdrop with click-to-dismiss
   - Body scroll lock when open

6. **Search Bar** (`components/SearchBar.tsx`)
   - Wrapped in Sticky `card card-style` container
   - Updated placeholder: "Search by call letters, market, or number"
   - Styled to match Sticky input patterns

7. **Feed Filter** (`components/FeedFilter.tsx`)
   - Wrapped in Sticky `card card-style` container
   - Maintains existing feed color coding

8. **Global Styles** (`app/globals.css`)
   - Added Sticky theme CSS classes:
     - `.header`, `.header-fixed`, `.header-logo-center`
     - `.header-icon`, `.header-icon-1`, `.header-icon-4`
     - `.page-content`, `.header-clear-medium`
     - `.card`, `.card-style`
     - `.list-group`, `.list-custom-large`, `.list-item`
   - Safe area support for bottom nav

9. **Notification System** (`components/Notification.tsx`)
   - New component for toast notifications
   - Slides down from top
   - Three types: success (green), error (red), info (blue)
   - Auto-dismiss after 3 seconds
   - Integrated with Zustand store

10. **Offline Detection** (`components/OfflineDetector.tsx`)
    - New component that detects network status
    - Shows yellow banner at top when offline
    - Uses browser online/offline events

11. **Theme Toggle** (Updated `components/Header.tsx`)
    - Integrated with existing `useThemeStore`
    - Cycles through: light → dark → system
    - Icon changes based on current theme
    - Persists preference in localStorage

**Layout Updates:**
- Updated `app/layout.tsx` to include BottomNav, Notification, and OfflineDetector
- Wrapped content in `<div id="page">` for Sticky compatibility
- Updated `app/stations/page.tsx` to use card containers for all sections
- Updated `app/stations/[id]/page.tsx` to use card containers

**Design Decisions:**
- Used Sticky as a **pattern library**, not a direct copy
- Kept IE red (#DC2626) as primary highlight color
- Maintained broadcast-focused icons (phone, clock, map-pin)
- Avoided marketing-style gradients and carousels
- Focused on "Google Contacts meets broadcast control room" aesthetic
- Mobile-first approach with proper touch targets
- Full-height scrollable cards for native app feel

**What Was NOT Used:**
- Sticky's Bootstrap CSS/JS files (adapted patterns to Tailwind)
- FontAwesome icons (using SVG icons instead)
- Marketing hero sections, carousels, galleries
- E-commerce or finance dashboard patterns

### Bug Fixes
**Time:** Same session
**Changes:**
- Fixed missing closing `</div>` tag in `app/stations/[id]/page.tsx` that was causing JSX parsing error
- Fixed Next.js lint warning in `components/Header.tsx` by replacing `<a>` tag with `<Link>` component for internal navigation to `/stations`

**Decision:** Used Next.js `<Link>` component for all internal route navigation to enable client-side routing and prefetching optimizations.

---

---

## December 9, 2024 - Vercel Environment Variables Setup

### Vercel Deployment Configuration
**Time:** Current session
**Changes:**
- Created comprehensive Vercel environment variables setup guide (`MD_DOCS/VERCEL_ENV_SETUP.md`)
- Added helper script `scripts/generate-session-secret.ts` to generate secure 32-character SESSION_SECRET
- Updated `PRODUCTION_INSTRUCTIONS.md` with detailed step-by-step instructions for all 5 required environment variables
- Generated example SESSION_SECRET: `35c232df2778595b1685bb4070273e1f`

**Required Vercel Environment Variables:**
1. `DATABASE_URL` - Turso database URL (from `turso db show ie-calllist --url`)
2. `TURSO_DATABASE_URL` - Same as DATABASE_URL
3. `TURSO_AUTH_TOKEN` - Authentication token (from `turso db tokens create ie-calllist`)
4. `SESSION_SECRET` - Random 32-character string for JWT signing (generated via script)
5. `NEXT_PUBLIC_APP_URL` - Production Vercel URL (e.g., `https://your-project.vercel.app`)

**Decision:** Created separate detailed guide document (`VERCEL_ENV_SETUP.md`) to provide step-by-step instructions with troubleshooting, while keeping `PRODUCTION_INSTRUCTIONS.md` as the main reference. This makes it easier for deployment without cluttering the main instructions file.

**Files Created:**
- `MD_DOCS/VERCEL_ENV_SETUP.md` - Complete guide with troubleshooting
- `scripts/generate-session-secret.ts` - Helper script for secure secret generation

**Files Updated:**
- `PRODUCTION_INSTRUCTIONS.md` - Enhanced environment variables section with clear instructions

---

## December 9, 2024 - Deployment Preparation

### PWA Icons Setup
**Time:** Current session
**Changes:**
- Created `scripts/generate-icons.ts` to generate placeholder SVG icons for all required PWA sizes (72, 96, 128, 144, 152, 192, 384, 512)
- Generated all 8 placeholder icons in `/public/icons/` directory
- Created `public/icons/README.md` with instructions for converting SVG to PNG and using actual IE logo
- Icons currently use blue background with "IE" text as placeholders

**Decision:** Generated SVG placeholders to ensure directory structure exists. For production, these must be converted to PNG format using the actual Inside Edition logo. The manifest.json already references these icons correctly.

### Vercel Configuration
**Time:** Current session
**Changes:**
- Created `vercel.json` with Next.js framework configuration
- Set build command to `npm run build` (includes Prisma generate)
- Configured region to `iad1` (US East)

**Decision:** Explicit Vercel config ensures proper build process and region selection for optimal performance.

### Deployment Documentation
**Time:** Current session
**Changes:**
- Created `MD_DOCS/DEPLOYMENT_CHECKLIST.md` - comprehensive step-by-step checklist for deployment
- Created `scripts/setup-turso.ps1` - PowerShell script to automate Turso database setup on Windows
- Updated `MD_DOCS/VERCEL_ENV_SETUP.md` with detailed environment variable instructions

**Files Created:**
- `vercel.json` - Vercel deployment configuration
- `scripts/generate-icons.ts` - Icon generation script
- `scripts/setup-turso.ps1` - Turso setup automation script
- `MD_DOCS/DEPLOYMENT_CHECKLIST.md` - Complete deployment checklist
- `public/icons/README.md` - Icon conversion instructions
- `public/icons/*.svg` - 8 placeholder icon files

**Decision:** Created automation scripts and comprehensive documentation to streamline deployment process and reduce manual errors.

### Package.json Verification
**Time:** Current session
**Verified:**
- Build script includes `prisma generate` before `next build` ✓
- All required dependencies present (@libsql/client, @prisma/adapter-libsql) ✓
- TypeScript and build tools properly configured ✓

---

## December 10, 2024 - Turso Integration & Production Build

### Turso Database Configuration
**Time:** Current session
**Changes:**
- Created Turso database: `ie-calllist-avgjoe1017.aws-us-west-2.turso.io`
- Generated authentication token for production access
- Updated `lib/db.ts` to support both local SQLite (dev) and Turso (production)
- Configured Prisma Client to dynamically use Turso URL with auth token in production
- Updated `next.config.ts` to handle libsql external packages

**Decision:** Used direct URL approach instead of libsql adapter to avoid Next.js 16 Turbopack compatibility issues. The Prisma Client now constructs the full database URL with auth token at runtime when TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are present.

### Production Build Success
**Time:** Current session
**Verified:**
- Build completes successfully ✓
- All routes compile correctly ✓
- TypeScript validation passes ✓
- Static and dynamic pages generated ✓

### Environment Variables Ready
**Time:** Current session
**Configured:**
1. `DATABASE_URL` = `libsql://ie-calllist-avgjoe1017.aws-us-west-2.turso.io`
2. `TURSO_DATABASE_URL` = `libsql://ie-calllist-avgjoe1017.aws-us-west-2.turso.io`
3. `TURSO_AUTH_TOKEN` = Generated from Turso dashboard
4. `SESSION_SECRET` = `642a5ebc03699069a42a0f6eac6a2f48`
5. `NEXT_PUBLIC_APP_URL` = To be set after Vercel deployment

**Files Created:**
- `VERCEL_ENV_VALUES.txt` - All environment variable values for easy copy-paste
- `MD_DOCS/DEPLOYMENT_READY.md` - Complete deployment guide with all values
- `MD_DOCS/TURSO_INSTALL.md` - Turso CLI installation instructions

---

## Next Steps (Ready for Deployment!)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Production ready: Turso integration complete"
   git push origin master
   ```

2. **Deploy to Vercel:**
   - Import repository
   - Set root directory to `ie-calllist`
   - Add all 5 environment variables
   - Redeploy

3. **Push Database Schema:**
   ```powershell
   $env:DATABASE_URL="libsql://ie-calllist-avgjoe1017.aws-us-west-2.turso.io?authToken=YOUR_TOKEN"
   npx prisma db push
   ```

4. **Import Station Data** at `/admin/import`

📖 **See `MD_DOCS/DEPLOYMENT_READY.md` for complete step-by-step instructions**

## December 10, 2025 - User Permissions Refinement

**Time:** Current session  
**Changes:**
- Extended role model in `domain/contracts.ts` to support three explicit permission levels:
  - `viewer` → read-only
  - `producer` → read & write (no admin)
  - `admin` → full access
- Updated `/admin/users` page (`app/admin/users/page.tsx`) so admins can add/edit/delete users with:
  - Name
  - PIN (6 digits)
  - Permissions dropdown with labels: "Read only", "Read & write", "Admin (full)"
- Ensured existing users with unknown/legacy roles fall back safely to `producer` in the UI.
- Tightened API authorization to enforce read-only behavior for `viewer` role:
  - `PUT /api/markets/[id]` now blocks viewers from editing stations
  - `POST /api/markets/[id]/phones` blocks viewers from adding phones
  - `PUT`/`DELETE /api/markets/[id]/phones/[phoneId]` block viewers from editing/deleting phones
  - `POST /api/call-logs` blocks viewers from creating call logs (no dialing from app)

**Decision:** Kept existing `producer` and `admin` role semantics to avoid breaking current users, while introducing a new `viewer` role to satisfy the requirement for explicit read-only access. Mapped the three levels to user-facing labels in the admin UI so admins can clearly assign "read", "read & write", and "admin (full)" permissions when managing PINs.

## December 10, 2025 - Session Role Typing Fix

**Time:** Current session  
**Changes:**
- Updated `lib/auth.ts` so the `SessionPayload.role` field is typed as the shared `Role` union from `domain/contracts.ts` (now `viewer` | `producer` | `admin`) and tightened `createSession`’s parameter type accordingly. This ensures all APIs that consume `getSession()` can safely branch on `viewer` without TypeScript treating the comparison as impossible, unblocking the build error in `app/api/call-logs/route.ts`.

**Decision:** Centralized role typing around the domain `Role` type to keep auth/session payloads and API guards in sync as we evolve permission levels.

## December 10, 2025 - Minor Lint Cleanup

**Time:** Current session  
**Changes:**
- Updated `app/api/admin/import/route.ts` to declare the `errors` collection with `const` instead of `let` since the binding is never reassigned, only mutated via `.push`, resolving the ESLint warning (`'errors' is never reassigned. Use 'const' instead.`).  

**Decision:** Followed lint guidance to prefer `const` for non-reassigned bindings to keep the import route clean and consistent with project style.

## December 10, 2025 - Login Route Role Narrowing

**Time:** Current session  
**Changes:**
- Adjusted `app/api/auth/login/route.ts` so the `createSession` call explicitly narrows `user.role` to the shared `Role` union from `domain/contracts.ts`, resolving the TypeScript error about assigning `string` to `"viewer" | "producer" | "admin"` while keeping runtime behavior unchanged.

**Decision:** Used a simple type narrowing cast at the auth boundary since the database already constrains role values, avoiding broader schema changes while keeping types aligned with the new three-level permission model.

## December 10, 2025 - Call Logs Date Impurity Fix

**Time:** Current session  
**Changes:**
- Refactored `app/logs/calls/page.tsx` to compute `today` and `yesterday` using `new Date()` and `setDate` instead of calling `Date.now` directly during render, satisfying React’s purity rules while keeping the “Today / Yesterday” labels behavior identical.

**Decision:** Avoided `Date.now` in server component render paths to align with React’s impure-function restrictions, reusing a single `todayDate` instance to derive both labels for consistency.

## December 10, 2025 - Edit Logs Date Impurity Fix

**Time:** Current session  
**Changes:**
- Applied the same `new Date()` / `setDate` pattern to `app/logs/edits/page.tsx` to replace the `Date.now`-based `yesterday` calculation, eliminating the impure-function warning while preserving the "Today / Yesterday" grouping behavior in the edit history view.

**Decision:** Kept the date-labeling logic consistent across call and edit logs while adhering to React's purity requirements for server components.

## December 10, 2025 - Removed Dark Mode and System Theme Settings

**Time:** Current session  
**Changes:**
- Removed theme selector (light/dark/system) from Settings page (`app/settings/page.tsx`)
- Removed `useThemeStore` from `lib/store.ts` as it's no longer needed
- Simplified `lib/providers.tsx` by removing `ThemeProvider` component and all theme switching logic
- Updated `app/layout.tsx` to remove `className="dark"` from `<html>` tag and simplified viewport `themeColor` to single light mode color
- Removed unused `persist` import from `lib/store.ts`

**Decision:** App is now light mode only for all users. Removed all theme switching functionality to simplify the codebase and user experience. Dark mode CSS classes remain in components but won't be activated since the `dark` class is never added to the document root.

## December 10, 2025 - Settings Page Enhancements

**Time:** Current session  
**Changes:**
- Added "Account" section to Settings page displaying current user name and role
- Used React Query (`useQuery`) to fetch current user data from `/api/auth/me`
- Added `getRoleLabel()` helper function to format role display names (Admin, Producer, Viewer)
- Updated Support email link to `joe.balewski@cbs.com` with subject "IE CALL LIST ISSUE"
- Sign Out button remains unchanged with proper styling and functionality

**Decision:** User info is displayed at the top of the settings page for clarity. React Query is used for efficient data fetching and caching. Email link opens default email client with pre-filled recipient and subject.

## December 10, 2025 - Shared Phone Call Tracking Implementation

**Time:** Current session  
**Changes:**
- Added `RecentCall` model to Prisma schema to track phone numbers called today (deduplicated by number)
- Updated `POST /api/call-logs` to upsert `RecentCall` when a call is logged (transaction ensures both CallLog and RecentCall are created)
- Updated `GET /api/markets` to annotate stations with `calledToday` and `calledAt` fields based on RecentCall data
- Created `POST /api/calls/reset` endpoint to manually clear all call indicators (preserves CallLog audit trail)
- Updated `StationCard` component to display green phone icon and checkmark when `calledToday` is true
- Updated `app/stations/page.tsx` to fetch RecentCall data and annotate stations before passing to StationList
- Updated `StationList` component to pass `calledToday` and `calledAt` props to StationCard
- Added "Call Tracking" section to Settings page with "Clear Call Indicators" button that resets all green icons

**Database Changes:**
- New `RecentCall` table with `number` (unique, E.164 format), `calledAt`, and `calledBy` fields
- Indexes on `number` and `calledAt` for efficient queries
- Foreign key relationship to `User` table

**Visual Changes:**
- Green phone icon (emerald-100 background, emerald-600 icon) appears on station cards when that phone number was called today
- Green checkmark (✓) appears next to phone number when called
- Phone number text changes to emerald-700 when called
- All stations sharing the same phone number show the green indicator simultaneously

**Reset Behavior:**
- Daily auto-reset: Indicators clear at midnight local time (handled by `calledAt >= today` query)
- Manual reset: "Clear Call Indicators" button in Settings clears all RecentCall records and refreshes the station list

**Decision:** Used upsert pattern on phone number to deduplicate calls - only need to know IF a number was called today, not every individual call. RecentCall is separate from CallLog to allow resetting indicators without losing audit history. Green color (emerald) chosen to clearly indicate "called" status while maintaining good contrast and readability.

**Next Steps:**
- Run database migration: `npx prisma migrate dev --name add_recent_calls`
- Or for production: `npx prisma db push` (if using Turso)

## December 10, 2025 - User Guide Creation

**Time:** Current session  
**Changes:**
- Created comprehensive `HOW_TO_INSTALL_AND_USE.md` guide in layman's terms for the team
- Guide covers:
  - Part 1: Developer setup (local installation, dependencies, database setup)
  - Part 2: End user guide (logging in, searching, making calls, editing, viewing history)
  - Part 3: Troubleshooting and common questions
  - Part 4: Admin management tasks (user creation, PIN reset, CSV import)
  - Part 5: Technical reference details
- Written in simple, non-technical language accessible to all team members
- Includes quick reference card for common tasks
- Explains user roles (Viewer, Producer, Admin) and their permissions
- Documents PWA installation process for iOS and Android
- Provides step-by-step instructions for all major features

**Decision:** Created a single comprehensive guide that serves both technical developers setting up the app and non-technical end users who need to use it daily. Used clear language, organized sections, and practical examples to make it accessible to everyone on the team. The guide serves as the primary reference document for installation and usage.

