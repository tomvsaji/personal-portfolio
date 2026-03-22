import Head from 'next/head'
import Link from 'next/link'
import styles from '@/styles/Home.module.css'
import { getAllBlogPosts } from '@/lib/blog'
import SiteShell from '@/components/site-shell'

export default function BlogIndexPage({ posts, theme, toggleTheme }) {
  return (
    <>
      <Head>
        <title>Writing | Tom Vellavoor Saji</title>
        <meta
          name="description"
          content="Articles on AI engineering, agentic systems, and production-grade LLM platforms."
        />
      </Head>

      <main className={styles.page}>
        <SiteShell theme={theme} toggleTheme={toggleTheme} currentPath="/blogs">
          <section className={styles.hero}>
            <div className={styles.heroCopy}>
              <p className={styles.kicker}>Writing</p>
              <h1>Articles and notes</h1>
              <p>
                Posts are sourced from <code>content/blog/*.mdx</code> and prerendered at build time.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.grid}>
              {posts.map((post) => (
                <article key={post.slug} className={styles.card}>
                  <p className={styles.postLabel}>{post.publishedAt}</p>
                  <h2>{post.title}</h2>
                  <p>{post.description}</p>
                  <Link href={`/blogs/${post.slug}`}>Read post</Link>
                </article>
              ))}
            </div>
          </section>
        </SiteShell>
      </main>
    </>
  )
}

export function getStaticProps() {
  return {
    props: {
      posts: getAllBlogPosts(),
    },
  }
}
