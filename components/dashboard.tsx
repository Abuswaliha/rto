"use client";

import Link from "./safe-link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  Gauge,
  IdCard,
  Landmark,
  QrCode,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DemoAadhaarProfile,
  DemoApplication,
  Draft,
  loadApplication,
  loadApplicationsList,
  loadDemoProfile,
  loadDraft,
} from "@/lib/storage";
import { PageShell } from "./page-shell";
import { appointmentParts } from "@/lib/appointment";
import {
  isAppwriteConfigured,
  listUserApplications,
  ApplicationDocument,
} from "@/lib/appwrite";
import {
  downloadApplicationPdf,
  downloadPermanentDLPdf,
  downloadVehicleTransferPdf,
} from "@/lib/demo-pdf";

interface ServiceItem {
  id: string;
  title: string;
  category: "all" | "licence" | "vehicle" | "enforcement";
  desc: string;
  fee: string;
  formNumber: string;
  icon: typeof FileText;
  route: string;
  badge: string;
}

const SERVICES_CATALOG: ServiceItem[] = [
  {
    id: "ll",
    title: "Learner Licence (LL)",
    category: "licence",
    desc: "Apply online with Aadhaar eKYC, medical declaration, and test slot.",
    fee: "₹170",
    formNumber: "Form 2",
    icon: FileText,
    route: "/apply/learner-licence",
    badge: "5-Step Online",
  },
  {
    id: "dl",
    title: "Permanent Driving Licence",
    category: "licence",
    desc: "Upgrade with approved LL number and book driving track test slot.",
    fee: "₹400",
    formNumber: "Form 4",
    icon: IdCard,
    route: "/apply/permanent-licence",
    badge: "Track Slot Booking",
  },
  {
    id: "vehicle-transfer",
    title: "Vehicle Transfer Service",
    category: "vehicle",
    desc: "Apply for ownership transfer (Form 29/30) & RC endorsement.",
    fee: "₹300",
    formNumber: "Form 29 & 30",
    icon: Car,
    route: "/vehicles",
    badge: "Ownership Transfer",
  },
  {
    id: "vehicle-search",
    title: "Vehicle RC Lookup",
    category: "vehicle",
    desc: "Search vehicle registration number to inspect RC, insurance & PUCC.",
    fee: "Free",
    formNumber: "Vahan DB",
    icon: Car,
    route: "/vehicles",
    badge: "Instant RC Check",
  },
  {
    id: "challans",
    title: "eChallan Search & Pay",
    category: "enforcement",
    desc: "Review and test-pay traffic violation challans with mock checkout.",
    fee: "Fine Based",
    formNumber: "Traffic Div",
    icon: ShieldAlert,
    route: "/challans",
    badge: "Instant Payment",
  },
  {
    id: "wallet",
    title: "Digital Document Wallet",
    category: "enforcement",
    desc: "Verified Aadhaar, DL, RC, PUCC, and Insurance in one secure locker.",
    fee: "DigiLocker",
    formNumber: "Locker",
    icon: WalletCards,
    route: "/wallet",
    badge: "Official PDF Export",
  },
];

export function Dashboard() {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [application, setApplication] = useState<DemoApplication | null>(null);
  const [applicationsList, setApplicationsList] = useState<DemoApplication[]>([]);
  const [profile, setProfile] = useState<DemoAadhaarProfile | null>(null);
  const [appwriteApps, setAppwriteApps] = useState<ApplicationDocument[]>([]);
  const [activeCategory, setActiveCategory] = useState<"all" | "licence" | "vehicle" | "enforcement">("all");
  const [loadingDb, setLoadingDb] = useState(false);

  useEffect(() => {
    setDraft(loadDraft());
    const local = loadApplication();
    setApplication(local);
    const list = loadApplicationsList();
    setApplicationsList(list);
    setProfile(loadDemoProfile());

    if (isAppwriteConfigured) {
      setLoadingDb(true);
      listUserApplications("user_123456")
        .then((items) => {
          setAppwriteApps(items);
          setLoadingDb(false);
        })
        .catch(() => {
          setLoadingDb(false);
        });
    }
  }, []);

  const progress = Math.round(((draft?.step || 0) / 5) * 100);
  const allApps = applicationsList.length > 0 ? applicationsList : application ? [application] : [];
  const hasApp = allApps.length > 0 || appwriteApps.length > 0;

  const filteredServices = SERVICES_CATALOG.filter(
    (s) => activeCategory === "all" || s.category === activeCategory,
  );

  function handleDownloadAppPdf(app: DemoApplication) {
    if (app.id.includes("DL") || (app.vehicle || "").includes("Smart Card")) {
      downloadPermanentDLPdf({
        applicationId: app.id,
        applicantName: app.fullName || "Demo Citizen",
        aadhaarNumber: "9999 8888 7777",
        panNumber: "ABCDE1234F",
        llNumber: "MH10/LL/2026/009841",
        vehicleClasses: ["MCWG", "LMV"],
        medicalStatus: "Fit (Form 1 Self-Declaration Attested)",
        organDonation: "Yes (Pledged)",
        rtoOffice: app.rto || "MH-10 Sangli RTO",
        slotTime: app.appointment || "02 Sep · 11:30 AM",
        feePaid: "INR 400.00 (Paid)",
        paymentRef: app.paymentReference || "TESTPAY-DL-894210",
      });
    } else if (app.id.includes("VT") || (app.vehicle || "").includes("Tata Nexon")) {
      downloadVehicleTransferPdf({
        applicationId: app.id,
        regNumber: "MH10AB1234",
        sellerName: "Rajesh Sharma",
        buyerName: app.fullName || "Demo Citizen",
        buyerAadhaar: "9999 8888 7777",
        buyerMobile: "9999999999",
        buyerAddress: app.address || "Flat 402, Green Avenue, Sangli 416416",
        makerModel: "Tata Nexon EV (Electric)",
        rtoOffice: app.rto || "MH-10 Sangli RTO",
        transferType: "Sale & Purchase (Form 29 & 30)",
        feePaid: "INR 300.00 (Paid)",
        paymentRef: app.paymentReference || "TESTPAY-VT-102948",
      });
    } else {
      downloadApplicationPdf(app);
    }
  }

  return (
    <PageShell>
      {/* Dashboard Hero */}
      <section className="border-b border-[#dce8e5] bg-gradient-to-br from-[#f7fbfa] via-white to-[#edf7f4] py-8 md:py-10">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-6 md:flex-row md:items-end">
          <div>
            <Badge variant="secondary" className="mb-2 font-bold gap-1.5">
              <ShieldCheck size={14} className="text-[#167c74]" /> Smart RTO Citizen Portal
            </Badge>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#152321] md:text-3xl">
              Welcome, {profile?.fullName || "Demo Citizen"}
            </h1>
            <p className="mt-1 text-xs font-medium text-[#5e6f68] md:text-sm">
              Unified digital access to Driving Licences, Vehicle RC transfers, and Transport Documents.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/wallet"
              className="flex items-center gap-3 rounded-2xl border border-[#cfe3dd] bg-white p-3.5 shadow-xs transition-all hover:border-[#167c74] hover:shadow-sm"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#ddf3ef] text-[#167c74]">
                <WalletCards size={20} />
              </div>
              <div className="text-left text-xs">
                <strong className="block text-[#152321]">Digital Wallet</strong>
                <span className="text-[#5e6f68]">5 Documents Active</span>
              </div>
            </Link>

            <Link
              href="/track"
              className="flex items-center gap-3 rounded-2xl border border-[#cfe3dd] bg-white p-3.5 shadow-xs transition-all hover:border-[#167c74] hover:shadow-sm"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#167c74] text-white">
                <Search size={20} />
              </div>
              <div className="text-left text-xs">
                <strong className="block text-[#152321]">Track Status</strong>
                <span className="text-[#5e6f68]">Live Application Sync</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Dashboard Layout */}
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
        {/* SECTION 1: Your Active Applications */}
        <section className="space-y-4">
          <div className="flex items-end justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0f7655]">
                Real-Time Records · Appwrite & Local
              </span>
              <h2 className="mt-1 text-xl font-extrabold text-[#152321]">
                Your Applications & Status
              </h2>
            </div>
            {hasApp && (
              <Badge variant="success" className="gap-1 font-bold">
                <CheckCircle2 size={13} /> Active Applications Logged
              </Badge>
            )}
          </div>

          {hasApp && allApps.length > 0 ? (
            <div className="space-y-4">
              {allApps.map((appItem) => {
                const isDL = appItem.id.includes("DL") || (appItem.vehicle || "").includes("Smart Card");
                const isVT = appItem.id.includes("VT") || (appItem.vehicle || "").includes("Tata Nexon");
                const serviceTitle = isDL
                  ? "Permanent Driving Licence (Form 4)"
                  : isVT
                  ? "Vehicle Ownership Transfer (Form 29 & 30)"
                  : "Learner Licence Application (Form 2)";

                return (
                  <Card key={appItem.id} className="p-6 transition-all hover:border-[#167c74] hover:shadow-sm">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="success" className="text-[10px]">
                            {appItem.status === "appointment-scheduled"
                              ? "Test Scheduled · Slot Confirmed"
                              : appItem.status === "under-review"
                              ? "Under Review · In Scrutiny"
                              : appItem.status}
                          </Badge>
                          <span className="font-mono text-xs font-bold text-[#167c74]">
                            {appItem.id}
                          </span>
                        </div>

                        <h3 className="text-lg font-extrabold text-[#152321]">
                          {serviceTitle}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-[#5e6f68]">
                          <span className="flex items-center gap-1.5">
                            <Landmark size={14} className="text-[#167c74]" /> {appItem.rto}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <CalendarDays size={14} className="text-[#167c74]" /> Detail:{" "}
                            <strong className="text-[#0d5c45]">{appItem.appointment}</strong>
                          </span>
                          <span className="flex items-center gap-1.5 font-mono">
                            Ref: {appItem.paymentReference || "TESTPAY-2026-483921"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <Button
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleDownloadAppPdf(appItem)}
                        >
                          <Download size={14} /> Download PDF
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link href="/track" className="gap-1.5">
                            <QrCode size={14} /> Track Progress
                          </Link>
                        </Button>
                      </div>
                    </div>

                    {/* Progress Steps Timeline */}
                    <div className="mt-6 border-t border-slate-100 pt-4">
                      <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                        <div className="flex flex-col items-center gap-1 text-[#0d5c45]">
                          <CheckCircle2 size={16} />
                          <span className="font-bold">Submitted</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 text-[#0d5c45]">
                          <CheckCircle2 size={16} />
                          <span className="font-bold">e-Sign / eKYC</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 text-[#0d5c45]">
                          <CheckCircle2 size={16} />
                          <span className="font-bold">{isVT ? "Statutory Notice" : "Slot Booked"}</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 text-[#8ba098]">
                          <Clock3 size={16} />
                          <span className="font-bold">{isVT ? "Endorsement" : "Exam Pending"}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-8 text-center bg-slate-50/50 border-dashed">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#ddf3ef] text-[#167c74]">
                <FileText size={24} />
              </div>
              <h3 className="mt-3 text-base font-bold text-[#152321]">
                No Active Application Submitted Yet
              </h3>
              <p className="mt-1 text-xs text-[#5e6f68]">
                Get started by applying for a Learner Licence, Permanent DL, or Vehicle Transfer.
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <Button size="sm" asChild>
                  <Link href="/apply/learner-licence">Apply for Learner Licence</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/vehicles">Vehicle Transfer</Link>
                </Button>
              </div>
            </Card>
          )}
        </section>

        {/* SECTION 2: Available Services Catalog (Enhanced UX) */}
        <section className="space-y-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0f7655]">
                Fast Online Execution
              </span>
              <h2 className="mt-1 text-xl font-extrabold text-[#152321]">
                Available RTO Citizen Services
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", label: "All Services" },
                { id: "licence", label: "Driving Licences" },
                { id: "vehicle", label: "Vehicle & RC" },
                { id: "enforcement", label: "Challan & Wallet" },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeCategory === tab.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(tab.id as typeof activeCategory)}
                  className="text-xs"
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => {
              const Icon = service.icon;
              return (
                <Card
                  key={service.id}
                  className="group flex flex-col justify-between p-5 transition-all hover:scale-[1.01] hover:border-[#167c74] hover:shadow-md"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#ddf3ef] text-[#167c74] transition-colors group-hover:bg-[#167c74] group-hover:text-white">
                      <Icon size={22} />
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-bold">
                      {service.badge}
                    </Badge>
                  </CardHeader>

                  <CardContent className="p-0 pt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-[#5e6f68]">
                      <span>{service.formNumber}</span>
                      <strong className="text-[#0d5c45] font-bold">{service.fee}</strong>
                    </div>
                    <CardTitle className="text-base font-bold text-[#152321] group-hover:text-[#167c74]">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-[#5e6f68] leading-relaxed">
                      {service.desc}
                    </CardDescription>
                  </CardContent>

                  <CardFooter className="mt-5 border-t border-slate-100 p-0 pt-3">
                    <Button
                      variant="outline"
                      className="w-full justify-between text-xs font-bold text-[#167c74] hover:bg-[#edf7f4] hover:text-[#0d5c45]"
                      asChild
                    >
                      <Link href={service.route}>
                        <span>Launch Service</span>
                        <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
