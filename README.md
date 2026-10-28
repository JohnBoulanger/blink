# Visus

A real-time optometry staffing platform connecting qualified eye care professionals with clinics that need them. Built with React, Express.js, Prisma, and Socket.IO.

<img width="1115" height="888" alt="image" src="https://github.com/user-attachments/assets/b2fa3f7f-b333-439e-baa8-1b4e9eae08b8" />

## Demo accounts

The seed script (`npx prisma db seed`) creates these accounts. All accounts use the password `123123`.

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

<img width="1147" height="844" alt="image" src="https://github.com/user-attachments/assets/467c4470-a55c-44fc-8bc8-94b6dd53e2fb" />

<img width="1114" height="514" alt="image" src="https://github.com/user-attachments/assets/e27bd172-00cf-4521-8fa2-14a7dbfcf4f2" />


### For optometry clinics
- Post shifts with position type, salary range, and time window
- Browse discoverable candidates filtered by approved qualifications
- Invite candidates and track mutual interest
- Negotiate terms in real time and confirm hires

<img width="1137" height="872" alt="image" src="https://github.com/user-attachments/assets/315e5b6b-d2cd-47c5-b6fe-c2feed98e46a" />

### For platform administrators
- Manage users (suspend/unsuspend) and businesses (verify/unverify)
- Review and approve qualification submissions
- Configure system settings: negotiation window, reset cooldown, job start window, availability timeout
- Manage position types

<img width="1144" height="841" alt="Screenshot 2026-07-19 211052" src="https://github.com/user-attachments/assets/e6bba49a-52de-4379-a0d5-c4e7f145a1c9" />
<img width="1138" height="899" alt="Screenshot 2026-07-19 211045" src="https://github.com/user-attachments/assets/d5e345e8-b82d-4dbb-a838-f45a9553d819" />


### Public pages
- Browse verified optometry clinics with search and sorting
- View clinic profiles with location map, contact info, and open positions

<img width="1161" height="861" alt="Screenshot 2026-07-19 211138" src="https://github.com/user-attachments/assets/98daf952-1a18-46d7-a5ce-60dc7a3eb49c" />

### Authentication
- JWT-based auth with role-dependent dashboards
- Account activation via email token
- Password reset flow
- Registration for both professionals and clinics

<img width="1163" height="769" alt="Screenshot 2026-07-19 211150" src="https://github.com/user-attachments/assets/f0ba3018-174b-4727-acd6-79f30d787d73" />
<img width="1130" height="587" alt="Screenshot 2026-07-19 211145" src="https://github.com/user-attachments/assets/2d860cfd-4ff4-48c3-8819-490895ecf6f0" />


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

# install root dependencies (for the combined dev script)
cd ..
npm install
```

### Environment

Copy `backend/.env.example` to `backend/.env` and fill in values:

```
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Create `frontend/.env` so the Vite dev server sends API requests to the backend:

```
VITE_BACKEND_URL=http://localhost:3000
```

### Running locally

Start the backend and frontend together from the repository root:

```bash
npm run dev
```

Or start each one in its own terminal:

```bash
# terminal 1: start backend (port 3000)
cd backend
node --watch src/server.js 3000

# terminal 2: start frontend (port 5173)
cd frontend
npm run dev
```

Open http://localhost:5173.

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
