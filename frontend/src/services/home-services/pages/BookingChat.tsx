import { useEffect, useState } from 'react'
import { MdSend } from 'react-icons/md'
import { api, type PlatformChatMessage } from '../../../platform/api'
import { useRealtime } from '../../../platform/realtime'

export default function BookingChat({ bookingId }: { bookingId: string }) {
  const realtime = useRealtime()
  const [messages, setMessages] = useState<PlatformChatMessage[]>([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

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
      const message = (event as CustomEvent<{ eventType: string; payload: PlatformChatMessage }>).detail
      if (message?.eventType !== 'platform.chat.message-created' || message.payload.conversationId !== bookingId) return
      setMessages((current) => current.some((item) => item.messageId === message.payload.messageId) ? current : [...current, message.payload])
    }
    window.addEventListener('vsr:realtime', receive)
    return () => {
      active = false
      window.removeEventListener('vsr:realtime', receive)
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
      {messages.map((message) => <article key={message.messageId}><span>{message.senderUserId}</span><p>{message.text}</p><small>{new Date(message.sentAt).toLocaleString()}</small></article>)}
      {!messages.length && !error && <p className="hs-booking-chat__empty">No messages yet. Start the conversation about this booking.</p>}
    </div>
    {error && <div className="hs-alert hs-alert--warning" role="alert">{error}</div>}
    <div className="hs-booking-chat__composer"><textarea className="hs-textarea" value={text} maxLength={4000} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send() } }} placeholder="Write a message..." /><button type="button" className="hs-btn hs-btn--primary" disabled={!text.trim() || busy} onClick={() => void send()}><MdSend aria-hidden="true" /> {busy ? 'Sending' : 'Send'}</button></div>
  </section>
}
