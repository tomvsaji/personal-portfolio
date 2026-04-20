import Head from 'next/head'
import Link from 'next/link'
import styles from '@/styles/BlogPost.module.css'
import { getBlogPost, getBlogSlugs } from '@/lib/blog'
import { renderMarkdown, extractHeadings } from '@/lib/render-markdown'
import SiteShell from '@/components/site-shell'

export default function BlogPostPage({ post, renderedContent, headings, theme, toggleTheme }) {
  return (
    <>
      <Head>
        <title>{`${post.title} | Tom Vellavoor Saji`}</title>
        <meta name="description" content={post.description} />
        <meta property="og:title" content={`${post.title} | Tom Vellavoor Saji`} />
        <meta property="og:description" content={post.description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://tomvsaji.com/blogs/${post.slug}`} />
        <meta property="article:published_time" content={post.publishedAt} />
      </Head>

      <main className={styles.page}>
        <SiteShell theme={theme} toggleTheme={toggleTheme} currentPath="/blogs">
          <article className={styles.article}>
            <div className={styles.topBar}>
              <Link href="/blogs" className={styles.backLink}>
                ← Back to writing
              </Link>
              <span className={styles.meta}>
                {post.publishedAt} {post.readingTime ? `· ${post.readingTime}` : ''}
              </span>
            </div>

            <header className={styles.hero}>
              <p className={styles.eyebrow}>Blog Post</p>
              <h1>{post.title}</h1>
              {post.description ? <p className={styles.lead}>{post.description}</p> : null}
            </header>

            {headings.length > 2 && (
              <nav className={styles.toc} aria-label="Table of contents">
                <p className={styles.tocLabel}>Contents</p>
                <ol className={styles.tocList}>
                  {headings.map((h) => (
                    <li key={h.id} className={h.level === 3 ? styles.tocNested : undefined}>
                      <a href={`#${h.id}`}>{h.text}</a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            <section
              className={styles.markdownContent}
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />
          </article>
        </SiteShell>
      </main>
    </>
  )
}

export function getStaticPaths() {
  return {
    paths: getBlogSlugs().map((slug) => ({ params: { slug } })),
    fallback: false,
  }
}

export function getStaticProps({ params }) {
  const post = getBlogPost(params.slug)

  return {
    props: {
      post,
      renderedContent: renderMarkdown(post.content),
      headings: extractHeadings(post.content),
    },
  }
}
