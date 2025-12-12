# IE Call List - How to Install and Use Guide

**For the Inside Edition Team**

This guide explains how to set up and use the IE Call List app. It's written in simple terms so anyone on the team can understand it.

---

## What Is This App?

The IE Call List is a mobile-friendly web app that helps Inside Edition producers quickly find and call TV station contacts. Instead of searching through spreadsheets or paper lists, you can:

- Search for any TV station by name, call letters, or market number
- Tap a phone number to call instantly
- See which stations are on which feeds (3PM, 5PM, 6PM)
- Track all calls made for record-keeping
- Update station information when numbers change

**Think of it like a digital phone book that's always up to date and works on your phone.**

---

## Part 1: For Developers - Setting Up the App Locally

If you're a developer who needs to work on the app or test it on your computer, follow these steps.

### What You Need First

1. **Node.js** (version 18 or newer)
   - Download from: https://nodejs.org/
   - This lets you run the app on your computer
   - After installing, open a terminal/command prompt and type `node --version` to verify it worked

2. **A code editor** (optional, but helpful)
   - Visual Studio Code is recommended: https://code.visualstudio.com/

### Step 1: Get the Code

If you have access to the code repository:

1. Open a terminal/command prompt
2. Navigate to where you want the project (like `Documents` or `Desktop`)
3. Clone or download the repository
4. Navigate into the project folder:
   ```bash
   cd ie-calllist
   ```

### Step 2: Install Dependencies

The app uses several tools and libraries. Install them all at once:

```bash
npm install
```

**What this does:** Downloads all the code libraries the app needs to run. This might take a few minutes the first time.

### Step 3: Set Up the Database

The app needs a database to store station information. For local development, we use a simple file-based database.

1. Create a file called `.env.local` in the `ie-calllist` folder
2. Add these lines to the file:
   ```
   DATABASE_URL="file:./prisma/dev.db"
   SESSION_SECRET="your-random-32-character-secret-here"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```
   
   **Note:** For `SESSION_SECRET`, you can generate one by running:
   ```bash
   npx tsx scripts/generate-session-secret.ts
   ```
   Copy the output and paste it into your `.env.local` file.

3. Set up the database structure:
   ```bash
   npx prisma db push
   ```

4. Add some test data:
   ```bash
   npm run db:seed
   ```

**What this does:** Creates the database tables and adds sample stations and test users so you can try the app.

### Step 4: Start the App

Run this command:

```bash
npm run dev
```

**What this does:** Starts a local web server on your computer. You should see a message like "Ready on http://localhost:3000"

### Step 5: Open the App

1. Open your web browser (Chrome, Firefox, Safari, or Edge)
2. Go to: `http://localhost:3000`
3. You should see the login screen

### Step 6: Log In

Use these test PINs (created by the seed script):

- **Admin PIN:** `123456`
- **Producer PIN:** `111111`

**Important:** These are only for testing! Change them before using the app for real work.

---

## Part 2: For End Users - How to Use the App

This section is for producers and admins who will use the app day-to-day.

### Getting Started

#### Option A: Using the Web App (Any Device)

1. Open your web browser (Safari on iPhone, Chrome on Android, any browser on computer)
2. Go to the app URL (your team will provide this)
3. Enter your 6-digit PIN when prompted
4. You're in!

#### Option B: Installing as an App (Recommended for Mobile)

**On iPhone (Safari):**
1. Open the app URL in Safari
2. Tap the Share button (square with arrow pointing up)
3. Scroll down and tap "Add to Home Screen"
4. Name it "IE Call List" and tap "Add"
5. Now you have an app icon on your home screen!

**On Android (Chrome):**
1. Open the app URL in Chrome
2. Tap the three-dot menu (⋮)
3. Tap "Install app" or "Add to Home Screen"
4. Confirm installation
5. The app icon appears on your home screen!

**Why install it?** It works faster, feels more like a real app, and you can access it with one tap.

### Logging In

1. Open the app
2. You'll see a screen asking for your PIN
3. Enter your 6-digit PIN (your admin will give you this)
4. Tap "Login" or press Enter
5. If your PIN is correct, you'll see the station directory

**Forgot your PIN?** Contact joe.balewski@cbs.com to reset it.

### Finding a Station

The main screen shows all TV stations. You can find what you need in three ways:

#### Method 1: Search Bar

1. Tap the search box at the top
2. Type anything related to the station:
   - Market name (like "Chicago" or "New York")
   - Call letters (like "WLS" or "WCBS")
   - Market number (like "3" or "47")
3. Results appear instantly as you type
4. Tap the station you want

**Tip:** The search is "fuzzy" - it finds matches even if you make a typo!

#### Method 2: Feed Filter

1. See the buttons at the top: **All** | **3pm** | **5pm** | **6pm**
2. Tap a feed time to see only stations on that feed
3. Tap **All** to see everything again

**What are feeds?** These are the satellite feed times when Inside Edition sends content to stations.

#### Method 3: Scroll Through

Just scroll down to browse all stations. They're organized by market number.

### Making a Call

1. Find the station you want to call (using search, filter, or scrolling)
2. Tap anywhere on the station card
3. A confirmation screen appears showing:
   - Station name and location
   - Phone number and contact name
4. Tap **"Call Now"** to open your phone dialer
5. Your phone's dialer opens with the number ready
6. Tap the call button on your phone to connect

**What gets logged:** Every time you tap "Call Now," the app records:
- Which station you called
- What phone number
- What time you called
- Your name (from your PIN)

This creates an audit trail for record-keeping.

### Viewing Station Details

1. Find a station in the list
2. Tap the arrow (►) on the right side of the card
3. You'll see:
   - Full station information
   - All phone numbers (up to 4 contacts)
   - Feed time and status
   - Air times (local and Eastern)
4. Tap any phone number to call it
5. Tap **"Edit"** (if you're an admin) to change information

### Editing Station Information (Admins Only)

If you have admin access, you can update station details:

1. Go to a station's detail page (tap the arrow)
2. Tap the **"Edit"** button at the top
3. Change any of these fields:
   - Call letters
   - Market name
   - Feed assignment (3pm, 5pm, or 6pm)
   - Broadcast status (Live, Rerack, Might, or None)
   - Air times
   - Phone numbers (add, edit, delete, or reorder)
4. Tap **"Save"** when done

**Important:** All changes are logged with your name and timestamp for accountability.

### Viewing Call History

1. Tap the clock icon (🕐) in the bottom navigation
2. You'll see a list of all calls you've made
3. Calls are grouped by date (Today, Yesterday, etc.)
4. Each entry shows:
   - Station name
   - Phone number called
   - Contact name
   - Time of call

**Note:** You only see your own calls. Admins can see all calls.

### Viewing Edit History

1. Go to Settings (gear icon ⚙️ in bottom navigation)
2. Tap **"View Edit History"**
3. See all changes made to station data:
   - What field changed
   - Old value → New value
   - Who made the change
   - When it was changed

This helps track who updated what and when.

### Admin Panel (Admins Only)

If you're an admin, you have access to a special web interface for managing data:

1. Go to `/admin` in your browser (add this to the end of your app URL)
2. Log in with your admin PIN
3. You'll see a table of all stations
4. You can:
   - Click any cell to edit it directly
   - Select multiple stations for bulk changes
   - Import a CSV file to update many stations at once
   - Manage users (create PINs, reset passwords, set roles)

**User Management:**
- Go to `/admin/users` to:
  - Add new users with PINs
  - Edit existing users
  - Change user roles (Viewer, Producer, or Admin)
  - Delete users

**CSV Import:**
- Go to `/admin/import` to:
  - Upload a CSV file with station data
  - Preview changes before applying
  - Import all updates at once

### Settings

Tap the gear icon (⚙️) in the bottom navigation to access:

- **Account:** See your name and role
- **View Edit History:** See all data changes
- **Report Issue:** Opens email to report problems
- **Sign Out:** Log out and return to PIN screen

### User Roles Explained

The app has three permission levels:

1. **Viewer** (Read Only)
   - Can search and view stations
   - Cannot make calls
   - Cannot edit anything
   - Good for people who just need to look up information

2. **Producer** (Read & Write)
   - Can search and view stations
   - Can make calls (calls are logged)
   - Cannot edit station data
   - Cannot access admin panel
   - This is the standard role for most users

3. **Admin** (Full Access)
   - Can do everything Producers can do
   - Can edit station information
   - Can access admin panel
   - Can manage users (create PINs, reset passwords)
   - Can import CSV files
   - Can view all call and edit logs

---

## Part 3: Common Questions and Troubleshooting

### "I can't log in"

- **Check your PIN:** Make sure you're entering all 6 digits correctly
- **Contact your admin:** They can reset your PIN if needed
- **Check your internet:** The app needs an internet connection to log in

### "The app is slow"

- **Check your internet connection:** Slow internet = slow app
- **Close other apps:** Free up memory on your device
- **Try refreshing:** Pull down to refresh the page

### "I can't find a station"

- **Try different search terms:** Search by city name, call letters, or market number
- **Check the feed filter:** Make sure you haven't filtered to a specific feed
- **Clear your search:** Tap the X in the search box to clear it

### "My calls aren't being logged"

- **Make sure you tap "Call Now":** The call is only logged when you confirm in the app
- **Check your internet:** Logging requires an internet connection
- **Contact support:** If it keeps happening, report the issue

### "I can't edit stations"

- **Check your role:** Only Admins can edit stations. Producers can only view and call
- **Contact your admin:** They can change your role if needed

### "The app won't install on my phone"

- **Make sure you're using the right browser:**
  - iPhone: Use Safari (not Chrome)
  - Android: Use Chrome
- **Check your internet:** You need internet to install
- **Try again later:** Sometimes it takes a moment

### "I'm seeing an error message"

- **Note the exact error:** Write down what it says
- **Try refreshing:** Pull down to refresh
- **Report it:** Use the "Report Issue" button in Settings to email support

---

## Part 4: For Admins - Managing the App

### Creating New Users

1. Log in as an admin
2. Go to `/admin/users`
3. Tap **"Add User"**
4. Fill in:
   - **Name:** The person's display name
   - **PIN:** A 6-digit PIN (they'll use this to log in)
   - **Role:** Choose Viewer, Producer, or Admin
5. Tap **"Save"**
6. Give the user their PIN securely (in person or secure message)

### Resetting a PIN

1. Go to `/admin/users`
2. Find the user in the list
3. Tap **"Edit"**
4. Enter a new 6-digit PIN
5. Tap **"Save"**
6. Tell the user their new PIN

### Changing a User's Role

1. Go to `/admin/users`
2. Find the user
3. Tap **"Edit"**
4. Change the **Role** dropdown
5. Tap **"Save"**

### Importing Station Data from CSV

1. Prepare your CSV file with this format:
   ```
   Feed,Status,Rank,Station,City,Air Time,ET Time,Main Name,Main Phone,#2 Name,Phone #2,#3 Name,Phone #3,#4 Name,Phone #4
   6:00 PM,LIVE,1,WCBS-TV,"NEW YORK",5:00 PM,5:00 PM,Control Room,212-555-1234,News Desk,212-555-5678,,,
   ```

2. Go to `/admin/import`
3. Tap **"Choose File"** and select your CSV
4. Tap **"Upload"**
5. Review the preview of changes
6. Tap **"Confirm Import"** to apply changes

**Important:** The import will update existing stations and add new ones. It won't delete stations that aren't in the CSV.

### Viewing All Activity

- **All Calls:** Go to `/logs/calls` (as admin, you see everyone's calls)
- **All Edits:** Go to `/logs/edits` to see all data changes
- **User Activity:** Check individual user records in `/admin/users`

---

## Part 5: Technical Details (For Reference)

### What Technologies Does This Use?

- **Next.js:** The web framework (makes the app fast and works offline)
- **Turso:** The database (stores all station and user data)
- **Vercel:** Where the app is hosted (makes it accessible on the internet)
- **Prisma:** Database tool (helps manage the data)

### Where Is the Data Stored?

- **Production:** Data is stored in Turso (a cloud database)
- **Local Development:** Data is stored in a file called `dev.db` in the `prisma` folder

### How Does Authentication Work?

- Users log in with a 6-digit PIN
- The PIN is hashed (encrypted) before being stored
- When you log in, the app checks your PIN against the stored hash
- If it matches, you get a session cookie that lasts 7 days
- The cookie tells the app who you are for all your actions

### How Are Calls Logged?

- When you tap "Call Now," the app immediately records:
  - Your user ID (from your session)
  - The station ID
  - The phone number
  - The current timestamp
- This happens before your phone dialer opens
- The log is stored in the database for record-keeping

---

## Getting Help

If you need help:

1. **Check this guide first:** Most questions are answered here
2. **Report an issue:** Use the "Report Issue" button in Settings
3. **Contact your admin:** They can help with PINs, roles, and data updates
4. **Check the documentation:** See `MD_DOCS/` folder for technical details

---

## Quick Reference Card

### For Producers:
- **Login:** Enter your 6-digit PIN
- **Find Station:** Use search bar or scroll
- **Make Call:** Tap station → Tap "Call Now"
- **View History:** Tap clock icon (🕐)

### For Admins:
- **Everything Producers can do, plus:**
- **Edit Station:** Station detail → Edit button
- **Admin Panel:** Go to `/admin`
- **Manage Users:** `/admin/users`
- **Import CSV:** `/admin/import`

### Default Test PINs (Change These!):
- Admin: `123456`
- Producer: `111111`

---

**Last Updated:** December 2024  
**Version:** 2.0

