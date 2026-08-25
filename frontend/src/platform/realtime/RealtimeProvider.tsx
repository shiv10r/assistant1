import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { HubConnectionBuilder, HubConnectionState, LogLevel, type HubConnection } from '@microsoft/signalr'
import { api, BASE, type PlatformChatPage } from '../api'
import { getToken } from '../auth'
import type { RealtimeEventEnvelope, RealtimeStatus } from './realtime.types'

type RealtimeContextValue = {
  status: RealtimeStatus
  subscribeToBooking: (bookingId: string) => Promise<void>
  unsubscribeFromBooking: (bookingId: string) => Promise<void>
  subscribeToChat: (conversationId: string) => Promise<void>
  unsubscribeFromChat: (conversationId: string) => Promise<void>
  setTyping: (conversationId: string, isTyping: boolean) => Promise<void>
  markMessageRead: (conversationId: string, messageId: string) => Promise<void>
}

const noop = async () => undefined
const RealtimeContext = createContext<RealtimeContextValue>({
  status: 'disconnected',
  subscribeToBooking: noop,
  unsubscribeFromBooking: noop,
  subscribeToChat: noop,
  unsubscribeFromChat: noop,
  setTyping: noop,
  markMessageRead: noop,
})

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const connection = useRef<HubConnection | null>(null)
  const bookingSubscriptions = useRef(new Set<string>())
  const chatSubscriptions = useRef(new Set<string>())
  const [status, setStatus] = useState<RealtimeStatus>('disconnected')

  useEffect(() => {
    if (!getToken()) return

    const hub = new HubConnectionBuilder()
      .withUrl(`${BASE}/hubs/realtime`, { accessTokenFactory: () => getToken() ?? '' })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .configureLogging(import.meta.env.DEV ? LogLevel.Warning : LogLevel.Error)
      .build()

    const restoreSubscriptions = async (syncHistory: boolean) => {
      await Promise.all([...bookingSubscriptions.current].map((id) => hub.invoke('SubscribeToHomeServicesBooking', id)))
      await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToChatConversation', id)))
      if (!syncHistory) return

      await Promise.all([...chatSubscriptions.current].map(async (conversationId) => {
        try {
          const page = await api.chat.messages(conversationId)
          window.dispatchEvent(new CustomEvent<{ conversationId: string; page: PlatformChatPage }>('vsr:chat-history', {
            detail: { conversationId, page },
          }))
        } catch {
          // Realtime recovery remains available when history storage is temporarily unavailable.
        }
      }))
    }

    connection.current = hub
    hub.on('realtimeEvent', (event: RealtimeEventEnvelope) => {
      window.dispatchEvent(new CustomEvent('vsr:realtime', { detail: event }))
    })
    hub.onreconnecting(() => setStatus('reconnecting'))
    hub.onreconnected(async () => {
      setStatus('connected')
      await restoreSubscriptions(true)
    })
    hub.onclose(() => setStatus('disconnected'))

    setStatus('connecting')
    void hub.start()
      .then(async () => {
        setStatus('connected')
        await restoreSubscriptions(false)
      })
      .catch(() => setStatus('disconnected'))

    return () => {
      connection.current = null
      void hub.stop()
    }
  }, [])

  const subscribeToBooking = async (bookingId: string) => {
    bookingSubscriptions.current.add(bookingId)
    if (connection.current?.state === HubConnectionState.Connected) {
      await connection.current.invoke('SubscribeToHomeServicesBooking', bookingId)
    }
  }

  const unsubscribeFromBooking = async (bookingId: string) => {
    bookingSubscriptions.current.delete(bookingId)
    if (connection.current?.state === HubConnectionState.Connected) {
      await connection.current.invoke('UnsubscribeFromHomeServicesBooking', bookingId)
    }
  }

  const subscribeToChat = async (conversationId: string) => {
    chatSubscriptions.current.add(conversationId)
    if (connection.current?.state === HubConnectionState.Connected) {
      await connection.current.invoke('SubscribeToChatConversation', conversationId)
    }
  }

  const unsubscribeFromChat = async (conversationId: string) => {
    chatSubscriptions.current.delete(conversationId)
    if (connection.current?.state === HubConnectionState.Connected) {
      await connection.current.invoke('UnsubscribeFromChatConversation', conversationId)
    }
  }

  const setTyping = async (conversationId: string, isTyping: boolean) => {
    if (connection.current?.state === HubConnectionState.Connected) {
      await connection.current.invoke('BroadcastTypingIndicator', conversationId, isTyping)
    }
  }

  const markMessageRead = async (conversationId: string, messageId: string) => {
    if (connection.current?.state === HubConnectionState.Connected) {
      await connection.current.invoke('BroadcastMessageRead', conversationId, messageId)
    }
  }

  return <RealtimeContext.Provider value={{
    status,
    subscribeToBooking,
    unsubscribeFromBooking,
    subscribeToChat,
    unsubscribeFromChat,
    setTyping,
    markMessageRead,
  }}>{children}</RealtimeContext.Provider>
}

export const useRealtime = () => useContext(RealtimeContext)
