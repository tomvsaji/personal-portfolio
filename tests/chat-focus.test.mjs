// Synthetic focus lifecycle fixtures; parent browser checks exercise rendered React.
import { it } from 'node:test'
import assert from 'node:assert/strict'
import { createChatFocus } from '../lib/chat-focus.mjs'

function fixture() {
  const body = {}, outside = {}, stop = {}, send = {}, suggestion = {}
  let active = body, calls = 0
  const input = { disabled: false, focus() { if (!this.disabled) { active = this; calls++ } } }
  const panel = { contains: el => [input, stop, send, suggestion].includes(el) }
  const focus = createChatFocus(panel, body)
  return { focus, input, body, outside, stop, send, suggestion, active: () => active, calls: () => calls }
}
for (const outcome of ['success', 'cancel', 'error']) {
  it(`restores textarea after the ${outcome} commit, despite disabling and lost BODY focus`, () => {
    const f = fixture()
    f.focus.begin(f.input)
    f.input.disabled = true
    f.focus.restore(f.input, f.body)
    assert.equal(f.calls(), 0)
    f.input.disabled = false // React commit
    f.focus.restore(f.input, f.body)
    assert.equal(f.active(), f.input)
    f.focus.restore(f.input, f.body)
    assert.equal(f.calls(), 1)
  })
}
for (const control of ['stop', 'send', 'suggestion']) {
  it(`restores after the ${control} control disappears or becomes disabled`, () => {
    const f = fixture()
    f.focus.begin(f[control])
    f.focus.restore(f.input, f.body)
    assert.equal(f.active(), f.input)
  })
}
it('does not steal focus after a focus or pointer interaction outside, including nonfocusable page content', () => {
  for (const target of ['outside', 'body']) {
    const f = fixture()
    f.focus.begin(f.input)
    f.focus.interact(f[target])
    f.focus.restore(f.input, f.body)
    assert.equal(f.calls(), 0)
  }
})
it('also guards an outside active element at the completion commit', () => {
  const f = fixture()
  f.focus.begin(f.input)
  f.focus.restore(f.input, f.outside)
  assert.equal(f.calls(), 0)
})
it('close revokes restoration; reopen and clear can begin a fresh focus lifecycle', () => {
  const f = fixture()
  f.focus.begin(f.input)
  f.focus.reset()
  f.focus.restore(f.input, f.body)
  assert.equal(f.calls(), 0)
  f.focus.begin(f.stop)
  f.focus.restore(f.input, f.body)
  assert.equal(f.calls(), 1)
})
