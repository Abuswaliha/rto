# Build Guide

1. **Foundation** — `app/layout.tsx`, `app/globals.css`, `app/portal.css`, and `components/portal-header.tsx` define metadata, tokens, responsive layout, navigation, and disclosure.
2. **Local data** — `lib/storage.ts` owns typed draft, session, and application persistence.
3. **Authentication** — `components/demo-login.tsx` provides the mock mobile/OTP flow.
4. **Dashboard** — `components/dashboard.tsx` surfaces resume, quick services, updates, and appointments.
5. **Learner Licence** — `components/learner-flow.tsx` implements eight validated, autosaved levels.
6. **Tracking and appointments** — `components/tracking.tsx` and `components/support-pages.tsx` show status and next actions.
7. **Secondary services** — `components/catalogue.tsx` provides synthetic vehicle and challan records.
8. **Guidance** — `components/support-pages.tsx` and `components/guide-page.tsx` provide searchable local help.
9. **Safety** — `next.config.ts`, `SECURITY.md`, and visible mock labels establish prototype boundaries.
10. **Validation** — run `npm run build` and `npm run lint`; then complete the browser journey at desktop and mobile widths.
