import { useState, type FormEvent } from 'react'
import { addDays, daysBetween, findConflicts, formatLong, formatShort, nightsLabel } from '../lib/dates'
import type { Booking, BookingInput } from '../types'
import { Sheet } from './Sheet'

interface Props {
  /** Existing booking to edit; omitted for a new one. */
  booking?: Booking
  defaultStart: string
  bookings: Booking[]
  onSave: (input: BookingInput) => Promise<void>
  onCancelBooking: (id: string) => Promise<void>
  onClose: () => void
}

const QUICK_NIGHTS = [1, 2, 3, 7]

export function BookingForm({ booking, defaultStart, bookings, onSave, onCancelBooking, onClose }: Props) {
  const [name, setName] = useState(booking?.name ?? '')
  const [start, setStart] = useState(booking?.start ?? defaultStart)
  const [end, setEnd] = useState(booking?.end ?? addDays(defaultStart, 1))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmingCancel, setConfirmingCancel] = useState(false)

  const nights = start && end ? daysBetween(start, end) : 0
  const validRange = nights > 0
  const conflicts = validRange ? findConflicts({ start, end }, bookings, booking?.id) : []
  const canSave = name.trim() !== '' && validRange && conflicts.length === 0 && !busy

  function changeStart(value: string) {
    setStart(value)
    // Keep the stay length when moving the arrival day.
    if (value) setEnd(addDays(value, Math.max(nights, 1)))
  }

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await action()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setBusy(false)
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (canSave) run(() => onSave({ name, start, end }))
  }

  return (
    <Sheet title={booking ? 'Boeking bewerken' : 'Nieuwe boeking'} onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <label className="field">
          <span className="field-label">Naam</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="bv. Familie Peeters"
            autoFocus={!booking}
            required
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span className="field-label">Aankomst</span>
            <input type="date" value={start} onChange={(e) => changeStart(e.target.value)} required />
          </label>
          <label className="field">
            <span className="field-label">Vertrek</span>
            <input type="date" value={end} min={start ? addDays(start, 1) : undefined} onChange={(e) => setEnd(e.target.value)} required />
          </label>
        </div>

        <div className="quick-nights" aria-label="Snel aantal nachten kiezen">
          {QUICK_NIGHTS.map((n) => (
            <button
              key={n}
              type="button"
              className={`chip ${nights === n ? 'is-active' : ''}`}
              onClick={() => start && setEnd(addDays(start, n))}
            >
              {nightsLabel(n)}
            </button>
          ))}
        </div>

        {validRange ? (
          <p className="stay-summary">
            {nightsLabel(nights)} · {formatLong(start)} tot {formatLong(end)}
          </p>
        ) : (
          <p className="notice notice-error">De vertrekdag moet na de aankomstdag liggen.</p>
        )}

        {conflicts.length > 0 && (
          <div className="notice notice-error" role="alert">
            <strong>Overlapt met een andere boeking:</strong>
            <ul>
              {conflicts.map((c) => (
                <li key={c.id}>
                  {c.name} ({formatShort(c.start)} → {formatShort(c.end)})
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <p className="notice notice-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary" disabled={!canSave}>
          {busy ? 'Bezig…' : booking ? 'Wijzigingen opslaan' : 'Boeking toevoegen'}
        </button>

        {booking &&
          (confirmingCancel ? (
            <div className="confirm">
              <p>Deze boeking annuleren? Ze verdwijnt uit de kalender.</p>
              <div className="confirm-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setConfirmingCancel(false)} disabled={busy}>
                  Nee
                </button>
                <button type="button" className="btn btn-danger" onClick={() => run(() => onCancelBooking(booking.id))} disabled={busy}>
                  Ja, annuleren
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="btn btn-link-danger" onClick={() => setConfirmingCancel(true)}>
              Boeking annuleren
            </button>
          ))}
      </form>
    </Sheet>
  )
}
