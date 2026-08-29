"use client";

import Link from "./safe-link";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Cloud,
  Download,
  Eye,
  FilePenLine,
  FileCheck2,
  FileText,
  IdCard,
  Landmark,
  Plus,
  QrCode,
  Search,
  ShieldCheck,
  Upload,
  UserCheck,
  WalletCards,
  Trash2,
} from "lucide-react";
import { PageShell } from "./page-shell";
import { useDemoMode } from "./demo-mode-provider";
import { appointmentParts } from "@/lib/appointment";
import { DemoApplication, loadApplication, loadDraft, saveApplication, saveDraft } from "@/lib/storage";
import { downloadAppointmentPdf, downloadApplicationPdf, downloadWalletDocumentPdf } from "@/lib/demo-pdf";
import {
  isAppwriteConfigured,
  isAppwriteStorageConfigured,
  getCurrentAppwriteUser,
  deleteWalletFile,
  getWalletFileViewUrl,
  listWalletDocuments,
  listWalletFiles,
  renameWalletFile,
  saveWalletDocument,
  uploadWalletFile,
  type WalletDocument,
} from "@/lib/appwrite";
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

type WalletUploadCategory = "Photo" | "Address Proof" | "Name Proof" | "Age Proof" | "Medical Self-Declaration";

type UploadedWalletFile = {
  $id: string;
  name: string;
  mimeType: string;
  sizeOriginal: number;
  category: string;
};

function categoryFromFileName(name: string) {
  return name.match(/^(Photo|Address Proof|Name Proof|Age Proof|Medical Self-Declaration) - /)?.[1] || "Uncategorized";
}

export function Appointments() {
  const { enabled: demoMode } = useDemoMode();
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
    fullName: demoMode ? "Demo Citizen" : "Registered Applicant",
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
      <section className="border-b border-[#dce8e5] bg-gradient-to-br from-[#f7fbfa] via-white to-[#edf7f4] py-8 md:py-10">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-12">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#0f7655]">
            {demoMode ? "Appointments · Mock service" : "Official RTO Appointment Desk"}
          </p>
          <h1 className="my-1.5 text-xl font-bold tracking-tight text-[#152321] md:text-2xl">
            Manage your RTO visit
          </h1>
          <p className="max-w-xl text-xs font-medium text-[#5e6f68]">
            {demoMode
              ? "Book, reschedule, view past visits or download a QR slip for a fictional appointment."
              : "Review confirmed visit slots, download digital entry gatepasses, and manage scheduled RTO appointments."}
          </p>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-8 px-4 py-8 sm:px-8 lg:px-12 lg:grid-cols-[1fr_320px]">
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
                  <Badge variant="success">
                    {demoMode ? "Confirmed · Demonstration" : "Confirmed Booking · Entry Pass Active"}
                  </Badge>
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
                    <Badge variant="success">
                      {demoMode ? "Completed · Demo Verified" : "Completed · Verified Record"}
                    </Badge>
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
                  <Badge variant="destructive">
                    {demoMode ? "Cancelled · User Requested" : "Cancelled"}
                  </Badge>
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
                {demoMode ? "Show at RTO entrance reception" : "Show at RTO reception for entry verification"}
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
  const { enabled: demoMode } = useDemoMode();
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
    {
      type: "Self-Declaration (Form 29/30 & Medical)",
      number: "DECL-2026-TR-8842",
      holderName: "Demo Citizen",
      authority: "Ministry of Road Transport & Highways (Self-Attested)",
      issued: "10/01/2026",
      expiry: "Permanent (Valid for Transfer & LL)",
      category: "Form 29/30 & Form 1 Statutory Self-Declaration",
      status: "Verified in Wallet",
      icon: "📋",
    },
  ];
  const walletRecords: WalletDocument[] = defaultDocs.map((doc) => ({
    type:
      doc.type === "Aadhaar Card"
        ? "Aadhaar"
        : doc.type === "Registration Certificate (RC)"
          ? "RC"
          : doc.type === "PUC Certificate"
            ? "PUC"
            : doc.type === "Vehicle Insurance"
              ? "Insurance"
              : doc.type === "Self-Declaration (Form 29/30 & Medical)"
                ? "Self-Declaration (Form 29/30 & Medical)"
                : "Driving Licence",
    number: doc.number,
    holderName: doc.holderName,
    status: "active" as const,
  }));

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
  const [walletSyncing, setWalletSyncing] = useState(false);
  const [standardWalletNotice, setStandardWalletNotice] = useState("");
  const [selectedWalletFile, setSelectedWalletFile] = useState<File | null>(null);
  const [standardDocumentType, setStandardDocumentType] = useState<WalletUploadCategory>("Photo");
  const [uploadedWalletFiles, setUploadedWalletFiles] = useState<UploadedWalletFile[]>([]);
  const [walletUploading, setWalletUploading] = useState(false);
  const [appwriteAuthenticated, setAppwriteAuthenticated] = useState(false);
  const [editingWalletFile, setEditingWalletFile] = useState<{ id: string; name: string } | null>(null);
  const [renamingWalletFile, setRenamingWalletFile] = useState(false);
  const [deletingWalletFile, setDeletingWalletFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!demoMode || !isAppwriteConfigured) {
      const timer = window.setTimeout(() => setSavedDocuments([]), 0);
      return () => window.clearTimeout(timer);
    }
    listWalletDocuments()
      .then((items) => setSavedDocuments(items))
      .catch(() => setDocumentStatus("Documents could not be loaded from Appwrite."));
  }, [demoMode]);

  useEffect(() => {
    if (demoMode || !isAppwriteStorageConfigured) {
      const timer = window.setTimeout(() => setAppwriteAuthenticated(false), 0);
      return () => window.clearTimeout(timer);
    }

    getCurrentAppwriteUser()
      .then(() => setAppwriteAuthenticated(true))
      .catch(() => setAppwriteAuthenticated(false));
  }, [demoMode]);

  useEffect(() => {
    if (demoMode || !isAppwriteStorageConfigured || !appwriteAuthenticated) {
      const timer = window.setTimeout(() => setUploadedWalletFiles([]), 0);
      return () => window.clearTimeout(timer);
    }

    Promise.all([listWalletFiles(), listWalletDocuments().catch(() => [])])
      .then(([files, records]) => setUploadedWalletFiles(files.map((file) => ({
        ...file,
        category: records.find((record) => record.number === file.$id)?.type || categoryFromFileName(file.name),
      }))))
      .catch(() => setStandardWalletNotice("Sign in with Google to view documents saved in your private Appwrite wallet."));
  }, [demoMode, appwriteAuthenticated]);

  function selectWalletFile(file: File | null) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setStandardWalletNotice("Choose a document smaller than 10 MB.");
      return;
    }
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setStandardWalletNotice("Choose a PDF, JPG, PNG, or other image document.");
      return;
    }
    setSelectedWalletFile(file);
    setStandardWalletNotice(`${file.name} is ready to upload to your private wallet.`);
  }

  async function uploadStandardWalletFile() {
    if (!selectedWalletFile) {
      setStandardWalletNotice("Choose a document first.");
      return;
    }
    if (!isAppwriteStorageConfigured) {
      setStandardWalletNotice("Document storage is not configured. Set NEXT_PUBLIC_APPWRITE_DOCUMENTS_BUCKET_ID and restart the app.");
      return;
    }

    setWalletUploading(true);
    try {
      const typedFile = new File(
        [selectedWalletFile],
        `${standardDocumentType} - ${selectedWalletFile.name}`,
        { type: selectedWalletFile.type },
      );
      const file = await uploadWalletFile(typedFile);
      await saveWalletDocument({
        type: standardDocumentType,
        number: file.$id,
        holderName: "Wallet account holder",
        status: "active",
      });
      setUploadedWalletFiles((current) => [{ ...file, category: standardDocumentType }, ...current]);
      setSelectedWalletFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setStandardWalletNotice(`${standardDocumentType} uploaded to your private Appwrite wallet.`);
    } catch {
      setStandardWalletNotice("Could not upload the document. Sign in with Google and check the Appwrite bucket permissions.");
    } finally {
      setWalletUploading(false);
    }
  }

  function viewWalletFile(fileId: string) {
    try {
      window.open(getWalletFileViewUrl(fileId), "_blank", "noopener,noreferrer");
    } catch {
      setStandardWalletNotice("Could not open the document. Check the Appwrite bucket configuration.");
    }
  }

  async function renameStandardWalletFile() {
    if (!editingWalletFile) return;
    const name = editingWalletFile.name.trim();
    if (!name) {
      setStandardWalletNotice("Enter a document name.");
      return;
    }

    setRenamingWalletFile(true);
    try {
      const updated = await renameWalletFile(editingWalletFile.id, name);
      setUploadedWalletFiles((files) => files.map((file) => file.$id === updated.$id ? { ...file, ...updated } : file));
      setEditingWalletFile(null);
      setStandardWalletNotice("Document name updated.");
    } catch {
      setStandardWalletNotice("Could not rename the document. Check your Appwrite session and file permissions.");
    } finally {
      setRenamingWalletFile(false);
    }
  }

  async function deleteStandardWalletFile(fileId: string, name: string) {
    if (!window.confirm(`Delete “${name}” from your wallet? This cannot be undone.`)) return;
    setDeletingWalletFile(fileId);
    try {
      await deleteWalletFile(fileId);
      setUploadedWalletFiles((files) => files.filter((file) => file.$id !== fileId));
      if (editingWalletFile?.id === fileId) setEditingWalletFile(null);
      setStandardWalletNotice("Document deleted from your private wallet.");
    } catch {
      setStandardWalletNotice("Could not delete the document. Check your Appwrite session and permissions.");
    } finally {
      setDeletingWalletFile(null);
    }
  }

  async function addDocument() {
    if (!demoMode) return;
    if (!documentType || !documentNumber.trim() || !holderName.trim()) {
      setDocumentStatus("Please choose document type and enter document number.");
      return;
    }
    const item = { type: documentType, number: documentNumber.trim(), holderName: holderName.trim() };
    if (!isAppwriteConfigured) {
      setDocumentStatus("Appwrite is not configured. Demo documents are saved only to Appwrite.");
      return;
    }
    try {
      await saveWalletDocument({ ...item, type: documentType, status: "active" });
      const items = await listWalletDocuments();
      setSavedDocuments(items);
      setDocumentStatus("Saved securely to your Appwrite demo wallet.");
    } catch {
      setDocumentStatus("Could not save to Appwrite. Sign in with Google, then try again.");
    }
    setDocumentType(null);
    setDocumentNumber("");
  }

  async function saveWalletToAppwrite() {
    if (!demoMode) return;
    if (!isAppwriteConfigured) {
      setDocumentStatus("Appwrite is not configured. Add the Appwrite public environment variables first.");
      return;
    }

    setWalletSyncing(true);
    setDocumentStatus("Saving your demo credentials to Appwrite…");
    try {
      await Promise.all(walletRecords.map((document) => saveWalletDocument(document)));
      const items = await listWalletDocuments();
      setSavedDocuments(items);
      setDocumentStatus("Digital Document Wallet saved securely to your Appwrite account.");
    } catch {
      setDocumentStatus("Could not save to Appwrite. Sign in with Google, then try again.");
    } finally {
      setWalletSyncing(false);
    }
  }

  const defaultDocumentNumbers = new Set(defaultDocs.map((doc) => doc.number));
  const additionalDocuments = savedDocuments.filter((doc) => !defaultDocumentNumbers.has(doc.number));

  return (
    <PageShell>
      {/* Wallet Hero - Full Screen Width */}
      <section className="border-b border-[#dce8e5] bg-gradient-to-br from-[#f7fbfa] via-white to-[#edf7f4] py-8 md:py-10">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-12">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <Badge variant="secondary" className="mb-2 font-bold gap-1.5">
                <ShieldCheck size={14} className="text-[#167c74]" /> Digilocker & Parivahan Compliant
              </Badge>
              <h1 className="text-xl font-bold tracking-tight text-[#152321] md:text-2xl">
                Digital Document Wallet
              </h1>
              <p className="mt-1 max-w-2xl text-xs font-medium text-[#5e6f68] md:text-sm">
                {demoMode
                  ? "Demo identity, vehicle, and licence credentials saved to your Appwrite wallet."
                  : "No sample identity or vehicle credentials are shown in Standard view."}
              </p>
            </div>

            {demoMode && <div className="flex flex-wrap gap-2.5">
              <Button
                size="sm"
                variant="outline"
                onClick={saveWalletToAppwrite}
                disabled={walletSyncing}
                className="gap-1.5 font-bold"
              >
                <Cloud size={14} /> {walletSyncing ? "Saving…" : "Save Wallet"}
              </Button>
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
            </div>}
          </div>
          {demoMode && documentStatus && (
            <p className="mt-3 text-xs font-semibold text-[#0f7655]">{documentStatus}</p>
          )}
        </div>
      </section>

      {/* Main Wallet Grid - Full Screen Width */}
      <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-8 lg:px-12 space-y-8">
        {!demoMode ? (
          <section className="mx-auto max-w-2xl rounded-3xl border border-[#d8e5e0] bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eaf4ef] text-[#167c74]">
              <WalletCards size={26} />
            </div>
            <h2 className="mt-5 text-xl font-extrabold text-[#152321]">Your wallet is private</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#5e6f68]">
              Standard view does not show, create, or store sample credentials. You can prepare a document action below without sharing personal records with this prototype.
            </p>
            {!appwriteAuthenticated ? (
              <div className="mt-6 rounded-2xl border border-[#cfe3dd] bg-[#f2f8f6] p-4">
                <p className="m-0 text-xs leading-5 text-[#405e54]">Connect your Google account through Appwrite before adding private documents. Local demo sign-in cannot access the storage bucket.</p>
                <Link href="/login?next=%2Fwallet" className="mt-3 inline-flex h-10 items-center justify-center rounded-xl bg-[#167c74] px-4 text-xs font-bold text-white hover:bg-[#126b64]">Connect secure account</Link>
              </div>
            ) : <div className="mx-auto mt-7 max-w-xl overflow-hidden rounded-2xl border border-[#cfe3dd] bg-[#fbfdfc] text-left">
              <div className="border-b border-[#e4efeb] bg-[#f2f8f6] px-4 py-3">
                <p className="m-0 text-xs font-extrabold text-[#173b32]">Add a private document</p>
                <p className="mt-0.5 text-[11px] text-[#687d75]">Choose its purpose first, then select a PDF or image.</p>
              </div>
              <div className="space-y-5 p-4">
                <div>
                  <div className="mb-2 flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#167c74] text-[10px] font-black text-white">1</span><span className="text-xs font-bold text-[#405e54]">Document category</span></div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {[
                  { type: "Photo" as const, label: "Applicant photo", detail: "Clear face image", icon: UserCheck },
                  { type: "Address Proof" as const, label: "Address proof", detail: "Address document", icon: Landmark },
                  { type: "Name Proof" as const, label: "Name proof", detail: "Identity document", icon: IdCard },
                  { type: "Age Proof" as const, label: "Age proof", detail: "Birth or school record", icon: CalendarDays },
                  { type: "Medical Self-Declaration" as const, label: "Medical declaration", detail: "Form 1 document", icon: FileText },
                    ].map(({ type, label, detail, icon: Icon }) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setStandardDocumentType(type)}
                        className={`flex min-h-20 items-start gap-2 rounded-xl border p-3 text-left transition-all ${standardDocumentType === type ? "border-[#167c74] bg-[#eaf4ef] ring-2 ring-[#167c74]/15" : "border-[#dce8e5] bg-white hover:border-[#8bbbab]"}`}
                      >
                        <Icon size={17} className={standardDocumentType === type ? "text-[#167c74]" : "text-[#71877e]"} />
                        <span><strong className="block text-xs text-[#173b32]">{label}</strong><small className="mt-0.5 block text-[10px] text-[#687d75]">{detail}</small></span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#167c74] text-[10px] font-black text-white">2</span><span className="text-xs font-bold text-[#405e54]">Choose file</span></div>
                  <div className="flex flex-col gap-3 rounded-xl border border-dashed border-[#9fc8bc] bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                    <span className="min-w-0"><strong className="block truncate text-xs text-[#173b32]">{selectedWalletFile ? selectedWalletFile.name : "No document selected"}</strong><small className="block text-[11px] text-[#687d75]">PDF or image · maximum 10 MB</small></span>
                    <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={() => fileInputRef.current?.click()}><Plus size={15} /> Choose file</Button>
                  </div>
                </div>
                <div className="flex flex-col gap-3 border-t border-[#e4efeb] pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="m-0 text-[11px] text-[#687d75]">Uploading as <strong className="text-[#173b32]">{standardDocumentType}</strong></p>
                  <Button type="button" disabled={!selectedWalletFile || walletUploading} className="gap-2" onClick={uploadStandardWalletFile}><Upload size={16} /> {walletUploading ? "Uploading…" : "Upload to wallet"}</Button>
                </div>
              </div>
            </div>}
            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              accept="application/pdf,image/*"
              onChange={(event) => selectWalletFile(event.target.files?.[0] || null)}
            />
            {standardWalletNotice && <p className="mx-auto mt-4 max-w-lg rounded-xl border border-[#cfe3dd] bg-[#f2f8f6] px-4 py-3 text-xs font-medium leading-5 text-[#405e54]" role="status">{standardWalletNotice}</p>}
            {uploadedWalletFiles.length > 0 && (
              <div className="mx-auto mt-6 max-w-xl text-left">
                <div className="mb-2 flex items-center justify-between gap-3"><h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#587269]">Your uploaded documents</h3><span className="text-[11px] font-medium text-[#687d75]">Private to your account</span></div>
                <div className="overflow-hidden rounded-2xl border border-[#d8e5e0] bg-white">
                  {uploadedWalletFiles.map((file, index) => (
                    <div key={file.$id} className={`px-4 py-3 ${index > 0 ? "border-t border-[#edf2ef]" : ""}`}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#eaf4ef] text-[#167c74]"><FileCheck2 size={17} /></span>
                        <span className="min-w-0 flex-1"><strong className="block break-words text-xs text-[#173b32]">{file.name.replace(/^(Photo|Address Proof|Name Proof|Age Proof|Medical Self-Declaration) - /, "")}</strong><small className="mt-1 block text-[11px] text-[#687d75]">{file.mimeType || "Document"} · {Math.max(1, Math.round(file.sizeOriginal / 1024))} KB</small><span className="mt-2 inline-flex rounded-full bg-[#eaf4ef] px-2 py-0.5 text-[10px] font-bold text-[#0f7655]">{file.category}</span></span>
                        <div className="flex w-full shrink-0 gap-2 sm:w-auto">
                          <Button type="button" size="sm" variant="outline" className="flex-1 gap-1.5 sm:flex-none" onClick={() => viewWalletFile(file.$id)}><Eye size={14} /> View</Button>
                          <Button type="button" size="sm" variant="ghost" className="flex-1 gap-1.5 sm:flex-none" onClick={() => setEditingWalletFile({ id: file.$id, name: file.name })}><FilePenLine size={14} /> Rename</Button>
                          <Button type="button" size="sm" variant="ghost" className="flex-1 gap-1.5 text-red-700 hover:bg-red-50 hover:text-red-700 sm:flex-none" disabled={deletingWalletFile === file.$id} onClick={() => deleteStandardWalletFile(file.$id, file.name)}><Trash2 size={14} /> {deletingWalletFile === file.$id ? "Deleting…" : "Delete"}</Button>
                        </div>
                      </div>
                      {editingWalletFile?.id === file.$id && (
                        <form className="mt-3 flex flex-col gap-2 rounded-xl bg-[#f2f8f6] p-3 sm:flex-row" onSubmit={(event) => { event.preventDefault(); renameStandardWalletFile(); }}>
                          <Input aria-label="Document name" value={editingWalletFile.name} onChange={(event) => setEditingWalletFile({ ...editingWalletFile, name: event.target.value })} className="h-9 bg-white text-xs" autoFocus />
                          <div className="flex gap-2"><Button type="submit" size="sm" disabled={renamingWalletFile}>{renamingWalletFile ? "Saving…" : "Save name"}</Button><Button type="button" size="sm" variant="outline" onClick={() => setEditingWalletFile(null)}>Cancel</Button></div>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        ) : <>
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
        {additionalDocuments.length > 0 && (
          <div>
            <h3 className="mb-4 text-base font-bold text-[#152321]">Your Additional Linked Records</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {additionalDocuments.map((doc) => (
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
        </>}
      </div>

      {/* Add Document Dialog Modal */}
      {demoMode && documentType && (
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
      {demoMode && preview && (
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
  {
    title: "1-Click Demo Sign-in",
    desc: "Use seeded demo credentials (e.g. mobile 9999999999 / OTP 123456) for instant, passwordless access.",
    detail: "No real SMS is sent, and mock sessions are securely stored in your local browser sandbox.",
  },
  {
    title: "Choose Your Service",
    desc: "Pick Learner Licence (Form 2), Permanent DL (Form 4), Vehicle Transfer (Form 29/30), or eChallan.",
    detail: "Each service includes clear time estimates, prerequisites, and document requirements upfront.",
  },
  {
    title: "Instant Mock Aadhaar Verification",
    desc: "Simulate demographic verification to auto-populate identity, age, and registered address.",
    detail: "Demonstrates how Aadhaar eKYC streamlines RTO applications without manual data entry errors.",
  },
  {
    title: "Smart Document Verification",
    desc: "Upload or auto-fill synthetic identity, age, and address proof documents in PDF/JPG format.",
    detail: "Built-in document wallet lets you manage, preview, and download your verified certificates anytime.",
  },
  {
    title: "Select RTO & Book Slot",
    desc: "Pick your preferred regional transport office and choose a convenient appointment time slot.",
    detail: "Instant slot confirmation with downloadable appointment slip PDF and rescheduling support.",
  },
  {
    title: "Simulated Test Payment & Instant Receipt",
    desc: "Complete a mock payment transaction using fictional sandbox payment modes.",
    detail: "Generates an official-looking digital receipt with synthetic transaction ID and QR verification.",
  },
  {
    title: "Live End-to-End Application Tracking",
    desc: "Track status across 5 stages: Submitted → Scrutiny → Test Scheduled → Approved → Dispatched.",
    detail: "Real-time timeline alerts you to any required action or next milestone.",
  },
];

const serviceGuides = [
  {
    id: "learner",
    title: "Learner Licence (LL)",
    badge: "Form 2 Application",
    time: "3-5 mins demo",
    summary: "Guided flow for first-time drivers with mock test practice and instant application reference.",
    steps: [
      { step: "1", title: "Eligibility Check", text: "Select vehicle category (MCWG, LMV) and confirm age criteria (18+)." },
      { step: "2", title: "eKYC Demographics", text: "Auto-fill personal and parent details via mock Aadhaar verification." },
      { step: "3", title: "Document Upload", text: "Attach synthetic age proof, address proof, and Form 1 medical declaration." },
      { step: "4", title: "Slot & Test Booking", text: "Book an online LL test slot or physical RTO counter verification." },
      { step: "5", title: "Fee & Tracking", text: "Mock fee payment (₹200) and track application #LL-2026-XXXX." },
    ],
    ctaHref: "/apply/learner-licence",
    ctaLabel: "Start Learner Licence Demo",
  },
  {
    id: "permanent",
    title: "Permanent Driving Licence (DL)",
    badge: "Form 4 Application",
    time: "2-4 mins demo",
    summary: "Apply for a full driving licence after holding a valid Learner Licence for 30+ days.",
    steps: [
      { step: "1", title: "LL Verification", text: "Enter your Learner Licence number and date of issue for automated validation." },
      { step: "2", title: "Driving Track Slot", text: "Book a biometric and vehicle driving test slot at the automated test track." },
      { step: "3", title: "Upload Certificate", text: "Optionally link driving school training certificate Form 5." },
      { step: "4", title: "Smart Card Fee", text: "Simulated fee payment for smart card issuance and postal dispatch." },
    ],
    ctaHref: "/apply/permanent-licence",
    ctaLabel: "Apply for Permanent DL",
  },
  {
    id: "vehicle",
    title: "Vehicle Transfer & RC Search",
    badge: "Form 29 & 30",
    time: "2 mins demo",
    summary: "Simulate ownership transfer between buyer & seller and inspect vehicle fitness records.",
    steps: [
      { step: "1", title: "Registration Search", text: "Search registration plate (e.g. MH10EA1234) to inspect vehicle history." },
      { step: "2", title: "Transferor & Transferee", text: "Enter seller and buyer Aadhaar info with synthetic NOC verification." },
      { step: "3", title: "RC Endorsement", text: "Submit for RTO endorsement and preview digital RC Smart Card." },
    ],
    ctaHref: "/vehicles/transfer",
    ctaLabel: "Explore Vehicle Services",
  },
  {
    id: "challans",
    title: "eChallan Payment",
    badge: "Traffic Violation Settlement",
    time: "1 min demo",
    summary: "Instant vehicle plate lookup to review traffic police challans and test digital payments.",
    steps: [
      { step: "1", title: "Search Violation", text: "Enter vehicle number to fetch mock pending overspeeding or signal violation." },
      { step: "2", title: "Review Evidence", text: "Inspect timestamp, location, fine amount, and violation section." },
      { step: "3", title: "Instant Clearance", text: "Test-pay fine and generate instant official clearance receipt." },
    ],
    ctaHref: "/challans",
    ctaLabel: "Check eChallan Demo",
  },
];

const howItWorksFaqs = [
  {
    q: "Is Smart RTO an official government service?",
    a: "No. Smart RTO is an independent, open design prototype created to demonstrate how modern UX, plain language, and intuitive multi-language workflows can make citizen transport services simpler and stress-free.",
  },
  {
    q: "Do I need real Aadhaar or real payment cards?",
    a: "Never. Smart RTO runs on simulated, fictional data. You can test identity verification, document wallet storage, and payment workflows using the built-in 1-click test buttons.",
  },
  {
    q: "Where is my application saved?",
    a: "Your progress is automatically saved to your browser's local storage and synchronized with our Appwrite cloud sandbox when connected, allowing you to resume your draft anytime.",
  },
  {
    q: "Can I download PDF receipts and application forms?",
    a: "Yes! Every completed service allows you to download realistic PDF documents, including Appointment Slips, Learner Applications, and Document Wallet certificates.",
  },
  {
    q: "How does application tracking work?",
    a: "Visit the Application Tracking page (/track) and enter your reference number (or view your recent demo submissions) to inspect stage-by-stage status, scrutiny notes, and next required actions.",
  },
];

export function HowItWorks() {
  const [activeTab, setActiveTab] = useState("all-steps");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <PageShell>
      {/* Hero Header - Full Screen Width */}
      <section className="border-b border-[#dce8e5] bg-gradient-to-br from-[#075c48] via-[#0b6b55] to-[#0e765d] py-8 text-white md:py-10">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-12">
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white backdrop-blur-sm">
            <ShieldCheck size={14} />
            Citizen Guide & Platform Walkthrough
          </div>
          <h1 className="mt-2.5 max-w-3xl text-xl font-bold tracking-tight text-white md:text-2xl">
            How Smart RTO Works
          </h1>
          <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-white/85 md:text-sm">
            A clear, predictable journey from start to finish. Learn how guided applications, auto-saved drafts, and real-time tracking work.
          </p>

          {/* Quick Action Navigation */}
          <div className="mt-5 flex flex-wrap gap-2.5">
            <a
              href="#service-flows"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-[#075c48] shadow-sm transition-all hover:bg-slate-100"
            >
              <FileCheck2 size={15} /> Explore Service Guides
            </a>
            <a
              href="#step-by-step"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/10 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <FileText size={15} /> 7-Step Universal Process
            </a>
            <a
              href="#sandbox-guide"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/10 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <ShieldCheck size={15} /> Simulation & Privacy
            </a>
          </div>
        </div>
      </section>

      {/* Main Content Layout - Full Screen Width */}
      <div className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-8 lg:px-12">
        {/* Service Guides Tabs Section */}
        <section id="service-flows" className="scroll-mt-24 mb-12">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0f7655]">Step-by-Step Journeys</p>
            <h2 className="mt-1 text-lg font-bold text-[#152321] md:text-xl">Service Guides</h2>
            <p className="mt-0.5 text-xs text-[#5e6f68]">
              Select a service below to see exact prerequisites, turnaround times, and flow steps.
            </p>
          </div>

          {/* Service Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {serviceGuides.map((guide) => (
              <div
                key={guide.id}
                className="flex flex-col justify-between rounded-2xl border border-[#dce8e5] bg-white p-6 shadow-sm transition-all hover:border-[#167c74] hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-[#ddf3ef] px-3 py-1 text-xs font-bold text-[#167c74]">
                      {guide.badge}
                    </span>
                    <span className="text-xs font-semibold text-[#5e6f68]">
                      ⏱ {guide.time}
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-extrabold text-[#152321]">{guide.title}</h3>
                  <p className="mt-1 text-xs text-[#5e6f68] leading-relaxed">{guide.summary}</p>

                  <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-4">
                    {guide.steps.map((s) => (
                      <div key={s.step} className="flex items-start gap-2.5 text-xs">
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#eaf4ef] text-[11px] font-bold text-[#167c74]">
                          {s.step}
                        </span>
                        <div>
                          <strong className="font-bold text-[#152321]">{s.title}: </strong>
                          <span className="text-[#5e6f68]">{s.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Link
                    href={guide.ctaHref}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#167c74] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#126b64]"
                  >
                    <span>{guide.ctaLabel}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7-Step Universal Process */}
        <section id="step-by-step" className="scroll-mt-24 mb-16 rounded-3xl border border-[#dce8e5] bg-[#f7fbfa] p-6 md:p-10">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0f7655]">The Citizen Workflow</p>
            <h2 className="mt-1 text-2xl font-black text-[#152321] md:text-3xl">
              7-Step Universal Process
            </h2>
            <p className="mt-2 text-sm text-[#5e6f68]">
              Every application in Smart RTO adheres to the same consistent, transparent pattern.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guideSteps.map((step, idx) => (
              <div
                key={step.title}
                className="flex flex-col justify-between rounded-2xl border border-[#dce8e5] bg-white p-5 shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#167c74] text-xs font-black text-white">
                      0{idx + 1}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#667572]">
                      Stage {idx + 1}
                    </span>
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-[#152321]">{step.title}</h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#5e6f68]">{step.desc}</p>
                </div>
                <p className="mt-3 rounded-lg bg-[#f0f8f5] p-2 text-[11px] font-medium text-[#167c74]">
                  💡 {step.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* What is Simulated vs Official Section */}
        <section id="sandbox-guide" className="scroll-mt-24 mb-16 rounded-3xl border border-[#dce8e5] bg-white p-6 md:p-10 shadow-sm">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0f7655]">Privacy & Safe Testing</p>
            <h2 className="mt-1 text-2xl font-black text-[#152321] md:text-3xl">
              Understanding the Demo Sandbox
            </h2>
            <p className="mt-2 text-sm text-[#5e6f68]">
              Smart RTO allows you to experience a complete public transport service experience without exposing private records or processing actual bank transactions.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <Check size={18} className="text-emerald-700" />
                <span>What Works in Demo Mode</span>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-emerald-950">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Instant 1-click test OTP and mock login verification.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Full draft persistence (close your browser and resume).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Real PDF receipt and appointment slip generation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>End-to-end status tracking with simulated stage progression.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <ShieldCheck size={18} className="text-amber-700" />
                <span>What is Safe & Non-Government</span>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-amber-950">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>No real money is charged; all payment gateways are mock test interfaces.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>No real Aadhaar or driving records are accessed or shared.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Not affiliated with Parivahan, Sarathi, Vahan, or MoRTH.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Interactive FAQ Section */}
        <section className="rounded-3xl border border-[#dce8e5] bg-[#f7fbfa] p-6 md:p-10">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0f7655]">Frequently Asked Questions</p>
            <h2 className="mt-1 text-2xl font-black text-[#152321] md:text-3xl">
              Common Questions
            </h2>
            <p className="mt-2 text-sm text-[#5e6f68]">
              Quick answers about navigating the portal, test appointments, and tracking.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            {howItWorksFaqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.q}
                  className="overflow-hidden rounded-2xl border border-[#dce8e5] bg-white transition-all shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-4 text-left text-sm font-bold text-[#152321] hover:text-[#167c74]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-[#667572] transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[#167c74]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 bg-[#fbfdfc] px-4 py-3 text-xs leading-relaxed text-[#5e6f68]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom CTA Banner */}
          <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl bg-[#167c74] p-6 text-white sm:flex-row">
            <div>
              <h4 className="text-base font-extrabold">Ready to explore the citizen portal?</h4>
              <p className="mt-1 text-xs text-white/80">
                Experience a simplified Learner Licence application in under 3 minutes.
              </p>
            </div>
            <Link
              href="/apply/learner-licence"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-[#167c74] shadow-md transition-colors hover:bg-slate-100"
            >
              <span>Start Application Demo</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>
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
