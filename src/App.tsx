import { useCallback, useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import nlLocale from '@fullcalendar/core/locales/nl'
import type { DayCellContentArg, EventInput } from '@fullcalendar/core'
import './App.css'

const START_FIELD = 'gd_startdate'
const END_FIELD = 'gd_enddate'
const ID_FIELD = 'gd_bookingid'

interface Booking {
  [key: string]: string
}

interface DataverseResponse {
  value: Booking[]
}

export default function App() {
  const [events, setEvents] = useState<EventInput[]>([])
  const [departureDates, setDepartureDates] = useState<Set<string>>(new Set())
  const [arrivalDates, setArrivalDates] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}bookings.json`)
      .then(r => {
        if (!r.ok) throw new Error('fetch failed')
        return r.json() as Promise<DataverseResponse>
      })
      .then(data => {
        const deps = new Set<string>()
        const arrs = new Set<string>()
        const evts: EventInput[] = []

        for (const [i, b] of data.value.entries()) {
          const start = b[START_FIELD]?.substring(0, 10)
          const end = b[END_FIELD]?.substring(0, 10)
          if (start) arrs.add(start)
          if (end) deps.add(end)
          evts.push({
            id: b[ID_FIELD] ?? String(i),
            title: 'Geboekt',
            start,
            end,
            allDay: true,
            display: 'background',
            backgroundColor: '#D64A2A',
          })
        }

        setDepartureDates(deps)
        setArrivalDates(arrs)
        setEvents(evts)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const cellClassNames = useCallback(
    ({ date }: DayCellContentArg) => {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      const dateStr = `${y}-${m}-${d}`
      const isDep = departureDates.has(dateStr)
      const isArr = arrivalDates.has(dateStr)
      if (isDep && isArr) return ['fc-transition-day']
      if (isDep) return ['fc-departure-day']
      if (isArr) return ['fc-arrival-day']
      return []
    },
    [departureDates, arrivalDates],
  )

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <span className="logo-text">NUMA</span>
          <span className="logo-sub">Nieuwpoort</span>
        </div>
      </header>

      <main className="calendar-wrap">
        {loading && <div className="state-msg">Laden…</div>}
        {error && <div className="state-msg error">Kon de agenda niet laden.</div>}
        {!loading && !error && (
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            locale={nlLocale}
            events={events}
            dayCellClassNames={cellClassNames}
            headerToolbar={{
              left: 'prev',
              center: 'title',
              right: 'next',
            }}
            height="auto"
            fixedWeekCount={false}
          />
        )}
      </main>

      <footer className="footer">
        <span className="lobster">🦞</span>
      </footer>
    </div>
  )
}
