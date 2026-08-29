"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { account } from "@/lib/appwrite";
import { setSession } from "@/lib/storage";

export default function AppwriteAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Completing Google sign-in…");

  useEffect(() => {
    account.get().then(() => {
      setSession();
      const next = searchParams.get("next");
      router.replace(next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
    }).catch(() => setMessage("We could not confirm your Appwrite session. Please try again."));
  }, [router, searchParams]);

  return <main className="auth-callback"><div><h1>Google sign-in</h1><p>{message}</p><Link href="/login">Return to sign in</Link></div></main>;
}
