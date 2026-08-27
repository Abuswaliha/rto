"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "./safe-link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Home,
  IdCard,
  Info,
  Landmark,
  Loader2,
  LockKeyhole,
  Save,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import Image from "next/image";
import { LanguageSwitcher } from "./language-provider";
import {
  Draft,
  createDemoAadhaarProfile,
  DEMO_AADHAAR_NUMBER,
  emptyDraft,
  loadDraft,
  newAppointmentId,
  newApplicationId,
  newPaymentReference,
  saveApplication,
  saveDemoProfile,
  saveDraft,
} from "@/lib/storage";
import { appointmentParts, appointmentSlots } from "@/lib/appointment";

const steps = [
  "Demo Aadhaar",
  "Eligibility",
  "Personal details",
  "Address & RTO",
  "Documents",
  "Appointment",
  "Review",
  "Test payment",
];

const renderOptions = (
  values: string[],
  value: string,
  set: (v: string) => void,
  locked = false
) => (
  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
    {values.map((v) => {
      const selected = value === v;
      return (
        <button
          type="button"
          disabled={locked}
          className={`flex items-center gap-3 rounded-xl border p-3 text-left text-xs font-bold transition-all ${locked ? "cursor-not-allowed opacity-70" : ""} ${
            selected
              ? "border-[#167c74] bg-[#edf7f4] text-[#167c74] shadow-sm ring-2 ring-[#167c74]/20"
              : `border-[#d0e2dc] bg-white text-[#263a33] ${locked ? "" : "hover:border-[#167c74] hover:bg-[#f4fbf8]"}`
          }`}
          onClick={() => set(v)}
          key={v}
        >
          <span
            className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] ${
              selected
                ? "border-[#167c74] bg-[#167c74] text-white"
                : "border-[#b8d4cb] bg-white"
            }`}
          >
            {selected && <Check size={12} />}
          </span>
          <span className="leading-snug">{v}</span>
        </button>
      );
    })}
  </div>
);

export function LearnerFlow() {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [assistant, setAssistant] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [aadhaarLookup, setAadhaarLookup] = useState<"idle" | "loading" | "found" | "error">("idle");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDraft(loadDraft());
      setLoaded(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    queueMicrotask(() => setSaving(true));
    const timer = setTimeout(() => {
      saveDraft(draft);
      setSaving(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [draft, loaded]);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const valid = useMemo(
    () =>
      [
        draft.aadhaarVerified,
        Boolean(draft.age && draft.vehicle),
        Boolean(draft.fullName && draft.guardian && draft.gender),
        Boolean(draft.address && draft.pincode.length === 6 && draft.rto),
        draft.documents.length >= 3,
        Boolean(draft.appointment),
        draft.declaration,
        Boolean(draft.payment),
      ][draft.step],
    [draft]
  );

  function next() {
    if (!valid) {
      setError("Complete the required information before continuing.");
      return;
    }
    setError("");
    if (draft.step < 7) {
      update("step", draft.step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      const id = newApplicationId();
      const paymentReference = newPaymentReference();
      saveApplication({
        id,
        status: "appointment-scheduled",
        appointment: draft.appointment,
        rto: draft.rto,
        submittedAt: new Date().toISOString(),
        fullName: draft.fullName,
        appointmentId: newAppointmentId(),
        paymentReference,
        paymentMethod: draft.payment,
        feeTotal: "₹170 Demo",
        identity: `${draft.identity} · XXXX 1234`,
        dob: draft.dob,
        guardian: draft.guardian,
        gender: draft.gender,
        address: draft.address,
        city: draft.city,
        pincode: draft.pincode,
        state: draft.state,
        vehicle: draft.vehicle,
        documents: draft.documents,
      });
      setProcessing(false);
      router.push(`/track?submitted=${id}`);
    }, 1300);
  }

  function detectDemoAadhaar(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 12);
    setDraft((current) => ({ ...current, aadhaar: digits, aadhaarVerified: false }));
    setError("");
    if (digits.length < 12) {
      setAadhaarLookup("idle");
      return;
    }
    if (digits !== DEMO_AADHAAR_NUMBER) {
      setAadhaarLookup("error");
      return;
    }
    setAadhaarLookup("loading");
    window.setTimeout(() => {
      const profile = createDemoAadhaarProfile();
      saveDemoProfile(profile);
      setDraft((current) => ({
        ...current,
        identity: "Demo Aadhaar",
        aadhaar: profile.aadhaar,
        aadhaarVerified: true,
        dob: profile.dob,
        age: String(profile.age),
        mobile: profile.mobile,
        fullName: profile.fullName,
        gender: profile.gender,
        pincode: profile.pincode,
        city: profile.city,
        address: profile.address,
        state: profile.state,
        rto: profile.suggestedRto,
      }));
      setAadhaarLookup("found");
    }, 500);
  }

  function back() {
    if (draft.step > 0) {
      update("step", draft.step - 1);
      setError("");
    }
  }

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7fbfa] text-sm font-bold text-[#167c74]">
        <Loader2 className="mr-2 animate-spin" size={20} /> Restoring your saved draft…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f9f7] text-[#152321]">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#dce8e5] bg-white px-4 shadow-xs md:px-8">
        <Link href="/dashboard" className="flex items-center gap-3 no-underline">
          <Image
            src="/smart-rto-icon.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-xl object-contain"
          />
          <span className="flex flex-col text-sm font-black text-[#152321] leading-tight">
            Smart RTO
            <small className="text-[10px] font-semibold text-[#5e6f68] uppercase tracking-wider">
              Citizen portal
            </small>
          </span>
        </Link>

        <div className="hidden items-center gap-2 sm:flex">
          <span className="rounded-md bg-[#fff1eb] px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#a64524]">
            Demo / Mock service
          </span>
          <strong className="text-xs font-extrabold text-[#152321]">Learner Licence Application</strong>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher compact />
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#dce8e5] bg-white px-3 py-1.5 text-xs font-bold text-[#5e6f68] transition-colors hover:bg-slate-50"
          >
            <Save size={14} /> Save & exit
          </Link>
        </div>
      </header>

      {/* Main Flow Layout */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 md:px-6 lg:grid-cols-[260px_1fr_260px]">
        {/* Step Progress Sidebar */}
        <aside className="rounded-3xl border border-[#dce8e5] bg-white p-5 shadow-xs h-fit">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-wider text-[#0f7655]">
            Application progress
          </p>
          <ol className="space-y-2">
            {steps.map((s, i) => {
              const done = i < draft.step;
              const active = i === draft.step;
              return (
                <li
                  key={s}
                  className={`flex items-center gap-3 rounded-xl p-2.5 text-xs font-bold transition-all ${
                    active
                      ? "bg-[#167c74] text-white shadow-sm"
                      : done
                      ? "bg-[#edf7f4] text-[#0d5c45]"
                      : "text-slate-400"
                  }`}
                >
                  <i
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-black not-italic ${
                      active
                        ? "bg-white text-[#167c74]"
                        : done
                        ? "bg-[#0d5c45] text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {done ? <Check size={13} /> : i + 1}
                  </i>
                  <span className="flex flex-col leading-tight">
                    <span>{s}</span>
                    <small
                      className={`text-[9px] font-semibold ${
                        active
                          ? "text-white/80"
                          : done
                          ? "text-[#0d5c45]/70"
                          : "text-slate-400"
                      }`}
                    >
                      {done ? "Complete" : active ? "In progress" : "Not started"}
                    </small>
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#edf7f4] p-3 text-xs text-[#0f7655]">
            <Clock3 size={20} className="shrink-0 text-[#167c74]" />
            <div>
              <strong className="block font-extrabold">About {Math.max(2, 8 - draft.step)} min left</strong>
              <span className="text-[10px] text-[#5e6f68]">Draft saves automatically</span>
            </div>
          </div>
        </aside>

        {/* Main Form Content */}
        <main className="min-w-0 space-y-6">
          {/* Mobile Progress Bar */}
          <div className="rounded-2xl border border-[#dce8e5] bg-white p-4 shadow-xs lg:hidden">
            <div className="flex justify-between text-xs font-bold text-[#152321]">
              <span>Step {draft.step + 1} of 8</span>
              <span className="text-[#167c74]">{steps[draft.step]}</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-[#167c74] transition-all duration-300"
                style={{ width: `${((draft.step + 1) / 8) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Header Title */}
          <div className="rounded-3xl border border-[#dce8e5] bg-white p-6 shadow-xs sm:p-8">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#0f7655]">
              Step {draft.step + 1} of 8
            </span>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-[#152321] md:text-3xl">
              {stepTitle(draft.step)}
            </h1>
            <p className="mt-2 text-xs font-medium leading-relaxed text-[#5e6f68]">
              {stepCopy(draft.step)}
            </p>

            {/* Step Body */}
            <div className="mt-6 space-y-5 border-t border-slate-100 pt-6">
              {renderStep(draft, update, detectDemoAadhaar, aadhaarLookup)}

              {error && (
                <div className="flex items-center gap-2.5 rounded-2xl border border-[#f5d1c2] bg-[#fff5f1] p-4 text-xs font-bold text-[#a64524]" role="alert">
                  <Info size={18} className="shrink-0" />
                  {error}
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#dce8e5] bg-white px-5 text-xs font-bold text-[#152321] transition-colors hover:bg-slate-50 disabled:opacity-40"
                onClick={back}
                disabled={draft.step === 0}
              >
                <ArrowLeft size={16} /> Back
              </button>

              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#0d5c45]">
                {saving ? (
                  <>
                    <Loader2 className="animate-spin text-[#167c74]" size={15} /> Saving…
                  </>
                ) : (
                  <>
                    <Check size={15} className="text-[#0d5c45]" /> Draft saved
                  </>
                )}
              </span>

              <button
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#167c74] px-6 text-xs font-bold text-white shadow-md shadow-[#167c74]/20 transition-all hover:bg-[#126b64] disabled:opacity-50"
                onClick={next}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Processing test payment…
                  </>
                ) : (
                  <>
                    {draft.step === 7 ? "Complete test payment" : "Save & continue"}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl bg-[#edf7f4] p-4 text-xs font-medium text-[#0f7655]">
            <Info size={17} className="shrink-0" />
            <span>Exact documents, fees and procedures can differ by state. This is a simplified demonstration flow.</span>
          </div>
        </main>

        {/* Right Help Rail / Assistant */}
        <aside className="space-y-5 h-fit">
          <div className="rounded-3xl border border-[#cfe3dd] bg-gradient-to-br from-[#edf7f4] to-white p-6 shadow-xs">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#0f7655]">
              <Sparkles size={16} /> Demo assistant
            </span>
            <h3 className="mt-2 text-base font-extrabold text-[#152321]">Need help with this step?</h3>
            <p className="mt-2 text-xs leading-relaxed text-[#5e6f68]">
              {assistant
                ? assistantCopy(draft.step)
                : "Get a plain-language explanation using only this mock application context."}
            </p>
            <button
              type="button"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#167c74] bg-white py-2.5 text-xs font-bold text-[#167c74] transition-colors hover:bg-[#ddf3ef]"
              onClick={() => setAssistant((v) => !v)}
            >
              <Bot size={16} />
              {assistant ? "Hide explanation" : "Explain this step"}
            </button>
          </div>

          <div className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
            <LockKeyhole size={20} className="shrink-0 text-[#167c74] mt-0.5" />
            <div>
              <strong className="block text-xs font-extrabold text-[#152321]">Your privacy</strong>
              <p className="mt-1 text-xs text-[#5e6f68]">Do not enter real Aadhaar, PAN or document details.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function field(label: string, required = true, help?: string) {
  return (
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-xs font-bold text-[#152321]">
        {label} {required && <span className="ml-1 font-bold text-red-500">*</span>}
      </span>
      {help && (
        <button
          type="button"
          aria-label={`Why ${label} is needed`}
          title={help}
          className="text-[#167c74] hover:text-[#126b64]"
        >
          <CircleHelp size={15} />
        </button>
      )}
    </div>
  );
}

function renderStep(
  d: Draft,
  u: <K extends keyof Draft>(k: K, v: Draft[K]) => void,
  detectAadhaar: (value: string) => void,
  aadhaarLookup: "idle" | "loading" | "found" | "error"
) {
  switch (d.step) {
    case 0:
      return (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-2xl border border-[#f5d1c2] bg-[#fff5f1] p-4 text-xs font-semibold text-[#a64524]">
            <LockKeyhole size={20} className="shrink-0" />
            <div>
              <strong className="block font-extrabold">Fictional demo Aadhaar only</strong>
              <p className="mt-0.5 text-[#5e6f68]">No UIDAI or government system is contacted. Never enter a real Aadhaar number.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#b9dfd4] bg-[#edf8f5] p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div><span className="text-[10px] font-bold uppercase tracking-wider text-[#5e6f68]">Seeded reviewer number</span><strong className="mt-1 block text-xl font-black tracking-[0.14em] text-[#152321]">9999 8888 7777</strong></div>
              <button type="button" className="rounded-xl border border-[#167c74] bg-white px-4 py-2 text-xs font-bold text-[#0f7655] hover:bg-[#ddf3ef]" onClick={() => detectAadhaar(DEMO_AADHAAR_NUMBER)}>Use demo Aadhaar</button>
            </div>
          </div>

          <label className="block">
            {field("Demo Aadhaar number")}
            <div className="relative">
              <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#167c74]" size={18} />
              <input
                aria-describedby="learner-aadhaar-help"
                value={d.aadhaar.replace(/(.{4})(?=.)/g, "$1 ")}
                onChange={(event) => detectAadhaar(event.target.value)}
                inputMode="numeric"
                placeholder="9999 8888 7777"
                className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm font-bold tracking-wider outline-none focus:ring-4 ${aadhaarLookup === "error" ? "border-[#d96b48] focus:ring-[#fff1eb]" : "border-[#cbdad6] focus:border-[#167c74] focus:ring-[#ddf3ef]"}`}
              />
              {aadhaarLookup === "loading" ? <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-[#167c74]" size={18} /> : null}
            </div>
            <small id="learner-aadhaar-help" className="mt-1.5 block text-[11px] text-[#5e6f68]">Details are detected automatically when all 12 digits match the fictional number above.</small>
          </label>

          {aadhaarLookup === "error" ? <p className="rounded-xl bg-[#fff1eb] p-3 text-xs font-bold text-[#a64524]" role="alert">No fictional citizen matches this number. Use 9999 8888 7777 only.</p> : null}

          {d.aadhaarVerified && aadhaarLookup === "found" ? (
            <div className="rounded-2xl border border-[#b9dfd4] bg-[#edf8f5] p-5" aria-live="polite">
              <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-[#0d5c45]" size={22} /><div><strong className="block text-sm font-extrabold text-[#152321]">Demo Citizen found and fields filled</strong><p className="mt-1 text-xs leading-5 text-[#5e6f68]">Name, birth date, age, gender, mobile, address, city, PIN code, state and suggested RTO are now pre-filled.</p></div></div>
              <dl className="mt-4 grid gap-3 border-t border-[#cfe3dd] pt-4 text-xs sm:grid-cols-2"><div><dt className="text-[#5e6f68]">Citizen</dt><dd className="font-bold text-[#152321]">{d.fullName}</dd></div><div><dt className="text-[#5e6f68]">Date of birth</dt><dd className="font-bold text-[#152321]">{d.dob}</dd></div><div><dt className="text-[#5e6f68]">Mobile</dt><dd className="font-bold text-[#152321]">{d.mobile}</dd></div><div><dt className="text-[#5e6f68]">Suggested RTO</dt><dd className="font-bold text-[#152321]">{d.rto}</dd></div></dl>
            </div>
          ) : null}
        </div>
      );

    case 1:
      return (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-2xl bg-[#edf7f4] p-4 text-xs font-semibold text-[#0f7655]">
            <ShieldCheck size={20} className="shrink-0 text-[#167c74]" />
            <div>
              <strong className="block font-extrabold">Quick eligibility check</strong>
              <p className="mt-0.5 text-[#5e6f68]">Your age and state were filled from the fictional demo record.</p>
            </div>
          </div>

          <label className="block">
            {field("State")}
            <select value={d.state} disabled={d.aadhaarVerified} onChange={(event) => u("state", event.target.value)} className="h-11 w-full cursor-not-allowed rounded-xl border border-[#d8e0dd] bg-slate-100 px-3.5 text-xs font-semibold text-[#52635d] outline-none disabled:opacity-100"><option>Maharashtra</option><option>Karnataka</option><option>Delhi</option></select>
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              {field("Your age")}
              <input value={d.age} readOnly={d.aadhaarVerified} onChange={(event) => u("age", event.target.value.replace(/\D/g, "").slice(0, 2))} inputMode="numeric" className="h-11 w-full cursor-not-allowed rounded-xl border border-[#d8e0dd] bg-slate-100 px-3.5 text-xs font-semibold text-[#52635d] outline-none" />
            </label>
            <label className="block">
              {field("Purpose")}
              <select className="h-11 w-full rounded-xl border border-[#cbdad6] bg-white px-3.5 text-xs font-semibold outline-none focus:border-[#167c74] focus:ring-4 focus:ring-[#ddf3ef]"><option>New Learner Licence</option></select>
            </label>
          </div>

          <div>{field("Vehicle category you want to learn", true, "This means the type of vehicle you want permission to learn to drive.")}{renderOptions(["Motorcycle with gear", "Light Motor Vehicle — Car", "Motorcycle and Car"], d.vehicle, (value) => u("vehicle", value))}</div>

          {d.age && d.vehicle ? <div className="flex items-center gap-2.5 rounded-2xl bg-[#e7f4ed] p-4 text-xs font-bold text-[#0d5c45]"><CheckCircle2 size={18} className="shrink-0" /><span>Based on this demo information, you are eligible to continue.</span></div> : null}
        </div>
      );

    case 2:
      return (
        <div className="space-y-5">
          <div className="flex items-center gap-2.5 rounded-2xl bg-[#edf7f4] p-4 text-xs font-semibold text-[#0f7655]">
            <LockKeyhole size={18} className="shrink-0 text-[#167c74]" />
            <span><strong>Verified demo Aadhaar fields are locked</strong> · Return to the first step to use a different fictional record.</span>
          </div>

          <label className="block">
            {field("Full name")}
            <input
              value={d.fullName}
              readOnly={d.aadhaarVerified}
              onChange={(e) => u("fullName", e.target.value)}
              placeholder="As shown on your demo proof"
              className="h-11 w-full cursor-not-allowed rounded-xl border border-[#d8e0dd] bg-slate-100 px-3.5 text-xs font-semibold text-[#52635d] outline-none"
            />
          </label>

          <label className="block">
            {field("Parent or guardian name")}
            <input
              value={d.guardian}
              onChange={(e) => u("guardian", e.target.value)}
              placeholder="Enter a fictional name"
              className="h-11 w-full rounded-xl border border-[#cbdad6] bg-white px-3.5 text-xs font-semibold outline-none focus:border-[#167c74] focus:ring-4 focus:ring-[#ddf3ef]"
            />
          </label>

          <div>
            {field("Gender")}
            {renderOptions(
              ["Woman", "Man", "Non-binary", "Prefer not to say"],
              d.gender,
              (v) => u("gender", v),
              d.aadhaarVerified
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              {field("Place of birth", false)}
              <input
                placeholder="For example, Sangli"
                className="h-11 w-full rounded-xl border border-[#cbdad6] bg-white px-3.5 text-xs font-semibold outline-none focus:border-[#167c74] focus:ring-4 focus:ring-[#ddf3ef]"
              />
            </label>
            <label className="block">
              {field("Blood group", false)}
              <select className="h-11 w-full rounded-xl border border-[#cbdad6] bg-white px-3.5 text-xs font-semibold outline-none focus:border-[#167c74] focus:ring-4 focus:ring-[#ddf3ef]">
                <option value="">Prefer not to say</option>
                <option>O+</option>
                <option>A+</option>
                <option>B+</option>
              </select>
            </label>
          </div>
        </div>
      );

    case 3:
      return (
        <div className="space-y-5">
          <div className="flex items-center gap-2.5 rounded-2xl bg-[#edf7f4] p-4 text-xs font-semibold text-[#0f7655]"><LockKeyhole size={18} className="shrink-0 text-[#167c74]" /><span><strong>Address and RTO came from the verified demo record</strong> · These fields cannot be edited.</span></div>
          <label className="block">
            {field("PIN code")}
            <input
              value={d.pincode}
              readOnly={d.aadhaarVerified}
              onChange={(e) => u("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              className="h-11 w-full cursor-not-allowed rounded-xl border border-[#d8e0dd] bg-slate-100 px-3.5 text-xs font-semibold text-[#52635d] outline-none"
            />
          </label>

          {d.pincode.length === 6 && (
            <div className="flex items-center gap-3 rounded-2xl bg-[#edf7f4] p-4 text-xs font-semibold text-[#0f7655]">
              <Home size={20} className="shrink-0 text-[#167c74]" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#5e6f68]">Suggested demo location</span>
                <strong className="text-sm font-extrabold text-[#152321]">Maharashtra · Sangli</strong>
              </div>
            </div>
          )}

          <label className="block">
            {field("Present address")}
            <textarea
              value={d.address}
              readOnly={d.aadhaarVerified}
              onChange={(e) => u("address", e.target.value)}
              placeholder="House/building, street and locality"
              rows={3}
              className="w-full cursor-not-allowed resize-none rounded-xl border border-[#d8e0dd] bg-slate-100 p-3.5 text-xs font-semibold text-[#52635d] outline-none"
            />
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-[#152321]">
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-[#167c74]" />
            Permanent address is the same as present address
          </label>

          <div>
            {field("Choose your RTO")}
            {renderOptions(
              [
                "MH-10 Sangli RTO",
                "MH-12 Pune RTO",
                "MH-14 Pimpri-Chinchwad RTO",
              ],
              d.rto,
              (v) => u("rto", v),
              d.aadhaarVerified
            )}
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-[#edf7f4] p-4 text-xs text-[#0f7655]">
            <Landmark size={20} className="shrink-0 text-[#167c74] mt-0.5" />
            <div>
              <strong className="block text-sm font-extrabold text-[#152321]">{d.rto}</strong>
              <span className="text-[#5e6f68]">Approx. distance: Demo · Typical wait: Low · 12 mock slots available</span>
            </div>
          </div>
        </div>
      );

    case 4:
      return (
        <div className="space-y-5">
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-[#152321]">Documents needed</h3>
            <p className="text-xs text-[#5e6f68]">Upload synthetic files only. PDF, JPG or PNG up to 5 MB.</p>
            {[
              "Demo identity proof",
              "Demo address proof",
              "Demo passport photograph",
            ].map((name) => {
              const uploaded = d.documents.includes(name);
              return (
                <button
                  type="button"
                  key={name}
                  className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                    uploaded
                      ? "border-[#b9dfd4] bg-[#edf8f5]"
                      : "border-[#cbdad6] bg-white hover:border-[#167c74]"
                  }`}
                  onClick={() =>
                    u(
                      "documents",
                      uploaded
                        ? d.documents.filter((x) => x !== name)
                        : [...d.documents, name]
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs ${
                        uploaded ? "bg-[#0d5c45] text-white" : "bg-[#ddf3ef] text-[#167c74]"
                      }`}
                    >
                      {uploaded ? <Check size={16} /> : <UploadCloud size={16} />}
                    </span>
                    <div>
                      <strong className="block text-xs font-bold text-[#152321]">{name}</strong>
                      <small className="text-[11px] text-[#5e6f68]">
                        {uploaded ? "Demo file added · Quality check passed" : "Click to add a simulated file"}
                      </small>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-400" />
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-[#cfe3dd] bg-[#edf7f4] p-4 text-xs font-medium text-[#0f7655]">
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="shrink-0 text-[#167c74]" />
              <div>
                <strong className="block font-bold text-[#152321]">Demo OCR preview</strong>
                <span>We found: Demo Citizen · 15 Jan 2000 · Demo Address</span>
              </div>
            </div>
            <button
              type="button"
              className="rounded-xl border border-[#167c74] bg-white px-3 py-1.5 text-xs font-bold text-[#167c74] hover:bg-[#ddf3ef]"
            >
              Use details
            </button>
          </div>
        </div>
      );

    case 5:
      const selectedAppointment = appointmentParts(d.appointment || appointmentSlots[0]);
      return (
        <div className="space-y-5">
          <div className="rounded-2xl border border-[#b9dfd4] bg-[#edf8f5] p-4 text-xs text-[#0f7655]">
            <span className="rounded-md bg-[#167c74] px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">
              Recommended
            </span>
            <strong className="mt-2 block text-lg font-black text-[#152321]">{selectedAppointment.longDate}</strong>
            <p className="mt-0.5 text-[#5e6f68]">Expected wait: Low · Synthetic estimate</p>
          </div>

          <div>
            {field("Choose an appointment")}
            {renderOptions(
              [...appointmentSlots],
              d.appointment,
              (v) => u("appointment", v)
            )}
          </div>

          <div className="flex gap-4 text-xs font-semibold text-[#5e6f68]">
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#0d5c45]" /> Available</span>
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#e87343]" /> Limited</span>
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-slate-300" /> Full</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <b className="block text-base font-black text-[#152321]">27</b>
              <span className="text-[#5e6f68]">Thu</span>
              <small className="block mt-1 text-[10px] text-[#0d5c45]">12 slots</small>
            </div>
            <div className="rounded-xl border border-[#e87343]/30 bg-[#fff8f4] p-3">
              <b className="block text-base font-black text-[#152321]">28</b>
              <span className="text-[#5e6f68]">Fri</span>
              <small className="block mt-1 text-[10px] text-[#e87343]">3 slots</small>
            </div>
            <button type="button" onClick={() => u("appointment", "29 Aug · 11:20 AM")} className={`rounded-xl p-3 ${selectedAppointment.day === "29" ? "border-2 border-[#167c74] bg-[#edf7f4] text-[#167c74]" : "border border-slate-200 bg-white text-[#152321]"}`}>
              <b className="block text-base font-black">29</b>
              <span className="font-bold">Sat</span>
              <small className="mt-1 block text-[10px] font-bold">Rec.</small>
            </button>
            <button type="button" onClick={() => u("appointment", "30 Aug · 10:00 AM")} className={`rounded-xl p-3 ${selectedAppointment.day === "30" ? "border-2 border-[#167c74] bg-[#edf7f4] text-[#167c74]" : "border border-slate-200 bg-white text-[#152321]"}`}>
              <b className="block text-base font-black">30</b>
              <span className="font-bold">Sun</span>
              <small className="mt-1 block text-[10px]">8 slots</small>
            </button>
          </div>
        </div>
      );

    case 6:
      return (
        <div className="space-y-5">
          <div className="space-y-3">
            {[
              ["Identity", `${d.identity} · XXXX 1234`],
              ["Personal information", `${d.fullName} · ${d.dob}`],
              ["Address", `${d.address}, ${d.city} ${d.pincode}`],
              ["Vehicle category", d.vehicle],
              ["RTO", d.rto],
              ["Documents", `${d.documents.length} demo files added`],
              ["Appointment", d.appointment],
            ].map(([a, b], i) => (
              <div
                key={a}
                className="flex items-center justify-between rounded-2xl border border-[#dce8e5] bg-white p-4 text-xs shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <i className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#ddf3ef] font-extrabold not-italic text-[#167c74]">
                    {i + 1}
                  </i>
                  <div>
                    <strong className="block font-bold text-[#152321]">{a}</strong>
                    <span className="text-[#5e6f68]">{b}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-[#dce8e5] px-3 py-1.5 text-xs font-bold text-[#167c74] hover:bg-slate-50"
                  onClick={() => u("step", Math.min(i, 5))}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-[#cfe3dd] bg-[#edf7f4] p-4 text-xs font-medium text-[#152321]">
            <input
              type="checkbox"
              checked={d.declaration}
              onChange={(e) => u("declaration", e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded accent-[#167c74]"
            />
            <span>
              <strong className="block font-bold text-[#0d5c45]">Demo declaration</strong>
              I confirm the information entered is fictional or synthetic and correct for testing this prototype.
            </span>
          </label>
        </div>
      );

    default:
      return (
        <div className="space-y-5">
          <div className="rounded-2xl border border-[#cfe3dd] bg-[#f8fbf9] p-5 space-y-3">
            <span className="inline-block rounded-md bg-[#fff1eb] px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#a64524]">
              Test payment · No money will be charged
            </span>
            <h3 className="text-lg font-black text-[#152321]">Application fee breakdown</h3>
            <div className="flex justify-between text-xs text-[#5e6f68]">
              <span>Learner Licence fee</span>
              <strong className="text-[#152321]">₹150 Demo</strong>
            </div>
            <div className="flex justify-between text-xs text-[#5e6f68]">
              <span>Service fee</span>
              <strong className="text-[#152321]">₹20 Demo</strong>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-sm font-extrabold text-[#152321]">
              <span>Total Payable</span>
              <strong className="text-[#0d5c45]">₹170 Demo</strong>
            </div>
          </div>

          <div>
            {field("Choose a test payment method")}
            {renderOptions(
              ["Demo UPI", "Demo Card", "Demo Net Banking"],
              d.payment,
              (v) => u("payment", v)
            )}
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-[#edf7f4] p-4 text-xs text-[#0f7655]">
            <ShieldCheck size={20} className="shrink-0 text-[#167c74]" />
            <span>
              <strong>Simulated payment only.</strong> No money, bank account or card information is collected.
            </span>
          </div>
        </div>
      );
  }
}

function stepTitle(i: number) {
  return [
    "Find and fill your demo details",
    "Let’s check if you can continue",
    "Tell us about the applicant",
    "Confirm your address and RTO",
    "Add demonstration documents",
    "Choose your appointment",
    "Review everything carefully",
    "Complete the test payment",
  ][i];
}

function stepCopy(i: number) {
  return [
    "Enter the seeded fictional Aadhaar number and matching fields will fill automatically.",
    "Confirm the pre-filled age and choose the vehicle category you want to learn.",
    "We have pre-filled what we already know so you do not need to type it again.",
    "Enter your PIN code and we will suggest a nearby demo RTO.",
    "A short checklist helps you add the right synthetic files.",
    "Pick a clearly labelled mock slot that works for you.",
    "Check each section and fix only what needs changing.",
    "No money will be charged and no payment details are collected.",
  ][i];
}

function assistantCopy(i: number) {
  return [
    "Use only 9999 8888 7777. When all 12 digits are entered, this prototype finds the local fictional citizen and fills matching fields. No UIDAI service is contacted.",
    "Review the state and calculated age, then choose the kind of vehicle you want to learn. This is only a demo eligibility hint.",
    "Add a fictional guardian name and choose a gender option. Optional details can be skipped.",
    "Your demo PIN suggests Sangli and MH-10. You can select another mock office.",
    "Add all three simulated documents. Nothing is uploaded to a server.",
    "The recommended slot has a low synthetic wait estimate. Choose any available mock time.",
    "Review each summary card. The declaration confirms this is fictional demo information.",
    "Select any demo method, then complete the test payment. No money will move.",
  ][i];
}
