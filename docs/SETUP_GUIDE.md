# MentorLagbe — Setup & Operations Guide

Everything below is for the **Next.js frontend** in this repository. The Express API is a separate deployment and must not be edited from here.

---

## 1. Frontend environment

`.env.local` (never committed) must contain:

```env
NEXT_PUBLIC_API_URL=https://mentorlagbe-as-9-server.onrender.com/api
NEXT_PUBLIC_UPLOAD_URL=https://mentorlagbe-as-9-server.onrender.com/api/upload/image
NEXT_PUBLIC_IMGBB_KEY=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the Express API. Must include `/api`. |
| `NEXT_PUBLIC_UPLOAD_URL` | Backend image proxy. Bearer token + multipart field `image`. |
| `NEXT_PUBLIC_IMGBB_KEY` | Dev-only fallback. Keep **empty** in production. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Enables the Google button. Empty shows a setup hint. |

`.env.example` is the committed template. **No ImgBB, Stripe, JWT or MongoDB secret ever belongs in the frontend.** The Google client ID is intentionally public and safe to commit; the ImgBB key is not. If an ImgBB key was ever committed, revoke and replace it in ImgBB, and keep the new value only in the backend `.env`.

Local start:

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run build
```

For Vercel/Netlify, add the same four variables to the project's environment settings and redeploy. **Hosting env vars override `.env.local` at build time** — if `NEXT_PUBLIC_API_URL` is set to `https://mentorlagbe-as-9-server.onrender.com` (without `/api`) on Vercel, sign-in returns 404 and server-side page reads return 500 even though `.env.local` is correct. `src/lib/api.js` now appends `/api` automatically as a safeguard, but the value in the host dashboard should still include it. After changing any env var on Vercel, trigger a **new deployment** — `NEXT_PUBLIC_*` values are baked into the bundle at build time.

---

## 2. Fixing the `/payments/return` error

If checkout finishes and the browser lands on `http://localhost:5000/payments/return?session_id=...` (or shows `No route for GET /payments/return`), the API built Stripe's `success_url` from an unset `API_URL`, which fell back to `http://localhost:5000`. This is a backend environment problem, not a frontend route problem.

The flow is: Stripe → `GET /api/payments/return?session_id=...` on the backend → backend verifies the paid session → 302 to `CLIENT_URL/payment/success?plan=...&amount=...`.

On the **Express server** (Render → Environment), set these exact variables:

```env
BETTER_AUTH_URL=https://mentorlagbe-as-9-server.onrender.com
API_URL=https://mentorlagbe-as-9-server.onrender.com
CLIENT_URL=https://mentorlagbe-client.vercel.app
CORS_ORIGIN=https://mentorlagbe-client.vercel.app
```

All four must be **origins** — no `/api` suffix, no trailing slash. `render.yaml` in the server repo now ships these values, and `src/config/env.js` falls back to them in production, so a fresh deploy works even if the dashboard values are missing.

This repository also provides `/payments/return?session_id=...` as a fallback. `src/app/(site)/payments/return/page.js` reads `session_id`, calls `GET /api/payments/return?session_id=...`, follows any backend redirect, and forwards to `/payment/success?plan=...&amount=...`.

Also make sure these are set on the server for checkout to work at all:

```env
STRIPE_SECRET_KEY=sk_test_...        # or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
IMGBB_KEY=...
```

Register this webhook endpoint in Stripe:

```
https://mentorlagbe-as-9-server.onrender.com/api/payments/webhook
```

`GET /api/config` should eventually report `webhookEnabled: true` and a non-empty `stripePublishableKey`.

---

## 3. Google sign-in

1. In Google Cloud Console → **APIs & Services → Credentials**, create an OAuth 2.0 Client ID of type **Web application**.
2. Add these to **Authorised JavaScript origins**:
   - `http://localhost:3000`
   - your deployed frontend origin (e.g. `https://your-frontend.vercel.app`)
3. Copy the client ID into `.env.local`:

   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=1234567890-abcdef.apps.googleusercontent.com
   ```

4. Add the same variable to your hosting provider and redeploy.

The button uses Google Identity Services. Google verifies the ID token in-browser; the frontend bridges the verified email/name/picture to the existing `/auth/signin` and `/auth/signup` endpoints with a password derived from Google's immutable subject ID. First sign-in creates a free student account automatically, and the Google profile picture is saved as the user's avatar through `PUT /profile` (a user-uploaded picture is never overwritten). For this to load, `https://lh3.googleusercontent.com` must remain reachable by the browser.

If the email already exists with a different password, Google sign-in cannot link it automatically — sign in with the original password instead, or add account-linking on the server later.

With an empty client ID the button is still visible but shows a setup hint instead of failing silently.

---

## 4. Creating an admin account

There is **no public admin sign-up** — that is intentional. `/dashboard/admin` already exists and is wired to the admin API endpoints; you only need an account with `role: "admin"`.

1. Sign up normally through `/sign-up` with the email you want to use, e.g. `admin@yourdomain.com`. Use a strong password and save it.
2. Promote that user in MongoDB (from a machine that can reach your cluster):

   ```js
   use <your database name>
   db.users.updateOne(
     { email: "admin@yourdomain.com" },
     { $set: { role: "admin", plan: "pro" } }
   )
   ```

   The exact collection/field names come from the server model (usually `server/src/models/User.js`). If your model uses a different name, adjust accordingly.
3. Sign out and sign in again at `/sign-in` with that email and password. The auth guard reads the fresh role from `/auth/me`; the Admin link appears in the dashboard sidebar automatically.
4. Approve the sample tuitions at `/dashboard/admin/tuitions` so they become visible on `/tuitions`.

If the server ships a seed script, running that is an equally valid way to create the first admin.

---

## 5. Empty production database

An empty Mongo database is normal for a fresh deployment. The home page will show `0` tutors/students/tuitions and the Browse page will show an empty state. This is real API data — do not add demo fallbacks to the frontend.

To insert sample data, follow [SAMPLE_DATA.md](./SAMPLE_DATA.md).

---

## 6. Verification checklist

```bash
npm run lint
npm run build
```

Then in the browser:

- `/` and `/tuitions` load live API data (empty states are fine on a fresh DB).
- Sign in with a created user; `localStorage["ml_token"]` contains the JWT.
- Hard-refresh `/dashboard/student`, `/dashboard/tutor` or `/dashboard/admin`: the session is restored through `GET /auth/me`.
- Opening `/dashboard/admin` as a student shows a toast and redirects to the correct dashboard.
- Student: apply to a tuition, bookmark/unbookmark it, cancel an application, upgrade to Pro.
- Tutor: post a tuition, edit/toggle/delete it, accept/reject an applicant.
- Admin: change a user role, approve/reject a tuition, view transactions.
- Profile: upload an image (goes through the backend proxy) and save.
- Pricing: clicking Pro redirects to Stripe, then `/payments/return` → `/payment/success?plan=...&amount=...`.
- Google button: with a client ID set, the official button renders and signs in.

---

## 7. Repository layout

```
src/app/(site)/       public pages, including /payments/return and /payment/success
src/app/dashboard/    role-guarded dashboards
src/app/api/          server-side /api/tuitions proxy
src/lib/api.js        all Express API calls, bearer token, upload proxy
src/lib/data.js       uncached server reads for public pages
src/lib/store.jsx     AppProvider / useApp contract
src/lib/google.js     Google Identity helper
scripts/              sample-data seeder
docs/                 this guide and the sample-data guide
```
