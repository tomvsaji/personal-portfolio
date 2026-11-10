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
  assert.equal(calls.length, 2); assert.equal(calls[1].history.length, 2)
})
it('retains clean history on failure, passes fresh tokens and honors Retry-After', async () => {
  let request
  const session = createChatSession({fetcher: async (_, options) => {request = JSON.parse(options.body); return new Response('', {status:429, headers:{'Retry-After':'10'}})}})
  await assert.rejects(session.send('test', 'fresh-token'), error => error.retryAfter === 10)
  assert.equal(request.turnstile_token, 'fresh-token'); assert.deepEqual(session.history(), [])
})
it('clear aborts pending work and leaves no history', async () => {
  const session = createChatSession({fetcher: (_, {signal}) => new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))))})
  const pending = session.send('test'); session.clear(); await assert.rejects(pending, {name:'AbortError'}); assert.deepEqual(session.history(), [])
})
it('rejects blank/overlong questions and invalid config without fetching', async () => {
  let calls = 0; const session = createChatSession({base: 'http://bad.test', fetcher: () => calls++})
  await assert.rejects(session.send('test')); await assert.rejects(session.send('x'.repeat(801))); await assert.rejects(session.send(' ')); assert.equal(calls, 0)
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
it('allows a new conversation immediately after clear without stale completion', async () => {
  let first = true
  const session = createChatSession({fetcher: (_, {signal}) => { if (!first) return Promise.resolve(response()); first = false; return new Promise((resolve,reject) => signal.addEventListener('abort', () => reject(new DOMException('Aborted','AbortError')))) }})
  const old = session.send('old'); session.clear(); const fresh = session.send('new')
  await assert.rejects(old, {name:'AbortError'}); await fresh; assert.equal(session.history()[0].content, 'new')
})
