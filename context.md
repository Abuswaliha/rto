# Smart RTO — Project Context

## Purpose

Smart RTO is an independent hackathon prototype for a simpler Indian RTO citizen experience. It focuses on the Learner Licence journey, replacing a long, unclear process with eight small guided steps.

This is **not** an official government portal and is not affiliated with MoRTH, NIC, Parivahan, Sarathi, VAHAN, or any State Transport Department.

## What works in the prototype

- Mock mobile/OTP login and profile prefill.
- Learner Licence application flow with validation, autosave, and resume.
- Document, appointment, test-payment, submission, and tracking screens.
- Dashboard, help, guides, grievance, vehicle, challan, wallet, and support pages.
- Responsive and accessibility-conscious UI with clear mock-service notices.

All government verification, payments, vehicle/challan data, document upload/OCR, and tracking are simulated. No real personal data should be entered.

## Tech stack

- Next.js App Router, React 19, TypeScript
- Vinext / Vite runtime compatible with OpenAI Sites
- Tailwind CSS
- React Hook Form and Zod for forms and validation
- Lucide React icons
- Browser-local persistence only; no database or live backend

Node.js `>=22.13.0` is required.

## Main user journey

`Demo login → Dashboard → Learner Licence → Documents → Appointment → Test Payment → Submission → Tracking`

Demo credentials:

- Mobile: `9999999999`
- OTP: `123456`

## Repository map

- `app/` — routes, layout, and global styling.
- `components/` — reusable and feature-level UI. `learner-flow.tsx` is the core eight-step application.
- `lib/storage.ts` — typed local persistence for session, draft, and application state.
- `docs/` — product, accessibility, flow, form, demo, and architecture references.
- `SECURITY.md` — prototype safety and security boundaries.

## Local commands

```bash
npm install
npm run dev
npm run lint
npm run build
```

The local app runs at `http://localhost:3000`.

## Implementation guardrails

- Keep all user-facing government-facing functionality clearly marked as simulated unless a real authorized integration is added.
- Preserve the no-real-data warning and do not introduce real identity, payment, or government API handling without the required authorization and controls.
- Keep state local unless backend architecture, consent, retention, encryption, access control, and compliance requirements are explicitly added.
- Validate changes with `npm run lint` and `npm run build`, then test the main journey at desktop and mobile widths.

## Useful references

- `README.md` — overview and running instructions.
- `docs/BUILD_GUIDE.md` — component-by-component build outline.
- `docs/CITIZEN_JOURNEYS.md` — expected user journeys.
- `docs/FORM_REFERENCE.md` — form content reference.
- `docs/ACCESSIBILITY.md` — accessibility guidance.
- `docs/FUTURE_ARCHITECTURE.md` — production-path considerations.
