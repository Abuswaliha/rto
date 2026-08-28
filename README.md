<<<<<<< HEAD
# Smart RTO Citizen Portal

Smart RTO is an independent hackathon prototype that demonstrates a simpler citizen experience for common Indian RTO journeys. It is not affiliated with MoRTH, NIC, Parivahan, Sarathi, VAHAN, or any State Transport Department.

## Problem and solution

Long forms, unfamiliar terminology, repeated data entry, and unclear next actions can make licence services difficult to finish. Smart RTO turns the Learner Licence journey into eight small steps with explanations, validation, local autosave, prefill, an appointment, a test payment, and plain-language tracking.

## Main journey

Demo Login → Dashboard → Learner Licence → Documents → Appointment → Test Payment → Submission → Tracking

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Demo credentials

- Mobile: `9999999999`
- OTP: `123456`

## Mock vs working

| Feature | Status |
|---|---|
| UI, navigation and validation | Working |
| Draft autosave and resume | Working, device-local |
| Demo login and profile prefill | Working mock |
| Application tracking | Simulated |
| Identity and government verification | Mock only |
| Payments, vehicle and challan records | Synthetic |
| Document upload/OCR | Simulated locally |

### Appwrite wallet persistence

Set `NEXT_PUBLIC_APPWRITE_DATABASE_ID` and `NEXT_PUBLIC_APPWRITE_DOCUMENTS_COLLECTION_ID` in `.env.local`. To create the database and collection once, set a server-only `APPWRITE_API_KEY` and run:

```bash
node scripts/setup-appwrite-wallet.mjs
```

The collection uses document-level security. Each saved Aadhaar/PAN record is granted read, update, and delete permissions only to the Appwrite user who created it; collection-level access allows authenticated users to create records. Do not store real identity numbers in this prototype.

## Technology

Next.js App Router via the OpenAI Sites-compatible Vinext runtime, TypeScript, React, Tailwind CSS, Lucide icons, React Hook Form, and Zod. No database or real backend is used.

## Safety and accessibility

The interface repeatedly warns against real personal data, labels every simulated service, stores demo state locally, and sends nothing to government or AI services. Semantic structure, keyboard focus, labelled controls, non-colour status cues, responsive layouts, and reduced-motion support are included.

## OpenAI/Codex usage

Codex helped establish the information architecture, implement the working frontend journey, review security boundaries, and prepare deployment. The in-product assistant is a deterministic local fallback and receives no personal data.

## Limitations and production pathway

The prototype is not legally authoritative and processes no real application. A production version would require authorized government APIs, strong identity and consent controls, audited services, encryption, RBAC, fraud controls, DPDP-compliant retention, and operational governance.
=======
# rto
>>>>>>> 93d2e986cedee7c40ace514b1dfcf5b9bc79c337
