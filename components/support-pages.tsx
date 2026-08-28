"use client";

import Link from "./safe-link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Download,
  FileCheck2,
  IdCard,
  Landmark,
  QrCode,
  Search,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { PageShell } from "./page-shell";
import { appointmentParts } from "@/lib/appointment";
import { DemoApplication, loadApplication, loadDraft, saveApplication, saveDraft } from "@/lib/storage";
import { downloadAppointmentPdf, downloadApplicationPdf, downloadWalletDocumentPdf } from "@/lib/demo-pdf";
import { isAppwriteConfigured, listWalletDocuments, saveWalletDocument } from "@/lib/appwrite";
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
import { Label } from "@/components/ui/label";

export function Appointments() {
  const [slot, setSlot] = useState("29 Aug · 11:20 AM");
  const [application, setApplication] = useState<DemoApplication | null>(null);
  const [activeTab, setActiveTab] = useState<"Upcoming" | "Past" | "Cancelled">("Upcoming");
  const [showSlip, setShowSlip] = useState(false);
  const [rebooked, setRebooked] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = loadApplication();
      if (saved) {
        setApplication(saved);
        setSlot(saved.appointment || "29 Aug · 11:20 AM");
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const shown: DemoApplication = application || {
    id: "SRTO-LL-2026-001284",
    status: "appointment-scheduled",
    appointment: slot,
    rto: "MH-10 Sangli RTO",
    submittedAt: "2026-08-25T15:21:00+05:30",
    fullName: "Demo Citizen",
    appointmentId: "APT-20037",
  };
  const shownAppointment = appointmentParts(slot);

  function changeSlot(nextSlot: string) {
    setSlot(nextSlot);
    if (application) {
      const updated = { ...application, appointment: nextSlot };
      setApplication(updated);
      saveApplication(updated);
      saveDraft({ ...loadDraft(), appointment: nextSlot });
    }
  }

  function downloadSlip(id?: string, _service?: string, time?: string) {
    downloadAppointmentPdf({
      ...shown,
      appointmentId: id || shown.appointmentId,
      appointment: time || slot,
    });
  }

  return (
    <PageShell>
      <section className="border-b border-[#dce8e5] bg-gradient-to-br from-[#f7fbfa] via-white to-[#edf7f4] py-12">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#0f7655]">
            Appointments · Mock service
          </p>
          <h1 className="my-1.5 text-xl font-extrabold tracking-tight text-[#152321] md:text-2xl">
            Manage your RTO visit
          </h1>
          <p className="max-w-xl text-xs font-medium text-[#5e6f68]">
            Book, reschedule, view past visits or download a QR slip for a fictional appointment.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[1fr_320px]">
        <section className="space-y-6">
          {/* Tabs header */}
          <div className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-3" role="tablist" aria-label="Appointment status">
            {(["Upcoming", "Past", "Cancelled"] as const).map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(tab)}
              >
                {tab} Visits
              </Button>
            ))}
          </div>

          {/* Tab 1: UPCOMING */}
          {activeTab === "Upcoming" && (
            <Card className="p-6">
              <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[100px_1fr_auto]">
                <div className="flex flex-col items-center justify-center rounded-xl bg-[#edf7f4] p-3 text-[#167c74]">
                  <span className="text-[10px] font-extrabold tracking-wider">{shownAppointment.month}</span>
                  <strong className="text-3xl font-black leading-tight">{shownAppointment.day}</strong>
                  <small className="text-[9px] font-bold tracking-widest text-[#0f7655]">
                    {shownAppointment.dayName}
                  </small>
                </div>

                <div>
                  <Badge variant="success">Confirmed · Demonstration</Badge>
                  <h2 className="my-1 text-xl font-bold text-[#152321]">
                    Learner Licence Driving Computer Test
                  </h2>
                  <p className="flex items-center gap-2 text-xs text-[#5e6f68]">
                    <Landmark size={14} className="text-[#167c74]" />
                    {shown.rto} · Room 4 (Biometric & Exam)
                  </p>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-[#5e6f68]">
                    <CalendarDays size={14} className="text-[#167c74]" />
                    {shownAppointment.time} · Token: {shown.appointmentId || "APT-20037"}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Button size="sm" onClick={() => downloadSlip()} className="gap-1.5">
                    <Download size={14} /> Download PDF
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowSlip(!showSlip)} className="gap-1.5">
                    <QrCode size={14} /> {showSlip ? "Hide slip" : "View slip"}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Tab 2: PAST */}
          {activeTab === "Past" && (
            <div className="space-y-4">
              <Card className="p-6">
                <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[100px_1fr_auto]">
                  <div className="flex flex-col items-center justify-center rounded-xl bg-slate-100 p-3 text-slate-700">
                    <span className="text-[10px] font-extrabold tracking-wider">NOV</span>
                    <strong className="text-3xl font-black leading-tight">10</strong>
                    <small className="text-[9px] font-bold tracking-widest text-slate-500">2025</small>
                  </div>
                  <div>
                    <Badge variant="success">Completed · Demo Verified</Badge>
                    <h2 className="my-1 text-xl font-bold text-[#152321]">Vehicle Fitness Inspection</h2>
                    <p className="flex items-center gap-2 text-xs text-[#5e6f68]">
                      <Landmark size={14} className="text-[#167c74]" />
                      MH-10 Sangli RTO · Testing Track
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => downloadSlip("APT-08819", "Vehicle Fitness", "10 Nov 2025 · 11:00 AM")} className="gap-1.5">
                    <Download size={14} /> Receipt PDF
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Tab 3: CANCELLED */}
          {activeTab === "Cancelled" && (
            <Card className="border-red-200 bg-red-50/40 p-6">
              <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[100px_1fr_auto]">
                <div className="flex flex-col items-center justify-center rounded-xl bg-red-100 p-3 text-red-700">
                  <span className="text-[10px] font-extrabold tracking-wider">AUG</span>
                  <strong className="text-3xl font-black leading-tight">04</strong>
                  <small className="text-[9px] font-bold text-red-600">2026</small>
                </div>
                <div>
                  <Badge variant="destructive">Cancelled · User Requested</Badge>
                  <h2 className="my-1 text-xl font-bold text-[#152321]">Address Modification Appointment</h2>
                  <p className="mt-1 text-xs text-[#5e6f68]">MH-10 Sangli RTO · 04 Aug 2026 · 10:30 AM</p>
                </div>
                <Button size="sm" onClick={() => { setRebooked(true); setActiveTab("Upcoming"); }}>
                  Rebook slot
                </Button>
              </div>
            </Card>
          )}
        </section>

        {/* Sidebar */}
        <aside>
          <Card className="p-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0f7655]">
              <QrCode size={16} /> QR Verification Slip
            </div>
            <div className="my-5 grid h-44 w-full place-items-center rounded-2xl border border-dashed border-[#167c74] bg-[#f8fcfb] p-4 text-center">
              <span className="rounded-md bg-white px-3 py-1.5 text-xs font-black text-[#152321] shadow-xs">
                {shown.appointmentId || "APT-20037"}
              </span>
              <p className="mt-2 text-[10px] font-semibold text-[#5e6f68]">
                Show at RTO entrance reception
              </p>
            </div>
            <Button className="w-full gap-2" onClick={() => downloadSlip()}>
              <Download size={15} /> Download PDF Pass
            </Button>
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}

export function Wallet() {
  const defaultDocs = [
    {
      type: "Aadhaar Card",
      number: "9999 8888 7777",
      holderName: "Demo Citizen",
      authority: "Unique Identification Authority of India (UIDAI)",
      issued: "15/01/2018",
      expiry: "Permanent (Valid)",
      category: "Digital Aadhaar eKYC",
      status: "Verified · Active",
      icon: "🇮🇳",
    },
    {
      type: "Driving Licence",
      number: "DL-1020230004821",
      holderName: "Demo Citizen",
      authority: "MH-10 Sangli RTO",
      issued: "12/03/2023",
      expiry: "11/03/2043",
      category: "MCWG / LMV (Car & Motorcycle)",
      status: "Valid until 2043",
      icon: "🪪",
    },
    {
      type: "Registration Certificate (RC)",
      number: "MH10AB1234",
      holderName: "Demo Citizen",
      authority: "MH-10 Sangli RTO",
      issued: "05/08/2022",
      expiry: "04/08/2037",
      category: "Tata Nexon EV (Electric)",
      status: "Valid until 2037",
      icon: "🚗",
    },
    {
      type: "PUC Certificate",
      number: "PUCC-MH10-2026-91",
      holderName: "Demo Citizen",
      authority: "Authorized Testing Station",
      issued: "13/03/2026",
      expiry: "12/09/2026",
      category: "BS-VI Standard Compliant",
      status: "Clean · Valid",
      icon: "🍃",
    },
    {
      type: "Vehicle Insurance",
      number: "INS-DEMO-2026-203",
      holderName: "Demo Citizen",
      authority: "Demo General Insurance",
      issued: "01/12/2025",
      expiry: "31/12/2026",
      category: "Comprehensive Zero-Dep Plan",
      status: "Active Coverage",
      icon: "🛡️",
    },
  ];

  const [preview, setPreview] = useState<{
    type: string;
    number: string;
    holderName: string;
    authority?: string;
    issued?: string;
    expiry?: string;
    category?: string;
    status?: string;
    mode: "view" | "qr";
  } | null>(null);

  const [documentType, setDocumentType] = useState<"Aadhaar" | "PAN" | null>(null);
  const [documentNumber, setDocumentNumber] = useState("");
  const [holderName, setHolderName] = useState("Demo Citizen");
  const [savedDocuments, setSavedDocuments] = useState<Array<{ type: string; number: string; holderName: string }>>([]);
  const [documentStatus, setDocumentStatus] = useState("");
  const [digilockerLinked, setDigilockerLinked] = useState(false);

  useEffect(() => {
    if (!isAppwriteConfigured) return;
    listWalletDocuments()
      .then((items) => setSavedDocuments(items))
      .catch(() => setDocumentStatus("Documents could not be loaded from Appwrite."));
  }, []);

  async function addDocument() {
    if (!documentType || !documentNumber.trim() || !holderName.trim()) {
      setDocumentStatus("Please choose document type and enter document number.");
      return;
    }
    const item = { type: documentType, number: documentNumber.trim(), holderName: holderName.trim() };
    if (!isAppwriteConfigured) {
      setSavedDocuments((current) => [...current.filter((doc) => doc.type !== item.type), item]);
      setDocumentStatus("Saved to your local digital wallet.");
    } else {
      try {
        await saveWalletDocument({ ...item, type: documentType, status: "active" });
        setSavedDocuments((current) => [...current.filter((doc) => doc.type !== item.type), item]);
        setDocumentStatus("Saved securely to your Appwrite digital wallet.");
      } catch {
        setDocumentStatus("Could not save to Appwrite. Using local wallet.");
      }
    }
    setDocumentType(null);
    setDocumentNumber("");
  }

  return (
    <PageShell>
      {/* Wallet Hero */}
      <section className="border-b border-[#dce8e5] bg-gradient-to-br from-[#f7fbfa] via-white to-[#edf7f4] py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <Badge variant="secondary" className="mb-2 font-bold gap-1.5">
                <ShieldCheck size={14} className="text-[#167c74]" /> Digilocker & Parivahan Compliant
              </Badge>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#152321] md:text-3xl">
                Digital Document Wallet
              </h1>
              <p className="mt-1 max-w-xl text-xs font-medium text-[#5e6f68] md:text-sm">
                Your legally verified identity, vehicle, and licence credentials in one secure place.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {(["Aadhaar", "PAN"] as const).map((type) => (
                <Button
                  key={type}
                  size="sm"
                  onClick={() => setDocumentType(type)}
                  className="gap-1.5 font-bold"
                >
                  + Add {type}
                </Button>
              ))}
            </div>
          </div>
          {documentStatus && (
            <p className="mt-3 text-xs font-semibold text-[#0f7655]">{documentStatus}</p>
          )}
        </div>
      </section>

      {/* Main Wallet Grid */}
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
        {/* DigiLocker Status Bar */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="flex items-center justify-between p-5 bg-[#edf7f4] border-[#cfe3dd]">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#167c74] text-white">
                <ShieldCheck size={20} />
              </div>
              <div>
                <strong className="block text-sm font-bold text-[#0d5c45]">
                  DigiLocker Integration
                </strong>
                <span className="text-xs text-[#5e6f68]">
                  {digilockerLinked ? "Directly synced with DigiLocker" : "Link your account to auto-sync govt documents"}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              variant={digilockerLinked ? "secondary" : "default"}
              onClick={() => setDigilockerLinked(true)}
              disabled={digilockerLinked}
            >
              {digilockerLinked ? "Linked ✓" : "Link DigiLocker"}
            </Button>
          </Card>

          <Card className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#ddf3ef] text-[#167c74]">
                <FileCheck2 size={20} />
              </div>
              <div>
                <strong className="block text-sm font-bold text-[#152321]">
                  Official PDF Export
                </strong>
                <span className="text-xs text-[#5e6f68]">
                  All documents generate high-res vector PDFs with verifiable QR seals
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Official Documents Grid */}
        <div>
          <div className="mb-5 flex items-end justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xl font-extrabold text-[#152321]">Verified Digital Credentials</h2>
              <p className="text-xs text-[#5e6f68]">Issued by Ministry of Road Transport & Highways and UIDAI</p>
            </div>
            <Badge variant="success">5 Documents Active</Badge>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {defaultDocs.map((doc) => (
              <Card
                key={doc.type}
                className="group flex flex-col justify-between transition-all hover:scale-[1.01] hover:border-[#167c74] hover:shadow-md"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{doc.icon}</span>
                    <div>
                      <CardTitle className="text-sm">{doc.type}</CardTitle>
                      <CardDescription className="text-[11px] font-mono font-bold text-[#167c74]">
                        {doc.number}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="success" className="text-[10px]">
                    Verified
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-2 text-xs py-2">
                  <div className="flex justify-between text-[#5e6f68]">
                    <span>Holder:</span>
                    <strong className="text-[#152321]">{doc.holderName}</strong>
                  </div>
                  <div className="flex justify-between text-[#5e6f68]">
                    <span>Category:</span>
                    <strong className="text-[#152321]">{doc.category}</strong>
                  </div>
                  <div className="flex justify-between text-[#5e6f68]">
                    <span>Validity:</span>
                    <span className="font-bold text-[#0d5c45]">{doc.status}</span>
                  </div>
                </CardContent>

                <CardFooter className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                  <Button
                    size="sm"
                    className="flex-1 gap-1.5 text-xs"
                    onClick={() => downloadWalletDocumentPdf(doc)}
                  >
                    <Download size={14} /> PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-xs"
                    onClick={() => setPreview({ ...doc, mode: "view" })}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="gap-1 text-xs"
                    onClick={() => setPreview({ ...doc, mode: "qr" })}
                  >
                    <QrCode size={13} /> QR
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* User Added Documents (Appwrite / Local) */}
        {savedDocuments.length > 0 && (
          <div>
            <h3 className="mb-4 text-base font-bold text-[#152321]">Your Additional Linked Records</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {savedDocuments.map((doc) => (
                <Card key={doc.number} className="flex items-center justify-between p-4">
                  <div>
                    <strong className="text-sm font-bold text-[#152321]">{doc.type}</strong>
                    <p className="mt-0.5 text-xs text-[#5e6f68] font-mono">{doc.number} · {doc.holderName}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => downloadWalletDocumentPdf(doc)}
                  >
                    <Download size={14} /> Download PDF
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Document Dialog Modal */}
      {documentType && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-xs">
          <Card className="w-full max-w-md p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle>Add {documentType} Document</CardTitle>
              <CardDescription>Enter document number to save directly to your digital locker.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-0 py-2">
              <div>
                <Label htmlFor="doc-num">{documentType} Number</Label>
                <Input
                  id="doc-num"
                  className="mt-1.5"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder={documentType === "Aadhaar" ? "9999 8888 7777" : "ABCDE1234F"}
                />
              </div>
              <div>
                <Label htmlFor="doc-name">Holder Full Name</Label>
                <Input
                  id="doc-name"
                  className="mt-1.5"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 p-0 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setDocumentType(null)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={addDocument}>
                Save Document
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Document Details & QR Modal */}
      {preview && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={() => setPreview(null)}
        >
          <Card className="w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
              <div>
                <Badge variant="secondary" className="text-[10px]">
                  GOVT DIGITAL CREDENTIAL
                </Badge>
                <CardTitle className="mt-1 text-lg">{preview.type}</CardTitle>
              </div>
              <WalletCards className="text-[#167c74]" size={24} />
            </CardHeader>

            {preview.mode === "view" ? (
              <CardContent className="space-y-3 p-0 py-4 text-xs">
                <div className="rounded-xl border border-[#cfe3dd] bg-[#edf7f4] p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#5e6f68]">Document No:</span>
                    <strong className="text-[#152321]">{preview.number}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5e6f68]">Holder Name:</span>
                    <strong className="text-[#152321]">{preview.holderName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5e6f68]">Issuing Authority:</span>
                    <strong className="text-[#152321]">{preview.authority || "Government of India"}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5e6f68]">Validity:</span>
                    <strong className="text-[#0d5c45]">{preview.status || "Active"}</strong>
                  </div>
                </div>
              </CardContent>
            ) : (
              <CardContent className="p-0 py-4 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-[#0f7655]">
                  Verification QR Code
                </p>
                <div className="mx-auto my-4 grid h-40 w-40 place-items-center rounded-2xl border border-dashed border-[#167c74] bg-[#edf7f4] p-4">
                  <span className="rounded-md bg-white px-3 py-1.5 text-xs font-black text-[#152321] shadow-xs">
                    {preview.number}
                  </span>
                </div>
                <Badge variant="success">✓ Digitally Signed & Sealed</Badge>
              </CardContent>
            )}

            <CardFooter className="flex gap-2 p-0 pt-4">
              <Button
                className="flex-1 gap-1.5"
                onClick={() => downloadWalletDocumentPdf(preview)}
              >
                <Download size={14} /> Download Official PDF
              </Button>
              <Button variant="outline" onClick={() => setPreview(null)}>
                Close
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </PageShell>
  );
}

const guideSteps = [
  "Sign in with the demo account",
  "Choose Learner Licence",
  "Complete mock identity verification",
  "Confirm personal information",
  "Add address and select a demo RTO",
  "Add synthetic documents",
  "Choose an appointment",
  "Review and declare",
  "Complete the test payment",
  "Save your application number",
];

export function HowItWorks() {
  return (
    <PageShell>
      <section className="border-b border-[#dce8e5] bg-gradient-to-br from-[#f7fbfa] via-white to-[#ddf3ef] py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0f7655]">Citizen guide</p>
          <h1 className="mt-2 max-w-3xl text-2xl font-extrabold tracking-tight text-[#152321] md:text-3xl">How to use Smart RTO</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#5e6f68]">
            One clear journey from sign-in to tracking, with your progress
            saved along the way.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-2xl border border-[#dce8e5] bg-[#f7fbfa] p-5 lg:sticky lg:top-24">
          <strong className="text-sm font-extrabold text-[#152321]">In this guide</strong>
          <nav className="mt-3 flex flex-col gap-1 text-sm font-semibold text-[#0f7655]">
            <a className="rounded-lg px-3 py-2 hover:bg-[#ddf3ef]" href="#learner">Learner Licence</a>
            <a className="rounded-lg px-3 py-2 hover:bg-[#ddf3ef]" href="#tracking">Application tracking</a>
            <a className="rounded-lg px-3 py-2 hover:bg-[#ddf3ef]" href="#mock">What is simulated</a>
          </nav>
        </aside>

        <article className="min-w-0">
          <section id="learner">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0f7655]">Main journey</p>
            <h2 className="mt-2 text-3xl font-extrabold text-[#152321]">Apply for a Learner Licence</h2>
            <p className="mt-3 text-sm leading-6 text-[#5e6f68]">
              Allow about two minutes for the streamlined demonstration.
            </p>
            <ol className="mt-8 space-y-3">
              {guideSteps.map((s, i) => (
                <li className="flex gap-4 rounded-2xl border border-[#dce8e5] bg-white p-4 shadow-sm" key={s}>
                  <i className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#ddf3ef] text-sm font-black not-italic text-[#167c74]">{i + 1}</i>
                  <div>
                    <strong className="text-sm font-bold text-[#152321]">{s}</strong>
                    <p className="mt-1 text-xs leading-5 text-[#5e6f68]">
                      {i === 0
                        ? "Use mobile 9999999999 and OTP 123456."
                        : i === 5
                        ? "Check synthetic documents with 1 click."
                        : i === 9
                        ? "Open tracking to see the next action and timeline."
                        : "The page explains what is required before you continue."}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <Link className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#167c74] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#126b64]" href="/apply/learner-licence">
              Start Application <ArrowRight size={17} />
            </Link>
          </section>
        </article>
      </div>
    </PageShell>
  );
}

const faqs = [
  "What documents do I need?",
  "Why is my document marked unclear?",
  "How do I change my appointment?",
  "Where is my application number?",
  "Is Smart RTO an official government service?",
];

export function HelpCentre() {
  const [q, setQ] = useState("");

  return (
    <PageShell>
      <section className="border-b border-[#dce8e5] bg-gradient-to-br from-[#152321] to-[#167c74] py-14 text-white md:py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <CircleHelp className="mx-auto text-[#78d5c0]" size={40} />
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">How can we help?</h1>
          <p className="mt-3 text-sm text-[#d9e7e3]">
            Search simple, local guidance.
          </p>
          <div className="mx-auto mt-7 flex max-w-2xl items-center gap-3 rounded-2xl bg-white px-5 py-1 text-[#152321] shadow-xl">
            <Search size={20} className="text-[#167c74]" />
            <input
              className="h-12 w-full border-0 bg-transparent text-sm outline-none placeholder:text-[#7d8d88]"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="For example: What documents do I need?"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[1fr_320px]">
        <section>
          <h2 className="mb-5 text-2xl font-extrabold text-[#152321]">Popular questions</h2>
          {faqs
            .filter((x) => x.toLowerCase().includes(q.toLowerCase()))
            .map((x, i) => (
              <details className="group mb-3 rounded-2xl border border-[#dce8e5] bg-white p-5 shadow-sm" key={x} open={i === 0 && Boolean(q)}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-[#152321]">
                  {x}
                  <ChevronDown size={18} className="shrink-0 text-[#167c74] transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-xs leading-5 text-[#5e6f68]">
                  This prototype uses simulated rules. Real RTO procedures follow Ministry of Road Transport & Highways guidelines.
                </p>
              </details>
            ))}
        </section>

        <aside>
          <Card className="p-6">
            <h3 className="text-sm font-bold text-[#152321]">Still need assistance?</h3>
            <p className="mt-2 text-xs text-[#5e6f68]">
              Raise a quick grievance or support ticket for your application.
            </p>
            <Button className="mt-4 w-full" asChild>
              <Link href="/grievance">File a Grievance</Link>
            </Button>
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}

const info: Record<
  string,
  { title: string; eyebrow: string; copy: string; sections: [string, string][] }
> = {
  about: {
    title: "About Smart RTO",
    eyebrow: "Modernizing Citizen Services",
    copy: "A demonstration interface designed for effortless RTO citizen interactions.",
    sections: [
      ["Seamless Digital Service", "Unified access to Driving Licences, Vehicles, and Challans."],
      ["Instant Digital Locker", "All official transport documents in one place."],
    ],
  },
  privacy: {
    title: "Privacy Notice",
    eyebrow: "Data Protection",
    copy: "How your information is protected and stored.",
    sections: [
      ["Local & Appwrite Storage", "Data is securely isolated and managed."],
      ["No Third-Party Sharing", "Your demo credentials remain private to your session."],
    ],
  },
  terms: {
    title: "Terms of Service",
    eyebrow: "Portal Guidelines",
    copy: "Guidelines on using this portal prototype.",
    sections: [
      ["Simulated Demonstration", "No real statutory liabilities or financial transactions."],
    ],
  },
};

export function InfoPage({ kind }: { kind: string }) {
  const page = info[kind] || info.about;

  return (
    <PageShell>
      <section className="border-b border-[#dce8e5] bg-gradient-to-br from-[#f7fbfa] via-white to-[#ddf3ef] py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0f7655]">{page.eyebrow}</p>
          <h1 className="mt-2 max-w-3xl text-2xl font-extrabold tracking-tight text-[#152321] md:text-3xl">{page.title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#5e6f68]">{page.copy}</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-4 px-6 py-12">
        {page.sections.map(([t, c], i) => (
          <Card className="grid gap-4 p-6 sm:grid-cols-[64px_1fr]" key={t}>
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#ddf3ef] text-sm font-black text-[#167c74]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-[#152321]">{t}</h2>
              <p className="mt-2 text-sm leading-6 text-[#5e6f68]">{c}</p>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
