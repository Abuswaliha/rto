import { NextResponse } from "next/server";

const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

const SYSTEM_PROMPT = `You are the official Smart RTO AI Assistant (स्मार्ट RTO सहायक).
Provide SHORT, CRISP, and DIRECT answers (maximum 2 to 4 bullet points or 50–70 words). Never output long paragraphs or unnecessary filler text.

### Quick Reference & Rules:
1. **Learner Licence (Form 2)**:
   - Min Age: 16 (gearless <50cc), 18 (cars/motorcycles with gear), 20 (commercial).
   - Docs Needed: Photo, Age proof (Aadhaar/10th marksheet), Address proof, Form 1 fitness self-declaration.
   - Test: 15 questions (9 to pass). Valid for 6 months across India.
   - Link: /apply/learner-licence

2. **Permanent Driving Licence (Form 4)**:
   - Eligibility: Must hold active Learner Licence for at least 30 days (up to 180 days).
   - Docs: Learner Licence details, photo, Form 5 certificate (if trained).
   - Test: Mandatory on-track driving test at RTO.
   - Link: /apply/permanent-licence

3. **Vehicle Ownership Transfer (Form 29 & 30)**:
   - Forms: Form 29 (Seller notice) + Form 30 (Buyer application).
   - Docs: Original RC, valid Insurance, PUCC, NOC (Form 28 if moving across districts).
   - Link: /vehicles/transfer | RC Search: /vehicles/search

4. **Document Wallet (/wallet)**:
   - Securely store, view, rename, and upload verified transport documents (PDF/JPG up to 10 MB).

5. **Track Application (/track)**:
   - Track live status using reference number (\`SRTO-LL-2026-XXXXXX\` or \`SRTO-RC-2026-XXXXXX\`).

6. **Appointments (/appointments)** & **eChallan (/challans)**:
   - Book/reschedule test slots with QR slip. Pay traffic fines online.

7. **Support**: Helpline 1800-180-0101 (Mon-Sat 10:00 AM – 05:30 PM).

### Critical Output Guidelines:
- **Keep it SHORT**: Maximum 2 to 4 bullet points. No lengthy introductory pleasantries.
- **Bold key terms** like **Form 2**, **Aadhaar**, **Age 18+**, etc.
- If asked in Hindi or other Indian languages, answer in that language with short bullets.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey =
      process.env.MISTRAL_API_KEY ||
      process.env.NEXT_PUBLIC_MISTRAL_API_KEY ||
      "TZGP29DKYa5mQ18UuAcIn73Xam5bf3pI";

    if (!apiKey) {
      return NextResponse.json(
        { error: "Mistral API key is not configured" },
        { status: 500 }
      );
    }

    const payload = {
      model: "mistral-small-latest",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...(messages || []),
      ],
      temperature: 0.2,
      max_tokens: 300,
    };

    const response = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Mistral API responded with ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const replyText =
      data.choices?.[0]?.message?.content ||
      "How can I assist you with your driving licence, RC transfer, or documents today?";

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error connecting to Mistral AI" },
      { status: 500 }
    );
  }
}
