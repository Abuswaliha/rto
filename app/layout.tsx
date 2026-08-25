import type { Metadata } from "next";
import { Manrope, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import "./portal.css";

const manrope = Manrope({ variable: "--font-sans", subsets: ["latin"] });
const devanagari = Noto_Sans_Devanagari({ variable: "--font-devanagari", subsets: ["devanagari"] });
export const metadata: Metadata = {
  title: { default: "Smart RTO — Simpler Citizen Transport Services", template: "%s · Smart RTO" },
  description: "An independent hackathon prototype for simpler, guided RTO citizen services.",
  openGraph: { title: "Smart RTO", description: "Less confusion. More progress.", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: "Smart RTO", description: "Less confusion. More progress.", images: ["/og.png"] },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body className={`${manrope.variable} ${devanagari.variable}`}>{children}</body></html>; }
