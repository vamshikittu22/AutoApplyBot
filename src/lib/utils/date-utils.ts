/**
 * Date normalization utilities for profile date fields.
 *
 * Resume parsers (old and new) may store dates in various formats:
 *   - "2025-02"       YYYY-MM  ← what <input type="month"> needs
 *   - "Feb 2025"      Month YYYY (old parser output)
 *   - "2025"          bare year
 *   - "Present"       literal string
 *   - ""              empty
 *
 * normalizeToMonthInput() converts any of these to a valid YYYY-MM string
 * (or returns "" for empty / "Present").
 */

const MONTH_NAMES: Record<string, string> = {
  jan: '01', january: '01',
  feb: '02', february: '02',
  mar: '03', march: '03',
  apr: '04', april: '04',
  may: '05',
  jun: '06', june: '06',
  jul: '07', july: '07',
  aug: '08', august: '08',
  sep: '09', september: '09',
  oct: '10', october: '10',
  nov: '11', november: '11',
  dec: '12', december: '12',
};

/**
 * Normalise an arbitrary date string to YYYY-MM suitable for
 * <input type="month">, or return "" if it can't be parsed.
 *
 * @param raw - raw date string from storage (any format)
 * @returns YYYY-MM string, or "" if unparseable / empty / "Present"
 */
export function normalizeToMonthInput(raw: string | undefined | null): string {
  if (!raw || /present|current/i.test(raw)) return '';

  const trimmed = raw.trim();

  // Already YYYY-MM
  if (/^\d{4}-\d{2}$/.test(trimmed)) return trimmed;

  // Bare year "2024" or "2025"
  if (/^\d{4}$/.test(trimmed)) return trimmed; // browser treats this as "2024-01" but blank display

  // "Feb 2025" or "February 2025"
  const monthYear = trimmed.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthYear) {
    const mm = MONTH_NAMES[monthYear[1]!.toLowerCase()];
    return mm ? `${monthYear[2]}-${mm}` : '';
  }

  // "2025 Feb" or "2025 February" (reversed)
  const yearMonth = trimmed.match(/^(\d{4})\s+([A-Za-z]+)$/);
  if (yearMonth) {
    const mm = MONTH_NAMES[yearMonth[2]!.toLowerCase()];
    return mm ? `${yearMonth[1]}-${mm}` : '';
  }

  return '';
}
