import { useMemo, useState } from 'react'
import { addDays, formatMonth, today } from '../lib/dates'
import type { Booking } from '../types'

interface Props {
  bookings: Booking[]
  onOpen: (booking: Booking) => void
  onNew: (start: string) => void
}

const WEEKDAYS = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo']

function monthStart(day: string) {
  return day.slice(0, 8) + '01'
}

function shiftMonth(first: string, delta: number) {
  const [y, m] = first.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1 + delta, 1))
  return d.toISOString().slice(0, 10)
}

export function CalendarView({ bookings, onOpen, onNew }: Props) {
  const t = today()
  const [month, setMonth] = useState(monthStart(t))

  const cells = useMemo(() => {
    const [y, m] = month.split('-').map(Number)
    const offset = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7 // Monday first
    const gridStart = addDays(month, -offset)
    const nextMonth = shiftMonth(month, 1)
    const count = Math.ceil((offset + Number(addDays(nextMonth, -1).slice(8))) / 7) * 7
    return Array.from({ length: count }, (_, i) => addDays(gridStart, i))
  }, [month])

  function dayInfo(day: string) {
    const staying = bookings.find((b) => b.start <= day && day < b.end)
    const leaving = bookings.find((b) => b.end === day)
    const arriving = staying?.start === day
    let kind = ''
    if (arriving && leaving) kind = 'is-changeover'
    else if (arriving) kind = 'is-arrival'
    else if (staying) kind = 'is-booked'
    else if (leaving) kind = 'is-departure'
    return { kind, booking: staying ?? leaving, staying }
  }

  // A booked night opens that booking; a free night (including a departure day) starts a new one.
  function handleTap(day: string) {
    const { staying } = dayInfo(day)
    if (staying) onOpen(staying)
    else onNew(day)
  }

  return (
    <section className="calendar">
      <div className="calendar-nav">
        <button type="button" className="icon-btn" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Vorige maand">
          ‹
        </button>
        <h3 className="calendar-title">{formatMonth(month)}</h3>
        <button type="button" className="icon-btn" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Volgende maand">
          ›
        </button>
      </div>

      <div className="calendar-grid" role="grid">
        {WEEKDAYS.map((w) => (
          <div key={w} className="calendar-weekday" role="columnheader">
            {w}
          </div>
        ))}
        {cells.map((day) => {
          const { kind, booking } = dayInfo(day)
          const outside = day.slice(0, 7) !== month.slice(0, 7)
          const classes = ['calendar-day', kind, outside ? 'is-outside' : '', day === t ? 'is-today' : '']
          return (
            <button
              key={day}
              type="button"
              role="gridcell"
              className={classes.filter(Boolean).join(' ')}
              onClick={() => handleTap(day)}
              aria-label={`${day}${booking ? `, ${booking.name}` : ', vrij'}`}
            >
              <span className="calendar-num">{Number(day.slice(8))}</span>
            </button>
          )
        })}
      </div>

      <div className="legend" aria-label="Legenda">
        <span><i className="swatch is-booked" /> Bezet</span>
        <span><i className="swatch is-arrival" /> Aankomst</span>
        <span><i className="swatch is-departure" /> Vertrek</span>
        <span><i className="swatch is-changeover" /> Wissel</span>
      </div>
      <p className="hint">Tik op een bezette dag om de boeking te openen, of op een vrije dag om een nieuwe te starten.</p>
    </section>
  )
}
