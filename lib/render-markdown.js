const HTML_ESCAPE_LOOKUP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => HTML_ESCAPE_LOOKUP[character])
}

function renderInlineMarkdown(value) {
  const escaped = escapeHtml(value)

  return escaped
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
}

export function renderMarkdown(content) {
  const lines = content.split(/\r?\n/)
  const blocks = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index].trimEnd()
    const trimmedLine = line.trim()

    if (!trimmedLine) {
      index += 1
      continue
    }

    if (/^---+$/.test(trimmedLine)) {
      blocks.push('<hr />')
      index += 1
      continue
    }

    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/)

    if (headingMatch) {
      const level = headingMatch[1].length
      blocks.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`)
      index += 1
      continue
    }

    if (/^[-*]\s+/.test(trimmedLine)) {
      const items = []

      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(`<li>${renderInlineMarkdown(lines[index].trim().replace(/^[-*]\s+/, ''))}</li>`)
        index += 1
      }

      blocks.push(`<ul>${items.join('')}</ul>`)
      continue
    }

    if (/^>\s+/.test(trimmedLine)) {
      const quotes = []

      while (index < lines.length && /^>\s+/.test(lines[index].trim())) {
        quotes.push(renderInlineMarkdown(lines[index].trim().replace(/^>\s+/, '')))
        index += 1
      }

      blocks.push(`<blockquote><p>${quotes.join('<br />')}</p></blockquote>`)
      continue
    }

    const paragraphLines = []

    while (index < lines.length) {
      const paragraphLine = lines[index].trim()

      if (!paragraphLine || /^#{1,6}\s+/.test(paragraphLine) || /^[-*]\s+/.test(paragraphLine) || /^---+$/.test(paragraphLine) || /^>\s+/.test(paragraphLine)) {
        break
      }

      paragraphLines.push(paragraphLine)
      index += 1
    }

    blocks.push(`<p>${renderInlineMarkdown(paragraphLines.join(' '))}</p>`)
  }

  return blocks.join('\n')
}
