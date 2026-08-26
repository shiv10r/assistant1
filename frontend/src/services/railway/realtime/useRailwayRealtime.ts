import { useEffect, useState } from 'react'
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { BASE } from '../../../platform/api'
import { getToken } from '../../../platform/auth'

export type RailwayRealtimeEvent = {
  eventId: string
  type: string
  resourceId: string
  occurredAt: string
}

export function useRailwayRealtime(
  stationIds: readonly string[],
  onInvalidate: (event: RailwayRealtimeEvent | null) => void,
) {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>('disconnected')

  useEffect(() => {
    if (!getToken() || stationIds.length === 0) return
    const connection = new HubConnectionBuilder()
      .withUrl(`${BASE}/hubs/railway`, { accessTokenFactory: () => getToken() ?? '' })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(import.meta.env.DEV ? LogLevel.Warning : LogLevel.Error)
      .build()

    const subscribe = async () => {
      await Promise.all(stationIds.map((stationId) => connection.invoke('SubscribeToRailwayStation', stationId)))
    }
    connection.on('realtimeEvent', (envelope: { payload: RailwayRealtimeEvent }) => onInvalidate(envelope.payload))
    connection.onreconnecting(() => setStatus('reconnecting'))
    connection.onreconnected(async () => {
      setStatus('connected')
      await subscribe()
      onInvalidate(null)
    })
    connection.onclose(() => setStatus('disconnected'))
    setStatus('connecting')
    void connection.start().then(async () => {
      setStatus('connected')
      await subscribe()
    }).catch(() => setStatus('disconnected'))

    return () => { void connection.stop() }
  }, [onInvalidate, stationIds])

  return status
}
