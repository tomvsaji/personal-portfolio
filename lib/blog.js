import fs from 'node:fs'
import path from 'node:path'

const BLOG_DIRECTORY = path.join(process.cwd(), 'content', 'blog')

function parseFrontmatter(fileContents) {
  if (!fileContents.startsWith('---')) {
    return { metadata: {}, content: fileContents.trim() }
  }

  const endOfFrontmatter = fileContents.indexOf('\n---', 3)

  if (endOfFrontmatter === -1) {
    return { metadata: {}, content: fileContents.trim() }
  }

  const rawFrontmatter = fileContents.slice(3, endOfFrontmatter).trim()
  const content = fileContents.slice(endOfFrontmatter + 4).trim()
  const metadata = {}

  for (const line of rawFrontmatter.split('\n')) {
    const separatorIndex = line.indexOf(':')

    if (separatorIndex === -1) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    const rawValue = line.slice(separatorIndex + 1).trim()
    metadata[key] = rawValue.replace(/^['\"]|['\"]$/g, '')
  }

  return { metadata, content }
}

export function getBlogSlugs() {
  if (!fs.existsSync(BLOG_DIRECTORY)) {
    return []
  }

  return fs
    .readdirSync(BLOG_DIRECTORY)
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => fileName.replace(/\.mdx$/, ''))
    .sort((left, right) => right.localeCompare(left))
}

export function getBlogPost(slug) {
  const fullPath = path.join(BLOG_DIRECTORY, `${slug}.mdx`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { metadata, content } = parseFrontmatter(fileContents)

  return {
    slug,
    title: metadata.title ?? slug,
    description: metadata.description ?? '',
    publishedAt: metadata.publishedAt ?? '',
    readingTime: metadata.readingTime ?? '',
    content,
  }
}

export function getAllBlogPosts() {
  return getBlogSlugs().map((slug) => getBlogPost(slug))
}
