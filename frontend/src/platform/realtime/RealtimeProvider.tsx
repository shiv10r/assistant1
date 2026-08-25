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
  subscribeToWarehouse: (conversationId: string) => Promise<void>
  unsubscribeFromWarehouse: (conversationId: string) => Promise<void>
  subscribeToHomeServices: (conversationId: string) => Promise<void>
  unsubscribeFromHomeServices: (conversationId: string) => Promise<void>
  subscribeToTravel: (conversationId: string) => Promise<void>
  unsubscribeFromTravel: (conversationId: string) => Promise<void>
  subscribeToRailway: (conversationId: string) => Promise<void>
  unsubscribeFromRailway: (conversationId: string) => Promise<void>
  subscribeToHotel: (conversationId: string) => Promise<void>
  unsubscribeFromHotel: (conversationId: string) => Promise<void>
  subscribeToNews: (conversationId: string) => Promise<void>
  unsubscribeFromNews: (conversationId: string) => Promise<void>
  subscribeToJobs: (conversationId: string) => Promise<void>
  unsubscribeFromJobs: (conversationId: string) => Promise<void>
  subscribeToCommerce: (conversationId: string) => Promise<void>
  unsubscribeFromCommerce: (conversationId: string) => Promise<void>
  subscribeToBank: (conversationId: string) => Promise<void>
  unsubscribeFromBank: (conversationId: string) => Promise<void>
  subscribeToMedical: (conversationId: string) => Promise<void>
  unsubscribeFromMedical: (conversationId: string) => Promise<void>
  subscribeToPresence: (tenantId: string) => Promise<void>
  unsubscribeFromPresence: (tenantId: string) => Promise<void>
}

const RealtimeContext = createContext<RealtimeContextValue>({ status: 'disconnected', subscribeToBooking: async () => undefined, unsubscribeFromBooking: async () => undefined, subscribeToChat: async () => undefined, unsubscribeFromChat: async () => undefined, subscribeToSchool: async () => undefined, unsubscribeFromSchool: async () => undefined, subscribeToWarehouse: async () => undefined, unsubscribeFromWarehouse: async () => undefined, subscribeToHomeServices: async () => undefined, unsubscribeFromHomeServices: async () => undefined, subscribeToTravel: async () => undefined, unsubscribeFromTravel: async () => undefined, subscribeToRailway: async () => undefined, unsubscribeFromRailway: async () => undefined, subscribeToHotel: async () => undefined, unsubscribeFromHotel: async () => undefined, subscribeToNews: async () => undefined, unsubscribeFromNews: async () => undefined, subscribeToJobs: async () => undefined, unsubscribeFromJobs: async () => undefined, subscribeToCommerce: async () => undefined, unsubscribeFromCommerce: async () => undefined, subscribeToBank: async () => undefined, unsubscribeFromBank: async () => undefined, subscribeToMedical: async () => undefined, unsubscribeFromMedical: async () => undefined, subscribeToPresence: async () => undefined, unsubscribeFromPresence: async () => undefined })

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
    hub.onreconnected(async () => { setStatus('connected'); await Promise.all([...subscriptions.current].map((id) => hub.invoke('SubscribeToHomeServicesBooking', id))); await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToChatConversation', id))); await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToSchoolMessage', id))); await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToWarehouseMessage', id))); await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToHomeServicesMessage', id))); await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToTravelMessage', id))); await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToRailwayMessage', id))); await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToHotelMessage', id))); await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToNewsMessage', id))); await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToJobsMessage', id))); await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToCommerceMessage', id))); await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToBankMessage', id))); await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToMedicalMessage', id))); await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToPresence', id))) })
    hub.onclose(() => setStatus('disconnected'))
    setStatus('connecting')
    void hub.start().then(async () => {
      setStatus('connected')
      await Promise.all([...subscriptions.current].map((id) => hub.invoke('SubscribeToHomeServicesBooking', id)))
      await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToChatConversation', id)))
      await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToSchoolMessage', id)))
      await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToWarehouseMessage', id)))
      await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToHomeServicesMessage', id)))
      await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToTravelMessage', id)))
      await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToRailwayMessage', id)))
      await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToHotelMessage', id)))
      await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToNewsMessage', id)))
      await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToJobsMessage', id)))
      await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToCommerceMessage', id)))
      await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToBankMessage', id)))
      await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToMedicalMessage', id)))
      await Promise.all([...chatSubscriptions.current].map((id) => hub.invoke('SubscribeToPresence', id)))
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
  const subscribeToHomeServices = async (conversationId: string) => {
    chatSubscriptions.current.add(conversationId)
    if (connection.current?.state === HubConnectionState.Connected) await connection.current.invoke('SubscribeToHomeServicesMessage', conversationId)
  }
  const unsubscribeFromHomeServices = async (conversationId: string) => {
    chatSubscriptions.current.delete(conversationId)
    if (connection.current?.state === HubConnectionState.Connected) await connection.current.invoke('UnsubscribeFromHomeServicesMessage', conversationId)
  }
  const subscribeToTravel = async (conversationId: string) => {
    chatSubscriptions.current.add(conversationId)
    if (connection.current?.state === HubConnectionState.Connected) await connection.current.invoke('SubscribeToTravelMessage', conversationId)
  }
  const unsubscribeFromTravel = async (conversationId: string) => {
    chatSubscriptions.current.delete(conversationId)
    if (connection.current?.state === HubConnectionState.Connected) await connection.current.invoke('UnsubscribeFromTravelMessage', conversationId)
  }
  const subscribeToRailway = async (conversationId: string) => {
    chatSubscriptions.current.add(conversationId)
    if (connection.current?.state === HubConnectionState.Connected) await connection.current.invoke('SubscribeToRailwayMessage', conversationId)
  }
  const unsubscribeFromRailway = async (conversationId: string) => {
    chatSubscriptions.current.delete(conversationId)
    if (connection.current?.state === HubConnectionState.Connected) await connection.current.invoke('UnsubscribeFromRailwayMessage', conversationId)
  }
  const subscribeToHotel = async (conversationId: string) => {
    chatSubscriptions.current.add(conversationId)
    if (connection.current?.state === HubConnectionState.Connected) await connection.current.invoke('SubscribeToHotelMessage', conversationId)
  }
  const unsubscribeFromHotel = async (conversationId: string) => {
    chatSubscriptions.current.delete(conversationId)
    if (connection.current?.state === HubConnectionState.Connected) await connection.current.invoke('UnsubscribeFromHotelMessage', conversationId)
  }
  const subscribeToNews = async (conversationId: string) => {
    chatSubscriptions.current.add(conversationId)
    if (connection.current?.state === HubConnectionState.Connected) await connection.current.invoke('SubscribeToNewsMessage', conversationId)
  }
  const unsubscribeFromNews = async (conversationId: string) => {
    chatSubscriptions.current.delete(conversationId)
    if (connection.current?.state === HubConnectionState.Connected) await connection.current.invoke('UnsubscribeFromNewsMessage', conversationId)
  }
  const subscribeToJobs = async (conversationId: string) => {
    chatSubscriptions.current.add(conversationId)
    if (connection.current?.state === HubConnectionState.Connected) await connection.current.invoke('SubscribeToJobsMessage', conversationId)
  }
  const unsubscribeFromJobs = async (conversationId: string) => {
    chatSubscriptions.current.delete(conversationId)
    if (connection.current?.state === HubConnectionState.Connected) await connection.current.invoke('UnsubscribeFromJobsMessage', conversationId)
  }
  const subscribeToCommerce = async (conversationId: string) => {
    chatSubscriptions.current.add(conversationId)
    if (connection.current?.state === HubConnectionState.Connected) await connection.current.invoke('SubscribeToCommerceMessage', conversationId)
  }
  const unsubscribeFromCommerce = async (conversationId: string) => {
    chatSubscriptions.current.delete(conversationId)
    if (connection.current?.state === HubConnectionState.Connected) await connection.current.invoke('UnsubscribeFromCommerceMessage', conversationId)
  }
  const subscribeToBank = async (conversationId: string) => {
    chatSubscriptions.current.add(conversationId)
    if (connection.current?.state === HubConnectionState.Connected) await connection.current.invoke('SubscribeToBankMessage', conversationId)
  }
  const unsubscribeFromBank = async (conversationId: string) => {
    chatSubscriptions.current.delete(conversationId)
    if (connection.current?.state === HubConnectionState.Connected) await connection.current.invoke('UnsubscribeFromBankMessage', conversationId)
  }
  const subscribeToMedical = async (conversationId: string) => {
    chatSubscriptions.current.add(conversationId)
    if (connection.current?.state === HubConnectionState.Connected) await connection.current.invoke('SubscribeToMedicalMessage', conversationId)
  }
  const unsubscribeFromMedical = async (conversationId: string) => {
    chatSubscriptions.current.delete(conversationId)
    if (connection.current?.state === HubConnectionState.Connected) await connection.current.invoke('UnsubscribeFromMedicalMessage', conversationId)
  }
  const subscribeToPresence = async (tenantId: string) => {
    if (connection.current?.state === HubConnectionState.Connected) await connection.current.invoke('SubscribeToPresence', tenantId)
  }
  const unsubscribeFromPresence = async (tenantId: string) => {
    if (connection.current?.state === HubConnectionState.Connected) await connection.current.invoke('UnsubscribeFromPresence', tenantId)
  }

  return <RealtimeContext.Provider value={{ status, subscribeToBooking, unsubscribeFromBooking, subscribeToChat, unsubscribeFromChat }}>{children}</RealtimeContext.Provider>
}

export const useRealtime = () => useContext(RealtimeContext)