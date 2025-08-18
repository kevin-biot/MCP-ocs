import fs from 'node:fs';
import path from 'node:path';

function jaccard(a,b){
  try {
    const A = new Set(String(a||'').split(/\s+/));
    const B = new Set(String(b||'').split(/\s+/));
    const inter = [...A].filter(x=>B.has(x)).length;
    const uni = new Set([...A,...B]).size;
    return uni ? inter/uni : 1;
  } catch { return 0; }
}

function toolSignature(t) {
  if (!t?.tool_call) return '';
  const keys = Object.keys(t.tool_call.arguments||{}).sort().join(',');
  return `${t.tool_call.name}(${keys})`;
}

export function scoreRunFiles(files) {
  const runs = files.map(f => JSON.parse(fs.readFileSync(f,'utf8')));
  const finals = runs.map(r => r?.summary?.final_text || '');
  const toolSeqs = runs.map(r => (r?.turns||[]).filter(t=>t.tool_call).map(toolSignature).join(' -> '));

  const structuralStable = toolSeqs.every(s => s === toolSeqs[0]);
  const toolCallsTotal = runs.reduce((a,r)=>a + Number(r?.summary?.metrics?.tool_calls_total||0),0);
  const toolCallsOk = runs.reduce((a,r)=>a + Number(r?.summary?.metrics?.tool_calls_ok||0),0);
  const toolSuccessRate = toolCallsTotal ? toolCallsOk / toolCallsTotal : 1;

  // Answer stability based on equality of JSON fields priority/confidence/evidence_keys
  function extractFields(s){
    try {
      const p = JSON.parse(String(s||''));
      const pr = p?.priority || null;
      const cf = p?.confidence || null;
      const ek = Array.isArray(p?.evidence_keys) ? [...p.evidence_keys].sort().join('|') : null;
      return `${pr}__${cf}__${ek}`;
    } catch { return null; }
  }
  const sigs = finals.map(extractFields);
  let pairs=0, eq=0;
  for (let i=0;i<sigs.length;i++){
    for (let j=i+1;j<sigs.length;j++){
      pairs++;
      if (sigs[i] && sigs[j] && sigs[i] === sigs[j]) eq++;
    }
  }
  const answerStability = pairs ? (eq / pairs) : 1;
  // Optional rubric stability (engine cross-check)
  const rubrics = runs.map(r => r?.summary?.rubrics?.engineConfidence || null);
  let rpairs=0, req=0;
  for (let i=0;i<rubrics.length;i++){
    for (let j=i+1;j<rubrics.length;j++){
      rpairs++;
      if (rubrics[i] && rubrics[j] && rubrics[i] === rubrics[j]) req++;
    }
  }
  const rubricStability = rpairs ? (req / rpairs) : null;
  // Dual-mode comparison: check if engine-mode file exists and compare fields
  let jsonEqual = null; let rubricEqual = null;
  try {
    // Attempt to locate an engine output next to robustness logs
    const anyRun = files[0];
    // Derive scenario directory name from transcript path
    let scenario = null;
    try {
      const parts = anyRun.split(path.sep);
      const idx = parts.indexOf('transcripts');
      if (idx>=0 && parts[idx+1]) scenario = parts[idx+1];
    } catch {}
    // Extract model from first transcript content
    const firstRunObj = JSON.parse(fs.readFileSync(anyRun,'utf8'));
    const modelName = firstRunObj?.meta?.model || '';
    const safeModel = String(modelName).replace(/[^A-Za-z0-9._-]/g,'_');
    const candidates = [];
    if (scenario) candidates.push(path.join('logs','robustness', `${scenario}__${safeModel}__engine.json`));
    if (scenario) candidates.push(path.join('logs','robustness', `${scenario}__engine.json`));
    const engPath = candidates.find(p => p && fs.existsSync(p));
    if (engPath) {
      const eng = JSON.parse(fs.readFileSync(engPath,'utf8'));
      // Extract LLM-mode JSONs if parseable
      const parsed = finals.map(s => { try { const o = JSON.parse(s); if (Array.isArray(o?.evidence_keys) && o.evidence_keys.length>1) o.evidence_keys = o.evidence_keys.filter(k=>k!=='no_evidence'); return o; } catch { return null; } }).filter(Boolean);
      if (parsed.length) {
        const p0 = parsed[0];
        const allSame = (fld) => parsed.every(p => p && p[fld]===p0[fld]);
        const samePriority = allSame('priority');
        const sameConfidence = allSame('confidence');
        const sameSlo = parsed.every(p => (p?.slo||'') === (p0?.slo||''));
        const sameEk = parsed.every(p => JSON.stringify((p?.evidence_keys||[]).sort())===JSON.stringify((p0?.evidence_keys||[]).sort()));
        const engRes = eng?.result || {};
        const eqVsEngine = (
          p0?.priority===engRes?.priority &&
          p0?.confidence===engRes?.confidence &&
          (p0?.slo||'')===(engRes?.slo||'') &&
          JSON.stringify((p0?.evidence_keys||[]).sort())===JSON.stringify((engRes?.evidence_keys||[]).sort())
        );
        jsonEqual = samePriority && sameConfidence && sameSlo && sameEk && eqVsEngine;
        rubricEqual = sameConfidence && (p0?.confidence===engRes?.confidence) && sameSlo && ((p0?.slo||'')===(engRes?.slo||''));
      }
    }
  } catch {/* ignore */}
  const score = 0.45*(structuralStable?1:answerStability) + 0.35*toolSuccessRate + 0.20*answerStability;

  return {
    structuralStable,
    toolSuccessRate: Number(toolSuccessRate.toFixed(3)),
    answerStability: Number(answerStability.toFixed(3)),
    rubricStability: rubricStability == null ? null : Number(rubricStability.toFixed(3)),
    jsonEqual,
    rubricEqual,
    robustnessScore: Number(score.toFixed(3)),
    toolSeqs
  };
}
