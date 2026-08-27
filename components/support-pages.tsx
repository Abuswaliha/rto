"use client";

import Link from "./safe-link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Download,
  Landmark,
  QrCode,
  Search,
  WalletCards,
} from "lucide-react";
import { PageShell } from "./page-shell";
import { appointmentParts } from "@/lib/appointment";
import { DemoApplication, loadApplication, loadDraft, saveApplication, saveDraft } from "@/lib/storage";
import { downloadAppointmentPdf } from "@/lib/demo-pdf";

export function Appointments() {
  const [slot, setSlot] = useState("29 Aug · 11:20 AM");
  const [application, setApplication] = useState<DemoApplication | null>(null);
  const [activeTab, setActiveTab] = useState<"Upcoming" | "Past" | "Cancelled">("Upcoming");
  const [showSlip, setShowSlip] = useState(false);
  const [rebooked, setRebooked] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = loadApplication();
      if (saved) {
        setApplication(saved);
        setSlot(saved.appointment || "29 Aug · 11:20 AM");
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const shown: DemoApplication = application || { id: "SRTO-LL-2026-001284", status: "appointment-scheduled", appointment: slot, rto: "MH-10 Sangli RTO", submittedAt: "2026-08-25T15:21:00+05:30", fullName: "Demo Citizen", appointmentId: "APT-20037" };
  const shownAppointment = appointmentParts(slot);

  function changeSlot(nextSlot: string) {
    setSlot(nextSlot);
    if (application) {
      const updated = { ...application, appointment: nextSlot };
      setApplication(updated);
      saveApplication(updated);
      saveDraft({ ...loadDraft(), appointment: nextSlot });
    }
  }

  function downloadSlip(id?: string, _service?: string, time?: string) {
    downloadAppointmentPdf({ ...shown, appointmentId: id || shown.appointmentId, appointment: time || slot });
  }

  return (
    <PageShell>
      <section className="border-b border-[#dce8e5] bg-gradient-to-br from-[#f7fbfa] via-white to-[#edf7f4] py-12">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#0f7655]">
            Appointments · Mock service
          </p>
          <h1 className="my-2 text-3xl font-extrabold tracking-tight text-[#152321] md:text-5xl">
            Manage your RTO visit
          </h1>
          <p className="max-w-xl text-sm font-medium text-[#5e6f68]">
            Book, reschedule, view past visits or download a QR slip for a fictional appointment.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[1fr_320px]">
        <section className="space-y-6">
          {/* Tabs header */}
          <div className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-3" role="tablist" aria-label="Appointment status">
            {(["Upcoming", "Past", "Cancelled"] as const).map((tab) => (
              <button
                key={tab}
                className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
                  activeTab === tab
                    ? "bg-[#167c74] text-white shadow-md shadow-[#167c74]/20 ring-2 ring-[#167c74]"
                    : "bg-white text-[#5e6f68] hover:bg-slate-100 hover:text-[#152321]"
                }`}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                {tab === "Upcoming" && <span className="ml-1.5 rounded-full bg-[#ddf3ef] px-2 py-0.5 text-[10px] font-black text-[#167c74]">1</span>}
                {tab === "Past" && <span className="ml-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">2</span>}
                {tab === "Cancelled" && <span className="ml-1.5 rounded-full bg-[#fff1eb] px-2 py-0.5 text-[10px] font-bold text-[#a64524]">1</span>}
              </button>
            ))}
          </div>

          {/* Tab 1: UPCOMING */}
          {activeTab === "Upcoming" && (
            <>
              {rebooked && (
                <div className="flex items-center gap-3 rounded-2xl border border-[#b9dfd4] bg-[#edf8f5] p-4 text-xs font-bold text-[#0f7655]">
                  <Check size={18} className="shrink-0" />
                  Appointment successfully rebooked and updated for SATURDAY AUG 29.
                </div>
              )}
              <article className="grid grid-cols-1 items-center gap-6 rounded-2xl border border-[#dce8e5] bg-white p-6 shadow-sm sm:grid-cols-[100px_1fr_auto]">
                <div className="flex flex-col items-center justify-center rounded-xl bg-[#ddf3ef] p-3 text-[#167c74]">
                  <span className="text-[10px] font-extrabold tracking-wider">{shownAppointment.month}</span>
                  <strong className="text-3xl font-black leading-tight">{shownAppointment.day}</strong>
                  <small className="text-[9px] font-bold tracking-widest text-[#0f7655]">
                    {shownAppointment.dayName}
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
                    {shown.rto}
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
                    onClick={() => changeSlot(slot.includes("30 Aug") ? "29 Aug · 11:20 AM" : "30 Aug · 10:00 AM")}
                  >
                    Reschedule
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#167c74] px-4 text-xs font-bold text-white transition-all hover:bg-[#126b64]"
                    onClick={() => setShowSlip(true)}
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
                    "Bring the printed demo acknowledgement slip",
                    "Arrive 15 minutes before your scheduled slot",
                    "Do not bring or enter real identity documents",
                  ].map((x) => (
                    <p key={x} className="flex items-center gap-2.5 text-xs text-[#5e6f68]">
                      <Check size={16} className="text-[#167c74]" />
                      {x}
                    </p>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Tab 2: PAST */}
          {activeTab === "Past" && (
            <div className="space-y-4">
              <article className="grid grid-cols-1 items-center gap-6 rounded-2xl border border-[#dce8e5] bg-white p-6 shadow-sm sm:grid-cols-[100px_1fr_auto]">
                <div className="flex flex-col items-center justify-center rounded-xl bg-slate-100 p-3 text-slate-700">
                  <span className="text-[10px] font-extrabold tracking-wider">JAN</span>
                  <strong className="text-3xl font-black leading-tight">15</strong>
                  <small className="text-[9px] font-bold tracking-widest text-slate-500">
                    2026
                  </small>
                </div>

                <div>
                  <span className="inline-block rounded-full bg-[#e7f4ed] px-2.5 py-0.5 text-[11px] font-bold text-[#0d5c45]">
                    Completed · Demo Verified
                  </span>
                  <h2 className="my-1 text-xl font-bold text-[#152321]">
                    Learner Licence Test (Computer)
                  </h2>
                  <p className="flex items-center gap-2 text-xs text-[#5e6f68]">
                    <Landmark size={14} className="text-[#167c74]" />
                    MH-10 Sangli RTO · Counter 04
                  </p>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-[#5e6f68]">
                    <CalendarDays size={14} className="text-[#167c74]" />
                    15 Jan 2026 · 02:30 PM (APT-10928)
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#167c74] bg-white px-4 text-xs font-bold text-[#167c74] transition-colors hover:bg-[#ddf3ef]"
                    onClick={() => downloadSlip("APT-10928", "Learner Licence Test", "15 Jan 2026 · 02:30 PM")}
                  >
                    <Download size={14} /> Receipt
                  </button>
                </div>
              </article>

              <article className="grid grid-cols-1 items-center gap-6 rounded-2xl border border-[#dce8e5] bg-white p-6 shadow-sm sm:grid-cols-[100px_1fr_auto]">
                <div className="flex flex-col items-center justify-center rounded-xl bg-slate-100 p-3 text-slate-700">
                  <span className="text-[10px] font-extrabold tracking-wider">NOV</span>
                  <strong className="text-3xl font-black leading-tight">10</strong>
                  <small className="text-[9px] font-bold tracking-widest text-slate-500">
                    2025
                  </small>
                </div>

                <div>
                  <span className="inline-block rounded-full bg-[#e7f4ed] px-2.5 py-0.5 text-[11px] font-bold text-[#0d5c45]">
                    Completed · Demo Verified
                  </span>
                  <h2 className="my-1 text-xl font-bold text-[#152321]">
                    Vehicle Fitness Inspection
                  </h2>
                  <p className="flex items-center gap-2 text-xs text-[#5e6f68]">
                    <Landmark size={14} className="text-[#167c74]" />
                    MH-10 Sangli RTO · Testing Track
                  </p>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-[#5e6f68]">
                    <CalendarDays size={14} className="text-[#167c74]" />
                    10 Nov 2025 · 11:00 AM (APT-08819)
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#167c74] bg-white px-4 text-xs font-bold text-[#167c74] transition-colors hover:bg-[#ddf3ef]"
                    onClick={() => downloadSlip("APT-08819", "Vehicle Fitness Inspection", "10 Nov 2025 · 11:00 AM")}
                  >
                    <Download size={14} /> Receipt
                  </button>
                </div>
              </article>
            </div>
          )}

          {/* Tab 3: CANCELLED */}
          {activeTab === "Cancelled" && (
            <div className="space-y-4">
              <article className="grid grid-cols-1 items-center gap-6 rounded-2xl border border-[#f5d0c5] bg-[#fffaf8] p-6 shadow-sm sm:grid-cols-[100px_1fr_auto]">
                <div className="flex flex-col items-center justify-center rounded-xl bg-[#ffeae3] p-3 text-[#a64524]">
                  <span className="text-[10px] font-extrabold tracking-wider">AUG</span>
                  <strong className="text-3xl font-black leading-tight">04</strong>
                  <small className="text-[9px] font-bold tracking-widest text-[#a64524]">
                    2026
                  </small>
                </div>

                <div>
                  <span className="inline-block rounded-full bg-[#fff1eb] px-2.5 py-0.5 text-[11px] font-bold text-[#a64524]">
                    Cancelled · User Requested
                  </span>
                  <h2 className="my-1 text-xl font-bold text-[#152321]">
                    Address Modification Appointment
                  </h2>
                  <p className="flex items-center gap-2 text-xs text-[#5e6f68]">
                    <Landmark size={14} className="text-[#a64524]" />
                    MH-10 Sangli RTO
                  </p>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-[#5e6f68]">
                    <CalendarDays size={14} className="text-[#a64524]" />
                    04 Aug 2026 · 10:30 AM (APT-04721)
                  </p>
                  <p className="mt-2 text-xs italic text-[#788882]">Reason: Slot change requested by applicant.</p>
                </div>

                <div>
                  <button
                    type="button"
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#167c74] px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#126b64]"
                    onClick={() => {
                      setRebooked(true);
                      setActiveTab("Upcoming");
                    }}
                  >
                    Rebook appointment
                  </button>
                </div>
              </article>
            </div>
          )}
        </section>

        {/* Sidebar QR preview box */}
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
          <strong className="block text-sm font-bold text-[#152321]">{shown.appointmentId || "APT-20037"}</strong>
          <p className="mt-1 text-xs leading-relaxed text-[#5e6f68]">
            Contains demo appointment flag, appointment ID, and RTO location code.
          </p>
          <button
            type="button"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#167c74] bg-white py-2.5 text-xs font-bold text-[#167c74] transition-colors hover:bg-[#ddf3ef]"
            onClick={() => downloadSlip()}
          >
            <Download size={15} />
            Download slip
          </button>
        </aside>
      </div>

      {/* QR Slip Modal */}
      {showSlip && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#0c1f1b]/60 p-5" role="dialog" aria-modal="true" aria-label="Appointment QR slip" onClick={() => setShowSlip(false)}>
          <div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <QrCode className="mx-auto text-[#167c74]" size={42} />
            <h2 className="mt-3 text-xl font-extrabold text-[#152321]">Demo appointment QR</h2>
            <div className="mx-auto my-5 grid h-44 w-44 place-items-center rounded-2xl bg-[repeating-linear-gradient(45deg,#152321_0_7px,#fff_7px_14px)] p-4">
              <span className="rounded-lg bg-white px-3 py-2 text-xs font-black text-[#152321]">{shown.appointmentId || "APT-20037"}</span>
            </div>
            <p className="text-xs text-[#5e6f68]">This QR code contains fictional prototype appointment data only.</p>
            <div className="mt-5 flex gap-2">
              <button type="button" className="flex-1 rounded-xl border border-[#dce8e5] py-2.5 text-xs font-bold text-[#152321] hover:bg-slate-50" onClick={() => downloadSlip()}>Download</button>
              <button type="button" className="flex-1 rounded-xl bg-[#167c74] py-2.5 text-xs font-bold text-white hover:bg-[#126b64]" onClick={() => setShowSlip(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

export function Wallet() {
  const docs = [
    { t: "Driving Licence", n: "DL-DEMO-4821", s: "Demo · Valid", authority: "MH-10 Sangli RTO", issued: "12/03/2023", expiry: "11/03/2043", category: "MCWG / LMV" },
    { t: "Registration Certificate", n: "MH10AB1234", s: "Demo · Valid", authority: "MH-10 Sangli RTO", issued: "05/08/2022", expiry: "04/08/2037", category: "Hatchback Petrol" },
    { t: "PUCC", n: "PUCC-DEMO-91", s: "Expires in 18 days", authority: "Authorized Testing Station", issued: "13/03/2026", expiry: "12/09/2026", category: "BS-VI Standard" },
    { t: "Insurance", n: "INS-DEMO-203", s: "Valid until Dec 2026", authority: "Demo General Insurance", issued: "01/12/2025", expiry: "31/12/2026", category: "Comprehensive Cover" },
  ];
  const [preview, setPreview] = useState<{ t: string; n: string; s: string; authority: string; issued: string; expiry: string; category: string; mode: "view" | "qr" } | null>(null);

  return (
    <PageShell>
      <section className="border-b border-[#dce8e5] bg-gradient-to-br from-[#f7fbfa] via-white to-[#edf7f4] py-12">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#0f7655]">
            Digital document wallet
          </p>
          <h1 className="my-2 text-3xl font-extrabold tracking-tight text-[#152321] md:text-5xl">
            Your demo documents
          </h1>
          <p className="max-w-xl text-sm font-medium text-[#5e6f68]">
            Synthetic copies for the prototype. Click View to inspect details or Show QR to verify.
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
                className="flex-1 rounded-lg border border-[#dce8e5] bg-white py-2 text-xs font-bold text-[#152321] transition-colors hover:bg-slate-100"
                onClick={() => setPreview({ ...d, mode: "view" })}
              >
                View
              </button>
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#ddf3ef] py-2 text-xs font-bold text-[#167c74] transition-colors hover:bg-[#c9ebe4]"
                onClick={() => setPreview({ ...d, mode: "qr" })}
              >
                <QrCode size={13} />
                Show QR
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Modal Dialog for View and Show QR */}
      {preview && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#0c1f1b]/60 p-5 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label={`${preview.t} ${preview.mode === "qr" ? "QR code" : "preview"}`}
          onClick={() => setPreview(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl transition-all"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Header banner */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="rounded-md bg-[#fff1eb] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#a64524]">
                SMART RTO DEMO CARD
              </span>
              <WalletCards className="text-[#167c74]" size={22} />
            </div>

            {/* Content for View Mode */}
            {preview.mode === "view" ? (
              <div className="my-5">
                <div className="rounded-2xl border border-[#cfe3dd] bg-gradient-to-br from-[#f2f9f7] to-[#e4f3ee] p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#0f7655]">
                        Document Type
                      </p>
                      <h2 className="text-xl font-black text-[#152321]">{preview.t}</h2>
                    </div>
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#167c74] text-xs font-black text-white">
                      RTO
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-[#cfe3dd] pt-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#5e6f68]">Document No:</span>
                      <strong className="font-bold text-[#152321]">{preview.n}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5e6f68]">Holder Name:</span>
                      <strong className="font-bold text-[#152321]">Demo Citizen</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5e6f68]">Authority:</span>
                      <strong className="font-bold text-[#152321]">{preview.authority}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5e6f68]">Category:</span>
                      <strong className="font-bold text-[#152321]">{preview.category}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5e6f68]">Validity:</span>
                      <strong className="font-bold text-[#0d5c45]">{preview.issued} — {preview.expiry}</strong>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-lg bg-white p-2.5 text-[11px] font-semibold text-[#5e6f68]">
                    <span>Status: <strong className="text-[#0d5c45]">{preview.s}</strong></span>
                    <span className="font-mono text-[9px] tracking-widest text-slate-400">||||||||||||||||</span>
                  </div>
                </div>
                <p className="mt-3 text-center text-[11px] text-[#5e6f68]">
                  Synthetic preview for hackathon demo. Not legally binding.
                </p>
              </div>
            ) : (
              /* Content for QR Mode */
              <div className="my-6 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-[#0f7655]">
                  Verification QR Code
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-[#152321]">{preview.t}</h2>
                <p className="text-xs text-[#5e6f68]">{preview.n}</p>

                <div className="mx-auto my-5 grid h-48 w-48 place-items-center rounded-2xl border border-dashed border-[#167c74] bg-[repeating-linear-gradient(45deg,#152321_0_7px,#fff_7px_14px)] p-4 shadow-inner">
                  <span className="rounded-lg bg-white px-3 py-2 text-xs font-black text-[#152321]">
                    DEMO QR SCAN
                  </span>
                </div>

                <div className="rounded-xl bg-[#edf7f4] p-3 text-xs font-semibold text-[#0d5c45]">
                  ✓ Digital Signature Status: Verified (Demo)
                </div>
              </div>
            )}

            {/* Modal actions */}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="w-full rounded-xl bg-[#167c74] py-3 text-sm font-bold text-white transition-colors hover:bg-[#126b64]"
                onClick={() => setPreview(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
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
      <section className="border-b border-[#dce8e5] bg-gradient-to-br from-[#f7fbfa] via-white to-[#ddf3ef] py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0f7655]">Citizen guide</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-[#152321] md:text-6xl">How to use Smart RTO</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#5e6f68]">
            One clear journey from sign-in to tracking, with your progress
            saved along the way.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-2xl border border-[#dce8e5] bg-[#f7fbfa] p-5 lg:sticky lg:top-24">
          <strong className="text-sm font-extrabold text-[#152321]">In this guide</strong>
          <nav className="mt-3 flex flex-col gap-1 text-sm font-semibold text-[#0f7655]">
            <a className="rounded-lg px-3 py-2 hover:bg-[#ddf3ef]" href="#learner">Learner Licence</a>
            <a className="rounded-lg px-3 py-2 hover:bg-[#ddf3ef]" href="#tracking">Application tracking</a>
            <a className="rounded-lg px-3 py-2 hover:bg-[#ddf3ef]" href="#mock">What is simulated</a>
          </nav>
        </aside>

        <article className="min-w-0">
          <section id="learner">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0f7655]">Main journey</p>
            <h2 className="mt-2 text-3xl font-extrabold text-[#152321]">Apply for a Learner Licence</h2>
            <p className="mt-3 text-sm leading-6 text-[#5e6f68]">
              Allow about eight minutes for the demonstration. Use only
              fictional information.
            </p>
            <ol className="mt-8 space-y-3">
              {guideSteps.map((s, i) => (
                <li className="flex gap-4 rounded-2xl border border-[#dce8e5] bg-white p-4 shadow-sm" key={s}>
                  <i className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#ddf3ef] text-sm font-black not-italic text-[#167c74]">{i + 1}</i>
                  <div>
                    <strong className="text-sm font-bold text-[#152321]">{s}</strong>
                    <p className="mt-1 text-xs leading-5 text-[#5e6f68]">
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
            <Link className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#167c74] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#126b64]" href="/login">
              Start the demo <ArrowRight size={17} />
            </Link>
          </section>

          <section id="tracking" className="mt-14 scroll-mt-24 rounded-3xl bg-[#152321] p-7 text-white md:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#78d5c0]">After submission</p>
            <h2 className="mt-2 text-2xl font-extrabold">Track what happens next</h2>
            <p className="mt-3 text-sm leading-6 text-[#c9d8d4]">
              The timeline uses plain language and always highlights your next
              action. An objection would return you only to the document that
              needs fixing.
            </p>
          </section>

          <section id="mock" className="mt-14 scroll-mt-24">
            <h2 className="text-2xl font-extrabold text-[#152321]">What is real and what is simulated?</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#b9dfd4] bg-[#f1faf7] p-5">
              <span className="flex items-center gap-2 text-sm font-bold text-[#0f7655]">
                <Check size={18} />
                Working
              </span>
              <p className="mt-3 text-xs leading-5 text-[#5e6f68]">
                UI, navigation, validation, draft persistence, prefill,
                responsive layout and status explanations.
              </p>
            </div>
            <div className="rounded-2xl border border-[#f1d4c7] bg-[#fff8f4] p-5">
              <span className="flex items-center gap-2 text-sm font-bold text-[#a64524]">
                <AlertTriangle size={18} />
                Simulated
              </span>
              <p className="mt-3 text-xs leading-5 text-[#5e6f68]">
                Identity checks, government records, uploads, OCR,
                appointments, payments and application processing.
              </p>
            </div>
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
      <section className="border-b border-[#dce8e5] bg-gradient-to-br from-[#152321] to-[#167c74] py-14 text-white md:py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <CircleHelp className="mx-auto text-[#78d5c0]" size={40} />
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">How can we help?</h1>
          <p className="mt-3 text-sm text-[#d9e7e3]">
            Search simple, local guidance. No question is sent to a server.
          </p>
          <div className="mx-auto mt-7 flex max-w-2xl items-center gap-3 rounded-2xl bg-white px-5 py-1 text-[#152321] shadow-xl">
            <Search size={20} className="text-[#167c74]" />
            <input
              className="h-12 w-full border-0 bg-transparent text-sm outline-none placeholder:text-[#7d8d88]"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="For example: What documents do I need?"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[1fr_320px]">
        <section>
          <h2 className="mb-5 text-2xl font-extrabold text-[#152321]">Popular questions</h2>
          {faqs
            .filter((x) => x.toLowerCase().includes(q.toLowerCase()))
            .map((x, i) => (
              <details className="group mb-3 rounded-2xl border border-[#dce8e5] bg-white p-5 shadow-sm" key={x} open={i === 0 && Boolean(q)}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-[#152321]">
                  {x}
                  <ChevronDown size={18} className="shrink-0 text-[#167c74] transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-6 text-[#5e6f68]">
                  {i === 4
                    ? "No. Smart RTO is an independent hackathon prototype and is not affiliated with any government authority."
                    : "Open the relevant service or guide. Smart RTO shows the required demo information at the exact step where you need it."}
                </p>
              </details>
            ))}
        </section>

        <aside className="h-fit rounded-3xl bg-[#ddf3ef] p-7">
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0f7655]">
            <CircleHelp size={18} />
            Need more help?
          </span>
          <h3 className="mt-4 text-xl font-extrabold text-[#152321]">Follow a step-by-step guide</h3>
          <p className="mt-3 text-sm leading-6 text-[#5e6f68]">
            See exactly what to do before, during and after a Learner Licence
            application.
          </p>
          <Link className="mt-5 inline-flex font-bold text-[#0f7655] hover:underline" href="/how-it-works">Open the guide →</Link>
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
      <section className="border-b border-[#dce8e5] bg-gradient-to-br from-[#f7fbfa] via-white to-[#ddf3ef] py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0f7655]">{page.eyebrow}</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-[#152321] md:text-6xl">{page.title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#5e6f68]">{page.copy}</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-4 px-6 py-12">
        {page.sections.map(([t, c], i) => (
          <section className="grid gap-4 rounded-2xl border border-[#dce8e5] bg-white p-6 shadow-sm sm:grid-cols-[64px_1fr]" key={t}>
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#ddf3ef] text-sm font-black text-[#167c74]">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h2 className="text-xl font-extrabold text-[#152321]">{t}</h2>
              <p className="mt-2 text-sm leading-6 text-[#5e6f68]">{c}</p>
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
