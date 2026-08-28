"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Car,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  IdCard,
  Info,
  Landmark,
  Loader2,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import Link from "./safe-link";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  DemoApplication,
  loadApplication,
  newApplicationId,
  newPaymentReference,
  saveApplication,
} from "@/lib/storage";
import { isAppwriteConfigured, saveApplicationRecord } from "@/lib/appwrite";
import { downloadPermanentDLPdf } from "@/lib/demo-pdf";

const TRACK_DATES = [
  { dateStr: "02 Sep 2026", day: "Wednesday", shortDate: "02 Sep", slotsCount: "12 track slots" },
  { dateStr: "03 Sep 2026", day: "Thursday", shortDate: "03 Sep", slotsCount: "18 track slots" },
  { dateStr: "04 Sep 2026", day: "Friday", shortDate: "04 Sep", slotsCount: "10 track slots" },
  { dateStr: "05 Sep 2026", day: "Saturday", shortDate: "05 Sep", slotsCount: "25 track slots" },
  { dateStr: "07 Sep 2026", day: "Monday", shortDate: "07 Sep", slotsCount: "16 track slots" },
];

const TRACK_TIME_SLOTS = [
  { timeStr: "09:30 AM", label: "09:30 AM – 11:00 AM", session: "Track Slot 1" },
  { timeStr: "11:30 AM", label: "11:30 AM – 01:00 PM", session: "Track Slot 2 (Recommended)" },
  { timeStr: "02:30 PM", label: "02:30 PM – 04:00 PM", session: "Track Slot 3" },
  { timeStr: "04:15 PM", label: "04:15 PM – 05:45 PM", session: "Track Slot 4" },
];

export function PermanentLicenceFlow() {
  const [step, setStep] = useState<number>(0);

  // Step 1: Approved Learner Licence Verification
  const [llInput, setLlInput] = useState("MH10/LL/2026/009841");
  const [llVerified, setLlVerified] = useState(true);
  const [applicantName, setApplicantName] = useState("Demo Citizen");
  const [aadhaarNumber, setAadhaarNumber] = useState("9999 8888 7777");
  const [panNumber, setPanNumber] = useState("ABCDE1234F");
  const [dob, setDob] = useState("15/01/2000");
  const [rtoOffice, setRtoOffice] = useState("MH-10 Sangli RTO (Automated Driving Track)");
  const [approvedClasses, setApprovedClasses] = useState<string[]>(["MCWG", "LMV"]);
  const [llValidity, setLlValidity] = useState("25/08/2026 to 24/02/2027 (Active)");

  // Step 2: Driving Track Test Slot Selection
  const [selectedTrackDate, setSelectedTrackDate] = useState("02 Sep");
  const [selectedTrackTime, setSelectedTrackTime] = useState("11:30 AM");

  // Step 3: Self-Declaration & Final Submit
  const [declarationAccepted, setDeclarationAccepted] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    applicationId: string;
    paymentRef: string;
  } | null>(null);

  useEffect(() => {
    const existing = loadApplication();
    if (existing) {
      if (existing.id) {
        setLlInput(existing.id.replace("SRTO-", "MH10/LL/"));
        setApplicantName(existing.fullName || "Demo Citizen");
      }
    }
  }, []);

  function handleFetchLL() {
    const key = llInput.trim().toUpperCase() || "MH10/LL/2026/009841";
    setLlInput(key);
    setApplicantName("Demo Citizen");
    setAadhaarNumber("9999 8888 7777");
    setPanNumber("ABCDE1234F");
    setDob("15/01/2000");
    setRtoOffice("MH-10 Sangli RTO (Automated Driving Track)");
    setApprovedClasses(["MCWG", "LMV"]);
    setLlValidity("25/08/2026 to 24/02/2027 (Active)");
    setLlVerified(true);
  }

  // Fees: ₹200 Track Test + ₹200 Smart Card DL = ₹400
  const testFee = 200;
  const smartCardFee = 200;
  const totalFee = testFee + smartCardFee;
  const slotAppointmentString = `${selectedTrackDate} · ${selectedTrackTime}`;

  async function handleDLSubmit() {
    setSubmitting(true);
    const appId = `SRTO-DL-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const payRef = newPaymentReference();

    if (isAppwriteConfigured) {
      try {
        await saveApplicationRecord({
          userId: "user_123456",
          app_type: "Permanent Driving Licence",
          app_detail: {
            applicationNumber: appId,
            service: "Permanent Driving Licence (Form 4)",
            llNumber: llInput,
            applicant: {
              name: applicantName,
              aadhaar: aadhaarNumber,
              pan: panNumber,
              dob,
            },
            vehicleClasses: approvedClasses,
            appointment: {
              rto: rtoOffice,
              slot: slotAppointmentString,
              testType: "Automated Driving Skill Track Competence Test",
            },
            payment: {
              amount: totalFee,
              currency: "INR",
              status: "paid",
              reference: payRef,
            },
            status: {
              current: "Permanent DL Application Submitted · Driving Track Test Scheduled",
              code: "TRACK_TEST_SCHEDULED",
            },
          },
          documentId: appId.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        });
      } catch (err) {
        console.warn("Appwrite DL application sync note:", err);
      }
    }

    const localRecord: DemoApplication = {
      id: appId,
      fullName: applicantName,
      status: "appointment-scheduled",
      rto: rtoOffice,
      appointment: slotAppointmentString,
      appointmentId: `APT-DL-${Math.floor(10000 + Math.random() * 90000)}`,
      submittedAt: new Date().toISOString(),
      feeTotal: `₹${totalFee} Demo`,
      paymentReference: payRef,
      paymentMethod: "Demo Online UPI",
      vehicle: approvedClasses.join(" / "),
      identity: `Aadhaar · ${aadhaarNumber} | PAN · ${panNumber}`,
    };
    saveApplication(localRecord);

    setTimeout(() => {
      setSubmittedData({
        applicationId: appId,
        paymentRef: payRef,
      });
      setSubmitting(false);
    }, 800);
  }

  function triggerPermanentPdf() {
    if (!submittedData) return;
    downloadPermanentDLPdf({
      applicationId: submittedData.applicationId,
      applicantName,
      aadhaarNumber,
      panNumber,
      llNumber: llInput,
      vehicleClasses: approvedClasses,
      medicalStatus: "Fit (Form 1 Self-Declaration Attested)",
      organDonation: "Yes (Pledged)",
      rtoOffice,
      slotTime: slotAppointmentString,
      feePaid: `INR ${totalFee}.00 (Paid)`,
      paymentRef: submittedData.paymentRef,
    });
  }

  return (
    <PageShell>
      {/* Hero Header */}
      <section className="border-b border-[#dce8e5] bg-gradient-to-br from-[#f7fbfa] via-white to-[#edf7f4] py-10">
        <div className="mx-auto max-w-5xl px-6">
          <Badge variant="secondary" className="mb-2 gap-1.5 font-bold">
            <IdCard size={14} className="text-[#167c74]" /> Form 4 · Central Motor Vehicle Rules
          </Badge>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#152321] md:text-3xl">
            Permanent Driving Licence (DL) Application
          </h1>
          <p className="mt-1 max-w-2xl text-xs font-medium text-[#5e6f68] md:text-sm">
            Apply online using your approved Learner Licence (LL). All identity and eKYC particulars are retrieved directly from your LL record.
          </p>

          {/* Prerequisite Check Banner */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#cfe3dd] bg-[#edf7f4] p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#167c74] text-white">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0f7655]">
                  Prerequisite Status
                </span>
                <strong className="block text-sm font-bold text-[#152321]">
                  Approved Learner Licence: {llInput}
                </strong>
                <span className="text-xs text-[#5e6f68]">
                  Holding period satisfied · Eligible for Permanent Driving Licence
                </span>
              </div>
            </div>
            <Badge variant="success" className="w-fit">
              LL Verified
            </Badge>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        {!submittedData ? (
          <div className="space-y-8">
            {/* 3 Step Indicator */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 0, title: "1. LL Verification", sub: "Fetch approved LL" },
                { id: 1, title: "2. Driving Track Slot", sub: "Select test date & time" },
                { id: 2, title: "3. Review & Pay", sub: "Smart Card DL fee (₹400)" },
              ].map((s) => (
                <Card
                  key={s.id}
                  className={`p-4 transition-all ${
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
                  <strong className="mt-1 block text-sm text-[#152321]">{s.title}</strong>
                  <span className="text-[11px] text-[#5e6f68]">{s.sub}</span>
                </Card>
              ))}
            </div>

            {/* STEP 1: Enter Approved Learner Licence (LL) Number */}
            {step === 0 && (
              <Card className="p-6 space-y-6">
                <CardHeader className="p-0 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Step 1: Enter Approved Learner Licence (LL) Number</CardTitle>
                    <CardDescription>
                      Enter your existing LL application or licence number to load verified citizen credentials.
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFetchLL}
                    className="gap-1.5 text-xs text-[#167c74]"
                  >
                    <Sparkles size={14} /> Use Demo Approved LL
                  </Button>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  <div>
                    <Label htmlFor="ll-num">Approved Learner Licence (LL) Number</Label>
                    <div className="mt-1.5 flex gap-2">
                      <Input
                        id="ll-num"
                        value={llInput}
                        onChange={(e) => setLlInput(e.target.value.toUpperCase())}
                        placeholder="MH10/LL/2026/009841"
                        className="font-mono text-sm font-bold uppercase tracking-wider"
                      />
                      <Button
                        type="button"
                        onClick={handleFetchLL}
                        className="gap-1.5"
                      >
                        <Search size={16} /> Fetch LL Record
                      </Button>
                    </div>
                  </div>

                  {llVerified && (
                    <div className="rounded-2xl border border-[#cfe3dd] bg-[#edf7f4] p-5 text-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-[#cfe3dd] pb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={18} className="text-[#0d5c45]" />
                          <strong className="text-sm font-bold text-[#0d5c45]">
                            Verified LL Application: {llInput}
                          </strong>
                        </div>
                        <Badge variant="success">Active · Eligible for Form 4</Badge>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div>
                          <span className="text-[#5e6f68]">Applicant Full Name</span>
                          <strong className="block text-[#152321]">{applicantName}</strong>
                        </div>
                        <div>
                          <span className="text-[#5e6f68]">Linked Aadhaar Ref</span>
                          <strong className="block font-mono text-[#152321]">{aadhaarNumber}</strong>
                        </div>
                        <div>
                          <span className="text-[#5e6f68]">Linked PAN Ref</span>
                          <strong className="block font-mono text-[#152321]">{panNumber}</strong>
                        </div>
                        <div>
                          <span className="text-[#5e6f68]">Date of Birth</span>
                          <strong className="block text-[#152321]">{dob}</strong>
                        </div>
                        <div>
                          <span className="text-[#5e6f68]">Approved LL Categories</span>
                          <strong className="block text-[#0d5c45] font-bold">
                            {approvedClasses.join(" / ")}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[#5e6f68]">Assigned RTO Office</span>
                          <strong className="block text-[#152321]">{rtoOffice}</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end p-0 pt-4 border-t border-slate-100">
                  <Button onClick={() => setStep(1)} className="gap-2">
                    Continue to Driving Track Slot <ArrowRight size={16} />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* STEP 2: Driving Skill Track Test Slot Selection */}
            {step === 1 && (
              <Card className="p-6 space-y-6">
                <CardHeader className="p-0">
                  <CardTitle>Step 2: Select Driving Skill Track Test Slot</CardTitle>
                  <CardDescription>
                    Choose the date and batch for your driving competence test at the automated RTO track.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-5">
                  {/* Track Center Card */}
                  <div className="rounded-2xl border border-[#cfe3dd] bg-[#edf7f4] p-4 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Landmark size={20} className="text-[#167c74]" />
                      <div>
                        <strong className="block text-sm font-bold text-[#0d5c45]">
                          {rtoOffice}
                        </strong>
                        <span className="text-[#5e6f68]">
                          Sensor-based automated track for 2-Wheeler (MCWG) & 4-Wheeler (LMV)
                        </span>
                      </div>
                    </div>
                    <Badge variant="success">Sensors Active</Badge>
                  </div>

                  {/* Track Date Selector */}
                  <div>
                    <Label className="text-xs text-[#5e6f68] font-bold uppercase tracking-wider">
                      A. Select Track Test Date
                    </Label>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {TRACK_DATES.map((d) => {
                        const isSelected = selectedTrackDate === d.shortDate;
                        return (
                          <button
                            key={d.dateStr}
                            type="button"
                            onClick={() => setSelectedTrackDate(d.shortDate)}
                            className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
                              isSelected
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

                  {/* Track Time Slot Selector */}
                  <div>
                    <Label className="text-xs text-[#5e6f68] font-bold uppercase tracking-wider">
                      B. Select Track Batch Window
                    </Label>
                    <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                      {TRACK_TIME_SLOTS.map((t) => {
                        const isSelected = selectedTrackTime === t.timeStr;
                        return (
                          <button
                            key={t.timeStr}
                            type="button"
                            onClick={() => setSelectedTrackTime(t.timeStr)}
                            className={`flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                              isSelected
                                ? "border-[#167c74] bg-[#edf7f4] text-[#167c74] ring-2 ring-[#167c74]/20"
                                : "border-[#dce8e5] bg-white hover:bg-[#f4fbf8]"
                            }`}
                          >
                            <div>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-[#0f7655]">
                                {t.session}
                              </span>
                              <strong className="block text-xs text-[#152321]">{t.label}</strong>
                            </div>
                            {isSelected && <Check size={16} className="text-[#167c74]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Confirmed Slot Preview */}
                  <div className="rounded-xl border border-[#cfe3dd] bg-[#edf7f4] p-3.5 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} className="text-[#167c74]" />
                      <span className="text-[#5e6f68]">Confirmed Track Slot:</span>
                      <strong className="text-[#0d5c45]">{selectedTrackDate} · {selectedTrackTime}</strong>
                    </div>
                    <Badge variant="success">Slot Active</Badge>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-0 pt-4 border-t border-slate-100">
                  <Button variant="outline" onClick={() => setStep(0)}>
                    <ArrowLeft size={16} className="mr-2" /> Back
                  </Button>
                  <Button onClick={() => setStep(2)} className="gap-2">
                    Review & Complete Payment <ArrowRight size={16} />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* STEP 3: Review & Pay Smart Card DL Fee */}
            {step === 2 && (
              <Card className="p-6 space-y-6">
                <CardHeader className="p-0">
                  <CardTitle>Step 3: Review & Complete Permanent DL Fee</CardTitle>
                  <CardDescription>
                    Confirm applicant particulars, booked test slot, and pay statutory Smart Card DL fee.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-5">
                  <div className="grid gap-4 rounded-xl border border-[#dce8e5] bg-slate-50/70 p-4 text-xs sm:grid-cols-2">
                    <div>
                      <span className="text-[#5e6f68]">Applicant Full Name</span>
                      <strong className="block text-[#152321]">{applicantName}</strong>
                    </div>
                    <div>
                      <span className="text-[#5e6f68]">Approved LL Reference</span>
                      <strong className="block font-mono text-[#152321]">{llInput}</strong>
                    </div>
                    <div>
                      <span className="text-[#5e6f68]">Applied Vehicle Categories</span>
                      <strong className="block text-[#0d5c45]">{approvedClasses.join(" / ")}</strong>
                    </div>
                    <div>
                      <span className="text-[#5e6f68]">Track Test Appointment</span>
                      <strong className="block text-[#0d5c45]">{slotAppointmentString}</strong>
                    </div>
                  </div>

                  {/* Statutory Self-Declaration Box */}
                  <div className="rounded-2xl border border-[#cfe3dd] bg-[#f9fbfb] p-4 text-xs space-y-2.5">
                    <div className="flex items-center gap-2 font-bold text-[#0f7655]">
                      <ShieldCheck size={16} /> Statutory Attestation (Form 4)
                    </div>
                    <p className="text-[#5e6f68]">
                      I hereby declare that I hold a valid Learner Licence for the above classes and am physically fit to undergo the practical driving track competence test.
                    </p>
                    <label className="flex cursor-pointer items-center gap-2.5 pt-1 text-xs font-bold text-[#152321]">
                      <input
                        type="checkbox"
                        checked={declarationAccepted}
                        onChange={(e) => setDeclarationAccepted(e.target.checked)}
                        className="h-4 w-4 rounded accent-[#167c74]"
                      />
                      <span>I confirm all declarations under Central Motor Vehicles Rules 1989.</span>
                    </label>
                  </div>

                  {/* Fee Breakdown */}
                  <div className="rounded-xl border border-[#cfe3dd] bg-white p-4 text-xs space-y-2">
                    <div className="flex justify-between text-[#5e6f68]">
                      <span>Driving Track Competence Test Fee</span>
                      <strong className="text-[#152321]">₹200.00</strong>
                    </div>
                    <div className="flex justify-between text-[#5e6f68]">
                      <span>Form 7 PVC Chip Smart Card DL Issuance Fee</span>
                      <strong className="text-[#152321]">₹200.00</strong>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm font-extrabold text-[#152321]">
                      <span>Total Amount Payable</span>
                      <span className="text-[#0d5c45]">₹400.00 (Demo Test Checkout)</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-0 pt-4 border-t border-slate-100">
                  <Button variant="outline" onClick={() => setStep(1)} disabled={submitting}>
                    <ArrowLeft size={16} className="mr-2" /> Back
                  </Button>
                  <Button
                    onClick={handleDLSubmit}
                    disabled={submitting || !declarationAccepted}
                    className="min-w-[200px] gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Booking Slot...
                      </>
                    ) : (
                      <>Pay ₹400 & Book Track Test</>
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
                Permanent DL Application Submitted & Track Test Booked!
              </h2>
              <p className="mt-1 text-sm text-[#5e6f68]">
                Your Form 4 application and driving track appointment have been confirmed.
              </p>
            </div>

            <div className="mx-auto max-w-md rounded-2xl border border-[#cfe3dd] bg-[#edf7f4] p-5 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-[#5e6f68]">Application Number:</span>
                <strong className="font-mono text-[#152321]">{submittedData.applicationId}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5e6f68]">Approved LL Number:</span>
                <strong className="font-mono text-[#152321]">{llInput}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5e6f68]">Driving Track Appointment:</span>
                <strong className="text-[#0d5c45]">{slotAppointmentString}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5e6f68]">Test Center:</span>
                <strong className="text-[#152321]">{rtoOffice}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5e6f68]">Payment Reference:</span>
                <strong className="font-mono text-[#152321]">{submittedData.paymentRef}</strong>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row justify-center">
              <Button onClick={triggerPermanentPdf} className="gap-2">
                <Download size={16} /> Download Form 4 DL & Slot Slip PDF
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
