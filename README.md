# ⏱ Partracker

> **v2.0.0** — Complete rebuild as a React PWA with Firebase backend and Android APK support.
> Looking for the original single-file version? See the [`v1.x` branch](../../tree/v1).

A free, open-source part-time job hours tracker. Track multiple workplaces, overtime, breaks, and payments — with automatic cloud sync across all your devices.

![Version](https://img.shields.io/badge/version-2.0.0-6750A4?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28?style=flat-square&logo=firebase)

---

## What's new in v2.0

| Feature | v1 (HTML) | v2 (React) |
|---|---|---|
| Stack | Single HTML file | React + Vite |
| Auth | None | Google / Email / Guest |
| Backup | Google Drive (manual setup) | Firebase (automatic) |
| Multi-device sync | Manual | Real-time |
| Android APK | No | Yes (Capacitor) |
| Overtime | Basic | Full-day holiday rate + quick buttons |
| Entries | Add only | Add + Edit + Delete |
| Default break | No | Per-workplace setting |

---

## Features

- **Clock In / Clock Out** with separate time and date pickers — enter past or future shifts
- **Break tracking** — set a default break per workplace, auto-applied to every entry
- **Overtime** — quick buttons (30m / 1h / 1.5h / 2h / 3h), custom input, or full-day holiday rate
- **Multiple workplaces** — separate history, wages, and payment tracking per workplace
- **Payment tracker** — mark individual days or whole months as paid/unpaid
- **Earnings calculator** — base pay + overtime pay calculated automatically
- **Editable entries** — edit or delete any session at any time
- **Google / Email / Guest login** — no account required to try
- **Real-time cloud sync** — data syncs instantly across all devices via Firebase
- **Installable PWA** — works on browser, installable on Android and iOS
- **Android APK** — build a real native APK via Capacitor

---

## Tech stack

- **React 18** + Vite
- **Material UI (MUI) v5** — Material Design 3
- **Firebase** — Authentication + Firestore database
- **Capacitor v6** — Android APK build

---

## Getting started

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Clone the repo

```bash
git clone https://github.com/shuvosarkar96/partracker.git
cd partracker
npm install
```

### 2. Firebase setup (required)

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a project → Add a **Web app**
3. Copy the config into `src/firebase.js`
4. **Authentication** → Sign-in method → Enable:
   - Google
   - Email/Password
   - Anonymous (for guest mode)
5. **Firestore Database** → Create database → Start in **test mode**
6. After testing, update Firestore rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 4. Build for web / GitHub Pages

```bash
npm run build
# deploy the /dist folder
```

---

## Building the Android APK

### Prerequisites
- [Android Studio](https://developer.android.com/studio) installed
- JDK 17 (Android Studio includes it)

### Steps

```bash
# 1. Build the web app
npm run build

# 2. Add Android platform (first time only)
npm install @capacitor/cli @capacitor/core @capacitor/android
npx cap add android

# 3. Sync web build into Android project
npx cap sync

# 4. Open Android Studio
export CAPACITOR_ANDROID_STUDIO_PATH=/snap/bin/android-studio  # Linux snap
npx cap open android
```

In Android Studio:
- Wait for Gradle sync
- **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- Find APK at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Re-building after changes

```bash
npm run build && npx cap sync
# Then rebuild in Android Studio
```

---

## Project structure

```
partracker/
├── src/
│   ├── components/
│   │   ├── SessionDialog.jsx    # Add/edit session with time picker, OT, break
│   │   └── WorkplaceDialog.jsx  # Add/edit workplace with wages and default break
│   ├── hooks/
│   │   └── useData.js           # Firestore real-time hooks
│   ├── pages/
│   │   ├── LoginPage.jsx        # Google, email, guest sign-in
│   │   ├── ClockPage.jsx        # Dashboard + stats
│   │   ├── HistoryPage.jsx      # Month view, edit/delete sessions
│   │   ├── PaymentPage.jsx      # Paid/unpaid tracking
│   │   ├── WorkplacesPage.jsx   # Manage workplaces
│   │   └── SettingsPage.jsx     # Profile, account, sign out
│   ├── theme/
│   │   └── index.js             # MUI Material 3 theme
│   ├── utils/
│   │   └── index.js             # Time, money, formatting helpers
│   ├── firebase.js              # Firebase config
│   ├── App.jsx                  # Router + auth wrapper
│   └── main.jsx                 # Entry point
├── public/
│   └── favicon.svg              # App icon
├── index.html
├── vite.config.js
├── capacitor.config.json
└── package.json
```

---

## Versioning

| Version | Description |
|---|---|
| 1.0.0 | Single HTML file PWA |
| 1.1.0 | Added overtime, payment tracking, Drive backup |
| 2.0.0 | Full React rebuild, Firebase, APK support |

---

## License

MIT — free to use, fork, and modify.

---

*Built for part-time workers 🇰🇷*
