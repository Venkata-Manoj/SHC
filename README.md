# SIMATS Hackathon Discovery Platform (SHC)

A university hackathon discovery platform — browse, bookmark, and participate in hackathons across SIMATS colleges. Built with the **MERN stack** (MongoDB, Express, React, Node.js) + **React Native** for mobile.

## Quick Start

```bash
docker-compose up -d          # Start MongoDB + Redis
cd backend && npm install
cp .env.example .env
npm run seed                  # Seed demo data
npm run dev                   # Backend on :5000

# In another terminal:
cd web && npm install
npm run dev                   # Frontend on :5173
```

## Architecture

| Layer | Stack | Directory |
|-------|-------|-----------|
| Database | MongoDB (Mongoose) + Redis | `docker-compose.yml` |
| Backend API | Express + JWT auth + rate limiting | `backend/` |
| Web Frontend | React (Vite) + Tailwind CSS + PWA | `web/` |
| Mobile App | React Native (Expo) | `mobile/` |

## Features

- **Guest browsing** — No login required to discover events
- **Role-based access** — ADMIN, COORDINATOR, STUDENT with JWT auth
- **Bookmarks** — Client-side via localStorage/AsyncStorage, shareable links
- **Submissions** — Crowd-sourced hackathon submission queue with moderation
- **Analytics** — View/click tracking with CSV & PDF export
- **Recycle bin** — Soft-delete with restore/permanent delete
- **Feature requests** — Community voting board
- **Calendar view** — Month navigation with keyboard a11y
- **Infinite scroll** — IntersectionObserver-based pagination
- **PWA** — Offline service worker, install prompt, icons
- **Dark theme** — Glassmorphism UI with `#080808` background

## CI/CD

- **Lighthouse CI** — Runs on every push/PR to `main` (`.github/workflows/lighthouse.yml`)
  - Tests `/` and `/events` routes
  - Asserts performance ≥0.8, accessibility ≥0.9, best-practices ≥0.9, SEO ≥0.9
  - Mock API server provides empty responses during CI to avoid backend dependency

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@saveetha.ac.in | admin123 |
| Coordinator | coordinator1@saveetha.ac.in | coord123 |
| Student | student1@saveetha.ac.in | student123 |

## Tech Stack

**Backend:** Express, Mongoose, JWT (jsonwebtoken), bcrypt, multer, node-cron, pdfkit, bad-words  
**Web:** React 18, React Router 6, Vite, Tailwind CSS, recharts, lucide-react, react-hot-toast, vite-plugin-pwa  
**Mobile:** React Native, AsyncStorage, axios, gesture-handler  
**Infra:** Docker Compose (MongoDB 7 + Redis 7), GitHub Actions

## Project Structure

```
simats-hackathon/
├── backend/src/
│   ├── config/db.js           # MongoDB connection
│   ├── middleware/             # auth, upload, rateLimiter, validate
│   ├── models/                # User, Hackathon, Submission, AnalyticsEvent, Feedback, Invite
│   ├── routes/                # auth, hackathons, submissions, analytics, upload
│   ├── controllers/           # Route handlers
│   ├── services/              # linkChecker (cron), cache
│   └── seed/index.js          # Demo data seeder
├── web/src/
│   ├── pages/                 # Home, EventList, EventDetail, Login, Register, Admin, Coordinator
│   ├── components/            # Navbar, EventCard, Filters, CalendarView, ShareButtons, etc.
│   ├── context/AuthContext.jsx
│   └── services/api.js        # Axios with 401 interceptor
├── mobile/src/screens/        # EventList, EventDetail, Bookmarks, Login, Admin, Coordinator
└── .github/workflows/         # Lighthouse CI + mock-server.js
```
