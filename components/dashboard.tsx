"use client";

import Link from "./safe-link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Car,
  FileCheck2,
  FileText,
  Gauge,
  Landmark,
  Search,
  ShieldAlert,
  WalletCards,
} from "lucide-react";
import {
  DemoAadhaarProfile,
  DemoApplication,
  Draft,
  loadApplication,
  loadDemoProfile,
  loadDraft,
} from "@/lib/storage";
import { PageShell } from "./page-shell";
import { appointmentParts } from "@/lib/appointment";

const quick = [
  {
    t: "Learner Licence",
    d: "Start or continue",
    i: FileText,
    h: "/apply/learner-licence",
  },
  {
    t: "Book appointment",
    d: "Choose a demo slot",
    i: CalendarDays,
    h: "/appointments",
  },
  { t: "Track application", d: "View status", i: Search, h: "/track" },
  { t: "Check vehicle", d: "Synthetic records", i: Car, h: "/vehicles" },
  {
    t: "Check challan",
    d: "Demo challans",
    i: ShieldAlert,
    h: "/challans",
  },
  {
    t: "Document wallet",
    d: "Demo documents",
    i: WalletCards,
    h: "/wallet",
  },
];

export function Dashboard() {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [application, setApplication] = useState<DemoApplication | null>(null);
  const [profile, setProfile] = useState<DemoAadhaarProfile | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDraft(loadDraft());
      setApplication(loadApplication());
      setProfile(loadDemoProfile());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const progress = Math.round(((draft?.step || 0) / 8) * 100);
  const hasApp = Boolean(application);
  const appointment = appointmentParts(application?.appointment);

  return (
    <PageShell>
      {/* Dashboard Hero */}
      <section className="border-b border-[#dce8e5] bg-gradient-to-b from-[#f7fbfa] to-[#edf7f4] py-12">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#0f7655]">
              Tuesday, 25 August
            </p>
            <h1 className="my-2 text-3xl font-extrabold tracking-tight text-[#152321] md:text-4xl lg:text-5xl">
              Good afternoon, {profile?.fullName || "Demo Citizen"}
            </h1>
            <p className="text-sm font-medium text-[#5e6f68]">
              What would you like to do today?
            </p>
          </div>

          <Link
            href="/profile"
            className="flex items-center gap-3.5 rounded-2xl border border-[#e3dbc9] bg-[#fff9ed] p-4 text-xs shadow-sm transition-transform hover:-translate-y-0.5 md:max-w-xs"
          >
            <Gauge className="shrink-0 text-[#a6542e]" size={24} />
            <div className="flex flex-col gap-0.5">
              <strong className="font-bold text-[#152321]">
                {profile
                  ? "Demo Aadhaar details ready"
                  : "Reviewer mode is on"}
              </strong>
              <span className="text-[11px] leading-relaxed text-[#5e6f68]">
                {profile
                  ? "Your fictional details can prefill matching service fields."
                  : "All records and services are simulated."}
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Main Dashboard Layout */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[1fr_300px]">
        <section className="space-y-8">
          <div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0f7655]">
                  Continue where you left off
                </span>
                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#152321]">
                  {hasApp
                    ? "Your submitted application"
                    : "Learner Licence application"}
                </h2>
              </div>
              <span className="rounded-full bg-[#e7f4ed] px-3 py-1 text-xs font-extrabold text-[#0d5c45]">
                {hasApp ? "Appointment scheduled" : "Draft"}
              </span>
            </div>

            <article className="mt-4 grid grid-cols-1 gap-6 rounded-2xl border border-[#dce8e5] bg-white p-6 shadow-sm md:grid-cols-[1fr_260px]">
              <div className="flex gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#ddf3ef] text-[#167c74]">
                  <Landmark size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#0f7655]">
                    Learner Licence · Maharashtra
                  </p>
                  <h3 className="my-1 text-xl font-bold text-[#152321]">
                    {hasApp
                      ? "Application submitted"
                      : progress
                      ? `${progress}% complete`
                      : "Ready to begin"}
                  </h3>
                  <p className="text-xs leading-relaxed text-[#5e6f68]">
                    {hasApp
                      ? "Your documents passed the mock check. Your next step is the appointment."
                      : "Your progress is saved automatically on this device."}
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-3 md:items-end">
                {!hasApp && (
                  <div className="w-full">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full bg-[#167c74] transition-all"
                        style={{ width: `${Math.max(progress, 6)}%` }}
                      />
                    </div>
                    <span className="mt-1.5 block text-right text-[11px] font-medium text-[#5e6f68]">
                      {Math.max(progress, 0)}% complete
                    </span>
                  </div>
                )}
                <Link
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#167c74] px-5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#126b64] md:w-auto"
                  href={hasApp ? "/track" : "/apply/learner-licence"}
                >
                  {hasApp ? "Track application" : "Continue application"}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          </div>

          <div>
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#0f7655]">
                Quick services
              </p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#152321]">
                What do you need help with?
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {quick.map((service) => {
                const Icon = service.i;
                return (
                  <Link
                    key={service.t}
                    href={service.h}
                    className="group flex items-center gap-3.5 rounded-xl border border-[#dce8e5] bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-[#167c74] hover:shadow-sm"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#ddf3ef] text-[#167c74]">
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <strong className="block text-xs font-bold text-[#152321] group-hover:text-[#167c74]">
                        {service.t}
                      </strong>
                      <span className="text-[11px] text-[#5e6f68]">
                        {service.d}
                      </span>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-[#167c74]"
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Sidebar updates */}
        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-[#167c74] bg-[#167c74] p-5 text-white shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ddf3ef]">
              <FileCheck2 size={16} />
              Reviewer note
            </div>
            <strong className="mt-3 block text-base font-bold">
              Local browser storage
            </strong>
            <p className="mt-1 text-xs leading-relaxed text-[#c6ddd5]">
              Applications and drafts are preserved in your browser until you
              reset them.
            </p>
            <Link
              href="/apply/learner-licence"
              className="mt-3 inline-block text-xs font-bold text-white underline underline-offset-4 hover:text-[#ddf3ef]"
            >
              Open guided application →
            </Link>
          </div>

          <div className="rounded-2xl border border-[#dce8e5] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0f7655]">
              <CalendarDays size={16} />
              Live simulated updates
            </div>
            <ul className="mt-3 divide-y divide-slate-100 text-xs">
              <li className="flex gap-2.5 py-3">
                <i className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#167c74]" />
                <div>
                  <strong className="block font-bold text-[#152321]">
                    Document check complete
                  </strong>
                  <span className="text-[11px] text-[#5e6f68]">
                    Synthetic records passed demonstration check
                  </span>
                </div>
              </li>
              <li className="flex gap-2.5 py-3">
                <i className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#e87343]" />
                <div>
                  <strong className="block font-bold text-[#152321]">
                    Simulated appointment
                  </strong>
                  <span className="text-[11px] text-[#5e6f68]">
                    {appointment.dayName[0] + appointment.dayName.slice(1).toLowerCase()}, {appointment.day} Aug at {appointment.time} · {application?.rto || "Sangli RTO"}
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

