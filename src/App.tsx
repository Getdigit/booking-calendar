import { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import nlLocale from '@fullcalendar/core/locales/nl'
import type { EventInput } from '@fullcalendar/core'
import './App.css'

// Field names from gd_Bookings — confirmed on first workflow run
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}bookings.json`)
      .then(r => {
        if (!r.ok) throw new Error('fetch failed')
        return r.json() as Promise<DataverseResponse>
      })
      .then(data => {
        setEvents(
          data.value.map((b, i) => ({
            id: b[ID_FIELD] ?? String(i),
            title: 'Geboekt',
            start: b[START_FIELD]?.substring(0, 10),
            end: b[END_FIELD]?.substring(0, 10),
            allDay: true,
            display: 'background',
            backgroundColor: '#D64A2A',
          }))
        )
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

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
