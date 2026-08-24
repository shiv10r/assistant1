import { useEffect } from 'react'
import { useRealtime } from './RealtimeProvider'

export function useBookingRealtime(bookingId: string | undefined) {
  const realtime = useRealtime()
  useEffect(() => {
    if (!bookingId) return
    void realtime.subscribeToBooking(bookingId)
    return () => { void realtime.unsubscribeFromBooking(bookingId) }
  }, [bookingId, realtime])
  return realtime.status
}
