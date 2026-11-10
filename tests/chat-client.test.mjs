// Synthetic SSE fixtures; never production answers.
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
const expect = value => ({ toBe: other => assert.equal(value, other), toBeNull: () => assert.equal(value, null), toHaveLength: n => assert.equal(value.length, n), toBeGreaterThanOrEqual: n => assert.ok(value >= n), toThrow: () => assert.throws(value), rejects: { toThrow: async text => assert.rejects(value, text ? new RegExp(text) : undefined) } })
import { readChatStream, safeSourceUrl, apiBase, boundedHistory, retryDelay } from '../lib/chat-client.mjs'
const stream = (value, step = 1) => new ReadableStream({ start(c) { const bytes = new TextEncoder().encode(value); for (let i = 0; i < bytes.length; i += step) c.enqueue(bytes.slice(i, i + step)); c.close() } })
const final = 'event: final\r\ndata: {"answer":"café",\r\ndata: "sources":[]}\r\n\r\nevent: done\r\ndata: {}\r\n\r\n'
describe('chat protocol', () => {
  it('decodes split UTF-8, CRLF and multiline SSE data', async () => { expect((await readChatStream(stream(final), () => {})).answer).toBe('café') })
  for (const delimiter of ['\n', '\r\n', '\r']) {
    for (const step of [Infinity, 1]) {
      const fixture = final.replaceAll('\r\n', delimiter)
      it(`accepts a complete ${JSON.stringify(delimiter)} stream in ${step === 1 ? 'byte chunks' : 'one chunk'}`, async () => {
        assert.equal((await readChatStream(stream(fixture, step))).answer, 'café')
      })
      for (const ending of [delimiter, '']) {
        it(`rejects an incomplete ${JSON.stringify(delimiter)} event with ${JSON.stringify(ending)} ending in ${step} chunks`, async () => {
          const incomplete = fixture.slice(0, -2 * delimiter.length) + ending
          await assert.rejects(readChatStream(stream(incomplete, step)), /incomplete or invalid/)
        })
      }
    }
  }
  for (const value of ['event: final\ndata: {}\n\n', 'event: claim\ndata: {"text":"x"}\n\n', 'event: done\ndata: {}\n\n', 'event: final\ndata: nope\n\n', 'x'.repeat(66000)]) it('rejects malformed, oversized or truncated streams', async () => { await expect(readChatStream(stream(value, 512), () => {})).rejects.toThrow() })
  it('rejects a stream error after partial claims', async () => { await expect(readChatStream(stream('event: claim\ndata: {"text":"partial"}\n\nevent: error\ndata: {"error":"capacity"}\n\n'), () => {})).rejects.toThrow('capacity') })
  it('restricts sources to public portfolio and published profile origins', () => { for (const url of ['javascript:alert(1)', 'data:text/html,x', '//tomvsaji.com', 'https://evil.test', 'https://tomvsaji.com@evil.test', 'https://tomvsaji.com:8443']) expect(safeSourceUrl(url)).toBeNull(); expect(safeSourceUrl('https://tomvsaji.com/about')).toBe('https://tomvsaji.com/about') })
  it('validates an HTTPS origin without path, credentials, query or fragment', () => { expect(apiBase()).toBe('https://chat.srv1619516.hstgr.cloud'); for (const url of ['http://example.com', 'https://a.test/api', 'https://u:p@a.test', 'https://a.test?x', '//a.test']) expect(() => apiBase(url)).toThrow() })
  it('sends only the last eight bounded successful messages', () => { const messages = Array.from({length: 12}, (_, i) => ({role: i % 2 ? 'assistant' : 'user', content: `${i}` + 'x'.repeat(900), sources: []})); const history = boundedHistory(messages); expect(history).toHaveLength(8); expect(history[0].content.startsWith('4')).toBe(true); expect(history.every(m => m.content.length === 800 && !m.sources)).toBe(true) })
  it('honors seconds and HTTP date Retry-After', () => { expect(retryDelay('12')).toBe(12); expect(retryDelay(new Date(Date.now() + 20000).toUTCString())).toBeGreaterThanOrEqual(19) })
})
