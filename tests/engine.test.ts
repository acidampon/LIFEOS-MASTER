import test from "node:test";
import assert from "node:assert/strict";
import { goalProgress, missionProgress, allTasks, recommendation, deriveMissionStatus, habitStreak } from "../src/engine.ts";
import type { AppState, Goal, Mission, Task } from "../src/models.ts";

const base = <T extends object>(value:T):T & {id:string;createdAt:string;updatedAt:string} => ({
  ...value,id: crypto.randomUUID(),createdAt: new Date().toISOString(),updatedAt: new Date().toISOString()
});
const state = (overrides: Partial<AppState> = {}): AppState => ({
  profile:{name:"",role:"",vision:"",theme:"light",notifications:false},
  goals:[],missions:[],tasks:[],habits:[],journal:[],transactions:[],budgets:[],areas:[],scenarios:[],...overrides
});

test("goalProgress derives percentage from milestones and clamps manual progress",()=>{
 const withMilestones=base<Goal>({title:"Goal",description:"",category:"Career",deadline:"",priority:"High",progress:12,archived:false,milestones:[{id:"m1",title:"One",completed:true},{id:"m2",title:"Two",completed:false},{id:"m3",title:"Three",completed:true}]});
 assert.equal(goalProgress(withMilestones),67);
 const manual=base<Goal>({title:"Goal",description:"",category:"Career",deadline:"",priority:"Low",progress:140,archived:false,milestones:[]});
 assert.equal(goalProgress(manual),100);
});
test("missionProgress reflects completed tasks and completed empty missions",()=>{
 const mission=base<Mission>({title:"Mission",description:"",goalId:"g1",startDate:"",deadline:"",priority:"High",status:"In Progress",tasks:[base<Task>({title:"A",done:true,status:"Completed",priority:"High",deadline:""}),base<Task>({title:"B",done:false,status:"Not Started",priority:"Low",deadline:""})]});
 assert.equal(missionProgress(mission),50); assert.equal(missionProgress({...mission,tasks:[],status:"Completed"}),100);
});
test("allTasks deduplicates mission tasks by id and preserves mission ownership",()=>{
 const shared=base<Task>({title:"Mission task",done:false,status:"Not Started",priority:"High",deadline:""}); const standalone={...shared,missionId:undefined};
 const mission=base<Mission>({title:"M",description:"",goalId:"g1",startDate:"",deadline:"",priority:"High",status:"In Progress",tasks:[shared]});
 const result=allTasks(state({tasks:[standalone],missions:[mission]})); assert.equal(result.length,1); assert.equal(result[0].missionId,mission.id);
});
test("recommendation prioritizes overdue actions before future deadlines and high priority",()=>{
 const overdue=base<Task>({title:"Overdue",done:false,status:"Not Started",priority:"Low",deadline:"2000-01-01"}); const future=base<Task>({title:"Future",done:false,status:"Not Started",priority:"High",deadline:"2999-01-01"});
 const result=recommendation(state({tasks:[future,overdue]})); assert.equal(result.task?.id,overdue.id); assert.equal(result.reason,"This action is past its deadline.");
});
test("recommendation can exclude the current choice and select another open action",()=>{
 const first=base<Task>({title:"First",done:false,status:"Not Started",priority:"High",deadline:"2999-01-01"}); const second=base<Task>({title:"Second",done:false,status:"Not Started",priority:"Low",deadline:"2999-01-02"});
 assert.equal(recommendation(state({tasks:[first,second]}),[first.id]).task?.id,second.id);
});
test("recommendation ignores completed and paused mission actions",()=>{
 const completedTask=base<Task>({title:"Done",done:false,status:"Not Started",priority:"High",deadline:"2000-01-01"}); const pausedTask=base<Task>({title:"Paused",done:false,status:"Not Started",priority:"High",deadline:"2000-01-01"});
 const completedMission=base<Mission>({title:"Completed mission",description:"",goalId:"g1",startDate:"",deadline:"",priority:"High",status:"Completed",tasks:[completedTask]});
 const pausedMission=base<Mission>({title:"Paused mission",description:"",goalId:"g1",startDate:"",deadline:"",priority:"High",status:"Paused",tasks:[pausedTask]});
 assert.equal(recommendation(state({missions:[completedMission,pausedMission]})).task,undefined);
});
test("deriveMissionStatus follows task truth and explicit reset states",()=>{
 assert.equal(deriveMissionStatus([{done:true} as any],"In Progress"),"Completed"); assert.equal(deriveMissionStatus([{done:false} as any],"Completed"),"Not Started");
 assert.equal(deriveMissionStatus([{done:true} as any,{done:false} as any],"Not Started"),"In Progress"); assert.equal(deriveMissionStatus([],"Paused"),"Paused");
 assert.equal(deriveMissionStatus([{done:false} as any],"Completed","Completed"),"Completed"); assert.equal(deriveMissionStatus([{done:false} as any],"In Progress","Paused"),"Paused");
 assert.equal(deriveMissionStatus([{done:false} as any],"Paused"),"Paused"); assert.equal(deriveMissionStatus([{done:true} as any],"Paused"),"Paused");
});
test("habitStreak tracks consecutive periods for each frequency",()=>{
 assert.equal(habitStreak(["2026-10-04","2026-10-03","2026-10-02"],"Daily","2026-10-04"),3);
 assert.equal(habitStreak(["2026-10-04","2026-09-21"],"Weekly","2026-10-04"),2);
 assert.equal(habitStreak(["2026-10-04","2026-09-12"],"Monthly","2026-10-04"),2);
 assert.equal(habitStreak(["2026-10-04","2026-10-02"],"Daily","2026-10-04"),1);
 assert.equal(habitStreak(["2027-01-01","2026-12-31"],"Daily","2027-01-01"),2);
 assert.equal(habitStreak(["2027-01-01","2026-12-28"],"Weekly","2027-01-01"),1);
 assert.equal(habitStreak(["2027-01-01","2026-12-21"],"Weekly","2027-01-01"),2);
 assert.equal(habitStreak(["2027-01-01","2026-12-15"],"Monthly","2027-01-01"),2);
});
