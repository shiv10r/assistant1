import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../api'
import type { ChatMessage, AiChatTurn, AssistantSearch } from '../api'

type Mode = 'app' | 'ai'
type AssistantMessage = ChatMessage & { error?: boolean; retry?: { text: string; mode: Mode } }

function errorText(error: unknown) {
  const detail = error instanceof Error ? error.message.replace(/^Error:\s*/i, '') : ''
  return detail && !/^API error \d+$/i.test(detail) ? detail : 'The service did not respond. Check your connection and try again.'
}

export default function Assistant() {
  const [mode, setMode] = useState<Mode>('app')
  const [aiModel, setAiModel] = useState<string | null>(null)
  const [aiStatus, setAiStatus] = useState<'checking' | 'ready' | 'unavailable' | 'error'>('checking')
  const [messages, setMessages] = useState<AssistantMessage[]>([
    { text: "I'm your VSR Systems assistant. Record expenses like \"site A paint exp = 5k\", or say \"show report\" any time.", isUser: false },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<AssistantSearch | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const historyRef = useRef<AiChatTurn[]>([])

  useEffect(() => {
    api.aiStatus().then((s) => {
      setAiModel(s.model)
      setAiStatus(s.configured ? 'ready' : 'unavailable')
    }).catch(() => setAiStatus('error'))
  }, [])

  async function runSearch(q: string) {
    const text = q.trim()
    if (text.length < 2) return
    setSearchQuery(text)
    setSearching(true)
    setSearchError('')
    setSearchResults(null)
    try {
      setSearchResults(await api.search(text))
    } catch (err) {
      setSearchResults(null)
      setSearchError(errorText(err))
    } finally {
      setSearching(false)
    }
  }

  const append = (msgs: AssistantMessage[]) => setMessages((m) => [...m, ...msgs])

  async function submit(text: string, requestedMode: Mode, showUser = true) {
    if (showUser) setMessages((current) => [...current, { text, isUser: true }])
    setBusy(true)
    try {
      if (requestedMode === 'ai' && aiStatus === 'ready') {
        const history = historyRef.current
        historyRef.current = [...history, { role: 'user', content: text }]
        const reply = await api.aiChat(text, history)
        if (!reply.ok || !reply.configured) throw new Error(reply.error || 'AI chat is temporarily unavailable.')
        historyRef.current = [...historyRef.current, { role: 'assistant', content: reply.text }]
        append([{ text: reply.text, isUser: false }])
      } else {
        if (requestedMode === 'ai') append([{ text: 'AI chat is unavailable, so I used the built-in VSR assistant for this message.', isUser: false }])
        append(await api.send(text))
      }
    } catch (error) {
      if (requestedMode === 'ai') historyRef.current = historyRef.current.slice(0, -1)
      append([{ text: errorText(error), isUser: false, error: true, retry: { text, mode: requestedMode } }])
    } finally {
      setBusy(false)
      window.setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }

  async function send(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || busy) return
    setInput('')
    await submit(text, mode)
  }

  function switchMode(next: Mode) {
    setMode(next)
    historyRef.current = []
    if (next === 'ai') {
      setMessages([{ text: aiStatus === 'ready'
        ? 'AI chat is ready. Ask a business or general question in the language you prefer.'
        : aiStatus === 'checking' ? 'Checking AI availability. If it is unavailable, messages will use the built-in VSR assistant.'
        : 'AI chat is unavailable. Your messages can still be handled by the built-in VSR assistant.', isUser: false }])
    } else {
      setMessages([{ text: 'Built-in VSR assistant ready. Record an expense, request totals, or show a report.', isUser: false }])
    }
  }

  const appChips = ['📒 Show report', '🧮 Totals', '💡 Help']
  const aiChips = ['💡 Summarise my day', '📊 How do I track labour costs?', '🇮🇳 Answer in Hinglish']

  return (
    <div className="chat-panel">
      <header className="chat-header">
        <div>
          <div className="brand">Lux<span>Infra</span></div>
          <div className="tagline">{mode === 'ai' ? 'AI assistant' : 'expense and report assistant'}</div>
        </div>
        <div className="ai-mode-switch">
          <button className={mode === 'app' ? 'active' : ''} onClick={() => switchMode('app')}>App</button>
          <button className={mode === 'ai' ? 'active' : ''} onClick={() => switchMode('ai')}>AI</button>
        </div>
        {mode === 'ai' && aiModel && <span className="ai-model-tag">Model: {aiModel}</span>}
        <div className="online">{mode === 'ai' ? (aiStatus === 'checking' ? '● checking' : aiStatus === 'ready' ? '● ready' : '○ fallback active') : '● ready'}</div>
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
            <div className={`msg ${m.isUser ? 'user' : 'bot'} ${m.error ? 'border border-red-500/30' : ''}`} key={i}><div className="text">{m.text}</div>{m.retry && <button type="button" className="mt-2 text-xs font-semibold underline" disabled={busy} onClick={() => void submit(m.retry!.text, m.retry!.mode, false)}>Retry</button>}</div>
          )
        )}
        <div ref={endRef} />
      </div>

      <div className="chips">
        {(mode === 'app' ? appChips : aiChips).map((label, i) => {
          const text = label.split(' ').slice(1).join(' ')
          return <button key={i} onClick={() => setInput(text)}>{label}</button>
        })}
      </div>

      <div className="search-box">
        <form onSubmit={(e) => { e.preventDefault(); runSearch(searchQuery) }} className="input-row">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search projects, expenses, invoices, rooms, catalogue..."
          />
          <button className="send" type="submit">{searching ? '…' : '🔍'}</button>
        </form>
        {searchError && <div role="alert" className="mx-2 mb-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600">Search could not be completed. {searchError} <button type="button" className="font-semibold underline" onClick={() => void runSearch(searchQuery)}>Retry</button></div>}
        {searchResults && (
          <div className="search-results">
            {searchResults.projects.length > 0 && (
              <div className="sr-group"><div className="sr-title">Projects</div>{searchResults.projects.map((p, i) => (
                <div className="sr-row" key={i}><strong>{p.name}</strong> <span className="muted">{p.status}{p.address ? ` · ${p.address}` : ''}</span></div>))}
              </div>)}
            {searchResults.expenses.length > 0 && (
              <div className="sr-group"><div className="sr-title">Expenses</div>{searchResults.expenses.map((e, i) => (
                <div className="sr-row" key={i}><strong>{e.site}</strong> <span className="muted">{e.category} · ₹{e.amount.toLocaleString('en-IN')}</span></div>))}
              </div>)}
            {searchResults.txns.length > 0 && (
              <div className="sr-group"><div className="sr-title">Invoices</div>{searchResults.txns.map((t, i) => (
                <div className="sr-row" key={i}><strong>{t.refLabel}</strong> <span className="muted">{t.partyName} · {t.type} · ₹{t.total.toLocaleString('en-IN')}</span></div>))}
              </div>)}
            {searchResults.rooms.length > 0 && (
              <div className="sr-group"><div className="sr-title">Rooms</div>{searchResults.rooms.map((r, i) => (
                <div className="sr-row" key={i}><strong>{r.name}</strong> {r.areaSqFt ? <span className="muted">{r.areaSqFt} sq ft</span> : null}</div>))}
              </div>)}
            {searchResults.items.length > 0 && (
              <div className="sr-group"><div className="sr-title">Catalogue</div>{searchResults.items.map((it, i) => (
                <div className="sr-row" key={i}><strong>{it.name}</strong> <span className="muted">{it.category} · ₹{it.salePrice.toLocaleString('en-IN')}</span></div>))}
              </div>)}
            {searchResults.projects.length === 0 && searchResults.expenses.length === 0 &&
              searchResults.txns.length === 0 && searchResults.rooms.length === 0 && searchResults.items.length === 0 && (
              <div className="muted" style={{ padding: 12, fontSize: 13 }}>No matches for "{searchQuery}"</div>)}
          </div>
        )}
      </div>

      <form className="input-row" onSubmit={send}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
           placeholder={mode === 'ai' ? 'Ask the AI assistant...' : 'site A paint exp = 5k ...'}
           maxLength={2000}
        />
         <button className="send" type="submit" disabled={busy || !input.trim()}>{busy ? '…' : '➤'}</button>
      </form>
    </div>
  )
}
