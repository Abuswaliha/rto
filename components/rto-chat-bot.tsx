"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "./safe-link";
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  ChevronRight,
  FileText,
  IdCard,
  Car,
  WalletCards,
  CalendarDays,
  Search,
  RotateCcw,
  Minimize2,
  Maximize2,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MessageScroller,
  Message,
  MessageAvatar,
  Bubble,
  Marker,
} from "@/components/ui/chat";
import { Separator } from "@/components/ui/separator";
import { useLanguage, type LanguageCode } from "./language-provider";

interface ChatAction {
  label: string;
  href: string;
  icon?: any;
}

interface MessageItem {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  actions?: ChatAction[];
  tags?: string[];
}

interface QuickPrompt {
  label: string;
  query: string;
}

const I18N_GREETINGS: Record<LanguageCode, string> = {
  en: "Namaste! I am your **Smart RTO Assistant**.\nAsk me anything about licences, vehicle transfers, documents, or navigation.",
  hi: "नमस्ते! मैं आपका **स्मार्ट RTO सहायक** हूँ।\nड्राइविंग लाइसेंस, वाहन ट्रांसफर, दस्तावेज़ों या पोर्टल नेविगेशन के बारे में कुछ भी पूछें।",
  bn: "নমস্কার! আমি আপনার **স্মার্ট আরটিও সহকারী**।\nলাইসেন্স, গাড়ির মালিকানা বদল, বা প্রয়োজনীয় নথিপত্র সম্পর্কে যেকোনো প্রশ্ন জিজ্ঞাসা করুন।",
  mr: "नमस्कार! मी आपला **स्मार्ट RTO सहाय्यक** आहे.\nड्रायव्हिंग लायसन्स, वाहन ट्रान्सफर, कागदपत्रे किंवा पोर्टल नेव्हिगेशनबद्दल मला विचारा.",
  te: "నమస్కారం! నేను మీ **స్మార్ట్ RTO అసిస్టెంట్**.\nడ్రైవింగ్ లైసెన్స్, వాహన బదిలీ, పత్రాలు లేదా సేవల గురించి నన్ను అడగండి.",
  ta: "வணக்கம்! நான் உங்கள் **ஸ்மார்ட் RTO உதவியாளர்**.\nஓட்டுநர் உரிமம், வாகன பெயர் மாற்றம், ஆவணங்கள் அல்லது சேவைகள் பற்றி என்னிடம் கேளுங்கள்.",
  gu: "નમસ્તે! હું તમારો **સ્માર્ટ RTO સહાયક** છું.\nડ્રાઇવિંગ લાયસન્સ, વાહન ટ્રાન્સફર, દસ્તાવેજો અથવા સેવાઓ વિશે કોઈપણ પ્રશ્ન પૂછો.",
  ur: "نمستے! میں آپ کا **اسمارٹ آر ٹی او اسسٹنٹ** ہوں۔\nڈرائیونگ لائسنس، گاڑی کی منتقلی، دستاویزات، یا خدمات کے بارے میں بلا جھجھک پوچھیں۔",
  kn: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ **ಸ್ಮಾರ್ಟ್ RTO ಸಹಾಯಕ**.\nಡ್ರೈವಿಂಗ್ ಲೈಸೆನ್ಸ್, ವಾಹನ ವರ್ಗಾವಣೆ, ದಾಖಲೆಗಳು ಅಥವಾ ಸೇವೆಗಳ ಬಗ್ಗೆ ನನ್ನನ್ನು ಕೇಳಿ.",
  or: "ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କର **ସ୍ମାର୍ଟ RTO ସହାୟକ**।\nଡ୍ରାଇଭିଂ ଲାଇସେନ୍ସ, ଗାଡ଼ି ଟ୍ରାନ୍ସଫର, ଦସ୍ତାବିଜ୍ ବାବଦରେ ଯାହା ପଚାରିବାକୁ ଚାହାଁନ୍ତି ପଚାରନ୍ତୁ।",
  ml: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ **സ്മാർട്ട് ആർ‌ടി‌ഒ അസിസ്റ്റന്റ്** ആണ്.\nഡ്രൈവിംഗ് ലൈസൻസ്, വാഹന കൈമാറ്റം, രേഖകൾ അല്ലെങ്കിൽ സേവനങ്ങളെക്കുറിച്ച് എന്നോട് ചോദിക്കാം.",
};

const I18N_PROMPTS: Record<LanguageCode, QuickPrompt[]> = {
  en: [
    { label: "📄 Learner Licence Docs", query: "What documents are required for Learner Licence?" },
    { label: "🪪 Permanent DL Steps", query: "How to apply for Permanent Driving Licence?" },
    { label: "🚗 Vehicle RC Transfer", query: "How to transfer vehicle ownership Form 29 30?" },
    { label: "📁 Upload Documents", query: "Where do I upload documents in wallet?" },
    { label: "🔍 Track Application", query: "How do I check my application status?" },
    { label: "⏱️ Book RTO Slot", query: "How to book an appointment slot?" },
    { label: "💳 Pay eChallan", query: "How to pay traffic challan?" },
  ],
  hi: [
    { label: "📄 लर्नर लाइसेंस दस्तावेज़", query: "लर्नर लाइसेंस (Form 2) के लिए क्या दस्तावेज़ चाहिए?" },
    { label: "🪪 पक्का DL कैसे बनवाएं", query: "परमानेंट ड्राइविंग लाइसेंस (Form 4) कैसे आवेदन करें?" },
    { label: "🚗 वाहन नाम ट्रांसफर", query: "वाहन ट्रांसफर फॉर्म 29 और 30 प्रक्रिया क्या है?" },
    { label: "📁 दस्तावेज़ वॉलेट", query: "वॉलेट में दस्तावेज़ कैसे अपलोड करें?" },
    { label: "🔍 आवेदन ट्रैक करें", query: "आवेदन की स्थिति कैसे चेक करें?" },
    { label: "⏱️ RTO स्लॉट बुक करें", query: "RTO अपॉइंटमेंट स्लॉट कैसे बुक करें?" },
  ],
  bn: [
    { label: "📄 লার্নার লাইসেন্স নথি", query: "লার্নার লাইসেন্স পেতে কি কি নথি লাগবে?" },
    { label: "🪪 ড্রাইভিং লাইসেন্স আবেদন", query: "স্থায়ী ড্রাইভিং লাইসেন্স কীভাবে করব?" },
    { label: "🚗 গাড়ি ট্রান্সফার", query: "গাড়ির মালিকানা বদল ফর্ম ২৯ ও ৩০ কীভাবে করবেন?" },
    { label: "🔍 আবেদন ট্র্যাক", query: "আবেদনের স্ট্যাটাস কীভাবে দেখব?" },
  ],
  mr: [
    { label: "📄 लर्निंग लायसन्स कागदपत्रे", query: "लर्निंग लायसन्ससाठी कोणती कागदपत्रे लागतात?" },
    { label: "🪪 पक्के ड्रायव्हिंग लायसन्स", query: "पक्के ड्रायव्हिंग लायसन्स कसे काढावे?" },
    { label: "🚗 वाहन मालकी ट्रान्सफर", query: "गाडी मालकी हस्तांतरण फॉर्म २९ आणि ३० कसे करावे?" },
    { label: "🔍 अर्ज ट्रॅक करा", query: "माझ्या अर्जाची स्थिती कशी तपासावी?" },
  ],
  te: [
    { label: "📄 లెర్నర్ లైసెన్స్ పత్రాలు", query: "లెర్నర్ లైసెన్స్‌కు ఏ పత్రాలు అవసరం?" },
    { label: "🪪 పర్మనెంట్ DL ప్రక్రియ", query: "శాశ్వత డ్రైవింగ్ లైసెన్స్ కోసం ఎలా దరఖాస్తు చేయాలి?" },
    { label: "🚗 వాహన బదిలీ ఫారం 29 & 30", query: "వాహన యాజమాన్య బదిలీ ఎలా చేయాలి?" },
    { label: "🔍 అప్లికేషన్ ట్రాక్", query: "నా దరఖాస్తు స్థితిని ఎలా తనిఖీ చేయాలి?" },
  ],
  ta: [
    { label: "📄 பழகுநர் உரிம ஆவணங்கள்", query: "பழகுநர் உரிமத்திற்கு தேவையான ஆவணங்கள் என்ன?" },
    { label: "🪪 ஓட்டுநர் உரிமம் பெற", query: "நிரந்தர ஓட்டுநர் உரிமம் பெறுவது எப்படி?" },
    { label: "🚗 வாகன பெயர் மாற்றம்", query: "வாகன பெயர் மாற்றம் படிவம் 29 & 30 செய்வது எப்படி?" },
    { label: "🔍 நிலை அறிய", query: "விண்ணப்ப நிலையை எவ்வாறு அறிவது?" },
  ],
  gu: [
    { label: "📄 લર્નર લાયસન્સ દસ્તાવેજ", query: "લર્નર લાયસન્સ માટે કયા દસ્તાવેજો જોઈએ?" },
    { label: "🪪 પાકું ડ્રાઇવિંગ લાયસન્સ", query: "પાકું લાયસન્સ કેવી રીતે મેળવવું?" },
    { label: "🚗 વાહન ટ્રાન્સફર", query: "વાહન માલિકી ટ્રાન્સફર કેવી રીતે કરવું?" },
    { label: "🔍 અરજી ટ્રેક કરો", query: "અરજીનું સ્ટેટસ કેવી રીતે ચેક કરવું?" },
  ],
  ur: [
    { label: "📄 لرنر لائسنس کے کاغذات", query: "لرنر لائسنس کے لیے کون سی دستاویزات درکار ہیں؟" },
    { label: "🪪 پرماننٹ ڈرائیونگ لائسنس", query: "مستقل ڈرائیونگ لائسنس کے لیے کیسے درخواست دیں؟" },
    { label: "🚗 گاڑی ٹرانسفر", query: "گاڑی کی منتقلی فارم 29 اور 30 کیسے کریں؟" },
  ],
  kn: [
    { label: "📄 ಲರ್ನರ್ ಲೈಸೆನ್ಸ್ ದಾಖಲೆಗಳು", query: "ಲರ್ನರ್ ಲೈಸೆನ್ಸ್‌ಗೆ ಯಾವ ದಾಖಲೆಗಳು ಬೇಕು?" },
    { label: "🪪 ಪರ್ಮನೆಂಟ್ DL ಅರ್ಜಿ", query: "ಶಾಶ್ವತ ಡ್ರೈವಿಂಗ್ ಲೈಸೆನ್ಸ್ ಹೇಗೆ ಪಡೆಯುವುದು?" },
    { label: "🚗 ವಾಹನ ವರ್ಗಾವಣೆ", query: "ವಾಹನ ಮಾಲೀಕತ್ವ ವರ್ಗಾವಣೆ ಹೇಗೆ ಮಾಡುವುದು?" },
  ],
  or: [
    { label: "📄 ଲର୍ନର୍ ଲାଇସେନ୍ସ ଦସ୍ତାବିଜ୍", query: "ଲର୍ନର ଲାଇସେନ୍ସ ପାଇଁ କଣ ଦସ୍ତାବିଜ୍ ଆବଶ୍ୟକ?" },
    { label: "🪪 ସ୍ଥାୟୀ DL ଆବେଦନ", query: "ସ୍ଥାୟୀ ଡ୍ରାଇଭିଂ ଲାଇସେନ୍ସ କିପରି କରିବେ?" },
    { label: "🚗 ଗାଡ଼ି ଟ୍ରାନ୍ସଫର", query: "ଗାଡି ମାଲିକାନା ଟ୍ରାନ୍ସଫର କିପରି କରିବେ?" },
  ],
  ml: [
    { label: "📄 ലേണേഴ്‌സ് ലൈസൻസ് രേഖകൾ", query: "ലേണേഴ്‌സ് ലൈസൻസിന് ആവശ്യമായ രേഖകൾ എന്തൊക്കെയാണ്?" },
    { label: "🪪 ഡ്രൈവിംഗ് ലൈസൻസ് എടുക്കാൻ", query: "സ്ഥിര ഡ്രൈവിംഗ് ലൈസൻസ് എങ്ങനെ അപേക്ഷിക്കാം?" },
    { label: "🚗 വാഹന ഉടമസ്ഥാവകാശ മാറ്റം", query: "വാഹന ഉടമസ്ഥാവകാശം മാറ്റുന്നത് എങ്ങനെ?" },
  ],
};

function extractContextualActions(query: string, reply: string): ChatAction[] {
  const findAction = (text: string): ChatAction | undefined => {
    const lower = text.toLowerCase();

    // Check specific services before prerequisites mentioned in the AI response.
    if (lower.includes("permanent") || lower.includes("form 4") || lower.includes("/apply/permanent-licence") || lower.includes("पक्का") || lower.includes("स्थायी")) {
      return { label: "Apply Permanent DL", href: "/apply/permanent-licence", icon: IdCard };
    }
    if (lower.includes("learner") || lower.includes("form 2") || lower.includes("/apply/learner-licence") || lower.includes("लर्नर")) {
      return { label: "Apply Learner Licence", href: "/apply/learner-licence", icon: FileText };
    }
    if (lower.includes("transfer") || lower.includes("form 29") || lower.includes("form 30") || lower.includes("/vehicles/transfer") || lower.includes("ट्रांसफर")) {
      return { label: "Vehicle Transfer", href: "/vehicles/transfer", icon: Car };
    }
    if (lower.includes("rc") || lower.includes("registration") || lower.includes("vehicle number") || lower.includes("/vehicles/search")) {
      return { label: "Search RC", href: "/vehicles/search", icon: Search };
    }
    if (lower.includes("challan") || lower.includes("fine") || lower.includes("/challans") || lower.includes("चालान")) {
      return { label: "Pay Challan", href: "/challans", icon: WalletCards };
    }
    if (lower.includes("grievance") || lower.includes("complaint") || lower.includes("issue") || lower.includes("/grievance")) {
      return { label: "Raise a Grievance", href: "/grievance", icon: HelpCircle };
    }
    if (lower.includes("wallet") || lower.includes("/wallet") || lower.includes("वॉलेट")) {
      return { label: "Open Wallet", href: "/wallet", icon: WalletCards };
    }
    if (lower.includes("track") || lower.includes("application status") || lower.includes("srto-") || lower.includes("/track") || lower.includes("ट्रैक")) {
      return { label: "Track Status", href: "/track", icon: Search };
    }
    if (lower.includes("appointment") || lower.includes("slot") || lower.includes("/appointments") || lower.includes("अपॉइंटमेंट")) {
      return { label: "Book Slot", href: "/appointments", icon: CalendarDays };
    }
  };

  // The question is the reliable signal; only use the reply when no service was requested.
  const action = findAction(query) || findAction(reply);
  return action ? [action] : [];
}

export function RtoChatBot() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const initialGreeting = useMemo(() => {
    return I18N_GREETINGS[language] || I18N_GREETINGS.en;
  }, [language]);

  const quickPrompts = useMemo(() => {
    return I18N_PROMPTS[language] || I18N_PROMPTS.en;
  }, [language]);

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "msg-init",
      sender: "bot",
      text: initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      actions: [
        { label: "Learner Licence", href: "/apply/learner-licence", icon: FileText },
        { label: "Vehicle Transfer", href: "/vehicles/transfer", icon: Car },
        { label: "Document Wallet", href: "/wallet", icon: WalletCards },
      ],
      tags: ["Mistral AI", "Quick Guide"],
    },
  ]);

  // Update initial message if empty or user switches language
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === "msg-init") {
        return [
          {
            id: "msg-init",
            sender: "bot",
            text: initialGreeting,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            actions: [
              { label: "Learner Licence", href: "/apply/learner-licence", icon: FileText },
              { label: "Vehicle Transfer", href: "/vehicles/transfer", icon: Car },
              { label: "Document Wallet", href: "/wallet", icon: WalletCards },
            ],
            tags: ["Mistral AI", "Quick Guide"],
          },
        ];
      }
      return prev;
    });
  }, [initialGreeting]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMinimized]);

  async function handleSend(textToSend?: string) {
    const text = (textToSend || inputQuery).trim();
    if (!text) return;

    const userMessage: MessageItem = {
      id: `msg-${Date.now()}-user`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery("");
    setIsTyping(true);

    try {
      const historyPayload = messages
        .concat(userMessage)
        .slice(-5)
        .map((m) => ({
          role: m.sender === "bot" ? "assistant" : "user",
          content: m.text,
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyPayload, language }),
      });

      if (res.ok) {
        const data = await res.json();
        const replyText = data.reply || "";
        const actions = extractContextualActions(text, replyText);

        const botMessage: MessageItem = {
          id: `msg-${Date.now()}-bot`,
          sender: "bot",
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          actions: actions.length > 0 ? actions : undefined,
          tags: ["Mistral AI"],
        };

        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error("Mistral API error");
      }
    } catch {
      const botMessage: MessageItem = {
        id: `msg-${Date.now()}-bot`,
        sender: "bot",
        text: initialGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actions: [
          { label: "Learner Licence", href: "/apply/learner-licence", icon: FileText },
          { label: "Document Wallet", href: "/wallet", icon: WalletCards },
        ],
        tags: ["Local Guide"],
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleClearChat() {
    setMessages([
      {
        id: `msg-${Date.now()}-reset`,
        sender: "bot",
        text: initialGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actions: [
          { label: "Learner Licence", href: "/apply/learner-licence", icon: FileText },
          { label: "Vehicle Transfer", href: "/vehicles/transfer", icon: Car },
          { label: "Document Wallet", href: "/wallet", icon: WalletCards },
        ],
      },
    ]);
  }

  return (
    <div className="fixed bottom-[74px] right-3 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end print:hidden">
      {/* Floating Chat Trigger Button with Shadcn Button */}
      {!isOpen && (
        <Button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex h-11 sm:h-12 items-center gap-2 sm:gap-2.5 rounded-full bg-gradient-to-r from-[#167c74] to-[#0e5c56] px-3.5 sm:px-4.5 py-2 text-white shadow-xl shadow-[#167c74]/25 hover:scale-105 hover:shadow-2xl hover:shadow-[#167c74]/40 active:scale-95 transition-all duration-300 border-0"
          aria-label="Open Smart RTO Assistant Chatbot"
        >
          <span className="relative grid h-6 w-6 sm:h-7 sm:w-7 place-items-center rounded-full bg-white/20">
            <Bot size={16} className="transition-transform group-hover:rotate-12" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#167c74] animate-pulse" />
          </span>
          <span className="text-[11px] sm:text-xs font-bold tracking-tight">Ask RTO Assistant</span>
          <Sparkles size={12} className="text-amber-300" />
        </Button>
      )}

      {/* Shadcn Card Floating Chat Modal */}
      {isOpen && (
        <Card
          className={`flex w-[calc(100vw-24px)] sm:w-[390px] max-w-[400px] flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-[#cfe3dd] bg-white shadow-2xl transition-all duration-300 p-0 gap-0 ${
            isMinimized ? "h-14 sm:h-15" : "h-[min(520px,calc(100dvh-140px))] max-h-[82vh]"
          }`}
          role="dialog"
          aria-label="Smart RTO Assistant Chatbot"
        >
          {/* Card Header */}
          <CardHeader className="flex h-14 sm:h-15 shrink-0 flex-row items-center justify-between border-b border-[#146b64] bg-gradient-to-r from-[#167c74] via-[#126b64] to-[#0c4e48] px-3.5 sm:px-4 py-0 text-white space-y-0">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <MessageAvatar fallback={<Bot size={15} className="text-white" />} className="h-7 w-7 sm:h-8 sm:w-8 bg-white/15 ring-1 ring-white/20 text-white" />
              <div>
                <CardTitle className="m-0 text-[11px] sm:text-xs font-extrabold tracking-tight text-white flex items-center gap-1 sm:gap-1.5">
                  Smart RTO Assistant
                  <Badge variant="secondary" className="bg-amber-400/25 text-amber-100 text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0 border-0 flex items-center gap-0.5">
                    <Sparkles size={8} className="text-amber-300" /> Mistral AI
                  </Badge>
                </CardTitle>
                <p className="m-0 text-[9px] sm:text-[10px] text-emerald-100/90 font-medium">Quick transport & licence guide</p>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClearChat}
                title="Clear conversation"
                className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-100 hover:bg-white/15 hover:text-white"
                aria-label="Clear chat"
              >
                <RotateCcw size={12} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized((v) => !v)}
                title={isMinimized ? "Expand" : "Minimize"}
                className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-100 hover:bg-white/15 hover:text-white"
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                {isMinimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-100 hover:bg-white/20 hover:text-white"
                aria-label="Close chat"
              >
                <X size={14} />
              </Button>
            </div>
          </CardHeader>

          {/* Chat Body with MessageScroller */}
          {!isMinimized && (
            <>
              <MessageScroller autoScroll className="bg-[#f8faf9]">
                {/* Marker */}
                <Marker>
                  <ShieldCheck size={11} className="text-[#167c74]" />
                  <span>Instant short answers · Powered by Mistral AI</span>
                </Marker>

                {/* Messages Feed */}
                {messages.map((msg) => (
                  <Message
                    key={msg.id}
                    from={msg.sender === "user" ? "user" : "assistant"}
                  >
                    {msg.sender === "bot" ? (
                      <MessageAvatar fallback={<Bot size={13} />} className="h-6 w-6 mt-0.5" />
                    ) : (
                      <MessageAvatar fallback={<User size={13} />} className="h-6 w-6 mt-0.5 bg-[#167c74] text-white" />
                    )}

                    <div className="flex flex-col gap-1">
                      <Bubble variant={msg.sender === "user" ? "primary" : "default"}>
                        <div className="whitespace-pre-line text-xs font-normal">
                          {msg.text.split("\n").map((line, i) => {
                            if (line.includes("**")) {
                              const parts = line.split(/(\*\*.*?\*\*)/);
                              return (
                                <p key={i} className="m-0 mb-1 last:mb-0">
                                  {parts.map((p, j) => {
                                    if (p.startsWith("**") && p.endsWith("**")) {
                                      return (
                                        <strong key={j} className="font-extrabold text-[#11201d]">
                                          {p.slice(2, -2)}
                                        </strong>
                                      );
                                    }
                                    return <span key={j}>{p}</span>;
                                  })}
                                </p>
                              );
                            }
                            return (
                              <p key={i} className="m-0 mb-1 last:mb-0">
                                {line}
                              </p>
                            );
                          })}
                        </div>

                        {/* Short Action Buttons */}
                        {msg.actions && msg.actions.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1.5 pt-2 border-t border-[#eaf2ef]">
                            {msg.actions.map((act) => {
                              const Icon = act.icon || ChevronRight;
                              return (
                                <Button
                                  key={act.href}
                                  variant="secondary"
                                  size="sm"
                                  className="h-7 text-[11px] font-bold text-[#167c74] bg-[#edf7f4] hover:bg-[#167c74] hover:text-white px-2.5 py-0 rounded-lg gap-1 border border-[#cfe3dd]"
                                  asChild
                                >
                                  <Link href={act.href} onClick={() => setIsOpen(false)}>
                                    <Icon size={12} />
                                    {act.label}
                                  </Link>
                                </Button>
                              );
                            })}
                          </div>
                        )}

                        {/* Keyword Tags */}
                        {msg.tags && msg.tags.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {msg.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="bg-[#eef7f4] text-[#1a5b51] border-0 text-[9px] px-1.5 py-0 font-semibold"
                              >
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </Bubble>
                      <span className={`px-1 text-[9px] text-[#71877e] ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </Message>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <Message from="assistant">
                    <MessageAvatar fallback={<Bot size={13} />} className="h-6 w-6" />
                    <Bubble variant="default" className="py-2 px-3">
                      <span className="text-[10px] font-medium text-[#5e6f68] flex items-center gap-1">
                        Thinking
                        <span className="h-1 w-1 rounded-full bg-[#167c74] animate-bounce [animation-delay:-0.3s]" />
                        <span className="h-1 w-1 rounded-full bg-[#167c74] animate-bounce [animation-delay:-0.15s]" />
                        <span className="h-1 w-1 rounded-full bg-[#167c74] animate-bounce" />
                      </span>
                    </Bubble>
                  </Message>
                )}
              </MessageScroller>

              {/* Quick Prompts Bar */}
              <div className="border-t border-[#e5eeea] bg-[#ffffff] p-2">
                <div className="mb-1 flex items-center justify-between px-1 text-[10px] font-bold text-[#62776f]">
                  <span className="flex items-center gap-1">
                    <HelpCircle size={10} className="text-[#167c74]" /> Quick Prompts
                  </span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {quickPrompts.map((prompt, idx) => (
                    <Button
                      key={idx}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSend(prompt.query)}
                      className="h-6 shrink-0 rounded-full border-[#cfe3dd] bg-[#f7fbf9] px-2.5 text-[10px] font-medium text-[#2d4941] hover:border-[#167c74] hover:bg-[#eaf4ef] hover:text-[#167c74]"
                    >
                      {prompt.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Chat Input Footer */}
              <Separator />
              <CardFooter className="p-2.5 bg-white">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex w-full items-center gap-2"
                >
                  <Input
                    ref={inputRef}
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder="Ask a question..."
                    className="h-9 flex-1 rounded-xl border border-[#cfe3dd] bg-[#f8faf9] px-3 text-xs text-[#152321] placeholder:text-[#889a93] focus-visible:ring-[#167c74]/20"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!inputQuery.trim() || isTyping}
                    className="h-9 w-9 shrink-0 rounded-xl bg-[#167c74] text-white shadow-sm hover:bg-[#126b64] disabled:opacity-40"
                    aria-label="Send message"
                  >
                    <Send size={14} />
                  </Button>
                </form>
              </CardFooter>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
