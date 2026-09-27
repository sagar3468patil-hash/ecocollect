/**
 * Generate a short unique request code for display.
 * Format: ECO-XXXXXX  (timestamp-based, 36-char encoded for brevity)
 * Not sequential — avoids race conditions on concurrent submissions.
 */
export function generateRequestCode() {
  const ts   = Date.now().toString(36).toUpperCase().slice(-4)
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase()
  return `ECO-${ts}${rand}`
}
