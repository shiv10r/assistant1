import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { HubConnectionBuilder, HubConnectionState, LogLevel, type HubConnection } from '@microsoft/signalr'
import { BASE } from '../api'
import { getToken } from '../auth'
import type { RealtimeEventEnvelope, RealtimeStatus } from './realtime.types'

type RealtimeContextValue = {
  status: RealtimeStatus
  subscribeToBooking: (bookingId: string) => Promise<void>
  unsubscribeFromBooking: (bookingId: string) => Promise<void>
  subscribeToChat: (conversationId: string) => Promise<void>
  unsubscribeFromChat: (conversationId: string) => Promise<void>
  subscribeToSchool: (conversationId: string) => Promise<void>
  unsubscribeFromSchool: (conversationId: string) => Promise<void>
}

const RealtimeContext = createContext<RealtimeContextValue>({ status: 'disconnected', subscribeToBooking: async () => undefined, unsubscribeFromBooking: async () => undefined, subscribeToChat: async () => undefined, unsubscribeFromChat: async () => undefined })

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const connection = useRef<HubConnection | null>(null)
  const subscriptions = useRef(new Set<string>())
  const chatSubscriptions = useRef(new Set<string>())
  const [status, setStatus] = useState<RealtimeStatus>('disconnected')

  useEffect(() => {
    const token = getToken()
    if (!token) return
    const hub = new HubConnectionBuilder()
      .withUrl(`${BASE}/hubs/realtime`, { accessTokenFactory: () => getToken() ?? '' })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(import.meta.env.DEV ? LogLevel.Warning : LogLevel.Error)
      .build()
    connection.current = hub
    hub.on('realtimeEvent', (event: RealtimeEventEnvelope) => window.dispatchEvent(new CustomEvent('vsr:realtime', { detail: event })))
    hub.onreconnecting(() => setStatus('reconnecting'))
    hub.onreconnected(async () => { setStatus('connected'); await Promise.all([...subscriptions.current].map((id) => hub.invoke('SubscribeToHomeServicesBooking', id))); await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToChatConversation', id))); await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToSchoolMessage', id))); await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToWarehouseMessage', id))) })
    hub.onclose(() => setStatus('disconnected'))
    setStatus('connecting')
    void hub.start().then(async () => {
      setStatus('connected')
      await Promise.all([...subscriptions.current].map((id) => hub.invoke('SubscribeToHomeServicesBooking', id)))
      await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToChatConversation', id)))
      await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToSchoolMessage', id)))
      await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToWarehouseMessage', id)))
    }).catch(() => setStatus('disconnected'))
    return () => { connection.current = null; void hub.stop() }
  }, [])

  const subscribeToBooking = async (bookingId: string) => {
    subscriptions.current.add(bookingId)
    if (connection.current?.state === HubConnectionState.Connected) await connection.current.invoke('SubscribeToHomeServicesBooking', bookingId)
  }
  const unsubscribeFromBooking = async (bookingId: string) => {
    subscriptions.current.delete(bookingId)
    if (connection.current?.state === HubConnectionState.Connected) await connection.current.invoke('UnsubscribeFromHomeServicesBooking', bookingId)
  }
  const subscribeToChat = async (conversationId: string) => {
    chatSubscriptions.current.add(conversationId)
    if (connection.current?.state === HubConnectionState.Connected) await connection.current.invoke('SubscribeToChatConversation', conversationId)
  }
  const unsubscribeFromChat = async (conversationId: string) => {
    chatSubscriptions.current.delete(conversationId)
    if (connection.current?.state === HubConnectionState.Connected) await connection.current.invoke('UnsubscribeFromChatConversation', conversationId)
  }
  const subscribeToSchool = async (conversationId: string) => {
    chatSubscriptions.current.add(conversationId)
    if (connection.current?.state === HubConnectionState.Connected) await connection.current.invoke('SubscribeToSchoolMessage', conversationId)
  }
  const unsubscribeFromSchool = async (conversationId: string) => {
    chatSubscriptions.current.delete(conversationId)
    if (connection.current?.state === HubConnectionState.Connected) await connection.current.invoke('UnsubscribeFromSchoolMessage', conversationId)
  }
  const subscribeToWarehouse = async (conversationId: string) => {
    chatSubscriptions.current.add(conversationId)
    if (connection.current?.state === HubConnectionState.Connected) await connection.current.invoke('SubscribeToWarehouseMessage', conversationId)
  }
  const unsubscribeFromWarehouse = async (conversationId: string) => {
    chatSubscriptions.current.delete(conversationId)
    if (connection.current?.state === HubConnectionState.Connected) await connection.current.invoke('UnsubscribeFromWarehouseMessage', conversationId)
  }

  return <RealtimeContext.Provider value={{ status, subscribeToBooking, unsubscribeFromBooking, subscribeToChat, unsubscribeFromChat }}>{children}</RealtimeContext.Provider>
}

export const useRealtime = () => useContext(RealtimeContext)
