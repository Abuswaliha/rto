"use client";

import { hasSession } from "@/lib/storage";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PUBLIC_PATHS = new Set(["/login", "/register", "/auth/callback"]);

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.has(pathname);
}

/**
 * Protects the portal routes using the same local demo session created by
 * DemoLogin. Keeping this at the root means newly added pages are protected
 * automatically instead of relying on each page remembering to add a guard.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const publicPath = isPublicPath(pathname);
  const [authorized, setAuthorized] = useState(publicPath);
  const [checkedPath, setCheckedPath] = useState<string | null>(
    publicPath ? pathname : null,
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (publicPath || hasSession()) {
        setAuthorized(true);
        setCheckedPath(pathname);
        return;
      }

      setAuthorized(false);
      setCheckedPath(pathname);
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }, 0);

    return () => clearTimeout(timer);
  }, [pathname, publicPath, router]);

  if (publicPath || (authorized && checkedPath === pathname)) return <>{children}</>;

  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f8f6] px-6">
      <p className="text-sm font-semibold text-[#486158]" role="status">
        Checking your sign-in…
      </p>
    </main>
  );
}
