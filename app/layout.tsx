import type { Metadata } from "next";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";
import "@fontsource/poppins/900.css";
import "./globals.css";
import { LanguageProvider } from "@/components/language-provider";
import { AccessibilityProvider } from "@/components/accessibility-provider";
import { SmoothScrollProvider } from "@/components/motion/smooth-scroll-provider";
import { AuthGuard } from "@/components/auth-guard";
import { DemoModeProvider } from "@/components/demo-mode-provider";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"
  ),
  title: {
    default: "Smart RTO — Simpler Citizen Transport Services",
    template: "%s · Smart RTO",
  },
  description:
    "An independent hackathon prototype for simpler, guided RTO citizen services.",
  icons: {
    icon: [{ url: "/smart-rto-icon.png", type: "image/png", sizes: "512x512" }],
    shortcut: "/smart-rto-icon.png",
    apple: [{ url: "/smart-rto-icon.png", sizes: "512x512", type: "image/png" }],
  },
  openGraph: {
    title: "Smart RTO",
    description: "Less confusion. More progress.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart RTO",
    description: "Less confusion. More progress.",
    images: ["/og.png"],
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AccessibilityProvider>
          <DemoModeProvider><LanguageProvider>
            <SmoothScrollProvider>
              <AuthGuard>{children}</AuthGuard>
            </SmoothScrollProvider>
          </LanguageProvider></DemoModeProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
