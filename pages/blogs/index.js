import Head from 'next/head'
import Link from 'next/link'
import styles from '@/styles/Home.module.css'
import { getAllBlogPosts } from '@/lib/blog'

export default function BlogIndexPage({ posts }) {
  return (
    <>
      <Head>
        <title>Blog | Tom Vellavoor Saji</title>
        <meta
          name="description"
          content="Articles on AI engineering, agentic systems, and production-grade LLM platforms."
        />
      </Head>

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.kicker}>Writing</p>
          <h1>Blog</h1>
          <p>Posts are loaded from <code>content/blog/*.mdx</code> and prerendered at build time.</p>
          <div className={styles.actions}>
            <Link href="/">Back to home</Link>
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
