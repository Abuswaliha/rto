import Link from "./safe-link";
import { ArrowRight, BookOpenCheck, CheckCircle2 } from "lucide-react";
import { PageShell } from "./page-shell";

const sections = [
  [
    "Who may need it",
    "Citizens who need transport services should verify state-specific requirements. Smart RTO guides you through each requirement clearly.",
  ],
  [
    "Before you start",
    "Keep relevant identification, address proof, and existing vehicle or licence details available for quick completion.",
  ],
  [
    "Step-by-step",
    "Choose your required service, complete each section with step-by-step validation, review details, and save your application reference number.",
  ],
  [
    "Common problems",
    "Unclear document uploads, expired validity documents, or selecting an incorrect RTO office can cause delays. Review guidance tips before submitting.",
  ],
] as const;

export function GuidePage({ slug }: { slug: string }) {
  const title = slug
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <PageShell>
      <section className="border-b border-[#dce8e5] bg-gradient-to-br from-[#f7fbfa] via-white to-[#ddf3ef] py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0f7655]">
                Plain-language service guide
              </p>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#152321] md:text-6xl">
                {title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#5e6f68]">
                Understand what this service does, what documents you need, and how to track progress easily.
              </p>
            </div>
            <div className="hidden rounded-3xl bg-[#152321] p-8 text-white shadow-xl lg:block">
              <BookOpenCheck className="text-[#78d5c0]" size={42} />
              <p className="mt-5 text-sm font-bold">Read before you begin</p>
              <p className="mt-2 text-xs leading-5 text-[#c9d8d4]">
                A quick overview for a smooth, confident application journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-5xl space-y-5 px-6 py-12">
        {sections.map(([heading, copy], index) => (
          <section
            className="grid gap-5 rounded-3xl border border-[#dce8e5] bg-white p-6 shadow-sm sm:grid-cols-[64px_1fr] sm:p-8"
            key={heading}
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ddf3ef] text-sm font-black text-[#167c74]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className="flex items-center gap-2 text-xl font-extrabold text-[#152321]">
                <CheckCircle2 size={20} className="text-[#167c74]" />
                {heading}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#5e6f68]">{copy}</p>
              {index === sections.length - 1 ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    className="inline-flex items-center gap-2 rounded-xl bg-[#167c74] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#126b64]"
                    href="/apply/learner-licence"
                  >
                    Start Learner Application <ArrowRight size={15} />
                  </Link>
                  <Link
                    className="inline-flex items-center gap-2 rounded-xl border border-[#167c74] px-4 py-2.5 text-xs font-bold text-[#0f7655] hover:bg-[#ddf3ef]"
                    href="/help"
                  >
                    Search Help FAQs <ArrowRight size={15} />
                  </Link>
                </div>
              ) : null}
            </div>
          </section>
        ))}
      </article>
    </PageShell>
  );
}
