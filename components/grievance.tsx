"use client";

import { useState } from "react";
import { CheckCircle2, MessageSquareWarning, ShieldCheck } from "lucide-react";
import { PageShell } from "./page-shell";

export function Grievance() {
  const [done, setDone] = useState(false);
  const [category, setCategory] = useState("");
  const [details, setDetails] = useState("");

  return (
    <PageShell>
      <section className="border-b border-[#dce8e5] bg-gradient-to-br from-[#f7fbfa] via-white to-[#ddf3ef] py-14">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#167c74] text-white shadow-md">
            <MessageSquareWarning size={28} />
          </span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[#0f7655]">
            Mock Grievance Service
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#152321] md:text-3xl">
            {done ? "Grievance submitted" : "Tell us what went wrong"}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[#5e6f68]">
            {done
              ? "Your fictional service issue has been recorded for this prototype demonstration."
              : "Choose a category, describe your issue, and submit a test grievance ticket."}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-12">
        {done ? (
          <div className="rounded-3xl border border-[#b9dfd4] bg-[#f1faf7] p-8 text-center shadow-md">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#167c74] text-white shadow-md">
              <CheckCircle2 size={36} />
            </div>
            <span className="mt-4 inline-block rounded-full bg-[#e7f4ed] px-3 py-1 text-xs font-bold text-[#0d5c45]">
              Ticket Created
            </span>
            <h2 className="mt-3 text-3xl font-black text-[#152321]">GRV-2026-00381</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#5e6f68]">
              Your grievance has been logged in demo state. No actual government department receives this request.
            </p>
            <button
              className="mt-6 rounded-xl bg-[#167c74] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#126b64]"
              type="button"
              onClick={() => {
                setDone(false);
                setCategory("");
                setDetails("");
              }}
            >
              Raise another demo issue
            </button>
          </div>
        ) : (
          <div className="space-y-6 rounded-3xl border border-[#dce8e5] bg-white p-6 shadow-sm md:p-8">
            <label className="block">
              <span className="mb-2 flex items-center justify-between text-sm font-bold text-[#152321]">
                <span>Issue category <span className="font-bold text-red-500">*</span></span>
              </span>
              <select
                className="h-12 w-full rounded-xl border border-[#cbdad6] bg-[#f8fbf9] px-4 text-sm font-semibold text-[#152321] outline-none transition-all focus:border-[#167c74] focus:bg-white focus:ring-4 focus:ring-[#ddf3ef]"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="">Select an issue category...</option>
                <option value="Application problem">Application status delay</option>
                <option value="Appointment problem">Appointment booking error</option>
                <option value="Document issue">Document verification objection</option>
                <option value="Challan issue">Challan payment discrepancy</option>
                <option value="Payment problem">Test transaction issue</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 flex items-center justify-between text-sm font-bold text-[#152321]">
                <span>What happened? <span className="font-bold text-red-500">*</span></span>
              </span>
              <textarea
                className="w-full resize-y rounded-xl border border-[#cbdad6] bg-[#f8fbf9] p-4 text-sm font-medium text-[#152321] outline-none transition-all focus:border-[#167c74] focus:bg-white focus:ring-4 focus:ring-[#ddf3ef]"
                rows={6}
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                placeholder="Explain the issue using synthetic demonstration data only..."
              />
            </label>

            <div className="flex items-center gap-2 text-xs text-[#5e6f68]">
              <ShieldCheck size={16} className="text-[#167c74]" />
              <span>Do not enter sensitive personal numbers or passwords.</span>
            </div>

            <button
              type="button"
              className="w-full rounded-xl bg-[#167c74] py-3.5 text-sm font-bold text-white shadow-md shadow-[#167c74]/20 transition-all hover:bg-[#126b64] disabled:cursor-not-allowed disabled:bg-[#9db5af] disabled:shadow-none"
              disabled={!category || !details.trim()}
              onClick={() => setDone(true)}
            >
              Review and Submit Demo Grievance
            </button>
          </div>
        )}
      </div>
    </PageShell>
  );
}
