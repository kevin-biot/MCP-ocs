export function normalize(s = "") {
  try {
    return String(s)
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{2,}/g, "\n\n")
      .trim();
  } catch { return String(s || ""); }
}

