/**
 * Unit tests for TemplateEngine (offline-safe)
 */

import { describe, it, expect } from '@jest/globals';

describe('TemplateEngine', () => {
  it('builds a plan with variable replacement and step budget', async () => {
    const { TemplateEngine } = await import('../../../src/lib/templates/template-engine');

    const template: any = {
      id: 'demo',
      title: 'Demo',
      boundaries: { maxSteps: 5, timeoutMs: 10000 },
      // do not include blocks to avoid BlockRegistry dependency in this offline test
      steps: [
        { tool: 'oc_read_get_pods', params: { namespace: '<ns>' }, rationale: 'list pods' },
        { tool: 'oc_read_describe', params: { resource: 'pod', name: '<pod>', namespace: '<ns>' } }
      ]
    };

    const te = new TemplateEngine();
    const out = te.buildPlan(template, {
      sessionId: 's-1',
      stepBudget: 1, // should clamp to 1 even though template has 2 steps
      vars: { ns: 'my-ns', pod: 'mypod' }
    });

    expect(out.planId).toBe('s-1');
    expect(out.boundaries.maxSteps).toBe(1);
    expect(out.steps).toHaveLength(1);
    expect(out.steps[0]).toEqual(
      expect.objectContaining({
        tool: 'oc_read_get_pods',
        params: expect.objectContaining({ sessionId: 's-1', namespace: 'my-ns' })
      })
    );
  });

  it('evaluates evidence completeness across selector types', async () => {
    const { TemplateEngine } = await import('../../../src/lib/templates/template-engine');

    const template: any = {
      id: 'ev',
      title: 'Evidence',
      boundaries: { maxSteps: 3, timeoutMs: 5000 },
      evidenceContract: {
        required: ['has_events', 'has_taints', 'mentions_key'],
        selectors: {
          has_events: [ { type: 'eventsRegex', path: '(?i)warning|error' } ],
          has_taints: [ { type: 'jsonpath', path: '{.spec.taints[*].key}' } ],
          mentions_key: [ { type: 'dsl', path: 'SCHEDULE' } ]
        }
      }
    };

    const te = new TemplateEngine();
    const executed = [
      { step: { tool: 'get_events', params: {} }, result: 'Normal Started\nWarning Something happened' },
      { step: { tool: 'get_node', params: {} }, result: JSON.stringify({ spec: { taints: [{ key: 'dedicated' }] } }) },
      { step: { tool: 'logs', params: {} }, result: 'Node SCHEDULE hidden' }
    ];

    const ev = te.evaluateEvidence(template, executed as any);
    expect(ev.completeness).toBe(1);
    expect(ev.missing).toHaveLength(0);
    expect(ev.present).toEqual(expect.arrayContaining(['has_events', 'has_taints', 'mentions_key']));
  });
});

