import { GuidePage } from "@/components/guide-page";export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <GuidePage slug={slug}/>}
