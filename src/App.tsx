import { useCallback, useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import nlLocale from '@fullcalendar/core/locales/nl'
import type { DayCellContentArg } from '@fullcalendar/core'
import './App.css'

const START_FIELD = 'gd_startdate'
const END_FIELD = 'gd_enddate'

interface Booking {
  [key: string]: string
}

interface DataverseResponse {
  value: Booking[]
}

function toUtcDateStr(d: Date) {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function App() {
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set())
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
        const booked = new Set<string>()

        for (const b of data.value) {
          const start = b[START_FIELD]?.substring(0, 10)
          const end = b[END_FIELD]?.substring(0, 10)
          if (!start || !end) continue

          arrs.add(start)
          deps.add(end)

          const cur = new Date(`${start}T00:00:00Z`)
          const endDate = new Date(`${end}T00:00:00Z`)
          while (cur < endDate) {
            booked.add(toUtcDateStr(cur))
            cur.setUTCDate(cur.getUTCDate() + 1)
          }
        }

        setDepartureDates(deps)
        setArrivalDates(arrs)
        setBookedDates(booked)
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
      if (bookedDates.has(dateStr)) return ['fc-booked-day']
      return []
    },
    [departureDates, arrivalDates, bookedDates],
  )

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <span className="logo-text">NUMA</span>
          <span className="logo-lobster">🦞</span>
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

      <footer className="footer" />
    </div>
  )
}
