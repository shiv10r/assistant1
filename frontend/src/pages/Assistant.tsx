import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../api'
import type { ChatMessage } from '../api'

export default function Assistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { text: "👋 Hey! I'm your LuxInfra assistant. Tell me expenses like \"site A paint exp = 5k\" or \"client Sharma site C labour 25k\". Say \"show report\" any time.", isUser: false },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  async function send(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || busy) return
    setInput('')
    const userMsg = { text, isUser: true } as ChatMessage
    setMessages((m) => [...m, userMsg])
    setBusy(true)
    try {
      const reply = await api.send(text)
      setMessages((m) => [...m, { text: reply, isUser: false }])
    } catch (err) {
      setMessages((m) => [...m, { text: `⚠️ ${err}`, isUser: false }])
    } finally {
      setBusy(false)
    }
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  return (
    <div className="chat-panel">
      <header className="chat-header">
        <div>
          <div className="brand">Lux<span>Infra</span></div>
          <div className="tagline">your expense bestie 🤝</div>
        </div>
        <div className="online">● online</div>
      </header>

      <div className="messages">
        {messages.map((m, i) =>
          m.isReport ? (
            <div className="msg bot report-card" key={i}>
              <div className="report-title">{m.reportTitle}</div>
              <table>
                <thead><tr><th>Site</th><th>Category</th><th className="num">Amount</th></tr></thead>
                <tbody>
                  {m.rows?.map((r, j) => (
                    <tr key={j}><td>{r.site}</td><td className="cat">{r.category}</td><td className="num">{r.amountLabel}</td></tr>
                  ))}
                </tbody>
                <tfoot><tr><td colSpan={2}>TOTAL</td><td className="num total">{m.totalLabel}</td></tr></tfoot>
              </table>
            </div>
          ) : (
            <div className={`msg ${m.isUser ? 'user' : 'bot'}`} key={i}><div className="text">{m.text}</div></div>
          )
        )}
        <div ref={endRef} />
      </div>

      <div className="chips">
        <button onClick={() => api.send('show report').then(r => setMessages(m => [...m, { text: r, isUser: false }]))}>📒 Show report</button>
        <button onClick={() => api.send('total').then(r => setMessages(m => [...m, { text: r, isUser: false }]))}>🧮 Totals</button>
        <button onClick={() => api.send('help').then(r => setMessages(m => [...m, { text: r, isUser: false }]))}>💡 Help</button>
      </div>

      <form className="input-row" onSubmit={send}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="site A paint exp = 5k ..."
        />
        <button className="send" type="submit">{busy ? '…' : '➤'}</button>
      </form>
    </div>
  )
}