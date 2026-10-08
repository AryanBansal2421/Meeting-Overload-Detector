# Meeting Overload Detector 📅

A full-stack calendar analytics tool that connects to your Google Calendar, detects meeting overload using interval scheduling algorithms, and suggests optimal reschedule slots.

## 🧠 DSA Core
- **Greedy Interval Scheduling** — finds maximum non-overlapping focus blocks from calendar events
- **Min-Heap Priority Queue** — ranks and surfaces top reschedule slots by window size
- **Weighted Interval Scheduling** — detects fragmented focus time across the work day

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React, TypeScript, Tailwind CSS, Vite |
| Backend | Node.js, Express, TypeScript |
| Auth | Google OAuth 2.0 |
| API | Google Calendar API v3 |
| Deploy | Vercel (frontend) · Render (backend) |

## ✨ Features
- 🔐 Google OAuth 2.0 — secure, read-only calendar access
- 📊 Meeting vs focus time ratio with configurable overload threshold
- 🔴 Back-to-back meeting detection (gap < 5 min)
- 🟩 Greedy algorithm finds best focus windows
- 🟡 Auto-suggests top 5 reschedule slots via priority queue
- 🌡️ Hourly meeting density heatmap (9AM–6PM)

## 📁 Project Structure

```
meeting-overload-detector/
├── backend/
│   ├── src/
│   │   ├── index.ts                   # Express server
│   │   ├── googleClient.ts            # OAuth2 client setup
│   │   ├── routes/
│   │   │   ├── auth.ts                # Google OAuth routes
│   │   │   └── calendar.ts            # Calendar analyze route
│   │   └── services/
│   │       └── intervalScheduler.ts   # Core DSA logic
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── types.ts
    │   ├── utils.ts
    │   └── pages/
    │       ├── LoginPage.tsx
    │       └── DashboardPage.tsx
    └── package.json
```

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- Google Cloud Console project with Calendar API enabled
- OAuth 2.0 credentials (Web application type)

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=3001
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/callback
MEETING_RATIO_THRESHOLD=0.4
```

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

## 🔑 Google Cloud Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create project → Enable **Google Calendar API**
3. Create **OAuth 2.0 Client ID** (Web application type)
4. Add Authorized Redirect URI: `http://localhost:3001/auth/callback`
5. Copy Client ID and Secret to `.env`

## 📊 How It Works

```
User connects Google Calendar
        ↓
Backend fetches events via Calendar API v3
        ↓
Greedy algorithm finds focus blocks (gaps ≥ 25 min)
        ↓
Min-heap ranks free windows by duration
        ↓
Meeting ratio calculated → overload flagged if ratio ≥ threshold
        ↓
Dashboard shows heatmap + focus blocks + reschedule suggestions
```

## 👨‍💻 Author

**Aryan Bansal** — B.Tech ICE, NSUT Delhi  
GitHub: [@AryanBansal2421](https://github.com/AryanBansal2421)
