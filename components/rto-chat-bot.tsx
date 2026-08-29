"use client";

import { useState, useRef, useEffect } from "react";
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

const QUICK_PROMPTS: QuickPrompt[] = [
  { label: "📄 Learner Licence Docs", query: "What documents are required for Learner Licence?" },
  { label: "🪪 Permanent DL Steps", query: "How to apply for Permanent Driving Licence?" },
  { label: "🚗 Vehicle RC Transfer", query: "How to transfer vehicle ownership Form 29 30?" },
  { label: "📁 Upload Documents", query: "Where do I upload documents in wallet?" },
  { label: "🔍 Track Application", query: "How do I check my application status?" },
  { label: "⏱️ Book RTO Slot", query: "How to book an appointment slot?" },
  { label: "💳 Pay eChallan", query: "How to pay traffic challan?" },
];

function extractContextualActions(text: string): ChatAction[] {
  const lower = text.toLowerCase();
  const actions: ChatAction[] = [];

  if (lower.includes("learner") || lower.includes("form 2") || lower.includes("/apply/learner-licence")) {
    actions.push({ label: "Apply Learner Licence", href: "/apply/learner-licence", icon: FileText });
  }
  if (lower.includes("permanent") || lower.includes("form 4") || lower.includes("/apply/permanent-licence")) {
    actions.push({ label: "Apply Permanent DL", href: "/apply/permanent-licence", icon: IdCard });
  }
  if (lower.includes("transfer") || lower.includes("form 29") || lower.includes("form 30") || lower.includes("/vehicles/transfer")) {
    actions.push({ label: "Vehicle Transfer", href: "/vehicles/transfer", icon: Car });
  }
  if (lower.includes("search") || lower.includes("rc search") || lower.includes("/vehicles/search")) {
    actions.push({ label: "Search RC", href: "/vehicles/search", icon: Search });
  }
  if (lower.includes("wallet") || lower.includes("document") || lower.includes("upload") || lower.includes("/wallet")) {
    actions.push({ label: "Open Wallet", href: "/wallet", icon: WalletCards });
  }
  if (lower.includes("track") || lower.includes("status") || lower.includes("srto-") || lower.includes("/track")) {
    actions.push({ label: "Track Status", href: "/track", icon: Search });
  }
  if (lower.includes("appointment") || lower.includes("slot") || lower.includes("visit") || lower.includes("/appointments")) {
    actions.push({ label: "Book Slot", href: "/appointments", icon: CalendarDays });
  }
  if (lower.includes("challan") || lower.includes("fine") || lower.includes("/challans")) {
    actions.push({ label: "Pay Challan", href: "/challans", icon: WalletCards });
  }

  return actions.slice(0, 2);
}

function getShortFallbackReply(rawQuery: string): { text: string; actions?: ChatAction[]; tags?: string[] } {
  const query = rawQuery.toLowerCase().trim();

  if (query.includes("learner") || query.includes("learning") || query.includes("ll") || (query.includes("form 2") && !query.includes("form 29"))) {
    return {
      text: `**Learner Licence (Form 2):**\n• **Age:** 16 (gearless <50cc), 18 (cars/bikes), 20 (commercial).\n• **Docs:** Photo, Aadhaar (Age & Address proof), Form 1 self-declaration.\n• **Test:** 15 questions (9 to pass). Valid for 6 months across India.`,
      actions: [
        { label: "Apply Learner Licence", href: "/apply/learner-licence", icon: FileText },
        { label: "Open Document Wallet", href: "/wallet", icon: WalletCards },
      ],
      tags: ["Form 2", "Age 18+", "15 Qs Test"],
    };
  }

  if (query.includes("permanent") || query.includes("driving licence") || query.includes("driving license") || query.includes("dl") || query.includes("form 4")) {
    return {
      text: `**Permanent DL (Form 4):**\n• **Prerequisite:** Active Learner Licence held for 30–180 days.\n• **Docs:** Learner Licence, photo, Form 5 certificate (if trained).\n• **Test:** Mandatory on-track driving skill test at RTO.`,
      actions: [
        { label: "Apply Permanent DL", href: "/apply/permanent-licence", icon: IdCard },
      ],
      tags: ["Form 4", "30 Days after LL", "Track Test"],
    };
  }

  if (query.includes("transfer") || query.includes("vehicle transfer") || query.includes("ownership") || query.includes("form 29") || query.includes("form 30")) {
    return {
      text: `**Vehicle RC Transfer (Form 29 & 30):**\n• **Forms:** Form 29 (Seller notice) + Form 30 (Buyer application).\n• **Docs:** Original RC, valid Insurance, PUCC, NOC Form 28 (if other RTO).`,
      actions: [
        { label: "Start Vehicle Transfer", href: "/vehicles/transfer", icon: Car },
        { label: "Search Vehicle RC", href: "/vehicles/search", icon: Search },
      ],
      tags: ["Form 29 & 30", "RC Booklet", "Insurance"],
    };
  }

  if (query.includes("document") || query.includes("docs") || query.includes("wallet") || query.includes("upload")) {
    return {
      text: `**Document Requirements & Wallet:**\n• **Accepted IDs:** Aadhaar, Passport, Voter ID, Utility bill.\n• **Digital Wallet:** Store, view, and upload verified credentials (up to 10 MB).`,
      actions: [
        { label: "Open Document Wallet", href: "/wallet", icon: WalletCards },
      ],
      tags: ["Aadhaar", "Photo", "Digital Locker"],
    };
  }

  if (query.includes("track") || query.includes("status") || query.includes("srto-")) {
    return {
      text: `**Application Tracking:**\n• Enter your reference number (\`SRTO-LL-2026-XXXXXX\` or \`SRTO-RC-2026-XXXXXX\`) to check real-time progress and download approval PDFs.`,
      actions: [
        { label: "Track Application", href: "/track", icon: Search },
      ],
      tags: ["SRTO Reference", "Real-Time"],
    };
  }

  // Off-topic or non-RTO questions
  const isOffTopic =
    query.includes("who is") ||
    query.includes("elon") ||
    query.includes("musk") ||
    query.includes("weather") ||
    query.includes("movie") ||
    query.includes("song") ||
    query.includes("capital of") ||
    query.includes("president") ||
    query.includes("sports") ||
    query.includes("cricket");

  if (isOffTopic) {
    return {
      text: `I am specialized exclusively in **Smart RTO & Transport Services**.\n• Please ask questions about Driving Licences, Vehicle Transfers, Documents, or Slot Booking.`,
      actions: [
        { label: "Learner Licence", href: "/apply/learner-licence", icon: FileText },
        { label: "Vehicle Transfer", href: "/vehicles/transfer", icon: Car },
        { label: "Document Wallet", href: "/wallet", icon: WalletCards },
      ],
      tags: ["RTO Only"],
    };
  }

  return {
    text: `**Smart RTO Assistant:**\n• **Licences:** Form 2 (Learner) & Form 4 (Permanent DL).\n• **Vehicles:** Form 29/30 (Transfer) & RC Search.\n• **Tools:** Document Wallet & Live Application Tracking.`,
    actions: [
      { label: "Learner Licence", href: "/apply/learner-licence", icon: FileText },
      { label: "Document Wallet", href: "/wallet", icon: WalletCards },
      { label: "Track Status", href: "/track", icon: Search },
    ],
    tags: ["Services", "Short Guide"],
  };
}

export function RtoChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputQuery, setInputQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "msg-init",
      sender: "bot",
      text: "Namaste! I am your **Smart RTO Assistant**.\nAsk me anything about licences, vehicle transfers, documents, or navigation.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      actions: [
        { label: "Learner Licence", href: "/apply/learner-licence", icon: FileText },
        { label: "Vehicle Transfer", href: "/vehicles/transfer", icon: Car },
        { label: "Document Wallet", href: "/wallet", icon: WalletCards },
      ],
      tags: ["Mistral AI", "Quick Guide"],
    },
  ]);

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
        body: JSON.stringify({ messages: historyPayload }),
      });

      if (res.ok) {
        const data = await res.json();
        const replyText = data.reply || "";
        const actions = extractContextualActions(replyText + " " + text);

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
      const localReply = getShortFallbackReply(text);
      const botMessage: MessageItem = {
        id: `msg-${Date.now()}-bot`,
        sender: "bot",
        text: localReply.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actions: localReply.actions,
        tags: localReply.tags,
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
        text: "Conversation cleared. How can I help you today?",
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
                  {QUICK_PROMPTS.map((prompt, idx) => (
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
