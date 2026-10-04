import type{AppState,Task,TaskStatus}from"./models";
const DB="lifeos-db",VERSION=2,STORE="state",KEY="app";
export const emptyState=():AppState=>({profile:{name:"",role:"",vision:"",theme:"light",notifications:false},goals:[],missions:[],tasks:[],habits:[],journal:[],transactions:[],budgets:[],areas:[],scenarios:[]});
const arrayKeys=["goals","missions","tasks","habits","journal","transactions","budgets","areas","scenarios"] as const;
const taskStatus=(done:boolean,status?:TaskStatus):TaskStatus=>done?"Completed":status==="Completed"?"Completed":status==="In Progress"?"In Progress":"Not Started";
const normalizeTask=(raw:Task):Task=>{const done=Boolean(raw.done)||raw.status==="Completed";return{...raw,done,status:taskStatus(done,raw.status)}};
export function normalizeState(raw:unknown):AppState{
 const base=emptyState();
 if(!raw||typeof raw!=="object")return base;
 const x=raw as Partial<AppState>;
 const collections=Object.fromEntries(arrayKeys.map(key=>[key,Array.isArray(x[key])?x[key]:base[key]])) as Pick<AppState,typeof arrayKeys[number]>;
 const p=x.profile&&typeof x.profile==="object"?x.profile as Partial<AppState["profile"]>:{};
 const tasks=collections.tasks.map(normalizeTask);
 const missions=collections.missions.map(m=>({...m,tasks:Array.isArray(m.tasks)?m.tasks.map(normalizeTask):[]}));
 return {...base,...x,...collections,tasks,missions,profile:{...base.profile,...p,theme:p.theme==="dark"?"dark":"light",notifications:Boolean(p.notifications)}};
}
function open(){return new Promise<IDBDatabase>((resolve,reject)=>{if(!("indexedDB"in window)){reject(new Error("IndexedDB unavailable"));return}const r=indexedDB.open(DB,VERSION);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE)};r.onblocked=()=>reject(new Error("IndexedDB upgrade blocked"));r.onsuccess=()=>{const db=r.result;db.onversionchange=()=>db.close();resolve(db)};r.onerror=()=>reject(r.error??new Error("IndexedDB open failed"))})}
export async function loadState(){let db:IDBDatabase|undefined;try{db=await open();return await new Promise<AppState>((resolve,reject)=>{const tx=db!.transaction(STORE,"readonly"),r=tx.objectStore(STORE).get(KEY);r.onsuccess=()=>{try{resolve(normalizeState(r.result||emptyState()))}catch(error){reject(error)}};r.onerror=()=>reject(r.error??new Error("IndexedDB read failed"));tx.onerror=()=>reject(tx.error??new Error("IndexedDB transaction failed"))})}finally{db?.close()}}
let writeQueue=Promise.resolve();
const enqueueWrite=(work:()=>Promise<void>)=>{const next=writeQueue.then(work,work);writeQueue=next.catch(()=>{});return next};
export function saveState(s:AppState){return enqueueWrite(async()=>{const db=await open();try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).put(s,KEY);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error??new Error("IndexedDB write failed"));tx.onabort=()=>reject(tx.error??new Error("IndexedDB write aborted"))})}finally{db.close()}})}
export function clearState(){return enqueueWrite(async()=>{const db=await open();try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).delete(KEY);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error??new Error("IndexedDB delete failed"));tx.onabort=()=>reject(tx.error??new Error("IndexedDB delete aborted"))})}finally{db.close()}})}