"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Calculator,
  Home,
  IdCard,
  Landmark,
  Loader2,
  MapPin,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { PageShell } from "./page-shell";
import {
  createDemoAadhaarProfile,
  DEMO_AADHAAR_NUMBER,
  DemoAadhaarProfile,
  loadDemoProfile,
  saveDemoProfile,
} from "@/lib/storage";

const formatAadhaar = (value: string) =>
  value.replace(/\D/g, "").slice(0, 12).replace(/(.{4})(?=.)/g, "$1 ");

export function DemoAadhaar({ profileMode = false }: { profileMode?: boolean }) {
  const router = useRouter();
  const [aadhaar, setAadhaar] = useState("");
  const [profile, setProfile] = useState<DemoAadhaarProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const existing = loadDemoProfile();
      if (existing) {
        setAadhaar(formatAadhaar(existing.aadhaar));
        setProfile(existing);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function useDemoNumber() {
    setAadhaar(formatAadhaar(DEMO_AADHAAR_NUMBER));
    setProfile(null);
    setSaved(false);
    setError("");
  }

  function retrieveDetails() {
    if (aadhaar.replace(/\D/g, "") !== DEMO_AADHAAR_NUMBER) {
      setError(
        "Only the fictional demo number is accepted. Never enter a real Aadhaar number.",
      );
      setProfile(null);
      return;
    }
    setError("");
    setLoading(true);
    window.setTimeout(() => {
      setProfile(createDemoAadhaarProfile());
      setLoading(false);
      setSaved(false);
    }, 650);
  }

  function applyDetails() {
    if (!profile) return;
    saveDemoProfile(profile);
    setSaved(true);
    if (!profileMode) router.push("/dashboard");
  }

  return (
    <PageShell>
      <main className="aadhaar-page content-wrap">
        <section className="aadhaar-intro">
          <div>
            <p className="eyebrow">Demo Aadhaar prefill</p>
            <h1>{profileMode ? "Your demo citizen details" : "Fill your details once"}</h1>
            <p>
              Use a fictional demo Aadhaar number to prefill matching fields across Smart RTO services.
              Your details stay in this browser.
            </p>
          </div>
          <div className="aadhaar-safety"><ShieldCheck /><div><strong>No UIDAI connection</strong><span>Fictional number only · No identity verification</span></div></div>
        </section>

        <section className="aadhaar-card">
          <div className="aadhaar-card-heading">
            <span className="aadhaar-icon"><IdCard /></span>
            <div><span className="badge">Demo / Mock service</span><h2>Retrieve fictional citizen details</h2></div>
          </div>
          <div className="demo-aadhaar-number">
            <div><span>Demo number for reviewers</span><strong>9999 8888 7777</strong></div>
            <button type="button" className="button secondary" onClick={useDemoNumber}>Use demo Aadhaar</button>
          </div>
          <label className="aadhaar-input">
            Demo Aadhaar number <span className="font-bold text-red-500">*</span>
            <div className="input-with-icon"><IdCard /><input aria-describedby="aadhaar-help" value={aadhaar} onChange={(event) => { setAadhaar(formatAadhaar(event.target.value)); setError(""); setSaved(false); }} inputMode="numeric" placeholder="9999 8888 7777" /></div>
          </label>
          <p id="aadhaar-help" className="help-text">Only the number shown above works. Do not enter a real Aadhaar number.</p>
          {error && <p className="field-error" role="alert">{error}</p>}
          <button type="button" className="button primary aadhaar-retrieve" onClick={retrieveDetails} disabled={loading}>
            {loading ? <><Loader2 className="spin" /> Retrieving demo details</> : <>Retrieve demo details <ArrowRight /></>}
          </button>
        </section>

        {profile && <section className="aadhaar-result" aria-live="polite">
          <div className="aadhaar-result-heading"><div><BadgeCheck /><div><p className="eyebrow">Retrieved fictional details</p><h2>{profile.fullName}</h2></div></div><span className="status-pill">Demo record</span></div>
          <div className="aadhaar-detail-grid">
            <Detail icon={CalendarDays} label="Date of birth" value={new Date(`${profile.dob}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} />
            <Detail icon={Calculator} label="Age (calculated automatically)" value={`${profile.age} years`} />
            <Detail icon={IdCard} label="Gender" value={profile.gender} />
            <Detail icon={Smartphone} label="Mobile number" value={profile.mobile} />
            <Detail icon={Home} label="Full address" value={profile.address} wide />
            <Detail icon={MapPin} label="City / District" value={`${profile.city}, ${profile.district}`} />
            <Detail icon={MapPin} label="State / PIN code" value={`${profile.state} · ${profile.pincode}`} />
            <Detail icon={Landmark} label="Suggested RTO" value={profile.suggestedRto} wide />
          </div>
          <div className="aadhaar-apply">
            <div><strong>Ready to prefill your services</strong><span>Name, birth date, calculated age, mobile, address, location and RTO will be added wherever those fields exist.</span></div>
            <button type="button" className="button primary" onClick={applyDetails}>{profileMode ? "Save demo profile" : "Apply details to all services"}<ArrowRight /></button>
          </div>
          {saved && <p className="aadhaar-success" role="status"><BadgeCheck /> Details applied to matching service fields. You can still review or edit them.</p>}
          <p className="aadhaar-footnote">Nothing was uploaded or checked against UIDAI. This fictional profile is stored only in your browser for this prototype.</p>
        </section>}
      </main>
    </PageShell>
  );
}

function Detail({ icon: Icon, label, value, wide = false }: { icon: typeof IdCard; label: string; value: string; wide?: boolean }) {
  return <div className={`aadhaar-detail${wide ? " wide" : ""}`}><Icon /><div><span>{label}</span><strong>{value}</strong></div></div>;
}
