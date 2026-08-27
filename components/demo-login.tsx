"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CheckCircle2,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { isAppwriteConfigured, signInWithGoogle } from "@/lib/appwrite";
import { setSession } from "@/lib/storage";
import { PageShell } from "./page-shell";

export function DemoLogin() {
  const router = useRouter();

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState<"mobile" | "otp">("mobile");
  const [error, setError] = useState("");
  const [googleError, setGoogleError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  function continueLogin() {
    if (stage === "mobile") {
      if (!/^\d{10}$/.test(mobile)) {
        setError("Enter the 10-digit demo mobile number.");
        return;
      }

      setError("");
      setStage("otp");
      return;
    }

    if (otp !== "123456") {
      setError("That demo OTP is not correct. Use 123456.");
      return;
    }

    setSession();
    router.push("/dashboard");
  }

  function fillDemo() {
    setMobile("9999999999");
    setOtp("123456");
    setError("");
    setStage("otp");
  }

  function continueWithGoogle() {
    if (!isAppwriteConfigured) {
      setGoogleError(
        "Google sign-in is unavailable until Appwrite is configured in .env.local."
      );
      return;
    }

    setGoogleError("");
    setGoogleLoading(true);

    const callback = `${window.location.origin}/auth/callback`;

    try {
      signInWithGoogle(callback, `${callback}?error=oauth`);
    } catch {
      setGoogleLoading(false);
      setGoogleError(
        "Google sign-in could not be started. Check your Appwrite configuration."
      );
    }
  }

  return (
    <PageShell>
      <section className="relative isolate overflow-hidden bg-[#f4f8f6] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(22,124,116,0.14),transparent_34%),radial-gradient(circle_at_85%_80%,rgba(232,115,67,0.10),transparent_28%)]" />
        <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-[#d8e5e0] bg-white shadow-[0_28px_80px_rgba(21,41,35,0.14)] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative overflow-hidden bg-[#123d34] px-7 py-10 text-white sm:px-10 sm:py-12 lg:px-12 lg:py-16">
            <div aria-hidden="true" className="absolute -right-24 -top-24 h-64 w-64 rounded-full border-[42px] border-white/5" />
            <div aria-hidden="true" className="absolute -bottom-28 -left-24 h-64 w-64 rounded-full bg-[#1d6f60]/35 blur-2xl" />
            <div className="relative">
              <span className="mb-8 grid h-12 w-12 place-items-center rounded-2xl border border-white/15 bg-white/10 text-[#bce8dd] shadow-inner">
                <ShieldCheck size={25} aria-hidden="true" />
              </span>
              <p className="m-0 text-xs font-extrabold uppercase tracking-[0.18em] text-[#9bd3c7]">Secure demo sign in</p>
              <h1 className="mb-5 mt-4 max-w-sm text-4xl font-black leading-[1.05] tracking-[-0.045em] text-white sm:text-5xl">Welcome back</h1>
              <p className="m-0 max-w-md text-sm leading-7 text-[#c8d9d4] sm:text-base">
                Sign in to continue an application, see appointments and check what happens next.
              </p>
              <ul className="mt-9 grid list-none gap-4 p-0 text-sm font-semibold text-[#e3efeb]">
                {["No real OTP is sent", "No government identity is checked", "Your draft stays on this device"].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="shrink-0 text-[#72c9b7]" size={19} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="px-7 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
            <span className="inline-flex rounded-full border border-[#f2cdbc] bg-[#fff3ed] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#a64524]">Demo / Mock service</span>
            <h2 className="mb-2 mt-6 text-3xl font-black tracking-[-0.035em] text-[#152923]">
              {stage === "mobile" ? "Sign in with mobile" : "Enter demo OTP"}
            </h2>
            <p className="m-0 min-h-12 text-sm leading-6 text-[#65756f]">
              {stage === "mobile"
                ? "Use the reviewer account below or any fictional 10-digit number."
                : `Demo OTP sent to ${mobile}. No SMS was sent.`}
            </p>

            <div className="mt-7">
          {stage === "mobile" ? (
            <label className="block text-sm font-extrabold text-[#253831]">
              <span className="flex items-center justify-between gap-4">Mobile number <span className="font-bold text-red-500">*</span></span>
              <div className="mt-2.5 flex h-14 items-center gap-3 rounded-xl border border-[#cbdad4] bg-white px-4 shadow-sm transition focus-within:border-[#167c74] focus-within:ring-4 focus-within:ring-[#167c74]/10">
                <Smartphone className="shrink-0 text-[#668078]" size={20} aria-hidden="true" />
                <input
                  className="h-full min-w-0 flex-1 border-0 bg-transparent text-base font-semibold tracking-[0.08em] text-[#152923] outline-none placeholder:text-[#9aa8a3]"
                  aria-label="Mobile number"
                  value={mobile}
                  onChange={(e) =>
                    setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  inputMode="numeric"
                  placeholder="9999999999"
                  autoFocus
                />
              </div>
            </label>
          ) : (
            <label className="block text-sm font-extrabold text-[#253831]">
              <span className="flex items-center justify-between gap-4">6-digit demo OTP <span className="font-bold text-red-500">*</span></span>
              <div className="mt-2.5 flex h-14 items-center gap-3 rounded-xl border border-[#cbdad4] bg-white px-4 shadow-sm transition focus-within:border-[#167c74] focus-within:ring-4 focus-within:ring-[#167c74]/10">
                <LockKeyhole className="shrink-0 text-[#668078]" size={20} aria-hidden="true" />
                <input
                  className="h-full min-w-0 flex-1 border-0 bg-transparent text-base font-semibold tracking-[0.2em] text-[#152923] outline-none placeholder:text-[#9aa8a3]"
                  aria-label="6-digit demo OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  inputMode="numeric"
                  placeholder="123456"
                  autoFocus
                />
              </div>

              <small className="mt-2.5 block text-xs font-medium text-[#697a74]">
                Mock OTP: <strong>123456</strong>
              </small>
            </label>
          )}
            </div>

          {error && (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-bold text-red-700" role="alert">
              {error}
            </p>
          )}

          <div className="mt-6 grid gap-3">
            <button
              type="button"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#126f65] px-5 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(18,111,101,0.20)] transition hover:-translate-y-0.5 hover:bg-[#0f6259] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#f39a68]"
              onClick={continueLogin}
            >
              {stage === "mobile" ? "Continue" : "Sign in to demo"}
            </button>

            <button
              type="button"
              className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#cbdad4] bg-white px-5 text-sm font-extrabold text-[#24372f] shadow-sm transition hover:-translate-y-0.5 hover:border-[#9fbeb4] hover:bg-[#f7faf9] disabled:cursor-wait disabled:opacity-60"
              onClick={continueWithGoogle}
              disabled={googleLoading}
            >
              <span aria-hidden="true" className="grid h-6 w-6 place-items-center rounded-full border border-[#dce5e1] text-xs font-black text-[#4285f4]">G</span>
              {googleLoading
                ? "Opening Google…"
                : "Continue with Google"}
            </button>
          </div>

          {googleError && (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-bold leading-5 text-red-700" role="alert">
              {googleError}
            </p>
          )}

          <button
            type="button"
            className="mt-5 w-full rounded-lg px-3 py-2 text-center text-xs font-extrabold text-[#126f65] underline decoration-[#9cc9bf] underline-offset-4 transition hover:bg-[#edf7f4]"
            onClick={fillDemo}
          >
            Fill demo login
          </button>

          <div className="mt-3 grid gap-1 rounded-xl border border-dashed border-[#b8d2c9] bg-[#f2f8f6] px-4 py-3 text-xs text-[#546861] sm:grid-cols-[1fr_auto] sm:gap-x-5">
            <strong className="text-[#263a33] sm:row-span-2 sm:self-center">Reviewer access</strong>
            <span className="font-mono" dir="ltr">Mobile: 9999999999</span>
            <span className="font-mono" dir="ltr">OTP: 123456</span>
          </div>

          <p className="mb-0 mt-5 text-center text-[11px] leading-5 text-[#788780]">
            Smart RTO is an independent hackathon prototype, not a government service.
          </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
