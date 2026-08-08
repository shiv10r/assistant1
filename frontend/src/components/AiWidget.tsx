import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../api'
import type { AiChatTurn } from '../api'
import { MessageSquare, X } from 'lucide-react'

interface Msg { text: string; isUser: boolean }

export default function AiWidget() {
  const [open, setOpen] = useState(false)
  const [configured, setConfigured] = useState(false)
  const [model, setModel] = useState<string | null>(null)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const historyRef = useRef<AiChatTurn[]>([])
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.aiStatus().then((s) => { setConfigured(s.configured); setModel(s.model) }).catch(() => {})
  }, [])

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [open, msgs])

  function toggle() {
    const next = !open
    setOpen(next)
    if (next && msgs.length === 0) {
      setMsgs([{ text: configured
        ? '🧠 DeepSeek AI is ready. Ask me anything — I\'ll answer in your language.'
        : '⚠️ AI not enabled — set OPENROUTER_API_KEY on the server.', isUser: false }])
    }
  }

  async function send(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || busy) return
    setInput('')
    setMsgs((m) => [...m, { text, isUser: true }])
    setBusy(true)
    try {
      const history = historyRef.current
      historyRef.current = [...history, { role: 'user', content: text }]
      const reply = await api.aiChat(text, history)
      historyRef.current = [...historyRef.current, { role: 'assistant', content: reply.text }]
      setMsgs((m) => [...m, { text: reply.text, isUser: false }])
    } catch (err) {
      setMsgs((m) => [...m, { text: `⚠️ ${err}`, isUser: false }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        className="ai-widget-fab"
        onClick={toggle}
        aria-label={open ? 'Close AI chat' : 'Open AI chat'}
        title={model ? `AI · ${model}` : 'AI chat'}
      >
        {open ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {open && (
        <div className="ai-widget-panel">
          <div className="ai-widget-head">
            <span>🧠 DeepSeek AI</span>
            {model && <span className="ai-model-tag">{model}</span>}
          </div>
          <div className="ai-widget-body">
            {msgs.map((m, i) => (
              <div className={`msg ${m.isUser ? 'user' : 'bot'}`} key={i}><div className="text">{m.text}</div></div>
            ))}
            <div ref={endRef} />
          </div>
          <form className="ai-widget-input" onSubmit={send}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
            />
            <button type="submit">{busy ? '…' : '➤'}</button>
          </form>
        </div>
      )}
    </>
  )
}
