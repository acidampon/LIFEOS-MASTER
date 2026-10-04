import type{AppState,Task,Goal,Mission}from"./models";
export function goalProgress(g:Goal){return Math.max(0,Math.min(100,g.milestones.length?Math.round(g.milestones.filter(x=>x.completed).length/g.milestones.length*100):g.progress))}
export function missionProgress(m:Mission){return m.tasks.length?Math.round(m.tasks.filter(x=>x.done).length/m.tasks.length*100):m.status==="Completed"?100:0}
export function recommendation(s:AppState,excluded:string[]=[]){const d=new Date(),today=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`,blocked=new Set(excluded),byId=new Map<string,{task:Task;missionId:string|undefined}>();for(const t of s.tasks)if(!t.done&&!blocked.has(t.id))byId.set(t.id,{task:t,missionId:undefined});for(const m of s.missions){if(m.status==="Completed"||m.status==="Paused")continue;for(const t of m.tasks)if(!t.done&&!blocked.has(t.id))byId.set(t.id,{task:t,missionId:m.id})}const candidates=[...byId.values()];if(!candidates.length)return{task:undefined,missionId:undefined,reason:"You have no other open actions. Add one concrete next step."};const rank=(a:{task:Task;missionId:string|undefined},b:{task:Task;missionId:string|undefined})=>{const da=a.task.deadline||"9999-12-31",db=b.task.deadline||"9999-12-31";if(da!==db)return da.localeCompare(db);const p=(x:Task)=>x.priority==="High"?0:x.priority==="Medium"?1:2;const pp=p(a.task)-p(b.task);if(pp)return pp;return a.task.id.localeCompare(b.task.id)};const overdue=candidates.filter(x=>x.task.deadline&&x.task.deadline<today).sort(rank);if(overdue[0])return{...overdue[0],reason:"This action is past its deadline."};const due=candidates.filter(x=>x.task.deadline).sort(rank);if(due[0])return{...due[0],reason:"This open action has the nearest deadline."};const high=candidates.filter(x=>x.task.priority==="High").sort(rank);if(high[0])return{...high[0],reason:"This is your highest-priority open action."};const active=candidates.filter(x=>x.missionId&&s.missions.find(m=>m.id===x.missionId)?.status==="In Progress").sort(rank);if(active[0])return{...active[0],reason:"It is the next unfinished action in an active mission."};return[...candidates].sort(rank)[0]&&{...([...candidates].sort(rank)[0]),reason:"It is an open action you can move forward now."}}
export function deriveMissionStatus(tasks:Task[],current:Mission["status"],requested?:Mission["status"]):Mission["status"]{if(requested==="Completed")return "Completed";if(requested==="Not Started")return "Not Started";if(requested==="Paused")return "Paused";if(!requested&&current==="Paused")return "Paused";if(tasks.length)return tasks.every(t=>t.done)?"Completed":tasks.some(t=>t.done)?"In Progress":"Not Started";return requested||current}
export function taskStatus(t:Task){return t.done?"Completed":t.status??"Not Started"}
export function allTasks(s:AppState){
 const byId=new Map<string,Task>();
 for(const t of s.tasks)byId.set(t.id,t);
 for(const m of s.missions)for(const t of m.tasks)byId.set(t.id,{...t,missionId:m.id});
 return [...byId.values()];
}

export function habitStreak(completions:string[],frequency:"Daily"|"Weekly"|"Monthly",today:string):number{
 const dates=[...new Set(completions)].filter(Boolean).sort().reverse();
 if(!dates.length)return 0;
 const monthIndex=(date:string)=>{const [y,m]=date.slice(0,7).split("-").map(Number);return y*12+(m-1)};
 const weekKey=(date:string)=>{const [y,m,d]=date.slice(0,10).split("-").map(Number);const t=Math.floor(Date.UTC(y,m-1,d)/86400000);const weekday=((t+4)%7+7)%7;return t-(weekday===0?6:weekday-1)};
 const key=(date:string)=>frequency==="Daily"?date.slice(0,10):frequency==="Weekly"?String(weekKey(date)):date.slice(0,7);
 const current=key(today);if(key(dates[0])!==current)return 0;
 let streak=1,prev=current;
 for(let i=1;i<dates.length;i++){
  const k=key(dates[i]);if(k===prev)continue;
  if(frequency==="Daily"){
   const [y,m,d]=prev.split("-").map(Number);prev=new Date(Date.UTC(y,m-1,d-1)).toISOString().slice(0,10);
  }else if(frequency==="Weekly"){
   prev=String(Number(prev)-7);
  }else{
   const idx=monthIndex(prev)-1;prev=String(Math.floor(idx/12)*12+(idx%12));
  }
  if(k!==prev)break;streak++;
 }
 return streak;
}
