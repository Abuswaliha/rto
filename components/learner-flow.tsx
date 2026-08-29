"use client";

import { useEffect, useState } from "react";
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
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UserCheck,
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
  hasSession,
} from "@/lib/storage";
import {
  isAppwriteConfigured,
  saveApplicationRecord,
} from "@/lib/appwrite";
import { downloadApplicationPdf } from "@/lib/demo-pdf";

interface VehicleClassOption {
  id: string;
  code: string;
  name: string;
  desc: string;
  icon: string;
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
    badge: "Two Wheeler (Non-Geared)",
    fee: 150,
  },
  {
    id: "mcwg",
    code: "MCWG",
    name: "Motorcycle With Gear",
    desc: "All Geared Motorcycles, Commuter & Sports Bikes (e.g. Splendor, Pulsar, RE)",
    icon: "🏍️",
    badge: "Two Wheeler (Geared)",
    fee: 150,
  },
  {
    id: "lmv",
    code: "LMV",
    name: "Light Motor Vehicle",
    desc: "Cars, Jeeps, Sedans, Hatchbacks, SUVs, Light Taxis",
    icon: "🚗",
    badge: "Four Wheeler (Light)",
    fee: 150,
  },
  {
    id: "hmv",
    code: "HMV / Commercial",
    name: "Heavy / Commercial Vehicle (Big Vehicle)",
    desc: "Heavy Goods Transport, Multi-Axle Trucks, Passenger Buses",
    icon: "🚛",
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

export function LearnerFlow() {
  const router = useRouter();
  const { language } = useLanguage();
  const { enabled: demoMode } = useDemoMode();
  const [started, setStarted] = useState(false);
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
  const [docMethod, setDocMethod] = useState<"digilocker" | "manual">("digilocker");
  const [manualDocsUploaded, setManualDocsUploaded] = useState(false);

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

  function beginApplication() {
    if (!hasSession()) {
      router.push("/login?next=/apply/learner-licence");
      return;
    }
    setStarted(true);
  }

  function continueToDeclaration() {
    if (!demoMode) {
      setError("Demo details are unavailable while Demo Mode is off. Turn Demo Mode on to use this fictional prototype flow.");
      return;
    }
    if (!/^9999\s?8888\s?7777$/.test(aadhaarNumber) || !/^ABCDE1234F$/.test(panNumber)) {
      setError("Use the fictional examples shown: Aadhaar 9999 8888 7777 and PAN ABCDE1234F. Select Fill demo details to add them.");
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
      documents: ["Aadhaar eKYC", "PAN Record", "Form 1 Medical Declaration", "Age Proof"],
    };

    saveApplication(applicationRecord);

    setTimeout(() => {
      setSubmittedApp(applicationRecord);
      setProcessing(false);
    }, 800);
  }

  return (
    <PageShell>
      {/* Hero Header */}
      <section className="border-b border-[#dce8e5] bg-gradient-to-br from-[#f7fbfa] via-white to-[#edf7f4] py-10">
        <div className="mx-auto max-w-5xl px-6">
          <Badge variant="secondary" className="mb-2 gap-1.5 font-bold">
            <FileText size={14} className="text-[#167c74]" /> Form 2 · Ministry of Road Transport & Highways
          </Badge>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#152321] md:text-3xl">
            Learner Licence (LL) Application
          </h1>
          <p className="mt-1 max-w-2xl text-xs font-medium text-[#5e6f68] md:text-sm">
            Review what you need first, then complete five clear stages. This is a fictional demonstration—no government system is contacted.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        {!submittedApp && !started ? (
          <Card className="space-y-6 p-6 md:p-8">
            <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#edf7f4] text-[#167c74]"><FileCheck2 size={21} /></span><div><p className="text-xs font-bold uppercase tracking-wider text-[#167c74]">Step 1 of 5</p><CardTitle>Before you begin</CardTitle><CardDescription>Check the requirements before sharing any information.</CardDescription></div></div>
            <div className="grid gap-3 text-sm sm:grid-cols-2"><div className="rounded-xl border border-[#dce8e5] p-4"><strong className="block text-[#152321]">Eligibility</strong><span className="text-xs text-[#5e6f68]">You must be old enough for the vehicle category you choose and able to make the fitness declaration.</span></div><div className="rounded-xl border border-[#dce8e5] p-4"><strong className="block text-[#152321]">Documents</strong><span className="text-xs text-[#5e6f68]">Demo identity details, age or address proof, and a Form 1 declaration. Manual uploads accept PDF or JPG, up to 2 MB each.</span></div><div className="rounded-xl border border-[#dce8e5] p-4"><strong className="block text-[#152321]">Fee and time</strong><span className="text-xs text-[#5e6f68]">₹170 demo checkout: ₹150 application fee and ₹20 test fee. Allow about 8 minutes.</span></div><div className="rounded-xl border border-[#dce8e5] p-4"><strong className="block text-[#152321]">Need help?</strong><span className="text-xs text-[#5e6f68]">You can go back at any point. Your demo progress is saved on this device after you sign in.</span></div></div>
            <div className="flex gap-3 rounded-xl border border-[#cfe3dd] bg-[#edf7f4] p-4 text-xs text-[#40564f]"><LockKeyhole size={18} className="shrink-0 text-[#167c74]"/><p className="m-0"><strong>Privacy notice:</strong> This prototype uses fictional demo data only. Do not enter real Aadhaar or PAN details; nothing is sent to a government database.</p></div>
            <CardFooter className="justify-end border-t border-slate-100 p-0 pt-5"><Button onClick={beginApplication} className="gap-2">Begin application <ArrowRight size={16} /></Button></CardFooter>
          </Card>
        ) : !submittedApp ? (
          <div className="space-y-8">
            {/* Five-stage journey: overview, identity, combined declaration/category, documents and slot. */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              <Card className="border-[#cfe3dd] bg-[#edf7f4] p-3.5 text-[#167c74]"><span className="text-[10px] font-bold uppercase tracking-wider">Step 1</span><strong className="mt-1 block text-xs text-[#152321]">Before you begin</strong><span className="text-[10px] text-[#5e6f68]">Requirements checked</span></Card>
              {[
                { id: 0, title: "2. Identity details", sub: "Demo Aadhaar & PAN" },
                { id: 1, title: "3. Fitness & vehicles", sub: "Declaration and classes" },
                { id: 2, title: "4. Documents", sub: "Add proof" },
                { id: 3, title: "5. Slot & payment", sub: "Test date & ₹170" },
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
                      Step {s.id + 2}
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
              <Card className="p-6 space-y-6">
                <CardHeader className="p-0 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Step 2: Demo identity details</CardTitle>
                    <CardDescription>
                      We use these fictional details only to prefill this demo application. No government database is contacted.
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
                      <p id="aadhaar-help" className="mt-1 text-[11px] text-[#5e6f68]"><strong>Why we need this:</strong> it demonstrates how a form can prefill basic details. Example: 9999 8888 7777. Use the demo number only; select Fill demo details if you want to use the example.</p>
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
                      <p id="pan-help" className="mt-1 text-[11px] text-[#5e6f68]"><strong>Why we need this:</strong> it is a second demo reference. Example: ABCDE1234F. Do not enter a real PAN; select Fill demo details if you want to use the example.</p>
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
                <CardFooter className="flex justify-end p-0 pt-4 border-t border-slate-100">
                  <Button onClick={continueToDeclaration} className="gap-2">
                    Continue to fitness declaration <ArrowRight size={16} />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* STEP 2: Medical Disability Checklist & Form 1 Self-Declaration */}
            {step === 1 && (
              <Card className="p-6 space-y-6">
                <CardHeader className="p-0">
                  <CardTitle>Step 3: Fitness declaration & vehicle categories</CardTitle>
                  <CardDescription>
                    Answer the fitness questions, then choose the vehicle types you want to learn in this single step.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div className="space-y-3">
                    {[
                      {
                        id: "epilepsy",
                        label: "Do you suffer from epilepsy, sudden attacks of giddiness, or fainting spells?",
                        val: noEpilepsy,
                        set: setNoEpilepsy,
                        note: "Must be 'No' for safe driving fitness",
                      },
                      {
                        id: "vision",
                        label: "Are you able to distinguish pigmentary colors (Red & Green) and read a vehicle plate at 25m distance?",
                        val: normalVision,
                        set: setNormalVision,
                        note: "Normal visual acuity required",
                      },
                      {
                        id: "disability",
                        label: "Do you have any physical defect, loss of limbs, or muscular weakness impairing vehicle control?",
                        val: noDisability,
                        set: setNoDisability,
                        note: "Validates motor driving capability",
                      },
                      {
                        id: "hearing",
                        label: "Do you suffer from severe deafness or night blindness?",
                        val: normalHearing,
                        set: setNormalHearing,
                        note: "Auditory alertness declaration",
                      },
                      {
                        id: "organ",
                        label: "Organ Donation Pledge: In the event of fatal road accident, I wish to donate my organs.",
                        val: organDonation,
                        set: setOrganDonation,
                        note: "Endorsed on Learner & Smart Card DL",
                      },
                    ].map((item, idx) => (
                      <label
                        key={item.id}
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#cfe3dd] bg-[#f9fbfb] p-3.5 transition hover:bg-[#edf7f4]"
                      >
                        <input
                          type="checkbox"
                          checked={item.val}
                          onChange={(e) => item.set(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded accent-[#167c74]"
                        />
                        <div className="text-xs">
                          <strong className="block text-[#152321]">
                            {idx + 1}. {item.label}
                          </strong>
                          <span className="text-[#5e6f68]">{item.note}</span>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="rounded-xl border border-[#cfe3dd] bg-white p-4">
                    <label className="flex cursor-pointer items-center gap-3 text-xs font-bold text-[#152321]">
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
                  <div className="border-t border-slate-100 pt-5">
                    <h3 className="text-sm font-extrabold text-[#152321]">Choose vehicle categories</h3>
                    <p className="mt-1 text-xs text-[#5e6f68]">Choose one or more categories for this demo Learner Licence.</p>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {VEHICLE_CLASSES.map((vc) => {
                        const isSelected = selectedClasses.includes(vc.id);
                        return <button key={vc.id} type="button" onClick={() => toggleVehicleClass(vc.id)} className={`rounded-xl border p-3 text-left transition ${isSelected ? "border-[#167c74] bg-[#edf7f4] ring-2 ring-[#167c74]/20" : "border-[#dce8e5] bg-white hover:border-[#167c74]"}`}><span className="text-xl">{vc.icon}</span><strong className="ml-2 text-xs text-[#152321]">{vc.name} ({vc.code})</strong><span className="mt-1 block text-[11px] text-[#5e6f68]">{vc.desc}</span></button>;
                      })}
                    </div>
                    <p className="mt-3 text-xs font-bold text-[#0d5c45]">Selected: {VEHICLE_CLASSES.filter((vehicle) => selectedClasses.includes(vehicle.id)).map((vehicle) => vehicle.code).join(", ")} · Flat demo fee: ₹170</p>
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

            {/* STEP 4: Document Verification (DigiLocker vs Manual) */}
            {step === 2 && (
              <Card className="p-6 space-y-6">
                <CardHeader className="p-0">
                  <CardTitle>Step 4: Add supporting documents</CardTitle>
                  <CardDescription>
                    Choose a demo prefill or add fictional proof files yourself. Neither option connects to DigiLocker or another government service.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-5">
                  <div className="flex gap-2">
                    <Button
                      variant={docMethod === "digilocker" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDocMethod("digilocker")}
                    >
                      Use demo document prefill
                    </Button>
                    <Button
                      variant={docMethod === "manual" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDocMethod("manual")}
                    >
                      Manual Document Upload
                    </Button>
                  </div>

                  {docMethod === "digilocker" ? (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-[#cfe3dd] bg-[#edf7f4] p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#167c74] text-white">
                              <ShieldCheck size={20} />
                            </div>
                            <div>
                              <strong className="block text-sm font-bold text-[#0d5c45]">
                                Demo documents ready
                              </strong>
                              <span className="text-xs text-[#5e6f68]">
                                Identity, age and address proof fetched automatically.
                              </span>
                            </div>
                          </div>
                          <Badge variant="success">Verified ✓</Badge>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {[
                          { title: "Aadhaar eKYC Certificate", num: aadhaarNumber, authority: "UIDAI" },
                          { title: "PAN Verification Record", num: panNumber, authority: "Income Tax Dept" },
                          { title: "Age Proof (10th Certificate)", num: "CERT-2016-8921", authority: "State Board" },
                          { title: "Form 1 Medical Self-Declaration", num: "MED-FIT-2026", authority: "Smart RTO" },
                        ].map((doc) => (
                          <div
                            key={doc.title}
                            className="flex items-center justify-between rounded-xl border border-[#cfe3dd] bg-white p-3.5 text-xs"
                          >
                            <div>
                              <strong className="block text-[#152321]">{doc.title}</strong>
                              <span className="font-mono text-[#5e6f68]">{doc.num} · {doc.authority}</span>
                            </div>
                            <CheckCircle2 size={18} className="text-[#0f7655]" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-dashed border-[#167c74] bg-[#f8fbf9] p-6 text-center">
                        <UploadCloud className="mx-auto text-[#167c74]" size={36} />
                          <strong className="mt-2 block text-sm text-[#152321]">
                          Upload demo proof documents
                        </strong>
                        <p className="text-xs text-[#5e6f68]">
                          Supported formats: PDF or JPG, up to 2 MB each. Example: a readable address proof, age proof, and Form 1.
                        </p>
                        <p className="mt-2 text-[11px] text-[#5e6f68]">If a file is rejected, check its format and size, then choose Select Files again. You can switch back to demo prefill at any time.</p>
                        <Button
                          size="sm"
                          className="mt-4 gap-1.5"
                          onClick={() => setManualDocsUploaded(true)}
                        >
                          {manualDocsUploaded ? "Documents Attached ✓" : "Select Files"}
                        </Button>
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
              <Card className="p-6 space-y-6">
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
          <Card className="p-8 text-center space-y-6">
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
              <p className="text-xs font-bold text-[#0d5c45]" role="status">Saved to Appwrite. This application is available in Dashboard and Tracking.</p>
            ) : (
              <p className="mx-auto max-w-md rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800" role="status">Saved only on this device. Appwrite did not save this application: {syncError}</p>
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
