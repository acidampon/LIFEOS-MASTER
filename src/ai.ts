import type{AppState}from"./models";import{recommendation}from"./engine";

const ENDPOINT=import.meta.env.VITE_LIFEOS_AI_ENDPOINT||"";

export function aiConfigured(){return Boolean(ENDPOINT)}
export async function askLifeGuide(state:AppState,question:string){
 const r=recommendation(state);
 const context={
  question:question.trim(),
  safeSummary:{
   activeGoals:state.goals.filter(g=>!g.archived).map(g=>({title:g.title,category:g.category,priority:g.priority,deadline:g.deadline,progress:g.progress})),
   openActions:state.tasks.filter(t=>!t.done).slice(0,20).map(t=>({title:t.title,priority:t.priority,deadline:t.deadline,status:t.status})),
   missions:state.missions.filter(m=>m.status!=="Completed").map(m=>({title:m.title,status:m.status,deadline:m.deadline,progress:m.tasks.length?Math.round(m.tasks.filter(t=>t.done).length/m.tasks.length*100):0})),
   habits:state.habits.map(h=>({name:h.name,frequency:h.frequency,streak:h.streak,bestStreak:h.bestStreak})),
   recommendedAction:r.task?{title:r.task.title,reason:r.reason}:null
  }
 };
 if(!ENDPOINT)throw new Error("AI Guide is not configured yet. Add VITE_LIFEOS_AI_ENDPOINT to connect your private AI service.");
 const res=await fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(context)});
 const data=await res.json().catch(()=>({}));
 if(!res.ok)throw new Error(data.error||"AI Guide could not respond.");
 return String(data.answer||data.message||"No answer returned.");
}
