/** A calendar-date value for native date inputs in the user's local timezone. */
export function toLocalDateInputValue(value: Date = new Date()) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Inclusive local-day boundaries for an ISO calendar date. */
export function localDayRange(value: string) {
  const start = new Date(`${value}T00:00:00`);
  const end = new Date(`${value}T23:59:59.999`);
  return { start, end };
}
