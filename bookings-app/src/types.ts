// Dates are plain calendar days ("YYYY-MM-DD"): no time or timezone, so a booking never
// shifts a day depending on where the app is opened.
export interface Booking {
  id: string
  name: string
  start: string // arrival day
  end: string // departure day
}

export interface BookingInput {
  name: string
  start: string
  end: string
}
