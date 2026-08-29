export type Draft = {
  step:number;state:string;age:string;vehicle:string;identity:string;aadhaar:string;aadhaarVerified:boolean;dob:string;mobile:string;otp:string;fullName:string;guardian:string;gender:string;pincode:string;city:string;address:string;rto:string;documents:string[];appointment:string;declaration:boolean;payment:string;updatedAt:string;
};
export type DemoApplication = {
  id: string;
  status: string;
  statusCode?: string;
  appointment: string;
  rto: string;
  submittedAt: string;
  fullName: string;
  appointmentId?: string;
  paymentReference?: string;
  paymentMethod?: string;
  feeTotal?: string;
  identity?: string;
  dob?: string;
  guardian?: string;
  gender?: string;
  mobile?: string;
  pan?: string;
  medicalStatus?: string;
  organDonation?: string;
  address?: string;
  city?: string;
  pincode?: string;
  state?: string;
  vehicle?: string;
  documents?: string[];
};
export type DemoAadhaarProfile={aadhaar:string;fullName:string;dob:string;age:number;gender:string;mobile:string;address:string;city:string;district:string;state:string;pincode:string;suggestedRto:string;verifiedAt:string};

export const DEMO_AADHAAR_NUMBER="999988887777";
export const emptyDraft:Draft={step:0,state:"Maharashtra",age:"",vehicle:"",identity:"Demo Aadhaar",aadhaar:"",aadhaarVerified:false,dob:"2000-01-15",mobile:"9999999999",otp:"",fullName:"Demo Citizen",guardian:"",gender:"",pincode:"416416",city:"Sangli",address:"",rto:"MH-10 Sangli RTO",documents:[],appointment:"",declaration:false,payment:"",updatedAt:""};
const canUseStorage=()=>typeof window!=="undefined";
export function calculateAge(dob:string){const birth=new Date(`${dob}T00:00:00`);const today=new Date();let age=today.getFullYear()-birth.getFullYear();const beforeBirthday=today.getMonth()<birth.getMonth()||(today.getMonth()===birth.getMonth()&&today.getDate()<birth.getDate());if(beforeBirthday)age-=1;return age}
export function createDemoAadhaarProfile():DemoAadhaarProfile{const dob="2000-01-15";return{aadhaar:DEMO_AADHAAR_NUMBER,fullName:"Demo Citizen",dob,age:calculateAge(dob),gender:"Man",mobile:"9999999999",address:"House 14, Demo Nagar, Vishrambag",city:"Sangli",district:"Sangli",state:"Maharashtra",pincode:"416416",suggestedRto:"MH-10 Sangli RTO",verifiedAt:new Date().toISOString()}}
export function loadDemoProfile():DemoAadhaarProfile|null{if(!canUseStorage())return null;try{return JSON.parse(localStorage.getItem("smart-rto-demo-aadhaar-profile")||"null")}catch{return null}}
export function saveDemoProfile(profile:DemoAadhaarProfile){if(!canUseStorage())return;localStorage.setItem("smart-rto-demo-aadhaar-profile",JSON.stringify(profile));const draft=loadDraft();saveDraft({...draft,identity:"Demo Aadhaar",aadhaar:profile.aadhaar,aadhaarVerified:true,dob:profile.dob,age:String(profile.age),mobile:profile.mobile,fullName:profile.fullName,gender:profile.gender,pincode:profile.pincode,city:profile.city,address:profile.address,state:profile.state,rto:profile.suggestedRto})}
export function loadDraft():Draft{if(!canUseStorage())return emptyDraft;try{return{...emptyDraft,...JSON.parse(localStorage.getItem("smart-rto-draft")||"{}")} }catch{return emptyDraft}}
export function saveDraft(draft:Draft){if(canUseStorage())localStorage.setItem("smart-rto-draft",JSON.stringify({...draft,updatedAt:new Date().toISOString()}))}
export function setSession(value=true){if(canUseStorage())localStorage.setItem("smart-rto-session",value?"demo-user-001":"")}
export function hasSession(){return canUseStorage()&&localStorage.getItem("smart-rto-session")==="demo-user-001"}
export function loadApplication(): DemoApplication | null {
  if (!canUseStorage()) return null;
  try {
    return JSON.parse(localStorage.getItem("smart-rto-application") || "null");
  } catch {
    return null;
  }
}

export function loadApplicationsList(): DemoApplication[] {
  if (!canUseStorage()) return [];
  try {
    return JSON.parse(localStorage.getItem("smart-rto-applications-list") || "[]");
  } catch {
    return [];
  }
}

export function saveApplication(app: DemoApplication) {
  if (!canUseStorage()) return;
  localStorage.setItem("smart-rto-application", JSON.stringify(app));
  const list = loadApplicationsList();
  const filtered = list.filter((item) => item.id !== app.id);
  const updated = [app, ...filtered];
  localStorage.setItem("smart-rto-applications-list", JSON.stringify(updated));
}
export function newApplicationId(){return `SRTO-LL-2026-${String(Math.floor(100000+Math.random()*900000))}`}
export function newPaymentReference(){return `TESTPAY-2026-${String(Math.floor(100000+Math.random()*900000))}`}
export function newAppointmentId(){return `APT-${String(Math.floor(10000+Math.random()*90000))}`}
