import { useCallback, useEffect, useState } from 'react'
import { bookingsRepo } from '../data'
import type { Booking, BookingInput } from '../types'

function message(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

type LoadResult = { data: Booking[]; error: null } | { data: null; error: string }

async function fetchBookings(): Promise<LoadResult> {
  try {
    return { data: await bookingsRepo.list(), error: null }
  } catch (err) {
    console.error('Loading bookings failed:', err)
    return { data: null, error: `Kon de boekingen niet laden: ${message(err)}` }
  }
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const apply = useCallback((result: LoadResult) => {
    if (result.data) setBookings(result.data)
    setError(result.error)
    setLoading(false)
  }, [])

  useEffect(() => {
    let active = true
    fetchBookings().then((result) => active && apply(result))
    return () => {
      active = false
    }
  }, [apply])

  /** Retry after an error, showing the loading state again. */
  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    apply(await fetchBookings())
  }, [apply])

  /** Runs a write, then refreshes. Throws a readable error for the form to show. */
  const mutate = useCallback(
    async (action: () => Promise<void>) => {
      try {
        await action()
      } catch (err) {
        console.error('Saving booking failed:', err)
        throw new Error(message(err))
      }
      apply(await fetchBookings())
    },
    [apply],
  )

  return {
    bookings,
    loading,
    error,
    reload,
    create: (input: BookingInput) => mutate(() => bookingsRepo.create(input)),
    update: (id: string, input: BookingInput) => mutate(() => bookingsRepo.update(id, input)),
    cancel: (id: string) => mutate(() => bookingsRepo.cancel(id)),
  }
}
