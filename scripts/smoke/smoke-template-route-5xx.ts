import { TemplateRegistry } from "../../src/lib/templates/template-registry";
import { TemplateEngine } from "../../src/lib/templates/template-engine";
import { BoundaryEnforcer } from "../../src/lib/enforcement/boundary-enforcer";

async function execTool(name: string, params: any){ return { ok:true, tool:name, params }; }

async function main(){
  const sessionId='smoke-te-route';
  const reg=new TemplateRegistry(); await reg.load();
  const sel=reg.selectByTarget('route-5xx'); if(!sel){console.error('no template');process.exit(1)}
  const engine=new TemplateEngine();
  const plan=engine.buildPlan(sel.template,{sessionId, bounded:true, stepBudget:3, vars:{ ns:'ns-a', service:'svc-a', route:'route-a', backendPod:'pod-a' }});
  const enforcer=new BoundaryEnforcer({maxSteps:plan.boundaries.maxSteps, timeoutMs:plan.boundaries.timeoutMs});
  const steps=enforcer.filterSteps(plan.steps);
  const exec:any[]=[]; for(const s of steps){ exec.push({step:s,result:await execTool(s.tool,s.params)}); }
  const ev=engine.evaluateEvidence(sel.template, exec as any);
  console.log(JSON.stringify({planId:plan.planId, target:sel.template.triageTarget, tools:steps.map(s=>s.tool), evidence:ev},null,2));
}
main().catch(e=>{console.error(e);process.exit(1)});
