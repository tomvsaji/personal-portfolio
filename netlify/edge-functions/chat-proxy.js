// Fixed upstream: never accept an arbitrary proxy target from a browser.
const upstream = 'https://chat.srv1619516.hstgr.cloud'
const origins = new Set(['https://tomvsaji.com', 'https://www.tomvsaji.com', 'https://deploy-preview-16--tomvsaji.netlify.app'])
const paths = new Set(['/api/chat/stream', '/api/conversation/reset'])
const fail = (status, error) => Response.json({error}, {status, headers:{'Cache-Control':'no-store'}})
export default async function chatProxy(request, _context, fetcher = fetch) {
  const url = new URL(request.url)
  if (!paths.has(url.pathname) || url.search) return fail(404, 'Unknown chat route.')
  if (request.method !== 'POST') return fail(405, 'Use POST.')
  if (!origins.has(url.origin) || request.headers.get('Origin') !== url.origin) return fail(403, 'Chat request origin was not accepted.')
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return fail(415, 'Use JSON.')
  // Bound input while reading, including requests without Content-Length.
  const reader = request.body?.getReader()
  if (!reader) return fail(400, 'A JSON body is required.')
  let size = 0, chunks = []
  try {
    while (true) {
      const {done, value} = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 10000) { await reader.cancel(); return fail(413, 'Request is too large.') }
      chunks.push(value)
    }
    const body = new Uint8Array(size)
    let offset = 0
    for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength }
    const headers = new Headers({'Content-Type':'application/json', 'Accept':'text/event-stream', 'Origin':url.origin})
    // Never forward portfolio auth cookies, Authorization, or untrusted client IP headers.
    const session = request.headers.get('Cookie')?.match(/(?:^|;\s*)site_chat_session=([a-f0-9]{64})(?=;|$)/)
    if (session) headers.set('Cookie', `site_chat_session=${session[1]}`)
    const response = await fetcher(upstream + url.pathname, {method:'POST', headers, body, redirect:'error', signal:AbortSignal.any([request.signal, AbortSignal.timeout(120000)])})
    const outgoing = new Headers({'Cache-Control':'no-store, no-transform', 'X-Content-Type-Options':'nosniff'})
    for (const name of ['Content-Type', 'Retry-After']) if (response.headers.has(name)) outgoing.set(name, response.headers.get(name))
    const cookie = response.headers.get('Set-Cookie')
    if (cookie && /^site_chat_session=[a-f0-9]{64};/.test(cookie) && !/;\s*domain=/i.test(cookie)) outgoing.set('Set-Cookie', cookie)
    // Passing the stream through sends headers immediately and preserves SSE progress.
    return new Response(response.body, {status:response.status, headers:outgoing})
  } catch {
    return fail(502, 'Could not connect to chat. Please try again.')
  } finally { reader.releaseLock() }
}
