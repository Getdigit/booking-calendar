import type { Booking } from '../types'

const DAY_MS = 24 * 60 * 60 * 1000

/** Parses "YYYY-MM-DD" as a UTC midnight timestamp (timezone-proof day arithmetic). */
function toUtc(day: string): number {
  const [y, m, d] = day.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

export function toDayString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function today(): string {
  return toDayString(new Date())
}

export function addDays(day: string, n: number): string {
  const t = new Date(toUtc(day) + n * DAY_MS)
  return t.toISOString().slice(0, 10)
}

export function daysBetween(from: string, to: string): number {
  return Math.round((toUtc(to) - toUtc(from)) / DAY_MS)
}

const weekdayFmt = new Intl.DateTimeFormat('nl-BE', { weekday: 'short', timeZone: 'UTC' })
const dayMonthFmt = new Intl.DateTimeFormat('nl-BE', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const longFmt = new Intl.DateTimeFormat('nl-BE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
const monthFmt = new Intl.DateTimeFormat('nl-BE', { month: 'long', year: 'numeric', timeZone: 'UTC' })

/** "vr 4 sep" */
export function formatShort(day: string): string {
  const d = new Date(toUtc(day))
  return `${weekdayFmt.format(d).replace('.', '')} ${dayMonthFmt.format(d).replace('.', '')}`
}

/** "vrijdag 4 september" */
export function formatLong(day: string): string {
  return longFmt.format(new Date(toUtc(day)))
}

/** "september 2026" for any day in that month */
export function formatMonth(day: string): string {
  return monthFmt.format(new Date(toUtc(day)))
}

export function nightsLabel(n: number): string {
  return n === 1 ? '1 nacht' : `${n} nachten`
}

/**
 * Two stays overlap when they share a night. Arriving on someone else's
 * departure day (a changeover) is fine.
 */
export function overlaps(a: { start: string; end: string }, b: { start: string; end: string }): boolean {
  return a.start < b.end && b.start < a.end
}

export function findConflicts(
  candidate: { start: string; end: string },
  bookings: Booking[],
  ignoreId?: string,
): Booking[] {
  return bookings.filter((b) => b.id !== ignoreId && overlaps(candidate, b))
}
