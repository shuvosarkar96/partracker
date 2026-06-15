# ⏱ Partracker

A free, open-source part-time job hours tracker — built as a single HTML file you can host on GitHub Pages and install on your phone like a native app.

**No account needed. No server. Your data stays on your device.**

![Partracker](https://img.shields.io/badge/version-1.1.0-5b4fcf?style=flat-square) ![License](https://img.shields.io/badge/license-MIT-green?style=flat-square) ![PWA](https://img.shields.io/badge/PWA-installable-blue?style=flat-square)

---

## Features

- **Clock In / Clock Out** with manual date & time picker — enter shifts after the fact
- **Break tracking** — start/end breaks, deducted automatically from net hours
- **Overtime** — set a separate overtime hourly wage (or auto 1.5×), log OT hours per shift with quick buttons (30m / 1h / 1.5h / 2h / 3h)
- **Multiple workplaces** — separate records, wages, and history per workplace
- **Payment tracker** — mark individual days or entire months as paid/unpaid, see unpaid amounts at a glance
- **Monthly history** — navigate any past month, filter by months you actually worked
- **Earnings calculator** — automatic pay calculation (base + overtime) per session and per month
- **Google Drive backup** — one-tap backup/restore to your own Google Drive (requires free OAuth setup)
- **Export CSV** — download monthly data for Excel or Google Sheets
- **Installable PWA** — add to home screen on Android or iOS, works full-screen offline
- **100% free** — open source, MIT license, no ads, no tracking

---

## Live Demo / Hosting

### Option A — GitHub Pages (recommended)

1. Fork or clone this repository
2. Go to your repo → **Settings → Pages**
3. Under **Source**, select `main` branch and `/ (root)` folder
4. Click **Save** — your app will be live at:
   ```
   https://YOUR-USERNAME.github.io/partracker/
   ```
5. Open that URL on your phone → install it

### Option B — Use it directly

Download `partracker.html` and open it in any browser. All features work except:
- PWA install prompt (requires HTTPS)
- Google Drive backup (requires HTTPS + OAuth setup)

---

## Installing on Your Phone

### Android (Chrome)

1. Open your GitHub Pages URL in Chrome
2. A banner appears at the bottom — tap **Install**
3. Or tap the three-dot menu → **Add to Home Screen**
4. The app opens full-screen with no browser bar

### iOS (Safari)

1. Open your GitHub Pages URL in Safari
2. A banner appears after 2 seconds with instructions
3. Tap the **Share** button (box with arrow) → **Add to Home Screen**
4. Tap **Add** — the app opens full-screen

> **Note:** The install prompt only appears when the app is opened over HTTPS (GitHub Pages). Opening the HTML file directly (`file://`) will not show the install prompt.

---

## Google Drive Backup Setup

This is a one-time, 5-minute setup. After that, your data backs up automatically every time you clock out.

### Step 1 — Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click **Select a project** (top left) → **New Project**
3. Name it `Partracker` → click **Create**

### Step 2 — Enable Google Drive API

1. In the left menu go to **APIs & Services → Library**
2. Search for **Google Drive API**
3. Click it → click **Enable**

### Step 3 — Create OAuth Credentials

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → OAuth client ID**
3. If asked, configure the **OAuth consent screen** first:
   - User type: **External**
   - App name: `Partracker`
   - User support email: your email
   - Developer contact: your email
   - Click **Save and Continue** through all steps
   - Under **Test users** → add your own Gmail address
4. Back on Credentials → **+ Create Credentials → OAuth client ID**
5. Application type: **Web application**
6. Name: `Partracker`
7. Under **Authorized JavaScript origins**, add:
   ```
   https://YOUR-USERNAME.github.io
   ```
   If testing locally also add:
   ```
   http://localhost
   http://localhost:3000
   ```
8. Click **Create**
9. Copy the **Client ID** — it looks like:
   ```
   123456789-abcdefghijk.apps.googleusercontent.com
   ```

### Step 4 — Add Client ID to Partracker

1. Open Partracker → tap the **⚙ Settings** icon (top right)
2. Under **Google Drive Backup**, paste your Client ID
3. Tap **Save Client ID**
4. Tap **Sign in with Google** → authorize the app
5. Done — your data now backs up automatically after every clock-out

### How backup works

- Every clock-out triggers an auto-backup to a file called `partracker_backup.json` in your Google Drive
- You can also tap **Backup now** at any time from Settings
- To restore on a new device: sign in → tap **Restore**
- The backup file is in your own Drive — Partracker never has access to any other files

---

## How to Use

### Adding a Workplace

1. Tap **Places** in the bottom nav
2. Tap **+ Add Workplace**
3. Fill in your name, company name, hourly wage, and overtime wage
4. Leave overtime wage blank to auto-calculate at 1.5× basic wage
5. Tap **Save**

You can add as many workplaces as you want. Tap the active one to switch between them.

### Clocking In

1. Tap **Clock** in the nav
2. Tap **▶ Clock In**
3. A picker appears — date and time are pre-filled to now
4. Adjust if entering a past shift, add an optional note
5. Tap **Confirm Clock In**

### Clocking Out

1. Tap **■ Clock Out**
2. Set the end date and time
3. If you worked overtime, toggle **Include overtime hours**
   - Tap a quick button: **30m / 1h / 1.5h / 2h / 3h**
   - Or enter custom hours and minutes
4. Tap **Confirm Clock Out**
5. The session is saved with net hours, break time deducted, and earnings calculated

### Tracking Breaks

- While clocked in, tap **☕ Start Break**
- Tap **▶ End Break** when done
- Break time is automatically subtracted from your net hours

### Viewing History

1. Tap **History** in the nav
2. Use **◀ ▶** arrows to navigate months
3. Use the **month chips** (Jun 2025, Jul 2025…) to jump directly to any month you worked
4. Each session shows: date, day, clock-in/out, net hours, overtime tag, earnings, and paid status

### Marking Payment

**Per session (from History):**
- Tap the **Unpaid** badge on any session to toggle it to **Paid**

**Per day or whole month (from Payment tab):**
- Tap **Payment** in the nav
- See a summary of paid vs unpaid days and amounts
- Tap **✓ Mark all paid** to mark the whole month
- Or check individual day checkboxes

---

## Exporting Data

### CSV Export
- Go to **History** → tap **↓ Export CSV**
- Downloads a CSV file for the current month
- Columns: Date, Day, Clock In, Clock Out, Net Mins, OT Mins, Break Mins, Base Earnings, OT Earnings, Total Earnings, Paid, Note

### Payment CSV
- Go to **Payment** → tap **↓ Export**
- Downloads a day-by-day payment summary for the month

### JSON Backup
- Go to **Settings → ↓ Export JSON**
- Full backup of all workplaces, sessions, and payment status
- Use **↑ Import JSON** to restore on any device

---

## Data & Privacy

- All data is stored locally in your browser's `localStorage`
- Nothing is sent to any server (except your own Google Drive if you set it up)
- Google Drive backup creates one file: `partracker_backup.json` in your Drive root
- Partracker only requests `drive.file` scope — it can only see files it created, not your other Drive files
- Clearing browser data or switching browsers will lose local data — use Google Drive backup or JSON export to keep it safe

---

## File Structure

```
partracker/
├── partracker.html   ← The entire app (single file)
└── README.md         ← This file
```

Everything — HTML, CSS, JavaScript — is in one file. No build step, no dependencies, no npm.

---

## Browser Support

| Browser | Install | Drive Backup | Offline |
|---------|---------|--------------|---------|
| Chrome (Android) | ✅ Full PWA | ✅ | ✅ |
| Safari (iOS) | ✅ Add to Home Screen | ✅ | ✅ |
| Chrome (Desktop) | ✅ | ✅ | ✅ |
| Firefox | ⚠️ No install prompt | ✅ | ✅ |
| Samsung Internet | ✅ | ✅ | ✅ |

---

## Frequently Asked Questions

**Q: I opened the file on my phone but there's no install button.**
A: The install prompt only works over HTTPS. Host it on GitHub Pages and open that URL instead of the local file.

**Q: The Google sign-in popup is blocked.**
A: Allow popups for your GitHub Pages domain in your browser settings. On mobile, the sign-in opens in the same tab and redirects back automatically.

**Q: My data disappeared after clearing browser cache.**
A: Data is in localStorage which gets cleared with browser data. Set up Google Drive backup — it auto-saves after every clock-out.

**Q: Can I use this on multiple devices?**
A: Yes — set up Google Drive backup on each device. On a new device, sign in to Drive and tap Restore to get all your data.

**Q: The app is not full-screen on iOS.**
A: Make sure you added it via Safari (not Chrome on iOS) using Share → Add to Home Screen. Chrome on iOS cannot install PWAs.

**Q: I work at two places. How do I track both?**
A: Go to Places → add each workplace separately. Tap the active workplace chip to switch between them. History, earnings, and payment are all tracked independently.

**Q: Can multiple people use the same hosted app?**
A: Yes — each person's data is stored in their own browser's localStorage. The app is entirely client-side, so there's no shared database.

---

## License

MIT License — free to use, modify, and distribute. If you find it useful, a star on GitHub is appreciated ⭐

---

## Contributing

Pull requests are welcome. The entire app is in `partracker.html` — no build tools needed.

Ideas for future features:
- Weekly summary view
- Shift scheduling / upcoming shifts
- Multiple currency display
- Dark mode toggle
- Notifications for forgetting to clock out

---

*Built with ❤️ for part-time workers*
