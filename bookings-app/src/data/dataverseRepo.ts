import type { IOperationResult } from '@microsoft/power-apps/data'
import { Gd_bookingsService } from '../generated/services/Gd_bookingsService'
import { COLUMNS } from '../config'
import type { Booking, BookingInput } from '../types'
import type { BookingsRepo } from './repo'

type Row = Record<string, unknown>
// The generated service is typed against the table model; we map through our own Booking type.
type CreateRecord = Parameters<typeof Gd_bookingsService.create>[0]
type UpdateRecord = Parameters<typeof Gd_bookingsService.update>[1]

function toBooking(row: Row): Booking | null {
  // Date-only columns can come back as "2026-09-04" or "2026-09-04T00:00:00Z"; keep the day.
  const start = String(row[COLUMNS.start] ?? '').slice(0, 10)
  const end = String(row[COLUMNS.end] ?? '').slice(0, 10)
  if (!start || !end) return null
  return {
    id: String(row[COLUMNS.id]),
    name: String(row[COLUMNS.name] ?? ''),
    start,
    end,
  }
}

function toRecord(input: BookingInput): Row {
  return {
    [COLUMNS.name]: input.name.trim(),
    [COLUMNS.start]: input.start,
    [COLUMNS.end]: input.end,
  }
}

function unwrap<T>(result: IOperationResult<T>, action: string): T {
  if (!result.success) {
    throw new Error(result.error?.message ? `${action} mislukt: ${result.error.message}` : `${action} mislukt`)
  }
  return result.data
}

export const dataverseRepo: BookingsRepo = {
  async list() {
    const result = await Gd_bookingsService.getAll({
      select: [COLUMNS.id, COLUMNS.name, COLUMNS.start, COLUMNS.end],
      filter: 'statecode eq 0',
      orderBy: [`${COLUMNS.start} asc`],
    })
    const rows = unwrap(result, 'Boekingen laden') as unknown as Row[]
    return rows.map(toBooking).filter((b): b is Booking => b !== null)
  },

  async create(input) {
    unwrap(await Gd_bookingsService.create(toRecord(input) as unknown as CreateRecord), 'Opslaan')
  },

  async update(id, input) {
    unwrap(await Gd_bookingsService.update(id, toRecord(input) as unknown as UpdateRecord), 'Opslaan')
  },

  async cancel(id) {
    const inactive = { statecode: 1, statuscode: 2 }
    unwrap(await Gd_bookingsService.update(id, inactive as unknown as UpdateRecord), 'Annuleren')
  },
}
