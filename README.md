# Blink

A real-time optometry staffing platform connecting qualified eye care professionals with clinics that need them. Built with React, Express.js, Prisma, and Socket.IO.

![Blink landing page with the shift search and open shifts](docs/screenshots/blink-landing.png)

## Demo accounts

The seed script (`npx prisma db seed`) creates these accounts. All accounts use the password `123123`.

| Role | Email |
|------|-------|
| Optometry professional | `regular1@blink.dev` through `regular20@blink.dev` |
| Optometry clinic | `business1@blink.dev` through `business15@blink.dev` |
| Platform admin | `admin1@blink.dev` |

## Features

### For optometry professionals
- Browse open shifts with filtering by position type, salary range, and start date
- Manage qualifications and upload credential documents for admin review
- Express interest in jobs and receive invitations from clinics
- Real-time negotiation chat with 15-minute time-boxed windows

![Shift search with photo cards and a map of rates](docs/screenshots/blink-shift-search.png)

![Shift detail with the rate card and the interest action](docs/screenshots/blink-shift-detail.png)


### For optometry clinics
- Post shifts with position type, salary range, and time window
- Browse discoverable candidates filtered by approved qualifications
- Invite candidates and track mutual interest
- Negotiate terms in real time and confirm hires

![A clinic's job list with status filters](docs/screenshots/blink-clinic-jobs.png)

![A confirmed negotiation from the clinic side](docs/screenshots/blink-negotiation-confirmed.png)

### For platform administrators
- Manage users (suspend/unsuspend) and businesses (verify/unverify)
- Review and approve qualification submissions
- Configure system settings: negotiation window, reset cooldown, job start window, availability timeout
- Manage position types

![Admin credential review with one request open](docs/screenshots/blink-credential-review.png)


### Public pages
- Browse verified optometry clinics with search and sorting
- View clinic profiles with location map, contact info, and open positions

### Authentication
- JWT-based auth with role-dependent dashboards
- Account activation via email token
- Password reset flow
- Registration for both professionals and clinics


## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, React Router |
| Backend | Express.js, Prisma ORM, SQLite |
| Real-time | Socket.IO (WebSocket) |
| Auth | JWT (JSON Web Tokens) |
| Maps | Leaflet + OpenStreetMap |
| Fonts | Schibsted Grotesk and Inter, self-hosted with Fontsource |
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

## Photo credits

The clinic photos in `frontend/public/photos/` are illustrative stock photos from [Unsplash](https://unsplash.com), used under the [Unsplash License](https://unsplash.com/license). They do not show the seeded clinics.

| File | Photographer | Source |
|------|--------------|--------|
| `clinic-01.jpg` | Donald Teel | [Unsplash](https://unsplash.com/photos/wall-display-of-sunglasses-in-an-optical-shop--G2kzjBx3Ps) |
| `clinic-02.jpg` | Scott Van Daalen | [Unsplash](https://unsplash.com/photos/arranged-assorted-color-eyeglasses-on-rack-UsALNdok2m4) |
| `clinic-03.jpg` | nrd | [Unsplash](https://unsplash.com/photos/white-eye-testing-machine-aMmDIsdnUro) |
| `clinic-04.jpg` | Viktor Talashuk | [Unsplash](https://unsplash.com/photos/close-up-photo-of-eyeglasses-rack-5hC2YalkXHw) |
| `clinic-05.jpg` | Sabhyata Sahu | [Unsplash](https://unsplash.com/photos/eyeglasses-displayed-on-optical-store-shelves-xGsOQcGFA9g) |
| `clinic-06.jpg` | CHUTTERSNAP | [Unsplash](https://unsplash.com/photos/eyeglasses-lot-G8ioIHUDfNc) |
| `clinic-07.jpg` | Judy Beth Morris | [Unsplash](https://unsplash.com/photos/Y0D5L-qKUcw) |
| `clinic-08.jpg` | mdreza jalali | [Unsplash](https://unsplash.com/photos/collection-of-vintage-eyeglasses-displayed-in-a-shop-JA21BnjBtvo) |
| `clinic-09.jpg` | Sabhyata Sahu | [Unsplash](https://unsplash.com/photos/eyeglasses-displayed-on-store-shelves-3yBmSWXbwyw) |
| `clinic-10.jpg` | atelierbyvineeth | [Unsplash](https://unsplash.com/photos/a-person-looking-at-glasses-in-a-store-display-Mk3Bp2G5I5M) |

## License

MIT — see [LICENSE](LICENSE).
