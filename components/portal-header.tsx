"use client";
import Link from "./safe-link";
import { Accessibility, Bell, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { hasSession } from "@/lib/storage";
import { usePathname } from "next/navigation";

export function PortalHeader() {
  const [signedIn, setSignedIn] = useState(false);
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();
  const navClass = (href: string) => pathname === href || pathname.startsWith(`${href}/`) ? "active" : undefined;
  useEffect(() => {
    const timer = setTimeout(() => setSignedIn(hasSession()), 0);
    return () => clearTimeout(timer);
  }, []);
  return (
    <>
      <div className="demo-strip">Demo mode · Fictional information only</div>
      <header className="portal-header">
        <Link className="brand" href="/">
          <span className="brand-mark">SR</span>
          <span>
            Smart RTO<small>Citizen portal</small>
          </span>
        </Link>
        <nav className={menu ? "nav-open" : ""} aria-label="Main navigation">
          {signedIn ? (
            <>
              <Link className={navClass("/dashboard")} href="/dashboard">Dashboard</Link>
              <Link className={navClass("/services")} href="/services">Services</Link>
              <Link className={navClass("/track")} href="/track">Applications</Link>
              <Link className={navClass("/appointments")} href="/appointments">Appointments</Link>
              <Link className={navClass("/wallet")} href="/wallet">Wallet</Link>
            </>
          ) : (
            <>
              <Link className={navClass("/services")} href="/services">Services</Link>
              <Link className={navClass("/track")} href="/track">Track</Link>
              <Link className={navClass("/how-it-works")} href="/how-it-works">Guides</Link>
              <Link className={navClass("/help")} href="/help">Help</Link>
            </>
          )}
        </nav>
        <div className="header-tools">
          <Link
            className="icon-only"
            href="/accessibility"
            aria-label="Accessibility"
          >
            <Accessibility size={19} />
          </Link>
          {signedIn ? (
            <>
              <Link className="icon-only" href="/notifications" aria-label="Notifications">
                <Bell size={19} />
              </Link>
              <Link
                className="avatar"
                href="/profile"
                aria-label="Demo Citizen profile"
              >
                DC
              </Link>
            </>
          ) : (
            <Link className="button secondary compact" href="/login">
              Sign in
            </Link>
          )}
          <button
            className="mobile-menu"
            onClick={() => setMenu((v) => !v)}
            aria-expanded={menu}
            aria-label="Toggle menu"
          >
            <Menu />
          </button>
        </div>
      </header>
    </>
  );
}

export function PrototypeFooter() {
  return (
    <footer>
      <div className="wrap footer-grid">
        <div>
          <span className="brand footer-brand">
            <span className="brand-mark">SR</span>
            <span>
              Smart RTO<small>Independent hackathon prototype</small>
            </span>
          </span>
        </div>
        <p>
          Smart RTO is an independent hackathon prototype. It is not affiliated
          with MoRTH, NIC, Parivahan, Sarathi, VAHAN or any State Transport
          Department.
        </p>
        <div>
          <Link href="/about">About</Link>
          <Link href="/security">Security</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/official-resources">Official resources</Link>
        </div>
      </div>
    </footer>
  );
}
