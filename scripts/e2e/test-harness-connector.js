#!/usr/bin/env node
// LMStudioConnector (stub-friendly) — OpenAI-compatible on localhost:1234
// Usage:
//   export LMSTUDIO_BASE_URL=http://localhost:1234/v1
//   export LMSTUDIO_MODEL=gpt-4o-mini (or your local model id)
//   export LMSTUDIO_API_KEY=lm-studio (LM Studio often ignores it)
//   new LMStudioConnector().sendDiagnosticPrompt('...')

import fetch from 'node-fetch';

export class LMStudioConnector {
  constructor(opts = {}) {
    this.baseUrl = opts.baseUrl || process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1';
    this.apiKey = opts.apiKey || process.env.LMSTUDIO_API_KEY || 'lm-studio';
    this.model = opts.model || process.env.LMSTUDIO_MODEL || 'local-model';
    this.timeoutMs = Number(process.env.LMSTUDIO_TIMEOUT_MS || '15000');
    this.maxTokens = Number(process.env.LMSTUDIO_MAX_TOKENS || '512');
    this.dryRun = process.env.LMSTUDIO_DRY_RUN === 'true';
  }

  async sendDiagnosticPrompt(prompt) {
    if (this.dryRun) {
      return { ok: true, source: 'stub', content: `DRY_RUN: ${prompt.slice(0, 80)}...` };
    }
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), this.timeoutMs);
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: this.maxTokens,
        }),
        signal: controller.signal,
      });
      clearTimeout(t);
      if (!res.ok) {
        const text = await res.text();
        return { ok: false, error: `HTTP ${res.status}: ${text}` };
      }
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content || '';
      return { ok: true, content, raw: data };
    } catch (e) {
      return { ok: false, error: e?.message || String(e) };
    }
  }

  async listModels() {
    if (this.dryRun) {
      return { ok: true, source: 'stub', data: { object: 'list', data: [ { id: 'stub-model' } ] } };
    }
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), this.timeoutMs);
      const res = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        signal: controller.signal,
      });
      clearTimeout(t);
      if (!res.ok) {
        const text = await res.text();
        return { ok: false, error: `HTTP ${res.status}: ${text}` };
      }
      const data = await res.json();
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: e?.message || String(e) };
    }
  }
}

// Quick self-test when invoked directly
if (process.argv[1] && process.argv[1].endsWith('test-harness-connector.js') && process.argv.includes('--self-test')) {
  const conn = new LMStudioConnector({});
  conn.sendDiagnosticPrompt('ping').then(r => {
    console.log(JSON.stringify(r, null, 2));
  });
}
