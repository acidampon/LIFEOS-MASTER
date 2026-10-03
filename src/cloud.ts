import type{AppState}from"./models";

const URL=import.meta.env.VITE_LIFEOS_SUPABASE_URL?.replace(/\/$/,"")||"";
const KEY=import.meta.env.VITE_LIFEOS_SUPABASE_ANON_KEY||"";
const AUTH=()=>`${URL}/auth/v1`;
const REST=()=>`${URL}/rest/v1`;
const headers=(token?:string)=>({"Content-Type":"application/json","apikey":KEY,...(token?{Authorization:`Bearer ${token}`}:{})});

export type CloudSession={access_token:string;refresh_token:string;user:{id:string;email?:string}};

export function cloudConfigured(){return Boolean(URL&&KEY)}
export async function signUp(email:string,password:string){return auth("/signup",{email,password})}
export async function signIn(email:string,password:string){return auth("/token?grant_type=password",{email,password})}
async function auth(path:string,body:Record<string,string>):Promise<CloudSession>{
 if(!cloudConfigured())throw new Error("Cloud sync is not configured.");
 const r=await fetch(AUTH()+path,{method:"POST",headers:headers(),body:JSON.stringify(body)});
 const data=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(data.error_description||data.msg||"Cloud authentication failed.");
 return data as CloudSession;
}
export async function cloudSignOut(token:string){if(!cloudConfigured())return;await fetch(AUTH()+"/logout",{method:"POST",headers:headers(token)}).catch(()=>{})}
export async function pullCloud(token:string):Promise<AppState|null>{
 if(!cloudConfigured())throw new Error("Cloud sync is not configured.");
 const r=await fetch(`${REST()}/lifeos_state?select=state&limit=1`,{headers:headers(token)});
 if(!r.ok)throw new Error("Could not read your LIFEOS cloud data.");
 const rows=await r.json();
 return rows[0]?.state??null;
}
export async function pushCloud(token:string,state:AppState){
 if(!cloudConfigured())throw new Error("Cloud sync is not configured.");
 const r=await fetch(`${REST()}/lifeos_state?on_conflict=user_id`,{method:"POST",headers:{...headers(token),Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({state,updated_at:new Date().toISOString()})});
 if(!r.ok)throw new Error("Could not save LIFEOS to the cloud.");
}
