export const DEFAULT_API_BASE = 'https://chat.srv1619516.hstgr.cloud'
export function apiBase(value = DEFAULT_API_BASE) {
  let url
  try { url = new URL(value) } catch { throw new Error('Chat API configuration is invalid.') }
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('Chat API configuration must be an HTTPS origin.')
  return url.origin
}
const SOURCE_ORIGINS = new Set(['https://tomvsaji.com', 'https://www.tomvsaji.com', 'https://github.com', 'https://linkedin.com', 'https://www.linkedin.com', 'https://twitter.com'])
export function safeSourceUrl(value) {
  if (typeof value !== 'string' || !/^https?:\/\//i.test(value)) return null
  try { const url = new URL(value); return !url.username && !url.password && SOURCE_ORIGINS.has(url.origin) ? url.href : null } catch { return null }
}
export function boundedHistory(messages) {
  return messages.filter(m => ['user', 'assistant'].includes(m.role) && typeof m.content === 'string').slice(-8).map(({role, content}) => ({role, content: content.slice(0, 800)}))
}
export function retryDelay(value) {
  if (!value) return 0
  const seconds = /^\d+$/.test(value) ? Number(value) : (Date.parse(value) - Date.now()) / 1000
  return Number.isFinite(seconds) ? Math.max(0, Math.ceil(seconds)) : 0
}
const malformed = () => new Error('The answer stream was incomplete or invalid. Please try again.')
export async function readChatStream(body, onEvent = () => {}) {
  if (!body) throw malformed()
  const reader = body.getReader()
  const decoder = new TextDecoder('utf-8', { fatal: true })
  let buffer = '', bytes = 0, event = '', data = [], result, done = false, events = 0, claimLength = 0
  function line(value) {
    if (value === '') {
      if (!data.length) { event = ''; return }
      if (++events > 2048) throw malformed()
      let payload
      try { payload = JSON.parse(data.join('\n')) } catch { throw malformed() }
      const kind = event || 'message'
      data = []; event = ''
      if (!payload || typeof payload !== 'object' || done || (result && kind !== 'done')) throw malformed()
      if (kind === 'error') throw new Error(typeof payload.error === 'string' ? payload.error.slice(0, 400) : 'Chat is temporarily unavailable.')
      if (kind === 'final') {
        if (typeof payload.answer !== 'string' || !payload.answer.trim() || payload.answer.length > 24000 || !Array.isArray(payload.sources) || payload.sources.length > 30) throw malformed()
        result = { answer: payload.answer, sources: payload.sources.map(source => {
          if (!source || typeof source !== 'object') throw malformed()
          return { number: String(source.number ?? '').slice(0, 12), title: String(source.title || source.name || 'Source').slice(0, 240), heading: typeof source.heading === 'string' ? source.heading.slice(0, 240) : '', url: safeSourceUrl(source.url) }
        }) }
      }
      if (kind === 'done') { if (!result) throw malformed(); done = true }
      if (kind === 'claim') { if (typeof payload.text !== 'string' || (claimLength += payload.text.length) > 24000) throw malformed() }
      if (kind === 'status' && (typeof payload.message !== 'string' || payload.message.length > 500)) throw malformed()
      onEvent(kind, payload)
    } else if (!value.startsWith(':')) {
      const index = value.indexOf(':'); const field = index < 0 ? value : value.slice(0, index)
      const content = index < 0 ? '' : value.slice(index + 1).replace(/^ /, '')
      if (field === 'event') event = content
      if (field === 'data') data.push(content)
    }
  }
  try {
    while (!done) {
      const chunk = await reader.read()
      if (chunk.done) buffer += decoder.decode()
      else {
        bytes += chunk.value.byteLength
        if (bytes > 262144) throw malformed()
        buffer += decoder.decode(chunk.value, {stream: true})
      }
      let match
      while ((match = /\r\n|\n|\r/.exec(buffer))) {
        if (!chunk.done && match[0] === '\r' && match.index === buffer.length - 1) break
        line(buffer.slice(0, match.index)); buffer = buffer.slice(match.index + match[0].length)
        if (done) break
      }
      if (buffer.length > 65536 || data.join('\n').length > 65536) throw malformed()
      if (chunk.done) break
    }
    if (!done || !result) throw malformed()
    return result
  } finally { try { await reader.cancel() } finally { reader.releaseLock() } }
}
