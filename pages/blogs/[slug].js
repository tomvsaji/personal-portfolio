import Head from 'next/head'
import Link from 'next/link'
import styles from '@/styles/BlogPost.module.css'
import { getBlogPost, getBlogSlugs } from '@/lib/blog'
import { renderMarkdown } from '@/lib/render-markdown'

export default function BlogPostPage({ post, renderedContent }) {
  return (
    <>
      <Head>
        <title>{`${post.title} | Tom Vellavoor Saji`}</title>
        <meta name="description" content={post.description} />
      </Head>

      <main className={styles.page}>
        <article className={styles.article}>
          <div className={styles.topBar}>
            <Link href="/" className={styles.backLink}>
              ← Back to portfolio
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

          <section
            className={styles.markdownContent}
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />
        </article>
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
    },
  }
}
