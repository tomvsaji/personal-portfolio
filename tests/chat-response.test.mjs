// Synthetic response fixtures; these are not live chatbot results.
import { it } from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AssistantMarkdown } from '../lib/chat-response.mjs'
const render = content => renderToStaticMarkup(React.createElement(AssistantMarkdown, {content}))
it('renders structured assistant markdown and partial text as actual safe React elements', () => {
  const html = render('First **bold** and *emphasis*.\n\n1. One\n2. Two\n\n- Item\n\n`inline`\n\n```js\nconst x = 1\n```\n\n[Profile](https://tomvsaji.com/about)')
  for (const element of ['<p>', '<strong>bold</strong>', '<em>emphasis</em>', '<ol>', '<ul>', '<li>', '<code>inline</code>', '<pre><code class="language-js">', 'href="https://tomvsaji.com/about"']) assert.ok(html.includes(element), element)
  assert.ok(render('Partial **answer [').includes('Partial **answer ['))
})
it('suppresses HTML and images and applies the explicit source URL policy to every link', () => {
  const html = render('<script>alert(1)</script>\n\n<img src="https://evil.test/x" onerror="alert(1)">\n\n![remote](https://evil.test/image)\n\n[bad](javascript:alert) [data](data:text/html,x) [relative](//tomvsaji.com) [credentials](https://x:y@tomvsaji.com/) [external](https://evil.test/) https://tomvsaji.com/about')
  assert.doesNotMatch(html, /<script|<img|onerror|href="(?:javascript:|data:|\/\/|https:\/\/evil|https:\/\/x:y)/)
  assert.match(html, /remote/)
  assert.match(html, /href="https:\/\/tomvsaji.com\/about"/)
})
it('links only supplied numbered citations and keeps a labelled source list discoverable above long answers', async () => {
  const { AssistantResponse } = await import('../lib/chat-response.mjs')
  const sources = [{number:'1', title:'Profile', heading:'About', url:'https://tomvsaji.com/about'}, {number:'2', title:'Blocked', url:'https://evil.test'}, {number:'3', title:'Retrieved context', url:'https://github.com/tomvsaji'}]
  const html = renderToStaticMarkup(React.createElement(AssistantResponse, {content:'Supported [1], unknown [9], unsafe [2]. `code [1]`\n\n[9](https://tomvsaji.com/)\n\n' + 'Long answer. '.repeat(100), sources}))
  assert.match(html, /Sources \(3\)/)
  assert.ok(html.indexOf('Sources (3)') < html.indexOf('Long answer.'))
  assert.match(html, /href="https:\/\/tomvsaji.com\/about"[^>]*>\[1\]/)
  assert.doesNotMatch(html, /<a[^>]*>\[9\]|<a[^>]*>\[2\]/)
  assert.match(html, /<code>code \[1\]<\/code>/)
  assert.match(html, /Retrieved context/)
  assert.match(html, /<section[^>]*aria-label="Sources"/)
  const empty = renderToStaticMarkup(React.createElement(AssistantResponse, {content:'An unsupported [1].', sources:[]}))
  assert.match(empty, /No sources supplied for this response/)
  assert.doesNotMatch(empty, /<a/)
})
it('renders Geek stats as native default-closed details with unavailable values for old responses', async () => {
  const { AssistantResponse } = await import('../lib/chat-response.mjs')
  const html = renderToStaticMarkup(React.createElement(AssistantResponse, {content:'Old response', sources:[], clientElapsedMs:1250}))
  assert.match(html, /<details[^>]*><summary>Geek stats<\/summary>/)
  assert.doesNotMatch(html, /<details[^>]*\bopen/)
  assert.ok(html.indexOf('<details') > html.indexOf('Old response'))
  assert.match(html, /<dt>Client round trip<\/dt><dd>1.25 s<\/dd>/)
  for (const label of ['Server processing', 'Prompt tokens', 'Completion tokens', 'Total tokens']) assert.ok(html.includes(`<dt>${label}</dt><dd>Unavailable</dd>`),label)
})
it('displays only allowlisted server stats and labels overall model throughput transparently', async () => {
  const { AssistantResponse } = await import('../lib/chat-response.mjs')
  const metrics = {model:'gpt-4.1-mini',elapsed_ms:800,model_calls:2,model_time_ms:600,search_calls:0,search_time_ms:0,prompt_tokens:40,completion_tokens:10,total_tokens:50,usage_complete:true,usage_source:'runtime',tokens_per_second:16.67,secret:'never-display',request_id:'private-id'}
  const html = renderToStaticMarkup(React.createElement(AssistantResponse, {content:'Answer', metrics, clientElapsedMs:1000}))
  for (const value of ['gpt-4.1-mini', '800 ms', '600 ms', '16.67 tokens/s', 'Overall model throughput', 'full model-call wall time', '<dt>Search calls</dt><dd>0</dd>', '<dt>Total tokens</dt><dd>50</dd>', 'Runtime (complete)']) assert.ok(html.includes(value),value)
  assert.doesNotMatch(html,/never-display|private-id|NaN|Infinity/)
  const bad = renderToStaticMarkup(React.createElement(AssistantResponse, {content:'Answer',metrics:{...metrics,model:'https://secret.test/key'},clientElapsedMs:Infinity}))
  assert.doesNotMatch(bad,/secret.test|Infinity|NaN/)
  assert.match(bad,/<dt>Client round trip<\/dt><dd>Unavailable<\/dd>/)
  const incomplete = renderToStaticMarkup(React.createElement(AssistantResponse, {content:'Answer',metrics:{...metrics,usage_complete:false}}))
  assert.match(incomplete,/<dt>Total tokens<\/dt><dd>Unavailable<\/dd>/)
})
it('does not let formatted numeric links bypass citation matching or ambiguously link duplicate source numbers', async () => {
  const html = renderToStaticMarkup(React.createElement(AssistantMarkdown, {content:'[**[9]**](https://tomvsaji.com/about) [1] [2]',sources:[{number:'1',title:'A',url:'https://tomvsaji.com/a'},{number:'1',title:'B',url:'https://tomvsaji.com/b'},{number:'2',title:'C',url:'javascript:alert(1)'}]}))
  assert.doesNotMatch(html, /<a/)
  assert.match(html, /<strong>\[9\]<\/strong>/)
})
it('labels reported prompt reuse, explicit zero and unavailable cache telemetry separately', async () => {
  const {AssistantResponse}=await import('../lib/chat-response.mjs')
  const metrics={model:'LiquidAI/LFM3-1.7B',elapsed_ms:100,model_calls:2,model_time_ms:90,search_calls:1,search_time_ms:5,prompt_tokens:100,completion_tokens:10,total_tokens:110,usage_complete:true,usage_source:'runtime',tokens_per_second:1,prompt_cache_complete:true,cached_prompt_tokens:75,cache_prompt_tokens:100,prompt_cache_reuse_ratio:0.75}
  const render=overrides=>renderToStaticMarkup(React.createElement(AssistantResponse,{content:'Answer',metrics:{...metrics,...overrides}}))
  const html=render({})
  assert.match(html,/<dt>Prompt cache<\/dt><dd>Reused<\/dd>/)
  assert.match(html,/<dt>Cached prompt tokens<\/dt><dd>75<\/dd>/)
  assert.match(html,/<dt>Prompt reuse<\/dt><dd>75.0%<\/dd>/)
  assert.match(html,/not a cached answer/)
  assert.match(render({cached_prompt_tokens:0}),/<dt>Prompt cache<\/dt><dd>No reuse reported<\/dd>/)
  assert.match(render({prompt_cache_complete:false}),/<dt>Prompt cache<\/dt><dd>Unavailable<\/dd>/)
})
