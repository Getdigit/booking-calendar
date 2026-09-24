import { useState } from 'react'
import { SOON_DAYS } from '../config'
import { daysBetween, formatMonth, formatShort, nightsLabel, today } from '../lib/dates'
import type { Booking } from '../types'

interface Props {
  bookings: Booking[]
  onOpen: (booking: Booking) => void
}

type Filter = 'upcoming' | 'past'

function groupByMonth(bookings: Booking[]) {
  const groups: { month: string; items: Booking[] }[] = []
  for (const b of bookings) {
    const month = formatMonth(b.start)
    const last = groups[groups.length - 1]
    if (last?.month === month) last.items.push(b)
    else groups.push({ month, items: [b] })
  }
  return groups
}

function badge(b: Booking, t: string) {
  if (b.start <= t && t < b.end) return <span className="badge badge-now">Nu</span>
  if (b.end === t) return <span className="badge badge-now">Vertrekt vandaag</span>
  const until = daysBetween(t, b.start)
  if (until >= 0 && until <= SOON_DAYS) return <span className="badge badge-soon">Binnenkort</span>
  return null
}

export function BookingList({ bookings, onOpen }: Props) {
  const [filter, setFilter] = useState<Filter>('upcoming')
  const t = today()
  const upcoming = bookings.filter((b) => b.end >= t)
  const past = bookings.filter((b) => b.end < t).reverse()
  const shown = filter === 'upcoming' ? upcoming : past

  return (
    <section>
      <div className="chips" role="tablist" aria-label="Filter">
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'upcoming'}
          className={`chip ${filter === 'upcoming' ? 'is-active' : ''}`}
          onClick={() => setFilter('upcoming')}
        >
          Komend <span className="chip-count">{upcoming.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'past'}
          className={`chip ${filter === 'past' ? 'is-active' : ''}`}
          onClick={() => setFilter('past')}
        >
          Afgelopen <span className="chip-count">{past.length}</span>
        </button>
      </div>

      {shown.length === 0 && (
        <p className="empty">
          {filter === 'upcoming' ? 'Geen komende boekingen. Tik op + om er een toe te voegen.' : 'Nog geen afgelopen boekingen.'}
        </p>
      )}

      {groupByMonth(shown).map((group) => (
        <div key={group.month} className="month-group">
          <h3 className="month-title">{group.month}</h3>
          <ul className="booking-list">
            {group.items.map((b) => (
              <li key={b.id}>
                <button type="button" className="booking-card" onClick={() => onOpen(b)}>
                  <span className="booking-main">
                    <span className="booking-name">{b.name || 'Naamloze boeking'}</span>
                    <span className="booking-dates">
                      {formatShort(b.start)} <span className="arrow">→</span> {formatShort(b.end)}
                    </span>
                  </span>
                  <span className="booking-side">
                    {badge(b, t)}
                    <span className="booking-nights">{nightsLabel(daysBetween(b.start, b.end))}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
