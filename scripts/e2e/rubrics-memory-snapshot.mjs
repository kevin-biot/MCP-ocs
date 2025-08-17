#!/usr/bin/env node
import { evaluateRubrics } from '../../src/lib/rubrics/rubric-evaluator.ts';
import { MEMORY_SEARCH_CONFIDENCE_V1 } from '../../src/lib/rubrics/intelligence/memory-search-confidence.v1.ts';
import { MEMORY_STORE_SAFETY_V1 } from '../../src/lib/rubrics/intelligence/memory-store-safety.v1.ts';
import { MEMORY_STATS_SAFETY_V1 } from '../../src/lib/rubrics/intelligence/memory-stats-safety.v1.ts';
import { MEMORY_CONVERSATIONS_CONFIDENCE_V1 } from '../../src/lib/rubrics/intelligence/memory-conversations-confidence.v1.ts';

function run(){
  const out = {};
  // search incidents
  out.search = {
    pos: evaluateRubrics({ confidence: MEMORY_SEARCH_CONFIDENCE_V1 }, { recallTop1:0.9, relevanceAgreement:0.8, freshnessDaysTop1:30 }),
    med: evaluateRubrics({ confidence: MEMORY_SEARCH_CONFIDENCE_V1 }, { recallTop1:0.6, relevanceAgreement:0.65, freshnessDaysTop1:120 }),
    neg: evaluateRubrics({ confidence: MEMORY_SEARCH_CONFIDENCE_V1 }, { recallTop1:0.3, relevanceAgreement:0.4, freshnessDaysTop1:365 })
  };
  // store operational
  out.store = {
    pos: evaluateRubrics({ safety: MEMORY_STORE_SAFETY_V1 }, { ttlDays:180, scopeValid:true }),
    neg: evaluateRubrics({ safety: MEMORY_STORE_SAFETY_V1 }, { ttlDays:730, scopeValid:false })
  };
  // stats
  out.stats = {
    pos: evaluateRubrics({ safety: MEMORY_STATS_SAFETY_V1 }, { healthOk:true }),
    neg: evaluateRubrics({ safety: MEMORY_STATS_SAFETY_V1 }, { healthOk:false })
  };
  // conversations
  out.conversations = {
    pos: evaluateRubrics({ confidence: MEMORY_CONVERSATIONS_CONFIDENCE_V1 }, { contextRestorationConfidence:0.85 }),
    med: evaluateRubrics({ confidence: MEMORY_CONVERSATIONS_CONFIDENCE_V1 }, { contextRestorationConfidence:0.65 }),
    neg: evaluateRubrics({ confidence: MEMORY_CONVERSATIONS_CONFIDENCE_V1 }, { contextRestorationConfidence:0.4 })
  };
  console.log(JSON.stringify(out, null, 2));
  const ok = out.search.pos.confidence?.label==='High' && out.search.med.confidence?.label==='Medium' && out.search.neg.confidence?.label==='Low'
    && out.store.pos.safety?.allowAuto===true && out.store.neg.safety?.allowAuto===false
    && out.stats.pos.safety?.allowAuto===true && out.stats.neg.safety?.allowAuto===false
    && out.conversations.pos.confidence?.label==='High' && out.conversations.med.confidence?.label==='Medium' && out.conversations.neg.confidence?.label==='Low';
  if (!ok) process.exit(1);
}

run();

