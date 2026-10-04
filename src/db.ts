import type{AppState}from"./models";
const DB="lifeos-db",VERSION=2,STORE="state",KEY="app";
export const emptyState=():AppState=>({profile:{name:"",role:"",vision:"",theme:"light",notifications:false},goals:[],missions:[],tasks:[],habits:[],journal:[],transactions:[],budgets:[],areas:[],scenarios:[]});
export function normalizeState(raw:unknown):AppState{
 const base=emptyState();
 if(!raw||typeof raw!=="object")return base;
 const x=raw as Partial<AppState>;
 if(!Array.isArray(x.goals)||!Array.isArray(x.missions)||!Array.isArray(x.tasks)||!Array.isArray(x.habits)||!Array.isArray(x.journal)||!Array.isArray(x.transactions)||!Array.isArray(x.budgets)||!Array.isArray(x.areas)||!Array.isArray(x.scenarios))throw new Error("Invalid LIFEOS state.");
 const p=x.profile&&typeof x.profile==="object"?x.profile as Partial<AppState["profile"]>:{};
 return {...base,...x,profile:{...base.profile,...p,theme:p.theme==="dark"?"dark":"light",notifications:Boolean(p.notifications)}};
}
function open(){return new Promise<IDBDatabase>((resolve,reject)=>{if(!("indexedDB"in window)){reject(new Error("IndexedDB unavailable"));return}const r=indexedDB.open(DB,VERSION);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE)};r.onblocked=()=>reject(new Error("IndexedDB upgrade blocked"));r.onsuccess=()=>{const db=r.result;db.onversionchange=()=>db.close();resolve(db)};r.onerror=()=>reject(r.error??new Error("IndexedDB open failed"))})}
export async function loadState(){let db:IDBDatabase|undefined;try{db=await open();return await new Promise<AppState>((resolve,reject)=>{const tx=db!.transaction(STORE,"readonly"),r=tx.objectStore(STORE).get(KEY);r.onsuccess=()=>{try{resolve(r.result?normalizeState(r.result):emptyState())}catch(error){reject(error)}};r.onerror=()=>reject(r.error??new Error("IndexedDB read failed"));tx.onerror=()=>reject(tx.error??new Error("IndexedDB transaction failed"))})}finally{db?.close()}}
export async function saveState(s:AppState){const db=await open();try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).put(s,KEY);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error??new Error("IndexedDB write failed"));tx.onabort=()=>reject(tx.error??new Error("IndexedDB write aborted"))})}finally{db.close()}}
export async function clearState(){const db=await open();try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).delete(KEY);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error??new Error("IndexedDB delete failed"));tx.onabort=()=>reject(tx.error??new Error("IndexedDB delete aborted"))})}finally{db.close()}}