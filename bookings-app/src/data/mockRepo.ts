import { addDays, today } from '../lib/dates'
import type { Booking } from '../types'
import type { BookingsRepo } from './repo'

// In-memory data for trying out the UI without a Power Platform environment
// (`npm run dev:mock`). Nothing is saved.
const t = today()
let bookings: Booking[] = [
  { id: 'm1', name: 'Familie Peeters', start: addDays(t, -2), end: addDays(t, 2) },
  { id: 'm2', name: 'Sarah & Tom', start: addDays(t, 2), end: addDays(t, 5) },
  { id: 'm3', name: 'Jan De Smet', start: addDays(t, 9), end: addDays(t, 16) },
  { id: 'm4', name: 'Vriendengroep Gent', start: addDays(t, 24), end: addDays(t, 27) },
  { id: 'm5', name: 'Familie Claes', start: addDays(t, 41), end: addDays(t, 48) },
]

const wait = () => new Promise((r) => setTimeout(r, 250))
const sorted = () => [...bookings].sort((a, b) => a.start.localeCompare(b.start))

export const mockRepo: BookingsRepo = {
  async list() {
    await wait()
    return sorted()
  },
  async create(input) {
    await wait()
    bookings.push({ id: crypto.randomUUID(), ...input })
  },
  async update(id, input) {
    await wait()
    bookings = bookings.map((b) => (b.id === id ? { ...b, ...input } : b))
  },
  async cancel(id) {
    await wait()
    bookings = bookings.filter((b) => b.id !== id)
  },
}
