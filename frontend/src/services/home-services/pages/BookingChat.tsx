import { useEffect, useRef, useState } from 'react'
import { MdSend } from 'react-icons/md'
import { api, type PlatformChatMessage } from '../../../platform/api'
import { useRealtime } from '../../../platform/realtime'

export default function BookingChat({ bookingId }: { bookingId: string }) {
  const realtime = useRealtime()
  const [messages, setMessages] = useState<PlatformChatMessage[]>([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [readMessages, setReadMessages] = useState(new Set<string>())
  const typingTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    let active = true
    setError('')
    void api.chat.messages(bookingId).then((page) => {
      if (active) setMessages([...page.items].reverse())
    }).catch((reason) => {
      if (active) setError(reason instanceof Error ? reason.message : 'Messages are unavailable.')
    })
    void realtime.subscribeToChat(bookingId).catch(() => undefined)
    const receive = (event: Event) => {
      const message = (event as CustomEvent<{ eventType: string; payload: PlatformChatMessage & { userId?: string; isTyping?: boolean; messageId: string } }>).detail
      if (!message?.payload || message.payload.conversationId !== bookingId) return
      if (message.eventType === 'platform.chat.message-created') {
        setMessages((current) => current.some((item) => item.messageId === message.payload.messageId) ? current : [...current, message.payload])
        void realtime.markMessageRead(bookingId, message.payload.messageId)
      } else if (message.eventType === 'platform.chat.typing-indicator' && message.payload.userId) {
        setTypingUsers((current) => message.payload.isTyping
          ? [...new Set([...current, message.payload.userId!])]
          : current.filter((userId) => userId !== message.payload.userId))
      } else if (message.eventType === 'platform.chat.message-read') {
        setReadMessages((current) => new Set(current).add(message.payload.messageId))
      }
    }
    const syncHistory = (event: Event) => {
      const detail = (event as CustomEvent<{ conversationId: string; page: { items: PlatformChatMessage[] } }>).detail
      if (detail?.conversationId === bookingId) setMessages([...detail.page.items].reverse())
    }
    window.addEventListener('vsr:realtime', receive)
    window.addEventListener('vsr:chat-history', syncHistory)
    return () => {
      active = false
      window.clearTimeout(typingTimer.current)
      window.removeEventListener('vsr:realtime', receive)
      window.removeEventListener('vsr:chat-history', syncHistory)
      void realtime.setTyping(bookingId, false)
      void realtime.unsubscribeFromChat(bookingId)
    }
  }, [bookingId, realtime])

  const send = async () => {
    const value = text.trim()
    if (!value || busy) return
    setBusy(true)
    setError('')
    try {
      const message = await api.chat.send(bookingId, value)
      setMessages((current) => current.some((item) => item.messageId === message.messageId) ? current : [...current, message])
      setText('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Message could not be sent.')
    } finally {
      setBusy(false)
    }
  }

  return <section className="hs-booking-chat" aria-label="Booking chat">
    <div className="hs-booking-chat__head"><div><strong>Booking chat</strong><small>{realtime.status === 'connected' ? 'Live updates connected' : 'Messages sync when available'}</small></div></div>
    <div className="hs-booking-chat__messages">
      {messages.map((message) => <article key={message.messageId}><span>{message.senderUserId}</span><p>{message.text}</p><small>{new Date(message.sentAt).toLocaleString()}{readMessages.has(message.messageId) ? ' · Read' : ''}</small></article>)}
      {!messages.length && !error && <p className="hs-booking-chat__empty">No messages yet. Start the conversation about this booking.</p>}
      {typingUsers.length > 0 && <p className="hs-booking-chat__empty">{typingUsers.join(', ')} typing...</p>}
    </div>
    {error && <div className="hs-alert hs-alert--warning" role="alert">{error}</div>}
    <div className="hs-booking-chat__composer"><textarea className="hs-textarea" value={text} maxLength={4000} onChange={(event) => { setText(event.target.value); void realtime.setTyping(bookingId, true); window.clearTimeout(typingTimer.current); typingTimer.current = window.setTimeout(() => void realtime.setTyping(bookingId, false), 1500) }} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send() } }} placeholder="Write a message..." /><button type="button" className="hs-btn hs-btn--primary" disabled={!text.trim() || busy} onClick={() => void send()}><MdSend aria-hidden="true" /> {busy ? 'Sending' : 'Send'}</button></div>
  </section>
}
