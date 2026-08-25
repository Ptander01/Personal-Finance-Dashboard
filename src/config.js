/**
 * Everything about this dashboard that is about *you* rather than about the code.
 * Edit this file; nothing else needs to change.
 */
export const config = {
  /** Shown in the header. Two parts so the second renders in the accent style. */
  title: { lead: "Your", accent: "Finances" },

  /** Browser tab title. */
  documentTitle: "Personal Finance Dashboard",

  /** Currency formatting. */
  locale: "en-US",
  currency: "USD",
};

/**
 * The years the dashboard offers, derived from the data rather than hardcoded.
 * Import your own data.json with a different span and the selector follows it.
 */
export function yearsFrom(data) {
  return Object.keys(data.by_year_total || {}).map(Number).sort((a, b) => a - b);
}
