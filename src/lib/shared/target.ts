export type TargetSelector =
  | "all"
  | "system"
  | "user"
  | {
      names?: string[];
      labelSelector?: string;
      regex?: string;
      sample?: { size: number; seed?: number | string };
    };

export interface Target {
  scope: "cluster" | "namespaces";
  selector: TargetSelector;
}

export function isTarget(value: any): value is Target {
  if (!value || typeof value !== "object") return false;
  if (!("scope" in value) || !("selector" in value)) return false;
  if (value.scope !== "cluster" && value.scope !== "namespaces") return false;
  const s = value.selector;
  if (typeof s === "string") return s === "all" || s === "system" || s === "user";
  if (typeof s === "object") {
    if (s.names && (!Array.isArray(s.names) || s.names.some(n => typeof n !== "string"))) return false;
    if (s.labelSelector && typeof s.labelSelector !== "string") return false;
    if (s.regex && typeof s.regex !== "string") return false;
    if (s.sample) {
      if (typeof s.sample.size !== "number" || s.sample.size < 1) return false;
      if (s.sample.seed && typeof s.sample.seed !== "number" && typeof s.sample.seed !== "string") return false;
    }
    return true;
  }
  return false;
}

