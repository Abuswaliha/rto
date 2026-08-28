"use client";

import { useEffect, useState } from "react";
import Link from "./safe-link";
import { useRouter } from "next/navigation";
import { PageShell } from "./page-shell";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  IdCard,
  Landmark,
  Loader2,
  LockKeyhole,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UserCheck,
} from "lucide-react";
import Image from "next/image";
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
  Draft,
  createDemoAadhaarProfile,
  DEMO_AADHAAR_NUMBER,
  emptyDraft,
  loadDraft,
  newAppointmentId,
  newApplicationId,
  newPaymentReference,
  saveApplication,
  saveDemoProfile,
  saveDraft,
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
  { dateStr: "29 Aug 2026", day: "Friday", shortDate: "29 Aug", slotsCount: "18 slots open" },
  { dateStr: "30 Aug 2026", day: "Saturday", shortDate: "30 Aug", slotsCount: "24 slots open" },
  { dateStr: "31 Aug 2026", day: "Monday", shortDate: "31 Aug", slotsCount: "15 slots open" },
  { dateStr: "01 Sep 2026", day: "Tuesday", shortDate: "01 Sep", slotsCount: "30 slots open" },
  { dateStr: "02 Sep 2026", day: "Wednesday", shortDate: "02 Sep", slotsCount: "20 slots open" },
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
  const [step, setStep] = useState<number>(0);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  // Step 1: Aadhaar & PAN eKYC
  const [aadhaarNumber, setAadhaarNumber] = useState("9999 8888 7777");
  const [panNumber, setPanNumber] = useState("ABCDE1234F");
  const [fullName, setFullName] = useState("Demo Citizen");
  const [dob, setDob] = useState("15/01/2000");
  const [guardianName, setGuardianName] = useState("Ramesh Citizen");
  const [gender, setGender] = useState("Male");
  const [mobile, setMobile] = useState("9999999999");
  const [address, setAddress] = useState("Flat 402, Green Avenue, Sangli 416416");
  const [ekycVerified, setEkycVerified] = useState(true);

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
  const [digilockerLinked, setDigilockerLinked] = useState(true);
  const [manualDocsUploaded, setManualDocsUploaded] = useState(false);

  // Step 5: Test Date & Time Slot + RTO
  const [rtoOffice, setRtoOffice] = useState("MH-10 Sangli RTO");
  const [selectedDate, setSelectedDate] = useState("29 Aug");
  const [selectedTime, setSelectedTime] = useState("11:20 AM");

  // Submitted Record
  const [submittedApp, setSubmittedApp] = useState<DemoApplication | null>(null);

  function autofillAadhaarDemo() {
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
    const appId = newApplicationId();
    const paymentRef = newPaymentReference();
    const appointmentId = newAppointmentId();
    const appointmentSlot = `${selectedDate} · ${selectedTime}`;

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
      } catch (err) {
        console.warn("Appwrite LL sync note:", err);
      }
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
            Apply online for Form 2 Learner Licence with digital Aadhaar eKYC, Form 1 physical fitness declaration, and live computer test slot booking.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        {!submittedApp ? (
          <div className="space-y-8">
            {/* 5-Step Process Indicator */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {[
                { id: 0, title: "1. Identity eKYC", sub: "Aadhaar & PAN" },
                { id: 1, title: "2. Declaration", sub: "Form 1 Medical" },
                { id: 2, title: "3. Vehicle Types", sub: "Select classes" },
                { id: 3, title: "4. Documents", sub: "DigiLocker sync" },
                { id: 4, title: "5. Slot & Pay", sub: "Test date & ₹170" },
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

            {/* STEP 1: Aadhaar & PAN eKYC Verification */}
            {step === 0 && (
              <Card className="p-6 space-y-6">
                <CardHeader className="p-0 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Step 1: Aadhaar & PAN eKYC Verification</CardTitle>
                    <CardDescription>
                      Authenticate your identity through national eKYC database for seamless Learner Licence issuance.
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={autofillAadhaarDemo}
                    className="gap-1.5 text-xs text-[#167c74]"
                  >
                    <Sparkles size={14} /> Auto-fill Demo
                  </Button>
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
                      />
                    </div>
                    <div>
                      <Label htmlFor="pan">PAN Card Number</Label>
                      <Input
                        id="pan"
                        value={panNumber}
                        onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                        className="mt-1.5 font-mono uppercase"
                        placeholder="ABCDE1234F"
                      />
                    </div>
                  </div>

                  {ekycVerified && (
                    <div className="rounded-2xl border border-[#cfe3dd] bg-[#edf7f4] p-5 text-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-[#cfe3dd] pb-3">
                        <div className="flex items-center gap-2">
                          <UserCheck size={18} className="text-[#167c74]" />
                          <strong className="text-sm font-bold text-[#0d5c45]">
                            eKYC Authenticated: {fullName}
                          </strong>
                        </div>
                        <Badge variant="success">UIDAI & NSDL Verified</Badge>
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
                  <Button onClick={() => setStep(1)} className="gap-2">
                    Continue to Medical Declaration <ArrowRight size={16} />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* STEP 2: Medical Disability Checklist & Form 1 Self-Declaration */}
            {step === 1 && (
              <Card className="p-6 space-y-6">
                <CardHeader className="p-0">
                  <CardTitle>Step 2: Form 1 Physical Fitness & Self-Declaration</CardTitle>
                  <CardDescription>
                    Statutory medical fitness questions under Section 5 of Central Motor Vehicles Rules 1989.
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
                    Select Vehicle Classes <ArrowRight size={16} />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* STEP 3: Vehicle Type Selection Cards with Icons */}
            {step === 2 && (
              <Card className="p-6 space-y-6">
                <CardHeader className="p-0">
                  <CardTitle>Step 3: Select Vehicle Categories for Learner Licence</CardTitle>
                  <CardDescription>
                    Choose the vehicle types you want to learn. You may choose multiple categories.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {VEHICLE_CLASSES.map((vc) => {
                      const isSelected = selectedClasses.includes(vc.id);
                      return (
                        <div
                          key={vc.id}
                          onClick={() => toggleVehicleClass(vc.id)}
                          className={`cursor-pointer rounded-2xl border p-5 transition-all hover:scale-[1.01] ${
                            isSelected
                              ? "border-[#167c74] bg-[#edf7f4] shadow-sm ring-2 ring-[#167c74]/20"
                              : "border-[#dce8e5] bg-white hover:border-[#167c74]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-3xl">{vc.icon}</span>
                            <Badge variant={isSelected ? "success" : "secondary"}>
                              {isSelected ? "Selected ✓" : "Click to select"}
                            </Badge>
                          </div>
                          <div className="mt-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0f7655]">
                              {vc.badge}
                            </span>
                            <h3 className="text-base font-extrabold text-[#152321]">
                              {vc.name} ({vc.code})
                            </h3>
                            <p className="mt-1 text-xs text-[#5e6f68] leading-relaxed">{vc.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-xl border border-[#cfe3dd] bg-[#f8fbf9] p-4 text-xs flex justify-between items-center">
                    <div>
                      <strong className="text-[#152321]">Selected Categories:</strong>
                      <span className="ml-2 text-[#0d5c45] font-bold">
                        {VEHICLE_CLASSES.filter((v) => selectedClasses.includes(v.id))
                          .map((v) => v.code)
                          .join(", ")}
                      </span>
                    </div>
                    <Badge variant="secondary">Flat LL Fee: ₹170</Badge>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-0 pt-4 border-t border-slate-100">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft size={16} className="mr-2" /> Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="gap-2">
                    Continue to Documents <ArrowRight size={16} />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* STEP 4: Document Verification (DigiLocker vs Manual) */}
            {step === 3 && (
              <Card className="p-6 space-y-6">
                <CardHeader className="p-0">
                  <CardTitle>Step 4: Document Verification & Digital Locker</CardTitle>
                  <CardDescription>
                    Verify your identity and address credentials from national repositories.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-5">
                  <div className="flex gap-2">
                    <Button
                      variant={docMethod === "digilocker" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDocMethod("digilocker")}
                    >
                      Instant DigiLocker Sync (Recommended)
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
                                DigiLocker e-Verification Active
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
                          Upload Scanned Proof Documents
                        </strong>
                        <p className="text-xs text-[#5e6f68]">
                          Upload 10th marksheet, address proof, and Form 1 (PDF / JPG max 2MB)
                        </p>
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
                  <Button variant="outline" onClick={() => setStep(2)}>
                    <ArrowLeft size={16} className="mr-2" /> Back
                  </Button>
                  <Button onClick={() => setStep(4)} className="gap-2">
                    Pick Test Date & Pay <ArrowRight size={16} />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* STEP 5: Review, Select Test Date & Slot, and Pay (₹170) */}
            {step === 4 && (
              <Card className="p-6 space-y-6">
                <CardHeader className="p-0">
                  <CardTitle>Step 5: Select Test Date & Complete Payment</CardTitle>
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
                        const isDateSelected = selectedDate === d.shortDate;
                        return (
                          <button
                            key={d.dateStr}
                            type="button"
                            onClick={() => setSelectedDate(d.shortDate)}
                            className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                              isDateSelected
                                ? "border-[#167c74] bg-[#edf7f4] text-[#167c74] shadow-xs ring-2 ring-[#167c74]/20"
                                : "border-[#dce8e5] bg-white hover:bg-[#f4fbf8]"
                            }`}
                          >
                            <span className="text-[10px] font-bold uppercase tracking-wider">{d.day}</span>
                            <strong className="text-sm font-black text-[#152321]">{d.shortDate}</strong>
                            <span className="mt-1 rounded bg-[#ddf3ef] px-1.5 py-0.5 text-[9px] font-bold text-[#0f7655]">
                              {d.slotsCount}
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
                      <strong className="text-[#0d5c45]">{selectedDate} · {selectedTime} at {rtoOffice}</strong>
                    </div>
                    <Badge variant="success">Slot Active</Badge>
                  </div>

                  {/* Fee Breakdown */}
                  <div className="rounded-xl border border-[#cfe3dd] bg-white p-4 text-xs space-y-2">
                    <div className="flex justify-between text-[#5e6f68]">
                      <span>Govt Learner Licence Issuance Fee</span>
                      <strong className="text-[#152321]">₹150.00</strong>
                    </div>
                    <div className="flex justify-between text-[#5e6f68]">
                      <span>Computer Online Theory Test Fee</span>
                      <strong className="text-[#152321]">₹20.00</strong>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm font-extrabold text-[#152321]">
                      <span>Total Amount Payable</span>
                      <span className="text-[#0d5c45]">₹170.00 (Demo Test Checkout)</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-0 pt-4 border-t border-slate-100">
                  <Button variant="outline" onClick={() => setStep(3)} disabled={processing}>
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
