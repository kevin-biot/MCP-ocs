export function nowIso(): string {
  return new Date().toISOString();
}

export function isValidDateInput(input: unknown): boolean {
  const d = new Date(input as any);
  return !isNaN(d.getTime());
}

