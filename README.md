# TrustLens AI 🛡️
> Evidence-Based Scam & Digital Manipulation Analysis Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Firebase_Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

**TrustLens AI** is an objective, evidence-based scam and psychological manipulation analysis cockpit. Instead of simply labeling communications as "scam" or "safe", TrustLens dissects text across **six critical deception dimensions**, extracts observable textual evidence, highlights manipulative quotes, and produces an actionable, independent verification roadmap.

---

## ✨ Key Features

### 1. 🔍 Multi-Channel Communication Ingestion
- **Text & Email Analysis**: Paste suspicious text messages, recruitment emails, bank alerts, or payment demands.
- **Drag-and-Drop File Upload**: Direct upload for `.txt`, `.eml`, `.log`, and `.md` files.
- **Synthetic Benchmark Gallery**: 1-click realistic scenarios across *High*, *Moderate*, and *Low* risk tiers (Bank KYC suspension, Amazon remote job scam, fake parcel delivery, crypto romance fraud, and verified customer notices).

### 2. 📊 6-Dimensional Risk Evaluation
- **Urgency & Artificial Pressure**: Detects countdowns, panic-inducing threats, and immediate forfeit demands.
- **Unsolicited Payment Demands**: Identifies gift cards, wire transfers, crypto, CashApp, or Zelle requests.
- **Sensitive Credential Harvesting**: Flags requests for OTPs, 2FA codes, passwords, SSN, or KYC re-submissions.
- **Impersonation & Authority Mimicry**: Detects lookalike brands, executive spoofing, or fake badge claims.
- **Unrealistic Claims & Rewards**: Pinpoints lottery winnings, guaranteed trading returns, or excessive hourly wages.
- **Suspicious Links & Non-Standard Contacts**: Extracts and flags lookalike domains, shortened URLs, and mismatched domains.

### 3. 🛡️ Concrete Evidence & Verification Roadmap
- **Structured Scoring (0–100)**: Calibrated risk levels with transparent scoring logic.
- **Direct Quotes & Severity Tags**: Highlights exact words and phrases with corresponding manipulation mechanisms.
- **Interactive Verification Checklist**: Step-by-step independent actions with dynamic progress tracking and clipboard copy.
- **Clear Immediate Action Plan**: Direct guidance (e.g., *"Stop & Do Not Respond"*, *"Verify via Independent Number"*).

### 4. 🤖 Multi-Modal AI Assistance
- **In-Report "Ask TrustLens"**: Contextual Q&A to ask follow-up questions specific to the analyzed message.
- **Gemini Multi-Turn Advisor**: Dedicated AI chatbot with 3 specialized personas:
  - *Forensic Investigator*: Deep multi-factor deception & technical link analysis.
  - *Incident Recovery Guide*: Triage for unauthorized charges, account takeover, and reporting steps.
  - *Rapid Screener*: Low-latency instant red-flag checking for SMS and short messages.
- **Real-Time Live Voice Call (`gemini-3.8-live`)**: Hands-free, two-way audio triage using Google's Gemini Live API over WebSockets.

### 5. ☁️ Cloud Persistence & Offline Resilience
- **Google Sign-In & Firebase Firestore**: Real-time cloud sync across devices for authenticated users.
- **Anonymous Local Storage**: Full offline functionality with browser-local history.
- **Zero-Failure Fallback Engine**: If upstream AI services encounter high demand, the built-in heuristic pattern engine instantly generates a full risk assessment.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React icons.
- **Backend**: Express running with Vite middlewares in development, standalone Node server in production.
- **AI Engine**: `@google/genai` TypeScript SDK:
  - Text & Chat: `gemini-3.8-flash`, `gemini-3.1-pro-preview`, `gemini-3.1-flash-lite`
  - Voice Call: `gemini-3.8-live` via WebSocket streaming
- **Authentication & Database**: Firebase Authentication (Google Auth) & Cloud Firestore.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 20 or higher recommended)
- [npm](https://www.npmjs.com/)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)
- *(Optional)* A [Firebase Project](https://console.firebase.google.com/) for cloud persistence

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/trustlens-ai.git
cd trustlens-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory (based on `.env.example`):
```bash
cp .env.example .env
```
Fill in your API keys:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
APP_URL="http://localhost:3000"
```

### 4. Start the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production
```bash
npm run build
npm start
```

---

## 📂 Project Structure

```
├── dist/                     # Production build artifacts
├── src/
│   ├── components/           # UI Components
│   │   ├── AnalysisForm.tsx     # Message input, category selection & sample gallery
│   │   ├── ReportView.tsx       # Comprehensive risk report, indicators & checklist
│   │   ├── Header.tsx           # Navigation bar & authentication status
│   │   ├── HistoryModal.tsx     # Saved assessments & filtering
│   │   ├── GeminiChatModal.tsx  # Multi-turn chatbot with persona switching
│   │   ├── LiveVoiceModal.tsx   # Real-time WebSocket audio triage
│   │   └── MethodologyModal.tsx # Evaluation framework documentation
│   ├── context/
│   │   └── AuthContext.tsx      # Firebase auth provider & state management
│   ├── data/
│   │   └── sampleScenarios.ts   # Synthetic benchmark test suite
│   ├── firebase/
│   │   └── config.ts            # Firebase initialization & Firestore helpers
│   ├── services/
│   │   └── analysisService.ts   # API client for analysis & report handling
│   ├── utils/
│   │   └── signalDetector.ts    # Heuristic detection engine & regex parsers
│   ├── types.ts                 # TypeScript type definitions
│   ├── App.tsx                  # Root application layout & state
│   ├── main.tsx                 # Client entry point
│   └── index.css                # Tailwind CSS v4 styling rules
├── firestore.rules           # Security rules for Cloud Firestore
├── server.ts                 # Express full-stack server & Gemini Live WS proxy
├── package.json
└── vite.config.ts
```

---

## 🔒 Security & Privacy

- **No Link Crawling**: TrustLens never visits, pings, or executes scripts from untrusted URLs submitted by users.
- **Server-Side API Keys**: Gemini API keys are kept strictly on the server and are never exposed to client browsers.
- **Zero Telemetry**: Submitted messages are analyzed in memory and stored only on your local device or your authenticated private Firestore database.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
