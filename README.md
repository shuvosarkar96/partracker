# ⏱️ Partracker

A lightweight, minimalist, and secure Progressive Web App (PWA) designed for part-time workers to track shift hours, breaks, and estimated earnings in real time. 

Everything runs in a single file, stores data locally on your device, and offers an optional automated sync directly to your personal Google Sheets.

---

## ✨ Features

* **Real-Time Tracking:** Simple One-Tap Clock In, Clock Out, and Break tracking.
* **Live Elapsed Timer:** Displays your net working hours dynamically (excluding break periods).
* **Multi-Workplace Support:** Add and manage multiple jobs with custom hourly wages and currencies (₩, $, ৳, €, ¥).
* **Monthly Insights:** Visual statistics showing total hours worked, unique days, total sessions, and estimated payouts.
* **Google Sheets Sync:** Optional automated backing up of shifts using a lightweight Google Apps Script.
* **Data Portability:** Export your history to CSV at any time, or back up/restore your complete configuration via JSON.
* **100% Private:** No third-party servers. Your data stays entirely in your browser's local storage.

---

## 🚀 Quick Start (GitHub Pages Deployment)

Because Partracker is a PWA, it requires a secure context (`https://`) to enable mobile home-screen installation. The easiest way to host it is via **GitHub Pages**:

1. Fork or download this repository.
2. Ensure your main file is named exactly `index.html`.
3. Upload it to a **Public** GitHub repository.
4. Go to your repository **Settings** ➔ **Pages**.
5. Under **Build and deployment**, set the branch to `main` (or `master`) and click **Save**.
6. Open the provided `https://...` link on your mobile browser (e.g., Chrome or Safari) and select **Add to Home Screen** or click the native **Install** banner.

---

## 📊 Setting Up Google Sheets Auto-Sync

You can automatically log every completed shift to a Google Spreadsheet.

### 1. Spreadsheet Setup
1. Create a new, blank **Google Sheet**.
2. From the top menu, go to **Extensions** ➔ **Apps Script**.
3. Delete any default code in the editor and paste the Apps Script snippet found inside the **Settings** tab of the Partracker app.
4. Click the 💾 **Save** icon.

### 2. Deploying the Script
1. Click the **Deploy** button in the top right corner and choose **New deployment**.
2. Click the gear icon next to "Select type" and select **Web app**.
3. Configure the following fields:
   * **Execute as:** `Me (your-email@gmail.com)`
   * **Who has access:** `Anyone` *(Crucial for the web app to receive your clock-out data)*
4. Click **Deploy** and authorize the necessary permissions.
5. Copy the generated **Web App URL**.

### 3. Connect the App
1. Open Partracker, navigate to the **Settings** tab.
2. Paste your copied Web App URL into the **Apps Script Web App URL** input field.
3. Tap **Connect**. Your next clock-outs will now sync instantly!

---

## 🛠️ Tech Stack

* **Frontend:** Semantic HTML5, Minimalist CSS3 Custom Properties (Variables)
* **Logic:** Vanilla JavaScript (ES6)
* **Storage:** Web Storage API (`localStorage`)
* **PWA Wrapper:** Inline Data-URI Manifest generation & dynamic Service Worker caching for offline usage.
* **Backend Sync:** Google Apps Script (JSON POST Endpoint)
