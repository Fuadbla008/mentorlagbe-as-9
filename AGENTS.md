<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Layout

- App Router source is in `src/app/`; static assets in `public/`. Public pages live in the `(site)` route group, dashboards in `dashboard/` (its layout/shell owns auth and role redirects). The old README's `app/page.js` path is stale; home is `src/app/(site)/page.js`.
- JavaScript only, no TypeScript: `jsconfig.json` maps `@/*` to `./src/*`.
- Demo-first data layer: `src/lib/store.jsx` (client state persisted in localStorage, actions return `{ ok, message }` for sonner toasts) and `src/lib/seed.js`. `src/lib/data.js` does server-side search/filter for `/tuitions` and `/api/tuitions`. Empty `NEXT_PUBLIC_*` values in `.env.local` keep demo mode on; backend secrets stay in the Express `.env`.

## Commands

- `npm run dev` (Turbopack, localhost:3000), `npm run build`, `npm start`, `npm run lint` (runs `eslint` over the repo via `eslint.config.mjs`, not `next lint`).
- No test, typecheck, or formatter scripts. Treat `npm run lint` and `npm run build` as the available checks.

## Config quirks

- `next.config.mjs` enables `cacheComponents`, `partialPrefetching`, `reactCompiler`, and `experimental.agentFeedback`. With Cache Components on, uncached dynamic reads must sit behind `<Suspense>` or be cached with `"use cache"`; legacy segment exports (`dynamic`, `dynamicParams`, `revalidate`, `fetchCache`, `runtime`) are unsupported. Check `node_modules/next/dist/docs/01-app/` before writing data-fetching or navigation code.
- Tailwind 4 has no PostCSS config: `@tailwindcss/turbopack` is wired through `turbopack.rules["*.css"]` in `next.config.mjs`. Turbopack is the default for dev and build; that loader is not part of a `--webpack` run.
- `next dev` owns the marker-delimited blocks in this file (the Next.js rules block now; `agentFeedback` may add a feedback block). It rewrites them, so edit only the surrounding content.
