"use client";

import Link from "./safe-link";
import { Accessibility, Bell, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { hasSession } from "@/lib/storage";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { LanguageSwitcher } from "./language-provider";
import {
  TopNavAccessibilityControls,
  AccessibilityModal,
} from "./accessibility-menu";

export function PortalHeader() {
  const [signedIn, setSignedIn] = useState(false);
  const [menu, setMenu] = useState(false);
  const [accessibilityModalOpen, setAccessibilityModalOpen] = useState(false);
  const pathname = usePathname();

  const isCurrent = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  const navLinkClass = (href: string) =>
    `relative py-6 text-sm font-semibold transition-colors hover:text-[#167c74] ${
      isCurrent(href) ? "font-bold text-[#167c74]" : "text-[#263a33]"
    }`;

  const mobileNavLinkClass = (href: string) =>
    `block py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
      isCurrent(href)
        ? "bg-[#eaf4ef] font-bold text-[#167c74]"
        : "text-[#263a33] hover:bg-slate-50"
    }`;

  useEffect(() => {
    const timer = setTimeout(() => setSignedIn(hasSession()), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Top Accessibility & Demo Banner */}
      <div className="flex min-h-[34px] items-center justify-between bg-[#152923] px-4 text-center text-xs tracking-wider text-white md:px-8 lg:px-12">
        <div className="flex items-center gap-2 text-[11px] text-white/80">
          <span className="inline-block h-2 w-2 rounded-full bg-[#167c74]" />
          <span>Demo Mode · Government Transport Prototype</span>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <TopNavAccessibilityControls />
        </div>
      </div>

      {/* Main Header Bar */}
      <header className="sticky top-0 z-40 flex h-[78px] w-full items-center justify-between border-b border-[#dce8e5] bg-white/95 px-4 backdrop-blur-md md:px-8 lg:px-12">
        {/* Brand */}
        <Link href="/" className="flex shrink-0 items-center no-underline" aria-label="Smart RTO home">
          <Image
            src="/smart-rto-logo.png"
            alt="Smart RTO — Services Simplified"
            width={1180}
            height={530}
            priority
            className="h-12 w-auto object-contain sm:h-14"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="ml-auto hidden items-center gap-8 md:flex"
          aria-label="Main navigation"
        >
          <Link className={navLinkClass("/dashboard")} href="/dashboard">
            Dashboard
            {isCurrent("/dashboard") && (
              <span className="absolute bottom-4 left-0 right-0 h-0.5 rounded-full bg-[#167c74]" />
            )}
          </Link>
          <Link className={navLinkClass("/services")} href="/services">
            Services
            {isCurrent("/services") && (
              <span className="absolute bottom-4 left-0 right-0 h-0.5 rounded-full bg-[#167c74]" />
            )}
          </Link>
          <Link className={navLinkClass("/track")} href="/track">
            Applications
            {isCurrent("/track") && (
              <span className="absolute bottom-4 left-0 right-0 h-0.5 rounded-full bg-[#167c74]" />
            )}
          </Link>
          <Link className={navLinkClass("/appointments")} href="/appointments">
            Appointments
            {isCurrent("/appointments") && (
              <span className="absolute bottom-4 left-0 right-0 h-0.5 rounded-full bg-[#167c74]" />
            )}
          </Link>
          <Link className={navLinkClass("/wallet")} href="/wallet">
            Wallet
            {isCurrent("/wallet") && (
              <span className="absolute bottom-4 left-0 right-0 h-0.5 rounded-full bg-[#167c74]" />
            )}
          </Link>
          <Link className={navLinkClass("/contact")} href="/contact">
            Contact
            {isCurrent("/contact") && (
              <span className="absolute bottom-4 left-0 right-0 h-0.5 rounded-full bg-[#167c74]" />
            )}
          </Link>
        </nav>

        {/* Right Tools Toolbar */}
        <div className="flex items-center gap-2.5 pl-6">
          <div className="hidden sm:block">
            <LanguageSwitcher compact />
          </div>
          <button
            type="button"
            onClick={() => setAccessibilityModalOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-xl text-[#667572] transition-colors hover:bg-[#ddf3ef] hover:text-[#167c74]"
            aria-label="Open Accessibility Settings (Zoom & Color Filters)"
            title="Accessibility Settings (Zoom, Color Blind Modes)"
          >
            <Accessibility size={19} />
          </button>

          {signedIn ? (
            <>
              <Link
                className="grid h-10 w-10 place-items-center rounded-xl text-[#667572] transition-colors hover:bg-[#ddf3ef] hover:text-[#167c74]"
                href="/notifications"
                aria-label="Notifications"
              >
                <Bell size={19} />
              </Link>
              <Link
                className="grid h-10 w-10 place-items-center rounded-full bg-[#167c74] text-xs font-extrabold text-white shadow-sm ring-2 ring-white transition-transform hover:scale-105"
                href="/profile"
                aria-label="Demo Citizen profile"
              >
                DC
              </Link>
            </>
          ) : (
            <Link
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[#167c74] bg-white px-4 text-xs font-bold text-[#167c74] transition-all hover:bg-[#167c74] hover:text-white"
              href="/login"
            >
              Sign in
            </Link>
          )}

          {/* Mobile Menu Trigger */}
          <button
            className="grid h-10 w-10 place-items-center rounded-xl text-[#152321] hover:bg-[#ddf3ef] md:hidden"
            onClick={() => setMenu((v) => !v)}
            aria-expanded={menu}
            aria-label="Toggle navigation menu"
          >
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Accessibility Modal Dialog */}
      <AccessibilityModal
        isOpen={accessibilityModalOpen}
        onClose={() => setAccessibilityModalOpen(false)}
      />

      {/* Mobile Dropdown Menu Drawer */}
      {menu && (
        <div className="border-b border-[#dce8e5] bg-white px-4 py-3 shadow-lg md:hidden">
          <div className="mb-3 flex items-center justify-between rounded-xl bg-[#f2f8f6] p-2.5">
            <span className="px-1 text-xs font-bold text-[#40564f]">Portal language</span>
            <LanguageSwitcher compact />
          </div>
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            <Link
              onClick={() => setMenu(false)}
              className={mobileNavLinkClass("/dashboard")}
              href="/dashboard"
            >
              Dashboard
            </Link>
            <Link
              onClick={() => setMenu(false)}
              className={mobileNavLinkClass("/services")}
              href="/services"
            >
              Services
            </Link>
            <Link
              onClick={() => setMenu(false)}
              className={mobileNavLinkClass("/track")}
              href="/track"
            >
              Applications
            </Link>
            <Link
              onClick={() => setMenu(false)}
              className={mobileNavLinkClass("/appointments")}
              href="/appointments"
            >
              Appointments
            </Link>
            <Link
              onClick={() => setMenu(false)}
              className={mobileNavLinkClass("/wallet")}
              href="/wallet"
            >
              Wallet
            </Link>
            <Link
              onClick={() => setMenu(false)}
              className={mobileNavLinkClass("/contact")}
              href="/contact"
            >
              Contact Us
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}

export function PrototypeFooter() {
  return (
    <footer className="mt-auto bg-[#10241e] py-10 text-[#dbe7e2]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-6 md:grid-cols-[1fr_1.5fr_auto]">
        <div>
          <span className="flex items-center gap-3 font-extrabold text-white">
            <Image src="/smart-rto-icon.png" alt="" width={48} height={48} className="h-12 w-12 rounded-xl object-contain" />
            <span className="flex flex-col leading-none">
              <span>Smart RTO</span>
              <small className="mt-1 text-[10px] font-semibold text-[#97aaa2]">
                Independent hackathon prototype
              </small>
            </span>
          </span>
        </div>
        <p className="m-0 text-xs leading-relaxed text-[#9eb0a9]">
          Smart RTO is an independent hackathon prototype. It is not affiliated
          with MoRTH, NIC, Parivahan, Sarathi, VAHAN or any State Transport
          Department.
        </p>
        <div className="flex flex-wrap gap-4 text-xs font-medium text-[#dbe7e2]">
          <Link href="/about" className="hover:text-[#ddf3ef]">
            About
          </Link>
          <Link href="/security" className="hover:text-[#ddf3ef]">
            Security
          </Link>
          <Link href="/privacy" className="hover:text-[#ddf3ef]">
            Privacy
          </Link>
          <Link href="/contact" className="hover:text-[#ddf3ef]">
            Contact Us
          </Link>
        </div>
      </div>
    </footer>
  );
}
