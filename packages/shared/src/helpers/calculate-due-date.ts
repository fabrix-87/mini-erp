import { DueDateRule } from "../types";

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

/** Last day of the month of `date` (UTC). */
const endOfMonth = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));

/**
 * Computes the due date of one term from the document date (UTC calendar days).
 * END_OF_MONTH is the end of the month of (document date + dueDays)
 * FIXED_DAY is the given day of the month offset by fixedMonthOffset, clamped to the month length.
 */
export function calculateDueDate(term: DueDateRule, base: Date): Date {
  switch (term.termType) {
    case "ANTICIPATED":
      return base;
    case "DAYS_FROM_INVOICE":
      return addDays(base, term.dueDays);
    case "END_OF_MONTH":
      return endOfMonth(addDays(base, term.dueDays));
    case "FIXED_DAY": {
      const month = new Date(
        Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + term.fixedMonthOffset, 1),
      );
      const last = endOfMonth(month).getUTCDate();
      return new Date(
        Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), Math.min(term.fixedDay ?? 1, last)),
      );
    }
  }
}
