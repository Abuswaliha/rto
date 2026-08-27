import type { DemoApplication } from "./storage";
import { appointmentParts } from "./appointment";

function ascii(value: string) {
  return value.replace(/₹/g, "Rs ").replace(/[^\x20-\x7E]/g, "-");
}

function escapePdf(value: string) {
  return ascii(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrap(value: string, width = 86) {
  const words = ascii(value).split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (`${line} ${word}`.trim().length > width) {
      if (line) lines.push(line);
      line = word;
    } else line = `${line} ${word}`.trim();
  }
  if (line) lines.push(line);
  return lines;
}

function makePdf(lines: string[]) {
  const pages = Array.from({ length: Math.max(1, Math.ceil(lines.length / 44)) }, (_, index) => lines.slice(index * 44, index * 44 + 44));
  const fontId = 3 + pages.length * 2;
  const objects: string[] = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  const kids = pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ");
  objects[2] = `<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`;
  pages.forEach((page, index) => {
    const pageId = 3 + index * 2;
    const contentId = pageId + 1;
    const body = `BT\n/F1 10 Tf\n48 790 Td\n14 TL\n${page.map((line) => `(${escapePdf(line)}) Tj T*`).join("\n")}\nET`;
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId] = `<< /Length ${body.length} >>\nstream\n${body}\nendstream`;
  });
  objects[fontId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  let output = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (let id = 1; id <= fontId; id += 1) {
    offsets[id] = output.length;
    output += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xref = output.length;
  output += `xref\n0 ${fontId + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= fontId; id += 1) output += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  output += `trailer\n<< /Size ${fontId + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([output], { type: "application/pdf" });
}

function applicationLines(app: DemoApplication) {
  const slot = appointmentParts(app.appointment);
  return [
    "SMART RTO - DEMO APPLICATION ACKNOWLEDGEMENT",
    "DEMO ONLY - NOT A GOVERNMENT DOCUMENT",
    "",
    `Application number: ${app.id}`,
    `Status: Appointment scheduled`,
    `Submitted: ${new Date(app.submittedAt).toLocaleString("en-IN")}`,
    "",
    "APPLICANT INFORMATION",
    `Name: ${app.fullName}`,
    `Demo identity: ${app.identity || "Demo Aadhaar - XXXX 1234"}`,
    `Date of birth: ${app.dob || "Not recorded"}`,
    `Guardian: ${app.guardian || "Not recorded"}`,
    `Gender: ${app.gender || "Not recorded"}`,
    `Address: ${[app.address, app.city, app.pincode, app.state].filter(Boolean).join(", ")}`,
    `Vehicle category: ${app.vehicle || "Not recorded"}`,
    `RTO: ${app.rto}`,
    `Documents: ${(app.documents || []).join(", ") || "3 synthetic documents checked"}`,
    "",
    "QR APPOINTMENT SLIP",
    `[ DEMO QR: ${app.appointmentId || "APT-20037"} ]`,
    `Appointment ID: ${app.appointmentId || "APT-20037"}`,
    `Date and time: ${slot.longDate}`,
    `Day: ${slot.dayName}`,
    `Location: ${app.rto}`,
    "",
    "PAYMENT RECEIPT",
    `Payment reference: ${app.paymentReference || "TESTPAY-2026-483921"}`,
    `Method: ${app.paymentMethod || "Demo payment"}`,
    `Learner Licence fee: Rs 150 Demo`,
    `Service fee: Rs 20 Demo`,
    `Total paid: ${app.feeTotal || "Rs 170 Demo"}`,
    `Payment status: Simulated payment successful`,
    "",
    "This PDF contains fictional prototype information only. No real payment was made.",
  ].flatMap((line) => wrap(line));
}

export function downloadApplicationPdf(app: DemoApplication) {
  const url = URL.createObjectURL(makePdf(applicationLines(app)));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${app.id}-demo-acknowledgement.pdf`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadAppointmentPdf(app: DemoApplication) {
  const slot = appointmentParts(app.appointment);
  const lines = [
    "SMART RTO - QR APPOINTMENT SLIP",
    "DEMO ONLY - NOT A GOVERNMENT DOCUMENT",
    "",
    `[ DEMO QR: ${app.appointmentId || "APT-20037"} ]`,
    `Appointment ID: ${app.appointmentId || "APT-20037"}`,
    `Application: ${app.id}`,
    `Applicant: ${app.fullName}`,
    `Service: Learner test appointment`,
    `Date and time: ${slot.longDate}`,
    `Day: ${slot.dayName}`,
    `Location: ${app.rto}`,
    `Status: Confirmed - Demo`,
    "",
    "Fictional prototype appointment. This slip has no legal validity.",
  ].flatMap((line) => wrap(line));
  const url = URL.createObjectURL(makePdf(lines));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${app.appointmentId || "APT-20037"}-demo-appointment.pdf`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
