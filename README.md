# AEON
[![Frontend CI](https://img.shields.io/github/actions/workflow/status/OWNER/REPO/frontend.yml?branch=main&label=frontend%20CI&style=flat-square)](https://github.com/OWNER/REPO/actions)
[![Backend CI](https://img.shields.io/github/actions/workflow/status/OWNER/REPO/backend.yml?branch=main&label=backend%20CI&style=flat-square)](https://github.com/OWNER/REPO/actions)
[![Node](https://img.shields.io/badge/node-18+-green?style=flat-square&logo=node.js)](#)
[![Python](https://img.shields.io/badge/python-3.11+-blue?style=flat-square&logo=python)](#)
[![License](https://img.shields.io/badge/license-Proprietary-orange?style=flat-square)](#)

AEON turns your life into a living, breathing 3D world. Instead of filling spreadsheets or long journals, you live your life — AEON maps habits, moods, breakthroughs, and relationships into a landscape you can see, explore, and feel.

## Table of Contents
- What AEON Shows
- Tech Stack
- Quick Start
- Environment
- Pages
- Design System
- Core Concepts Mapped to Data
- API Overview
- Common Tasks
- Development Tips
- Troubleshooting
- Screenshots
- CI Setup
- Deployment
- Contributing
- License

## What AEON Shows

- World: A unique 3D landscape for every person. No two are the same.
- Garden (Habits): Plants thrive when you’re consistent and wilt when ignored.
- Terrain (Emotions): Mountains for breakthroughs, valleys for hard periods, plains for calm.
- Weather (Mood): Daily skies reflect focus, anxiety, low energy, or genuine happiness.
- Sky (Dreams): Long-term goals become stars and constellations as you achieve them.
- Structures (Relationships): Houses, bridges, lighthouses mirror relationship health and milestones.

## Tech Stack

- Frontend: React + Vite + Material UI + Tailwind (utilities) + Three.js
- Backend: Django + Django REST Framework (DRF)
- Auth: Token-based auth (simple username/password)

## Quick Start

### 1) Backend

- Requirements: Python 3.11+
- Start dev server:

```bash
cd AEON
backend\.venv\Scripts\python backend\manage.py runserver 0.0.0.0:8000
```

The API will be available at http://localhost:8000/api

### 2) Frontend

- Requirements: Node.js 18+
- Install and run:

```bash
cd AEON\frontend
npm install
npm run dev
```

The app opens at http://localhost:5173

### 3) Environment

- Frontend uses `VITE_API_BASE` (optional). Defaults to `http://localhost:8000/api`.
- To point to another API:

```bash
echo VITE_API_BASE=http://your-api-host/api > .env
```

## Pages

- World
  - Controls: Seed, Forest cap, Auto LOD, Garden (consistency/neglect), Terrain (breakthroughs/stress), Weather quick set.
  - 3D canvas adapts in real time.
- Engine
  - Add entries with mood; see recent list and pattern snapshot.
- Human
  - Global Dilemma voting, daily mission completion, FrequencyMatch summary.
- Urgency
  - Days remaining snapshot, wish tracking with postpone, SlowPost (letters scheduled for future).
- Vault
  - Snapshot of your “vault”, grants scheduled by date.
- Auth
  - Login/Signup with token storage.

## Design System

- Theme
  - Light/dark toggle in AppBar.
  - Subtle hover and focus animations for buttons, chips, and papers.
- Icons and Tooltips
  - Icons guide understanding; tooltips explain controls.
- Brand Tokens
  - AEON reads brand overrides from `localStorage` key `aeon-brand`.
  - Example:

```json
{
  "primary": "#1D4ED8",
  "secondary": "#10B981",
  "error": "#DC2626",
  "warning": "#F59E0B",
  "success": "#22C55E",
  "info": "#0EA5E9",
  "backgroundLight": "#F7FAFC",
  "backgroundDark": "#0B0F14",
  "surfaceLight": "#FFFFFF",
  "surfaceDark": "#10141A",
  "headingFont": "Poppins, Inter, Roboto, Arial, sans-serif",
  "bodyFont": "Inter, Roboto, Arial, sans-serif",
  "weightBold": 700,
  "weightSemi": 600,
  "weightMedium": 500,
  "letterSpacing": 0.3,
  "radius": 14
}
```

## Core Concepts Mapped to Data

- habit_consistency: Lushness and color vibrancy.
- neglect: Dryness and desaturation.
- stress_level: Terrain jaggedness and weather mood.
- breakthroughs: Mountain amplitude.
- terrain_seed: Deterministic world generation.

## API Overview

- Auth
  - POST `/api/users/signup/` → { username, password, email }
  - POST `/api/users/token/` → { username, password }
  - GET `/api/users/me/`
- World
  - GET `/api/world/state/`
  - PATCH `/api/world/state/` → update fields like terrain_seed, habit_consistency, neglect, stress_level, breakthroughs
- Engine
  - GET `/api/engine/entries/`, POST `/api/engine/entries/`
  - GET `/api/engine/profiles/`
- Human
  - GET/POST `/api/human/dilemma/today/`
  - GET/POST `/api/human/mission/today/`
  - GET `/api/human/match/`
- Urgency
  - GET `/api/urgency/status/`
  - GET/POST `/api/urgency/wishes/`, POST `/api/urgency/wishes/{id}/postpone/`
  - GET/POST `/api/urgency/slowpost/`
- Vault
  - GET `/api/vault/snapshot/`
  - GET/POST `/api/vault/grants/`

## Common Tasks

- Change the seed and regenerate terrain (World page).
- Toggle Auto LOD to keep frame rate smooth on lower-end GPUs.
- Add an Engine entry with mood to see patterns.
- Vote on the daily dilemma and complete the mission (Human).
- Add wishes, postpone them, and create SlowPost letters (Urgency).
- Schedule a grant (Vault).

## Development Tips

- Keep tokens secure; never commit secrets.
- Use light/dark toggle to preview themes.
- If API base changes, set `VITE_API_BASE` and restart the frontend.

## Troubleshooting

- Frontend not loading: confirm `npm run dev` shows `Local: http://localhost:5173/`.
- API not reachable: ensure Django server is running at `http://0.0.0.0:8000/` and CORS is configured.
- Auth issues: verify token stored in `localStorage` under `token`.

## Screenshots

- World: `docs/screenshots/world.png`
- Engine: `docs/screenshots/engine.png`
- Human: `docs/screenshots/human.png`
- Urgency: `docs/screenshots/urgency.png`
- Vault: `docs/screenshots/vault.png`

Add PNGs to `docs/screenshots/` and they will render:

```markdown
![World](docs/screenshots/world.png)
![Engine](docs/screenshots/engine.png)
```

## CI Setup

Use GitHub Actions to build and test both frontend and backend.

Frontend workflow (`.github/workflows/frontend.yml`):

```yaml
name: Frontend CI
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
      - run: npm ci
        working-directory: frontend
      - run: npm run build
        working-directory: frontend
```

Backend workflow (`.github/workflows/backend.yml`):

```yaml
name: Backend CI
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: python -m venv .venv && .venv/bin/pip install --upgrade pip
        working-directory: backend
      - run: .venv/bin/pip install -r requirements.txt
        working-directory: backend
      - run: .venv/bin/python manage.py check
        working-directory: backend
```

Replace `OWNER/REPO` in the badges with your repository path.

## Deployment

- Frontend (Vercel)
  - Import repo, select `frontend` as root.
  - Build command: `npm run build`
  - Output: `dist`
  - Environment: `VITE_API_BASE=https://your-backend-host/api`

- Frontend (Netlify)
  - Build command: `npm run build`
  - Publish directory: `frontend/dist`
  - Environment: `VITE_API_BASE=https://your-backend-host/api`

- Backend (Render)
  - New Web Service, root: `backend`
  - Build command: `pip install -r requirements.txt`
  - Start command: `gunicorn aeon.wsgi:application --bind 0.0.0.0:8000`
  - Environment: set Django settings, secret key, allowed hosts, CORS.

- Backend (Railway)
  - Python service from `backend`, set `PORT`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`.
  - Start command: `gunicorn aeon.wsgi:application --bind 0.0.0.0:$PORT`

Notes:
- Ensure CORS allows your frontend origin.
- Set `VITE_API_BASE` on the frontend to the deployed backend URL.
- Use HTTPS across both services.

## Contributing

- Fork and create feature branches.
- Keep PRs small and focused.
- Run frontend build and backend checks before PR:
  - `npm run build` in `frontend`
  - `python manage.py check` in `backend`

## License

Proprietary — internal project use.
