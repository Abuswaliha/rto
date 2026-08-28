"use client";

import Link from "./safe-link";
import {
  ArrowRight,
  Car,
  CheckCircle2,
  Clock3,
  FileText,
  Gavel,
  IdCard,
  Info,
  Search,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import { PageShell } from "./page-shell";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const catalog = [
  {
    cat: "Driving licence",
    description: "Apply, renew or understand your licence services.",
    items: [
      {
        t: "Learner Licence",
        d: "Complete a guided, resumable demo application.",
        h: "/apply/learner-licence",
        live: true,
        icon: FileText,
      },
      {
        t: "Permanent Driving Licence (DL)",
        d: "Apply for Permanent Driving Licence after approved Learner Licence.",
        h: "/apply/permanent-licence",
        live: true,
        icon: IdCard,
      },
    ],
  },
  {
    cat: "Vehicle & records",
    description: "Check demo vehicle information and registration guidance.",
    items: [
      {
        t: "Check a vehicle",
        d: "Search one seeded synthetic registration.",
        h: "/vehicles",
        live: true,
        icon: Car,
      },
      {
        t: "Vehicle Transfer Service",
        d: "Apply for online ownership transfer and RC endorsement.",
        h: "/vehicles",
        live: true,
        icon: Car,
      },
    ],
  },
  {
    cat: "Visits & support",
    description: "Manage challans and service issues.",
    items: [
      {
        t: "eChallan",
        d: "Check and pay a fictional demonstration challan.",
        h: "/challans",
        live: true,
        icon: WalletCards,
      },
      {
        t: "Grievance",
        d: "Raise a mock service issue in three simple steps.",
        h: "/grievance",
        live: true,
        icon: Gavel,
      },
    ],
  },
];

export function Services() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#075c48] via-[#0b6b55] to-[#0e765d] py-16 text-white">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 px-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white/90 backdrop-blur-sm">
              <ShieldCheck size={16} />
              Smart RTO service catalogue
            </span>

            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/75">
              Service catalogue
            </p>

            <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
              What can we help you with?
            </h1>

            <p className="mt-3 text-base leading-relaxed text-white/80 md:text-lg">
              Start a working demo journey or read simple guidance before you
              begin.
            </p>
          </div>

          <div className="flex max-w-xs items-start gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
            <Info size={20} className="shrink-0 text-white/90" />
            <div className="text-xs">
              <strong className="block font-bold text-white">Demo environment</strong>
              <span className="mt-0.5 block leading-relaxed text-white/75">
                All records and transactions shown here are fictional.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Service Catalogue List */}
      <main className="mx-auto max-w-6xl px-6 py-14">
        <div className="space-y-12">
          {catalog.map((group) => (
            <section key={group.cat}>
              <div className="mb-6 flex items-end justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-[#152321]">
                    {group.cat}
                  </h2>
                  <p className="mt-1 text-xs text-[#5e6f68]">{group.description}</p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-[#5e6f68]">
                  {group.items.length}{" "}
                  {group.items.length === 1 ? "service" : "services"}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Card
                      key={item.t}
                      className="group flex min-h-[220px] flex-col justify-between transition-all hover:-translate-y-1 hover:border-[#167c74] hover:shadow-md"
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#ddf3ef] text-[#167c74]">
                          <Icon size={22} />
                        </div>
                        <Badge
                          variant={item.live ? "success" : "outline"}
                          className="gap-1.5 font-bold"
                        >
                          {item.live ? (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-[#0d5c45]" />
                              Working demo
                            </>
                          ) : (
                            <>
                              <Info size={12} />
                              Guidance only
                            </>
                          )}
                        </Badge>
                      </CardHeader>

                      <CardContent className="my-2">
                        <CardTitle className="text-base group-hover:text-[#167c74]">
                          {item.t}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {item.d}
                        </CardDescription>
                      </CardContent>

                      <CardFooter className="pt-2">
                        <Button
                          variant="link"
                          className="p-0 text-xs font-bold text-[#167c74] group-hover:text-[#0d5c45]"
                          asChild
                        >
                          <Link href={item.h} className="flex items-center gap-1.5">
                            <span>{item.live ? "Start service" : "Read guidance"}</span>
                            <ArrowRight
                              size={15}
                              className="transition-transform group-hover:translate-x-1"
                            />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
    </PageShell>
  );
}

export function VehicleCheck() {
  const [searched, setSearched] = useState(false);
  const [registration, setRegistration] = useState("MH10AB1234");

  function handleSearch() {
    setSearched(true);
  }

  return (
    <PageShell>
      {/* Intro Header */}
      <section className="border-b border-[#dce8e5] bg-gradient-to-br from-[#f7fbfa] via-white to-[#edf7f4] py-12">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#167c74] text-white shadow-md">
              <Car size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#0f7655]">
                Synthetic Vehicle Records
              </p>
              <h1 className="my-1 text-2xl font-extrabold tracking-tight text-[#152321] md:text-3xl">
                Check a demo vehicle
              </h1>
            </div>
          </div>
          <p className="mt-3 max-w-xl text-sm font-medium text-[#5e6f68]">
            Search a seeded fictional vehicle registration number to inspect RC details, insurance validity, PUCC expiry and tax status.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        {/* Search Card */}
        <div className="rounded-3xl border border-[#dce8e5] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-[#152321]">Vehicle Registration Search</h2>
              <p className="mt-1 text-xs text-[#5e6f68]">
                Try searching <strong className="text-[#167c74] font-bold">MH10AB1234</strong>
              </p>
            </div>
            <span className="w-fit rounded-md bg-[#fff1eb] px-3 py-1 text-[10px] font-extrabold text-[#a64524] tracking-wider">
              DEMO RECORD ONLY
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Car className="absolute left-3.5 top-3.5 text-[#5e6f68]" size={19} />
              <input
                id="vehicle-registration"
                value={registration}
                onChange={(e) => setRegistration(e.target.value.toUpperCase().slice(0, 12))}
                placeholder="MH10AB1234"
                className="h-12 w-full rounded-xl border border-[#cfe3dd] bg-[#f8fbf9] pl-11 pr-4 text-sm font-bold tracking-wider text-[#152321] uppercase outline-none focus:border-[#167c74] focus:bg-white focus:ring-4 focus:ring-[#ddf3ef]"
                autoComplete="off"
              />
            </div>
            <button
              type="button"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#167c74] px-6 text-sm font-bold text-white shadow-md shadow-[#167c74]/20 transition-all hover:bg-[#126b64]"
              onClick={handleSearch}
            >
              <Search size={18} />
              Check Record
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-[#5e6f68]">
            <ShieldCheck size={16} className="text-[#167c74]" />
            <span>No government databases are queried. Data stays local in browser.</span>
          </div>
        </div>

        {/* Result Card */}
        {searched && (
          <div className="rounded-3xl border border-[#cfe3dd] bg-white p-6 shadow-md sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e7f4ed] px-3 py-1 text-xs font-bold text-[#0d5c45]">
                  <CheckCircle2 size={15} /> Verified Demo Record
                </span>
                <h2 className="mt-3 text-2xl font-black text-[#152321]">Demo Hatchback Car</h2>
                <p className="text-xs font-semibold text-[#5e6f68] mt-0.5">
                  Registration: <strong className="text-[#152321]">{registration || "MH10AB1234"}</strong> · Fuel: <strong className="text-[#152321]">Petrol</strong>
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-2xl bg-[#ddf3ef] px-4 py-3 text-[#167c74]">
                <ShieldCheck size={24} />
                <span className="text-xs font-extrabold">Active Status</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-100 bg-[#f9fbfb] p-4">
                <span className="text-[11px] font-semibold text-[#5e6f68]">Owner Name</span>
                <strong className="mt-1 block text-sm font-bold text-[#152321]">A**** K****</strong>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-[#f9fbfb] p-4">
                <span className="text-[11px] font-semibold text-[#5e6f68]">Registration Validity</span>
                <strong className="mt-1 block text-sm font-bold text-[#0d5c45]">Valid till 04/08/2037</strong>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-[#f9fbfb] p-4">
                <span className="text-[11px] font-semibold text-[#5e6f68]">Insurance Status</span>
                <strong className="mt-1 block text-sm font-bold text-[#0d5c45]">Active until 10 Dec 2026</strong>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-[#fffbf8] p-4">
                <span className="text-[11px] font-semibold text-[#5e6f68]">PUCC Certificate</span>
                <strong className="mt-1 block text-sm font-bold text-[#a64524]">Expires 12 Sep 2026</strong>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-[#f9fbfb] p-4">
                <span className="text-[11px] font-semibold text-[#5e6f68]">Road Tax</span>
                <strong className="mt-1 block text-sm font-bold text-[#0d5c45]">Paid Lifetime</strong>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-[#f9fbfb] p-4">
                <span className="text-[11px] font-semibold text-[#5e6f68]">RTO Location</span>
                <strong className="mt-1 block text-sm font-bold text-[#152321]">MH-10 Sangli</strong>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#f0f7f5] p-4 text-xs font-semibold text-[#0f7655]">
              <Info size={18} className="shrink-0" />
              <span>This synthetic information is designed for demonstration of the Smart RTO interface.</span>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}

export function ChallanCheck() {
  const [searched, setSearched] = useState(false);
  const [paid, setPaid] = useState(false);
  const [challanNumber, setChallanNumber] = useState("DEMO-CH-100023");

  function handleSearch() {
    setSearched(true);
    setPaid(false);
  }

  return (
    <PageShell>
      {/* Intro Header */}
      <section className="border-b border-[#dce8e5] bg-gradient-to-br from-[#f7fbfa] via-white to-[#edf7f4] py-12">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#167c74] text-white shadow-md">
              <Gavel size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#0f7655]">
                Demo eChallan Portal
              </p>
              <h1 className="my-1 text-2xl font-extrabold tracking-tight text-[#152321] md:text-3xl">
                Check a fictional challan
              </h1>
            </div>
          </div>
          <p className="mt-3 max-w-xl text-sm font-medium text-[#5e6f68]">
            Search seeded traffic challans and experience the simulated payment flow with zero real money.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        {/* Search Card */}
        <div className="rounded-3xl border border-[#dce8e5] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-[#152321]">Search eChallan</h2>
              <p className="mt-1 text-xs text-[#5e6f68]">
                Try searching <strong className="text-[#167c74] font-bold">DEMO-CH-100023</strong>
              </p>
            </div>
            <span className="w-fit rounded-md bg-[#fff1eb] px-3 py-1 text-[10px] font-extrabold text-[#a64524] tracking-wider">
              TEST PAYMENT SIMULATION
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Gavel className="absolute left-3.5 top-3.5 text-[#5e6f68]" size={19} />
              <input
                id="challan-number"
                value={challanNumber}
                onChange={(e) => setChallanNumber(e.target.value.toUpperCase().slice(0, 20))}
                placeholder="DEMO-CH-100023"
                className="h-12 w-full rounded-xl border border-[#cfe3dd] bg-[#f8fbf9] pl-11 pr-4 text-sm font-bold tracking-wider text-[#152321] uppercase outline-none focus:border-[#167c74] focus:bg-white focus:ring-4 focus:ring-[#ddf3ef]"
                autoComplete="off"
              />
            </div>
            <button
              type="button"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#167c74] px-6 text-sm font-bold text-white shadow-md shadow-[#167c74]/20 transition-all hover:bg-[#126b64]"
              onClick={handleSearch}
            >
              <Search size={18} />
              Search Challan
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-[#5e6f68]">
            <ShieldCheck size={16} className="text-[#167c74]" />
            <span>This prototype never connects to real payment gateways or government servers.</span>
          </div>
        </div>

        {/* Result Card */}
        {searched && (
          <div className="rounded-3xl border border-[#cfe3dd] bg-white p-6 shadow-md sm:p-8">
            {!paid ? (
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff1eb] px-3 py-1 text-xs font-bold text-[#a64524]">
                    Pending Challan · Demo
                  </span>
                  <p className="font-mono text-xs font-bold text-[#5e6f68]">{challanNumber}</p>
                  <h2 className="text-2xl font-black text-[#152321]">Helmet Violation — Demonstration</h2>
                  <p className="text-xs text-[#5e6f68]">Location: Sangli Highway Circle · Date: 20 Aug 2026</p>
                </div>

                <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#cfe3dd] bg-[#f7faf8] p-6 text-center">
                  <span className="text-xs font-bold text-[#5e6f68]">Fine Amount</span>
                  <strong className="text-4xl font-black text-[#152321]">₹500</strong>
                  <small className="text-[10px] font-bold uppercase tracking-wider text-[#0f7655]">Mock Transaction</small>

                  <button
                    type="button"
                    className="mt-2 w-full rounded-xl bg-[#167c74] py-3 px-6 text-sm font-bold text-white shadow-md shadow-[#167c74]/20 transition-all hover:bg-[#126b64]"
                    onClick={() => setPaid(true)}
                  >
                    Pay Test Challan (₹500)
                  </button>

                  <Link href="/grievance" className="inline-flex items-center gap-1 text-xs font-bold text-[#167c74] hover:underline">
                    Dispute / Raise Grievance <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e7f4ed] text-[#0d5c45]">
                  <CheckCircle2 size={38} />
                </div>
                <h2 className="mt-4 text-2xl font-black text-[#152321]">Test Payment Successful!</h2>
                <p className="mt-2 text-sm text-[#5e6f68]">
                  Demonstration challan <strong className="font-bold text-[#152321]">{challanNumber}</strong> has been marked as paid.
                </p>

                <div className="mx-auto my-6 max-w-sm rounded-2xl border border-[#b9dfd4] bg-[#edf8f5] p-4 text-xs font-semibold text-[#0d5c45]">
                  <p>Transaction ID: <strong className="font-bold">TESTCH-2026-88421</strong></p>
                  <p className="mt-1">Date: {new Date().toLocaleDateString()}</p>
                </div>

                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#167c74] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#126b64]"
                >
                  Return to Service Catalogue <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}