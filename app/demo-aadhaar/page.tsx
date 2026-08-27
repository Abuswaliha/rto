import type { Metadata } from "next";
import { DemoAadhaar } from "@/components/demo-aadhaar";

export const metadata: Metadata = { title: "Demo Aadhaar prefill" };

export default function Page() {
  return <DemoAadhaar />;
}
