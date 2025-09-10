// Strict stdio setup to enforce MCP protocol safety
// - Suppresses stdout during server operation
// - Sanitizes stderr by removing emoji and non-ASCII symbols

function stripEmojis(input: string): string {
  // Remove common emoji/symbol unicode ranges and control any stray non-ASCII if present
  // Ranges include: Dingbats, Misc Symbols, Emoticons, Transport & Map, Supplemental Symbols
  return input
    .replace(/[\u2190-\u21FF]/g, '')   // arrows
    .replace(/[\u2300-\u23FF]/g, '')   // technical
    .replace(/[\u2460-\u24FF]/g, '')   // enclosed alphanumerics
    .replace(/[\u2600-\u26FF]/g, '')   // misc symbols
    .replace(/[\u2700-\u27BF]/g, '')   // dingbats
    .replace(/[\u1F300-\u1F5FF]/g, '') // symbols & pictographs
    .replace(/[\u1F600-\u1F64F]/g, '') // emoticons
    .replace(/[\u1F680-\u1F6FF]/g, '') // transport & map
    .replace(/[\u1F900-\u1F9FF]/g, '') // supplemental symbols
    .replace(/[\uFE0F]/g, '');          // variation selectors
}

export function setupStrictStdio(strict: boolean): void {
  if (!strict) return;
  // Suppress stdout entirely to keep protocol stream clean
  console.log = (() => {}) as typeof console.log;

  // Wrap stderr to sanitize emojis/non-ASCII symbols
  const origError = console.error.bind(console);
  console.error = ((...args: any[]) => {
    try {
      const sanitized = args.map((a) => {
        if (typeof a === 'string') return stripEmojis(a);
        if (a && typeof a.message === 'string') {
          // Preserve error objects but sanitize message when rendered
          try { a.message = stripEmojis(a.message); } catch {}
        }
        return a;
      });
      origError(...sanitized as Parameters<typeof console.error>);
    } catch {
      // As a last resort, avoid throwing during logging
      try { origError('[MCP-OCS]', 'non-fatal logging error'); } catch {}
    }
  }) as typeof console.error;
}

