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
  Info,
  Landmark,
  Loader2,
  LockKeyhole,
  Save,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import {
  Draft,
  emptyDraft,
  loadDraft,
  newApplicationId,
  saveApplication,
  saveDraft,
} from "@/lib/storage";

const steps = [
  "Eligibility",
  "Identity",
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
  set: (v: string) => void
) => (
  <div className="choice-grid">
    {values.map((v) => (
      <button
        type="button"
        className={`choice ${value === v ? "selected" : ""}`}
        onClick={() => set(v)}
        key={v}
      >
        <span className="radio">{value === v && <Check size={14} />}</span>
        {v}
      </button>
    ))}
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
        Boolean(draft.age && draft.vehicle),
        Boolean(draft.mobile.length === 10 && draft.otp === "123456"),
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
      saveApplication({
        id,
        status: "appointment-scheduled",
        appointment: draft.appointment,
        rto: draft.rto,
        submittedAt: new Date().toISOString(),
        fullName: draft.fullName,
      });
      setProcessing(false);
      router.push(`/track?submitted=${id}`);
    }, 1300);
  }

  function back() {
    if (draft.step > 0) {
      update("step", draft.step - 1);
      setError("");
    }
  }

  if (!loaded) {
    return (
      <div className="flow-loading">
        <Loader2 className="spin" /> Restoring your saved draft…
      </div>
    );
  }

  return (
    <div className="application-shell">
      {/* Top Application Header */}
      <header className="application-top">
        <Link href="/dashboard" className="brand">
          <span className="brand-mark">SR</span>
          <span>
            Smart RTO<small>Citizen portal</small>
          </span>
        </Link>
        <div className="application-title">
          <span className="badge">Demo / Mock service</span>
          <strong>Learner Licence</strong>
        </div>
        <Link href="/dashboard" className="save-exit">
          <Save /> Save & exit
        </Link>
      </header>

      {/* Main Flow Grid */}
      <div className="flow-grid">
        {/* Step Progress Sidebar */}
        <aside className="step-sidebar">
          <p>Application progress</p>
          <ol>
            {steps.map((s, i) => (
              <li
                key={s}
                className={
                  i < draft.step
                    ? "complete"
                    : i === draft.step
                    ? "current"
                    : ""
                }
              >
                <i>{i < draft.step ? <Check /> : i + 1}</i>
                <span>
                  {s}
                  <small>
                    {i < draft.step
                      ? "Complete"
                      : i === draft.step
                      ? "In progress"
                      : "Not started"}
                  </small>
                </span>
              </li>
            ))}
          </ol>
          <div className="time-card">
            <Clock3 />
            <div>
              <strong>About {Math.max(2, 8 - draft.step)} min left</strong>
              <span>Your draft saves automatically.</span>
            </div>
          </div>
        </aside>

        {/* Form Main Content */}
        <main className="form-main">
          <div className="mobile-progress">
            <span>
              Step {draft.step + 1} of 8 · {steps[draft.step]}
            </span>
            <div className="progress-track">
              <span style={{ width: `${((draft.step + 1) / 8) * 100}%` }} />
            </div>
          </div>

          <div className="form-head">
            <p className="eyebrow">Step {draft.step + 1} of 8</p>
            <h1>{stepTitle(draft.step)}</h1>
            <p>{stepCopy(draft.step)}</p>
          </div>

          <div className="form-card">
            {renderStep(draft, update)}
            {error && (
              <div className="form-error" role="alert">
                <Info />
                {error}
              </div>
            )}
          </div>

          <div className="flow-actions">
            <button
              type="button"
              className="button secondary"
              onClick={back}
              disabled={draft.step === 0}
            >
              <ArrowLeft />
              Back
            </button>
            <span className="save-status">
              {saving ? (
                <>
                  <Loader2 className="spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Check />
                  Draft saved
                </>
              )}
            </span>
            <button
              type="button"
              className="button primary"
              onClick={next}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="spin" />
                  Processing test payment…
                </>
              ) : (
                <>
                  {draft.step === 7 ? "Complete test payment" : "Save & continue"}
                  <ArrowRight />
                </>
              )}
            </button>
          </div>

          <div className="state-notice">
            <Info />
            Exact documents, fees and procedures can differ by state. This is a
            simplified demonstration flow.
          </div>
        </main>

        {/* Right Help Rail / Assistant */}
        <aside className="help-rail">
          <div className="assistant-card">
            <span>
              <Sparkles />
              Demo assistant
            </span>
            <h3>Need help with this step?</h3>
            <p>
              {assistant
                ? assistantCopy(draft.step)
                : "Get a plain-language explanation using only this mock application context."}
            </p>
            <button type="button" onClick={() => setAssistant((v) => !v)}>
              <Bot />
              {assistant ? "Hide explanation" : "Explain this step"}
            </button>
          </div>
          <div className="privacy-card">
            <LockKeyhole />
            <div>
              <strong>Your privacy</strong>
              <p>Do not enter real Aadhaar, PAN or document details.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function field(label: string, required = true, help?: string) {
  return (
    <div className="field-label">
      <span>
        {label} {required && <b>Required</b>}
      </span>
      {help && (
        <button
          type="button"
          aria-label={`Why ${label} is needed`}
          title={help}
        >
          <CircleHelp />
        </button>
      )}
    </div>
  );
}

function renderStep(
  d: Draft,
  u: <K extends keyof Draft>(k: K, v: Draft[K]) => void
) {
  switch (d.step) {
    case 0:
      return (
        <>
          <div className="inline-banner">
            <ShieldCheck />
            <div>
              <strong>Quick eligibility check</strong>
              <p>
                This guidance is for demonstration only and is not legal advice.
              </p>
            </div>
          </div>
          <label>
            {field("State")}
            <select
              value={d.state}
              onChange={(e) => u("state", e.target.value)}
            >
              <option>Maharashtra</option>
              <option>Karnataka</option>
              <option>Delhi</option>
            </select>
          </label>
          <div className="two-col">
            <label>
              {field("Your age")}
              <input
                value={d.age}
                onChange={(e) =>
                  u("age", e.target.value.replace(/\D/g, "").slice(0, 2))
                }
                inputMode="numeric"
                placeholder="For example, 26"
              />
            </label>
            <label>
              {field("Purpose")}
              <select>
                <option>New Learner Licence</option>
              </select>
            </label>
          </div>
          {field(
            "Vehicle category you want to learn",
            true,
            "This means the type of vehicle you want permission to learn to drive."
          )}
          {renderOptions(
            [
              "Motorcycle with gear",
              "Light Motor Vehicle — Car",
              "Motorcycle and Car",
            ],
            d.vehicle,
            (v) => u("vehicle", v)
          )}
          {d.age && d.vehicle && (
            <div className="success-banner">
              <CheckCircle2 />
              <span>Based on this demo information, you can continue.</span>
            </div>
          )}
        </>
      );

    case 1:
      return (
        <>
          <div className="privacy-warning">
            <LockKeyhole />
            <div>
              <strong>Use fictional information only</strong>
              <p>
                This prototype never verifies identity with a government system.
              </p>
            </div>
          </div>
          {field("Demo identity type")}
          {renderOptions(
            ["Demo Aadhaar", "Demo PAN", "Other demo proof"],
            d.identity,
            (v) => u("identity", v)
          )}
          <label>
            {field("Masked demo identity number")}
            <input
              value={
                d.identity === "Demo PAN" ? "ABCDE1234F" : "XXXX XXXX 1234"
              }
              readOnly
            />
            <small className="help-text">
              Pre-filled synthetic value. Real identity numbers are not
              accepted.
            </small>
          </label>
          <div className="two-col">
            <label>
              {field("Date of birth")}
              <input
                type="date"
                value={d.dob}
                onChange={(e) => u("dob", e.target.value)}
              />
            </label>
            <label>
              {field("Mobile number")}
              <input
                value={d.mobile}
                onChange={(e) =>
                  u("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                inputMode="numeric"
              />
            </label>
          </div>
          <label>
            {field("Demo OTP")}
            <input
              value={d.otp}
              onChange={(e) =>
                u("otp", e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="Enter 123456"
              inputMode="numeric"
            />
            <small className="help-text">
              Mock OTP — no SMS is being sent. Use <strong>123456</strong>.
            </small>
          </label>
        </>
      );

    case 2:
      return (
        <>
          <div className="prefill-banner">
            <Sparkles />
            <span>
              <strong>Filled from your Smart RTO profile</strong> · You can
              edit these details.
            </span>
          </div>
          <label>
            {field("Full name")}
            <input
              value={d.fullName}
              onChange={(e) => u("fullName", e.target.value)}
              placeholder="As shown on your demo proof"
            />
          </label>
          <label>
            {field("Parent or guardian name")}
            <input
              value={d.guardian}
              onChange={(e) => u("guardian", e.target.value)}
              placeholder="Enter a fictional name"
            />
          </label>
          {field("Gender")}
          {renderOptions(
            ["Woman", "Man", "Non-binary", "Prefer not to say"],
            d.gender,
            (v) => u("gender", v)
          )}
          <div className="two-col">
            <label>
              {field("Place of birth", false)}
              <input placeholder="For example, Sangli" />
            </label>
            <label>
              {field("Blood group", false)}
              <select>
                <option value="">Prefer not to say</option>
                <option>O+</option>
                <option>A+</option>
                <option>B+</option>
              </select>
            </label>
          </div>
        </>
      );

    case 3:
      return (
        <>
          <label>
            {field("PIN code")}
            <input
              value={d.pincode}
              onChange={(e) =>
                u("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              inputMode="numeric"
            />
          </label>
          {d.pincode.length === 6 && (
            <div className="location-suggestion">
              <Home />
              <div>
                <span>Suggested using demo location data</span>
                <strong>Maharashtra · Sangli</strong>
              </div>
            </div>
          )}
          <label>
            {field("Present address")}
            <textarea
              value={d.address}
              onChange={(e) => u("address", e.target.value)}
              placeholder="House/building, street and locality"
              rows={3}
            />
          </label>
          <label className="check-row">
            <input type="checkbox" defaultChecked />
            Permanent address is the same as present address
          </label>
          {field("Choose your RTO")}
          {renderOptions(
            [
              "MH-10 Sangli RTO",
              "MH-12 Pune RTO",
              "MH-14 Pimpri-Chinchwad RTO",
            ],
            d.rto,
            (v) => u("rto", v)
          )}
          <div className="rto-note">
            <Landmark />
            <div>
              <strong>{d.rto}</strong>
              <span>
                Approx. distance: Demo · Typical wait: Low · 12 mock slots
              </span>
            </div>
          </div>
        </>
      );

    case 4:
      return (
        <>
          <div className="document-checklist">
            <h3>Documents needed</h3>
            <p>Upload synthetic files only. PDF, JPG or PNG up to 5 MB.</p>
            {[
              "Demo identity proof",
              "Demo address proof",
              "Demo passport photograph",
            ].map((name) => (
              <button
                type="button"
                key={name}
                className={d.documents.includes(name) ? "uploaded" : ""}
                onClick={() =>
                  u(
                    "documents",
                    d.documents.includes(name)
                      ? d.documents.filter((x) => x !== name)
                      : [...d.documents, name]
                  )
                }
              >
                <span className="upload-icon">
                  {d.documents.includes(name) ? <Check /> : <UploadCloud />}
                </span>
                <span>
                  <strong>{name}</strong>
                  <small>
                    {d.documents.includes(name)
                      ? "Demo file added · Quality check passed"
                      : "Click to add a simulated file"}
                  </small>
                </span>
                <ChevronRight />
              </button>
            ))}
          </div>
          <div className="ocr-card">
            <Sparkles />
            <div>
              <strong>Demo OCR preview</strong>
              <p>We found: Demo Citizen · 15 Jan 2000 · Demo Address</p>
            </div>
            <button type="button">Use these details</button>
          </div>
        </>
      );

    case 5:
      return (
        <>
          <div className="recommended-slot">
            <span>Recommended</span>
            <strong>29 August · 11:20 AM</strong>
            <p>Expected wait: Low · Synthetic estimate</p>
          </div>
          {field("Choose an appointment")}
          {renderOptions(
            [
              "29 Aug · 11:20 AM",
              "29 Aug · 2:40 PM",
              "30 Aug · 10:00 AM",
            ],
            d.appointment,
            (v) => u("appointment", v)
          )}
          <div className="calendar-legend">
            <span>
              <i className="available" />
              Available
            </span>
            <span>
              <i className="limited" />
              Limited
            </span>
            <span>
              <i className="full" />
              Full
            </span>
          </div>
          <div className="slot-days">
            <div>
              <b>27</b>
              <span>Thu</span>
              <small>12 slots</small>
            </div>
            <div className="limited-day">
              <b>28</b>
              <span>Fri</span>
              <small>3 slots</small>
            </div>
            <div className="selected-day">
              <b>29</b>
              <span>Sat</span>
              <small>Recommended</small>
            </div>
            <div className="full-day">
              <b>30</b>
              <span>Sun</span>
              <small>Full</small>
            </div>
          </div>
        </>
      );

    case 6:
      return (
        <>
          <div className="review-list">
            {[
              ["Identity", `${d.identity} · XXXX 1234`],
              ["Personal information", `${d.fullName} · ${d.dob}`],
              ["Address", `${d.address}, ${d.city} ${d.pincode}`],
              ["Vehicle category", d.vehicle],
              ["RTO", d.rto],
              ["Documents", `${d.documents.length} demo files added`],
              ["Appointment", d.appointment],
            ].map(([a, b], i) => (
              <div key={a}>
                <span>
                  <i>{i + 1}</i>
                  <div>
                    <strong>{a}</strong>
                    <small>{b}</small>
                  </div>
                </span>
                <button
                  type="button"
                  onClick={() => u("step", Math.min(i, 5))}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
          <label className="declaration">
            <input
              type="checkbox"
              checked={d.declaration}
              onChange={(e) => u("declaration", e.target.checked)}
            />
            <span>
              <strong>Demo declaration</strong>I confirm the information
              entered is fictional or synthetic and correct for testing this
              prototype.
            </span>
          </label>
        </>
      );

    default:
      return (
        <>
          <div className="test-payment">
            <span className="badge">
              Test payment · No money will be charged
            </span>
            <h3>Application fee</h3>
            <div>
              <span>Learner Licence fee</span>
              <strong>₹150 Demo</strong>
            </div>
            <div>
              <span>Service fee</span>
              <strong>₹20 Demo</strong>
            </div>
            <div className="total">
              <span>Total</span>
              <strong>₹170 Demo</strong>
            </div>
          </div>
          {field("Choose a test payment method")}
          {renderOptions(
            ["Demo UPI", "Demo Card", "Demo Net Banking"],
            d.payment,
            (v) => u("payment", v)
          )}
          <div className="payment-disclaimer">
            <ShieldCheck />
            <span>
              <strong>Simulated payment only.</strong> No money, account or
              card information is collected.
            </span>
          </div>
        </>
      );
  }
}

function stepTitle(i: number) {
  return [
    "Let’s check if you can continue",
    "Verify your demo identity",
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
    "Answer three simple questions. This should take less than a minute.",
    "This prototype accepts only masked, fictional identity information.",
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
    "Choose the state where you want the service, your age and the kind of vehicle you want to learn. This is only a demo eligibility hint.",
    "Use 9999999999 and OTP 123456. Never enter a real Aadhaar or PAN number here.",
    "Add a fictional guardian name and choose a gender option. Optional details can be skipped.",
    "Your demo PIN suggests Sangli and MH-10. You can select another mock office.",
    "Add all three simulated documents. Nothing is uploaded to a server.",
    "The recommended slot has a low synthetic wait estimate. Choose any available mock time.",
    "Review each summary card. The declaration confirms this is fictional demo information.",
    "Select any demo method, then complete the test payment. No money will move.",
  ][i];
}
