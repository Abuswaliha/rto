"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { account } from "@/lib/appwrite";
import { setSession } from "@/lib/storage";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    let attempts = 0;
    const maxAttempts = 3;

    async function verifySession() {
      try {
        const user = await account.get();
        if (!isMounted) return;
        if (user) {
          setSession();
          setStatus("success");
          const next = searchParams.get("next");
          const destination = next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
          setTimeout(() => {
            router.replace(destination);
          }, 600);
          return;
        }
      } catch (err: unknown) {
        attempts += 1;
        if (attempts < maxAttempts) {
          setTimeout(verifySession, 800);
          return;
        }
        if (!isMounted) return;
        setStatus("error");
        const msg = err instanceof Error ? err.message : "We could not confirm your Appwrite session.";
        setErrorMessage(msg);
      }
    }

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  return (
    <main className="min-h-screen grid place-items-center bg-[#f4f8f6] p-4">
      <div className="w-full max-w-md rounded-3xl border border-[#d8e5e0] bg-white p-8 text-center shadow-lg">
        {status === "loading" && (
          <div className="space-y-4">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#edf7f4] text-[#167c74]">
              <Loader2 className="animate-spin" size={28} />
            </div>
            <h1 className="text-xl font-extrabold text-[#152321]">Verifying Google Sign-in</h1>
            <p className="text-xs text-[#5e6f68]">Connecting your profile and establishing secure Appwrite session…</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
              <ShieldCheck size={28} />
            </div>
            <h1 className="text-xl font-extrabold text-[#152321]">Sign-in Verified!</h1>
            <p className="text-xs text-[#5e6f68]">Redirecting you to your portal dashboard…</p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-5">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-amber-700">
              <AlertCircle size={28} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#152321]">Session Confirmation</h1>
              <p className="mt-1.5 text-xs text-[#5e6f68]">
                {errorMessage.includes("missing scopes")
                  ? "Your Google login was returned, but the Appwrite session cookie requires 'rto-delta.vercel.app' in Appwrite Console Platforms."
                  : "We could not confirm an active OAuth session from Appwrite."}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <Button asChild className="w-full">
                <Link href="/dashboard" onClick={() => setSession()}>
                  Continue as Demo Citizen
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Return to Sign In</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function AppwriteAuthCallback() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen grid place-items-center bg-[#f4f8f6] p-4">
          <div className="w-full max-w-md rounded-3xl border border-[#d8e5e0] bg-white p-8 text-center shadow-lg">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#edf7f4] text-[#167c74]">
              <Loader2 className="animate-spin" size={28} />
            </div>
            <h1 className="mt-4 text-xl font-extrabold text-[#152321]">Google Sign-in</h1>
            <p className="mt-1 text-xs text-[#5e6f68]">Completing verification…</p>
          </div>
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
