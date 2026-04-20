function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function extractHeadings(content) {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim().match(/^(#{1,3})\s+(.+)$/))
    .filter(Boolean)
    .map((match) => ({
      level: match[1].length,
      text: match[2],
      id: slugify(match[2]),
    }))
}

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

    const codeFenceMatch = trimmedLine.match(/^```([\w-]+)?$/)

    if (codeFenceMatch) {
      const language = codeFenceMatch[1]
      index += 1
      const codeLines = []

      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        codeLines.push(lines[index])
        index += 1
      }

      if (index < lines.length && lines[index].trim().startsWith('```')) {
        index += 1
      }

      const languageClass = language ? ` class="language-${language}"` : ''
      blocks.push(`<pre><code${languageClass}>${escapeHtml(codeLines.join('\n'))}</code></pre>`)
      continue
    }

    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/)

    if (headingMatch) {
      const level = headingMatch[1].length
      const text = headingMatch[2]
      const id = slugify(text)
      blocks.push(`<h${level} id="${id}">${renderInlineMarkdown(text)}</h${level}>`)
      index += 1
      continue
    }

    const detailsMatch = trimmedLine.match(/^:::details\s+(.+)$/)

    if (detailsMatch) {
      index += 1
      const detailsLines = []

      while (index < lines.length && lines[index].trim() !== ':::') {
        detailsLines.push(lines[index])
        index += 1
      }

      if (index < lines.length && lines[index].trim() === ':::') {
        index += 1
      }

      blocks.push(
        `<details><summary>${renderInlineMarkdown(detailsMatch[1])}</summary>${renderMarkdown(
          detailsLines.join('\n')
        )}</details>`
      )
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

    if (trimmedLine.startsWith('<table')) {
      const htmlLines = [line]
      index += 1

      while (index < lines.length && !lines[index].trim().startsWith('</table>')) {
        htmlLines.push(lines[index])
        index += 1
      }

      if (index < lines.length) {
        htmlLines.push(lines[index])
        index += 1
      }

      blocks.push(htmlLines.join('\n'))
      continue
    }

    const isTableRow = (value) => /^\|.*\|$/.test(value.trim())
    const isTableDivider = (value) =>
      /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(value.trim())

    if (
      index + 1 < lines.length &&
      isTableRow(lines[index]) &&
      isTableDivider(lines[index + 1])
    ) {
      const parseCells = (row) =>
        row
          .trim()
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map((cell) => cell.trim())

      const headerCells = parseCells(lines[index])
      index += 2

      const bodyRows = []
      while (index < lines.length && isTableRow(lines[index])) {
        bodyRows.push(parseCells(lines[index]))
        index += 1
      }

      const thead = `<thead><tr>${headerCells
        .map((cell) => `<th>${renderInlineMarkdown(cell)}</th>`)
        .join('')}</tr></thead>`

      const tbody = `<tbody>${bodyRows
        .map(
          (row) =>
            `<tr>${row.map((cell) => `<td>${renderInlineMarkdown(cell)}</td>`).join('')}</tr>`
        )
        .join('')}</tbody>`

      blocks.push(`<table>${thead}${tbody}</table>`)
      continue
    }

    const paragraphLines = []

    while (index < lines.length) {
      const paragraphLine = lines[index].trim()

      if (
        !paragraphLine ||
        /^#{1,6}\s+/.test(paragraphLine) ||
        /^[-*]\s+/.test(paragraphLine) ||
        /^---+$/.test(paragraphLine) ||
        /^>\s+/.test(paragraphLine) ||
        /^```/.test(paragraphLine)
      ) {
        break
      }

      paragraphLines.push(paragraphLine)
      index += 1
    }

    blocks.push(`<p>${renderInlineMarkdown(paragraphLines.join(' '))}</p>`)
  }

  return blocks.join('\n')
}
