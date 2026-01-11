export function parseModerationMessage(raw?: unknown): string | null {
  if (!raw) return null;

  const s = String(raw).trim();
  if (!s) return null;

  const idx = s.lastIndexOf(":");
  if (idx === -1) return s;

  const tail = s.slice(idx + 1).trim();
  return tail || s;
}
