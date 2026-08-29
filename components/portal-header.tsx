"use client";

import Link from "./safe-link";
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
} from "lucide-react";
import { useEffect, useState } from "react";
import { hasSession } from "@/lib/storage";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "./language-provider";
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
  const { enabled: demoMode, setEnabled: setDemoMode } = useDemoMode();
  const pathname = usePathname();

  const isCurrent = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  const navLinkClass = (href: string) =>
    `relative py-6 text-sm font-semibold transition-colors hover:text-[#167c74] ${
      isCurrent(href) ? "font-bold text-[#167c74]" : "text-[#263a33]"
    }`;

  useEffect(() => {
    const timer = setTimeout(() => setSignedIn(hasSession()), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!menu) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menu]);

  return (
    <>
      {/* Top Accessibility & Demo Banner */}
      <div className="flex min-h-[34px] items-center justify-between bg-[#152923] px-4 text-center text-xs tracking-wider text-white md:px-8 lg:px-12">
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
        <div className="hidden items-center gap-3 sm:flex">
          <TopNavAccessibilityControls />
        </div>
      </div>

      {/* Main Header Bar */}
      <header className="sticky top-0 z-40 flex h-[78px] w-full items-center justify-between border-b border-[#dce8e5] bg-white/95 px-4 backdrop-blur-md md:px-8 lg:px-12">
        {/* Brand */}
        <Link href="/" className="flex shrink-0 items-center no-underline" aria-label="Smart RTO home">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#167c74] text-white shadow-sm">
            <Route size={21} strokeWidth={2.5} />
          </span>
          <span className="ml-2 leading-tight">
            <strong className="block text-base font-extrabold tracking-tight text-[#152321]">
              Smart RTO
            </strong>
            <small className="block text-[9px] font-bold uppercase tracking-[.13em] text-[#667572]">
              Services simplified
            </small>
          </span>
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

          {/* Services Dropdown */}
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
                        Learner Licence
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
                        Permanent Driving Licence
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
                        Vehicle Transfer Service
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
                        Vehicle RC Search
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
                        eChallan Payment
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
                        Grievance Redressal
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
        <div className="flex shrink-0 items-center gap-1.5 pl-2 sm:gap-2.5 sm:pl-6">
          <div className="hidden sm:block">
            <LanguageSwitcher compact />
          </div>
          <button
            type="button"
            onClick={() => setAccessibilityModalOpen(true)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[#667572] transition-colors hover:bg-[#ddf3ef] hover:text-[#167c74] sm:h-10 sm:w-10"
            aria-label="Open Accessibility Settings (Zoom & Color Filters)"
            title="Accessibility Settings (Zoom, Color Blind Modes)"
          >
            <Accessibility size={18} />
          </button>

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
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#167c74] text-xs font-extrabold text-white shadow-sm ring-2 ring-white transition-transform hover:scale-105 sm:h-10 sm:w-10"
                href="/profile"
                aria-label="Demo Citizen profile"
              >
                DC
              </Link>
            </>
          ) : (
            <Link
              className="inline-flex h-9 items-center justify-center rounded-xl border border-[#167c74] bg-white px-3 text-xs font-bold text-[#167c74] transition-all hover:bg-[#167c74] hover:text-white sm:h-10 sm:px-4"
              href="/login"
            >
              Sign in
            </Link>
          )}

          {/* Mobile Menu Trigger */}
          <button
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[#152321] hover:bg-[#ddf3ef] sm:h-10 sm:w-10 md:hidden"
            onClick={() => setMenu((v) => !v)}
            aria-expanded={menu}
            aria-controls="mobile-navigation"
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
        <>
          <button
            type="button"
            className="fixed inset-x-0 bottom-0 top-[112px] z-30 bg-[#10241e]/30 backdrop-blur-[1px] md:hidden"
            onClick={() => setMenu(false)}
            aria-label="Close navigation menu"
          />
          <aside
            id="mobile-navigation"
            className="fixed inset-x-0 bottom-0 top-[112px] z-30 overflow-y-auto border-t border-[#dce8e5] bg-[#fbfcfa] px-4 py-5 shadow-2xl animate-in slide-in-from-top-3 duration-200 md:hidden"
          >
            <div className="mx-auto max-w-md">
              <div className="mb-5 flex items-center justify-between rounded-2xl border border-[#cfe3dd] bg-[#eaf4ef] px-4 py-3">
                <div>
                  <p className="m-0 text-xs font-extrabold text-[#173b32]">Citizen portal</p>
                  <p className="mt-0.5 text-[11px] font-medium text-[#587269]">Choose a service or check your progress.</p>
                </div>
                <LanguageSwitcher compact />
              </div>

              <nav className="grid grid-cols-2 gap-2" aria-label="Mobile navigation">
                {[
                  { href: "/dashboard", label: "Dashboard", icon: Home },
                  { href: "/services", label: "Services", icon: FileText },
                  { href: "/track", label: "Applications", icon: Search },
                  { href: "/wallet", label: "Wallet", icon: WalletCards },
                ].map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenu(false)}
                    className={`flex min-h-20 flex-col justify-between rounded-2xl border p-3 text-left transition-colors ${
                      isCurrent(href)
                        ? "border-[#167c74] bg-[#167c74] text-white shadow-sm"
                        : "border-[#d8e5e0] bg-white text-[#173b32] hover:border-[#167c74] hover:bg-[#f2f8f6]"
                    }`}
                  >
                    <Icon size={19} aria-hidden="true" />
                    <span className="text-xs font-extrabold">{label}</span>
                  </Link>
                ))}
              </nav>

              <section className="mt-6" aria-labelledby="mobile-services-title">
                <div className="mb-2 flex items-center justify-between px-1">
                  <h2 id="mobile-services-title" className="m-0 text-xs font-extrabold uppercase tracking-[0.14em] text-[#587269]">
                    Start a service
                  </h2>
                  <Link href="/services" onClick={() => setMenu(false)} className="text-xs font-bold text-[#167c74]">
                    View all
                  </Link>
                </div>
                <div className="overflow-hidden rounded-2xl border border-[#d8e5e0] bg-white">
                  {[
                    { href: "/apply/learner-licence", label: "Learner Licence", detail: "Form 2 application", icon: FileText },
                    { href: "/apply/permanent-licence", label: "Permanent Driving Licence", detail: "Form 4 application", icon: IdCard },
                    { href: "/vehicles/transfer", label: "Vehicle transfer", detail: "Form 29 & 30", icon: Car },
                    { href: "/challans", label: "eChallan payment", detail: "Check traffic fines", icon: WalletCards },
                    { href: "/wallet", label: "Document wallet", detail: "Upload and manage documents", icon: WalletCards },
                  ].map(({ href, label, detail, icon: Icon }, index) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenu(false)}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#f2f8f6] ${index > 0 ? "border-t border-[#edf2ef]" : ""}`}
                    >
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#eaf4ef] text-[#167c74]">
                        <Icon size={17} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="block text-xs text-[#173b32]">{label}</strong>
                        <small className="block text-[11px] text-[#687d75]">{detail}</small>
                      </span>
                      <ChevronDown className="-rotate-90 text-[#7f938b]" size={16} aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </section>

              <Link
                onClick={() => setMenu(false)}
                className="mt-5 flex items-center justify-between rounded-2xl bg-[#173b32] px-4 py-3.5 text-white"
                href={signedIn ? "/profile" : "/login"}
              >
                <span>
                  <strong className="block text-sm">{signedIn ? "Your profile" : "Sign in to continue"}</strong>
                  <small className="text-xs text-white/75">{signedIn ? "Manage your demo account" : "Access saved applications"}</small>
                </span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
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
