"use client";

import Link from "./safe-link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  Circle,
  Download,
  FileCheck2,
  FileText,
  IdCard,
  Landmark,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { DemoApplication, loadApplication, loadApplicationsList } from "@/lib/storage";
import { PageShell } from "./page-shell";
import { appointmentParts } from "@/lib/appointment";
import {
  downloadApplicationPdf,
  downloadAppointmentPdf,
  downloadPermanentDLPdf,
  downloadVehicleTransferPdf,
} from "@/lib/demo-pdf";
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
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";

const SAMPLE_APPLICATIONS: Record<string, DemoApplication> = {
  "SRTO-LL-2026-001284": {
    id: "SRTO-LL-2026-001284",
    status: "appointment-scheduled",
    appointment: "29 Aug · 11:20 AM",
    rto: "MH-10 Sangli RTO",
    submittedAt: "2026-08-25T10:30:00.000Z",
    fullName: "Demo Citizen",
    appointmentId: "APT-LL-20037",
    paymentReference: "TESTPAY-2026-483921",
    paymentMethod: "Demo Online UPI",
    feeTotal: "INR 170.00 (Paid)",
    identity: "9999 8888 7777",
    dob: "15/01/2000",
    guardian: "Ramesh Citizen",
    gender: "Male",
    address: "Flat 402, Green Avenue",
    city: "Sangli",
    pincode: "416416",
    state: "Maharashtra",
    vehicle: "MCWG (Bike) / LMV (Car)",
    documents: ["Aadhaar eKYC", "PAN Record", "Form 1 Medical Declaration", "10th Marksheet"],
  },
  "SRTO-DL-2026-894210": {
    id: "SRTO-DL-2026-894210",
    status: "appointment-scheduled",
    appointment: "02 Sep · 11:30 AM",
    rto: "MH-10 Sangli RTO (Automated Driving Track)",
    submittedAt: "2026-08-27T14:15:00.000Z",
    fullName: "Demo Citizen",
    appointmentId: "APT-DL-98214",
    paymentReference: "TESTPAY-DL-894210",
    paymentMethod: "Demo Online UPI",
    feeTotal: "INR 400.00 (Paid)",
    identity: "9999 8888 7777",
    dob: "15/01/2000",
    guardian: "Ramesh Citizen",
    gender: "Male",
    address: "Flat 402, Green Avenue",
    city: "Sangli",
    pincode: "416416",
    state: "Maharashtra",
    vehicle: "MCWG / LMV (Smart Card DL)",
    documents: ["Approved LL MH10/LL/2026/009841", "Form 1 Medical Attestation", "eKYC"],
  },
  "SRTO-VT-2026-818352": {
    id: "SRTO-VT-2026-818352",
    status: "under-review",
    appointment: "RC Endorsement in Scrutiny",
    rto: "MH-10 Sangli RTO",
    submittedAt: "2026-08-28T09:00:00.000Z",
    fullName: "Demo Citizen (Transferee / Buyer)",
    appointmentId: "VT-DOC-818352",
    paymentReference: "TESTPAY-VT-818352",
    paymentMethod: "Demo Online UPI",
    feeTotal: "INR 300.00 (Paid)",
    identity: "9999 8888 7777",
    mobile: "9876543210",
    dob: "15/01/2000",
    guardian: "Rajesh Sharma (Seller)",
    gender: "Male",
    address: "Flat 402, Green Avenue, Sangli 416416",
    city: "Sangli",
    pincode: "416416",
    state: "Maharashtra",
    vehicle: "MH10AB1234 (Tata Nexon EV)",
    documents: ["Form 29 Notice of Transfer", "Form 30 Application for Intimation", "Section 50 Self-Declaration"],
  },
  "SRTO-VT-2026-102948": {
    id: "SRTO-VT-2026-102948",
    status: "under-review",
    appointment: "RC Endorsement in Scrutiny",
    rto: "MH-10 Sangli RTO",
    submittedAt: "2026-08-28T09:00:00.000Z",
    fullName: "Demo Citizen (Transferee / Buyer)",
    appointmentId: "VT-DOC-102948",
    paymentReference: "TESTPAY-VT-102948",
    paymentMethod: "Demo Online UPI",
    feeTotal: "INR 300.00 (Paid)",
    identity: "9999 8888 7777",
    mobile: "9876543210",
    dob: "15/01/2000",
    guardian: "Rajesh Sharma (Seller)",
    gender: "Male",
    address: "Flat 402, Green Avenue, Sangli 416416",
    city: "Sangli",
    pincode: "416416",
    state: "Maharashtra",
    vehicle: "MH10AB1234 (Tata Nexon EV)",
    documents: ["Form 29 Notice of Transfer", "Form 30 Application for Intimation", "Section 50 Self-Declaration"],
  },
};

export function Tracking() {
  const [app, setApp] = useState<DemoApplication | null>(null);
  const [appsList, setAppsList] = useState<DemoApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentApp, setCurrentApp] = useState<DemoApplication>(
    SAMPLE_APPLICATIONS["SRTO-LL-2026-001284"]
  );

  useEffect(() => {
    const savedList = loadApplicationsList();
    setAppsList(savedList);

    const saved = loadApplication();
    if (saved && saved.id) {
      setApp(saved);
      setCurrentApp(saved);
      setSearchQuery(saved.id);
    }
  }, []);

  function performLookup(rawQuery: string) {
    const query = (rawQuery || "").trim().toUpperCase();
    if (!query) return;

    // 1. Check in saved list from local storage
    const foundInList = appsList.find((a) => (a.id || "").toUpperCase() === query);
    if (foundInList) {
      setCurrentApp(foundInList);
      return;
    }

    // 2. Check in SAMPLE_APPLICATIONS
    if (SAMPLE_APPLICATIONS[query]) {
      setCurrentApp(SAMPLE_APPLICATIONS[query]);
      return;
    }

    // 3. Dynamic lookup by ID prefix
    if (query.includes("VT") || query.startsWith("SRTO-VT") || query.includes("818352")) {
      const num = query.replace(/\D/g, "").slice(-6) || "818352";
      setCurrentApp({
        id: query.startsWith("SRTO-VT") ? query : `SRTO-VT-2026-${num}`,
        status: "under-review",
        appointment: "RC Endorsement in Scrutiny",
        rto: "MH-10 Sangli RTO",
        submittedAt: new Date().toISOString(),
        fullName: "Demo Citizen (Transferee / Buyer)",
        appointmentId: `VT-DOC-${num}`,
        paymentReference: `TESTPAY-VT-${num}`,
        paymentMethod: "Demo Online UPI",
        feeTotal: "INR 300.00 (Paid)",
        identity: "9999 8888 7777",
        mobile: "9876543210",
        address: "Flat 402, Green Avenue, Sangli 416416",
        vehicle: "MH10AB1234 (Tata Nexon EV)",
        guardian: "Rajesh Sharma (Seller)",
        documents: ["Form 29 Notice of Transfer", "Form 30 Application for Intimation", "Section 50 Self-Declaration"],
      });
    } else if (query.includes("DL") || query.startsWith("SRTO-DL")) {
      const num = query.replace(/\D/g, "").slice(-6) || "894210";
      setCurrentApp({
        id: query.startsWith("SRTO-DL") ? query : `SRTO-DL-2026-${num}`,
        status: "appointment-scheduled",
        appointment: "02 Sep · 11:30 AM",
        rto: "MH-10 Sangli RTO (Automated Driving Track)",
        submittedAt: new Date().toISOString(),
        fullName: "Demo Citizen",
        appointmentId: `APT-DL-${num}`,
        paymentReference: `TESTPAY-DL-${num}`,
        paymentMethod: "Demo Online UPI",
        feeTotal: "INR 400.00 (Paid)",
        identity: "9999 8888 7777",
        vehicle: "MCWG / LMV (Smart Card DL)",
        documents: ["Approved LL MH10/LL/2026/009841", "Form 1 Medical Attestation", "eKYC"],
      });
    } else {
      const num = query.replace(/\D/g, "").slice(-6) || "001284";
      setCurrentApp({
        id: query.startsWith("SRTO-LL") ? query : `SRTO-LL-2026-${num}`,
        status: "appointment-scheduled",
        appointment: "29 Aug · 11:20 AM",
        rto: "MH-10 Sangli RTO",
        submittedAt: new Date().toISOString(),
        fullName: "Demo Citizen",
        appointmentId: `APT-LL-${num}`,
        paymentReference: `TESTPAY-LL-${num}`,
        paymentMethod: "Demo Online UPI",
        feeTotal: "INR 170.00 (Paid)",
        identity: "9999 8888 7777",
        vehicle: "MCWG (Bike) / LMV (Car)",
        documents: ["Aadhaar eKYC", "PAN Record", "Form 1 Medical Declaration", "10th Marksheet"],
      });
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    performLookup(searchQuery);
  }

  const isDL = currentApp.id.includes("DL") || (currentApp.vehicle || "").includes("Smart Card");
  const isVT = currentApp.id.includes("VT") || (currentApp.vehicle || "").includes("Tata Nexon");
  const selectedAppointment = appointmentParts(currentApp.appointment);
  const lastUpdated = new Date(currentApp.submittedAt || Date.now()).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  function triggerDownload() {
    if (isDL) {
      downloadPermanentDLPdf({
        applicationId: currentApp.id,
        applicantName: currentApp.fullName || "Demo Citizen",
        aadhaarNumber: "9999 8888 7777",
        panNumber: "ABCDE1234F",
        llNumber: "MH10/LL/2026/009841",
        vehicleClasses: ["MCWG", "LMV"],
        medicalStatus: "Fit (Form 1 Self-Declaration Attested)",
        organDonation: "Yes (Pledged)",
        rtoOffice: currentApp.rto || "MH-10 Sangli RTO",
        slotTime: currentApp.appointment || "02 Sep · 11:30 AM",
        feePaid: "INR 400.00 (Paid)",
        paymentRef: currentApp.paymentReference || "TESTPAY-DL-894210",
      });
    } else if (isVT) {
      downloadVehicleTransferPdf({
        applicationId: currentApp.id,
        regNumber: "MH10AB1234",
        sellerName: "Rajesh Sharma",
        buyerName: currentApp.fullName || "Demo Citizen",
        buyerAadhaar: "9999 8888 7777",
        buyerMobile: "9999999999",
        buyerAddress: currentApp.address || "Flat 402, Green Avenue, Sangli 416416",
        makerModel: "Tata Nexon EV (Electric)",
        rtoOffice: currentApp.rto || "MH-10 Sangli RTO",
        transferType: "Sale & Purchase (Form 29 & 30)",
        feePaid: "INR 300.00 (Paid)",
        paymentRef: currentApp.paymentReference || "TESTPAY-VT-102948",
      });
    } else {
      downloadApplicationPdf(currentApp);
    }
  }

  function triggerAppointmentDownload() {
    downloadAppointmentPdf(currentApp);
  }

  const timelineSteps = isDL
    ? [
        ["Form 4 DL Submitted", "Online e-Sign", "Application and approved LL verified."],
        ["Prerequisite Verified", "Holding Period Met", "LL holding period passed with clean driving history."],
        ["Automated Track Slot Booked", selectedAppointment.timelineDate || "02 Sep 2026", "Attend practical driving test at sensor track."],
        ["Competence Exam", "Pending", "Automated sensor-based track evaluation."],
        ["Smart Card Dispatch", "Pending", "Form 7 PVC Chip Smart Card printed and couriered."],
      ]
    : isVT
    ? [
        ["Form 29 & 30 Submitted", "Online e-Consent", "Seller and buyer mutual consent authenticated."],
        ["Section 50 Declaration", "Verified", "Statutory attestation: Free from encumbrance & pending dues."],
        ["RTO Scrutiny", "In Progress", "Verification of engine, chassis & clearance NOC."],
        ["RC Endorsement", "Pending", "Transfer endorsement on central VAHAN registry."],
        ["New RC Issued", "Pending", "Updated Form 23 Smart Card RC available in Wallet."],
      ]
    : [
        ["Application Submitted", "25 Aug 2026", "Aadhaar eKYC verified and fee paid."],
        ["Documents Verified", "25 Aug 2026", "Digital locker credentials authenticated."],
        ["Computer Theory Exam Slot", selectedAppointment.timelineDate || "29 Aug 2026", "Attend online computer test at RTO."],
        ["Learner Test Result", "Pending", "Score 60%+ on traffic signals and safety questions."],
        ["Learner Licence Issuance", "Pending", "Form 2 LL instantly issued and ready in Wallet."],
      ];

  return (
    <PageShell>
      {/* Tracking Hero */}
      <section className="border-b border-[#dce8e5] bg-gradient-to-br from-[#f7fbfa] via-white to-[#edf7f4] py-10">
        <div className="mx-auto max-w-6xl px-6">
          <Badge variant="secondary" className="mb-2 gap-1.5 font-bold">
            <Search size={14} className="text-[#167c74]" /> Real-Time Application Tracking
          </Badge>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#152321] md:text-3xl">
            Track Application Status & Download Receipts
          </h1>
          <p className="mt-1 max-w-2xl text-xs font-medium text-[#5e6f68] md:text-sm">
            Inspect real-time application processing, review booked test slots, and download official government vector PDF receipts.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearch}
            className="mt-6 flex max-w-xl items-center gap-2 rounded-2xl border border-[#cfe3dd] bg-white p-2 shadow-xs"
          >
            <Search className="ml-2 text-[#5e6f68]" size={18} />
            <input
              aria-label="Application number"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (val.trim().length >= 10) {
                  performLookup(val);
                }
              }}
              placeholder="Enter Application ID (e.g. SRTO-VT-2026-818352)"
              className="flex-1 bg-transparent px-2 text-xs sm:text-sm font-mono text-[#152321] outline-none uppercase"
            />
            <Button
              type="button"
              size="sm"
              onClick={() => performLookup(searchQuery)}
              className="gap-1.5 px-4 font-bold bg-[#167c74] hover:bg-[#126b64] text-white"
            >
              <Search size={14} /> Track Status
            </Button>
          </form>

          {/* Quick Filter Badges */}
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="text-[#5e6f68] text-[11px] self-center">Applications:</span>
            {Array.from(new Set([...Object.keys(SAMPLE_APPLICATIONS), ...appsList.map((a) => a.id)])).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setSearchQuery(id);
                  const found = appsList.find((a) => a.id === id) || SAMPLE_APPLICATIONS[id];
                  if (found) {
                    setCurrentApp(found);
                  } else {
                    handleSearch({ preventDefault: () => {} } as React.FormEvent);
                  }
                }}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-mono font-bold transition-all ${
                  currentApp.id === id
                    ? "bg-[#167c74] text-white"
                    : "bg-white border border-[#cfe3dd] text-[#167c74] hover:bg-[#edf7f4]"
                }`}
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          {/* Column 1: Application Status Card & Details */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card className="p-6">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success" className="text-[11px] font-bold">
                      {currentApp.status === "appointment-scheduled"
                        ? "Test Scheduled · Active Slot"
                        : "Submitted · In Scrutiny"}
                    </Badge>
                    <span className="text-xs text-[#5e6f68]">
                      {isDL ? "Form 4 Permanent DL" : isVT ? "Form 29/30 RC Transfer" : "Form 2 Learner Licence"}
                    </span>
                  </div>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-[#152321] font-mono">
                    {currentApp.id}
                  </h2>
                  <span className="text-xs text-[#5e6f68]">
                    Last updated on {lastUpdated}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={triggerDownload} className="gap-1.5 shadow-sm">
                    <Download size={16} /> Download Official PDF
                  </Button>
                </div>
              </div>

              {/* Next Action Box */}
              <div className="mt-5 rounded-2xl border border-[#cfe3dd] bg-[#edf7f4] p-4 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#167c74] text-white">
                    <CalendarDays size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0f7655]">
                      Active Appointment / Next Action
                    </span>
                    <strong className="block text-sm font-bold text-[#152321]">
                      {currentApp.appointment}
                    </strong>
                    <span className="text-[#5e6f68]">{currentApp.rto}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="w-fit">
                  Confirmed
                </Badge>
              </div>

              {/* Application Timeline */}
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0f7655]">
                  Application Progress Tracker
                </h3>
                <ol className="mt-4 space-y-4">
                  {timelineSteps.map(([title, date, desc], idx) => {
                    const isDone = idx < 2;
                    const isActive = idx === 2;
                    return (
                      <li key={title} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                              isDone
                                ? "bg-[#167c74] text-white"
                                : isActive
                                ? "border-2 border-[#167c74] bg-[#ddf3ef] text-[#167c74]"
                                : "border border-slate-200 bg-slate-50 text-slate-400"
                            }`}
                          >
                            {isDone ? <Check size={14} /> : isActive ? <CalendarDays size={14} /> : <Circle size={8} />}
                          </div>
                          {idx < timelineSteps.length - 1 && (
                            <div className={`w-0.5 flex-1 my-1 ${isDone ? "bg-[#167c74]" : "bg-slate-200"}`} />
                          )}
                        </div>
                        <div className="pb-3 text-xs">
                          <div className="flex items-center gap-2">
                            <strong className="text-sm font-bold text-[#152321]">{title}</strong>
                            <span className="text-[11px] text-[#5e6f68]">· {date}</span>
                          </div>
                          <p className="mt-0.5 text-xs text-[#5e6f68] leading-relaxed">{desc}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </Card>

            {/* Official PDF Preview & Direct Download Box */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-[#152321]">
                    Document & Receipt Downloads
                  </h3>
                  <p className="text-xs text-[#5e6f68]">
                    Generated authentic government vector PDF files (IT Act 2000 compliant).
                  </p>
                </div>
                <Badge variant="secondary">Vector PDF</Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#cfe3dd] bg-[#edf7f4] p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-[#167c74]" />
                      <strong className="text-xs font-bold text-[#152321]">
                        {isDL ? "Form 4 DL Application" : isVT ? "Form 29/30 Transfer Form" : "Form 2 LL Application"}
                      </strong>
                    </div>
                    <p className="mt-1 text-[11px] text-[#5e6f68]">
                      Complete application form with applicant details, eKYC, and fee receipt.
                    </p>
                  </div>
                  <Button size="sm" onClick={triggerDownload} className="w-full gap-1.5 text-xs">
                    <Download size={14} /> Download Application PDF
                  </Button>
                </div>

                <div className="rounded-2xl border border-[#cfe3dd] bg-white p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <QrCode size={18} className="text-[#167c74]" />
                      <strong className="text-xs font-bold text-[#152321]">
                        Appointment Entry Slip
                      </strong>
                    </div>
                    <p className="mt-1 text-[11px] text-[#5e6f68]">
                      Official RTO entry slip with QR code, slot time, and gate verification permit.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={triggerAppointmentDownload} className="w-full gap-1.5 text-xs">
                    <Download size={14} /> Download Slot Slip PDF
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Column 2: Application Details Sidebar */}
          <aside className="space-y-4">
            <Card className="p-5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0f7655]">
                <FileCheck2 size={16} /> Application Record Summary
              </div>

              <dl className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <dt className="text-[#5e6f68]">Applicant Name</dt>
                  <dd className="font-semibold text-[#152321]">{currentApp.fullName}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <dt className="text-[#5e6f68]">Identity Verification</dt>
                  <dd className="font-mono text-[#152321]">{currentApp.identity || "9999 8888 7777"}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <dt className="text-[#5e6f68]">Assigned RTO</dt>
                  <dd className="font-semibold text-[#152321]">{currentApp.rto}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <dt className="text-[#5e6f68]">Test Schedule</dt>
                  <dd className="font-bold text-[#0d5c45]">{currentApp.appointment}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <dt className="text-[#5e6f68]">Payment Reference</dt>
                  <dd className="font-mono text-[#152321]">{currentApp.paymentReference}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#5e6f68]">Total Paid</dt>
                  <dd className="font-bold text-[#0d5c45]">{currentApp.feeTotal || "INR 170.00"}</dd>
                </div>
              </dl>
            </Card>

            <Card className="p-5 border-[#cfe3dd] bg-[#edf7f4] text-xs space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#167c74]" />
                <strong className="text-sm font-bold text-[#0d5c45]">Digital Guarantee</strong>
              </div>
              <p className="text-[#5e6f68] leading-relaxed">
                All receipts and applications generated on Smart RTO comply with Information Technology Act 2000 and are valid across all enforcement checkpoints.
              </p>
              <Button size="sm" onClick={triggerDownload} className="w-full gap-1.5">
                <Download size={14} /> Download PDF Receipt
              </Button>
            </Card>
          </aside>
        </div>
      </main>
    </PageShell>
  );
}
