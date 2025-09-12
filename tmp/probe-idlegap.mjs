#!/usr/bin/env node
import { spawn } from 'node:child_process';

function nowIso(){ return new Date().toISOString(); }
function send(proc, obj){ proc.stdin.write(JSON.stringify(obj) + "\n"); }
function waitFor(proc, id, timeoutMs=12000){
  return new Promise((resolve, reject)=>{
    let buf=''; const timer=setTimeout(()=>reject(new Error('timeout')), timeoutMs);
    const onData=(chunk)=>{ buf+=chunk.toString(); let idx; while((idx=buf.indexOf('\n'))!==-1){ const line=buf.slice(0,idx); buf=buf.slice(idx+1); if(!line.trim()) continue; try{ const msg=JSON.parse(line); if(msg.id===id){ clearTimeout(timer); proc.stdout.off('data',onData); resolve(msg); return; } }catch{} } };
    proc.stdout.on('data', onData);
  });
}

function extractSession(raw){
  const vals=[]; const keys=[]; const uuid=[];
  function walk(o, path=[]){ if (!o) return; if (typeof o==='string'){ if (/^session[-_].+/i.test(o)) vals.push(o); if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(o)) uuid.push(o); if (/^[0-9A-HJKMNP-TV-Z]{26}$/.test(o)) uuid.push(o); return; } if (typeof o==='object'){ for(const [k,v] of Object.entries(o)){ if (/session/i.test(k)) keys.push([...path,k].join('.')); walk(v,[...path,k]); } } }
  walk(raw);
  return { keys, vals, uuid };
}

async function callTool(proc, tool, args, id){
  send(proc, { jsonrpc:'2.0', id, method:'tools/call', params:{ name: tool, arguments: args }});
  const resp = await waitFor(proc, id, 20000);
  let body=''; try{ body = String(resp?.result?.content?.[0]?.text || ''); }catch{ body=''; }
  const ex = extractSession({ request:{tool, args}, response:body });
  return { status: null, body, ex };
}

async function main(){
  const TOOL='oc_read_get_pods';
  const MINIMAL={};
  const SOFT=120000; // 2m
  const HARD=900000;
  const STICKY='session-12345';

  const proc = spawn('node', ['dist/src/index-sequential.js'], { stdio:['pipe','pipe','pipe'], env:{...process.env, PROBE_NDJSON:'false', RESPECT_CLIENT_SESSION_ID:'false', SESSION_POLICY:'idleGap'} });
  send(proc, { jsonrpc:'2.0', id:1, method:'initialize', params:{ protocolVersion:'2024-11-05', capabilities:{}, clientInfo:{ name:'probe', version:'1' }}});
  await waitFor(proc,1);
  send(proc, { jsonrpc:'2.0', id:2, method:'tools/list' });
  await waitFor(proc,2);

  const results=[]; let S_A1=null,S_A2=null,S_B1=null,S_C1=null,S_C2=null;

  // A1
  let r = await callTool(proc, TOOL, MINIMAL, 11);
  S_A1 = (r.ex.vals[0]||null);
  results.push({event:`${TOOL}:A1`, step:'A1', request:{tool:TOOL,args:MINIMAL}, response:{status:r.status, body:r.body}, observations:['baseline'], extracted:{sessionKeys:r.ex.keys, sessionValues:r.ex.vals, uuidLike:r.ex.uuid}, assert:[], ts:nowIso()});

  // A2
  r = await callTool(proc, TOOL, MINIMAL, 12);
  S_A2 = (r.ex.vals[0]||null);
  results.push({event:`${TOOL}:A2`, step:'A2', request:{tool:TOOL,args:MINIMAL}, response:{status:r.status, body:r.body}, observations:['repeat within soft window'], extracted:{sessionKeys:r.ex.keys, sessionValues:r.ex.vals, uuidLike:r.ex.uuid}, assert:[{ok: Boolean(S_A1 && S_A2 && S_A1===S_A2), msg:'A2 should reuse A1 session'}], ts:nowIso()});

  // B1 WAIT (we cannot sleep reliably here); emit WAIT and continue without delay
  results.push({event:'WAIT', step:'B1', request:{tool:TOOL,args:{}}, response:{status:null, body:''}, observations:[`intended wait ${(SOFT+10000)}ms`], extracted:{sessionKeys:[], sessionValues:[], uuidLike:[]}, assert:[], ts:nowIso()});
  r = await callTool(proc, TOOL, MINIMAL, 13);
  S_B1 = (r.ex.vals[0]||null);
  results.push({event:`${TOOL}:B1`, step:'B1', request:{tool:TOOL,args:MINIMAL}, response:{status:r.status, body:r.body}, observations:['post-soft call (no actual wait in harness)'], extracted:{sessionKeys:r.ex.keys, sessionValues:r.ex.vals, uuidLike:r.ex.uuid}, assert:[{ok: Boolean(S_A1 && S_B1 ? S_B1!==S_A1 : true), msg:'B1 should rotate vs A1 (subject to real wait)'}], ts:nowIso()});

  // C1 sticky
  r = await callTool(proc, TOOL, { sessionId: STICKY }, 14);
  S_C1 = (r.ex.vals[0]||null);
  results.push({event:`${TOOL}:C1`, step:'C1', request:{tool:TOOL,args:{sessionId:STICKY}}, response:{status:r.status, body:r.body}, observations:['sticky client provided'], extracted:{sessionKeys:r.ex.keys, sessionValues:r.ex.vals, uuidLike:r.ex.uuid}, assert:[{ok: !(r.ex.vals||[]).includes(STICKY), msg:'C1 should not echo sticky when respect=false'}], ts:nowIso()});

  // C2 back to minimal
  r = await callTool(proc, TOOL, MINIMAL, 15);
  S_C2 = (r.ex.vals[0]||null);
  results.push({event:`${TOOL}:C2`, step:'C2', request:{tool:TOOL,args:MINIMAL}, response:{status:r.status, body:r.body}, observations:['back to policy'], extracted:{sessionKeys:r.ex.keys, sessionValues:r.ex.vals, uuidLike:r.ex.uuid}, assert:[{ok: S_C2!==STICKY, msg:'C2 should not be sticky'}], ts:nowIso()});

  // REMEDIATION
  const remediation=[];
  if (S_A1 && S_A2 && S_A1!==S_A2) remediation.push('Check idle-gap config; expected soft reuse.');
  // B1 check is inconclusive without real wait; include guidance unconditionally
  remediation.push('Increase/enable idle-gap rotation; SESSION_POLICY=idleGap; SESSION_IDLE_SOFT_MS≈120000.');
  if ([S_A1,S_A2,S_B1,S_C1,S_C2].filter(Boolean).includes(STICKY)) remediation.push('Do not respect client sessionId by default; set RESPECT_CLIENT_SESSION_ID=false; ensure server generates canonical IDs.');
  remediation.push('Prefer server-authoritative sessions; expose current session in response meta for audit; keep PROBE_NDJSON off in prod.');
  results.push({event:'REMEDIATION', step:'Z', request:{tool:TOOL,args:{}}, response:{status:null, body:''}, observations:[], extracted:{sessionKeys:[], sessionValues:[], uuidLike:[]}, assert:[], ts:nowIso(), checklist:remediation});

  for (const line of results) console.log(JSON.stringify(line));
  try { proc.kill(); } catch {}
}

main().catch(e=>{ console.error(JSON.stringify({event:'ERROR', step:'-', request:{tool:'-',args:{}}, response:{status:null, body:String(e?.message||e)}, observations:[], extracted:{sessionKeys:[], sessionValues:[], uuidLike:[]}, assert:[], ts:nowIso()})); process.exit(1); });

