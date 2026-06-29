export type PeriodMode = "week" | "month"

export function parseDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export function startOfWeek(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay()
  const diff = day === 0 ? -6 : 1 - day
  result.setDate(result.getDate() + diff)
  result.setHours(0, 0, 0, 0)
  return result
}

export function endOfWeek(date: Date): Date {
  const result = startOfWeek(date)
  result.setDate(result.getDate() + 6)
  result.setHours(23, 59, 59, 999)
  return result
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

export function isWithinPeriod(
  isoDate: string,
  anchor: Date,
  mode: PeriodMode
): boolean {
  const date = parseDate(isoDate)
  const start = mode === "week" ? startOfWeek(anchor) : startOfMonth(anchor)
  const end = mode === "week" ? endOfWeek(anchor) : endOfMonth(anchor)
  return date >= start && date <= end
}

export function getPeriodRange(anchor: Date, mode: PeriodMode) {
  const start = mode === "week" ? startOfWeek(anchor) : startOfMonth(anchor)
  const end = mode === "week" ? endOfWeek(anchor) : endOfMonth(anchor)
  return { start, end }
}

export function shiftPeriod(anchor: Date, mode: PeriodMode, direction: -1 | 1): Date {
  const result = new Date(anchor)
  if (mode === "week") {
    result.setDate(result.getDate() + direction * 7)
  } else {
    result.setMonth(result.getMonth() + direction)
  }
  return result
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function formatFullDate(isoDate: string): string {
  return parseDate(isoDate).toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function formatPeriodLabel(anchor: Date, mode: PeriodMode): string {
  if (mode === "month") {
    return anchor.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  const start = startOfWeek(anchor)
  const end = endOfWeek(anchor)
  const sameMonth = start.getMonth() === end.getMonth()

  if (sameMonth) {
    return `${formatShortDate(start)} – ${end.getDate()}, ${start.getFullYear()}`
  }

  return `${formatShortDate(start)} – ${formatShortDate(end)}, ${end.getFullYear()}`
}

export function toInputDateValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}
