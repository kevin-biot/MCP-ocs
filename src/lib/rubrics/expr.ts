// Tiny safe boolean expression evaluator for guards/mapping
// Supports: identifiers, numbers, booleans, operators: ==, !=, >=, <=, >, <, &&, ||, parentheses
// No function calls, no member access

type TokenType = 'id' | 'num' | 'bool' | 'op' | 'lparen' | 'rparen' | 'eof';

interface Token { type: TokenType; value?: string }

function tokenize(input: string): Token[] {
  const src = input.trim();
  const tokens: Token[] = [];
  let i = 0;
  const isSpace = (c: string) => /\s/.test(c);
  const isAlpha = (c: string) => /[A-Za-z_]/.test(c);
  const isNum = (c: string) => /[0-9.]/.test(c);
  while (i < src.length) {
    const c = src.charAt(i);
    if (isSpace(c)) { i++; continue; }
    if (c === '(') { tokens.push({ type: 'lparen' }); i++; continue; }
    if (c === ')') { tokens.push({ type: 'rparen' }); i++; continue; }
    // multi-char ops
    if (src.slice(i, i+2) === '&&') { tokens.push({ type: 'op', value: '&&' }); i+=2; continue; }
    if (src.slice(i, i+2) === '||') { tokens.push({ type: 'op', value: '||' }); i+=2; continue; }
    if (src.slice(i, i+2) === '>=') { tokens.push({ type: 'op', value: '>=' }); i+=2; continue; }
    if (src.slice(i, i+2) === '<=') { tokens.push({ type: 'op', value: '<=' }); i+=2; continue; }
    if (src.slice(i, i+2) === '==') { tokens.push({ type: 'op', value: '==' }); i+=2; continue; }
    if (src.slice(i, i+2) === '!=') { tokens.push({ type: 'op', value: '!=' }); i+=2; continue; }
    // single-char ops
    if ('><'.includes(c)) { tokens.push({ type: 'op', value: c }); i++; continue; }
    // number
    if (isNum(c)) {
      let j = i+1;
      while (j < src.length && isNum(src.charAt(j))) j++;
      tokens.push({ type: 'num', value: src.slice(i, j) });
      i = j; continue;
    }
    // identifier / boolean
    if (isAlpha(c)) {
      let j = i+1;
      while (j < src.length && /[A-Za-z0-9_]/.test(src.charAt(j))) j++;
      const word = src.slice(i, j);
      if (/^(true|false)$/i.test(word)) tokens.push({ type: 'bool', value: word.toLowerCase() });
      else tokens.push({ type: 'id', value: word });
      i = j; continue;
    }
    // unknown
    throw new Error(`expr: unexpected character '${c}' at ${i}`);
  }
  tokens.push({ type: 'eof' });
  return tokens;
}

export class ExprEvaluator {
  private tokens: Token[] = [];
  private pos = 0;
  private ctx: Record<string, any> = {};

  evaluate(expression: string, context: Record<string, any>): boolean {
    const exp = expression.trim();
    if (!exp || exp.toLowerCase() === 'otherwise') return true; // treat as fallback true
    this.tokens = tokenize(exp);
    this.pos = 0;
    this.ctx = context || {};
    const val = this.parseOr();
    this.expect('eof');
    return Boolean(val);
  }

  private current(): Token { return this.tokens[this.pos] || { type: 'eof' }; }
  private eat(): Token { return this.tokens[this.pos++] || { type: 'eof' }; }
  private expect(type: TokenType) { if (this.current().type !== type) throw new Error(`expr: expected ${type}`); this.eat(); }

  // or := and ('||' and)*
  private parseOr(): any {
    let left = this.parseAnd();
    while (this.current().type === 'op' && this.current().value === '||') {
      this.eat();
      const right = this.parseAnd();
      left = Boolean(left) || Boolean(right);
    }
    return left;
  }
  // and := comp ('&&' comp)*
  private parseAnd(): any {
    let left = this.parseComp();
    while (this.current().type === 'op' && this.current().value === '&&') {
      this.eat();
      const right = this.parseComp();
      left = Boolean(left) && Boolean(right);
    }
    return left;
  }
  // comp := term (op term)?
  private parseComp(): any {
    let left = this.parseTerm();
    const tok = this.current();
    if (tok.type === 'op' && ['==','!=','>=','<=','>','<'].includes(tok.value || '')) {
      this.eat();
      const right = this.parseTerm();
      const l = this.toValue(left);
      const r = this.toValue(right);
      switch (tok.value) {
        case '==': return l === r;
        case '!=': return l !== r;
        case '>=': return Number(l) >= Number(r);
        case '<=': return Number(l) <= Number(r);
        case '>': return Number(l) > Number(r);
        case '<': return Number(l) < Number(r);
      }
    }
    return left;
  }
  // term := num | bool | id | '(' or ')'
  private parseTerm(): any {
    const tok = this.current();
    if (tok.type === 'num') { this.eat(); return Number(tok.value); }
    if (tok.type === 'bool') { this.eat(); return tok.value === 'true'; }
    if (tok.type === 'id') { this.eat(); return this.ctx[tok.value || '']; }
    if (tok.type === 'lparen') { this.eat(); const v = this.parseOr(); this.expect('rparen'); return v; }
    throw new Error(`expr: unexpected token ${tok.type}`);
  }
  private toValue(v: any): any { return v; }
}

// Simple normalizer: supports 'clamp:a..b->c..d'
export function normalize(value: number, spec?: string): number {
  if (!spec) return value;
  const m = spec.match(/^clamp:(\d+(?:\.\d+)?)\.\.(\d+(?:\.\d+)?)\-\>(\d+(?:\.\d+)?)\.\.(\d+(?:\.\d+)?)/i);
  if (!m) return value;
  const inMin = m[1] ?? '';
  const inMax = m[2] ?? '';
  const outMin = m[3] ?? '';
  const outMax = m[4] ?? '';
  const imin = Number(inMin), imax = Number(inMax), omin = Number(outMin), omax = Number(outMax);
  const clamped = Math.max(imin, Math.min(imax, value));
  const ratio = (clamped - imin) / (imax - imin || 1);
  return omin + ratio * (omax - omin);
}
