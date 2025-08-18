import Ajv from 'ajv';
import { EVIDENCE_VOCAB } from './vocab.mjs';

const ajv = new Ajv({ allErrors: true, strict: true });

export function buildSchema(scenario) {
  const vocab = EVIDENCE_VOCAB[scenario] || [];
  return {
    type: 'object',
    additionalProperties: false,
    required: ['priority', 'confidence', 'evidence_keys', 'notes'],
    properties: {
      priority: { enum: ['P1', 'P2', 'P3'] },
      confidence: { enum: ['High', 'Medium', 'Low'] },
      evidence_keys: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: vocab.length ? { enum: vocab } : { type: 'string', minLength: 1 }
      },
      notes: { type: 'string', maxLength: 200 }
    }
  };
}

export function getValidator(scenario) {
  try {
    const schema = buildSchema(scenario);
    return ajv.compile(schema);
  } catch (e) {
    // Fallback: accept any object
    return () => true;
  }
}

export function validateOutput(scenario, obj) {
  const validate = getValidator(scenario);
  const ok = validate(obj);
  return { ok, errors: ok ? null : (validate.errors || []) };
}

