"use client";

import Link from "./safe-link";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Download,
  FileCheck2,
  Printer,
  QrCode,
  Search,
} from "lucide-react";
import { DemoApplication, loadApplication } from "@/lib/storage";
import { PageShell } from "./page-shell";
import { appointmentParts } from "@/lib/appointment";
import { downloadApplicationPdf, downloadAppointmentPdf } from "@/lib/demo-pdf";

export function Tracking() {
  const [app, setApp] = useState<DemoApplication | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setApp(loadApplication()), 0);
    return () => clearTimeout(timer);
  }, []);

  const shown = app || {
    id: "SRTO-LL-2026-001284",
    status: "appointment-scheduled",
    appointment: "29 Aug · 11:20 AM",
    rto: "MH-10 Sangli RTO",
    submittedAt: "2026-08-25",
    fullName: "Demo Citizen",
    appointmentId: "APT-20037",
    paymentReference: "TESTPAY-2026-483921",
    paymentMethod: "Demo UPI",
    feeTotal: "₹170 Demo",
  };
  const selectedAppointment = appointmentParts(shown.appointment);
  const lastUpdated = new Date(shown.submittedAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

  const timelineSteps = [
    [
      "Application submitted",
      "25 Aug 2026",
      "Your test payment and application were received.",
    ],
    [
      "Documents checked",
      "25 Aug 2026",
      "Your synthetic documents passed the mock verification.",
    ],
    [
      "Appointment scheduled",
      selectedAppointment.timelineDate,
      "Attend the demo learner test at the selected time.",
    ],
    [
      "Learner test",
      "Pending",
      "This step will update after the simulated appointment.",
    ],
    ["Approval", "Pending", "Final decision will be shown here."],
    [
      "Licence available",
      "Pending",
      "A demo licence will appear in your wallet.",
    ],
  ];

  return (
    <PageShell>
      {/* Tracking Hero */}
      <section className="border-b border-[#dce8e5] bg-gradient-to-b from-[#f7fbfa] to-[#edf7f4] py-12">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#0f7655]">
            Application status
          </p>
          <h1 className="my-2 text-3xl font-extrabold tracking-tight text-[#152321] md:text-5xl">
            Track your progress
          </h1>
          <p className="max-w-xl text-sm font-medium text-[#5e6f68]">
            See what is complete, what happens next and whether you need to act.
          </p>

          <div className="mt-6 flex max-w-lg items-center gap-2 rounded-2xl border border-[#dce8e5] bg-white p-2 shadow-sm">
            <Search className="ml-2 text-[#5e6f68]" size={18} />
            <input
              aria-label="Application number"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter demo application number"
              className="flex-1 bg-transparent px-2 text-sm text-[#152321] outline-none"
            />
            <button
              className="inline-flex h-9 items-center justify-center rounded-xl bg-[#167c74] px-4 text-xs font-bold text-white transition-all hover:bg-[#126b64]"
              type="button"
            >
              Track
            </button>
          </div>
        </div>
      </section>

      {/* Main Tracking Content */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[1fr_320px]">
        <section className="space-y-6">
          {/* Application Summary Card */}
          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#dce8e5] bg-white p-6 shadow-sm md:flex-row md:items-center">
            <div>
              <span className="inline-block rounded-full bg-[#e7f4ed] px-3 py-1 text-xs font-bold text-[#0d5c45]">
                Appointment scheduled
              </span>
              <p className="mt-2 text-xs font-semibold text-[#0f7655]">
                Learner Licence · Demo
              </p>
              <h2 className="text-2xl font-black tracking-tight text-[#152321]">
                {query || shown.id}
              </h2>
              <span className="text-[11px] text-[#5e6f68]">
                Last updated {lastUpdated}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Print acknowledgement"
                onClick={() => window.print()}
                className="grid h-10 w-10 place-items-center rounded-xl border border-[#dce8e5] bg-white text-[#5e6f68] transition-colors hover:bg-slate-50 hover:text-[#167c74]"
              >
                <Printer size={18} />
              </button>
              <button
                type="button"
                aria-label="Download acknowledgement"
                onClick={() => downloadApplicationPdf(shown)}
                className="grid h-10 w-10 place-items-center rounded-xl border border-[#dce8e5] bg-white text-[#5e6f68] transition-colors hover:bg-slate-50 hover:text-[#167c74]"
              >
                <Download size={18} />
              </button>
            </div>
          </div>

          {/* Next Action Box */}
          <div className="flex flex-col gap-4 rounded-2xl border border-[#bee2d8] bg-[#eff9f6] p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#167c74] text-white">
                <CalendarDays size={22} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0f7655]">
                  Your next action
                </span>
                <strong className="block text-sm font-bold text-[#152321]">
                  Attend the simulated learner test appointment
                </strong>
                <p className="text-xs text-[#5e6f68]">
                  {selectedAppointment.longDate} · {shown.rto}
                </p>
              </div>
            </div>
            <Link
              href="/appointments"
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl bg-white px-4 text-xs font-bold text-[#167c74] shadow-sm ring-1 ring-[#167c74]/20 hover:bg-[#ddf3ef]"
            >
              View appointment
            </Link>
          </div>

          {/* Timeline Card */}
          <article className="rounded-2xl border border-[#dce8e5] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#152321]">
              Application timeline
            </h2>
            <p className="text-xs text-[#5e6f68]">
              Every status below is simulated for this hackathon prototype.
            </p>

            <ol className="mt-6 space-y-6">
              {timelineSteps.map(([t, d, c], i) => {
                const isDone = i < 2;
                const isActive = i === 2;
                return (
                  <li key={t} className="flex gap-4">
                    <div className="relative flex flex-col items-center">
                      <div
                        className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                          isDone
                            ? "bg-[#167c74] text-white"
                            : isActive
                            ? "border-2 border-[#167c74] bg-[#ddf3ef] text-[#167c74]"
                            : "border border-[#dce8e5] bg-slate-50 text-slate-400"
                        }`}
                      >
                        {isDone ? (
                          <Check size={14} />
                        ) : isActive ? (
                          <CalendarDays size={14} />
                        ) : (
                          <Circle size={8} />
                        )}
                      </div>
                      {i < timelineSteps.length - 1 && (
                        <div
                          className={`w-0.5 flex-1 my-1 ${
                            isDone ? "bg-[#167c74]" : "bg-slate-200"
                          }`}
                        />
                      )}
                    </div>
                    <div className="pb-4">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-bold text-[#152321]">
                          {t}
                        </strong>
                        <span className="text-[11px] font-medium text-[#5e6f68]">
                          · {d}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-[#5e6f68]">
                        {c}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </article>

          <article className="overflow-hidden rounded-2xl border border-[#cad8d4] bg-[#eef3f1] p-3 shadow-sm">
            <div className="rounded-sm bg-white p-6 shadow-md md:p-10">
              <div className="flex flex-col justify-between gap-4 border-b-2 border-[#152321] pb-5 sm:flex-row sm:items-start">
                <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a64524]">Demo only · Application PDF preview</p><h2 className="mt-2 text-xl font-black text-[#152321]">Learner Licence acknowledgement</h2><p className="mt-1 text-xs text-[#5e6f68]">Complete application, payment receipt and appointment slip</p></div>
                <div className="text-left text-xs sm:text-right"><strong className="block text-[#152321]">{shown.id}</strong><span className="text-[#5e6f68]">Appointment scheduled</span></div>
              </div>

              <div className="grid gap-7 py-6 md:grid-cols-2">
                <section><h3 className="text-xs font-black uppercase tracking-wider text-[#0f7655]">Applicant and service</h3><dl className="mt-3 space-y-2 text-xs">{[["Applicant",shown.fullName],["Demo identity",shown.identity || "Demo Aadhaar · XXXX 1234"],["Date of birth",shown.dob || "15 Jan 2000"],["Guardian",shown.guardian || "Demo Guardian"],["Gender",shown.gender || "Not recorded"],["Address",[shown.address,shown.city,shown.pincode,shown.state].filter(Boolean).join(", ") || "Demo Nagar, Sangli 416416"],["Vehicle category",shown.vehicle || "LMV"],["RTO",shown.rto],["Documents",`${shown.documents?.length || 3} synthetic files checked`]].map(([label,value])=><div className="grid grid-cols-[110px_1fr] gap-3" key={label}><dt className="text-[#5e6f68]">{label}</dt><dd className="font-semibold text-[#152321]">{value}</dd></div>)}</dl></section>
                <section className="rounded-xl border border-[#dce8e5] p-5"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#0f7655]"><QrCode size={17} />QR appointment slip</div><div className="my-4 grid h-28 w-28 place-items-center bg-[repeating-linear-gradient(45deg,#152321_0_6px,#fff_6px_12px)] p-3"><span className="rounded bg-white px-2 py-1 text-[9px] font-black">DEMO QR</span></div><dl className="space-y-2 text-xs"><div><dt className="text-[#5e6f68]">Appointment ID</dt><dd className="font-bold">{shown.appointmentId || "APT-20037"}</dd></div><div><dt className="text-[#5e6f68]">Date and time</dt><dd className="font-bold">{selectedAppointment.longDate}</dd></div><div><dt className="text-[#5e6f68]">Location</dt><dd className="font-bold">{shown.rto}</dd></div></dl></section>
              </div>

              <section className="border-t border-dashed border-[#9eaaa6] pt-5"><div className="flex items-center justify-between"><h3 className="text-xs font-black uppercase tracking-wider text-[#0f7655]">Payment receipt</h3><span className="rounded-full bg-[#e7f4ed] px-3 py-1 text-[10px] font-bold text-[#0d5c45]">Simulated payment successful</span></div><div className="mt-4 grid gap-3 text-xs sm:grid-cols-2"><p><span className="block text-[#5e6f68]">Payment reference</span><strong>{shown.paymentReference || "TESTPAY-2026-483921"}</strong></p><p><span className="block text-[#5e6f68]">Method</span><strong>{shown.paymentMethod || "Demo payment"}</strong></p><p><span className="block text-[#5e6f68]">Learner Licence + service fee</span><strong>₹150 Demo + ₹20 Demo</strong></p><p><span className="block text-[#5e6f68]">Total paid</span><strong className="text-[#0f7655]">{shown.feeTotal || "₹170 Demo"}</strong></p></div></section>

              <div className="mt-6 flex flex-col gap-3 border-t border-[#dce8e5] pt-5 sm:flex-row"><button type="button" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#167c74] px-4 py-3 text-xs font-bold text-white" onClick={() => downloadApplicationPdf(shown)}><Download size={16} />Download complete PDF</button><button type="button" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#167c74] px-4 py-3 text-xs font-bold text-[#0f7655]" onClick={() => downloadAppointmentPdf(shown)}><QrCode size={16} />Download appointment PDF</button></div>
            </div>
          </article>
        </section>

        {/* Tracking Sidebar */}
        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-[#dce8e5] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0f7655]">
              <FileCheck2 size={16} />
              Application details
            </div>
            <dl className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <dt className="text-[#5e6f68]">Applicant</dt>
                <dd className="font-semibold text-[#152321]">{shown.fullName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#5e6f68]">Service</dt>
                <dd className="font-semibold text-[#152321]">Learner Licence</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#5e6f68]">RTO</dt>
                <dd className="font-semibold text-[#152321]">{shown.rto}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#5e6f68]">Appointment</dt>
                <dd className="font-semibold text-[#152321]">{shown.appointment}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#5e6f68]">Payment</dt>
                <dd className="font-semibold text-[#152321]">
                  {shown.paymentReference || "TESTPAY-2026-483921"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-[#167c74] bg-[#167c74] p-5 text-white shadow-sm">
            <CheckCircle2 size={24} className="text-[#ddf3ef]" />
            <strong className="mt-3 block text-base font-bold">
              Acknowledgement ready
            </strong>
            <p className="mt-1 text-xs leading-relaxed text-[#c6ddd5]">
              Includes a large DEMO watermark and no sensitive identity data.
            </p>
            <button
              type="button"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-bold text-[#167c74] transition-all hover:bg-[#ddf3ef]"
              onClick={() => downloadApplicationPdf(shown)}
            >
              <Download size={16} />
              Download complete PDF
            </button>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

