import type{AppState}from"./models";

const URL=import.meta.env.VITE_LIFEOS_SUPABASE_URL?.replace(/\/$/,"")||"https://ejwburasdjzuxnkwwbju.supabase.co";
const KEY=import.meta.env.VITE_LIFEOS_SUPABASE_ANON_KEY||"sb_publishable_cFT9ZRFUxMAP-tlj5gGckw_njrMV_KW";
const AUTH=()=>`${URL}/auth/v1`;
const REST=()=>`${URL}/rest/v1`;
const headers=(token?:string)=>({"Content-Type":"application/json","apikey":KEY,...(token?{Authorization:`Bearer ${token}`}:{})});

export type CloudSession={access_token:string;refresh_token:string;user:{id:string;email?:string}};
export class CloudAuthError extends Error{constructor(message="Cloud session expired."){super(message);this.name="CloudAuthError"}}
export class CloudConflictError extends Error{constructor(message="Your cloud data changed on another device. Restore the latest cloud copy before syncing this device."){super(message);this.name="CloudConflictError"}}

export function cloudConfigured(){return Boolean(URL&&KEY)}
export async function signUp(email:string,password:string){return auth("/signup",{email,password})}
export async function signIn(email:string,password:string){return auth("/token?grant_type=password",{email,password})}
export async function refreshSession(refresh_token:string){return auth("/token?grant_type=refresh_token",{refresh_token})}
async function auth(path:string,body:Record<string,string>):Promise<CloudSession>{
 if(!cloudConfigured())throw new Error("Cloud sync is not configured.");
 const r=await fetch(AUTH()+path,{method:"POST",headers:headers(),body:JSON.stringify(body)});
 const data=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(data.error_description||data.msg||"Cloud authentication failed.");
 return data as CloudSession;
}
export async function cloudSignOut(token:string){if(!cloudConfigured())return;await fetch(AUTH()+"/logout",{method:"POST",headers:headers(token)}).catch(()=>{})}
async function cloudFetch(input:RequestInfo|URL,init:RequestInit,authRequired=true){
 const r=await fetch(input,init);
 if(authRequired&&r.status===401)throw new CloudAuthError();
 return r;
}
export async function pullCloud(token:string):Promise<AppState|null>{
 if(!cloudConfigured())throw new Error("Cloud sync is not configured.");
 const uid=userId(token);
 if(!uid)throw new CloudAuthError("Your cloud session is invalid. Please sign in again.");
 const r=await cloudFetch(`${REST()}/lifeos_state?select=state&user_id=eq.${encodeURIComponent(uid)}&limit=1`,{headers:headers(token)});
 if(!r.ok)throw new Error("Could not read your LIFEOS cloud data.");
 const rows=await r.json();
 return rows[0]?.state??null;
}
function userId(token:string){try{const part=token.split(".")[1];if(!part)return "";const base64=part.replace(/-/g,"+").replace(/_/g,"/").padEnd(Math.ceil(part.length/4)*4,"=");return JSON.parse(atob(base64)).sub as string}catch{return ""}}
export async function pushCloud(token:string,state:AppState){
 if(!cloudConfigured())throw new Error("Cloud sync is not configured.");
 const uid=userId(token);
 if(!uid)throw new CloudAuthError("Your cloud session is invalid. Please sign in again.");
 const current=await cloudFetch(REST()+"/lifeos_state?select=updated_at&user_id=eq."+encodeURIComponent(uid)+"&limit=1",{headers:headers(token)});
 if(!current.ok)throw new Error("Could not check your LIFEOS cloud version.");
 const rows=await current.json() as Array<{updated_at:string}>;
 const updatedAt=new Date().toISOString();
 if(!rows.length){
  const created=await cloudFetch(REST()+"/lifeos_state",{method:"POST",headers:{...headers(token),Prefer:"return=minimal"},body:JSON.stringify({user_id:uid,state,updated_at:updatedAt})});
  if(created.status===409)throw new CloudConflictError();
  if(!created.ok)throw new Error("Could not save LIFEOS to the cloud.");
  return;
 }
 const expected=rows[0].updated_at;
 const r=await cloudFetch(REST()+"/lifeos_state?user_id=eq."+encodeURIComponent(uid)+"&updated_at=eq."+encodeURIComponent(expected),{method:"PATCH",headers:{...headers(token),Prefer:"return=representation"},body:JSON.stringify({state,updated_at:updatedAt})});
 if(!r.ok)throw new Error("Could not save LIFEOS to the cloud.");
 const rowsUpdated=await r.json().catch(()=>[]);
 if(!Array.isArray(rowsUpdated)||rowsUpdated.length!==1)throw new CloudConflictError();
}
