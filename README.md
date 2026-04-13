# MediSure

**Tamper-Proof Medical Record Authentication on Web2 Infrastructure.**

🔗 Live Demo: https://medisure-certisure.vercel.app

Welcome to the official repository for **MediSure**, from the developer of **CertiSure** - Certificate Authentication System!

## 🏆 Awards & Recognition
**2nd Prize Winner - Bio-Medical Engineering (BME) Project Expo 2026 at VTMT** - Built solo by a 3rd-year ECE student, MediSure competed against a field of final-year BME hardware projects and secured a podium finish. 

**Judge's Feedback:** 
> *"You can work on the field of Cyber Security, there you'll gain experience and can make good impact in your own way..."* 
-> Embedded Systems Specialist Judge (Convinced by the core server-side hashing architecture in under 2 minutes).

## The Problem
Forged prescriptions, tampered lab reports, and falsified discharge summaries are a growing threat in healthcare. Manual verification is slow, error-prone, and easily exploited. Existing blockchain solutions are too heavy and too expensive for hospitals and clinics that just need a fast, reliable way to trust a document.

## Our Solution
MediSure brings the tamper-proof logic of Web3 to the lightning-fast infrastructure of Web2. Every medical record is fingerprinted with a SHA-256 cryptographic hash computed server-side. The server is always the single source of truth. Verification happens in milliseconds, not days.

## Core Features
- **Dual Record Modes:**
  - **Basic Mode** - Fill a structured form with patient and medical details. A unique QR code is generated and linked to the stored hash.
  - **Mint Mode** - Upload the exact physical file (PDF, JPG, PNG). The file itself is hashed byte-for-byte. Even a single pixel change will flag it as tampered.
- **Smart Verification Portal:** Verifiers can paste a hash, scan a QR with their camera, or upload a PDF/image containing the QR code. The app auto-extracts the embedded QR and checks it against the database instantly.
- **14-Field Medical Schema:** Covers patient info, blood group, existing conditions, record type (Lab Report, Prescription, Discharge Summary, Vaccination, Radiology), diagnosis, attending doctor, and issuance details.
- **Light / Dark Theme:** Clean, minimal SaaS UI with full theme switching.
- **PWA Ready:** Smooth React frontend that works anywhere, no app store needed.

## Tech Stack
- **Frontend:** React.js + Vite, CSS Variables, Lucide Icons (Deployed on Vercel)
- **Backend:** Node.js, Express.js (Deployed on Render)
- **Database:** MongoDB Atlas
- **Magic Ingredients:** `multer`, `sharp`, `pdfjs-dist`, `jsqr`, `html5-qrcode`, `qrcode`, native Node `crypto`

## Run it Locally

1. Clone this repository.
2. Install dependencies in both folders:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```
3. Create a `.env` file in the `server` folder:
   ```env
   MONGO_URI=your_atlas_connection_string_here
   PORT=3000
   ```
4. Create a `.env` file in the `client` folder:
   ```env
   VITE_BACKEND_URL=http://localhost:3000
   VITE_APP_URL=http://localhost:5173
   ```
5. Start both servers:
   ```bash
   # In /server
   npm start

   # In /client
   npm run dev
   ```
6. Open `http://localhost:5173` and start authenticating records!

## Roadmap
- 🚧 **Bulk Upload** *(Coming Soon)* - Batch issue and hash hundreds of medical records simultaneously with a single Excel/CSV upload.
- 🚧 **Institution Dashboard** *(Coming Soon)* - View, search, and manage all issued records from a single panel.

---
*Built with ❤️ and way too many late nights 🫠*
