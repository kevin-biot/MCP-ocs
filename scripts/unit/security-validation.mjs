// Unit-level validation mirroring production logic for quick checks
function sanitizeForLogging(data){
  try{
    const s = typeof data === 'string' ? data : JSON.stringify(data);
    return s
      .replace(/(?:password|token|secret|key)=\S+/gi, '[REDACTED]')
      .replace(/Bearer\s+[A-Za-z0-9\-_.~+/=]+/g, 'Bearer REDACTED');
  }catch{ return '[unserializable]'; }
}
function isSafeInput(input){
  const s = String(input||'');
  if (s.length === 0 || s.length > 256) return false;
  if (!/^[A-Za-z0-9_.:\-\/]+$/.test(s)) return false;
  if (s.includes('..')) return false;
  return true;
}

const malicious = ['../../../etc/passwd', 'rm -rf /', '$(id)', '<script>', '{{7*7}}', 'token=abcd1234'];
const safe = ['openshift-ingress', 'my-pod-123', 'default', 'ns-1_2.3:port'];

console.log('SAFE_VALIDATION');
console.log(JSON.stringify({ malicious: malicious.map(v=>({v, ok: isSafeInput(v)})), safe: safe.map(v=>({v, ok: isSafeInput(v)})) }, null, 2));
console.log('SANITIZE_VALIDATION');
console.log(sanitizeForLogging('password=abc token=xyz Bearer a.b.c'));
