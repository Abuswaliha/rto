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
      <section className="auth-page">
        {/* LEFT SIDE */}
        <div className="auth-intro">
          <span className="auth-icon">
            <ShieldCheck />
          </span>

          <p className="eyebrow">Secure demo sign in</p>

          <h1>Welcome back</h1>

          <p>
            Sign in to continue an application, see appointments and check
            what happens next.
          </p>

          <ul>
            <li>
              <CheckCircle2 />
              No real OTP is sent
            </li>

            <li>
              <CheckCircle2 />
              No government identity is checked
            </li>

            <li>
              <CheckCircle2 />
              Your draft stays on this device
            </li>
          </ul>
        </div>

        {/* RIGHT SIDE */}
        <div className="auth-card">
          <span className="badge">Demo / Mock service</span>

          <h2>
            {stage === "mobile"
              ? "Sign in with mobile"
              : "Enter demo OTP"}
          </h2>

          <p>
            {stage === "mobile"
              ? "Use the reviewer account below or any fictional 10-digit number."
              : `Demo OTP sent to ${mobile}. No SMS was sent.`}
          </p>

          {/* MOBILE */}
          {stage === "mobile" ? (
            <label>
              Mobile number <span>Required</span>

              <div className="input-with-icon">
                <Smartphone />

                <input
                  value={mobile}
                  onChange={(e) =>
                    setMobile(
                      e.target.value.replace(/\D/g, "").slice(0, 10)
                    )
                  }
                  inputMode="numeric"
                  placeholder="9999999999"
                  autoFocus
                />
              </div>
            </label>
          ) : (
            /* OTP */
            <label>
              6-digit demo OTP <span>Required</span>

              <div className="input-with-icon">
                <LockKeyhole />

                <input
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                  inputMode="numeric"
                  placeholder="123456"
                  autoFocus
                />
              </div>

              <small className="help-text">
                Mock OTP: <strong>123456</strong>
              </small>
            </label>
          )}

          {/* ERROR */}
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}

          {/* LOGIN BUTTONS */}
          <div className="auth-buttons">
            <button
              type="button"
              className="button primary full"
              onClick={continueLogin}
            >
              {stage === "mobile" ? "Continue" : "Sign in to demo"}
            </button>

            <button
              type="button"
              className="button primary full"
              onClick={continueWithGoogle}
              disabled={googleLoading}
            >
              {googleLoading
                ? "Opening Google…"
                : "Continue with Google"}
            </button>
          </div>

          {/* GOOGLE ERROR */}
          {googleError && (
            <p className="field-error" role="alert">
              {googleError}
            </p>
          )}

          {/* DEMO BUTTON */}
          <button
            type="button"
            className="demo-fill"
            onClick={fillDemo}
          >
            Fill demo login
          </button>

          {/* REVIEWER DETAILS */}
          <div className="demo-credentials">
            <strong>Reviewer access</strong>

            <span>Mobile: 9999999999</span>

            <span>OTP: 123456</span>
          </div>

          {/* DISCLAIMER */}
          <p className="auth-disclaimer">
            Smart RTO is an independent hackathon prototype, not a
            government service.
          </p>
        </div>
      </section>
    </PageShell>
  );
}