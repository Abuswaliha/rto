"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Building,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Headset,
  HelpCircle,
  Landmark,
  Mail,
  MapPin,
  Phone,
  PhoneCall,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
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

const RTO_DIRECTORIES = [
  {
    code: "MH-10",
    name: "Sangli RTO Office",
    address: "Opp. District Court, Old Pune-Bangalore Road, Sangli 416416",
    phone: "+91 233 267 1144",
    email: "rto.mh10-mh@gov.in",
    timings: "09:30 AM – 05:30 PM (Mon–Fri)",
  },
  {
    code: "MH-09",
    name: "Kolhapur RTO Office",
    address: "Tarabai Park, Near Central Bus Stand, Kolhapur 416003",
    phone: "+91 231 265 2288",
    email: "rto.mh09-mh@gov.in",
    timings: "09:30 AM – 05:30 PM (Mon–Fri)",
  },
  {
    code: "MH-12",
    name: "Pune Regional Transport Office",
    address: "38, Dr. Ambedkar Road, Near Sangam Bridge, Pune 411001",
    phone: "+91 20 2605 8080",
    email: "rto.mh12-mh@gov.in",
    timings: "09:30 AM – 05:30 PM (Mon–Fri)",
  },
  {
    code: "MH-01",
    name: "Mumbai Central RTO",
    address: "Tardeo Road, Tulsiwadi, Mumbai 400034",
    phone: "+91 22 2353 4600",
    email: "rto.mh01-mh@gov.in",
    timings: "09:30 AM – 05:30 PM (Mon–Fri)",
  },
];

export function ContactPage() {
  const [name, setName] = useState("Demo Citizen");
  const [email, setEmail] = useState("citizen@example.com");
  const [phone, setPhone] = useState("9999999999");
  const [category, setCategory] = useState("Driving Licence (LL/DL) Query");
  const [appRef, setAppRef] = useState("SRTO-LL-2026-001284");
  const [message, setMessage] = useState("Need assistance with appointment slot timing and document requirements.");
  const [submitting, setSubmitting] = useState(false);
  const [ticketData, setTicketData] = useState<{
    ticketId: string;
    submittedAt: string;
  } | null>(null);

  function handleAutoFill() {
    setName("Demo Citizen");
    setEmail("citizen@example.com");
    setPhone("9999999999");
    setCategory("Driving Licence (LL/DL) Query");
    setAppRef("SRTO-LL-2026-001284");
    setMessage("Need assistance with appointment slot timing and document requirements.");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setSubmitting(true);
    setTimeout(() => {
      setTicketData({
        ticketId: `TKT-SRTO-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        submittedAt: new Date().toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
      setSubmitting(false);
    }, 600);
  }

  return (
    <PageShell>
      {/* Hero Header */}
      <section className="border-b border-[#dce8e5] bg-gradient-to-br from-[#f7fbfa] via-white to-[#edf7f4] py-10">
        <div className="mx-auto max-w-6xl px-6">
          <Badge variant="secondary" className="mb-2 gap-1.5 font-bold">
            <Headset size={14} className="text-[#167c74]" /> Citizen Support & Grievance Helpdesk
          </Badge>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#152321] md:text-3xl">
            Contact Smart RTO Helpdesk
          </h1>
          <p className="mt-1 max-w-2xl text-xs font-medium text-[#5e6f68] md:text-sm">
            Reach our regional transport helpdesks, connect with toll-free support, or submit an online query for driving licence, vehicle RC, and challan assistance.
          </p>
        </div>
      </section>

      {/* Main Support Grid */}
      <main className="mx-auto max-w-6xl px-6 py-10 space-y-10">
        {/* Quick Contact Numbers Banner */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="flex items-center gap-4 p-5 border-[#cfe3dd] bg-[#edf7f4]">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#167c74] text-white">
              <PhoneCall size={22} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0f7655]">
                Toll-Free Helpline
              </span>
              <strong className="block text-base font-extrabold text-[#152321]">
                1800-11-0001
              </strong>
              <span className="text-[11px] text-[#5e6f68]">08:00 AM – 08:00 PM (All Days)</span>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#ddf3ef] text-[#167c74]">
              <Mail size={22} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0f7655]">
                Email Assistance
              </span>
              <strong className="block text-sm font-extrabold text-[#152321]">
                support@smart-rto.gov.in
              </strong>
              <span className="text-[11px] text-[#5e6f68]">Responses within 24 business hours</span>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-5 border-[#fae2d7] bg-[#fffbf9]">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#a64524] text-white">
              <ShieldAlert size={22} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#a64524]">
                Emergency Road Helpline
              </span>
              <strong className="block text-base font-extrabold text-[#152321]">
                112 / 1073
              </strong>
              <span className="text-[11px] text-[#5e6f68]">National Highway Incident Response</span>
            </div>
          </Card>
        </div>

        {/* 2-Column Contact Form & RTO Directory */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_.9fr]">
          {/* Column 1: Online Support Request Form */}
          <div>
            {!ticketData ? (
              <Card className="p-6 space-y-5">
                <CardHeader className="p-0 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Submit a Support Inquiry</CardTitle>
                    <CardDescription>
                      Fill out the form below. A dedicated support officer will address your query.
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAutoFill}
                    className="gap-1 text-xs text-[#167c74]"
                  >
                    <Sparkles size={13} /> Auto-fill Demo
                  </Button>
                </CardHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="c-name">Your Full Name</Label>
                      <Input
                        id="c-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1.5"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="c-email">Email Address</Label>
                      <Input
                        id="c-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1.5"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="c-phone">Mobile Number</Label>
                      <Input
                        id="c-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1.5 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="c-ref">Application / Reference ID (Optional)</Label>
                      <Input
                        id="c-ref"
                        value={appRef}
                        onChange={(e) => setAppRef(e.target.value.toUpperCase())}
                        className="mt-1.5 font-mono"
                        placeholder="SRTO-LL-2026-001284"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="c-cat">Query Category</Label>
                    <Input
                      id="c-cat"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="c-msg">Description / Message</Label>
                    <textarea
                      id="c-msg"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-[#cfe3dd] bg-white p-3 text-xs outline-none focus:border-[#167c74] focus:ring-2 focus:ring-[#ddf3ef]"
                      required
                    />
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full gap-2 font-bold">
                    <Send size={16} /> {submitting ? "Submitting Request..." : "Submit Support Request"}
                  </Button>
                </form>
              </Card>
            ) : (
              <Card className="p-8 text-center space-y-5">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e7f4ed] text-[#0d5c45]">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[#152321]">
                    Support Request Registered!
                  </h3>
                  <p className="mt-1 text-xs text-[#5e6f68]">
                    Your inquiry has been routed to the respective RTO Division Helpdesk.
                  </p>
                </div>

                <div className="mx-auto max-w-sm rounded-2xl border border-[#cfe3dd] bg-[#edf7f4] p-4 text-xs text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#5e6f68]">Support Ticket ID:</span>
                    <strong className="font-mono text-[#152321]">{ticketData.ticketId}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5e6f68]">Submitted On:</span>
                    <strong className="text-[#152321]">{ticketData.submittedAt}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5e6f68]">Expected Resolution:</span>
                    <strong className="text-[#0d5c45]">Under 24 Business Hours</strong>
                  </div>
                </div>

                <Button variant="outline" onClick={() => setTicketData(null)}>
                  Submit Another Inquiry
                </Button>
              </Card>
            )}
          </div>

          {/* Column 2: Regional Transport Office Directory */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-base font-extrabold text-[#152321]">Regional RTO Directory</h3>
                <p className="text-xs text-[#5e6f68]">Official transport division headquarters</p>
              </div>
              <Badge variant="secondary">Maharashtra</Badge>
            </div>

            <div className="space-y-3">
              {RTO_DIRECTORIES.map((rto) => (
                <Card key={rto.code} className="p-4 space-y-2 transition-all hover:border-[#167c74]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Landmark size={16} className="text-[#167c74]" />
                      <strong className="text-sm font-bold text-[#152321]">{rto.name}</strong>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px] font-bold">
                      {rto.code}
                    </Badge>
                  </div>

                  <p className="flex items-start gap-1.5 text-xs text-[#5e6f68]">
                    <MapPin size={14} className="shrink-0 text-[#167c74] mt-0.5" />
                    <span>{rto.address}</span>
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-[11px] text-[#5e6f68]">
                    <span className="flex items-center gap-1 font-mono">
                      <Phone size={12} /> {rto.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock3 size={12} /> {rto.timings}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </PageShell>
  );
}
