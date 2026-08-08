import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../api'
import type { ChatMessage, AiChatTurn } from '../api'

type Mode = 'app' | 'ai'

export default function Assistant() {
  const [mode, setMode] = useState<Mode>('app')
  const [aiModel, setAiModel] = useState<string | null>(null)
  const [aiConfigured, setAiConfigured] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { text: "👋 Hey! I'm your LuxInfra assistant. Tell me expenses like \"site A paint exp = 5k\", \"spent 5000 on cement\", or \"five thousand for labour\". Say \"show report\" any time.", isUser: false },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const historyRef = useRef<AiChatTurn[]>([])

  useEffect(() => {
    api.aiStatus().then((s) => {
      setAiModel(s.model)
      setAiConfigured(s.configured)
    }).catch(() => {})
  }, [])

  const append = (msgs: ChatMessage[]) => setMessages((m) => [...m, ...msgs])

  async function send(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || busy) return
    setInput('')
    setMessages((m) => [...m, { text, isUser: true }])
    setBusy(true)
    try {
      if (mode === 'ai') {
        const history = historyRef.current
        historyRef.current = [...history, { role: 'user', content: text }]
        const reply = await api.aiChat(text, history)
        historyRef.current = [...historyRef.current, { role: 'assistant', content: reply.text }]
        append([{ text: reply.text, isUser: false }])
      } else {
        append(await api.send(text))
      }
    } catch (err) {
      setMessages((m) => [...m, { text: `⚠️ ${err}`, isUser: false }])
    } finally {
      setBusy(false)
    }
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  function switchMode(next: Mode) {
    setMode(next)
    historyRef.current = []
    if (next === 'ai') {
      setMessages([{ text: aiConfigured
        ? `🧠 DeepSeek AI mode is on. Ask me anything — business or general — and I'll answer in the same language you write.`
        : "⚠️ AI chat isn't enabled yet — set the OPENROUTER_API_KEY env var on the server.", isUser: false }])
    } else {
      setMessages([{ text: "👋 Back in LuxInfra mode. Tell me expenses like \"site A paint exp = 5k\" or \"spent 5000 on cement\".", isUser: false }])
    }
  }

  const appChips = ['📒 Show report', '🧮 Totals', '💡 Help']
  const aiChips = ['💡 Summarise my day', '📊 How do I track labour costs?', '🇮🇳 Answer in Hinglish']

  return (
    <div className="chat-panel">
      <header className="chat-header">
        <div>
          <div className="brand">Lux<span>Infra</span></div>
          <div className="tagline">{mode === 'ai' ? 'deepseek AI assistant' : 'your expense bestie 🤝'}</div>
        </div>
        <div className="ai-mode-switch">
          <button className={mode === 'app' ? 'active' : ''} onClick={() => switchMode('app')}>App</button>
          <button className={mode === 'ai' ? 'active' : ''} onClick={() => switchMode('ai')}>AI</button>
        </div>
        {mode === 'ai' && aiModel && <span className="ai-model-tag">{aiModel}</span>}
        <div className="online">● online</div>
      </header>

      <div className="messages">
        {messages.map((m, i) =>
          m.isReport ? (
            <div className="msg bot report-card" key={i}>
              <div className="report-title">{m.reportTitle}</div>
              <table>
                <thead><tr><th>Date</th><th>Site</th><th>Category</th><th className="num">Amount</th></tr></thead>
                <tbody>
                  {m.rows?.map((r, j) => (
                    <tr key={j}><td>{r.dateLabel}</td><td>{r.site}</td><td className="cat">{r.category}</td><td className="num">{r.amountLabel}</td></tr>
                  ))}
                </tbody>
                <tfoot><tr><td colSpan={3}>TOTAL</td><td className="num total">{m.totalLabel}</td></tr></tfoot>
              </table>
            </div>
          ) : (
            <div className={`msg ${m.isUser ? 'user' : 'bot'}`} key={i}><div className="text">{m.text}</div></div>
          )
        )}
        <div ref={endRef} />
      </div>

      <div className="chips">
        {(mode === 'app' ? appChips : aiChips).map((label, i) => {
          const text = label.split(' ').slice(1).join(' ')
          return <button key={i} onClick={() => { setInput(text); if (mode === 'app') api.send(text).then(append).catch(() => {}) }}>{label}</button>
        })}
      </div>

      <form className="input-row" onSubmit={send}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'ai' ? 'Ask DeepSeek anything...' : 'site A paint exp = 5k ...'}
        />
        <button className="send" type="submit">{busy ? '…' : '➤'}</button>
      </form>
    </div>
  )
}
