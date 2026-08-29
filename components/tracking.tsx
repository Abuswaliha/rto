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
  Loader2,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { DemoApplication, loadApplication, loadApplicationsList } from "@/lib/storage";
import { findUserApplicationByNumber, isAppwriteConfigured, listUserDemoApplications } from "@/lib/appwrite";
import { useDemoMode } from "./demo-mode-provider";
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

export function Tracking() {
  const { enabled: demoMode } = useDemoMode();
  const [appwriteApps, setAppwriteApps] = useState<DemoApplication[]>([]);
  const [currentApp, setCurrentApp] = useState<DemoApplication | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [lookupNotice, setLookupNotice] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadAllApps() {
      setLoading(true);
      setNotFound(false);
      setLookupNotice("");

      // 1. Load local applications first
      const localList = loadApplicationsList();
      const localSingle = loadApplication();
      const combinedLocal: DemoApplication[] = [...localList];
      if (localSingle && !combinedLocal.some((a) => a.id === localSingle.id)) {
        combinedLocal.unshift(localSingle);
      }

      if (combinedLocal.length > 0) {
        setAppwriteApps(combinedLocal);
        setCurrentApp(combinedLocal[0]);
        setSearchQuery(combinedLocal[0].id);
        setLookupNotice(`Application ${combinedLocal[0].id} loaded from local records.`);
      }

      // 2. Fetch Appwrite records and merge
      if (isAppwriteConfigured) {
        try {
          const docs = await listUserDemoApplications("user_123456");
          if (docs && docs.length > 0) {
            setAppwriteApps((prev) => {
              const existingIds = new Set(prev.map((a) => a.id));
              const newDocs = docs.filter((d) => !existingIds.has(d.id));
              return [...prev, ...newDocs];
            });

            if (combinedLocal.length === 0) {
              setCurrentApp(docs[0]);
              setSearchQuery(docs[0].id);
              setLookupNotice("Live application records loaded from Appwrite Cloud.");
            }
          }
        } catch {
          // Keep local records active
        }
      }

      setLoading(false);
    }

    void loadAllApps();
  }, []);

  async function performLookup(rawQuery: string) {
    const query = (rawQuery || "").trim().toUpperCase();
    if (!query) return;

    setSearching(true);
    setNotFound(false);
    setLookupNotice("Searching application records...");

    try {
      // 1. Check Local Storage First
      const localList = loadApplicationsList();
      const localSingle = loadApplication();
      const allLocal = [...localList];
      if (localSingle && !allLocal.some((a) => a.id === localSingle.id)) {
        allLocal.unshift(localSingle);
      }

      const localMatch = allLocal.find((a) => (a.id || "").toUpperCase() === query) ||
        appwriteApps.find((a) => (a.id || "").toUpperCase() === query);

      if (localMatch) {
        setCurrentApp(localMatch);
        setLookupNotice(`Application ${localMatch.id} found in local records.`);
        setSearching(false);
        return;
      }

      // 2. If not found locally, search Appwrite Cloud
      if (isAppwriteConfigured) {
        const remote = await findUserApplicationByNumber("user_123456", query);
        if (remote) {
          setAppwriteApps((current) => [remote, ...current.filter((item) => item.id !== remote.id)]);
          setCurrentApp(remote);
          setLookupNotice(`Application ${remote.id} verified & loaded from Appwrite Cloud.`);
          setSearching(false);
          return;
        }
      }

      // 3. Not found in local or Appwrite
      setCurrentApp(null);
      setNotFound(true);
      setLookupNotice(`Application "${query}" not found in local records or Appwrite.`);
    } catch {
      setCurrentApp(null);
      setNotFound(true);
      setLookupNotice("Error searching for application record.");
    } finally {
      setSearching(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    void performLookup(searchQuery);
  }

  const isDL = currentApp ? currentApp.id.includes("DL") || (currentApp.vehicle || "").includes("Smart Card") : false;
  const isVT = currentApp ? currentApp.id.includes("VT") || (currentApp.vehicle || "").includes("Tata Nexon") : false;
  const selectedAppointment = currentApp ? appointmentParts(currentApp.appointment) : { timelineDate: "" };
  const lastUpdated = currentApp
    ? new Date(currentApp.submittedAt || new Date().toISOString()).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  function triggerDownload() {
    if (!currentApp) return;
    if (isDL) {
      downloadPermanentDLPdf({
        applicationId: currentApp.id,
        applicantName: currentApp.fullName || "Applicant",
        aadhaarNumber: currentApp.identity || "9999 8888 7777",
        panNumber: currentApp.pan || "ABCDE1234F",
        llNumber: "MH10/LL/2026/009841",
        vehicleClasses: currentApp.vehicle ? currentApp.vehicle.split(" / ") : ["MCWG", "LMV"],
        medicalStatus: "Fit (Form 1 Self-Declaration Attested)",
        organDonation: "Yes (Pledged)",
        rtoOffice: currentApp.rto || "MH-10 Sangli RTO",
        slotTime: currentApp.appointment || "02 Sep · 11:30 AM",
        feePaid: currentApp.feeTotal || "INR 400.00 (Paid)",
        paymentRef: currentApp.paymentReference || "TESTPAY-DL-894210",
      });
    } else if (isVT) {
      downloadVehicleTransferPdf({
        applicationId: currentApp.id,
        regNumber: currentApp.vehicle?.split(" ")[0] || "MH10AB1234",
        sellerName: currentApp.guardian || "Registered Seller",
        buyerName: currentApp.fullName || "Buyer",
        buyerAadhaar: currentApp.identity || "9999 8888 7777",
        buyerMobile: currentApp.mobile || "9999999999",
        buyerAddress: currentApp.address || "Sangli, Maharashtra",
        makerModel: currentApp.vehicle || "Motor Vehicle",
        rtoOffice: currentApp.rto || "MH-10 Sangli RTO",
        transferType: "Sale & Purchase (Form 29 & 30)",
        feePaid: currentApp.feeTotal || "INR 300.00 (Paid)",
        paymentRef: currentApp.paymentReference || "TESTPAY-VT-102948",
      });
    } else {
      downloadApplicationPdf(currentApp);
    }
  }

  function triggerAppointmentDownload() {
    if (currentApp) {
      downloadAppointmentPdf(currentApp);
    }
  }

  // Determine active timeline step based on application status & code
  const code = (currentApp?.statusCode || "").toUpperCase();
  const statusLower = (currentApp?.status || "").toLowerCase();

  let activeStepIndex = 2; // Default

  // 1. Prioritize specific machine statusCode
  if (code === "DL_DISPATCHED" || code === "RC_TRANSFERRED" || code === "RC_ENDORSED" || code === "ISSUED") {
    activeStepIndex = 4;
  } else if (code === "APPROVED") {
    activeStepIndex = 4;
  } else if (code === "TRACK_TEST_PASSED" || code === "TEST_PASSED") {
    activeStepIndex = 3;
  } else if (code === "TRACK_TEST_SCHEDULED" || code === "SLOT_BOOKED" || code === "APPOINTMENT_SCHEDULED") {
    activeStepIndex = 2;
  } else if (code === "UNDER_REVIEW" || code === "SCRUTINY") {
    activeStepIndex = 1;
  } else if (code === "DRAFT" || code === "SUBMITTED") {
    activeStepIndex = 0;
  } else {
    // 2. Fallback to status text
    if (statusLower.includes("dispatched") || statusLower.includes("transferred") || statusLower.includes("approved")) {
      activeStepIndex = 4;
    } else if (statusLower.includes("passed")) {
      activeStepIndex = 3;
    } else if (statusLower.includes("scheduled") || statusLower.includes("slot")) {
      activeStepIndex = 2;
    } else if (statusLower.includes("scrutiny") || statusLower.includes("review")) {
      activeStepIndex = 1;
    } else if (statusLower.includes("draft") || statusLower.includes("submitted")) {
      activeStepIndex = 0;
    }
  }

  const formattedSubDate = currentApp
    ? new Date(currentApp.submittedAt || new Date().toISOString()).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const timelineSteps = currentApp
    ? isDL
      ? [
          ["Form 4 DL Submitted", formattedSubDate, `Application ID: ${currentApp.id} · Applicant: ${currentApp.fullName || "Citizen"}`],
          ["Prerequisite Verified", formattedSubDate, `Holding LL Verified · Identity: ${currentApp.identity || "Aadhaar eKYC Authenticated"}`],
          ["Automated Track Slot Booked", selectedAppointment.timelineDate || "02 Sep 2026", `RTO: ${currentApp.rto} · Slot: ${currentApp.appointment}`],
          [
            "Competence Exam",
            activeStepIndex >= 4 ? "Passed (100% Score)" : activeStepIndex === 3 ? "In Progress" : "Scheduled",
            activeStepIndex >= 4
              ? "Automated Track Sensor Competence Test Cleared"
              : `Automated Track Sensor Test · Vehicles: ${currentApp.vehicle || "MCWG / LMV"}`,
          ],
          [
            "Smart Card Dispatch",
            activeStepIndex >= 4 ? "Dispatched via Speed Post" : "Pending",
            activeStepIndex >= 4
              ? `Form 7 PVC Smart Card Dispatched · Ref: ${currentApp.paymentReference || "TESTPAY"}`
              : "Form 7 PVC Chip Smart Card Printing",
          ],
        ]
      : isVT
      ? [
          ["Form 29 & 30 Submitted", formattedSubDate, `Application ID: ${currentApp.id} · Buyer: ${currentApp.fullName || "Citizen"}`],
          ["Section 50 Declaration", formattedSubDate, `Statutory Attestation Verified · Vehicle: ${currentApp.vehicle || "MH10AB1234"}`],
          ["RTO Scrutiny", formattedSubDate, `Assigned RTO: ${currentApp.rto} · Document & Clearance Scrutiny`],
          ["RC Endorsement", activeStepIndex > 3 ? "Completed" : "In Scrutiny", `Vahan 4 Central Registry Endorsement · Fee: ${currentApp.feeTotal || "INR 300.00 (Paid)"}`],
          ["New RC Issued", activeStepIndex >= 4 ? "Issued" : "Pending", `Updated Form 23 Smart Card RC · Digitally Active`],
        ]
      : [
          ["Application Submitted", formattedSubDate, `Application ID: ${currentApp.id} · Applicant: ${currentApp.fullName || "Citizen"}`],
          ["Documents Verified", formattedSubDate, `Aadhaar eKYC & PAN Record Authenticated`],
          ["Computer Theory Exam Slot", selectedAppointment.timelineDate || "29 Aug 2026", `RTO: ${currentApp.rto} · Slot: ${currentApp.appointment}`],
          ["Learner Test Result", activeStepIndex > 3 ? "Passed (18/20)" : "Scheduled", `Traffic Safety & Road Signals Online Computer Exam`],
          ["Learner Licence Issuance", activeStepIndex >= 4 ? "Issued" : "Pending", `Form 2 Learner Licence · Instant Digital Issue`],
        ]
    : [];

  return (
    <PageShell>
      {/* Tracking Hero - Full Screen Width */}
      <section className="border-b border-[#dce8e5] bg-gradient-to-br from-[#f7fbfa] via-white to-[#edf7f4] py-8 md:py-10">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-12">
          <Badge variant="secondary" className="mb-2 gap-1.5 font-bold">
            <Search size={14} className="text-[#167c74]" /> Real-Time Application Tracking
          </Badge>
          <h1 className="text-xl font-bold tracking-tight text-[#152321] md:text-2xl">
            Track Application Status & Download Receipts
          </h1>
          <p className="mt-1 max-w-3xl text-xs font-medium text-[#5e6f68] md:text-sm">
            Inspect real-time application processing, review booked test slots, and download official government vector PDF receipts.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearch}
            className="mt-5 flex max-w-xl items-center gap-2 rounded-2xl border border-[#cfe3dd] bg-white p-2 shadow-xs"
          >
            <Search className="ml-2 text-[#5e6f68]" size={18} />
            <input
              aria-label="Application number"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Application ID (e.g. SRTO-DL-2026-231158)"
              className="flex-1 bg-transparent px-2 text-xs sm:text-sm font-mono text-[#152321] outline-none uppercase"
            />
            <Button
              type="submit"
              size="sm"
              disabled={searching || !searchQuery.trim()}
              className="gap-1.5 px-4 font-bold bg-[#167c74] hover:bg-[#126b64] text-white disabled:opacity-60 cursor-pointer"
            >
              {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              {searching ? "Searching..." : "Track Status"}
            </Button>
          </form>
          {lookupNotice && <p className="mt-2 text-xs font-semibold text-[#0f7655]" role="status">{lookupNotice}</p>}

          {/* Appwrite Application Badges (Only shown in Demo Mode) */}
          {demoMode && appwriteApps.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="text-[#5e6f68] text-[11px] self-center">Appwrite Applications:</span>
              {appwriteApps.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => {
                    setSearchQuery(app.id);
                    setCurrentApp(app);
                    setNotFound(false);
                    setLookupNotice(`Application ${app.id} loaded from Appwrite.`);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-mono font-bold transition-all ${
                    currentApp?.id === app.id
                      ? "bg-[#167c74] text-white"
                      : "bg-white border border-[#cfe3dd] text-[#167c74] hover:bg-[#edf7f4]"
                  }`}
                >
                  {app.id}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Content - Full Screen Width */}
      <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-8 lg:px-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#167c74]" />
            <p className="mt-3 text-xs font-semibold text-[#5e6f68]">Loading application records from Appwrite...</p>
          </div>
        ) : notFound || !currentApp ? (
          <Card className="p-8 text-center max-w-xl mx-auto my-6 space-y-4">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-600">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#152321]">Application Not Found</h3>
              <p className="mt-1 text-xs text-[#5e6f68]">
                No matching application record found in Appwrite for <strong className="font-mono">{searchQuery || "entered ID"}</strong>.
              </p>
            </div>
            {appwriteApps.length > 0 && (
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCurrentApp(appwriteApps[0]);
                    setSearchQuery(appwriteApps[0].id);
                    setNotFound(false);
                  }}
                >
                  View Appwrite Application ({appwriteApps[0].id})
                </Button>
              </div>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
            {/* Column 1: Application Status Card & Details */}
            <div className="space-y-6">
              {/* Status Card */}
              <Card className="p-6">
                <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="success" className="text-[11px] font-bold">
                        {currentApp.status || "Submitted · In Scrutiny"}
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
                      {code === "DL_DISPATCHED" ? <ShieldCheck size={20} /> : <CalendarDays size={20} />}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0f7655]">
                        {code === "DL_DISPATCHED" ? "Delivery Status · Speed Post in Transit" : "Active Appointment / Next Action"}
                      </span>
                      <strong className="block text-sm font-bold text-[#152321]">
                        {code === "DL_DISPATCHED" ? "Smart Card DL Dispatched via Speed Post" : currentApp.appointment}
                      </strong>
                      <span className="text-[#5e6f68]">
                        {code === "DL_DISPATCHED" ? `Postal Consignment Ref: ${currentApp.paymentReference || "IN10294819"}` : currentApp.rto}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="w-fit">
                    {code === "DL_DISPATCHED" ? "In Transit" : "Confirmed"}
                  </Badge>
                </div>

                {/* Application Timeline */}
                <div className="mt-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0f7655]">
                    Application Progress Tracker
                  </h3>
                  <ol className="mt-4 space-y-4">
                    {timelineSteps.map(([title, date, desc], idx) => {
                      const isDone = idx < activeStepIndex;
                      const isActive = idx === activeStepIndex;
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
                    <dd className="font-mono text-[#152321]">{currentApp.identity || "Aadhaar eKYC"}</dd>
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
                    <dd className="font-mono text-[#152321]">{currentApp.paymentReference || "N/A"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#5e6f68]">Total Paid</dt>
                    <dd className="font-bold text-[#0d5c45]">{currentApp.feeTotal || "Paid"}</dd>
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
        )}
      </main>
    </PageShell>
  );
}
