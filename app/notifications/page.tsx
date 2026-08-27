import { CalendarDays, FileCheck2, Info } from "lucide-react";
import { PageShell } from "@/components/page-shell";

export default function NotificationsPage() {
  return (
    <PageShell>
      <section className="border-b border-[#dce8e5] bg-gradient-to-b from-[#f7fbfa] to-[#edf7f4] py-12">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[#0f7655]">
            Your updates
          </p>
          <h1 className="my-2 text-3xl font-extrabold tracking-tight text-[#152321] md:text-5xl">
            Notifications
          </h1>
          <p className="max-w-xl text-sm font-medium text-[#5e6f68]">
            Clear, simulated updates about your application and appointment.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 py-12 space-y-4">
        <article className="flex gap-4 rounded-2xl border border-[#dce8e5] bg-white p-5 shadow-sm">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#ddf3ef] text-[#167c74]">
            <FileCheck2 size={22} />
          </div>
          <div>
            <strong className="block text-sm font-bold text-[#152321]">
              Document check complete
            </strong>
            <p className="mt-0.5 text-xs leading-relaxed text-[#5e6f68]">
              Your mock Learner Licence documents passed the demonstration quality check.
            </p>
            <small className="mt-2 block text-[11px] font-semibold text-[#0f7655]">
              Today · Demo
            </small>
          </div>
        </article>

        <article className="flex gap-4 rounded-2xl border border-[#dce8e5] bg-white p-5 shadow-sm">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#ddf3ef] text-[#167c74]">
            <CalendarDays size={22} />
          </div>
          <div>
            <strong className="block text-sm font-bold text-[#152321]">
              Appointment scheduled
            </strong>
            <p className="mt-0.5 text-xs leading-relaxed text-[#5e6f68]">
              Your fictional visit is booked for 29 August at 11:20 AM.
            </p>
            <small className="mt-2 block text-[11px] font-semibold text-[#0f7655]">
              Yesterday · Demo
            </small>
          </div>
        </article>

        <article className="flex gap-4 rounded-2xl border border-[#dce8e5] bg-white p-5 shadow-sm">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#fff1eb] text-[#e87343]">
            <Info size={22} />
          </div>
          <div>
            <strong className="block text-sm font-bold text-[#152321]">
              Prototype reminder
            </strong>
            <p className="mt-0.5 text-xs leading-relaxed text-[#5e6f68]">
              No notification here represents an official government update.
            </p>
            <small className="mt-2 block text-[11px] font-semibold text-[#a64524]">
              Safety notice
            </small>
          </div>
        </article>
      </div>
    </PageShell>
  );
}
