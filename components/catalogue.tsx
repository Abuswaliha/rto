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
import { useDemoMode } from "./demo-mode-provider";
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
        d: "Complete a guided, resumable application.",
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
    description: "Check vehicle information and registration guidance.",
    items: [
      {
        t: "Check a vehicle",
        d: "Search a sample registration.",
        h: "/vehicles/search",
        live: true,
        icon: Car,
      },
      {
        t: "Vehicle Transfer Service",
        d: "Apply for online ownership transfer and RC endorsement.",
        h: "/vehicles/transfer",
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
        d: "Check and pay a challan.",
        h: "/challans",
        live: true,
        icon: WalletCards,
      },
      {
        t: "Grievance",
        d: "Raise a service issue in three simple steps.",
        h: "/grievance",
        live: true,
        icon: Gavel,
      },
    ],
  },
];

export function Services() {
  const { enabled: demoMode } = useDemoMode();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCatalog = catalog
    .map((group) => {
      const filteredItems = group.items.filter(
        (item) =>
          item.t.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.d.toLowerCase().includes(searchQuery.toLowerCase()) ||
          group.cat.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return { ...group, items: filteredItems };
    })
    .filter((group) => group.items.length > 0);

  return (
    <PageShell>
      {/* Hero Header - Full Screen Width & Sleek Compact Sizing */}
      <section className="bg-gradient-to-r from-[#075c48] via-[#0b6b55] to-[#0e765d] py-8 text-white md:py-10">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col justify-between gap-6 px-4 sm:px-8 lg:px-12 md:flex-row md:items-end">
          <div className="max-w-2xl w-full">
            <span className="mb-2.5 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white/90 backdrop-blur-sm">
              <ShieldCheck size={14} />
              Smart RTO services
            </span>

            <h1 className="text-xl font-bold tracking-tight text-white md:text-2xl">
              What can we help you with?
            </h1>

            <p className="mt-1.5 text-xs leading-relaxed text-white/80 md:text-sm">
              Start an online application or search the transport services catalogue below.
            </p>

            {/* Live Search Bar */}
            <div className="mt-4 relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#167c74]" size={16} />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services (e.g. Licence, Transfer, eChallan)..."
                className="pl-9 h-10 bg-white text-[#152321] text-xs placeholder:text-[#667572] rounded-xl shadow-md border-0 focus-visible:ring-2 focus-visible:ring-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 hover:text-gray-800 bg-gray-100 rounded-full px-2 py-0.5"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {demoMode && (
            <div className="flex max-w-xs items-start gap-2.5 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-md">
              <Info size={16} className="shrink-0 text-white/90 mt-0.5" />
              <div className="text-[11px]">
                <strong className="block font-bold text-white">Demo environment</strong>
                <span className="mt-0.5 block leading-tight text-white/75">
                  All records and transactions shown here are fictional.
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Service Catalogue List - Full Screen Width */}
      <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-8 lg:px-12">
        {filteredCatalog.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
            <Search className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <h3 className="text-base font-bold text-slate-800">No services found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms.</p>
            <Button onClick={() => setSearchQuery("")} variant="outline" size="sm" className="mt-3 text-xs">
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredCatalog.map((group) => (
              <section key={group.cat}>
                <div className="mb-4 flex items-end justify-between border-b border-slate-100 pb-2.5">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-[#152321]">
                      {group.cat}
                    </h2>
                    <p className="mt-0.5 text-xs text-[#5e6f68]">{group.description}</p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-[#5e6f68]">
                    {group.items.length}{" "}
                    {group.items.length === 1 ? "service" : "services"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {group.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <Card
                        key={item.t}
                        className="group flex min-h-[190px] flex-col justify-between rounded-xl border border-[#dce8e5] bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-[#167c74] hover:shadow-md"
                      >
                        <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0 pb-2">
                          <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#ddf3ef] text-[#167c74]">
                            <Icon size={18} />
                          </div>
                          <Badge
                            variant={item.live ? "success" : "outline"}
                            className="gap-1 text-[10px] font-bold py-0.5 px-2"
                          >
                            {item.live && demoMode ? (
                              <>
                                <span className="h-1.5 w-1.5 rounded-full bg-[#0d5c45]" />
                                Working demo
                              </>
                            ) : (
                              <>
                                <Info size={11} />
                                Available
                              </>
                            )}
                          </Badge>
                        </CardHeader>

                        <CardContent className="p-0 my-2">
                          <CardTitle className="text-sm font-bold text-[#152321] group-hover:text-[#167c74]">
                            {item.t}
                          </CardTitle>
                          <CardDescription className="mt-1 text-xs text-[#5e6f68] leading-relaxed">
                            {item.d}
                          </CardDescription>
                        </CardContent>

                        <CardFooter className="p-0 pt-2 border-t border-slate-50">
                          <Button
                            variant="link"
                            className="p-0 text-xs font-bold text-[#167c74] group-hover:text-[#0d5c45]"
                            asChild
                          >
                            <Link href={item.h} className="flex items-center gap-1">
                              <span>{item.live ? "Start service" : "Read guidance"}</span>
                              <ArrowRight
                                size={13}
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
        )}
      </main>
    </PageShell>
  );
}

export function ChallanCheck() {
  const [vehicleNo, setVehicleNo] = useState("MH10EA1234");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(true);
  const [paid, setPaid] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!vehicleNo.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSearched(true);
      setPaid(false);
    }, 400);
  }

  return (
    <PageShell>
      <section className="bg-gradient-to-r from-[#075c48] via-[#0b6b55] to-[#0e765d] py-12 text-white">
        <div className="mx-auto max-w-4xl px-6">
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-0 mb-3">
            Traffic Police & RTO eChallan
          </Badge>
          <h1 className="text-2xl font-extrabold md:text-3xl">Pay Traffic eChallan Fines</h1>
          <p className="mt-2 text-sm text-white/80">
            Enter your vehicle registration plate or challan number to search and clear pending traffic violations.
          </p>

          <form onSubmit={handleSearch} className="mt-6 flex max-w-lg gap-2">
            <Input
              value={vehicleNo}
              onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
              placeholder="e.g. MH10EA1234"
              className="bg-white text-[#152321] font-mono font-bold h-11 uppercase"
            />
            <Button type="submit" disabled={loading} className="bg-white text-[#075c48] hover:bg-slate-100 font-bold px-6 h-11">
              {loading ? "Searching..." : "Check Challan"}
            </Button>
          </form>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-6 py-10">
        {searched && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <div>
                  <h3 className="font-extrabold text-base text-[#152321]">Vehicle: {vehicleNo}</h3>
                  <p className="text-xs text-[#5e6f68]">Challan No: CHL-2026-887412 • MH-10 Sangli Traffic RTO</p>
                </div>
                <Badge variant={paid ? "success" : "destructive"}>
                  {paid ? "Paid & Cleared" : "Pending Payment"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[#5e6f68] block">Violation Type</span>
                  <strong className="text-[#152321]">Over-Speeding (Section 183)</strong>
                </div>
                <div>
                  <span className="text-[#5e6f68] block">Date & Time</span>
                  <strong className="text-[#152321]">24 Aug 2026, 14:20 PM</strong>
                </div>
                <div>
                  <span className="text-[#5e6f68] block">Fine Amount</span>
                  <strong className="text-[#0d5c45] text-sm">₹ 500.00</strong>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end gap-3">
                {!paid ? (
                  <Button
                    onClick={() => setPaid(true)}
                    className="bg-[#0d5c45] hover:bg-[#094735] font-bold gap-2"
                  >
                    Pay Fine Online (₹ 500)
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0d5c45]">
                    <CheckCircle2 size={16} /> Receipt #REC-2026-9912 generated
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </main>
    </PageShell>
  );
}
