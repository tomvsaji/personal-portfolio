export const DEFAULT_API_BASE = 'https://chat.srv1619516.hstgr.cloud'
export function apiBase(value = DEFAULT_API_BASE) {
  let url
  try { url = new URL(value) } catch { throw new Error('Chat API configuration is invalid.') }
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('Chat API configuration must be an HTTPS origin.')
  return url.origin
}
const SOURCE_ORIGINS = new Set(['https://tomvsaji.com', 'https://www.tomvsaji.com', 'https://github.com', 'https://linkedin.com', 'https://www.linkedin.com', 'https://twitter.com'])
export function safeSourceUrl(value) {
  if (typeof value !== 'string' || value.length > 2048 || !/^https?:\/\//i.test(value)) return null
  try { const url = new URL(value); return !url.username && !url.password && SOURCE_ORIGINS.has(url.origin) ? url.href : null } catch { return null }
}
export function normalizeSources(sources) {
  if (!Array.isArray(sources)) return []
  return sources.slice(0, 30).filter(source => source && typeof source === 'object' && !Array.isArray(source)).map(source => ({
    number: ['string', 'number'].includes(typeof source.number) && /^(?:[1-9]\d{0,5})$/.test(String(source.number)) ? String(source.number) : '',
    title: typeof source.title === 'string' ? source.title.slice(0, 240) : typeof source.name === 'string' ? source.name.slice(0, 240) : 'Source',
    heading: typeof source.heading === 'string' ? source.heading.slice(0, 240) : '',
    url: safeSourceUrl(source.url),
  }))
}
const finiteNonnegative = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER
const count = value => Number.isSafeInteger(value) && value >= 0
export function normalizeMetrics(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  try { if (JSON.stringify(value).length > 4096) return null } catch { return null }
  // Only a short public model name is displayable; never echo arbitrary identifiers or URLs.
  if (typeof value.model !== 'string' || value.model.length > 80 || !/^(?:gpt|chatgpt|o[134]|claude|gemini|llama|mistral|qwen|deepseek|command|nova|phi|granite|lfm)[a-zA-Z0-9 .-]{0,64}(?::[a-zA-Z0-9.-]{1,12})?$/i.test(value.model)) return null
  if (!['elapsed_ms', 'model_time_ms', 'search_time_ms'].every(key => finiteNonnegative(value[key])) || !['model_calls', 'search_calls'].every(key => count(value[key]))) return null
  if (typeof value.usage_complete !== 'boolean' || !['runtime', 'unavailable'].includes(value.usage_source)) return null
  if (!['prompt_tokens', 'completion_tokens', 'total_tokens'].every(key => value[key] === null || count(value[key]))) return null
  if (value.tokens_per_second !== null && !finiteNonnegative(value.tokens_per_second)) return null
  const complete = value.usage_complete && value.usage_source === 'runtime' && ['prompt_tokens', 'completion_tokens', 'total_tokens'].every(key => count(value[key]))
  return {
    model:value.model, elapsed_ms:value.elapsed_ms, model_calls:value.model_calls, model_time_ms:value.model_time_ms,
    search_calls:value.search_calls, search_time_ms:value.search_time_ms,
    prompt_tokens:complete ? value.prompt_tokens : null, completion_tokens:complete ? value.completion_tokens : null,
    total_tokens:complete ? value.total_tokens : null, usage_complete:complete, usage_source:complete ? 'runtime' : 'unavailable',
    tokens_per_second:complete ? value.tokens_per_second : null,
  }
}
export function normalizeChatResult(payload) {
  if (!payload || typeof payload !== 'object' || typeof payload.answer !== 'string' || !payload.answer.trim() || payload.answer.length > 24000 || !Array.isArray(payload.sources) || payload.sources.length > 30 || payload.sources.some(source => !source || typeof source !== 'object' || Array.isArray(source))) throw malformed()
  return {answer:payload.answer, sources:normalizeSources(payload.sources), metrics:normalizeMetrics(payload.metrics)}
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
        result = normalizeChatResult(payload)
      }
      if (kind === 'done') { if (!result) throw malformed(); done = true }
      if (kind === 'claim' || kind === 'delta') { if (typeof payload.text !== 'string' || (claimLength += payload.text.length) > 24000) throw malformed() }
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
