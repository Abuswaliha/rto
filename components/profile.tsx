"use client";

import Link from "./safe-link";
import { useEffect, useState } from "react";
import { CheckCircle2, LogOut, UserRound } from "lucide-react";
import { account, isAppwriteConfigured } from "@/lib/appwrite";
import { hasSession, setSession } from "@/lib/storage";
import { PageShell } from "./page-shell";
import { useRouter } from "next/navigation";

type Profile = {
  id: string;
  name: string;
  email: string;
  provider: "Google" | "Demo";
};

const demoProfile: Profile = {
  id: "demo-user-001",
  name: "Demo Citizen",
  email: "demo.citizen@example.test",
  provider: "Demo",
};

export function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState("Loading your profile…");

  useEffect(() => {
    if (!isAppwriteConfigured) {
      const timer = window.setTimeout(() => {
        setProfile(demoProfile);
        setStatus("");
      }, 0);
      return () => window.clearTimeout(timer);
    }

    account
      .get()
      .then((user) => {
        setProfile({
          id: user.$id,
          name: user.name || "Google user",
          email: user.email || "No email shared",
          provider: "Google",
        });
        setStatus("");
      })
      .catch(() => {
        if (hasSession()) {
          setProfile(demoProfile);
          setStatus("");
        } else {
          setStatus("Sign in to view your profile.");
        }
      });
  }, []);

  async function signOut() {
    try {
      if (isAppwriteConfigured)
        await account.deleteSession({ sessionId: "current" });
    } catch {
      // Clear the local prototype session even if an Appwrite session is already absent.
    }
    setSession(false);
    router.push("/login");
  }

  if (!profile) {
    return (
      <PageShell>
        <section className="border-b border-[#dce8e5] bg-gradient-to-b from-[#f7fbfa] to-[#edf7f4] py-12">
          <div className="mx-auto max-w-6xl px-6">
            <p className="text-sm font-medium text-[#5e6f68]">{status}</p>
            {status.startsWith("Sign in") && (
              <Link
                className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-[#167c74] px-5 text-xs font-bold text-white hover:bg-[#126b64]"
                href="/login"
              >
                Sign in
              </Link>
            )}
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="border-b border-[#dce8e5] bg-gradient-to-b from-[#f7fbfa] to-[#edf7f4] py-12">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#0f7655]">
            Your account
          </p>
          <h1 className="my-2 text-2xl font-extrabold tracking-tight text-[#152321] md:text-3xl">
            {profile.name}
          </h1>
          <p className="max-w-xl text-sm font-medium text-[#5e6f68]">
            Manage your Smart RTO profile and review the sign-in details for this device.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="divide-y divide-slate-100 space-y-6">
          <section className="flex gap-6 pt-6">
            <span className="text-xs font-black text-slate-300">01</span>
            <div className="flex-1">
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-[#ddf3ef] text-[#167c74]">
                <UserRound size={22} />
              </div>
              <h2 className="text-lg font-bold text-[#152321]">Profile details</h2>
              <div className="mt-2 space-y-1 text-xs text-[#5e6f68]">
                <p>
                  <strong className="text-[#152321]">Name:</strong> {profile.name}
                </p>
                <p>
                  <strong className="text-[#152321]">Email:</strong> {profile.email}
                </p>
                <p>
                  <strong className="text-[#152321]">Account ID:</strong> {profile.id}
                </p>
              </div>
            </div>
          </section>

          <section className="flex gap-6 pt-6">
            <span className="text-xs font-black text-slate-300">02</span>
            <div className="flex-1">
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-[#ddf3ef] text-[#167c74]">
                <CheckCircle2 size={22} />
              </div>
              <h2 className="text-lg font-bold text-[#152321]">Sign-in method</h2>
              <p className="mt-2 text-xs leading-relaxed text-[#5e6f68]">
                You are signed in with{" "}
                <strong className="text-[#152321]">{profile.provider}</strong>.{" "}
                {profile.provider === "Google"
                  ? "Google authentication is managed securely by Appwrite."
                  : "This is the local prototype demo session."}
              </p>
            </div>
          </section>

          <section className="flex gap-6 pt-6">
            <span className="text-xs font-black text-slate-300">03</span>
            <div className="flex-1">
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-[#ddf3ef] text-[#167c74]">
                <LogOut size={22} />
              </div>
              <h2 className="text-lg font-bold text-[#152321]">Sign out</h2>
              <p className="mt-2 text-xs leading-relaxed text-[#5e6f68]">
                Signing out removes the local session from this device.
              </p>
              <button
                className="mt-4 inline-flex h-9 items-center justify-center rounded-xl border border-[#dce8e5] bg-white px-4 text-xs font-bold text-[#152321] transition-colors hover:bg-slate-50"
                onClick={signOut}
              >
                Sign out
              </button>
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
