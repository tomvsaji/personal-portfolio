import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { createChatSession } from '../lib/chat-session.mjs'
import { createChatFocus } from '../lib/chat-focus.mjs'
import styles from '../styles/ChatWidget.module.css'

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()
const SUGGESTIONS = ['What AI systems has Tom built?', 'Tell me about Botaina.', 'What is Tom focused on now?']

function Verification({ onToken, onMessage, resetRef }) {
  const host = useRef(null)
  const widget = useRef(null)
  const mounted = useRef(false)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { mounted.current = true; const timer = setTimeout(() => { if (mounted.current && !window.turnstile) onMessage('Verification could not load. Check your connection and reopen chat.') }, 15000); return () => { mounted.current = false; clearTimeout(timer) } }, [onMessage])
  useEffect(() => {
    if (!loaded && !window.turnstile) return
    if (!host.current || !window.turnstile) return
    try {
      widget.current = window.turnstile.render(host.current, {
        sitekey: SITE_KEY, action: 'site_chat', theme: 'auto', size: 'flexible',
        callback: token => { if (mounted.current) { onToken(token); onMessage('Verification ready.') } },
        'expired-callback': () => { if (mounted.current) { onToken(null); onMessage('Verification expired. Please verify again.') } },
        'error-callback': () => { if (mounted.current) { onToken(null); onMessage('Verification failed. Reopen chat to try again.') } },
        'timeout-callback': () => { if (mounted.current) { onToken(null); onMessage('Verification timed out. Please verify again.') } },
      })
      resetRef.current = () => { onToken(null); window.turnstile?.reset(widget.current) }
    } catch { onToken(null); onMessage('Verification is unavailable. Reopen chat to try again.') }
    return () => { resetRef.current = null; if (widget.current !== null) window.turnstile?.remove(widget.current); widget.current = null; onToken(null) }
  }, [loaded, onToken, onMessage, resetRef])
  return <><Script id="portfolio-turnstile" src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={() => setLoaded(true)} onError={() => { onToken(null); onMessage('Verification could not load. Reopen chat to try again.') }} /><div className={styles.verification} ref={host} /></>
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [pending, setPending] = useState(null)
  const [claims, setClaims] = useState('')
  const [status, setStatus] = useState('')
  const [notice, setNotice] = useState('')
  const [announcement, setAnnouncement] = useState('')
  const [token, setToken] = useState(null)
  const [verificationMessage, setVerificationMessage] = useState('Complete verification to send a question.')
  const [retryUntil, setRetryUntil] = useState(0)
  const [now, setNow] = useState(Date.now())
  const [focusRequest, setFocusRequest] = useState(0)
  const session = useRef(null)
  if (!session.current) session.current = createChatSession({base: process.env.NEXT_PUBLIC_CHATBOT_API_BASE_URL, verificationRequired: !!SITE_KEY})
  const root = useRef(null), panel = useRef(null)
  const launcher = useRef(null), input = useRef(null), transcript = useRef(null), resetVerification = useRef(null)
  const locked = useRef(false), generation = useRef(0), alive = useRef(true), focusLifecycle = useRef(null)
  const remaining = Math.max(0, Math.ceil((retryUntil - now) / 1000))
  const busy = pending !== null
  useEffect(() => { alive.current = true; return () => { alive.current = false; generation.current++; session.current.clear() } }, [])
  useEffect(() => {
    const viewport = window.visualViewport
    if (!open || !viewport) return
    const resize = () => {
      root.current?.style.setProperty('--chat-viewport-height', `${viewport.height}px`)
      root.current?.style.setProperty('--chat-keyboard-offset', `${Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)}px`)
    }
    resize(); viewport.addEventListener('resize', resize); viewport.addEventListener('scroll', resize)
    return () => { viewport.removeEventListener('resize', resize); viewport.removeEventListener('scroll', resize); root.current?.style.removeProperty('--chat-viewport-height'); root.current?.style.removeProperty('--chat-keyboard-offset') }
  }, [open])
  useEffect(() => {
    if (!open) return
    const focus = createChatFocus(panel.current, document.body)
    focusLifecycle.current = focus
    focus.begin(input.current)
    const onFocus = event => { if (event.target !== document.body) focus.interact(event.target) }
    const onPointer = event => focus.interact(event.target)
    const onBlur = () => focus.reset()
    document.addEventListener('focusin', onFocus, true)
    document.addEventListener('pointerdown', onPointer, true)
    window.addEventListener('blur', onBlur)
    input.current?.focus()
    return () => {
      focus.reset(); focusLifecycle.current = null
      document.removeEventListener('focusin', onFocus, true)
      document.removeEventListener('pointerdown', onPointer, true)
      window.removeEventListener('blur', onBlur)
    }
  }, [open])
  useEffect(() => {
    if (open && !busy) focusLifecycle.current?.restore(input.current, document.activeElement)
  }, [busy, open, focusRequest])
  useEffect(() => { if (!retryUntil) return; const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer) }, [retryUntil])
  useEffect(() => { const el = transcript.current; if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 160) el.scrollTop = el.scrollHeight }, [messages, pending, claims])
  function close() { focusLifecycle.current?.reset(); setOpen(false); launcher.current?.focus() }
  function clear() {
    focusLifecycle.current?.begin(document.activeElement); setFocusRequest(previous => previous + 1)
    generation.current++; session.current.clear(); locked.current = false
    setMessages([]); setPending(null); setClaims(''); setQuestion(''); setNotice(''); setStatus(''); setAnnouncement('Conversation cleared.'); resetVerification.current?.()
  }
  async function submit(value) {
    const text = value.trim()
    if (locked.current || remaining || !text || value.length > 800 || (SITE_KEY && !token)) return
    focusLifecycle.current?.begin(document.activeElement)
    locked.current = true
    const current = ++generation.current
    const freshToken = token
    setToken(null); resetVerification.current?.()
    setPending(text); setQuestion(''); setClaims(''); setNotice(''); setStatus('Finding an answer…'); setAnnouncement('Answer in progress.')
    try {
      const result = await session.current.send(text, freshToken, (kind, payload) => {
        if (!alive.current || current !== generation.current) return
        if (kind === 'status') setStatus(payload.message)
        if (kind === 'claim') setClaims(previous => previous + (previous ? '\n\n' : '') + payload.text)
      })
      if (!alive.current || current !== generation.current) return
      setMessages(previous => [...previous, {role:'user', content:text}, {role:'assistant', content:result.answer, sources:result.sources}].slice(-24))
      setAnnouncement('Answer ready. Review the conversation and sources.')
    } catch (error) {
      if (!alive.current || current !== generation.current) return
      setQuestion(text)
      const message = error.name === 'AbortError' ? 'Answer cancelled. Your question is ready to edit or send again.' : error.message
      setNotice(message); setAnnouncement(message)
      if (error.retryAfter) { setNow(Date.now()); setRetryUntil(Date.now() + error.retryAfter * 1000) }
    } finally {
      if (alive.current && current === generation.current) { locked.current = false; setPending(null); setClaims(''); setStatus(''); setFocusRequest(previous => previous + 1); resetVerification.current?.() }
    }
  }
  return <div className={styles.widget} ref={root}>
    <div className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{announcement}</div>
    {open && <section ref={panel} className={styles.panel} aria-labelledby="tom-chat-title" id="tom-chat" onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); close() } }}>
      <header className={styles.header}>
        <span className={styles.avatar} aria-hidden="true">TVS</span>
        <div className={styles.identity}><h2 id="tom-chat-title">Ask about Tom</h2><p>AI guide to his work & experience</p></div>
        <button type="button" className={styles.quiet} onClick={clear}>Clear</button>
        <button type="button" className={styles.close} aria-label="Close chat" onClick={close}>×</button>
      </header>
      <div className={styles.transcript} ref={transcript} role="region" aria-label="Conversation" tabIndex={0}>
        <div className={styles.intro}><span className={styles.eyebrow}>TOM’S PORTFOLIO / AI GUIDE</span><h3>Get to know the work.</h3><p>Explore Tom’s AI projects, engineering experience and writing, grounded in his published profile.</p></div>
        {messages.length === 0 && !busy && <div className={styles.suggestions}>{SUGGESTIONS.map(text => <button key={text} type="button" disabled={remaining > 0 || (!!SITE_KEY && !token)} onClick={() => submit(text)}>{text}<span aria-hidden="true"> ↗</span></button>)}</div>}
        {messages.map((message, index) => <article key={index} className={`${styles.message} ${message.role === 'user' ? styles.user : ''}`} aria-label={message.role === 'user' ? 'You' : 'Portfolio guide'}><span className={styles.messageLabel}>{message.role === 'user' ? 'YOU' : 'PORTFOLIO GUIDE'}</span><p>{message.content}</p>{message.sources?.length > 0 && <ul className={styles.sources} aria-label="Sources">{message.sources.map((source, i) => <li key={i}>{source.url ? <a href={source.url} target="_blank" rel="noopener noreferrer">[{source.number}] {source.title}{source.heading ? ` · ${source.heading}` : ''}<span className={styles.srOnly}> (opens in a new tab)</span></a> : <span>[{source.number}] {source.title}</span>}</li>)}</ul>}</article>)}
        {busy && <><article className={`${styles.message} ${styles.user}`} aria-label="You"><span className={styles.messageLabel}>YOU</span><p>{pending}</p></article><article className={styles.message} aria-label="Answer in progress"><span className={styles.messageLabel}>PORTFOLIO GUIDE · THINKING</span><p>{claims || status}</p>{claims && <small>Answer in progress — details may change.</small>}</article></>}
      </div>
      <form className={styles.form} onSubmit={event => { event.preventDefault(); submit(question) }}>
        {notice && <p className={styles.notice}>{notice}</p>}
        {remaining > 0 && <p className={styles.note}>Please wait {remaining}s before sending again.</p>}
        {SITE_KEY && <><Verification onToken={setToken} onMessage={setVerificationMessage} resetRef={resetVerification} /><p className={styles.note}>{verificationMessage}</p></>}
        <label htmlFor="tom-chat-question" className={styles.srOnly}>Your question about Tom</label>
        <div className={styles.composer}><textarea ref={input} id="tom-chat-question" placeholder="Ask about Tom’s work…" value={question} maxLength={800} rows={2} disabled={busy} onChange={event => setQuestion(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); submit(question) } }} />{busy ? <button type="button" className={styles.send} onClick={() => session.current.cancel()}>Stop</button> : <button type="submit" className={styles.send} disabled={!question.trim() || remaining > 0 || (!!SITE_KEY && !token)}>Send <span aria-hidden="true">↑</span></button>}</div>
        <div className={styles.footnote}><span>AI can make mistakes. Check sources.</span><span>{question.length}/800</span></div>
        <p className={styles.privacy}>Questions go to Tom’s chat service. Avoid sharing sensitive information.</p>
      </form>
    </section>}
    <button type="button" ref={launcher} className={styles.launcher} aria-expanded={open} aria-controls="tom-chat" onClick={() => open ? close() : setOpen(true)}><svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6 3V6a2 2 0 0 1 2-2Z"/><path d="M7 9h10M7 13h6"/></svg>Ask about Tom<span className={styles.launcherDot} aria-hidden="true" /></button>
  </div>
}
