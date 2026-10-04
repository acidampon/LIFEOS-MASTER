import test from"node:test";
import assert from"node:assert/strict";
import{normalizeState,emptyState}from"../src/db.ts";

test("normalizeState preserves valid state while repairing task consistency",()=>{
 const state=normalizeState({...emptyState(),tasks:[
  {id:"1",createdAt:"",updatedAt:"",title:"Done",done:false,status:"Completed",priority:"High",deadline:""},
  {id:"2",createdAt:"",updatedAt:"",title:"Open",done:false,status:"Completed",priority:"Low",deadline:""}
 ]});
 assert.equal(state.tasks[0].done,true);
 assert.equal(state.tasks[0].status,"Completed");
 assert.equal(state.tasks[1].done,true);
 assert.equal(state.tasks[1].status,"Completed");
});

test("normalizeState accepts older snapshots with missing collections",()=>{
 const state=normalizeState({profile:{name:"George",role:"",vision:"",theme:"light",notifications:false},goals:[],missions:[],tasks:[]});
 assert.equal(state.profile.name,"George");
 assert.deepEqual(state.habits,[]);
 assert.deepEqual(state.journal,[]);
 assert.deepEqual(state.transactions,[]);
 assert.deepEqual(state.budgets,[]);
 assert.deepEqual(state.areas,[]);
 assert.deepEqual(state.scenarios,[]);
});

test("normalizeState repairs missing mission task arrays",()=>{
 const state=normalizeState({...emptyState(),missions:[{
  id:"m1",createdAt:"",updatedAt:"",title:"Mission",description:"",goalId:"g1",startDate:"",deadline:"",priority:"High",status:"In Progress"
 } as any]});
 assert.deepEqual(state.missions[0].tasks,[]);
});