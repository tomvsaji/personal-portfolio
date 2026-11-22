// Isolated request tests with synthetic API responses; no live inference.
import { it } from 'node:test'
import assert from 'node:assert/strict'
import { createChatSession } from '../lib/chat-session.mjs'
const response = () => new Response('event: final\ndata: {"answer":"Test answer","sources":[]}\n\nevent: done\ndata: {}\n\n', {headers: {'Content-Type': 'text/event-stream'}})
it('blocks duplicate sends and commits history only after success', async () => {
  let release, calls = []
  const session = createChatSession({fetcher: async (_, options) => { calls.push(JSON.parse(options.body)); await new Promise(r => { release = r }); return response() }})
  const first = session.send('first'); await assert.rejects(session.send('duplicate'), /already/); release(); await first
  const second = session.send('second'); release(); await second
  assert.equal(calls.length, 2); assert.equal('history' in calls[1], false)
})
it('retains clean history on failure, passes fresh tokens and honors Retry-After', async () => {
  let request
  const session = createChatSession({fetcher: async (_, options) => {request = JSON.parse(options.body); return new Response('', {status:429, headers:{'Retry-After':'10'}})}})
  await assert.rejects(session.send('test', 'fresh-token'), error => error.retryAfter === 10)
  assert.equal(request.turnstile_token, 'fresh-token'); assert.deepEqual(session.history(), [])
})
it('clear aborts pending work, waits for reset, and sends only same-origin session requests', async () => {
  const calls = []
  const session = createChatSession({fetcher: (url, options) => {
    calls.push({url, options})
    if (url.endsWith('/reset')) return Promise.resolve(Response.json({status:'cleared'}))
    return new Promise((resolve, reject) => options.signal.addEventListener('abort', () => reject(new DOMException('Aborted','AbortError'))))
  }})
  const pending = session.send('test')
  const rejected = assert.rejects(pending, {name:'AbortError'})
  await session.clear(); await rejected
  assert.deepEqual(session.history(), [])
  assert.deepEqual(calls.map(call => call.url), ['/api/chat/stream','/api/conversation/reset'])
  assert.ok(calls.every(call => call.options.credentials === 'same-origin'))
  assert.deepEqual(JSON.parse(calls[0].options.body), {question:'test'})
})
it('rejects blank and overlong questions without fetching', async () => {
  let calls = 0; const session = createChatSession({fetcher: () => calls++})
  await assert.rejects(session.send('x'.repeat(801))); await assert.rejects(session.send(' ')); assert.equal(calls,0)
})
it('does not clear local history or accept a send before server reset succeeds', async () => {
  let release
  const session = createChatSession({fetcher: async url => {
    if (url.endsWith('/reset')) { await new Promise(resolve => {release=resolve}); return new Response('',{status:503}) }
    return response()
  }})
  await session.send('remember')
  const resetting = session.clear()
  await assert.rejects(session.send('too soon'), /already/)
  release(); await assert.rejects(resetting, /could not be cleared/)
  assert.equal(session.history()[0].content,'remember')
})
it('requires a stream response and never retries', async () => {
  let calls = 0; const session = createChatSession({fetcher: async () => {calls++; return new Response('{}')}})
  await assert.rejects(session.send('test')); assert.equal(calls, 1)
})
it('fails closed without verification when configured', async () => {
  let calls = 0
  const session = createChatSession({verificationRequired:true, fetcher: async () => {calls++; return response()}})
  await assert.rejects(session.send('test'), /Verification/)
  await session.send('test', 'test-only-token'); assert.equal(calls, 1)
})
it('schedules and clears a finite 120-second default deadline', async (t) => {
  const timer = {}, scheduled = [], cleared = []
  t.mock.method(globalThis, 'setTimeout', (callback, delay) => { scheduled.push({callback, delay}); return timer })
  t.mock.method(globalThis, 'clearTimeout', handle => { cleared.push(handle) })
  try {
    const session = createChatSession({fetcher: async () => response()})
    await session.send('test')
    assert.equal(scheduled.length, 1)
    assert.equal(scheduled[0].delay, 120000)
    assert.equal(typeof scheduled[0].callback, 'function')
    assert.deepEqual(cleared, [timer])
  } finally { t.mock.restoreAll() }
})
it('honors a short caller timeout and aborts without retrying or storing a partial turn', async () => {
  let calls = 0, requestSignal
  const session = createChatSession({timeout:5, fetcher: (_, {signal}) => {
    calls++; requestSignal = signal
    return new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))))
  }})
  await assert.rejects(session.send('test'), /too long/)
  assert.equal(requestSignal.aborted, true); assert.equal(calls, 1); assert.deepEqual(session.history(), [])
})
it('measures each successful client round trip with a monotonic clock and keeps stats out of request history', async () => {
  let tick = 100, calls = []
  const session = createChatSession({clock:() => tick, fetcher:async (_, options) => {
    calls.push(JSON.parse(options.body)); tick += 1250
    return response()
  }})
  const first = await session.send('first')
  assert.equal(first.clientElapsedMs,1250); assert.equal(first.metrics,null)
  tick += 500
  const second = await session.send('second')
  assert.equal(second.clientElapsedMs,1250)
  assert.equal('history' in calls[1],false)
  assert.ok(calls.every(call => !('metrics' in call) && !('clientElapsedMs' in call)))
})
it('cancel rejects a pending response without recording successful stats and allows a fresh send', async () => {
  let release, first = true
  const session = createChatSession({fetcher: async () => {if (first) {first = false; await new Promise(resolve => {release = resolve})} return response()}})
  const pending = session.send('cancel me')
  await assert.rejects(session.send('duplicate'),/already/)
  session.cancel(); release()
  await assert.rejects(pending,{name:'AbortError'})
  assert.deepEqual(session.history(),[])
  const result = await session.send('fresh')
  assert.ok(Number.isFinite(result.clientElapsedMs) && result.clientElapsedMs >= 0)
  assert.equal(session.history()[0].content,'fresh')
})
it('keeps valid server metrics attached to their own result, drops invalid metrics, and sends neither in history', async () => {
  const metrics = {model:'qwen2.5:3b',elapsed_ms:50,model_calls:1,model_time_ms:40,search_calls:0,search_time_ms:0,prompt_tokens:20,completion_tokens:5,total_tokens:25,usage_complete:true,usage_source:'runtime',tokens_per_second:125}
  const requests = []; let tick = 0
  const session = createChatSession({clock:() => tick, fetcher:async (_, options) => {
    requests.push(JSON.parse(options.body)); tick += requests.length * 100
    const payload = {answer:`Response ${requests.length}`,sources:[],metrics:requests.length === 1 ? metrics : {...metrics,elapsed_ms:-5}}
    return new Response(`event: final\ndata: ${JSON.stringify(payload)}\n\nevent: done\ndata: {}\n\n`,{headers:{'Content-Type':'text/event-stream'}})
  }})
  const first = await session.send('one'), second = await session.send('two')
  assert.deepEqual(first.metrics,metrics); assert.equal(second.metrics,null)
  assert.equal(first.clientElapsedMs,100); assert.equal(second.clientElapsedMs,200)
  assert.equal('history' in requests[1],false)
})
