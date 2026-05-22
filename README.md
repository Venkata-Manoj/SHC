# SIMATS Hackathon Discovery Platform

A university hackathon discovery platform built with the MERN stack (MongoDB, Express, React, Node.js) + React Native for mobile.

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

## Project Structure

```
simats-hackathon/
├── backend/          # Express API (port 5000)
├── web/              # React PWA (port 5173)
├── mobile/           # React Native app
└── docker-compose.yml
```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@saveetha.ac.in | admin123 |
| Coordinator | coordinator1@saveetha.ac.in | coord123 |
| Student | student1@saveetha.ac.in | student123 |
