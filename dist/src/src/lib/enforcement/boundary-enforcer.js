export class BoundaryEnforcer {
    cfg;
    recent = [];
    constructor(cfg) {
        this.cfg = cfg;
    }
    filterSteps(steps) {
        let filtered = steps.slice(0, this.cfg.maxSteps);
        if (this.cfg.toolWhitelist && this.cfg.toolWhitelist.length) {
            filtered = filtered.filter(s => this.cfg.toolWhitelist.includes(s.tool));
        }
        if (this.cfg.allowedNamespaces && this.cfg.allowedNamespaces.length) {
            filtered = filtered.filter(s => {
                const ns = s.params?.namespace || '';
                return !ns || this.cfg.allowedNamespaces.includes(ns);
            });
        }
        if (this.cfg.circuit) {
            const now = Date.now();
            filtered = filtered.filter(s => {
                const key = `${s.tool}:${JSON.stringify(s.params || {})}`;
                const within = this.recent.filter(r => r.key === key && (now - r.at) < this.cfg.circuit.windowMs);
                if (within.length >= (this.cfg.circuit.maxRepeatCallsPerTool || 1))
                    return false;
                this.recent.push({ key, at: now });
                return true;
            });
            this.recent = this.recent.filter(r => (Date.now() - r.at) < (this.cfg.circuit.windowMs));
        }
        return filtered;
    }
}
