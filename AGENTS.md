<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Source of truth

- `docs/SETUP_GUIDE.md` is the current operational guide (env, Stripe return flow, Google sign-in, admin provisioning, browser verification checklist). `README.md` still describes a self-contained demo; where it conflicts with code, trust the code.
- Frontend only: the Express/MongoDB API is a separate repo and deployment; do not edit backend files here.

## Layout

- App Router, JavaScript only; `@/*` → `./src/*` (`jsconfig.json`). Public pages in `src/app/(site)/`, role-guarded dashboards in `src/app/dashboard/` (shell and role redirects in `src/components/DashboardShell.jsx`), `/api/tuitions` proxy in `src/app/api/`.
- `src/lib/api.js` is the backend bridge: `localStorage["ml_token"]` → Bearer header, appends `/api` to `NEXT_PUBLIC_API_URL` if missing, image uploads via the backend proxy with multipart field `image`. No secrets here.
- `src/lib/data.js`: server reads for public pages, always `cache: "no-store"`, swallows API errors into empty results.
- `src/lib/store.jsx`: `useApp`/`AppProvider` (wrapped in `src/components/Providers.jsx`) loads role-specific collections with `Promise.allSettled`; actions return `{ ok, message }` for sonner toasts. Only token/theme are persisted in localStorage — there is no working offline demo dataset. `src/lib/seed.js` supplies UI constants plus unused legacy `SEED_*` arrays; the sign-in demo buttons appear only when the API URL is empty.

## Commands

- `npm install` first (node_modules is gitignored), then `npm run dev` (Turbopack, localhost:3000).
- `npm run lint` runs `eslint` directly (not `next lint`); `npm run build`, `npm start`. No test/typecheck/format scripts — lint + build are the checks.
- `npm run seed:sample` seeds the live backend via public endpoints; idempotent, does not create an admin; tuitions land as `pending` and need approval at `/dashboard/admin/tuitions`. Override with `API_URL=...` / `SAMPLE_PASSWORD=...` (see `docs/SAMPLE_DATA.md`).

## Env / deploy quirks

- Copy `.env.example` → `.env.local`. `NEXT_PUBLIC_API_URL` must include `/api` (`api.js` normalizes defensively); an empty URL means no real data, not a usable demo.
- `NEXT_PUBLIC_*` is baked at build time and host env overrides `.env.local` — redeploy after changing Vercel env. Frontend holds only public keys; Mongo/JWT/Stripe/ImgBB secrets belong in the backend `.env`.
- No public admin sign-up: promote a user to `role: admin` in MongoDB, then sign in again (SETUP_GUIDE §4). An empty production DB is expected; do not add frontend demo fallbacks (SETUP_GUIDE §5).

## Framework quirks

- `next.config.mjs` enables `cacheComponents`, `partialPrefetching`, `reactCompiler`, and `experimental.agentFeedback`. Dynamic reads must sit behind `<Suspense>` or `"use cache"`; legacy segment exports (`dynamic`, `dynamicParams`, `revalidate`, `fetchCache`, `runtime`) are unsupported. Read `node_modules/next/dist/docs/01-app/` before data-fetch or navigation edits.
- Tailwind 4 has no PostCSS config: `@tailwindcss/turbopack` is wired via `turbopack.rules["*.css"]` in `next.config.mjs`. Turbopack is the default for dev and build; that loader is absent under `--webpack`.
- `next dev` owns the marker-delimited block above; edit only outside it.
