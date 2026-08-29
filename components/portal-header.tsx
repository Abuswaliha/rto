"use client";

import Link from "./safe-link";
import Image from "next/image";
import {
  Accessibility,
  ArrowRight,
  Menu,
  X,
  Route,
  ChevronDown,
  FileText,
  IdCard,
  Car,
  WalletCards,
  Gavel,
  Home,
  Search,
  CalendarDays,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { hasSession } from "@/lib/storage";
import { usePathname } from "next/navigation";
import { LanguageSwitcher, translateText, useLanguage } from "./language-provider";
import { useDemoMode } from "./demo-mode-provider";
import {
  TopNavAccessibilityControls,
  AccessibilityModal,
} from "./accessibility-menu";

export function PortalHeader() {
  const [signedIn, setSignedIn] = useState(false);
  const [menu, setMenu] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [accessibilityModalOpen, setAccessibilityModalOpen] = useState(false);
  const [demoPopoverOpen, setDemoPopoverOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);
  const shouldRestoreMenuFocus = useRef(false);
  const { enabled: demoMode, setEnabled: setDemoMode } = useDemoMode();
  const { language } = useLanguage();
  const pathname = usePathname();
  const t = (value: string) => translateText(value, language);

  const isCurrent = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  const desktopNavLinkClass = (href: string) =>
    `relative py-6 text-sm font-semibold transition-colors hover:text-[#167c74] ${
      isCurrent(href) ? "font-bold text-[#167c74]" : "text-[#263a33]"
    }`;

  const openMenu = useCallback(() => {
    shouldRestoreMenuFocus.current = false;
    setMenu(true);
  }, []);

  const closeMenu = useCallback(() => {
    shouldRestoreMenuFocus.current = true;
    setMenu(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSignedIn(hasSession()), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const menuButton = menuButtonRef.current;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
      }
    };

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusableElements = mobileMenuRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusableElements?.length) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    // Lock body scroll when mobile menu is open
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("keydown", trapFocus);
    mobileMenuRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("keydown", trapFocus);
      if (shouldRestoreMenuFocus.current) {
        menuButton?.focus();
        shouldRestoreMenuFocus.current = false;
      }
    };
  }, [closeMenu, menu]);

  return (
    <>
      {/* Top Accessibility & Demo Utility Strip (Desktop only) */}
      <div className="hidden min-h-[34px] items-center justify-between bg-[#152923] px-4 text-center text-xs tracking-wider text-white md:flex md:px-8 lg:px-12">
        <div className="relative flex items-center gap-2 text-[11px] text-white/80">
          <button
            type="button"
            onClick={() => setDemoPopoverOpen((open) => !open)}
            aria-expanded={demoPopoverOpen}
            className="flex items-center gap-2 rounded px-1 py-1 text-left text-white/80 hover:bg-white/10"
          >
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                demoMode ? "bg-[#72c9b7]" : "bg-slate-400"
              }`}
            />
            <span>{demoMode ? "Demo mode" : "Standard view"}</span>
          </button>
          {demoPopoverOpen && (
            <div className="absolute left-0 top-8 z-50 w-72 rounded-xl border border-[#cfe3dd] bg-white p-3 text-[#263a33] shadow-xl">
              <p className="m-0 text-xs font-bold">Demo mode</p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#667572]">
                Show or hide demo labels and sample shortcuts in service listings.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDemoMode(true);
                    setDemoPopoverOpen(false);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    demoMode ? "bg-[#167c74] text-white" : "bg-slate-100"
                  }`}
                >
                  On
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDemoMode(false);
                    setDemoPopoverOpen(false);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    !demoMode ? "bg-[#167c74] text-white" : "bg-slate-100"
                  }`}
                >
                  Off
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <TopNavAccessibilityControls />
        </div>
      </div>

      {/* Main Header Bar */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#dce8e5] bg-white/95 px-4 backdrop-blur-md sm:h-[76px] md:px-8 lg:px-12">
        {/* Official Brand Logo */}
        <Link href="/" className="flex shrink-0 items-center no-underline group py-1" aria-label="Smart RTO home">
          <Image
            src="/smart-rto-logo.png"
            alt="Smart RTO - Services simplified"
            width={200}
            height={60}
            className="h-9 w-auto object-contain transition-transform group-hover:scale-102 sm:h-11"
            priority
          />
        </Link>

        {/* ========================================================================= */}
        {/* DESKTOP NAVIGATION (Hidden on Mobile, Visible on md:)                     */}
        {/* ========================================================================= */}
        <nav
          className="ml-auto hidden items-center gap-7 lg:gap-8 md:flex"
          aria-label="Desktop navigation"
        >
          <Link className={desktopNavLinkClass("/dashboard")} href="/dashboard">
            Dashboard
            {isCurrent("/dashboard") && (
              <span className="absolute bottom-4 left-0 right-0 h-0.5 rounded-full bg-[#167c74]" />
            )}
          </Link>

          {/* Services Dropdown Mega-Menu */}
          <div
            className="relative py-6"
            onMouseEnter={() => setServicesDropdownOpen(true)}
            onMouseLeave={() => setServicesDropdownOpen(false)}
          >
            <Link
              className={`flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-[#167c74] ${
                isCurrent("/services") ? "font-bold text-[#167c74]" : "text-[#263a33]"
              }`}
              href="/services"
            >
              Services
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${
                  servicesDropdownOpen ? "rotate-180 text-[#167c74]" : "text-[#667572]"
                }`}
              />
            </Link>
            {isCurrent("/services") && (
              <span className="absolute bottom-4 left-0 right-0 h-0.5 rounded-full bg-[#167c74]" />
            )}

            {/* Dropdown Menu */}
            {servicesDropdownOpen && (
              <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 w-80 rounded-2xl border border-[#cfe3dd] bg-white p-3 shadow-xl animate-in fade-in-50 slide-in-from-top-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#667572] px-2 py-1 border-b border-[#eaf2ef] mb-1">
                  RTO Online Services
                </div>
                <div className="space-y-1">
                  <Link
                    href="/apply/learner-licence"
                    className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#eaf4ef] transition-colors group"
                    onClick={() => setServicesDropdownOpen(false)}
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#e0f0ec] text-[#167c74] group-hover:bg-[#167c74] group-hover:text-white transition-colors">
                      <FileText size={16} />
                    </div>
                    <div>
                      <strong className="block text-xs text-[#152321] group-hover:text-[#167c74]">
                        {t("Learner Licence")}
                      </strong>
                      <span className="text-[11px] text-[#5e6f68]">Form 2 application & test</span>
                    </div>
                  </Link>

                  <Link
                    href="/apply/permanent-licence"
                    className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#eaf4ef] transition-colors group"
                    onClick={() => setServicesDropdownOpen(false)}
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#e0f0ec] text-[#167c74] group-hover:bg-[#167c74] group-hover:text-white transition-colors">
                      <IdCard size={16} />
                    </div>
                    <div>
                      <strong className="block text-xs text-[#152321] group-hover:text-[#167c74]">
                        {t("Permanent Driving Licence")}
                      </strong>
                      <span className="text-[11px] text-[#5e6f68]">Form 4 DL application</span>
                    </div>
                  </Link>

                  <Link
                    href="/vehicles/transfer"
                    className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#eaf4ef] transition-colors group"
                    onClick={() => setServicesDropdownOpen(false)}
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#e0f0ec] text-[#167c74] group-hover:bg-[#167c74] group-hover:text-white transition-colors">
                      <Car size={16} />
                    </div>
                    <div>
                      <strong className="block text-xs text-[#152321] group-hover:text-[#167c74]">
                        {t("Vehicle Transfer Service")}
                      </strong>
                      <span className="text-[11px] text-[#5e6f68]">Form 29 & 30 online application</span>
                    </div>
                  </Link>

                  <Link
                    href="/vehicles/search"
                    className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#eaf4ef] transition-colors group"
                    onClick={() => setServicesDropdownOpen(false)}
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#e0f0ec] text-[#167c74] group-hover:bg-[#167c74] group-hover:text-white transition-colors">
                      <Search size={16} />
                    </div>
                    <div>
                      <strong className="block text-xs text-[#152321] group-hover:text-[#167c74]">
                        {t("Vehicle RC Search")}
                      </strong>
                      <span className="text-[11px] text-[#5e6f68]">Inspect fitness & digital RC</span>
                    </div>
                  </Link>

                  <Link
                    href="/challans"
                    className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#eaf4ef] transition-colors group"
                    onClick={() => setServicesDropdownOpen(false)}
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#e0f0ec] text-[#167c74] group-hover:bg-[#167c74] group-hover:text-white transition-colors">
                      <WalletCards size={16} />
                    </div>
                    <div>
                      <strong className="block text-xs text-[#152321] group-hover:text-[#167c74]">
                        {t("eChallan Payment")}
                      </strong>
                      <span className="text-[11px] text-[#5e6f68]">Check & pay traffic fines</span>
                    </div>
                  </Link>

                  <Link
                    href="/grievance"
                    className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#eaf4ef] transition-colors group"
                    onClick={() => setServicesDropdownOpen(false)}
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#e0f0ec] text-[#167c74] group-hover:bg-[#167c74] group-hover:text-white transition-colors">
                      <Gavel size={16} />
                    </div>
                    <div>
                      <strong className="block text-xs text-[#152321] group-hover:text-[#167c74]">
                        {t("Grievance Redressal")}
                      </strong>
                      <span className="text-[11px] text-[#5e6f68]">Raise service issues</span>
                    </div>
                  </Link>

                  <div className="pt-2 border-t border-[#eaf2ef]">
                    <Link
                      href="/services"
                      className="block text-center text-xs font-bold text-[#167c74] hover:underline py-1"
                      onClick={() => setServicesDropdownOpen(false)}
                    >
                      View All Services →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link className={desktopNavLinkClass("/track")} href="/track">
            Applications
            {isCurrent("/track") && (
              <span className="absolute bottom-4 left-0 right-0 h-0.5 rounded-full bg-[#167c74]" />
            )}
          </Link>
          <Link className={desktopNavLinkClass("/appointments")} href="/appointments">
            Appointments
            {isCurrent("/appointments") && (
              <span className="absolute bottom-4 left-0 right-0 h-0.5 rounded-full bg-[#167c74]" />
            )}
          </Link>
          <Link className={desktopNavLinkClass("/wallet")} href="/wallet">
            Wallet
            {isCurrent("/wallet") && (
              <span className="absolute bottom-4 left-0 right-0 h-0.5 rounded-full bg-[#167c74]" />
            )}
          </Link>
          <Link className={desktopNavLinkClass("/contact")} href="/contact">
            Contact
            {isCurrent("/contact") && (
              <span className="absolute bottom-4 left-0 right-0 h-0.5 rounded-full bg-[#167c74]" />
            )}
          </Link>
        </nav>

        {/* Right Tools Toolbar (Language, Accessibility, Wallet & Profile) */}
        <div className="flex shrink-0 items-center gap-2 pl-2 sm:gap-3 sm:pl-6">
          {/* Direct Language Switcher: Always visible on both desktop & mobile top header */}
          <div className="flex items-center">
            <LanguageSwitcher compact />
          </div>

          {/* Accessibility Settings Trigger */}
          <button
            type="button"
            onClick={() => setAccessibilityModalOpen(true)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[#667572] transition-colors hover:bg-[#ddf3ef] hover:text-[#167c74] sm:h-10 sm:w-10"
            aria-label="Open Accessibility Settings (Zoom & Color Filters)"
            title="Accessibility Settings (Zoom, Color Blind Modes)"
          >
            <Accessibility size={18} />
          </button>

          {/* Desktop User Profile / Sign in */}
          <div className="hidden md:flex items-center gap-2">
            {signedIn ? (
              <>
                <Link
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[#667572] transition-colors hover:bg-[#ddf3ef] hover:text-[#167c74] sm:h-10 sm:w-10"
                  href="/wallet"
                  aria-label="Document Wallet"
                  title="Document Wallet"
                >
                  <WalletCards size={18} />
                </Link>
                <Link
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#167c74] text-xs font-extrabold text-white shadow-sm ring-2 ring-white transition-transform hover:scale-105"
                  href="/profile"
                  aria-label="Demo Citizen profile"
                >
                  DC
                </Link>
              </>
            ) : (
              <Link
                className="inline-flex h-9 items-center justify-center rounded-xl border border-[#167c74] bg-white px-3.5 text-xs font-bold text-[#167c74] transition-all hover:bg-[#167c74] hover:text-white"
                href="/login"
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Mobile Menu Hamburger Button */}
          <button
            ref={menuButtonRef}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#d8e5e0] bg-[#f7fbfa] text-[#152321] hover:bg-[#ddf3ef] hover:text-[#167c74] transition-all sm:h-10 sm:w-10 md:hidden"
            onClick={() => (menu ? closeMenu() : openMenu())}
            aria-expanded={menu}
            aria-controls="mobile-navigation"
            aria-label="Toggle navigation menu"
          >
            {menu ? <X size={20} className="rotate-90 transition-transform" /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Accessibility Modal Dialog */}
      <AccessibilityModal
        isOpen={accessibilityModalOpen}
        onClose={() => setAccessibilityModalOpen(false)}
      />

      {/* ========================================================================= */}
      {/* MOBILE NAVIGATION DRAWER (Distinct, touch-first, mobile app styled)      */}
      {/* ========================================================================= */}
      {menu && (
        <>
          <button
            type="button"
            className="fixed inset-0 top-16 z-40 bg-[#10241e]/50 backdrop-blur-xs md:hidden animate-in fade-in-50"
            onClick={closeMenu}
            aria-label="Close navigation menu"
            tabIndex={-1}
          />
          <aside
            id="mobile-navigation"
            ref={mobileMenuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
            tabIndex={-1}
            className="fixed inset-x-0 bottom-0 top-16 z-50 overflow-y-auto border-t border-[#dce8e5] bg-[#fbfcfa] p-4 pb-24 shadow-2xl animate-in slide-in-from-top-4 duration-200 md:hidden"
          >
            <div className="mx-auto max-w-md space-y-5">
              {/* Mobile Citizen Account Card */}
              {signedIn ? (
                <div className="flex items-center justify-between rounded-2xl border border-[#cfe3dd] bg-gradient-to-r from-[#eaf4ef] to-[#f2f8f6] p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#167c74] font-extrabold text-white">
                      DC
                    </div>
                    <div>
                      <strong className="block text-sm font-extrabold text-[#152321]">
                        Demo Citizen
                      </strong>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0d5c45]">
                        <ShieldCheck size={13} /> Active Account
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMenu(false)}
                    className="rounded-xl border border-[#167c74] bg-white px-3 py-1.5 text-xs font-bold text-[#167c74] shadow-2xs hover:bg-[#167c74] hover:text-white transition-colors"
                  >
                    Manage Account
                  </Link>
                </div>
              ) : (
                <div className="rounded-2xl border border-[#cfe3dd] bg-gradient-to-br from-[#167c74] to-[#0f5b55] p-4 text-white shadow-sm">
                  <strong className="block text-sm font-extrabold">Sign in to Smart RTO</strong>
                  <p className="mt-1 text-xs text-white/80 leading-relaxed">
                    Access saved applications & sync across devices
                  </p>
                  <Link
                    href="/login"
                    onClick={() => setMenu(false)}
                    className="button secondary mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 border-0 bg-white px-4 text-sm font-bold !text-[#167c74] shadow-xs transition-colors hover:bg-[#ddf3ef] hover:!text-[#167c74]"
                  >
                    Sign in <ArrowRight size={14} />
                  </Link>
                </div>
              )}

              {/* Mobile Quick Action Tiles (4-grid) */}
              <div>
                <span className="block text-[11px] font-extrabold uppercase tracking-wider text-[#587269] mb-2 px-1">
                  Quick Actions
                </span>
                <nav className="grid grid-cols-2 gap-2.5" aria-label={t("Mobile quick navigation")}>
                  {[
                    { href: "/dashboard", label: t("Dashboard"), icon: Home },
                    { href: "/track", label: t("Applications"), icon: Search },
                    { href: "/appointments", label: t("Appointments"), icon: CalendarDays },
                    { href: "/wallet", label: t("Digital Wallet"), icon: WalletCards },
                  ].map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenu(false)}
                      className={`flex flex-col justify-between rounded-2xl border p-3.5 text-left transition-all ${
                        isCurrent(href)
                          ? "border-[#167c74] bg-[#167c74] text-white shadow-sm"
                          : "border-[#d8e5e0] bg-white text-[#173b32] hover:border-[#167c74] hover:bg-[#f2f8f6]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon size={20} aria-hidden="true" />
                        {isCurrent(href) && (
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="mt-3 text-xs font-extrabold">{label}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Mobile Popular Services List */}
              <section aria-labelledby="mobile-services-title">
                <div className="mb-2 flex items-center justify-between px-1">
                  <h2 id="mobile-services-title" className="m-0 text-[11px] font-extrabold uppercase tracking-wider text-[#587269]">
                    {t("Popular Services")}
                  </h2>
                  <Link href="/services" onClick={() => setMenu(false)} className="text-xs font-bold text-[#167c74] hover:underline">
                    {t("View all")}
                  </Link>
                </div>
                <div className="overflow-hidden rounded-2xl border border-[#d8e5e0] bg-white shadow-2xs">
                  {[
                    { href: "/apply/learner-licence", label: t("Learner Licence"), detail: t("Form 2 application & test"), icon: FileText },
                    { href: "/apply/permanent-licence", label: t("Permanent Driving Licence"), detail: t("Form 4 DL application"), icon: IdCard },
                    { href: "/vehicles/transfer", label: t("Vehicle Transfer Service"), detail: t("Form 29 & 30 online application"), icon: Car },
                    { href: "/vehicles/search", label: t("Vehicle RC Search"), detail: t("Inspect fitness & digital RC"), icon: Search },
                    { href: "/challans", label: t("eChallan Payment"), detail: t("Check & pay traffic fines"), icon: WalletCards },
                    { href: "/grievance", label: t("Grievance Redressal"), detail: t("Raise service issues"), icon: Gavel },
                  ].map(({ href, label, detail, icon: Icon }, index) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenu(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 transition-colors hover:bg-[#f2f8f6] ${
                        index > 0 ? "border-t border-[#edf2ef]" : ""
                      }`}
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#eaf4ef] text-[#167c74]">
                        <Icon size={17} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="block text-xs font-bold text-[#173b32]">{label}</strong>
                        <small className="block text-[11px] text-[#687d75]">{detail}</small>
                      </span>
                      <ChevronDown className="-rotate-90 text-[#7f938b]" size={16} aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </section>

              {/* Mobile Demo Mode Toggle & Quick Settings */}
              <div className="rounded-2xl border border-[#cfe3dd] bg-white p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#167c74]" />
                    <span className="text-xs font-bold text-[#152321]">Demo mode</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDemoMode(!demoMode)}
                    className={`flex h-6 w-11 items-center rounded-full p-1 transition-colors ${
                      demoMode ? "bg-[#167c74]" : "bg-slate-300"
                    }`}
                    aria-label="Toggle Demo Mode"
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-white shadow-md transition-transform ${
                        demoMode ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Mobile Support & Policy Links */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-2 pt-1 text-xs font-semibold text-[#5e6f68]">
                <Link href="/about" onClick={() => setMenu(false)} className="hover:text-[#167c74]">
                  About
                </Link>
                <Link href="/how-it-works" onClick={() => setMenu(false)} className="hover:text-[#167c74]">
                  How it Works
                </Link>
                <Link href="/contact" onClick={() => setMenu(false)} className="hover:text-[#167c74]">
                  Contact Us
                </Link>
                <Link href="/privacy" onClick={() => setMenu(false)} className="hover:text-[#167c74]">
                  Privacy
                </Link>
                <Link href="/security" onClick={() => setMenu(false)} className="hover:text-[#167c74]">
                  Security
                </Link>
              </div>
            </div>
          </aside>
        </>
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
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#167c74] text-white">
              <Route size={22} />
            </span>
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
