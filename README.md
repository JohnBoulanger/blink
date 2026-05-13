# Visus

A real-time optometry staffing platform connecting qualified eye care professionals with clinics that need them. Built with React, Express.js, Prisma, and Socket.IO.

![Landing page](docs/screenshots/01-landing.png)

## Live demo

[https://dentalink-production-ceda.up.railway.app](https://dentalink-production-ceda.up.railway.app)

> The Railway subdomain still says `dentalink` — it's the original deployment URL. A custom domain swap is on the backlog; the app itself is fully rebranded.

### Demo accounts

All accounts use the password `123123`.

| Role | Email |
|------|-------|
| Optometry professional | `regular1@visus.dev` through `regular20@visus.dev` |
| Optometry clinic | `business1@visus.dev` through `business15@visus.dev` |
| Platform admin | `admin1@visus.dev` |

## Features

### For optometry professionals
- Browse open shifts with filtering by position type, salary range, and start date
- Manage qualifications and upload credential documents for admin review
- Express interest in jobs and receive invitations from clinics
- Real-time negotiation chat with 15-minute time-boxed windows

![Browse jobs](docs/screenshots/03-regular-jobs.png)
![Qualifications](docs/screenshots/04-regular-qualifications.png)

### For optometry clinics
- Post shifts with position type, salary range, and time window
- Browse discoverable candidates filtered by approved qualifications
- Invite candidates and track mutual interest
- Negotiate terms in real time and confirm hires

![Business jobs](docs/screenshots/05-business-jobs.png)

### For platform administrators
- Manage users (suspend/unsuspend) and businesses (verify/unverify)
- Review and approve qualification submissions
- Configure system settings: negotiation window, reset cooldown, job start window, availability timeout
- Manage position types

![Admin users](docs/screenshots/06-admin-users.png)
![Admin settings](docs/screenshots/07-admin-settings.png)

### Public pages
- Browse verified optometry clinics with search and sorting
- View clinic profiles with location map, contact info, and open positions

![Clinics list](docs/screenshots/08-clinics-list.png)

### Authentication
- JWT-based auth with role-dependent dashboards
- Account activation via email token
- Password reset flow
- Registration for both professionals and clinics

![Login](docs/screenshots/02-login.png)
![Register](docs/screenshots/09-register.png)

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, React Router |
| Backend | Express.js, Prisma ORM, SQLite |
| Real-time | Socket.IO (WebSocket) |
| Auth | JWT (JSON Web Tokens) |
| Maps | Leaflet + OpenStreetMap |
| Security | Helmet, express-rate-limit, Zod validation |

## Getting started

### Prerequisites
- Node.js 22+
- npm

### Installation

```bash
# install backend dependencies and set up the database
cd backend
npm install
npx prisma generate
npx prisma db push
npx prisma db seed

# install frontend dependencies
cd ../frontend
npm install
```

### Environment

Copy `.env.example` to `backend/.env` and fill in values:

```
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Running locally

```bash
# start backend (port 3000)
cd backend
node --watch src/server.js 3000

# start frontend (port 5173)
cd frontend
npm run dev
```

## Project structure

```
.
├── backend/
│   ├── prisma/          # schema, migrations, seed
│   ├── src/
│   │   ├── config/      # environment configuration
│   │   ├── controllers/ # route handlers
│   │   ├── middleware/  # auth, validation, rate limiting, upload
│   │   ├── routes/      # express route definitions
│   │   ├── services/    # business logic
│   │   └── validators/  # zod schemas
│   └── uploads/         # user-uploaded files (avatars, resumes, docs)
├── frontend/
│   └── src/
│       ├── components/  # reusable UI components
│       ├── contexts/    # React context providers (auth, negotiation)
│       ├── pages/       # page-level components by role
│       └── utils/       # API client, helpers
└── docs/
    └── screenshots/     # application screenshots
```

## Security

- Tiered rate limiting on all endpoints (auth, upload, public, authenticated)
- Strict input validation with Zod schemas on every route
- Centralized secret management with startup validation in production
- Helmet security headers
- File upload size limits
- Socket.IO per-connection message rate limiting

## License

MIT — see [LICENSE](LICENSE).
