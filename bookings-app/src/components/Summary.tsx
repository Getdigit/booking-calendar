import { addDays, daysBetween, formatShort, today } from '../lib/dates'
import type { Booking } from '../types'

interface Props {
  bookings: Booking[]
  onOpen: (booking: Booking) => void
}

function occupancyThisMonth(bookings: Booking[], day: string) {
  const first = day.slice(0, 8) + '01'
  const nextMonth = addDays(first, 32).slice(0, 8) + '01'
  const daysInMonth = daysBetween(first, nextMonth)
  let nights = 0
  for (const b of bookings) {
    const from = b.start > first ? b.start : first
    const to = b.end < nextMonth ? b.end : nextMonth
    if (to > from) nights += daysBetween(from, to)
  }
  return { nights, pct: Math.round((nights / daysInMonth) * 100) }
}

function inDays(n: number) {
  if (n === 0) return 'vandaag'
  if (n === 1) return 'morgen'
  return `over ${n} dagen`
}

export function Summary({ bookings, onOpen }: Props) {
  const t = today()
  const current = bookings.find((b) => b.start <= t && t < b.end)
  const next = bookings.find((b) => b.start >= t && b !== current)
  const occ = occupancyThisMonth(bookings, t)

  return (
    <section className="summary" aria-label="Overzicht">
      <button
        type="button"
        className={`summary-card ${current ? 'is-busy' : 'is-free'}`}
        onClick={() => current && onOpen(current)}
        disabled={!current}
      >
        <span className="summary-label">Vandaag</span>
        <span className="summary-value">{current ? 'Bezet' : 'Vrij'}</span>
        <span className="summary-sub">
          {current ? `${current.name} · tot ${formatShort(current.end)}` : 'Geen gasten'}
        </span>
      </button>

      <button
        type="button"
        className="summary-card"
        onClick={() => next && onOpen(next)}
        disabled={!next}
      >
        <span className="summary-label">Volgende aankomst</span>
        <span className="summary-value">{next ? formatShort(next.start) : '—'}</span>
        <span className="summary-sub">
          {next ? `${next.name} · ${inDays(daysBetween(t, next.start))}` : 'Niets gepland'}
        </span>
      </button>

      <div className="summary-card">
        <span className="summary-label">Bezetting deze maand</span>
        <span className="summary-value">{occ.pct}%</span>
        <span className="summary-sub">
          {occ.nights} {occ.nights === 1 ? 'nacht' : 'nachten'} geboekt
        </span>
        <span className="summary-bar" aria-hidden="true">
          <span style={{ width: `${Math.min(occ.pct, 100)}%` }} />
        </span>
      </div>
    </section>
  )
}
