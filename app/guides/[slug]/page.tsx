import { GuidePage } from "@/components/guide-page";

export function generateStaticParams() {
  return [
    { slug: "learner-licence" },
    { slug: "driving-licence" },
    { slug: "vehicle-transfer" },
    { slug: "rc-lookup" },
    { slug: "duplicate-rc" },
    { slug: "noc-clearance" },
    { slug: "address-change" },
    { slug: "pucc-renewal" },
    { slug: "driving-test" },
    { slug: "challan-payment" },
    { slug: "commercial-permit" },
    { slug: "fitness-certificate" },
  ];
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <GuidePage slug={slug} />;
}
