"use client";

import { useEffect, useRef, useState } from "react";
import Link from "./safe-link";
import { useLanguage } from "./language-provider";
import { useDemoMode } from "./demo-mode-provider";
import { useRouter } from "next/navigation";
import { PageShell } from "./page-shell";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Download,
  FileCheck2,
  FileText,
  Landmark,
  Loader2,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UserCheck,
  WalletCards,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  DemoApplication,
  newAppointmentId,
  newApplicationId,
  newPaymentReference,
  saveApplication,
} from "@/lib/storage";
import {
  isAppwriteConfigured,
  isAppwriteStorageConfigured,
  listWalletDocuments,
  listWalletFiles,
  saveApplicationRecord,
  saveWalletDocument,
  uploadWalletFile,
} from "@/lib/appwrite";
import { downloadApplicationPdf } from "@/lib/demo-pdf";

interface VehicleClassOption {
  id: string;
  code: string;
  name: string;
  desc: string;
  icon: string;
  image: string;
  badge: string;
  fee: number;
}

const VEHICLE_CLASSES: VehicleClassOption[] = [
  {
    id: "mcwog",
    code: "MCWOG",
    name: "Motorcycle Without Gear",
    desc: "Scooters, Mopeds, Electric 2-Wheelers (e.g. Activa, Jupiter, Ola S1)",
    icon: "🛵",
    image: "/assets/electric-motorbike.gif",
    badge: "Two Wheeler (Non-Geared)",
    fee: 150,
  },
  {
    id: "mcwg",
    code: "MCWG",
    name: "Motorcycle With Gear",
    desc: "All Geared Motorcycles, Commuter & Sports Bikes (e.g. Splendor, Pulsar, RE)",
    icon: "🏍️",
    image: "/assets/motorcycle.gif",
    badge: "Two Wheeler (Geared)",
    fee: 150,
  },
  {
    id: "lmv",
    code: "LMV",
    name: "Light Motor Vehicle",
    desc: "Cars, Jeeps, Sedans, Hatchbacks, SUVs, Light Taxis",
    icon: "🚗",
    image: "/assets/car.gif",
    badge: "Four Wheeler (Light)",
    fee: 150,
  },
  {
    id: "hmv",
    code: "HMV / Commercial",
    name: "Heavy / Commercial Vehicle",
    desc: "Heavy Goods Transport, Multi-Axle Trucks, Passenger Buses",
    icon: "🚛",
    image: "/assets/delivery-truck.gif",
    badge: "Commercial / Heavy",
    fee: 250,
  },
];

const AVAILABLE_DATES = [
  { dateStr: "2026-08-29", slotsCount: 18 },
  { dateStr: "2026-08-30", slotsCount: 24 },
  { dateStr: "2026-08-31", slotsCount: 15 },
  { dateStr: "2026-09-01", slotsCount: 30 },
  { dateStr: "2026-09-02", slotsCount: 20 },
];

const AVAILABLE_TIMES = [
  { timeStr: "09:30 AM", label: "09:30 AM – 10:30 AM", batch: "Morning Session" },
  { timeStr: "11:20 AM", label: "11:20 AM – 12:20 PM", batch: "Recommended" },
  { timeStr: "02:30 PM", label: "02:30 PM – 03:30 PM", batch: "Afternoon Session" },
  { timeStr: "04:15 PM", label: "04:15 PM – 05:15 PM", batch: "Evening Session" },
];

const RTO_OFFICES = [
  "MH-10 Sangli RTO",
  "MH-09 Kolhapur RTO",
  "MH-12 Pune RTO",
  "MH-01 Mumbai Central RTO",
  "MH-02 Mumbai West RTO",
];

type ApplicationDocumentAttachment = {
  id: string;
  name: string;
  detail: string;
  source: "Wallet" | "Manual upload" | "DigiLocker";
};

export function LearnerFlow() {
  const router = useRouter();
  const { language } = useLanguage();
  const { enabled: demoMode } = useDemoMode();
  const [step, setStep] = useState<number>(0);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"appwrite" | "local" | null>(null);
  const [syncError, setSyncError] = useState("");

  // Step 1: Aadhaar & PAN eKYC
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [gender, setGender] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [ekycVerified, setEkycVerified] = useState(false);

  // Step 2: Medical Disability Checklist & Declaration (Form 1)
  const [noEpilepsy, setNoEpilepsy] = useState(true);
  const [normalVision, setNormalVision] = useState(true);
  const [noDisability, setNoDisability] = useState(true);
  const [normalHearing, setNormalHearing] = useState(true);
  const [organDonation, setOrganDonation] = useState(true);
  const [medicalDeclaration, setMedicalDeclaration] = useState(true);

  // Step 3: Vehicle Type Selection Cards
  const [selectedClasses, setSelectedClasses] = useState<string[]>(["mcwg", "lmv"]);

  // Step 4: Document Verification (DigiLocker vs Manual)
  const [docMethod, setDocMethod] = useState<"wallet" | "digilocker" | "manual">("wallet");
  const [manualDocsUploaded, setManualDocsUploaded] = useState(false);
  const [manualDocumentType, setManualDocumentType] = useState<"Photo" | "Address Proof" | "Name Proof" | "Age Proof" | "Medical Self-Declaration">("Photo");
  const [walletDocuments, setWalletDocuments] = useState<Array<{ id: string; name: string; detail: string }>>([]);
  const [attachedDocuments, setAttachedDocuments] = useState<ApplicationDocumentAttachment[]>([]);
  const [documentFetchStatus, setDocumentFetchStatus] = useState("");
  const [manualDocumentNames, setManualDocumentNames] = useState<string[]>([]);
  const manualUploadRef = useRef<HTMLInputElement>(null);

  // Step 5: Test Date & Time Slot + RTO
  const [rtoOffice, setRtoOffice] = useState("MH-10 Sangli RTO");
  const [selectedDate, setSelectedDate] = useState("2026-08-29");
  const [selectedTime, setSelectedTime] = useState("11:20 AM");

  // Submitted Record
  const [submittedApp, setSubmittedApp] = useState<DemoApplication | null>(null);

  useEffect(() => {
    if (demoMode) return;
    const timer = window.setTimeout(() => {
      setAadhaarNumber("");
      setPanNumber("");
      setFullName("");
      setDob("");
      setGuardianName("");
      setGender("");
      setMobile("");
      setAddress("");
      setEkycVerified(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [demoMode]);

  const locale = language === "ur" ? "ur-PK" : `${language}-IN`;
  const formatDate = (date: string, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, options).format(new Date(`${date}T12:00:00`));
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "INR" }).format(amount);

  function continueToDeclaration() {
    const aadhaarIsValid = /^\d{4}\s?\d{4}\s?\d{4}$/.test(aadhaarNumber);
    const panIsValid = /^[A-Z]{5}\d{4}[A-Z]$/.test(panNumber);
    if (demoMode && (!/^9999\s?8888\s?7777$/.test(aadhaarNumber) || !/^ABCDE1234F$/.test(panNumber))) {
      setError("Use the fictional examples shown: Aadhaar 9999 8888 7777 and PAN ABCDE1234F. Select Fill demo details to add them.");
      return;
    }
    if (!demoMode && (!aadhaarIsValid || !panIsValid)) {
      setError("Enter a valid 12-digit Aadhaar number and PAN in ABCDE1234F format to continue.");
      return;
    }
    setError("");
    setStep(1);
  }

  function fillDemoDetails() {
    setAadhaarNumber("9999 8888 7777");
    setPanNumber("ABCDE1234F");
    setFullName("Demo Citizen");
    setDob("15/01/2000");
    setGuardianName("Ramesh Citizen");
    setGender("Male");
    setMobile("9999999999");
    setAddress("Flat 402, Green Avenue, Sangli 416416");
    setEkycVerified(true);
    setError("");
  }

  function toggleVehicleClass(id: string) {
    if (selectedClasses.includes(id)) {
      if (selectedClasses.length > 1) {
        setSelectedClasses(selectedClasses.filter((item) => item !== id));
      }
    } else {
      setSelectedClasses([...selectedClasses, id]);
    }
  }

  async function fetchWalletDocuments() {
    if (!isAppwriteConfigured) {
      setDocumentFetchStatus("Connect Appwrite to fetch documents from your wallet.");
      return;
    }
    setDocumentFetchStatus("Fetching documents from your Appwrite wallet…");
    try {
      const [records, files] = await Promise.all([
        listWalletDocuments(),
        isAppwriteStorageConfigured ? listWalletFiles() : Promise.resolve([]),
      ]);
      setWalletDocuments([
        ...records.map((document) => ({ id: document.$id, name: document.type, detail: document.number })),
        ...files.map((file) => ({ id: file.$id, name: file.name, detail: file.mimeType || "Wallet file" })),
      ]);
      setDocumentFetchStatus(records.length || files.length ? "Wallet documents fetched." : "No wallet documents found for this Appwrite account.");
    } catch {
      setDocumentFetchStatus("Could not fetch wallet documents. Sign in with Google and try again.");
    }
  }

  function fetchDigiLockerDocuments() {
    setDocumentFetchStatus("Demo DigiLocker documents fetched. No government service was contacted.");
  }

  async function uploadManualDocuments(files: FileList | null) {
    const selected = Array.from(files || []);
    if (!selected.length) return;
    if (selected.some((file) => file.size > 2 * 1024 * 1024 || (!file.type.startsWith("image/") && file.type !== "application/pdf"))) {
      setDocumentFetchStatus("Choose PDF or image files smaller than 2 MB.");
      return;
    }
    if (!isAppwriteStorageConfigured) {
      setDocumentFetchStatus("Manual upload needs the configured Appwrite document bucket.");
      return;
    }
    setDocumentFetchStatus("Uploading selected documents to your private Appwrite wallet…");
    try {
      const uploadedFiles = await Promise.all(selected.map((file) => {
        const typedFile = new File([file], `${manualDocumentType} - ${file.name}`, { type: file.type });
        return uploadWalletFile(typedFile);
      }));
      await Promise.all(uploadedFiles.map((file) => saveWalletDocument({
        type: manualDocumentType,
        number: file.$id,
        holderName: fullName || "LL applicant",
        status: "active",
      })));
      setManualDocumentNames(selected.map((file) => file.name));
      setAttachedDocuments((current) => [
        ...current,
        ...uploadedFiles.map((file) => ({
          id: file.$id,
          name: manualDocumentType,
          detail: file.name,
          source: "Manual upload" as const,
        })).filter((item) => !current.some((document) => document.id === item.id)),
      ]);
      setManualDocsUploaded(true);
      setDocumentFetchStatus("Documents uploaded to Appwrite and attached to this application.");
    } catch {
      setDocumentFetchStatus("Could not upload documents. Sign in with Google and check bucket permissions.");
    }
  }

  function attachWalletDocument(document: { id: string; name: string; detail: string }) {
    setAttachedDocuments((current) => current.some((item) => item.id === document.id)
      ? current
      : [...current, { ...document, source: "Wallet" }]);
  }

  function removeAttachedDocument(id: string) {
    setAttachedDocuments((current) => current.filter((document) => document.id !== id));
  }

  const selectedCodes = VEHICLE_CLASSES.filter((v) => selectedClasses.includes(v.id)).map(
    (v) => v.code,
  );
  const totalFee = 150 + 20; // 150 LL Fee + 20 Online Computer Test Fee

  async function submitLearnerApplication() {
    setProcessing(true);
    setSyncStatus(null);
    setSyncError("");
    const appId = newApplicationId();
    const paymentRef = newPaymentReference();
    const appointmentId = newAppointmentId();
    const appointmentSlot = `${formatDate(selectedDate, { day: "numeric", month: "short" })} · ${selectedTime}`;

    if (isAppwriteConfigured) {
      try {
        await saveApplicationRecord({
          userId: "user_123456",
          app_type: "Learner Licence",
          app_detail: {
            applicationNumber: appId,
            service: {
              id: "learner-licence",
              name: "Learner Licence (Form 2)",
              category: "Driving Licence",
            },
            applicant: {
              fullName,
              dob,
              gender,
              mobile,
              guardian: guardianName,
              address,
              aadhaarNumber,
              panNumber,
            },
            vehicleClass: selectedCodes.join(", "),
            medicalFitness: {
              epilepsyFree: noEpilepsy,
              visionNormal: normalVision,
              disabilityFree: noDisability,
              organPledged: organDonation,
            },
            rto: rtoOffice,
            appointment: {
              id: appointmentId,
              slot: appointmentSlot,
              venue: `${rtoOffice} - Computer Exam Room 4`,
            },
            payment: {
              amount: totalFee,
              currency: "INR",
              status: "paid",
              reference: paymentRef,
              method: "Demo Online UPI",
            },
            status: {
              code: "APPOINTMENT_SCHEDULED",
              label: "Appointment Scheduled · Ready for Computer Exam",
              updatedAt: new Date().toISOString(),
            },
          },
          documentId: appId.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        });
        setSyncStatus("appwrite");
      } catch (err) {
        console.warn("Appwrite LL sync note:", err);
        setSyncStatus("local");
        setSyncError(err instanceof Error ? err.message : "Appwrite rejected the application record.");
      }
    } else {
      setSyncStatus("local");
      setSyncError("Appwrite is not configured for this environment.");
    }

    const applicationRecord: DemoApplication = {
      id: appId,
      status: "appointment-scheduled",
      appointment: appointmentSlot,
      rto: rtoOffice,
      submittedAt: new Date().toISOString(),
      fullName,
      appointmentId,
      paymentReference: paymentRef,
      paymentMethod: "Demo Online UPI",
      feeTotal: `INR ${totalFee}.00 (Paid)`,
      identity: aadhaarNumber,
      pan: panNumber,
      dob,
      guardian: guardianName,
      gender,
      mobile,
      pincode: "416416",
      city: "Sangli",
      address,
      state: "Maharashtra",
      vehicle: selectedCodes.join(" / "),
      medicalStatus: "Fit (Form 1 Self-Declaration Attested)",
      organDonation: organDonation ? "Yes (Pledged for Road Safety)" : "No",
      documents: attachedDocuments.length > 0
        ? attachedDocuments.map((document) => `${document.name} (${document.source})`)
        : ["Aadhaar eKYC", "PAN Record", "Form 1 Medical Declaration", "Age Proof"],
    };

    saveApplication(applicationRecord);

    setTimeout(() => {
      setSubmittedApp(applicationRecord);
      setProcessing(false);
    }, 800);
  }

  return (
    <PageShell>
      {/* Hero Header - Full Screen Width */}
      <section className="border-b border-[#dce8e5] bg-gradient-to-br from-[#f7fbfa] via-white to-[#edf7f4] py-8 md:py-10">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-12">
          <Badge variant="secondary" className="mb-2 gap-1.5 font-bold">
            <FileText size={14} className="text-[#167c74]" /> Form 2 · Ministry of Road Transport & Highways
          </Badge>
          <h1 className="text-xl font-bold tracking-tight text-[#152321] md:text-2xl">
            Learner Licence (LL) Application
          </h1>
          <p className="mt-1 max-w-3xl text-xs font-medium text-[#5e6f68] md:text-sm">
            Complete four clear stages. Instant slot allocation and statutory verification.
          </p>
        </div>
      </section>

      {/* Main Content Area - Full Screen Width */}
      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-8 lg:px-12 sm:py-8">
        {!submittedApp ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              {[
                { id: 0, title: "1. Identity details", sub: "Demo Aadhaar & PAN" },
                { id: 1, title: "2. Fitness & vehicles", sub: "Declaration and classes" },
                { id: 2, title: "3. Documents", sub: "Add proof" },
                { id: 3, title: "4. Slot & payment", sub: "Test date & ₹170" },
              ].map((s) => (
                <Card
                  key={s.id}
                  className={`p-3.5 transition-all ${
                    step === s.id
                      ? "border-[#167c74] bg-white ring-2 ring-[#167c74]/20"
                      : step > s.id
                      ? "border-[#cfe3dd] bg-[#edf7f4] text-[#167c74]"
                      : "border-slate-100 bg-white/60 text-[#8ba098]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Step {s.id + 1}
                    </span>
                    {step > s.id && <Check size={14} className="text-[#167c74]" />}
                  </div>
                  <strong className="mt-1 block text-xs text-[#152321]">{s.title}</strong>
                  <span className="text-[10px] text-[#5e6f68]">{s.sub}</span>
                </Card>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-700 border border-red-200">
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 2: demo identity details */}
            {step === 0 && (
              <Card className="w-full space-y-6 p-4 sm:p-6">
                <CardHeader className="p-0 flex flex-row items-center justify-between">
                  <div>
                  <CardTitle>Step 1: Identity details</CardTitle>
                  <CardDescription>
                      {demoMode ? "Use fictional details to prefill this demo application. No government database is contacted." : "Enter your identity references to continue the application."}
                    </CardDescription>
                  </div>
                  {demoMode && <Button
                    variant="outline"
                    size="sm"
                    onClick={fillDemoDetails}
                    className="gap-1.5 text-xs text-[#167c74]"
                  >
                    <Sparkles size={14} /> Fill demo details
                  </Button>}
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="aadhaar">Aadhaar Number (12 Digits)</Label>
                      <Input
                        id="aadhaar"
                        value={aadhaarNumber}
                        onChange={(e) => setAadhaarNumber(e.target.value)}
                        className="mt-1.5 font-mono"
                        placeholder="9999 8888 7777"
                        aria-describedby="aadhaar-help"
                      />
                      <p id="aadhaar-help" className="mt-1 text-[11px] text-[#5e6f68]">{demoMode ? <><strong>Why we need this:</strong> it demonstrates how a form can prefill basic details. Example: 9999 8888 7777.</> : "Enter a 12-digit Aadhaar reference in the format 1234 5678 9012."}</p>
                    </div>
                    <div>
                      <Label htmlFor="pan">PAN Card Number</Label>
                      <Input
                        id="pan"
                        value={panNumber}
                        onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                        className="mt-1.5 font-mono uppercase"
                        placeholder="ABCDE1234F"
                        aria-describedby="pan-help"
                      />
                      <p id="pan-help" className="mt-1 text-[11px] text-[#5e6f68]">{demoMode ? <><strong>Why we need this:</strong> it is a second demo reference. Example: ABCDE1234F.</> : "Enter PAN in ABCDE1234F format."}</p>
                    </div>
                  </div>

                  {ekycVerified && (
                    <div className="rounded-2xl border border-[#cfe3dd] bg-[#edf7f4] p-5 text-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-[#cfe3dd] pb-3">
                        <div className="flex items-center gap-2">
                          <UserCheck size={18} className="text-[#167c74]" />
                          <strong className="text-sm font-bold text-[#0d5c45]">
                            Demo details ready: {fullName}
                          </strong>
                        </div>
                        <Badge variant="success">Demo verification completed — no government database was contacted.</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div>
                          <span className="text-[#5e6f68]">Date of Birth</span>
                          <strong className="block text-[#152321]">{dob}</strong>
                        </div>
                        <div>
                          <span className="text-[#5e6f68]">Father / Guardian</span>
                          <strong className="block text-[#152321]">{guardianName}</strong>
                        </div>
                        <div>
                          <span className="text-[#5e6f68]">Gender / Mobile</span>
                          <strong className="block text-[#152321]">{gender} · {mobile}</strong>
                        </div>
                        <div className="sm:col-span-3">
                          <span className="text-[#5e6f68]">Residential Address</span>
                          <strong className="block text-[#152321]">{address}</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between p-0 pt-4 border-t border-slate-100">
                  <Button variant="outline" onClick={() => router.push("/services")}>
                    <ArrowLeft size={16} className="mr-2" /> Back
                  </Button>
                  <Button onClick={continueToDeclaration} className="gap-2">
                    Continue to fitness declaration <ArrowRight size={16} />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* STEP 2: Medical Disability Checklist & Form 1 Self-Declaration */}
            {step === 1 && (
              <Card className="w-full space-y-6 p-4 sm:p-6">
                <CardHeader className="p-0">
                  <CardTitle>Step 3: Fitness declaration & vehicle categories</CardTitle>
                  <CardDescription>
                    Answer the fitness questions, then choose the vehicle types you want to learn in this single step.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-3.5">
                  {/* Fitness Questions in 2/3 Column Compact Grid */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#587269] block mb-2">
                      Medical Fitness Questions (Form 1 Statutory Declaration):
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {[
                        {
                          id: "epilepsy",
                          label: "Epilepsy / Giddiness / Fainting",
                          val: noEpilepsy,
                          set: setNoEpilepsy,
                          note: "Free from sudden fainting attacks",
                        },
                        {
                          id: "vision",
                          label: "Visual Acuity & Color Vision",
                          val: normalVision,
                          set: setNormalVision,
                          note: "Normal 25m distance & Red/Green vision",
                        },
                        {
                          id: "disability",
                          label: "Physical Motor Control",
                          val: noDisability,
                          set: setNoDisability,
                          note: "No motor disability impairing driving",
                        },
                        {
                          id: "hearing",
                          label: "Auditory Alertness & Night Vision",
                          val: normalHearing,
                          set: setNormalHearing,
                          note: "Normal hearing & night alertness",
                        },
                        {
                          id: "organ",
                          label: "Organ Donation Pledge",
                          val: organDonation,
                          set: setOrganDonation,
                          note: "Pledge organ donation in emergency",
                        },
                      ].map((item, idx) => (
                        <label
                          key={item.id}
                          className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-[#cfe3dd] bg-[#f9fbfb] p-2.5 transition hover:bg-[#edf7f4]"
                        >
                          <input
                            type="checkbox"
                            checked={item.val}
                            onChange={(e) => item.set(e.target.checked)}
                            className="mt-0.5 h-3.5 w-3.5 rounded accent-[#167c74]"
                          />
                          <div className="text-[11px] min-w-0">
                            <strong className="block text-[#152321] truncate font-bold">
                              {idx + 1}. {item.label}
                            </strong>
                            <span className="text-[10px] text-[#5e6f68] block mt-0.5 truncate">{item.note}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#cfe3dd] bg-white p-2.5">
                    <label className="flex cursor-pointer items-center gap-2.5 text-xs font-bold text-[#152321]">
                      <input
                        type="checkbox"
                        checked={medicalDeclaration}
                        onChange={(e) => setMedicalDeclaration(e.target.checked)}
                        className="h-4 w-4 rounded accent-[#167c74]"
                      />
                      <span>
                        I solemnly declare that the answers given above are true and complete under CMVR 1989.
                      </span>
                    </label>
                  </div>

                  {/* Vehicle Categories - Compact Height */}
                  <div className="border-t border-slate-100 pt-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-xs font-extrabold text-[#152321] uppercase tracking-wider">Choose vehicle categories</h3>
                        <p className="text-[11px] text-[#5e6f68]">Select one or more classes to endorse on your Learner Licence.</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] text-[#167c74] border-[#167c74]/30 bg-[#ddf3ef]/40 font-bold py-0.5">
                        Multi-class Enabled
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                      {VEHICLE_CLASSES.map((vc) => {
                        const isSelected = selectedClasses.includes(vc.id);
                        return (
                          <button
                            key={vc.id}
                            type="button"
                            onClick={() => toggleVehicleClass(vc.id)}
                            className={`group relative flex items-center gap-3 rounded-xl border p-2.5 text-left transition-all duration-200 ${
                              isSelected
                                ? "border-[#167c74] bg-[#edf7f4] ring-2 ring-[#167c74]/30 shadow-xs"
                                : "border-[#dce8e5] bg-white hover:border-[#167c74]/60 hover:shadow-xs"
                            }`}
                          >
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white p-0.5 border border-slate-100 flex items-center justify-center shadow-xs">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={vc.image}
                                alt={vc.name}
                                className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="rounded bg-[#152923] px-1.5 py-0.5 font-mono text-[9px] font-black text-[#72c9b7] tracking-wider">
                                  {vc.code}
                                </span>
                                <span
                                  className={`flex h-4 w-4 items-center justify-center rounded border text-[9px] font-black ${
                                    isSelected
                                      ? "border-[#167c74] bg-[#167c74] text-white"
                                      : "border-slate-300 bg-white text-transparent"
                                  }`}
                                >
                                  ✓
                                </span>
                              </div>
                              <strong className="mt-1 block text-xs font-bold text-[#152321] truncate group-hover:text-[#167c74]">
                                {vc.name}
                              </strong>
                              <span className="block text-[10px] text-[#5e6f68] truncate mt-0.5">
                                {vc.desc}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#eaf4ef] px-3 py-1.5 text-xs text-[#0f7655] font-bold">
                      <span className="text-[11px]">Selected: {VEHICLE_CLASSES.filter((vehicle) => selectedClasses.includes(vehicle.id)).map((vehicle) => vehicle.code).join(", ")}</span>
                      <span className="font-mono text-[11px]">Flat demo fee: ₹170.00</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-0 pt-4 border-t border-slate-100">
                  <Button variant="outline" onClick={() => setStep(0)}>
                    <ArrowLeft size={16} className="mr-2" /> Back
                  </Button>
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!medicalDeclaration}
                    className="gap-2"
                  >
                    Continue to documents <ArrowRight size={16} />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* STEP 3: Document sources */}
            {step === 2 && (
              <Card className="w-full space-y-6 p-4 sm:p-6">
                <CardHeader className="p-0">
                  <CardTitle>Step 3: Add supporting documents</CardTitle>
                  <CardDescription>
                    Fetch eligible records from your private wallet, use the demo DigiLocker fetch, or manually upload proof documents.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-5">
                  <div className="rounded-2xl border border-[#dce8e5] bg-[#fbfdfc] p-4">
                    <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#587269]">Required for this application</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      {[
                        { type: "Photo", title: "Applicant photograph", detail: "Recent clear face photo" },
                        { type: "Address Proof", title: "Address proof", detail: "Aadhaar, utility bill, or bank statement" },
                        { type: "Name Proof", title: "Name / identity proof", detail: "PAN, Aadhaar, passport, or school record" },
                      ].map((item) => (
                        <div key={item.type} className="rounded-xl border border-[#dce8e5] bg-white p-3 text-xs">
                          <strong className="block text-[#152321]">{item.title}</strong>
                          <span className="mt-1 block text-[#5e6f68]">{item.detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={docMethod === "wallet" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDocMethod("wallet")}
                    >
                      <WalletCards size={15} /> Fetch from wallet
                    </Button>
                    <Button
                      variant={docMethod === "digilocker" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDocMethod("digilocker")}
                    >
                      Fetch DigiLocker documents
                    </Button>
                    <Button
                      variant={docMethod === "manual" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDocMethod("manual")}
                    >
                      Manual Document Upload
                    </Button>
                  </div>

                  <div className="rounded-2xl border border-[#cfe3dd] bg-[#f8fbf9] p-4">
                    <div className="flex items-center justify-between gap-3"><div><strong className="block text-sm text-[#152321]">Attached to this application</strong><span className="text-xs text-[#5e6f68]">Add from Wallet or use the manual upload option.</span></div><Badge variant="success">{attachedDocuments.length} attached</Badge></div>
                    {attachedDocuments.length > 0 ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{attachedDocuments.map((document) => <div key={document.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#cfe3dd] bg-white p-3 text-xs"><span className="min-w-0"><strong className="block truncate text-[#152321]">{document.name}</strong><small className="block truncate text-[#5e6f68]">{document.detail} · {document.source}</small></span><Button type="button" size="sm" variant="ghost" className="shrink-0 text-red-700 hover:bg-red-50 hover:text-red-700" onClick={() => removeAttachedDocument(document.id)}>Remove</Button></div>)}</div> : <p className="mt-3 text-xs text-[#687d75]">No documents attached yet.</p>}
                  </div>

                  {documentFetchStatus && <p className="rounded-xl border border-[#cfe3dd] bg-[#f2f8f6] px-3 py-2 text-xs font-medium text-[#405e54]" role="status">{documentFetchStatus}</p>}

                  {docMethod === "wallet" ? (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-[#cfe3dd] bg-[#edf7f4] p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#167c74] text-white"><WalletCards size={20} /></div><div><strong className="block text-sm text-[#0d5c45]">Your Appwrite document wallet</strong><span className="text-xs text-[#5e6f68]">Fetch documents already saved to your authenticated account.</span></div></div>
                          <Button size="sm" onClick={fetchWalletDocuments}>Fetch documents</Button>
                        </div>
                      </div>
                      {walletDocuments.length > 0 && <div className="grid gap-3 sm:grid-cols-2">{walletDocuments.map((doc) => {
                        const attached = attachedDocuments.some((item) => item.id === doc.id);
                        return <div key={doc.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#cfe3dd] bg-white p-3.5 text-xs"><div className="min-w-0"><strong className="block truncate text-[#152321]">{doc.name}</strong><span className="block truncate text-[#5e6f68]">{doc.detail}</span></div><Button type="button" size="sm" variant={attached ? "secondary" : "outline"} disabled={attached} onClick={() => attachWalletDocument(doc)}>{attached ? "Added" : "Add"}</Button></div>;
                      })}</div>}
                    </div>
                  ) : docMethod === "digilocker" ? (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-[#cfe3dd] bg-[#edf7f4] p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#167c74] text-white">
                              <ShieldCheck size={20} />
                            </div>
                            <div>
                              <strong className="block text-sm font-bold text-[#0d5c45]">
                                DigiLocker demo documents
                              </strong>
                              <span className="text-xs text-[#5e6f68]">
                                Fetch a fictional identity, age and address proof set.
                              </span>
                            </div>
                          </div>
                          <Button size="sm" onClick={fetchDigiLockerDocuments}>Fetch documents</Button>
                        </div>
                      </div>

                      {documentFetchStatus.startsWith("Demo DigiLocker") && <div className="grid gap-3 sm:grid-cols-2">
                        {[
                          { title: "Applicant Photograph", num: "PHOTO-DEMO-2026", authority: "Demo DigiLocker", type: "Photo" },
                          { title: "Aadhaar eKYC Certificate", num: aadhaarNumber, authority: "UIDAI", type: "Address & name proof" },
                          { title: "PAN Verification Record", num: panNumber, authority: "Income Tax Dept", type: "Name proof" },
                          { title: "Age Proof (10th Certificate)", num: "CERT-2016-8921", authority: "State Board", type: "Age proof" },
                          { title: "Form 1 Medical Self-Declaration", num: "MED-FIT-2026", authority: "Smart RTO", type: "Medical declaration" },
                        ].map((doc) => (
                          <div
                            key={doc.title}
                            className="flex items-center justify-between rounded-xl border border-[#cfe3dd] bg-white p-3.5 text-xs"
                          >
                            <div>
                              <strong className="block text-[#152321]">{doc.title}</strong>
                              <span className="font-mono text-[#5e6f68]">{doc.num} · {doc.authority}</span>
                              <span className="mt-1 inline-flex rounded-full bg-[#eaf4ef] px-2 py-0.5 text-[10px] font-bold text-[#0f7655]">{doc.type}</span>
                            </div>
                            <CheckCircle2 size={18} className="text-[#0f7655]" />
                          </div>
                        ))}
                      </div>}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-dashed border-[#167c74] bg-[#f8fbf9] p-6 text-center">
                        <UploadCloud className="mx-auto text-[#167c74]" size={36} />
                          <strong className="mt-2 block text-sm text-[#152321]">
                          Upload proof documents
                        </strong>
                        <p className="text-xs text-[#5e6f68]">
                          Supported formats: PDF or image, up to 2 MB each. Files are uploaded to your private Appwrite wallet.
                        </p>
                        <p className="mt-2 text-[11px] text-[#5e6f68]">Choose one or more files. You need an authenticated Appwrite account and bucket access.</p>
                        <div className="mx-auto mt-4 grid max-w-md grid-cols-1 gap-2 text-left sm:grid-cols-3">
                          {[
                            { type: "Photo" as const, label: "Applicant photo" },
                            { type: "Address Proof" as const, label: "Address proof" },
                            { type: "Name Proof" as const, label: "Name proof" },
                            { type: "Age Proof" as const, label: "Age proof" },
                            { type: "Medical Self-Declaration" as const, label: "Medical declaration" },
                          ].map((item) => (
                            <button
                              key={item.type}
                              type="button"
                              onClick={() => setManualDocumentType(item.type)}
                              className={`rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${manualDocumentType === item.type ? "border-[#167c74] bg-[#167c74] text-white" : "border-[#cfe3dd] bg-white text-[#405e54] hover:border-[#167c74]"}`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          className="mt-4 gap-1.5"
                          onClick={() => manualUploadRef.current?.click()}
                        >
                          {manualDocsUploaded ? "Add more files" : "Select files"}
                        </Button>
                        <input ref={manualUploadRef} type="file" className="sr-only" accept="application/pdf,image/*" multiple onChange={(event) => uploadManualDocuments(event.target.files)} />
                        {manualDocumentNames.length > 0 && <p className="mt-3 text-xs font-bold text-[#0d5c45]">Attached as {manualDocumentType}: {manualDocumentNames.join(", ")}</p>}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between p-0 pt-4 border-t border-slate-100">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft size={16} className="mr-2" /> Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="gap-2">
                    Pick Test Date & Pay <ArrowRight size={16} />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* STEP 5: Review, Select Test Date & Slot, and Pay (₹170) */}
            {step === 3 && (
              <Card className="w-full space-y-6 p-4 sm:p-6">
                <CardHeader className="p-0">
                  <CardTitle>Step 5: Choose a test time and review payment</CardTitle>
                  <CardDescription>
                    Select your RTO office, preferred date & time for the computer exam, and pay statutory fee.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-5">
                  {/* Summary Box */}
                  <div className="grid gap-4 rounded-xl border border-[#dce8e5] bg-slate-50/70 p-4 text-xs sm:grid-cols-2">
                    <div>
                      <span className="text-[#5e6f68]">Applicant Name</span>
                      <strong className="block text-[#152321]">{fullName}</strong>
                    </div>
                    <div>
                      <span className="text-[#5e6f68]">Identity Verification</span>
                      <strong className="block font-mono text-[#152321]">Aadhaar · {aadhaarNumber}</strong>
                    </div>
                    <div>
                      <span className="text-[#5e6f68]">Selected Categories</span>
                      <strong className="block text-[#0d5c45]">
                        {VEHICLE_CLASSES.filter((v) => selectedClasses.includes(v.id))
                          .map((v) => `${v.name} (${v.code})`)
                          .join(", ")}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#5e6f68]">Medical Fitness</span>
                      <strong className="block text-[#152321]">Form 1 Certified · Organ Pledged</strong>
                    </div>
                  </div>

                  {/* RTO Office Picker */}
                  <div>
                    <Label className="text-xs text-[#5e6f68] font-bold uppercase tracking-wider">
                      A. Select RTO Office
                    </Label>
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {RTO_OFFICES.map((rto) => {
                        const isSelected = rtoOffice === rto;
                        return (
                          <button
                            key={rto}
                            type="button"
                            onClick={() => setRtoOffice(rto)}
                            className={`flex items-center gap-2 rounded-xl border p-3 text-left text-xs font-bold transition-all ${
                              isSelected
                                ? "border-[#167c74] bg-[#edf7f4] text-[#167c74] ring-2 ring-[#167c74]/20"
                                : "border-[#dce8e5] bg-white hover:bg-[#f4fbf8]"
                            }`}
                          >
                            <Landmark size={15} />
                            <span>{rto}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Test Date Selector */}
                  <div>
                    <Label className="text-xs text-[#5e6f68] font-bold uppercase tracking-wider">
                      B. Select Computer Test Date
                    </Label>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {AVAILABLE_DATES.map((d) => {
                        const isDateSelected = selectedDate === d.dateStr;
                        return (
                          <button
                            key={d.dateStr}
                            type="button"
                            onClick={() => setSelectedDate(d.dateStr)}
                            className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                              isDateSelected
                                ? "border-[#167c74] bg-[#edf7f4] text-[#167c74] shadow-xs ring-2 ring-[#167c74]/20"
                                : "border-[#dce8e5] bg-white hover:bg-[#f4fbf8]"
                            }`}
                          >
                            <span className="text-[10px] font-bold uppercase tracking-wider">{formatDate(d.dateStr, { weekday: "long" })}</span>
                            <strong className="text-sm font-black text-[#152321]">{formatDate(d.dateStr, { day: "numeric", month: "short" })}</strong>
                            <span className="mt-1 rounded bg-[#ddf3ef] px-1.5 py-0.5 text-[9px] font-bold text-[#0f7655]">
                              {d.slotsCount} slots open
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Test Time Slot Selector */}
                  <div>
                    <Label className="text-xs text-[#5e6f68] font-bold uppercase tracking-wider">
                      C. Select Test Time Window
                    </Label>
                    <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                      {AVAILABLE_TIMES.map((t) => {
                        const isTimeSelected = selectedTime === t.timeStr;
                        return (
                          <button
                            key={t.timeStr}
                            type="button"
                            onClick={() => setSelectedTime(t.timeStr)}
                            className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                              isTimeSelected
                                ? "border-[#167c74] bg-[#edf7f4] text-[#167c74] ring-2 ring-[#167c74]/20"
                                : "border-[#dce8e5] bg-white hover:bg-[#f4fbf8]"
                            }`}
                          >
                            <div>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-[#0f7655]">
                                {t.batch}
                              </span>
                              <strong className="block text-xs text-[#152321]">{t.label}</strong>
                            </div>
                            {isTimeSelected && <Check size={16} className="text-[#167c74]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Confirmed Schedule Badge */}
                  <div className="rounded-xl border border-[#cfe3dd] bg-[#edf7f4] p-3.5 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} className="text-[#167c74]" />
                      <span className="text-[#5e6f68]">Confirmed Slot:</span>
                      <strong className="text-[#0d5c45]">{formatDate(selectedDate, { day: "numeric", month: "short" })} · {selectedTime} at {rtoOffice}</strong>
                    </div>
                    <Badge variant="success">Slot Active</Badge>
                  </div>

                  {/* Fee Breakdown */}
                  <div className="rounded-xl border border-[#cfe3dd] bg-white p-4 text-xs space-y-2">
                    <div className="flex justify-between text-[#5e6f68]">
                      <span>Govt Learner Licence Issuance Fee</span>
                      <strong className="text-[#152321]">{formatCurrency(150)}</strong>
                    </div>
                    <div className="flex justify-between text-[#5e6f68]">
                      <span>Computer Online Theory Test Fee</span>
                      <strong className="text-[#152321]">{formatCurrency(20)}</strong>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm font-extrabold text-[#152321]">
                      <span>Total Amount Payable</span>
                      <span className="text-[#0d5c45]">{formatCurrency(170)} (Demo Test Checkout)</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-0 pt-4 border-t border-slate-100">
                  <Button variant="outline" onClick={() => setStep(2)} disabled={processing}>
                    <ArrowLeft size={16} className="mr-2" /> Back
                  </Button>
                  <Button
                    onClick={submitLearnerApplication}
                    disabled={processing}
                    className="min-w-[190px] gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Processing...
                      </>
                    ) : (
                      <>Pay ₹170 & Book LL Test</>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        ) : (
          /* Success Screen */
          <Card className="w-full space-y-6 p-5 text-center sm:p-8">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e7f4ed] text-[#0d5c45]">
              <CheckCircle2 size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#152321]">
                Learner Licence Application Submitted!
              </h2>
              <p className="mt-1 text-sm text-[#5e6f68]">
                Your Form 2 Learner Licence application and computer exam slot have been scheduled.
              </p>
            </div>

            <div className="mx-auto max-w-md rounded-2xl border border-[#cfe3dd] bg-[#edf7f4] p-5 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-[#5e6f68]">Application Number:</span>
                <strong className="font-mono text-[#152321]">{submittedApp.id}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5e6f68]">Computer Test Slot:</span>
                <strong className="text-[#0d5c45]">{submittedApp.appointment}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5e6f68]">RTO Office:</span>
                <strong className="text-[#152321]">{submittedApp.rto}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5e6f68]">Payment Reference:</span>
                <strong className="font-mono text-[#152321]">{submittedApp.paymentReference}</strong>
              </div>
            </div>

            {syncStatus === "appwrite" ? (
              <div className="mx-auto flex max-w-md flex-col gap-2 rounded-xl border border-[#cfe3dd] bg-[#edf7f4] px-4 py-3 text-left text-xs" role="status">
                <span className="font-bold text-[#0d5c45]">✓ Saved on this device</span>
                <span className="font-bold text-[#0d5c45]">✓ Synced to Appwrite — available in Dashboard and Tracking</span>
              </div>
            ) : (
              <div className="mx-auto max-w-md rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-left text-xs font-semibold text-amber-800" role="status"><p className="m-0">✓ Saved on this device</p><p className="mt-1">Appwrite was not synced: {syncError}</p></div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row justify-center">
              <Button onClick={() => downloadApplicationPdf(submittedApp)} className="gap-2">
                <Download size={16} /> Download Form 2 Application & Slot Slip PDF
              </Button>
              <Button variant="outline" asChild>
                <Link href="/track">Track in Applications</Link>
              </Button>
            </div>
          </Card>
        )}
      </main>
    </PageShell>
  );
}
