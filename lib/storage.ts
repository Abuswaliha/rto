export type Draft = {
  step: number; state: string; age: string; vehicle: string; identity: string;
  dob: string; mobile: string; otp: string; fullName: string; guardian: string;
  gender: string; pincode: string; city: string; address: string; rto: string;
  documents: string[]; appointment: string; declaration: boolean; payment: string;
  updatedAt: string;
};

export type DemoApplication = { id: string; status: string; appointment: string; rto: string; submittedAt: string; fullName: string };
export const emptyDraft: Draft = { step:0,state:"Maharashtra",age:"",vehicle:"",identity:"Demo Aadhaar",dob:"2000-01-15",mobile:"9999999999",otp:"",fullName:"Demo Citizen",guardian:"",gender:"",pincode:"416416",city:"Sangli",address:"",rto:"MH-10 Sangli RTO",documents:[],appointment:"",declaration:false,payment:"",updatedAt:"" };

const canUseStorage = () => typeof window !== "undefined";
export function loadDraft(): Draft { if(!canUseStorage()) return emptyDraft; try { return {...emptyDraft,...JSON.parse(localStorage.getItem("smart-rto-draft")||"{}")}; } catch { return emptyDraft; } }
export function saveDraft(draft: Draft){ if(canUseStorage()) localStorage.setItem("smart-rto-draft",JSON.stringify({...draft,updatedAt:new Date().toISOString()})); }
export function setSession(value=true){ if(canUseStorage()) localStorage.setItem("smart-rto-session",value?"demo-user-001":""); }
export function hasSession(){ return canUseStorage() && localStorage.getItem("smart-rto-session")==="demo-user-001"; }
export function loadApplication(): DemoApplication | null { if(!canUseStorage()) return null; try{return JSON.parse(localStorage.getItem("smart-rto-application")||"null");}catch{return null;} }
export function saveApplication(app: DemoApplication){ if(canUseStorage()) localStorage.setItem("smart-rto-application",JSON.stringify(app)); }
export function newApplicationId(){ return `SRTO-LL-2026-${String(Math.floor(100000+Math.random()*900000))}`; }
