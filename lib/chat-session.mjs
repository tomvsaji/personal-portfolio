import { boundedHistory, readChatStream, retryDelay } from './chat-client.mjs'
export function createChatSession({ fetcher = (...args) => fetch(...args), timeout = 120000, verificationRequired = false, clock = () => performance.now() } = {}) {
  let messages = [], controller = null
  return {
    history: () => boundedHistory(messages),
    cancel() { controller?.abort() },
    async clear(token) {
      controller?.abort()
      const active = new AbortController(); controller = active
      const timer = setTimeout(() => active.abort(), 15000)
      try {
        const response = await fetcher('/api/conversation/reset', {method:'POST', credentials:'same-origin', redirect:'error', signal:active.signal, headers:{'Content-Type':'application/json'}, body:JSON.stringify(token ? {turnstile_token:token} : {})})
        if (!response.ok) throw new Error('Conversation could not be cleared. Please try again shortly.')
        messages = []
      } finally { clearTimeout(timer); if (controller === active) controller = null }
    },
    async send(question, token, onEvent) {
      if (controller) throw new Error('A question is already being answered.')
      if (typeof question !== 'string' || !question.trim() || question.length > 800) throw new Error('Please enter a question of 1–800 characters.')
      if (verificationRequired && (typeof token !== 'string' || !token.trim() || token.length > 4096)) throw new Error('Verification is required before sending a question.')
      const active = new AbortController(); controller = active
      const started = clock()
      let timedOut = false
      const timer = setTimeout(() => { timedOut = true; active.abort() }, timeout)
      try {
        const response = await fetcher('/api/chat/stream', { method: 'POST', mode: 'same-origin', credentials: 'same-origin', redirect: 'error', headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' }, signal: active.signal, body: JSON.stringify({question: question.trim(), ...(token ? {turnstile_token: token} : {})}) })
        if (!response.ok) {
          const error = new Error(response.status === 429 ? 'Too many questions. Please wait before trying again.' : response.status === 503 ? 'Chat is at capacity. Please try again shortly.' : [401, 403].includes(response.status) ? 'Verification was not accepted. Please verify again.' : 'Chat is temporarily unavailable. Please try again.')
          error.retryAfter = retryDelay(response.headers.get('Retry-After')); throw error
        }
        if (!response.headers.get('Content-Type')?.toLowerCase().includes('text/event-stream')) throw new Error('The server returned an unexpected response. Please try again.')
        const result = await readChatStream(response.body, onEvent)
        if (active.signal.aborted) throw new DOMException('Aborted', 'AbortError')
        messages = [...boundedHistory(messages), {role:'user', content:question.trim()}, {role:'assistant', content:result.answer}].slice(-8)
        const elapsed = clock() - started
        return {...result, clientElapsedMs:Number.isFinite(elapsed) && elapsed >= 0 ? elapsed : null}
      } catch (error) {
        if (timedOut) throw new Error('The answer took too long. Please try again.')
        if (active.signal.aborted) throw new DOMException('Aborted', 'AbortError')
        if (error instanceof TypeError) throw new Error('Could not connect to chat. Check your connection and try again.')
        throw error
      } finally { clearTimeout(timer); if (controller === active) controller = null }
    },
  }
}
