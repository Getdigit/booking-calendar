import type { Booking, BookingInput } from '../types'

export interface BookingsRepo {
  /** Active bookings, ordered by arrival. */
  list(): Promise<Booking[]>
  create(input: BookingInput): Promise<void>
  update(id: string, input: BookingInput): Promise<void>
  /** Deactivates the booking (kept in Dataverse, hidden from the calendar). */
  cancel(id: string): Promise<void>
}
