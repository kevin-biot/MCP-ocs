import fs from 'fs/promises';
import path from 'path';
export class TemplateRegistry {
    baseDir;
    templates = new Map();
    byTarget = new Map();
    constructor(baseDir = path.join(process.cwd(), 'src', 'lib', 'templates', 'templates')) {
        this.baseDir = baseDir;
    }
    async load() {
        this.templates.clear();
        this.byTarget.clear();
        let files = [];
        try {
            files = await fs.readdir(this.baseDir);
        }
        catch {
            return;
        }
        for (const f of files) {
            if (!f.endsWith('.json'))
                continue;
            try {
                const raw = await fs.readFile(path.join(this.baseDir, f), 'utf8');
                const t = JSON.parse(raw);
                if (!t?.id || !t?.triageTarget || !Array.isArray(t?.steps))
                    continue;
                this.templates.set(t.id, t);
                const list = this.byTarget.get(t.triageTarget) || [];
                list.push(t);
                this.byTarget.set(t.triageTarget, list);
            }
            catch {
                continue;
            }
        }
    }
    getById(id) {
        return this.templates.get(id);
    }
    selectByTarget(target) {
        const list = this.byTarget.get(target) || [];
        if (list.length === 0)
            return undefined;
        // For now, pick the latest by version lexical; future: semver compare
        const sorted = list.slice().sort((a, b) => (a.version || '').localeCompare(b.version || ''));
        const pick = sorted.at(-1);
        if (!pick)
            return undefined;
        return { template: pick, reason: `latest for target ${target}` };
    }
}
