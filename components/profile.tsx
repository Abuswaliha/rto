"use client";

import Link from "./safe-link";
import { useEffect, useState } from "react";
import { CheckCircle2, LogOut, UserRound } from "lucide-react";
import { account, isAppwriteConfigured } from "@/lib/appwrite";
import { hasSession, setSession } from "@/lib/storage";
import { PageShell } from "./page-shell";

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

    account.get().then((user) => {
      setProfile({
        id: user.$id,
        name: user.name || "Google user",
        email: user.email || "No email shared",
        provider: "Google",
      });
      setStatus("");
    }).catch(() => {
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
      if (isAppwriteConfigured) await account.deleteSession({ sessionId: "current" });
    } catch {
      // Clear the local prototype session even if an Appwrite session is already absent.
    }
    setSession(false);
    window.location.assign("/login");
  }

  if (!profile) {
    return <PageShell><section className="page-hero compact-hero"><div className="content-wrap"><p>{status}</p>{status.startsWith("Sign in") && <Link className="button primary" href="/login">Sign in</Link>}</div></section></PageShell>;
  }

  return <PageShell><section className="page-hero compact-hero"><div className="content-wrap"><p className="eyebrow">Your account</p><h1>{profile.name}</h1><p>Manage your Smart RTO profile and review the sign-in details for this device.</p></div></section><div className="content-wrap info-sections"><section><span>01</span><div><UserRound className="tool-icon"/><h2>Profile details</h2><p><strong>Name:</strong> {profile.name}<br/><strong>Email:</strong> {profile.email}<br/><strong>Account ID:</strong> {profile.id}</p></div></section><section><span>02</span><div><CheckCircle2 className="tool-icon"/><h2>Sign-in method</h2><p>You are signed in with <strong>{profile.provider}</strong>. {profile.provider === "Google" ? "Google authentication is managed securely by Appwrite." : "This is the local prototype demo session."}</p></div></section><section><span>03</span><div><LogOut className="tool-icon"/><h2>Sign out</h2><p>Signing out removes the local session from this device.</p><button className="button secondary" onClick={signOut}>Sign out</button></div></section></div></PageShell>;
}
