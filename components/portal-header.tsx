"use client";
import Link from "./safe-link";
import { Accessibility, Bell, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { hasSession } from "@/lib/storage";

export function PortalHeader() {
  const [signedIn, setSignedIn] = useState(false);
  const [menu, setMenu] = useState(false);
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
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/services">Services</Link>
              <Link href="/track">Applications</Link>
              <Link href="/appointments">Appointments</Link>
              <Link href="/wallet">Wallet</Link>
            </>
          ) : (
            <>
              <Link href="/services">Services</Link>
              <Link href="/track">Track</Link>
              <Link href="/how-it-works">Guides</Link>
              <Link href="/help">Help</Link>
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
              <button className="icon-only" aria-label="Notifications">
                <Bell size={19} />
              </button>
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
