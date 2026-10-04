import type{AppState}from"./models";import{recommendation,allTasks}from"./engine";

const ENV=(import.meta as ImportMeta & {env?:Record<string,string>}).env||{};
const ENDPOINT=ENV.VITE_LIFEOS_AI_ENDPOINT||"";

export function aiConfigured(){return Boolean(ENDPOINT)}
export async function askLifeGuide(state:AppState,question:string,accessToken:string){
 const r=recommendation(state);
 const tasks=allTasks(state);
 const context={question:question.trim(),safeSummary:{
  activeGoals:state.goals.filter(g=>!g.archived).map(g=>({title:g.title,category:g.category,priority:g.priority,deadline:g.deadline,progress:g.progress})),
  openActions:tasks.filter(t=>!t.done).slice(0,30).map(t=>({title:t.title,priority:t.priority,deadline:t.deadline,status:t.status,missionId:t.missionId})),
  missions:state.missions.filter(m=>m.status!=="Completed").map(m=>({title:m.title,status:m.status,deadline:m.deadline,progress:m.tasks.length?Math.round(m.tasks.filter(t=>t.done).length/m.tasks.length*100):0,openTasks:m.tasks.filter(t=>!t.done).slice(0,10).map(t=>({title:t.title,priority:t.priority,deadline:t.deadline,status:t.status}))})),
  habits:state.habits.map(h=>({name:h.name,frequency:h.frequency,streak:h.streak,bestStreak:h.bestStreak})),
  recommendedAction:r.task?{title:r.task.title,reason:r.reason,missionId:r.missionId}:null
 }};
 if(!ENDPOINT)throw new Error("AI Life Guide is not configured for this LIFEOS deployment.");
 if(!accessToken)throw new Error("Sign in to LIFEOS cloud sync to use the AI Life Guide.");
 const res=await fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${accessToken}`},body:JSON.stringify(context)});
 const data=await res.json().catch(()=>({}));
 if(!res.ok)throw new Error(data.error||"AI Guide could not respond.");
 return String(data.answer||data.message||"No answer returned.");
}