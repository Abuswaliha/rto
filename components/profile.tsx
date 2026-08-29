"use client";

import Link from "./safe-link";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  FileText,
  KeyRound,
  LogOut,
  Mail,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";
import { account, isAppwriteConfigured } from "@/lib/appwrite";
import { hasSession, setSession } from "@/lib/storage";
import { PageShell } from "./page-shell";
import { useRouter } from "next/navigation";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

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
      <section className="border-b border-[#d6e7e1] bg-[#f6fbf9] py-8 md:py-12">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[#0f7655]">Citizen account</p>
          <div className="overflow-hidden rounded-[28px] border border-[#bcd9d0] bg-white shadow-[0_18px_50px_rgba(18,69,55,0.10)]">
            <div className="grid md:grid-cols-[auto_1fr_auto] md:items-center">
              <div className="flex min-h-36 items-center justify-center bg-[#123d34] px-8 py-7 text-white md:min-h-44">
                <div className="grid h-20 w-20 place-items-center rounded-[24px] border border-white/20 bg-white/10 text-2xl font-black tracking-[-0.08em] shadow-inner">
                  {profile.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
                </div>
              </div>
              <div className="px-6 py-6 md:px-8">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="success" className="gap-1.5"><CheckCircle2 size={13} /> Signed in</Badge>
                  <Badge variant="outline">{profile.provider} account</Badge>
                </div>
                <h1 className="mt-3 text-2xl font-black tracking-[-0.035em] text-[#152923] md:text-3xl">{profile.name}</h1>
                <p className="mt-1 flex items-center gap-2 text-sm text-[#5e6f68]"><Mail size={15} className="text-[#167c74]" /> {profile.email}</p>
              </div>
              <div className="border-t border-[#e4efeb] px-6 py-5 md:border-l md:border-t-0 md:px-7">
                <p className="m-0 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#72867e]">Account reference</p>
                <p className="mt-1 break-all font-mono text-xs font-bold text-[#173b32]">{profile.id}</p>
                <p className="mt-2 text-[11px] leading-4 text-[#687d75]">Use this only when contacting prototype support.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-9 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="border-b border-[#e4efeb] bg-[#fbfdfc] px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#ddf3ef] text-[#167c74]"><UserRound size={20} /></span>
                <div><h2 className="text-base font-extrabold text-[#152923]">Profile details</h2><p className="mt-0.5 text-xs text-[#687d75]">The identity details used for this account.</p></div>
              </div>
            </div>
            <CardContent className="p-0">
              {[
                { label: "Full name", value: profile.name },
                { label: "Email address", value: profile.email },
                { label: "Sign-in provider", value: profile.provider },
              ].map((detail, index) => (
                <div key={detail.label} className={`flex flex-col justify-between gap-1 px-6 py-4 sm:flex-row sm:items-center ${index > 0 ? "border-t border-[#edf2ef]" : ""}`}>
                  <span className="text-xs font-bold text-[#647a71]">{detail.label}</span>
                  <strong className="text-sm text-[#173b32]">{detail.value}</strong>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-[#e4efeb] bg-[#fbfdfc] px-6 py-5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#ddf3ef] text-[#167c74]"><ShieldCheck size={20} /></span><div><h2 className="text-base font-extrabold text-[#152923]">Account protection</h2><p className="mt-0.5 text-xs text-[#687d75]">How your account is connected on this device.</p></div></div></div>
            <CardContent className="space-y-4 p-6">
              <div className="flex gap-3"><KeyRound size={18} className="mt-0.5 shrink-0 text-[#167c74]" /><p className="m-0 text-xs leading-5 text-[#5e6f68]">{profile.provider === "Google" ? "Google sign-in is handled through Appwrite. Your password is never stored by Smart RTO." : "This demo session is stored only on this device and does not represent a government identity."}</p></div>
              <div className="rounded-xl border border-[#cfe3dd] bg-[#f2f8f6] px-4 py-3 text-xs leading-5 text-[#405e54]">Signing out clears this device’s local prototype session.</div>
              <Button variant="outline" size="sm" className="gap-2" onClick={signOut}><LogOut size={15} /> Sign out from this device</Button>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <div className="px-1"><h2 className="text-sm font-extrabold text-[#152923]">Continue where you left off</h2><p className="mt-1 text-xs leading-5 text-[#687d75]">Quick links to your account services.</p></div>
          {[
            { href: "/dashboard", label: "Open dashboard", detail: "Applications and service progress", icon: FileText },
            { href: "/wallet", label: "Document wallet", detail: "View linked credentials", icon: WalletCards },
          ].map(({ href, label, detail, icon: Icon }) => (
            <Link key={href} href={href} className="group flex items-center gap-3 rounded-2xl border border-[#dce8e5] bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#92c8b9] hover:shadow-md">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eaf4ef] text-[#167c74] group-hover:bg-[#167c74] group-hover:text-white"><Icon size={19} /></span>
              <span className="min-w-0 flex-1"><strong className="block text-sm text-[#173b32]">{label}</strong><small className="mt-0.5 block text-[11px] text-[#687d75]">{detail}</small></span>
              <ChevronRight size={17} className="text-[#88a097] group-hover:text-[#167c74]" />
            </Link>
          ))}
        </aside>
      </div>
    </PageShell>
  );
}
