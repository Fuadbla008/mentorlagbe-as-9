# MentorLagbe — Smart Tuition & Mentorship Platform

**Live URL:** `https://mentorlagbe-sigma.vercel.app/`

MentorLagbe is a role-based EdTech frontend that connects students with verified tutors for subject-wise batches and 1-on-1 mentorship. Tutors publish listings, admins moderate them, students search/apply, and Pro plans are sold through Stripe. Built with Next.js App Router, React, Tailwind CSS, better authentication hooks and a seeded demo data layer so every page works before the Express/MongoDB backend is connected.

## Quick start

```bash
npm install
cp .env.example .env.local   # optional; empty values enable demo mode
npm run dev                  # http://localhost:3000
npm run lint
npm run build && npm start
```

No database or API is required for the demo. Data is seeded on first load and persisted in the browser (`localStorage`), so applications, postings, approvals, payments and bookmarks survive a page reload.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@mentorlagbe.com` | any 6+ characters (e.g. `admin123`) |
| Tutor | `sadia@mentorlagbe.com` | any 6+ characters |
| Student | `ayesha@example.com` | any 6+ characters |

One-click **Student / Tutor / Admin** login buttons are also available on `/sign-in`. In production these accounts come from BetterAuth + MongoDB and passwords are handled by the backend — never in the browser.

## Environment variables

Frontend keys go in `.env.local` (git-ignored); backend secrets go in the Express server's `.env`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Express API base URL. Empty = local demo mode. |
| `NEXT_PUBLIC_UPLOAD_URL` | Backend image-upload proxy (preferred; keeps the ImgBB key secret). |
| `NEXT_PUBLIC_IMGBB_KEY` | Public ImgBB key for local demo uploads only. |

Backend-only: `MONGO_URI`, `BETTER_AUTH_SECRET`, `JWT_SECRET`, `IMGBB_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.

## Key features

- **Public site:** hero with search, 6 dynamic featured tuitions, how-it-works, subject grid, testimonials, pricing preview, responsive navbar/footer with the new X logo.
- **Browse & details:** server-side search and filters (title/subject, subject, class level, mode), sorting, pagination, tuition details with tutor summary, and role-restricted apply flow with duplicate prevention.
- **Auth:** sign-up with role selection, sign-in validation/toasts, demo logins, persisted session and JWT-style token attached to API requests.
- **Student dashboard:** stats, application tracking with status badges, pending-application cancellation, saved/bookmarked tuitions.
- **Tutor dashboard:** stats, validated post-a-tuition form with image upload, full CRUD on own tuitions, active/closed toggle, applicant management, free-plan post limit (2).
- **Admin dashboard:** platform stats, pending approval queue, user role management, tuition moderation, Stripe transaction records.
- **Shared:** profile editing with image upload, Stripe checkout flow (demo simulation until the backend is connected), payment success/cancel pages, skeleton loading, custom 404/error pages, toast notifications, dark/light theme.
- **Seed data:** 12 approved active tuitions, connected tutors/students, applications and Stripe-style payment records.
- **Server-side search endpoint:** `GET /api/tuitions?q=&subject=&classLevel=&mode=&page=&sort=`.

## Route map

```
/                         Home
/tuitions                 Browse (server-side filters)
/tuitions/[id]            Tuition details + apply
/pricing                  Free vs Pro plans
/sign-in, /sign-up        Authentication
/payment/success, /payment/cancel
/dashboard                Role redirect
/dashboard/student        Overview, my-applications, saved
/dashboard/tutor          Overview, post-tuition, my-tuitions, applicants
/dashboard/admin          Overview, users, tuitions, transactions
/dashboard/profile        Shared profile editor
```

## Backend integration notes

- `src/lib/api.js` is the single place for API calls; it sends `Authorization: Bearer <token>` and throws when `NEXT_PUBLIC_API_URL` is unset.
- `src/lib/data.js` holds the server-side search/filter used by `/tuitions` and `/api/tuitions`; replace its reads with Express/MongoDB calls when the API is ready.
- `src/lib/store.jsx` is a demo-first client store. Replace its actions with API calls while keeping the `{ ok, message }` return shape so toasts keep working.
- Stripe checkout calls `POST /payments/checkout` and expects `{ url }`; the webhook/session verification belongs in the backend.

## npm packages used

**Runtime:** `next` (16.4.6), `react` (19.3.0), `react-dom` (19.3.0), `lucide-react`, `sonner`.
**Dev:** `tailwindcss` (4.3.3), `@tailwindcss/turbopack`, `babel-plugin-react-compiler`, `eslint`, `eslint-config-next`.

Tailwind 4 is wired through `@tailwindcss/turbopack` in `next.config.mjs` (no PostCSS config). Turbopack is the default bundler for both `dev` and `build`.
