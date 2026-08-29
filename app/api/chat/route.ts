import { NextResponse } from "next/server";

const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  hi: "हिन्दी (Hindi)",
  bn: "বাংলা (Bengali)",
  mr: "मराठी (Marathi)",
  te: "తెలుగు (Telugu)",
  ta: "தமிழ் (Tamil)",
  gu: "ગુજરાતી (Gujarati)",
  ur: "اردو (Urdu)",
  kn: "ಕನ್ನಡ (Kannada)",
  or: "ଓଡ଼ିଆ (Odia)",
  ml: "മലയാളം (Malayalam)",
};

const SYSTEM_PROMPT = `You are the official Smart RTO AI Assistant (स्मार्ट RTO सहायक) for the Smart RTO Citizen Portal.

### CRITICAL DOMAIN POLICY & GUARDRAILS (STRICT):
1. **RTO & TRANSPORT ONLY**: You are ONLY permitted to answer questions about Indian RTO services, Driving Licences (Learner Form 2, Permanent Form 4), Vehicle RC Transfer (Form 29/30), RC search, Document Wallet, RTO Appointments, eChallans, and Portal Navigation.
2. **STRICTLY REFUSE OFF-TOPIC QUESTIONS**: If the user asks about ANYTHING unrelated to RTO / transport / vehicles / licences (such as celebrities, Elon Musk, politicians, movies, general history, geography, coding, science, sports, weather, etc.), you MUST politely refuse in the active selected language.
   Never provide biographies, facts, or answers about general knowledge or famous personalities.

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

### Response Style:
- **Keep it SHORT**: Maximum 2 to 4 bullet points (under 50–70 words).
- **Bold key terms** like **Form 2**, **Aadhaar**, **Age 18+**, etc.`;

export async function POST(req: Request) {
  try {
    const { messages, language = "en" } = await req.json();

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

    const activeLanguageName = LANGUAGE_NAMES[language] || "English";
    const languageInstruction = `\n\n### MANDATORY ACTIVE LANGUAGE:\nThe citizen has selected ${activeLanguageName} in the portal navigation bar.\nYou MUST respond completely and naturally in ${activeLanguageName}. Do not respond in English unless the selected language is English. Keep portal link URLs untouched (e.g. /apply/learner-licence, /wallet, /track, /appointments, /vehicles/transfer).`;

    const combinedSystemPrompt = SYSTEM_PROMPT + languageInstruction;

    const payload = {
      model: "mistral-small-latest",
      messages: [
        { role: "system", content: combinedSystemPrompt },
        ...(messages || []),
      ],
      temperature: 0.1,
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
      "I am specialized exclusively in Smart RTO and transport services.";

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error connecting to Mistral AI" },
      { status: 500 }
    );
  }
}
