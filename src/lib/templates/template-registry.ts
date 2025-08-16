import fs from 'fs/promises';
import path from 'path';
import { DiagnosticTemplate, TemplateSelection } from './template-types.js';

export class TemplateRegistry {
  private templates: Map<string, DiagnosticTemplate> = new Map();
  private byTarget: Map<string, DiagnosticTemplate[]> = new Map();
  constructor(private baseDir: string = path.join(process.cwd(), 'src', 'lib', 'templates', 'templates')) {}

  async load(): Promise<void> {
    this.templates.clear();
    this.byTarget.clear();
    let files: string[] = [];
    try {
      files = await fs.readdir(this.baseDir);
    } catch {
      return;
    }
    for (const f of files) {
      if (!f.endsWith('.json')) continue;
      try {
        const raw = await fs.readFile(path.join(this.baseDir, f), 'utf8');
        const t: DiagnosticTemplate = JSON.parse(raw);
        if (!t?.id || !t?.triageTarget || !Array.isArray(t?.steps)) continue;
        this.templates.set(t.id, t);
        const list = this.byTarget.get(t.triageTarget) || [];
        list.push(t);
        this.byTarget.set(t.triageTarget, list);
      } catch {
        continue;
      }
    }
  }

  getById(id: string): DiagnosticTemplate | undefined {
    return this.templates.get(id);
  }

  selectByTarget(target: string): TemplateSelection | undefined {
    const list = this.byTarget.get(target) || [];
    if (list.length === 0) return undefined;
    // For now, pick the latest by version lexical; future: semver compare
    const sorted = list.slice().sort((a, b) => (a.version || '').localeCompare(b.version || ''));
    const pick = sorted[sorted.length - 1];
    return { template: pick, reason: `latest for target ${target}` };
  }
}

