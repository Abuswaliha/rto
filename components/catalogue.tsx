"use client";

import Link from "./safe-link";
import {
  ArrowRight,
  Car,
  CheckCircle2,
  Clock3,
  FileText,
  Gavel,
  Info,
  Search,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import { PageShell } from "./page-shell";

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
        t: "Driving Licence Services",
        d: "Guidance for new, renewal and duplicate licences.",
        h: "/guides/driving-licence",
        live: false,
        icon: Info,
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
        t: "Registration guidance",
        d: "Understand RC services in simple language.",
        h: "/guides/vehicle-services",
        live: false,
        icon: Info,
      },
    ],
  },
  {
    cat: "Visits & support",
    description: "Manage appointments, challans and service issues.",
    items: [
      {
        t: "Appointments",
        d: "Book or manage a simulated RTO visit.",
        h: "/appointments",
        live: true,
        icon: Clock3,
      },
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

            <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">
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
                    <Link
                      href={item.h}
                      key={item.t}
                      className="group flex min-h-[220px] flex-col justify-between rounded-2xl border border-[#dce8e5] bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-[#167c74] hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#ddf3ef] text-[#167c74]">
                          <Icon size={22} />
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${item.live
                              ? "bg-[#e7f4ed] text-[#0d5c45]"
                              : "bg-slate-100 text-[#5e6f68]"
                            }`}
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
                        </span>
                      </div>

                      <div className="my-4">
                        <h3 className="text-base font-bold text-[#152321] group-hover:text-[#167c74]">
                          {item.t}
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-[#5e6f68]">
                          {item.d}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#167c74]">
                        <span>{item.live ? "Start service" : "Read guidance"}</span>
                        <ArrowRight
                          size={15}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </div>
                    </Link>
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
      <section className="tool-page content-wrap">
        {/* INTRO */}
        <div className="tool-intro">
          <span className="tool-icon">
            <Car />
          </span>

          <p className="eyebrow">Synthetic vehicle records</p>

          <h1>Check a demo vehicle</h1>

          <p>
            Search a seeded fictional registration to see how vehicle
            information could be presented.
          </p>
        </div>

        {/* SEARCH */}
        <div className="search-card">
          <div className="search-card-heading">
            <div>
              <h2>Vehicle registration</h2>
              <p>
                Try the demo registration{" "}
                <strong>MH10AB1234</strong>
              </p>
            </div>

            <span className="demo-label">DEMO</span>
          </div>

          <label htmlFor="vehicle-registration">
            Registration number
          </label>

          <div className="search-input-row">
            <div className="search-input">
              <Car size={19} />

              <input
                id="vehicle-registration"
                value={registration}
                onChange={(e) =>
                  setRegistration(
                    e.target.value.toUpperCase().slice(0, 12)
                  )
                }
                placeholder="MH10AB1234"
                autoComplete="off"
              />
            </div>

            <button
              type="button"
              className="button primary"
              onClick={handleSearch}
            >
              <Search size={18} />
              Check record
            </button>
          </div>

          <div className="search-help">
            <ShieldCheck size={15} />
            <span>
              No real vehicle database is searched.
            </span>
          </div>
        </div>

        {/* RESULT */}
        {searched && (
          <div className="record-card">
            <div className="record-head">
              <div className="record-title">
                <span className="badge">
                  <CheckCircle2 size={14} />
                  Demo vehicle record
                </span>

                <h2>Demo Hatchback</h2>

                <p>
                  {registration || "MH10AB1234"} · Petrol
                </p>
              </div>

              <div className="record-status">
                <ShieldCheck size={22} />
                <span>Verified demo</span>
              </div>
            </div>

            <div className="record-grid">
              <div>
                <span>Owner</span>
                <strong>A**** K****</strong>
              </div>

              <div>
                <span>Registration validity</span>
                <strong className="good">Valid</strong>
              </div>

              <div>
                <span>Insurance</span>
                <strong>Until 10 Dec 2026</strong>
              </div>

              <div>
                <span>PUCC</span>
                <strong className="warn">
                  Expires 12 Sep 2026
                </strong>
              </div>

              <div>
                <span>Tax</span>
                <strong className="good">Paid</strong>
              </div>

              <div>
                <span>Fitness</span>
                <strong>Not applicable</strong>
              </div>
            </div>

            <div className="result-note">
              <Info size={17} />
              <span>
                This is synthetic information created for the Smart RTO
                prototype.
              </span>
            </div>
          </div>
        )}
      </section>
    </PageShell>
  );
}

export function ChallanCheck() {
  const [searched, setSearched] = useState(false);
  const [paid, setPaid] = useState(false);
  const [challanNumber, setChallanNumber] =
    useState("DEMO-CH-100023");

  function handleSearch() {
    setSearched(true);
    setPaid(false);
  }

  return (
    <PageShell>
      <section className="tool-page content-wrap">
        {/* INTRO */}
        <div className="tool-intro">
          <span className="tool-icon">
            <Gavel />
          </span>

          <p className="eyebrow">Demo eChallan</p>

          <h1>Check a fictional challan</h1>

          <p>
            Search a seeded challan and experience the payment flow without
            making a real transaction.
          </p>
        </div>

        {/* SEARCH */}
        <div className="search-card">
          <div className="search-card-heading">
            <div>
              <h2>Find a challan</h2>
              <p>
                Try{" "}
                <strong>DEMO-CH-100023</strong>
              </p>
            </div>

            <span className="demo-label">TEST MODE</span>
          </div>

          <label htmlFor="challan-number">
            Vehicle or challan number
          </label>

          <div className="search-input-row">
            <div className="search-input">
              <Gavel size={19} />

              <input
                id="challan-number"
                value={challanNumber}
                onChange={(e) =>
                  setChallanNumber(
                    e.target.value.toUpperCase().slice(0, 20)
                  )
                }
                placeholder="DEMO-CH-100023"
                autoComplete="off"
              />
            </div>

            <button
              type="button"
              className="button primary"
              onClick={handleSearch}
            >
              <Search size={18} />
              Search
            </button>
          </div>

          <div className="search-help">
            <ShieldCheck size={15} />
            <span>
              This prototype never accesses private government records.
            </span>
          </div>
        </div>

        {/* CHALLAN RESULT */}
        {searched && (
          <div
            className={
              paid
                ? "challan-card payment-success"
                : "challan-card"
            }
          >
            {!paid ? (
              <>
                <div className="challan-main">
                  <span className="badge">
                    Demo / Mock service
                  </span>

                  <p className="challan-number">
                    Challan {challanNumber}
                  </p>

                  <h2>Helmet violation — Demo</h2>

                  <div className="challan-meta">
                    <span>20 Aug 2026</span>
                    <span>•</span>
                    <span>Maharashtra</span>
                  </div>
                </div>

                <div className="challan-payment">
                  <span>Pending amount</span>

                  <strong>₹500</strong>

                  <small>
                    Demonstration amount only
                  </small>

                  <button
                    type="button"
                    className="button primary"
                    onClick={() => setPaid(true)}
                  >
                    Pay test challan
                  </button>

                  <Link
                    href="/grievance"
                    className="secondary-action"
                  >
                    Raise grievance
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </>
            ) : (
              <div className="paid-state">
                <div className="success-icon">
                  <CheckCircle2 size={30} />
                </div>

                <span className="badge success-badge">
                  Test payment successful
                </span>

                <h2>Payment simulated successfully</h2>

                <p>
                  Your demonstration challan has been marked as paid.
                  No real money was charged.
                </p>

                <div className="payment-reference">
                  <span>Test reference</span>
                  <strong>TESTCH-2026-88421</strong>
                </div>

                <Link
                  href="/services"
                  className="button secondary"
                >
                  Back to services
                </Link>
              </div>
            )}
          </div>
        )}
      </section>
    </PageShell>
  );
}