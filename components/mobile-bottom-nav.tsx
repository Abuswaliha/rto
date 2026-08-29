"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, Search, WalletCards, User } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  const isCurrent = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
    return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  };

  const navItems = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/services", label: "Services", icon: Grid },
    { href: "/track", label: "Track", icon: Search },
    { href: "/wallet", label: "Wallet", icon: WalletCards },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="smart-mobile-bottom-nav fixed bottom-0 inset-x-0 z-50 flex items-center justify-around border-t border-[#d8e5e0] bg-white/95 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md pb-[max(0.375rem,env(safe-area-inset-bottom))] md:hidden"
    >
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = isCurrent(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex min-w-[56px] flex-col items-center justify-center gap-0.5 rounded-xl py-1 text-[11px] font-semibold transition-all ${
              active
                ? "text-[#167c74] font-bold"
                : "text-[#5e6f68] hover:text-[#167c74]"
            }`}
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                active ? "bg-[#ddf3ef] text-[#167c74]" : "text-[#5e6f68]"
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
            </div>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

