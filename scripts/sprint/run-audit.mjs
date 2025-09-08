#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const ARCHIVE_DIR = path.join(ROOT, 'sprint-management', 'archive');
const ART_DIR = path.join(ROOT, 'artifacts', 'sprint-audit');
fs.mkdirSync(ART_DIR, { recursive: true });

function readFilesRec(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...readFilesRec(p));
    else if (ent.isFile() && /\.md$/i.test(ent.name)) out.push(p);
  }
  return out;
}

function extractSprintIds(text) {
  const ids = new Set();
  const re = /\bD-\d{3,}\b/g;
  let m; while ((m = re.exec(text))) ids.add(m[0]);
  return [...ids];
}

function extractCommitsBasic(text) {
  const commits = new Set();
  const re = /\b[0-9a-f]{7,40}\b/gi;
  let m; while ((m = re.exec(text))) commits.add(m[0]);
  return [...commits];
}

// Enhanced commit extraction from conventional sprint docs
function extractCommitsEnhanced(text) {
  const commits = new Set();
  // Lines like: commit: <hash>  or  hash: <hash>
  const labeled = text.match(/^(?:\s*[-*]\s*)?(?:commit|hash)\s*:\s*([0-9a-f]{7,40})/gim) || [];
  for (const ln of labeled) {
    const m = ln.match(/([0-9a-f]{7,40})/i); if (m) commits.add(m[1]);
  }
  // Code blocks or tables listing hashes
  for (const h of extractCommitsBasic(text)) commits.add(h);
  return [...commits];
}

function resolveHashPrefix(prefix) {
  try {
    const out = execSync(`git log --all --pretty=%H | grep -i ^${prefix}`, { encoding: 'utf8', stdio: ['ignore','pipe','ignore'] }).trim().split(/\n/)[0];
    return out && out.length >= 7 ? out : prefix;
  } catch { return prefix; }
}

function extractFixLines(text) {
  const fixes = [];
  const lines = text.split(/\r?\n/);
  for (const ln of lines) {
    const t = ln.trim();
    if (/^[-*] /.test(t) && /(fix|bug|resolve|patch|repair|correct)/i.test(t)) fixes.push(t.replace(/^[-*]\s*/, ''));
  }
  return fixes;
}

function collectInventory() {
  const files = readFilesRec(ARCHIVE_DIR);
  const perSprint = new Map();
  for (const file of files) {
    const txt = fs.readFileSync(file, 'utf8');
    const sprints = extractSprintIds(txt);
    const commits = extractCommitsEnhanced(txt).map(resolveHashPrefix);
    const fixes = extractFixLines(txt);
    if (sprints.length === 0 && commits.length === 0 && fixes.length === 0) continue;
    const sprintKeys = sprints.length ? sprints : ['UNSPECIFIED'];
    for (const sid of sprintKeys) {
      const cur = perSprint.get(sid) || { files: [], commits: new Set(), fixes: new Set() };
      cur.files.push(path.relative(ROOT, file));
      for (const c of commits) cur.commits.add(c);
      for (const f of fixes) cur.fixes.add(f);
      perSprint.set(sid, cur);
    }
  }
  const inv = [];
  for (const [sid, v] of perSprint.entries()) {
    inv.push({
      sprintId: sid,
      files: v.files,
      commits: [...v.commits],
      fixes: [...v.fixes],
    });
  }
  inv.sort((a,b)=> String(a.sprintId).localeCompare(String(b.sprintId)));
  return inv;
}

function getReleaseLog() {
  try {
    const out = execSync('git log --oneline release/v0.9.0-beta', { encoding: 'utf8' });
    return out.split(/\r?\n/).filter(Boolean);
  } catch (e) {
    return [];
  }
}

function crossRef(inv, logLines) {
  const presentHashes = new Set();
  const messages = [];
  for (const ln of logLines) {
    const m = ln.match(/^([0-9a-f]{7,40})\s+(.*)$/i);
    if (m) { presentHashes.add(m[1]); messages.push(m[2]); }
  }
  const results = [];
  for (const sprint of inv) {
    const commitResults = sprint.commits.map(h => {
      const short = h.slice(0, 7);
      const present = [...presentHashes].some(ph => ph.startsWith(short));
      return { hash: h, present };
    });
    const grepCount = (() => {
      try {
        const out = execSync(`git log --oneline release/v0.9.0-beta --grep=${sprint.sprintId}`, { encoding: 'utf8', stdio: ['ignore','pipe','ignore'] });
        return out ? out.split(/\n/).filter(Boolean).length : 0;
      } catch { return 0; }
    })();
    // Fix verification via grep heuristics
    const fixResults = verifyFixes(sprint.fixes, sprint.sprintId);
    results.push({ sprintId: sprint.sprintId, commitResults, grepCount, fixResults, files: sprint.files });
  }
  return results;
}

// Map fix description fragments to likely code paths for verification
const FIX_MAP = [
  { rx: /shared[-\s]?memory|memory manager/i, paths: ['src/lib/memory/shared-memory.ts'] },
  { rx: /tool[-\s]?registry|registry/i, paths: ['src/lib/tools/tool-registry.ts'] },
  { rx: /diagnostic|namespace|pod health|rca/i, paths: ['src/tools/**','src/v2/**'] },
  { rx: /types|interface|schema/i, paths: ['src/lib/types/**','src/types/**'] },
  { rx: /openshift|oc[-\s]?client/i, paths: ['src/lib/openshift-client*.ts','src/lib/openshift-client*/**'] },
];

function pathExists(p) { try { return fs.existsSync(p); } catch { return false; } }

function globsToPaths(globs) {
  // crude glob expansion: handle ** and * minimally
  const out = new Set();
  for (const g of globs) {
    if (!g.includes('*')) { out.add(g); continue; }
    const base = g.split('**')[0].split('*')[0] || 'src';
    const all = readFilesRec(path.join(ROOT, base.replace(/\/$/, '')));
    const rgx = new RegExp('^' + g
      .replace(/[.+^${}()|[\]\\]/g,'\\$&')
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*') + '$');
    for (const f of all) {
      const rel = path.relative(ROOT, f);
      if (rgx.test(rel)) out.add(rel);
    }
  }
  return [...out];
}

function classifyFix(desc) {
  if (/process|documentation|guide|retrospective|checklist|policy|guardrails/i.test(desc)) return 'process';
  if (/test|jest|unit|integration/i.test(desc)) return 'tests';
  return 'code';
}

function verifyFixes(fixes, sprintId) {
  const results = [];
  for (const fx of fixes) {
    const category = classifyFix(fx);
    let paths = [];
    for (const m of FIX_MAP) if (m.rx.test(fx)) paths.push(...m.paths);
    if (paths.length === 0 && category === 'code') paths = ['src/**'];
    const expanded = globsToPaths(paths);
    // signal if any of these paths were touched in the release history
    let touchedCount = 0;
    for (const p of expanded.slice(0, 30)) {
      try {
        const out = execSync(`git log --oneline -- ${JSON.stringify(p)}`, { encoding: 'utf8', stdio: ['ignore','pipe','ignore'] });
        if (out && out.trim()) touchedCount++;
      } catch { /* ignore */ }
    }
    // Confidence levels
    // - high: commit present in sprint + touched path in release
    // - medium: sprint id appears in release log (grepCount handled separately) or touched path
    // - low: description-only, no signals
    let confidence = 'low';
    if (touchedCount > 0) confidence = 'medium';
    results.push({ description: fx, category, paths: expanded.slice(0, 30), present: touchedCount > 0, confidence });
  }
  return results;
}

function writeHotfixScript(missingCommits) {
  const ts = new Date().toISOString().replace(/[-:TZ]/g, '').slice(0, 12);
  const name = `hotfix/sprint-restore-${ts}`;
  const lines = [];
  lines.push('#!/usr/bin/env bash');
  lines.push('set -euo pipefail');
  lines.push('echo "Creating hotfix branch from release/v0.9.0-beta"');
  lines.push('git checkout -f release/v0.9.0-beta');
  lines.push(`git checkout -b ${name}`);
  if (missingCommits.length) {
    lines.push('echo "Cherry-picking missing commits..."');
    for (const c of missingCommits) lines.push(`git cherry-pick -x ${c}`);
  } else {
    lines.push('echo "No missing commits detected."');
  }
  lines.push('echo "Resolve conflicts if any, then push:"');
  lines.push(`echo git push -u origin ${name}`);
  lines.push('echo "Open PR into release/v0.9.0-beta"');
  const outPath = path.join(ART_DIR, 'hotfix-restore.sh');
  fs.writeFileSync(outPath, lines.join('\n') + '\n');
  try { fs.chmodSync(outPath, 0o755); } catch {}
  return { name, script: outPath };
}
function writeReport(inv, xref) {
  const md = [];
  md.push('# Sprint Audit Report (Beta 9)');
  md.push('');
  md.push(`Generated: ${new Date().toString()}`);
  md.push('Branch: release/v0.9.0-beta');
  md.push('');
  for (const s of xref) {
    md.push(`## ${s.sprintId}`);
    md.push('- Files: ' + s.files.join(', '));
    const presentCount = s.commitResults.filter(c=>c.present).length;
    md.push(`- Commits present: ${presentCount}/${s.commitResults.length}`);
    md.push(`- Sprint ID occurrences in log: ${s.grepCount}`);
    if (s.commitResults.length) {
      md.push('### Commits');
      for (const c of s.commitResults) {
        md.push(`- ${c.present ? '✅' : '❌'} ${c.hash}`);
      }
    }
    if (s.fixResults.length) {
      md.push('### Fixes');
      for (const f of s.fixResults) {
        md.push(`- ${f.present ? '✅' : '❌'} ${f.description}`);
      }
    }
    md.push('');
  }
  // Summary with restoration plan
  const missing = [];
  for (const s of xref) {
    for (const c of s.commitResults) if (!c.present) missing.push({ sprintId: s.sprintId, type: 'commit', ref: c.hash });
    for (const f of s.fixResults) if (!f.present && f.category === 'code') missing.push({ sprintId: s.sprintId, type: 'fix', ref: f.description });
  }
  md.push('## Summary & Restoration Plan');
  if (missing.length === 0) {
    md.push('- All sprint commits/fixes appear present in release/v0.9.0-beta.');
  } else {
    md.push(`- Missing items detected: ${missing.length}`);
    for (const m of missing.slice(0,50)) {
      md.push(`  - [${m.sprintId}] (${m.type}) ${m.ref}`);
    }
    md.push('');
    md.push('Proposed restoration steps:');
    md.push('- For missing commits: cherry-pick using the commands below.');
    md.push('- For missing code fixes without explicit commits: craft targeted patches against the mapped files, then commit to the hotfix branch.');
    const missCommits = missing.filter(x=>x.type==='commit').map(x=>x.ref);
    const { name, script } = writeHotfixScript(missCommits);
    md.push('');
    md.push('### Hotfix Branch Script');
    md.push('```bash');
    md.push(`# Generated script: ${path.relative(ROOT, script)}`);
    md.push(`# Creates ${name} and cherry-picks missing commits`);
    md.push(`bash ${path.relative(ROOT, script)}`);
    md.push('```');
    if (missCommits.length) {
      md.push('');
      md.push('### Cherry-pick Commands');
      md.push('```bash');
      md.push('git checkout -f release/v0.9.0-beta');
      md.push(`git checkout -b ${name}`);
      for (const c of missCommits) md.push(`git cherry-pick -x ${c}`);
      md.push('```');
    }
  }
  fs.writeFileSync(path.join(ROOT, 'REPORT_SPRINT_AUDIT.md'), md.join('\n'));
}

// Run
const inv = collectInventory();
fs.writeFileSync(path.join(ART_DIR, 'sprint_inventory.json'), JSON.stringify(inv, null, 2));
const log = getReleaseLog();
fs.writeFileSync(path.join(ART_DIR, 'release_log.txt'), log.join('\n'));
const xref = crossRef(inv, log);
fs.writeFileSync(path.join(ART_DIR, 'sprint_xref.json'), JSON.stringify(xref, null, 2));
writeReport(inv, xref);
console.log('Sprint audit completed. See REPORT_SPRINT_AUDIT.md and artifacts/sprint-audit/*.');
