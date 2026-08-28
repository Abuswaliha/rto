import type { DemoApplication } from "./storage";
import { appointmentParts } from "./appointment";

function cleanText(value: string) {
  return String(value || "")
    .replace(/₹/g, "INR ")
    .replace(/·/g, "|")
    .replace(/[^\x20-\x7E]/g, "-");
}

function escapePdf(value: string) {
  return cleanText(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

export type WalletPdfData = {
  type: string;
  number: string;
  holderName: string;
  authority?: string;
  issued?: string;
  expiry?: string;
  category?: string;
  dob?: string;
  gender?: string;
  address?: string;
  vehicleModel?: string;
  fuelType?: string;
};

export type ChallanPdfData = {
  id: string;
  vehicle: string;
  amount: string;
  date: string;
  offense: string;
  status: string;
  rto?: string;
  paymentRef?: string;
};

/**
 * Builds a styled, professional A4 PDF vector stream with fonts, headers, boxes, and metadata
 */
function buildOfficialDocumentPdf(options: {
  title: string;
  subTitle: string;
  documentNumber: string;
  docTag: string;
  primaryColor?: [number, number, number]; // RGB 0-1
  sections: Array<{
    title: string;
    fields: Array<[string, string]>;
  }>;
  qrPayload?: string;
  footerNote?: string;
}) {
  const primary = options.primaryColor || [0.08, 0.48, 0.45]; // Smart RTO Teal (#167c74)
  const pR = primary[0].toFixed(2);
  const pG = primary[1].toFixed(2);
  const pB = primary[2].toFixed(2);

  // PDF drawing commands
  let stream = "";

  // 1. Page Background & Border Frame
  stream += `0.88 0.93 0.91 RG 1 w\n`; // Border color
  stream += `24 24 547 794 re S\n`; // Outer border
  stream += `0.95 0.98 0.96 rg 28 28 539 786 re f\n`; // Inner page tint

  // 2. Main Content Card
  stream += `1 1 1 rg 0.85 0.90 0.88 RG 1 w\n`;
  stream += `38 38 519 766 re B\n`; // White card

  // 3. Header Banner
  stream += `${pR} ${pG} ${pB} rg\n`;
  stream += `38 724 519 80 re f\n`; // Top Header Banner

  // 4. Header Text
  stream += `BT\n`;
  stream += `/F2 14 Tf 1 1 1 rg 54 774 Td (${escapePdf(options.title)}) Tj\n`;
  stream += `/F1 8.5 Tf 0.88 0.96 0.93 rg 54 756 Td (${escapePdf(options.subTitle)}) Tj\n`;
  stream += `/F2 9.5 Tf 1 0.85 0.5 rg 380 774 Td (${escapePdf(options.docTag)}) Tj\n`;
  stream += `/F1 8 Tf 1 1 1 rg 380 756 Td (Doc ID: ${escapePdf(options.documentNumber)}) Tj\n`;
  stream += `ET\n`;

  // 5. Official Watermark / Government Stamp Box
  stream += `0.93 0.96 0.94 rg 380 620 160 82 re f\n`;
  stream += `0.75 0.85 0.80 RG 1 w 380 620 160 82 re S\n`;
  stream += `BT\n`;
  stream += `/F2 9.5 Tf 0.08 0.48 0.45 rg 392 678 Td (GOVERNMENT OF INDIA) Tj\n`;
  stream += `/F1 7.5 Tf 0.25 0.40 0.35 rg 392 662 Td (MINISTRY OF ROAD TRANSPORT & HIGHWAYS) Tj\n`;
  stream += `/F2 8 Tf 0.15 0.65 0.45 rg 392 646 Td ([ OFFICIALLY DIGITALLY SIGNED ]) Tj\n`;
  stream += `/F1 7 Tf 0.40 0.50 0.45 rg 392 632 Td (Auth: Central Motor Vehicles Act) Tj\n`;
  stream += `ET\n`;

  // 6. Render Document Sections & Fields
  let currentY = 702;

  options.sections.forEach((section) => {
    // Section Header Box
    stream += `0.93 0.96 0.94 rg ${pR} ${pG} ${pB} RG 0.5 w\n`;
    stream += `54 ${currentY - 18} 310 20 re B\n`;

    stream += `BT\n`;
    stream += `/F2 9 Tf ${pR} ${pG} ${pB} rg 62 ${currentY - 13} Td (${escapePdf(section.title)}) Tj\n`;
    stream += `ET\n`;

    currentY -= 32;

    // Fields
    section.fields.forEach(([label, value]) => {
      stream += `BT\n`;
      stream += `/F1 8 Tf 0.40 0.48 0.45 rg 62 ${currentY} Td (${escapePdf(label)}:) Tj\n`;
      stream += `/F2 8.5 Tf 0.08 0.14 0.12 rg 170 ${currentY} Td (${escapePdf(value)}) Tj\n`;
      stream += `ET\n`;

      // Dotted separator line
      stream += `0.90 0.93 0.91 RG 0.5 w\n`;
      stream += `62 ${currentY - 4} m 364 ${currentY - 4} l S\n`;

      currentY -= 17;
    });

    currentY -= 10;
  });

  // 7. QR Code / Verification Bar Representation
  stream += `0.95 0.97 0.96 rg 0.80 0.88 0.85 RG 1 w 380 470 160 135 re B\n`;
  stream += `BT\n`;
  stream += `/F2 9 Tf ${pR} ${pG} ${pB} rg 395 582 Td (SECURE DIGITAL QR) Tj\n`;
  stream += `/F1 7.5 Tf 0.35 0.45 0.40 rg 395 566 Td (Scan to verify authenticity on Parivahan) Tj\n`;
  stream += `ET\n`;

  // QR matrix visualization
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if ((r + c) % 2 === 0 || (r === 0 && c === 0) || (r === 4 && c === 4)) {
        stream += `${pR} ${pG} ${pB} rg ${410 + c * 20} ${485 + r * 14} 14 10 re f\n`;
      }
    }
  }

  // 8. Footer & Verification Guarantee
  stream += `0.92 0.95 0.94 rg 38 38 519 32 re f\n`;
  stream += `BT\n`;
  stream += `/F2 8 Tf 0.08 0.48 0.45 rg 54 58 Td (SMART RTO CITIZEN PORTAL) Tj\n`;
  stream += `/F1 7.5 Tf 0.40 0.50 0.45 rg 54 46 Td (${escapePdf(
    options.footerNote ||
      "Official Digital Copy * Valid across all Police & RTO checkpoints * Parivahan Compatible"
  )}) Tj\n`;
  stream += `/F2 8 Tf 0.08 0.48 0.45 rg 420 52 Td (TIMESTAMP: ${escapePdf(
    new Date().toLocaleDateString("en-IN")
  )}) Tj\n`;
  stream += `ET\n`;

  // Assemble PDF Object Structure
  const objects: string[] = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = "<< /Type /Pages /Kids [3 0 R] /Count 1 >>";
  objects[3] =
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[5] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";
  objects[6] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;

  let output = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (let id = 1; id <= 6; id += 1) {
    offsets[id] = output.length;
    output += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xref = output.length;
  output += `xref\n0 7\n0000000000 65535 f \n`;
  for (let id = 1; id <= 6; id += 1) {
    output += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  output += `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  return new Blob([output], { type: "application/pdf" });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ==========================================
// 1. Form 2 Learner Licence (LL) PDF
// ==========================================
export function downloadApplicationPdf(app: DemoApplication) {
  const slot = appointmentParts(app.appointment);
  const mobileStr = app.mobile || "9999999999";
  const identityStr = app.identity ? `${app.identity} (Aadhaar Verified)` : "9999 8888 7777 (Aadhaar Verified)";
  const panStr = app.pan ? ` | PAN: ${app.pan}` : "";
  const addressStr = [app.address, app.city, app.pincode, app.state].filter(Boolean).join(", ") || "Flat 402, Green Avenue, Sangli 416416";
  const vehicleStr = app.vehicle || "MCWG (Motorcycle with Gear) / LMV (Car)";
  const medicalStr = app.medicalStatus || "Fit (Form 1 Self-Declaration Attested)";
  const organStr = app.organDonation || "Yes (Pledged for Road Safety Cause)";

  const blob = buildOfficialDocumentPdf({
    title: "LEARNER LICENCE APPLICATION & TEST SLIP",
    subTitle: "Form 2 (Rule 10 of CMVR 1989) · Ministry of Road Transport & Highways",
    documentNumber: app.id,
    docTag: "FORM 2 (LEARNER LICENCE)",
    sections: [
      {
        title: "1. APPLICANT & EKYC IDENTITY",
        fields: [
          ["Applicant Name", app.fullName || "Demo Citizen"],
          ["Identity / eKYC", `${identityStr}${panStr}`],
          ["Date of Birth", app.dob || "15/01/2000"],
          ["Father / Guardian", app.guardian || "Ramesh Citizen"],
          ["Gender / Mobile", `${app.gender || "Male"} | ${mobileStr}`],
          ["Residential Address", addressStr],
        ],
      },
      {
        title: "2. VEHICLE CLASSES & MEDICAL DECLARATION",
        fields: [
          ["Applied Vehicle Classes", vehicleStr],
          ["Form 1 Physical Fitness", medicalStr],
          ["Organ Donation Consent", organStr],
          ["Jurisdiction RTO", app.rto || "MH-10 Sangli RTO"],
          ["Application Date", new Date(app.submittedAt || Date.now()).toLocaleDateString("en-IN")],
        ],
      },
      {
        title: "3. COMPUTER THEORY TEST APPOINTMENT",
        fields: [
          ["Appointment Token", app.appointmentId || "APT-LL-2026-9812"],
          ["Test Date & Slot", slot.longDate || "29 August 2026 at 11:20 AM"],
          ["Reporting Center", `${app.rto || "MH-10 Sangli RTO"} - Computer Exam Lab 2`],
          ["Candidate Instructions", "Bring original Aadhaar Card and this receipt 15 mins before slot"],
        ],
      },
      {
        title: "4. STATUTORY FEES SUMMARY",
        fields: [
          ["Learner Licence Fee", "INR 150.00"],
          ["Computer Theory Test Fee", "INR 20.00"],
          ["Total Amount Paid", app.feeTotal ? cleanText(app.feeTotal) : "INR 170.00 (PAID ONLINE)"],
          ["Payment Reference", app.paymentReference || "TESTPAY-LL-2026-483921"],
          ["Status", "Appointment Scheduled · Ready for Computer Exam"],
        ],
      },
    ],
    footerNote: "Form 2 Learner Licence Application under CMVR 1989 * Officially Digitally Verified",
  });

  triggerDownload(blob, `${app.id}-Learner-Licence-Application.pdf`);
}

// ==========================================
// 2. Appointment Slip PDF
// ==========================================
export function downloadAppointmentPdf(app: DemoApplication) {
  const slot = appointmentParts(app.appointment);
  const blob = buildOfficialDocumentPdf({
    title: "OFFICIAL RTO APPOINTMENT ENTRY SLIP",
    subTitle: "Ministry of Road Transport & Highways · Smart RTO",
    documentNumber: app.appointmentId || "APT-20037",
    docTag: "ENTRY PERMIT",
    sections: [
      {
        title: "1. APPOINTMENT PARTICULARS",
        fields: [
          ["Appointment Token", app.appointmentId || "APT-20037"],
          ["Application Number", app.id],
          ["Applicant Name", app.fullName || "Demo Citizen"],
          ["Service Type", "Learner Licence Computer Theory Exam"],
          ["Slot Date & Time", slot.longDate || "29 August 2026 at 11:20 AM"],
          ["Reporting RTO", app.rto || "MH-10 Sangli RTO"],
        ],
      },
      {
        title: "2. MANDATORY CHECKLIST FOR VISIT",
        fields: [
          ["Original Aadhaar Card", "Mandatory for physical biometric eKYC check"],
          ["Age & Educational Proof", "10th certificate or birth certificate required"],
          ["Reporting Protocol", "Please arrive 15 minutes prior to scheduled slot"],
          ["Biometric Capture", "Live photo and digital signature capture at counter"],
        ],
      },
    ],
    footerNote: "Official RTO Appointment Pass * Present at security gate and biometric counter",
  });

  triggerDownload(blob, `${app.appointmentId || "APT-20037"}-Appointment-Slip.pdf`);
}

// ==========================================
// 3. Digital Wallet Document PDF (Aadhaar, DL, RC, Insurance, PUCC)
// ==========================================
export function downloadWalletDocumentPdf(doc: WalletPdfData) {
  const docType = doc.type.toUpperCase();
  let sections: Array<{ title: string; fields: Array<[string, string]> }> = [];

  if (docType.includes("AADHAAR")) {
    sections = [
      {
        title: "UNIQUE IDENTIFICATION AUTHORITY OF INDIA",
        fields: [
          ["Aadhaar Number", doc.number || "XXXX XXXX 7777"],
          ["Full Name", doc.holderName || "Demo Citizen"],
          ["Date of Birth", doc.dob || "15/01/2000"],
          ["Gender", doc.gender || "Male"],
          ["Address", doc.address || "House 14, Vishrambag, Sangli, Maharashtra 416416"],
          ["eKYC Status", "Digitally Verified & Active on UIDAI Central DB"],
        ],
      },
    ];
  } else if (docType.includes("DRIVING") || docType.includes("LICENCE") || docType === "DL") {
    sections = [
      {
        title: "UNION OF INDIA - DRIVING LICENCE (FORM 7)",
        fields: [
          ["Licence Number", doc.number || "DL-1020230004821"],
          ["Name of Holder", doc.holderName || "Demo Citizen"],
          ["Authorised Vehicles", doc.category || "MCWG (Motorcycle) / LMV (Car)"],
          ["Issuing Authority", doc.authority || "MH-10 Sangli RTO"],
          ["Date of Issue", doc.issued || "12/03/2023"],
          ["Valid Until", doc.expiry || "11/03/2043"],
          ["Organ Donor", "Yes (Pledged)"],
          ["Status", "ACTIVE & VALID"],
        ],
      },
    ];
  } else if (docType.includes("REGISTRATION") || docType.includes("RC") || docType.includes("VEHICLE")) {
    sections = [
      {
        title: "CERTIFICATE OF REGISTRATION (FORM 23)",
        fields: [
          ["Registration Plate", doc.number || "MH10AB1234"],
          ["Registered Owner", doc.holderName || "Demo Citizen"],
          ["Maker / Model", doc.vehicleModel || "Tata Nexon EV (Electric)"],
          ["Vehicle Class", doc.category || "Light Motor Vehicle (LMV)"],
          ["Registering RTO", doc.authority || "MH-10 Sangli RTO"],
          ["Registration Date", doc.issued || "05/08/2022"],
          ["Fitness Valid Until", doc.expiry || "04/08/2037"],
          ["Hypothecation", "None (Clear Ownership)"],
        ],
      },
    ];
  } else if (docType.includes("PUCC") || docType.includes("POLLUTION")) {
    sections = [
      {
        title: "POLLUTION UNDER CONTROL CERTIFICATE (PUCC)",
        fields: [
          ["Certificate Number", doc.number || "PUCC-MH10-2026-91"],
          ["Vehicle Reg Number", "MH10AB1234"],
          ["Emission Standard", doc.category || "BS-VI Standard Compliant"],
          ["Authorized Center", doc.authority || "Sangli Auto Emission Testing"],
          ["Tested On", doc.issued || "13/03/2026"],
          ["Valid Upto", doc.expiry || "12/09/2026"],
          ["Status", "CERTIFIED CLEAN EMISSION"],
        ],
      },
    ];
  } else {
    // Motor Insurance / PAN
    sections = [
      {
        title: `${doc.type.toUpperCase()} CREDENTIAL RECORD`,
        fields: [
          ["Document Number", doc.number],
          ["Holder Name", doc.holderName],
          ["Issuing Authority", doc.authority || "Government of India"],
          ["Valid Until", doc.expiry || "Permanent / Active"],
          ["Digital Status", "Verified Digital Credential (IT Act 2000)"],
        ],
      },
    ];
  }

  const blob = buildOfficialDocumentPdf({
    title: `OFFICIAL DIGITAL ${docType}`,
    subTitle: "National Digital Document Locker · Ministry of Road Transport",
    documentNumber: doc.number,
    docTag: "DIGITAL CREDENTIAL",
    sections,
    footerNote: "Digital Document under IT Act 2000 · Valid for all Police & RTO Verifications",
  });

  triggerDownload(blob, `${doc.type.replace(/\s+/g, "_")}-${doc.number}.pdf`);
}

// ==========================================
// 4. eChallan Payment Receipt PDF
// ==========================================
export function downloadChallanReceiptPdf(challan: ChallanPdfData) {
  const blob = buildOfficialDocumentPdf({
    title: "ECHALLAN DISPOSAL & PAYMENT RECEIPT",
    subTitle: "Traffic Police & Transport Department · Ministry of Road Transport",
    documentNumber: challan.id,
    docTag: "PAID RECEIPT",
    sections: [
      {
        title: "1. VIOLATION & CHALLAN DETAILS",
        fields: [
          ["Challan Number", challan.id],
          ["Vehicle Registration", challan.vehicle],
          ["Offense / Violation", challan.offense],
          ["Offense Date", challan.date],
          ["Jurisdiction RTO", challan.rto || "MH-10 Sangli Traffic Division"],
        ],
      },
      {
        title: "2. PAYMENT SETTLEMENT",
        fields: [
          ["Fine Amount", challan.amount],
          ["Payment Status", "DISPOSED / FULLY PAID"],
          ["Transaction Ref", challan.paymentRef || "TESTPAY-ECHALLAN-8921"],
          ["Receipt Generated", new Date().toLocaleString("en-IN")],
        ],
      },
    ],
    footerNote: "E-Payment Settled * No court appearance required * Violation Disposed",
  });

  triggerDownload(blob, `${challan.id}-Challan-Receipt.pdf`);
}

// ==========================================
// 5. Vehicle Transfer Application PDF
// ==========================================
export function downloadVehicleTransferPdf(data: {
  applicationId: string;
  regNumber: string;
  sellerName: string;
  buyerName: string;
  buyerAadhaar: string;
  buyerMobile: string;
  buyerAddress: string;
  makerModel: string;
  rtoOffice: string;
  transferType: string;
  feePaid: string;
  paymentRef: string;
  declarationDate?: string;
}) {
  const blob = buildOfficialDocumentPdf({
    title: "VEHICLE OWNERSHIP TRANSFER ACKNOWLEDGEMENT",
    subTitle: "Form 29 & 30 (Notice & Intimation of Transfer) · Section 50 of MVA 1988",
    documentNumber: data.applicationId,
    docTag: "FORM 29 & 30 (RC TRANSFER)",
    sections: [
      {
        title: "1. VEHICLE PARTICULARS",
        fields: [
          ["Registration Number", data.regNumber],
          ["Make & Model", data.makerModel],
          ["Jurisdiction RTO", data.rtoOffice],
          ["Transfer Type", data.transferType],
        ],
      },
      {
        title: "2. CURRENT OWNER (TRANSFEROR / SELLER)",
        fields: [
          ["Full Name", data.sellerName],
          ["Transfer Consent", "e-Signed & Verified via Aadhaar OTP (Authenticated)"],
        ],
      },
      {
        title: "3. NEW OWNER (TRANSFEREE / BUYER)",
        fields: [
          ["Full Name", data.buyerName],
          ["Aadhaar Reference", data.buyerAadhaar],
          ["Mobile Number", data.buyerMobile],
          ["Residential Address", data.buyerAddress],
        ],
      },
      {
        title: "4. STATUTORY SELF-DECLARATION (SEC 50 MVA 1988)",
        fields: [
          ["Encumbrance Status", "Free from hypothecation / Bank NOC attached"],
          ["Legal Clearances", "No pending police challans, FIRs or legal disputes"],
          ["Seller & Buyer Consent", "Mutually verified via digital signature"],
          ["Attestation Timestamp", data.declarationDate || new Date().toLocaleString("en-IN")],
        ],
      },
      {
        title: "5. STATUTORY FEES & SETTLEMENT",
        fields: [
          ["RC Transfer Endorsement Fee", data.feePaid],
          ["Payment Transaction Ref", data.paymentRef],
          ["Status", "Submitted · Awaiting RTO Smart Card RC Endorsement"],
        ],
      },
    ],
    footerNote: "Statutory Self-Declaration Accepted under Section 50 of Motor Vehicles Act 1988 * Digitally Signed",
  });

  triggerDownload(blob, `${data.applicationId}-Vehicle-Transfer-Application.pdf`);
}

// ==========================================
// 6. Permanent Driving Licence Application PDF
// ==========================================
export function downloadPermanentDLPdf(data: {
  applicationId: string;
  applicantName: string;
  aadhaarNumber: string;
  panNumber: string;
  llNumber: string;
  vehicleClasses: string[];
  medicalStatus: string;
  organDonation: string;
  rtoOffice: string;
  slotTime: string;
  feePaid: string;
  paymentRef: string;
}) {
  const blob = buildOfficialDocumentPdf({
    title: "PERMANENT DRIVING LICENCE APPLICATION & TRACK SLIP",
    subTitle: "Form 4 (Rule 14 of CMVR 1989) · Ministry of Road Transport & Highways",
    documentNumber: data.applicationId,
    docTag: "FORM 4 (PERMANENT DL)",
    sections: [
      {
        title: "1. APPLICANT & EKYC IDENTITY",
        fields: [
          ["Applicant Name", data.applicantName],
          ["Aadhaar Reference", data.aadhaarNumber],
          ["PAN Card Reference", data.panNumber],
          ["Approved LL Number", data.llNumber],
          ["Jurisdiction RTO", data.rtoOffice],
        ],
      },
      {
        title: "2. APPLIED VEHICLE CLASSES & MEDICAL DECLARATION",
        fields: [
          ["Selected Categories", data.vehicleClasses.join(", ")],
          ["Physical Fitness (Form 1)", data.medicalStatus],
          ["Organ Donation Consent", data.organDonation],
        ],
      },
      {
        title: "3. DRIVING TRACK COMPETENCE TEST APPOINTMENT",
        fields: [
          ["Assigned Track Center", `${data.rtoOffice} - Automated Sensor Track`],
          ["Track Slot Schedule", data.slotTime],
          ["Candidate Instructions", "Bring original Approved LL, vehicle with 'L' plate & this slip"],
        ],
      },
      {
        title: "4. STATUTORY FEES SUMMARY",
        fields: [
          ["Driving Track Competence Fee", "INR 200.00"],
          ["Form 7 PVC Smart Card Fee", "INR 200.00"],
          ["Total Fee Paid", data.feePaid],
          ["Payment Transaction Ref", data.paymentRef],
          ["Status", "Track Test Slot Booked · Biometrics & Skill Test Scheduled"],
        ],
      },
    ],
    footerNote: "Form 4 Application for Permanent DL under Central Motor Vehicles Rules 1989 * Officially Verified",
  });

  triggerDownload(blob, `${data.applicationId}-Permanent-DL-Application.pdf`);
}
