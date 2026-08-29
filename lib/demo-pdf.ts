import { jsPDF } from "jspdf";
import type { DemoApplication } from "./storage";
import { appointmentParts } from "./appointment";

function cleanText(value: string) {
  return String(value || "")
    .replace(/₹/g, "INR ")
    .replace(/·/g, "|")
    .replace(/[^\x20-\x7E]/g, " ")
    .trim();
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
 * Builds a clean, official, text-focused A4 document with standard tables,
 * clean typography, clear spacing, and minimal graphics.
 */
function buildOfficialDocumentPdf(options: {
  title: string;
  subTitle?: string;
  documentNumber: string;
  docTag?: string;
  sections: Array<{
    title: string;
    fields: Array<[string, string]>;
  }>;
  footerNote?: string;
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 182mm

  // Outer clean border
  doc.setDrawColor(60, 80, 75);
  doc.setLineWidth(0.5);
  doc.rect(marginX - 2, marginX - 2, contentWidth + 4, pageHeight - (marginX - 2) * 2);

  let y = 20;

  // Header - Text based official heading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 30, 28);
  doc.text("GOVERNMENT OF INDIA", pageWidth / 2, y, { align: "center" });
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(60, 75, 70);
  doc.text(
    cleanText(options.subTitle || "MINISTRY OF ROAD TRANSPORT & HIGHWAYS · SMART RTO PORTAL"),
    pageWidth / 2,
    y,
    { align: "center" }
  );
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 85, 75);
  doc.text(cleanText(options.title), pageWidth / 2, y, { align: "center" });
  y += 7;

  // Divider line
  doc.setDrawColor(180, 200, 195);
  doc.setLineWidth(0.4);
  doc.line(marginX, y, marginX + contentWidth, y);
  y += 4;

  // Metadata Row (Doc Number, Date, Status)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(30, 45, 40);
  doc.text(`Document ID: ${cleanText(options.documentNumber)}`, marginX + 2, y);

  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${dateStr}`, marginX + contentWidth - 2, y, { align: "right" });
  y += 5;

  if (options.docTag) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(15, 85, 75);
    doc.text(`Classification: ${cleanText(options.docTag)}`, marginX + 2, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 75, 70);
    doc.text("Status: VERIFIED & DIGITALLY ATTESTED", marginX + contentWidth - 2, y, { align: "right" });
    y += 5;
  }

  doc.setDrawColor(180, 200, 195);
  doc.setLineWidth(0.4);
  doc.line(marginX, y, marginX + contentWidth, y);
  y += 6;

  // Render Sections sequentially
  const labelColWidth = 55;
  const valueColWidth = contentWidth - labelColWidth - 4;

  options.sections.forEach((section) => {
    // Section Header Box
    doc.setFillColor(240, 246, 244);
    doc.setDrawColor(180, 205, 200);
    doc.setLineWidth(0.3);
    doc.rect(marginX, y, contentWidth, 6, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 85, 75);
    doc.text(cleanText(section.title), marginX + 3, y + 4.2);
    y += 6;

    // Fields in table format
    section.fields.forEach(([label, value]) => {
      const displayLabel = cleanText(label);
      const displayValue = cleanText(value || "N/A");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);

      // Calculate wrapped lines for value
      const wrappedValue = doc.splitTextToSize(displayValue, valueColWidth);
      const rowHeight = Math.max(5.5, wrappedValue.length * 3.8 + 2);

      // Row background / border
      doc.setDrawColor(225, 235, 232);
      doc.setLineWidth(0.2);
      doc.line(marginX, y + rowHeight, marginX + contentWidth, y + rowHeight);

      // Vertical separator
      doc.line(marginX + labelColWidth, y, marginX + labelColWidth, y + rowHeight);

      // Label column
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(70, 85, 80);
      doc.text(displayLabel, marginX + 2.5, y + 3.8);

      // Value column
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(20, 30, 28);
      doc.text(wrappedValue, marginX + labelColWidth + 2.5, y + 3.8);

      y += rowHeight;
    });

    y += 4; // Spacing after section
  });

  // Footer at fixed bottom
  const footerY = pageHeight - 22;
  doc.setDrawColor(180, 200, 195);
  doc.setLineWidth(0.4);
  doc.line(marginX, footerY, marginX + contentWidth, footerY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(15, 85, 75);
  doc.text("SMART RTO CITIZEN PORTAL · OFFICIAL DIGITAL RECORD", marginX + 2, footerY + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(80, 95, 90);
  const footerText =
    options.footerNote ||
    "This document is digitally generated under Section 4 of the Information Technology Act 2000 and CMVR 1989.";
  doc.text(cleanText(footerText), marginX + 2, footerY + 8);
  doc.text(
    `Timestamp: ${new Date().toLocaleString("en-IN")} · Parivahan Compatible`,
    marginX + contentWidth - 2,
    footerY + 8,
    { align: "right" }
  );

  return doc;
}

function triggerDownload(doc: jsPDF, filename: string) {
  doc.save(filename);
}

// ==========================================
// 1. Form 2 Learner Licence (LL) PDF
// ==========================================
export function downloadApplicationPdf(app: DemoApplication) {
  const slot = appointmentParts(app.appointment);
  const mobileStr = app.mobile || "9999999999";
  const identityStr = app.identity
    ? `${app.identity} (Aadhaar Verified)`
    : "9999 8888 7777 (Aadhaar Verified)";
  const panStr = app.pan ? ` | PAN: ${app.pan}` : " | PAN: ABCDE1234F";
  const addressStr =
    [app.address, app.city, app.pincode, app.state].filter(Boolean).join(", ") ||
    "Flat 402, Green Avenue, Sangli 416416";
  const vehicleStr = app.vehicle || "MCWG (Motorcycle with Gear) / LMV (Car)";
  const medicalStr = app.medicalStatus || "Fit (Form 1 Self-Declaration Attested)";
  const organStr = app.organDonation || "Yes (Pledged for Road Safety Cause)";

  const pdfDoc = buildOfficialDocumentPdf({
    title: "APPLICATION FOR LEARNER LICENCE (FORM 2)",
    subTitle: "Rule 10 of Central Motor Vehicles Rules (CMVR) 1989 · Government of India",
    documentNumber: app.id || "SRTO-LL-2026-981240",
    docTag: "FORM 2 (LEARNER LICENCE)",
    sections: [
      {
        title: "1. APPLICANT & EKYC IDENTITY PARTICULARS",
        fields: [
          ["Applicant Full Name", app.fullName || "Demo Citizen"],
          ["Aadhaar & PAN Identity", `${identityStr}${panStr}`],
          ["Date of Birth", app.dob || "15/01/2000"],
          ["Father / Guardian Name", app.guardian || "Ramesh Citizen"],
          ["Gender / Mobile Number", `${app.gender || "Male"} | ${mobileStr}`],
          ["Residential Address", addressStr],
        ],
      },
      {
        title: "2. VEHICLE CATEGORIES & STATUTORY DECLARATION",
        fields: [
          ["Applied Vehicle Classes", vehicleStr],
          ["Form 1 Medical Fitness", medicalStr],
          ["Organ Donation Pledge", organStr],
          ["Jurisdiction RTO Office", app.rto || "MH-10 Sangli RTO"],
          [
            "Application Date",
            new Date(app.submittedAt || Date.now()).toLocaleDateString("en-IN"),
          ],
        ],
      },
      {
        title: "3. COMPUTER THEORY TEST APPOINTMENT & VENUE",
        fields: [
          ["Appointment Token No", app.appointmentId || "APT-LL-2026-9812"],
          ["Test Date & Slot Window", slot.longDate || "29 August 2026 at 11:20 AM"],
          [
            "Reporting Venue",
            `${app.rto || "MH-10 Sangli RTO"} - Computer Exam Lab 2`,
          ],
          [
            "Candidate Instructions",
            "Bring original Aadhaar Card and this printed acknowledgement 15 mins before scheduled slot.",
          ],
        ],
      },
      {
        title: "4. STATUTORY FEES & SETTLEMENT SUMMARY",
        fields: [
          ["Learner Licence Fee (Form 2)", "INR 150.00"],
          ["Computer Theory Exam Fee", "INR 20.00"],
          [
            "Total Amount Paid",
            app.feeTotal ? cleanText(app.feeTotal) : "INR 170.00 (PAID ONLINE)",
          ],
          [
            "Payment Reference Number",
            app.paymentReference || "TESTPAY-LL-2026-483921",
          ],
          ["Application Status", "Appointment Scheduled - Ready for Computer Exam"],
        ],
      },
    ],
    footerNote:
      "Form 2 Learner Licence Acknowledgement under CMVR 1989 · Officially Verified and Digitally Signed.",
  });

  triggerDownload(pdfDoc, `${app.id || "SRTO-LL-Application"}-Learner-Licence.pdf`);
}

// ==========================================
// 2. Appointment Slip PDF
// ==========================================
export function downloadAppointmentPdf(app: DemoApplication) {
  const slot = appointmentParts(app.appointment);
  const pdfDoc = buildOfficialDocumentPdf({
    title: "RTO APPOINTMENT ENTRY SLIP & GATE PASS",
    subTitle: "Ministry of Road Transport & Highways · Smart RTO",
    documentNumber: app.appointmentId || "APT-20037",
    docTag: "ENTRY PERMIT / GATE PASS",
    sections: [
      {
        title: "1. APPOINTMENT PARTICULARS",
        fields: [
          ["Appointment Token", app.appointmentId || "APT-20037"],
          ["Application Number", app.id || "SRTO-LL-2026-981240"],
          ["Applicant Name", app.fullName || "Demo Citizen"],
          ["Service Type", "Learner Licence Computer Theory Examination"],
          ["Scheduled Date & Time", slot.longDate || "29 August 2026 at 11:20 AM"],
          ["Reporting RTO Office", app.rto || "MH-10 Sangli RTO"],
        ],
      },
      {
        title: "2. MANDATORY CHECKLIST FOR RTO VISIT",
        fields: [
          ["Identity Verification", "Original Aadhaar Card is mandatory for physical biometric verification."],
          ["Educational Proof", "10th standard certificate or birth certificate copy required."],
          ["Reporting Time", "Please report 15 minutes prior to the scheduled slot time."],
          ["Biometric Process", "Digital photo and signature capture will be conducted at the counter."],
        ],
      },
    ],
    footerNote:
      "Official RTO Appointment Pass · Present this slip at security gate and biometric verification counter.",
  });

  triggerDownload(
    pdfDoc,
    `${app.appointmentId || "APT-20037"}-Appointment-Slip.pdf`
  );
}

// ==========================================
// 3. Digital Wallet Document PDF (Aadhaar, DL, RC, Insurance, PUCC)
// ==========================================
export function downloadWalletDocumentPdf(doc: WalletPdfData) {
  const docType = (doc.type || "DOCUMENT").toUpperCase();
  let sections: Array<{ title: string; fields: Array<[string, string]> }> = [];

  if (docType.includes("AADHAAR")) {
    sections = [
      {
        title: "1. UNIQUE IDENTIFICATION PARTICULARS",
        fields: [
          ["Aadhaar Number", doc.number || "XXXX XXXX 7777"],
          ["Full Name of Holder", doc.holderName || "Demo Citizen"],
          ["Date of Birth", doc.dob || "15/01/2000"],
          ["Gender", doc.gender || "Male"],
          [
            "Registered Address",
            doc.address || "House 14, Vishrambag, Sangli, Maharashtra 416416",
          ],
          ["eKYC Verification Status", "Digitally Verified & Active on UIDAI Central Database"],
        ],
      },
    ];
  } else if (
    docType.includes("DRIVING") ||
    docType.includes("LICENCE") ||
    docType === "DL"
  ) {
    sections = [
      {
        title: "1. DRIVING LICENCE RECORD (FORM 7)",
        fields: [
          ["Driving Licence Number", doc.number || "DL-1020230004821"],
          ["Full Name of Holder", doc.holderName || "Demo Citizen"],
          [
            "Authorised Vehicle Classes",
            doc.category || "MCWG (Motorcycle with Gear) / LMV (Light Motor Vehicle)",
          ],
          ["Issuing RTO Authority", doc.authority || "MH-10 Sangli RTO"],
          ["Date of First Issue", doc.issued || "12/03/2023"],
          ["Validity (Transport / Non-Tr)", doc.expiry || "11/03/2043"],
          ["Organ Donor Status", "Yes (Pledged for Road Safety)"],
          ["Licence Status", "ACTIVE & VALID ACROSS INDIA"],
        ],
      },
    ];
  } else if (
    docType.includes("REGISTRATION") ||
    docType.includes("RC") ||
    docType.includes("VEHICLE")
  ) {
    sections = [
      {
        title: "1. CERTIFICATE OF REGISTRATION RECORD (FORM 23)",
        fields: [
          ["Registration Number Plate", doc.number || "MH10AB1234"],
          ["Registered Owner Name", doc.holderName || "Demo Citizen"],
          ["Vehicle Maker / Model", doc.vehicleModel || "Tata Nexon EV (Electric)"],
          ["Vehicle Classification", doc.category || "Light Motor Vehicle (LMV)"],
          ["Registering RTO Authority", doc.authority || "MH-10 Sangli RTO"],
          ["Registration Date", doc.issued || "05/08/2022"],
          ["Fitness Validity Date", doc.expiry || "04/08/2037"],
          ["Hypothecation / Financier", "None · Clear Ownership Title"],
        ],
      },
    ];
  } else if (docType.includes("PUCC") || docType.includes("POLLUTION")) {
    sections = [
      {
        title: "1. POLLUTION UNDER CONTROL CERTIFICATE PARTICULARS",
        fields: [
          ["PUCC Certificate Number", doc.number || "PUCC-MH10-2026-91"],
          ["Vehicle Registration No", "MH10AB1234"],
          ["Emission Compliance Standard", doc.category || "Bharat Stage VI (BS-VI Compliant)"],
          ["Authorized Testing Station", doc.authority || "Sangli Auto Emission Testing Center"],
          ["Date of Emission Test", doc.issued || "13/03/2026"],
          ["Certificate Valid Upto", doc.expiry || "12/09/2026"],
          ["Pollution Test Result", "PASSED · CERTIFIED CLEAN EMISSION"],
        ],
      },
    ];
  } else {
    sections = [
      {
        title: "1. DOCUMENT CREDENTIAL DETAILS",
        fields: [
          ["Document Number", doc.number || "N/A"],
          ["Holder Full Name", doc.holderName || "Demo Citizen"],
          ["Issuing Authority", doc.authority || "Government of India"],
          ["Validity Status", doc.expiry || "Active / Permanent"],
          ["Digital Legal Status", "Recognized Digital Credential under Section 4 of IT Act 2000"],
        ],
      },
    ];
  }

  const pdfDoc = buildOfficialDocumentPdf({
    title: `OFFICIAL DIGITAL ${docType}`,
    subTitle: "National Digital Document Locker · Ministry of Road Transport",
    documentNumber: doc.number || "DIGI-DOC-2026",
    docTag: "DIGITAL CREDENTIAL",
    sections,
    footerNote:
      "Valid across all Police & RTO checkpoints under the Information Technology Act 2000.",
  });

  triggerDownload(pdfDoc, `${docType.replace(/\s+/g, "_")}-${doc.number || "doc"}.pdf`);
}

// ==========================================
// 4. eChallan Payment Receipt PDF
// ==========================================
export function downloadChallanReceiptPdf(challan: ChallanPdfData) {
  const pdfDoc = buildOfficialDocumentPdf({
    title: "ECHALLAN PAYMENT & DISPOSAL RECEIPT",
    subTitle:
      "Traffic Police & Transport Department · Ministry of Road Transport & Highways",
    documentNumber: challan.id || "CHL-2026-887412",
    docTag: "PAID SETTLEMENT RECEIPT",
    sections: [
      {
        title: "1. VIOLATION & CHALLAN PARTICULARS",
        fields: [
          ["Challan Number", challan.id || "CHL-2026-887412"],
          ["Vehicle Registration Plate", challan.vehicle || "MH10EA1234"],
          ["Specific Traffic Offense", challan.offense || "Over-Speeding (Section 183 of MVA 1988)"],
          ["Date & Time of Violation", challan.date || "24 Aug 2026, 14:20 PM"],
          ["Jurisdiction Authority", challan.rto || "MH-10 Sangli Traffic Division"],
        ],
      },
      {
        title: "2. PAYMENT & DISPOSAL SETTLEMENT",
        fields: [
          ["Fine Amount Assessed", challan.amount || "INR 500.00"],
          ["Disposal Status", "SETTLED / FULLY DISPOSED"],
          ["Transaction Payment Ref", challan.paymentRef || "TESTPAY-ECHALLAN-8921"],
          ["Receipt Generation Date", new Date().toLocaleString("en-IN")],
          ["Legal Court Status", "Fine Disposed · No Court Appearance Required"],
        ],
      },
    ],
    footerNote:
      "Electronic Payment Settled · Traffic violation closed and updated on Parivahan portal.",
  });

  triggerDownload(pdfDoc, `${challan.id || "Challan"}-Receipt.pdf`);
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
  const pdfDoc = buildOfficialDocumentPdf({
    title: "VEHICLE OWNERSHIP TRANSFER ACKNOWLEDGEMENT (FORM 29 & 30)",
    subTitle:
      "Section 50 of Motor Vehicles Act 1988 · Notice & Intimation of Transfer",
    documentNumber: data.applicationId || "SRTO-VT-2026-102948",
    docTag: "FORM 29 & 30 (RC TRANSFER)",
    sections: [
      {
        title: "1. VEHICLE PARTICULARS",
        fields: [
          ["Registration Plate Number", data.regNumber || "MH10AB1234"],
          ["Vehicle Make & Model", data.makerModel || "Tata Nexon EV (Electric)"],
          ["Jurisdiction RTO Office", data.rtoOffice || "MH-10 Sangli RTO"],
          ["Transfer Classification", data.transferType || "Sale & Purchase (Form 29 & 30)"],
        ],
      },
      {
        title: "2. CURRENT OWNER (TRANSFEROR / SELLER)",
        fields: [
          ["Seller Full Name", data.sellerName || "Rajesh Sharma"],
          [
            "Transfer Consent & e-Sign",
            "Authenticated & Digitally Verified via Aadhaar OTP",
          ],
        ],
      },
      {
        title: "3. NEW OWNER (TRANSFEREE / BUYER)",
        fields: [
          ["Buyer Full Name", data.buyerName || "Demo Citizen"],
          ["Buyer Aadhaar Reference", data.buyerAadhaar || "9999 8888 7777"],
          ["Buyer Contact Mobile", data.buyerMobile || "9999999999"],
          ["Buyer Residential Address", data.buyerAddress || "Flat 402, Green Avenue, Sangli 416416"],
        ],
      },
      {
        title: "4. STATUTORY FEES & APPLICATION STATUS",
        fields: [
          ["Transfer Endorsement Fee", data.feePaid || "INR 300.00 (Paid)"],
          ["Payment Transaction Ref", data.paymentRef || "TESTPAY-VT-102948"],
          ["Processing Status", "Submitted - Awaiting RTO Smart Card RC Endorsement"],
        ],
      },
    ],
    footerNote:
      "Statutory Notice of Transfer under Section 50 of MVA 1988 · Digitally attested and submitted.",
  });

  triggerDownload(
    pdfDoc,
    `${data.applicationId || "Vehicle-Transfer"}-Form29-30.pdf`
  );
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
  const pdfDoc = buildOfficialDocumentPdf({
    title: "APPLICATION FOR PERMANENT DRIVING LICENCE (FORM 4)",
    subTitle:
      "Rule 14 of Central Motor Vehicles Rules (CMVR) 1989 · Ministry of Road Transport",
    documentNumber: data.applicationId || "SRTO-DL-2026-894210",
    docTag: "FORM 4 (PERMANENT DL)",
    sections: [
      {
        title: "1. APPLICANT & APPROVED LEARNER LICENCE PARTICULARS",
        fields: [
          ["Applicant Full Name", data.applicantName || "Demo Citizen"],
          ["Aadhaar Reference", data.aadhaarNumber || "9999 8888 7777"],
          ["PAN Reference", data.panNumber || "ABCDE1234F"],
          ["Approved LL Number", data.llNumber || "MH10/LL/2026/009841"],
          ["Jurisdiction RTO Office", data.rtoOffice || "MH-10 Sangli RTO"],
        ],
      },
      {
        title: "2. VEHICLE CATEGORIES & DECLARATION",
        fields: [
          ["Selected Vehicle Classes", (data.vehicleClasses || ["MCWG", "LMV"]).join(", ")],
          ["Form 1 Medical Fitness", data.medicalStatus || "Fit (Form 1 Self-Declaration Attested)"],
          ["Organ Donation Pledge", data.organDonation || "Yes (Pledged for Road Safety)"],
        ],
      },
      {
        title: "3. DRIVING TRACK COMPETENCE TEST APPOINTMENT",
        fields: [
          ["Assigned Testing Center", `${data.rtoOffice || "MH-10 Sangli RTO"} - Automated Sensor Driving Track`],
          ["Track Slot Schedule", data.slotTime || "02 Sep · 11:30 AM"],
          [
            "Candidate Instructions",
            "Bring original approved LL, vehicle with 'L' plate & this acknowledgement slip.",
          ],
        ],
      },
      {
        title: "4. STATUTORY FEES & TRANSACTION SUMMARY",
        fields: [
          ["Driving Track Competence Fee", "INR 200.00"],
          ["Form 7 PVC Smart Card Fee", "INR 200.00"],
          ["Total Amount Paid", data.feePaid || "INR 400.00 (Paid)"],
          ["Payment Transaction Ref", data.paymentRef || "TESTPAY-DL-894210"],
          [
            "Application Status",
            "Track Test Slot Booked - Biometrics & Skill Test Scheduled",
          ],
        ],
      },
    ],
    footerNote:
      "Form 4 Application under CMVR 1989 · Officially verified and digitally registered.",
  });

  triggerDownload(
    pdfDoc,
    `${data.applicationId || "Permanent-DL"}-Form4-Application.pdf`
  );
}
