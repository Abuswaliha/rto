"use client";

import Link from "./safe-link";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Download,
  ExternalLink,
  Landmark,
  QrCode,
  Search,
  WalletCards,
} from "lucide-react";
import { PageShell } from "./page-shell";

export function Appointments() {
  const [slot, setSlot] = useState("29 Aug · 11:20 AM");

  return (
    <PageShell>
      <section className="border-b border-[#dce8e5] bg-gradient-to-b from-[#f7fbfa] to-[#edf7f4] py-12">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#0f7655]">
            Appointments · Mock service
          </p>
          <h1 className="my-2 text-3xl font-extrabold tracking-tight text-[#152321] md:text-5xl">
            Manage your RTO visit
          </h1>
          <p className="max-w-xl text-sm font-medium text-[#5e6f68]">
            Book, reschedule or download a QR slip for a fictional appointment.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[1fr_320px]">
        <section className="space-y-6">
          <div className="flex gap-2 border-b border-slate-200 pb-3">
            <button
              className="rounded-xl bg-[#167c74] px-4 py-2 text-xs font-bold text-white shadow-sm"
              type="button"
            >
              Upcoming
            </button>
            <button
              className="rounded-xl px-4 py-2 text-xs font-semibold text-[#5e6f68] hover:bg-slate-100"
              type="button"
            >
              Past
            </button>
            <button
              className="rounded-xl px-4 py-2 text-xs font-semibold text-[#5e6f68] hover:bg-slate-100"
              type="button"
            >
              Cancelled
            </button>
          </div>

          <article className="grid grid-cols-1 items-center gap-6 rounded-2xl border border-[#dce8e5] bg-white p-6 shadow-sm sm:grid-cols-[100px_1fr_auto]">
            <div className="flex flex-col items-center justify-center rounded-xl bg-[#ddf3ef] p-3 text-[#167c74]">
              <span className="text-[10px] font-extrabold tracking-wider">AUG</span>
              <strong className="text-3xl font-black leading-tight">29</strong>
              <small className="text-[9px] font-bold tracking-widest text-[#0f7655]">
                SATURDAY
              </small>
            </div>

            <div>
              <span className="inline-block rounded-full bg-[#e7f4ed] px-2.5 py-0.5 text-[11px] font-bold text-[#0d5c45]">
                Confirmed · Demo
              </span>
              <h2 className="my-1 text-xl font-bold text-[#152321]">
                Learner test appointment
              </h2>
              <p className="flex items-center gap-2 text-xs text-[#5e6f68]">
                <Landmark size={14} className="text-[#167c74]" />
                MH-10 Sangli RTO
              </p>
              <p className="mt-0.5 flex items-center gap-2 text-xs text-[#5e6f68]">
                <CalendarDays size={14} className="text-[#167c74]" />
                {slot}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="inline-flex h-9 items-center justify-center rounded-xl border border-[#dce8e5] bg-white px-4 text-xs font-bold text-[#152321] transition-colors hover:bg-slate-50"
                onClick={() =>
                  setSlot(
                    slot.includes("11:20")
                      ? "30 Aug · 10:00 AM"
                      : "29 Aug · 11:20 AM"
                  )
                }
              >
                Reschedule
              </button>
              <button
                type="button"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#167c74] px-4 text-xs font-bold text-white transition-all hover:bg-[#126b64]"
              >
                <QrCode size={15} />
                QR slip
              </button>
            </div>
          </article>

          <div className="rounded-2xl border border-[#dce8e5] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#152321]">Before your visit</h2>
            <div className="mt-4 space-y-3">
              {[
                "Bring the printed demo acknowledgement",
                "Arrive 15 minutes before the slot",
                "Do not bring or enter real identity documents",
              ].map((x) => (
                <p key={x} className="flex items-center gap-2.5 text-xs text-[#5e6f68]">
                  <Check size={16} className="text-[#167c74]" />
                  {x}
                </p>
              ))}
            </div>
          </div>
        </section>

        <aside className="rounded-2xl border border-[#dce8e5] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0f7655]">
            <QrCode size={18} />
            <span>QR appointment slip</span>
          </div>
          <div
            className="my-5 grid h-36 w-36 place-items-center rounded-xl border border-dashed border-[#167c74] bg-[#ddf3ef] text-center font-black tracking-widest text-[#167c74]"
            aria-label="Decorative demo QR code"
          >
            DEMO
            <br />
            QR
          </div>
          <strong className="block text-sm font-bold text-[#152321]">APT-20037</strong>
          <p className="mt-1 text-xs leading-relaxed text-[#5e6f68]">
            Contains only a demo flag, appointment ID and application ID.
          </p>
          <button
            type="button"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#167c74] bg-white py-2.5 text-xs font-bold text-[#167c74] transition-colors hover:bg-[#ddf3ef]"
          >
            <Download size={15} />
            Download slip
          </button>
        </aside>
      </div>
    </PageShell>
  );
}

export function Wallet() {
  const docs = [
    { t: "Driving Licence", n: "DL-DEMO-4821", s: "Demo · Valid" },
    { t: "Registration Certificate", n: "MH10AB1234", s: "Demo · Valid" },
    { t: "PUCC", n: "PUCC-DEMO-91", s: "Expires in 18 days" },
    { t: "Insurance", n: "INS-DEMO-203", s: "Valid until Dec 2026" },
  ];

  return (
    <PageShell>
      <section className="border-b border-[#dce8e5] bg-gradient-to-b from-[#f7fbfa] to-[#edf7f4] py-12">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#0f7655]">
            Digital document wallet
          </p>
          <h1 className="my-2 text-3xl font-extrabold tracking-tight text-[#152321] md:text-5xl">
            Your demo documents
          </h1>
          <p className="max-w-xl text-sm font-medium text-[#5e6f68]">
            Synthetic copies for the prototype. These are not valid government
            documents.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {docs.map((d) => (
          <article
            className="group flex flex-col justify-between rounded-2xl border border-[#dce8e5] bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-[#167c74] hover:shadow-md"
            key={d.t}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-[#fff1eb] px-2 py-0.5 text-[10px] font-bold text-[#a64524]">
                  DEMO
                </span>
                <WalletCards size={20} className="text-[#167c74]" />
              </div>
              <h2 className="mt-5 text-lg font-bold text-[#152321]">{d.t}</h2>
              <p className="text-xs font-semibold text-[#5e6f68]">{d.n}</p>
              <strong className="mt-3 block text-xs font-bold text-[#0f7655]">
                {d.s}
              </strong>
            </div>

            <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                className="flex-1 rounded-lg border border-[#dce8e5] bg-white py-1.5 text-xs font-bold text-[#152321] hover:bg-slate-50"
              >
                View
              </button>
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#ddf3ef] py-1.5 text-xs font-bold text-[#167c74] hover:bg-[#c9ebe4]"
              >
                <QrCode size={13} />
                Show QR
              </button>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}


const guideSteps = [
  "Sign in with the demo account",
  "Choose Learner Licence",
  "Complete mock identity verification",
  "Confirm personal information",
  "Add address and select a demo RTO",
  "Add synthetic documents",
  "Choose an appointment",
  "Review and declare",
  "Complete the test payment",
  "Save your application number",
];

export function HowItWorks() {
  return (
    <PageShell>
      <section className="page-hero guide-hero">
        <div className="content-wrap">
          <p className="eyebrow">Citizen guide</p>
          <h1>How to use Smart RTO</h1>
          <p>
            One clear journey from sign-in to tracking, with your progress
            saved along the way.
          </p>
        </div>
      </section>

      <div className="content-wrap how-layout">
        <aside>
          <strong>In this guide</strong>
          <a href="#learner">Learner Licence</a>
          <a href="#tracking">Application tracking</a>
          <a href="#mock">What is simulated</a>
        </aside>

        <article>
          <section id="learner">
            <p className="eyebrow">Main journey</p>
            <h2>Apply for a Learner Licence</h2>
            <p>
              Allow about eight minutes for the demonstration. Use only
              fictional information.
            </p>
            <ol className="guide-steps">
              {guideSteps.map((s, i) => (
                <li key={s}>
                  <i>{i + 1}</i>
                  <div>
                    <strong>{s}</strong>
                    <p>
                      {i === 0
                        ? "Use mobile 9999999999 and OTP 123456."
                        : i === 5
                        ? "Click each upload card to add a local simulated file."
                        : i === 9
                        ? "Open tracking to see the next action and timeline."
                        : "The page explains what is required before you continue."}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <Link className="button primary" href="/login">
              Start the demo <ArrowRight />
            </Link>
          </section>

          <section id="tracking" className="guide-section">
            <p className="eyebrow">After submission</p>
            <h2>Track what happens next</h2>
            <p>
              The timeline uses plain language and always highlights your next
              action. An objection would return you only to the document that
              needs fixing.
            </p>
          </section>

          <section id="mock" className="guide-section mock-list">
            <h2>What is real and what is simulated?</h2>
            <div>
              <span>
                <Check />
                Working
              </span>
              <p>
                UI, navigation, validation, draft persistence, prefill,
                responsive layout and status explanations.
              </p>
            </div>
            <div>
              <span>
                <AlertTriangle />
                Simulated
              </span>
              <p>
                Identity checks, government records, uploads, OCR,
                appointments, payments and application processing.
              </p>
            </div>
          </section>
        </article>
      </div>
    </PageShell>
  );
}

const faqs = [
  "What documents do I need?",
  "Why is my document marked unclear?",
  "How do I change my appointment?",
  "Where is my application number?",
  "Is Smart RTO an official government service?",
];

export function HelpCentre() {
  const [q, setQ] = useState("");

  return (
    <PageShell>
      <section className="help-hero">
        <div className="content-wrap">
          <CircleHelp />
          <h1>How can we help?</h1>
          <p>
            Search simple, local guidance. No question is sent to a server.
          </p>
          <div className="help-search">
            <Search />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="For example: What documents do I need?"
            />
          </div>
        </div>
      </section>

      <div className="content-wrap help-layout">
        <section>
          <h2>Popular questions</h2>
          {faqs
            .filter((x) => x.toLowerCase().includes(q.toLowerCase()))
            .map((x, i) => (
              <details key={x} open={i === 0 && Boolean(q)}>
                <summary>
                  {x}
                  <ChevronDown />
                </summary>
                <p>
                  {i === 4
                    ? "No. Smart RTO is an independent hackathon prototype and is not affiliated with any government authority."
                    : "Open the relevant service or guide. Smart RTO shows the required demo information at the exact step where you need it."}
                </p>
              </details>
            ))}
        </section>

        <aside className="assistant-card">
          <span>
            <CircleHelp />
            Need more help?
          </span>
          <h3>Follow a step-by-step guide</h3>
          <p>
            See exactly what to do before, during and after a Learner Licence
            application.
          </p>
          <Link href="/how-it-works">Open the guide →</Link>
        </aside>
      </div>
    </PageShell>
  );
}

const info: {
  [key: string]: {
    title: string;
    eyebrow: string;
    copy: string;
    sections: [string, string][];
  };
} = {
  about: {
    title: "About Smart RTO",
    eyebrow: "Independent hackathon prototype",
    copy: "A citizen-first demonstration of how transport services could feel clearer, calmer and easier to complete.",
    sections: [
      [
        "The problem",
        "Citizens can struggle with unfamiliar terms, long forms and unclear next actions. Smart RTO breaks one journey into guided, resumable steps.",
      ],
      [
        "What this demo proves",
        "Working navigation, validation, autosave, prefill, appointments, test payment and tracking can create a more understandable experience.",
      ],
      [
        "Important disclosure",
        "Smart RTO is not affiliated with MoRTH, NIC, Parivahan, Sarathi, VAHAN or any State Transport Department.",
      ],
    ],
  },
  privacy: {
    title: "Privacy",
    eyebrow: "Local-only demo data",
    copy: "This prototype is designed to avoid real personal or government information.",
    sections: [
      [
        "What is stored",
        "Fictional form drafts, preferences and demo application status are stored in your browser localStorage.",
      ],
      [
        "What is never required",
        "Real Aadhaar, PAN, passwords, payment details and uploaded identity document contents.",
      ],
      [
        "Shared devices",
        "Use your browser controls to clear site data after a demo on a shared computer.",
      ],
    ],
  },
  security: {
    title: "Security by design",
    eyebrow: "Safe prototype boundaries",
    copy: "Clear limits reduce the risk of real data entering a fictional service.",
    sections: [
      [
        "Synthetic information only",
        "Masked examples, repeated warnings and visibly labelled mock services discourage real sensitive data.",
      ],
      [
        "Local document interactions",
        "The upload experience is simulated locally. Files are not executed or transmitted.",
      ],
      [
        "AI boundary",
        "The demo assistant uses fixed local guidance and never receives identity, OTP, document or payment content.",
      ],
    ],
  },
  accessibility: {
    title: "Accessibility",
    eyebrow: "Designed for more citizens",
    copy: "The interface aims to remain understandable with a keyboard, screen reader, zoom and reduced motion.",
    sections: [
      [
        "Clear structure",
        "Semantic headings, visible labels, status text and focus indicators support assistive technology.",
      ],
      [
        "Beyond colour",
        "Availability and progress use words, shapes and icons as well as colour.",
      ],
      [
        "Responsive and calm",
        "Large touch targets, readable type, strong contrast and reduced-motion support are built in.",
      ],
    ],
  },
  "official-resources": {
    title: "Official resources",
    eyebrow: "Verify real requirements",
    copy: "For actual services, use official government websites and confirm requirements for your state.",
    sections: [
      [
        "You are leaving this prototype",
        "External links open official websites. Smart RTO does not automate, embed or collect credentials for them.",
      ],
      [
        "Official Parivahan Sewa",
        "Use parivahan.gov.in for official transport-service information.",
      ],
      [
        "State variation",
        "Documents, fees, eligibility and appointment procedures can differ by state.",
      ],
    ],
  },
  terms: {
    title: "Terms of demo use",
    eyebrow: "Prototype only",
    copy: "Use Smart RTO only with fictional or synthetic information.",
    sections: [
      [
        "No government service",
        "Nothing submitted here creates a legal application or government record.",
      ],
      [
        "No legal assurance",
        "Eligibility hints, costs and procedures are simplified examples.",
      ],
      [
        "No real payment",
        "Every amount and transaction identifier is fictional.",
      ],
    ],
  },
  "refund-policy": {
    title: "Refund policy",
    eyebrow: "No real transactions",
    copy: "Smart RTO never charges money, so no real refund can arise.",
    sections: [
      [
        "Test payments only",
        "All payment screens are demonstrations and no account is debited.",
      ],
      [
        "Demo challans",
        "Fictional challan payments do not settle any real liability.",
      ],
      [
        "Need real help?",
        "Contact the official service through its verified website.",
      ],
    ],
  },
};

export function InfoPage({ kind }: { kind: string }) {
  const page = info[kind] || info.about;

  return (
    <PageShell>
      <section className="page-hero">
        <div className="content-wrap">
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p>{page.copy}</p>
        </div>
      </section>

      <div className="content-wrap info-sections">
        {page.sections.map(([t, c], i) => (
          <section key={t}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h2>{t}</h2>
              <p>{c}</p>
              {kind === "official-resources" && i === 1 && (
                <a
                  className="button secondary"
                  href="https://parivahan.gov.in"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open official Parivahan <ExternalLink />
                </a>
              )}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}

