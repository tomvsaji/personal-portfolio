import React, { useId } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { normalizeMetrics, normalizeSources, safeSourceUrl } from './chat-client.mjs'
const h = React.createElement
function citationMap(sources) {
  const counts = new Map()
  for (const source of sources) counts.set(source.number, (counts.get(source.number) || 0) + 1)
  return new Map(sources.filter(source => source.number && source.url && counts.get(source.number) === 1).map(source => [source.number, source.url]))
}
// Work on text nodes only: never turn code, existing links, or images into citations.
function citationsPlugin(references) {
  return () => tree => {
    function visit(node) {
      if (!node.children || ['link', 'linkReference', 'code', 'inlineCode', 'image'].includes(node.type)) return
      node.children = node.children.flatMap(child => {
        if (child.type !== 'text') { visit(child); return [child] }
        const parts = []; let start = 0
        for (const match of child.value.matchAll(/\[([1-9]\d{0,5})\]/g)) {
          const url = references.get(match[1]); if (!url) continue
          parts.push({type:'text', value:child.value.slice(start, match.index)}, {type:'link', url, children:[{type:'text', value:match[0]}]})
          start = match.index + match[0].length
        }
        return parts.length ? [...parts, {type:'text', value:child.value.slice(start)}] : [child]
      })
    }
    visit(tree)
  }
}
function externalLink(href, children) {
  return h('a', {href, target:'_blank', rel:'noopener noreferrer'}, children, h('span', {className:'chat-new-tab'}, ' (opens in a new tab)'))
}
function textContent(children) {
  return React.Children.toArray(children).map(child => React.isValidElement(child) ? textContent(child.props.children) : String(child)).join('')
}
export function AssistantMarkdown({content, className, sources = []}) {
  const references = citationMap(normalizeSources(sources))
  const components = {
    a: ({href, children}) => {
      const label = textContent(children).trim()
      const number = /^(?:\[(\d+)\]|(\d+))$/.exec(label)
      const safe = number ? references.get(number[1] || number[2]) : safeSourceUrl(href)
      return safe ? externalLink(safe, children) : h(React.Fragment, null, children)
    },
    img: ({alt}) => h('span', null, alt || 'Image omitted'),
  }
  return h('div', {className}, h(ReactMarkdown, {remarkPlugins:[remarkGfm, citationsPlugin(references)], skipHtml:true, urlTransform:value => safeSourceUrl(value) || '', components}, typeof content === 'string' ? content : ''))
}
export function AssistantResponse({content, sources, metrics, clientElapsedMs, styles = {}}) {
  const supplied = normalizeSources(sources)
  const id = useId()
  return h(React.Fragment, null,
    supplied.length ? h('a', {href:`#${id}`, className:styles.sourceJump}, `Sources (${supplied.length}) ↓`) : h('p', {className:styles.sourceNotice}, 'No sources supplied for this response'),
    h(AssistantMarkdown, {content, sources:supplied, className:styles.markdown}),
    supplied.length > 0 && h('section', {id, className:styles.sourceSection, 'aria-label':'Sources'},
      h('h4', null, `Sources (${supplied.length})`),
      h('ul', {className:styles.sources}, supplied.map((source, index) => h('li', {key:index},
        source.url ? externalLink(source.url, `${source.number ? `[${source.number}] ` : ''}${source.title}${source.heading ? ` · ${source.heading}` : ''}`) : h('span', null, `${source.number ? `[${source.number}] ` : ''}${source.title}${source.heading ? ` · ${source.heading}` : ''}`))))),
    h(GeekStats, {metrics, clientElapsedMs, className:styles.geekStats}))
}

const duration = value => typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER ? 'Unavailable' : value < 1000 ? `${Math.round(value)} ms` : `${(value / 1000).toFixed(2)} s`
export function GeekStats({metrics, clientElapsedMs, className}) {
  const safe = normalizeMetrics(metrics)
  const rows = [
    ['Client round trip', duration(clientElapsedMs)],
    ['Server processing', duration(safe?.elapsed_ms)],
    ['Model', safe?.model ?? 'Unavailable'],
    ['Model calls', safe?.model_calls ?? 'Unavailable'],
    ['Model call time', duration(safe?.model_time_ms)],
    ['Search calls', safe?.search_calls ?? 'Unavailable'],
    ['Search time', duration(safe?.search_time_ms)],
    ['Prompt tokens', safe?.prompt_tokens ?? 'Unavailable'],
    ['Prompt cache', !safe?.prompt_cache_complete ? 'Unavailable' : safe.cached_prompt_tokens > 0 ? 'Reused' : 'No reuse reported'],
    ['Cached prompt tokens', safe?.cached_prompt_tokens ?? 'Unavailable'],
    ['Prompt reuse', safe?.prompt_cache_reuse_ratio == null ? 'Unavailable' : `${(safe.prompt_cache_reuse_ratio * 100).toFixed(1)}%`],
    ['Completion tokens', safe?.completion_tokens ?? 'Unavailable'],
    ['Total tokens', safe?.total_tokens ?? 'Unavailable'],
    ['Token usage', safe?.usage_complete ? 'Runtime (complete)' : 'Unavailable'],
    ['Overall model throughput', safe?.tokens_per_second == null ? 'Unavailable' : `${safe.tokens_per_second.toFixed(2)} tokens/s`],
  ]
  return h('details', {className}, h('summary', null, 'Geek stats'),
    h('dl', null, rows.map(([label, value]) => h(React.Fragment, {key:label}, h('dt', null, label), h('dd', null, value)))),
    h('p', null, 'Token totals cover all generation calls in this request. Prompt cache measures runtime prompt/KV reuse across those calls, not a cached answer. Missing runtime cache data is unavailable. Overall model throughput uses full model-call wall time, including waits; it is not decoder speed.'))
}
