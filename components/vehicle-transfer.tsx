"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Car,
  Check,
  CheckCircle2,
  Download,
  FileCheck2,
  FileText,
  Info,
  Landmark,
  Loader2,
  Paperclip,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
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
  getVehicleByRegNumber,
  isAppwriteConfigured,
  saveApplicationRecord,
} from "@/lib/appwrite";
import { VehicleSearch, maskOwnerName } from "@/components/vehicle-search";
import { downloadVehicleTransferPdf } from "@/lib/demo-pdf";
import { DemoApplication, newApplicationId, newPaymentReference, saveApplication } from "@/lib/storage";
import { useDemoMode } from "./demo-mode-provider";

const SEEDED_VEHICLES: Record<
  string,
  {
    regNumber: string;
    ownerName: string;
    makerModel: string;
    vehicleClass: string;
    fuelType: string;
    rtoOffice: string;
    regDate: string;
    fitnessValidUntil: string;
    insuranceValidUntil: string;
    status: string;
  }
> = {
  MH10EA1234: {
    regNumber: "MH10EA1234",
    ownerName: "Rahul Sharma",
    makerModel: "Tata Nexon EV (Electric)",
    vehicleClass: "Light Motor Vehicle (LMV)",
    fuelType: "Electric",
    rtoOffice: "MH-10 Sangli RTO",
    regDate: "15/03/2024",
    fitnessValidUntil: "14/03/2039",
    insuranceValidUntil: "14/03/2027",
    status: "Active · Clean Title",
  },
  MH10AB1234: {
    regNumber: "MH10AB1234",
    ownerName: "Demo Citizen",
    makerModel: "Hyundai i20 (Petrol)",
    vehicleClass: "Light Motor Vehicle (LMV)",
    fuelType: "Petrol",
    rtoOffice: "MH-10 Sangli RTO",
    regDate: "05/08/2022",
    fitnessValidUntil: "04/08/2037",
    insuranceValidUntil: "10/12/2026",
    status: "Active · Clean Title",
  },
};

export function VehicleTransferService({ mode = "all" }: { mode?: "all" | "transfer" | "search" }) {
  const { enabled: demoMode } = useDemoMode();
  const [viewMode, setViewMode] = useState<"all" | "transfer" | "search">(mode);
  const [step, setStep] = useState<number>(0);

  // Search / Verify State
  const [regInput, setRegInput] = useState(demoMode ? "MH10EA1234" : "MH10EA1234");
  const [vehicle, setVehicle] = useState(SEEDED_VEHICLES.MH10EA1234);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [vehicleVerified, setVehicleVerified] = useState(true);

  // Buyer Info State
  const [buyerName, setBuyerName] = useState(demoMode ? "Amit Kumar Patel" : "");
  const [buyerAadhaar, setBuyerAadhaar] = useState(demoMode ? "9999 8888 7777" : "");
  const [buyerMobile, setBuyerMobile] = useState(demoMode ? "9876543210" : "");
  const [buyerAddress, setBuyerAddress] = useState(demoMode ? "Flat 402, Green Avenue, Sangli 416416" : "");
  const [buyerDeclarationDocNumber, setBuyerDeclarationDocNumber] = useState(demoMode ? "DECL-2026-TR-8842" : "");
  const [declarationFileName, setDeclarationFileName] = useState("Form_29_30_Self_Declaration_Signed.pdf");
  const [transferType, setTransferType] = useState("Normal Sale / Transfer of Ownership");
  const [declarationAccepted, setDeclarationAccepted] = useState(true);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    applicationId: string;
    paymentRef: string;
  } | null>(null);

  async function handleVehicleSearch() {
    const key = regInput.trim().toUpperCase();
    if (!key) return;

    setVehicleLoading(true);
    let found = null;
    let isAppwriteRecord = false;

    if (isAppwriteConfigured) {
      try {
        const remote = await getVehicleByRegNumber(key);
        if (remote) {
          found = {
            regNumber: remote.regNumber || key,
            ownerName: remote.ownerName || "Appwrite Verified Owner",
            makerModel: remote.makerModel || "Appwrite Registered Vehicle",
            vehicleClass: remote.vehicleClass || "Light Motor Vehicle (LMV)",
            fuelType: remote.fuelType || "Petrol",
            rtoOffice: remote.rtoOffice || "MH-10 Sangli RTO",
            regDate: remote.regDate || "2024-01-01",
            fitnessValidUntil: remote.fitnessValidUntil || "2039-01-01",
            insuranceValidUntil: remote.insuranceValidUntil || "2027-01-01",
            status: remote.status || "Active · Verified Title",
          };
          isAppwriteRecord = true;
        }
      } catch (err) {
        console.warn("Appwrite vehicle lookup fallback:", err);
      }
    }

    if (!found) {
      found = SEEDED_VEHICLES[key] || {
        regNumber: key,
        ownerName: "Demo Vehicle Owner",
        makerModel: "Honda City 1.5 i-VTEC",
        vehicleClass: "Light Motor Vehicle (LMV)",
        fuelType: "Petrol",
        rtoOffice: "MH-10 Sangli RTO",
        regDate: "10/05/2023",
        fitnessValidUntil: "09/05/2038",
        insuranceValidUntil: "09/05/2026",
        status: "Active · Clean Record",
      };
    }

    setTimeout(() => {
      setVehicle(found);
      setVehicleVerified(true);
      setVehicleLoading(false);
    }, 400);
  }

  function autofillBuyerDemo() {
    setBuyerName("Amit Kumar Patel");
    setBuyerAadhaar("9999 8888 7777");
    setBuyerMobile("9876543210");
    setBuyerAddress("Flat 402, Green Avenue, Sangli 416416");
    setBuyerDeclarationDocNumber("DECL-2026-TR-8842");
    setDeclarationFileName("Form_29_30_Self_Declaration_Signed.pdf");
    setTransferType("Normal Sale / Transfer of Ownership");
  }

  async function handleTransferSubmit() {
    setSubmitting(true);
    const appId = `SRTO-VT-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const payRef = newPaymentReference();

    if (isAppwriteConfigured) {
      try {
        await saveApplicationRecord({
          userId: "user_123456",
          app_type: "Vehicle Transfer",
          app_detail: {
            applicationNumber: appId,
            service: "Vehicle Ownership Transfer (Form 29 & 30)",
            vehicle: {
              regNumber: vehicle.regNumber,
              makerModel: vehicle.makerModel,
              sellerName: vehicle.ownerName,
              rtoOffice: vehicle.rtoOffice,
            },
            buyer: {
              name: buyerName,
              aadhaar: buyerAadhaar,
              mobile: buyerMobile,
              address: buyerAddress,
              declarationDocNumber: buyerDeclarationDocNumber,
            },
            payment: {
              amount: 300,
              currency: "INR",
              status: "paid",
              reference: payRef,
            },
            status: {
              current: "Transfer Application Submitted · Under Verification",
              code: "UNDER_REVIEW",
            },
          },
          documentId: appId.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        });
      } catch (err) {
        console.warn("Appwrite vehicle transfer sync note:", err);
      }
    }

    const localRecord: DemoApplication = {
      id: appId,
      fullName: buyerName,
      status: "under-review",
      appointment: "RC Endorsement in Scrutiny",
      rto: vehicle.rtoOffice || "MH-10 Sangli RTO",
      submittedAt: new Date().toISOString(),
      appointmentId: `VT-DOC-${Math.floor(10000 + Math.random() * 90000)}`,
      paymentReference: payRef,
      paymentMethod: "Demo Online UPI",
      feeTotal: "INR 300.00 (Paid)",
      identity: buyerAadhaar,
      mobile: buyerMobile,
      address: buyerAddress,
      vehicle: `${vehicle.regNumber} (${vehicle.makerModel})`,
      guardian: vehicle.ownerName,
      documents: [
        "Form 29 Notice of Transfer",
        "Form 30 Application for Intimation",
        `Section 50 Self-Declaration (#${buyerDeclarationDocNumber})`,
      ],
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

  function triggerTransferPdfDownload() {
    if (!submittedData) return;
    downloadVehicleTransferPdf({
      applicationId: submittedData.applicationId,
      regNumber: vehicle.regNumber,
      sellerName: vehicle.ownerName,
      buyerName: buyerName,
      buyerAadhaar: buyerAadhaar,
      buyerMobile: buyerMobile,
      buyerAddress: buyerAddress,
      makerModel: vehicle.makerModel,
      rtoOffice: vehicle.rtoOffice,
      transferType,
      feePaid: "INR 300.00 (Paid)",
      paymentRef: submittedData.paymentRef,
    });
  }

  return (
    <PageShell>
      {/* Hero Header - Full Screen Width */}
      <section className="border-b border-[#dce8e5] bg-gradient-to-br from-[#f7fbfa] via-white to-[#edf7f4] py-8 md:py-10">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-8 lg:px-12">
          <Badge variant="secondary" className="mb-2 gap-1.5 font-bold">
            <Car size={14} className="text-[#167c74]" /> Form 29 & 30 Online Service
          </Badge>
          <h1 className="text-xl font-bold tracking-tight text-[#152321] md:text-2xl">
            Vehicle Transfer & RC Services
          </h1>
          <p className="mt-1 max-w-3xl text-xs font-medium text-[#5e6f68] md:text-sm">
            Apply online for vehicle ownership transfer, NOC endorsement, and instant RC record inspection.
          </p>
        </div>
      </section>

      {/* Main Content - Full Screen Width */}
      <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-8 lg:px-12 space-y-10">
        {/* RC Record Search Section (Loaded on same page) */}
        {(viewMode === "all" || viewMode === "search") && (
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-lg font-bold text-[#152321]">1. Official Vehicle RC Record Search</h2>
              <Badge variant="outline">Live Verification</Badge>
            </div>
            <VehicleSearch />
          </section>
        )}

        {/* Ownership Transfer Section (Loaded on same page) */}
        {(viewMode === "all" || viewMode === "transfer") && (
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-lg font-bold text-[#152321]">2. Vehicle Ownership Transfer Application (Form 29 & 30)</h2>
              <Badge variant="secondary">Resumable Form</Badge>
            </div>
            <div>
            {!submittedData ? (
              <div className="space-y-8">
                {/* 3 Step Indicator */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 0, title: "1. Vehicle & Seller", sub: "Verify registration" },
                    { id: 1, title: "2. Buyer Details", sub: "Aadhaar & address" },
                    { id: 2, title: "3. Review & Fee", sub: "Pay ₹300 & submit" },
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

                {/* STEP 1: Vehicle & Seller Verification */}
                {step === 0 && (
                  <Card className="p-6 space-y-6">
                    <CardHeader className="p-0">
                      <CardTitle>Verify Vehicle Registration</CardTitle>
                      <CardDescription>
                        Enter vehicle number to fetch official RC records and seller details.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                      <div>
                        <Label htmlFor="reg">Vehicle Registration Number</Label>
                        <div className="mt-1.5 flex gap-2">
                          <Input
                            id="reg"
                            value={regInput}
                            onChange={(e) => setRegInput(e.target.value.toUpperCase())}
                            placeholder="MH10EA1234"
                            className="font-mono text-sm font-bold uppercase tracking-wider"
                          />
                          <Button
                            type="button"
                            onClick={handleVehicleSearch}
                            disabled={vehicleLoading}
                            className="gap-1.5"
                          >
                            {vehicleLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                            Verify RC
                          </Button>
                        </div>
                      </div>

                      {vehicleVerified && vehicle && (
                        <div className="rounded-xl border border-[#cfe3dd] bg-[#edf7f4] p-5 text-xs">
                          <div className="flex items-center justify-between border-b border-[#cfe3dd] pb-3">
                            <div className="flex items-center gap-2">
                              <Car size={18} className="text-[#167c74]" />
                              <strong className="text-sm font-bold text-[#0d5c45]">
                                {vehicle.makerModel} ({vehicle.regNumber})
                              </strong>
                            </div>
                            <Badge variant="success">Active Record</Badge>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                            <div>
                              <span className="text-[#5e6f68]">Current Registered Owner</span>
                              <strong className="block text-[#152321] font-mono tracking-wide">{maskOwnerName(vehicle.ownerName)}</strong>
                            </div>
                            <div>
                              <span className="text-[#5e6f68]">Vehicle Class</span>
                              <strong className="block text-[#152321]">{vehicle.vehicleClass}</strong>
                            </div>
                            <div>
                              <span className="text-[#5e6f68]">Fuel Type</span>
                              <strong className="block text-[#152321]">{vehicle.fuelType}</strong>
                            </div>
                            <div>
                              <span className="text-[#5e6f68]">Assigned RTO Office</span>
                              <strong className="block text-[#152321]">{vehicle.rtoOffice}</strong>
                            </div>
                            <div>
                              <span className="text-[#5e6f68]">Fitness Expiry</span>
                              <strong className="block text-[#152321]">{vehicle.fitnessValidUntil}</strong>
                            </div>
                            <div>
                              <span className="text-[#5e6f68]">Insurance Valid</span>
                              <strong className="block text-[#0d5c45]">{vehicle.insuranceValidUntil}</strong>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-end p-0 pt-4 border-t border-slate-100">
                      <Button onClick={() => setStep(1)} className="gap-2">
                        Continue to Buyer Details <ArrowRight size={16} />
                      </Button>
                    </CardFooter>
                  </Card>
                )}

                {/* STEP 2: Buyer / Transferee Details */}
                {step === 1 && (
                  <Card className="p-6 space-y-6">
                    <CardHeader className="p-0 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Transferee (Buyer) Details</CardTitle>
                        <CardDescription>Enter details of the new owner purchasing the vehicle.</CardDescription>
                      </div>
                      {demoMode && (
                        <Button variant="outline" size="sm" onClick={autofillBuyerDemo} className="gap-1.5 text-xs text-[#167c74]">
                          <Sparkles size={14} /> Auto-fill Demo
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="p-0 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="b-name">Buyer Full Name (as per Aadhaar)</Label>
                          <Input
                            id="b-name"
                            value={buyerName}
                            onChange={(e) => setBuyerName(e.target.value)}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="b-aadhaar">Buyer Aadhaar Number</Label>
                          <Input
                            id="b-aadhaar"
                            value={buyerAadhaar}
                            onChange={(e) => setBuyerAadhaar(e.target.value)}
                            className="mt-1.5 font-mono"
                          />
                        </div>
                        <div>
                          <Label htmlFor="b-mobile">Mobile Number</Label>
                          <Input
                            id="b-mobile"
                            value={buyerMobile}
                            onChange={(e) => setBuyerMobile(e.target.value)}
                            className="mt-1.5 font-mono"
                          />
                        </div>
                        <div>
                          <Label htmlFor="b-type">Reason / Type of Transfer</Label>
                          <Input
                            id="b-type"
                            value={transferType}
                            onChange={(e) => setTransferType(e.target.value)}
                            className="mt-1.5"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="b-addr">Residential Address of New Owner</Label>
                        <Input
                          id="b-addr"
                          value={buyerAddress}
                          onChange={(e) => setBuyerAddress(e.target.value)}
                          className="mt-1.5"
                        />
                      </div>

                      {/* Manual Self-Declaration Upload Card */}
                      <div className="rounded-2xl border border-dashed border-[#9fc8bc] bg-[#f8fbf9] p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <Label className="text-sm font-bold text-[#152321]">
                              Buyer Statutory Self-Declaration (Manual Upload)
                            </Label>
                            <p className="text-[11px] text-[#5e6f68] mt-0.5">
                              Section 50 Form 29 & 30 declaration document and reference number.
                            </p>
                          </div>
                          <Badge variant="outline" className="w-fit text-[10px] text-[#167c74] border-[#167c74]/30 bg-white font-bold gap-1">
                            <Upload size={11} /> Manual Upload
                          </Badge>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <Label htmlFor="b-decl" className="text-xs font-semibold text-[#152321]">
                              Self-Declaration Document Number
                            </Label>
                            <div className="relative mt-1.5">
                              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-[#167c74]" size={16} />
                              <Input
                                id="b-decl"
                                value={buyerDeclarationDocNumber}
                                onChange={(e) => setBuyerDeclarationDocNumber(e.target.value.toUpperCase())}
                                placeholder="e.g. DECL-2026-TR-8842"
                                className="pl-9 font-mono uppercase font-bold text-[#152321] bg-white"
                              />
                            </div>
                            <p className="mt-1 text-[10px] text-[#5e6f68]">
                              Physical or digital declaration reference serial.
                            </p>
                          </div>

                          <div>
                            <Label className="text-xs font-semibold text-[#152321]">
                              Upload Signed Document (PDF / Image)
                            </Label>
                            <div className="mt-1.5 flex items-center gap-2.5">
                              <input
                                type="file"
                                id="manual-upload-decl"
                                accept=".pdf,image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    setDeclarationFileName(e.target.files[0].name);
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById("manual-upload-decl")?.click()}
                                className="gap-1.5 bg-white text-xs font-bold text-[#167c74] border-[#cfe3dd] hover:bg-[#ddf3ef] shadow-sm shrink-0"
                              >
                                <Upload size={14} /> Choose File
                              </Button>
                              <div className="min-w-0 flex-1">
                                <span className="block truncate text-xs font-semibold text-[#152321]" title={declarationFileName}>
                                  {declarationFileName}
                                </span>
                                <span className="block text-[10px] text-[#5e6f68]">PDF / JPG up to 10MB</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 rounded-lg bg-[#eaf4ef] p-2.5 text-xs text-[#0f7655] font-semibold">
                          <CheckCircle2 size={15} className="shrink-0 text-[#167c74]" />
                          <span className="truncate">
                            Attached file: <strong>{declarationFileName}</strong> (Ref: {buyerDeclarationDocNumber})
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between p-0 pt-4 border-t border-slate-100">
                      <Button variant="outline" onClick={() => setStep(0)}>
                        <ArrowLeft size={16} className="mr-2" /> Back
                      </Button>
                      <Button onClick={() => setStep(2)} className="gap-2">
                        Proceed to Review & Fee <ArrowRight size={16} />
                      </Button>
                    </CardFooter>
                  </Card>
                )}

                {/* STEP 3: Review & Submit */}
                {step === 2 && (
                  <Card className="p-6 space-y-6">
                    <CardHeader className="p-0">
                      <CardTitle>Review Transfer & Complete Statutory Fee</CardTitle>
                      <CardDescription>Confirm details before generating Form 29 & 30 application.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-5">
                      <div className="grid gap-4 rounded-xl border border-[#dce8e5] bg-slate-50/70 p-4 text-xs sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <span className="text-[#5e6f68]">Vehicle</span>
                          <strong className="block text-[#152321]">{vehicle.makerModel} ({vehicle.regNumber})</strong>
                        </div>
                        <div>
                          <span className="text-[#5e6f68]">Current Owner (Seller)</span>
                          <strong className="block text-[#152321] font-mono tracking-wide">{maskOwnerName(vehicle.ownerName)}</strong>
                        </div>
                        <div>
                          <span className="text-[#5e6f68]">New Owner (Buyer)</span>
                          <strong className="block text-[#152321]">{buyerName}</strong>
                        </div>
                        <div>
                          <span className="text-[#5e6f68]">Buyer Aadhaar</span>
                          <strong className="block text-[#152321] font-mono">{buyerAadhaar}</strong>
                        </div>
                        <div>
                          <span className="text-[#5e6f68]">Self-Declaration Doc No (Manual)</span>
                          <strong className="block text-[#167c74] font-mono">{buyerDeclarationDocNumber}</strong>
                          <span className="text-[10px] text-[#5e6f68] truncate block" title={declarationFileName}>
                            📎 {declarationFileName}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#5e6f68]">RTO Jurisdiction</span>
                          <strong className="block text-[#152321]">{vehicle.rtoOffice}</strong>
                        </div>
                      </div>

                      {/* Statutory Self-Declaration Box */}
                      <div className="rounded-2xl border border-[#cfe3dd] bg-[#f9fbfb] p-5 space-y-3.5">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={18} className="text-[#167c74]" />
                          <strong className="text-xs font-bold uppercase tracking-wider text-[#0f7655]">
                            Statutory Self-Declaration (Section 50, Motor Vehicles Act 1988)
                          </strong>
                        </div>
                        <ul className="space-y-2 text-xs text-[#5e6f68]">
                          <li className="flex items-start gap-2">
                            <span className="text-[#167c74] font-bold">1.</span>
                            <span>
                              <strong>Clear Title & Ownership:</strong> I / We declare that the vehicle has been sold and delivered with physical possession, free from any undeclared finance or hypothecation claims.
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#167c74] font-bold">2.</span>
                            <span>
                              <strong>No Legal Disputes:</strong> There are no pending traffic challans, police seizure notices, or court disputes pending against this vehicle plate.
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#167c74] font-bold">3.</span>
                            <span>
                              <strong>Authentic Documents:</strong> Both parties confirm digital Aadhaar verification and consent to the official endorsement on the smart card RC.
                            </span>
                          </li>
                        </ul>

                        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#cfe3dd] bg-white p-3 text-xs font-semibold text-[#152321] transition hover:bg-[#edf7f4]">
                          <input
                            type="checkbox"
                            checked={declarationAccepted}
                            onChange={(e) => setDeclarationAccepted(e.target.checked)}
                            className="h-4 w-4 rounded accent-[#167c74]"
                          />
                          <span>
                            I hereby give this joint statutory self-declaration for ownership transfer.
                          </span>
                        </label>
                      </div>

                      <div className="rounded-xl border border-[#cfe3dd] bg-[#edf7f4] p-4 text-xs space-y-2">
                        <div className="flex justify-between text-[#5e6f68]">
                          <span>Statutory Ownership Transfer Fee (Form 29/30)</span>
                          <strong className="text-[#152321]">₹250.00</strong>
                        </div>
                        <div className="flex justify-between text-[#5e6f68]">
                          <span>Digital Postal & Smart Card Endorsement Fee</span>
                          <strong className="text-[#152321]">₹50.00</strong>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-sm font-extrabold text-[#152321]">
                          <span>Total Amount Payable</span>
                          <span className="text-[#0d5c45]">₹300.00 (Demo Test Payment)</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between p-0 pt-4 border-t border-slate-100">
                      <Button variant="outline" onClick={() => setStep(1)} disabled={submitting}>
                        <ArrowLeft size={16} className="mr-2" /> Back
                      </Button>
                      <Button
                        onClick={handleTransferSubmit}
                        disabled={submitting || !declarationAccepted}
                        className="min-w-[180px] gap-2"
                      >
                        {submitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin" /> Submitting...
                          </>
                        ) : (
                          <>Pay ₹300 & Submit Application</>
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
                    Transfer Application Submitted Successfully!
                  </h2>
                  <p className="mt-1 text-sm text-[#5e6f68]">
                    Your Form 29 & 30 ownership transfer request has been logged in Smart RTO.
                  </p>
                </div>

                <div className="mx-auto max-w-md rounded-2xl border border-[#cfe3dd] bg-[#edf7f4] p-5 text-xs text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#5e6f68]">Application Number:</span>
                    <strong className="font-mono text-[#152321]">{submittedData.applicationId}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5e6f68]">Vehicle Registration:</span>
                    <strong className="text-[#152321]">{vehicle.regNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5e6f68]">Transferred To:</span>
                    <strong className="text-[#152321]">{buyerName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5e6f68]">Payment Ref:</span>
                    <strong className="text-[#0d5c45]">{submittedData.paymentRef}</strong>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row justify-center">
                  <Button onClick={triggerTransferPdfDownload} className="gap-2">
                    <Download size={16} /> Download Form 29/30 PDF
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/track">Track in Applications</Link>
                  </Button>
                </div>
              </Card>
            )}
            </div>
          </section>
        )}
      </main>
    </PageShell>
  );
}
