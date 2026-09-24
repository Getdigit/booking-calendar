import { useState } from 'react'
import { BookingForm } from './components/BookingForm'
import { BookingList } from './components/BookingList'
import { CalendarView } from './components/CalendarView'
import { PhoneSheet } from './components/PhoneSheet'
import { Summary } from './components/Summary'
import { isMock } from './data'
import { useAppInfo } from './hooks/useAppInfo'
import { useBookings } from './hooks/useBookings'
import { today } from './lib/dates'
import type { Booking } from './types'
import './App.css'

type View = 'list' | 'calendar'
type Editing = { booking?: Booking; start: string } | null

export default function App() {
  const { bookings, loading, error, reload, create, update, cancel } = useBookings()
  const { firstName, appUrl } = useAppInfo()
  const [view, setView] = useState<View>('list')
  const [editing, setEditing] = useState<Editing>(null)
  const [phoneOpen, setPhoneOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function flash(message: string) {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  const openBooking = (booking: Booking) => setEditing({ booking, start: booking.start })
  const newBooking = (start = today()) => setEditing({ start })

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-name">NUMA</span>
            <span className="brand-sub">Boekingen 🦞</span>
          </div>
          <button type="button" className="phone-btn" onClick={() => setPhoneOpen(true)}>
            <span aria-hidden="true">📲</span>
            <span className="phone-btn-label">Op je telefoon</span>
          </button>
        </div>
        <p className="greeting">{firstName ? `Hallo ${firstName} 👋` : 'Hallo 👋'}</p>
      </header>

      {isMock && <div className="mock-banner">Demomodus — voorbeelddata, niets wordt opgeslagen</div>}

      <main className="content">
        {loading && <p className="state">Boekingen laden…</p>}

        {error && (
          <div className="notice notice-error state-error" role="alert">
            <p>{error}</p>
            <button type="button" className="btn btn-small" onClick={reload}>
              Opnieuw proberen
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <Summary bookings={bookings} onOpen={openBooking} />

            <div className="segmented" role="tablist" aria-label="Weergave">
              <button type="button" role="tab" aria-selected={view === 'list'} className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')}>
                Lijst
              </button>
              <button type="button" role="tab" aria-selected={view === 'calendar'} className={view === 'calendar' ? 'is-active' : ''} onClick={() => setView('calendar')}>
                Kalender
              </button>
            </div>

            {view === 'list' ? (
              <BookingList bookings={bookings} onOpen={openBooking} />
            ) : (
              <CalendarView bookings={bookings} onOpen={openBooking} onNew={newBooking} />
            )}
          </>
        )}
      </main>

      {!loading && !error && (
        <button type="button" className="fab" onClick={() => newBooking()} aria-label="Nieuwe boeking">
          <span aria-hidden="true">＋</span>
          <span className="fab-label">Nieuwe boeking</span>
        </button>
      )}

      {editing && (
        <BookingForm
          booking={editing.booking}
          defaultStart={editing.start}
          bookings={bookings}
          onSave={async (input) => {
            if (editing.booking) await update(editing.booking.id, input)
            else await create(input)
            flash(editing.booking ? 'Boeking bijgewerkt' : 'Boeking toegevoegd')
          }}
          onCancelBooking={async (id) => {
            await cancel(id)
            flash('Boeking geannuleerd')
          }}
          onClose={() => setEditing(null)}
        />
      )}

      {phoneOpen && <PhoneSheet appUrl={appUrl} onClose={() => setPhoneOpen(false)} />}

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}
