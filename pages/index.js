import Head from 'next/head'
import Link from 'next/link'
import styles from '@/styles/Home.module.css'
import { getAllBlogPosts } from '@/lib/blog'
import { profile, sideProjects } from '@/lib/site-data'
import SiteShell from '@/components/site-shell'
import SocialLinks from '@/components/social-links'

export default function Home({ posts, theme, toggleTheme }) {
  const [latestPost, ...morePosts] = posts
  const socialLinks = [
    { name: 'github', href: profile.github, title: 'GitHub' },
    { name: 'linkedin', href: profile.linkedin, title: 'LinkedIn' },
    { name: 'x', href: profile.x, title: 'X / Twitter' },
    { name: 'email', href: `mailto:${profile.email}`, title: 'Email' },
  ]

  return (
    <>
      <Head>
        <title>Tom Vellavoor Saji | AI Engineer</title>
        <meta
          name="description"
          content="AI engineer building agentic systems, Azure AI products, and production-ready LLM platforms."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.page}>
        <SiteShell theme={theme} toggleTheme={toggleTheme} currentPath="/">
          <section className={styles.hero}>
            <div className={styles.heroCopy}>
              <p className={styles.kicker}>{profile.role}</p>
              <h1>{profile.name}</h1>
              <h2>{profile.headline}</h2>
              <p>{profile.summary}</p>
              <p className={styles.heroHighlights}>{profile.highlights}</p>
              <div className={styles.actions}>
                <Link href="/about">More on the about page</Link>
                <Link href="/blogs">Browse all writing</Link>
              </div>
              <SocialLinks
                links={socialLinks}
                className={styles.socialLinks}
                iconClassName={styles.socialLinkIcon}
                label="Primary social links"
              />
            </div>
            <div className={styles.heroAside}>
              <p className={styles.asideLabel}>Latest writing</p>
              <ul className={styles.postList}>
                {posts.map((post) => (
                  <li key={post.slug}>
                    <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
                    <span>{post.publishedAt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {latestPost ? (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionKicker}>Featured</p>
                  <h3>Latest post</h3>
                </div>
                <Link href="/blogs">See all posts</Link>
              </div>
              <article className={styles.featuredCard}>
                <p className={styles.postLabel}>{latestPost.publishedAt}</p>
                <h4>{latestPost.title}</h4>
                <p>{latestPost.description}</p>
                <Link href={`/blogs/${latestPost.slug}`}>Read the full post</Link>
              </article>
            </section>
          ) : null}

          {morePosts.length ? (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionKicker}>Writing</p>
                  <h3>More posts</h3>
                </div>
              </div>
              <div className={styles.grid}>
                {morePosts.map((post) => (
                  <article key={post.slug} className={styles.card}>
                    <p className={styles.postLabel}>{post.publishedAt}</p>
                    <h4>{post.title}</h4>
                    <p>{post.description}</p>
                    <Link href={`/blogs/${post.slug}`}>Read post</Link>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionKicker}>Build</p>
                <h3>Side projects</h3>
              </div>
            </div>
            <div className={styles.grid}>
              {sideProjects.map((project) => (
                <article key={project.title} className={styles.card}>
                  <h4>{project.title}</h4>
                  <a href={project.href} target="_blank" rel="noreferrer">{project.label}</a>
                  <ul>
                    {project.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
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
      posts: getAllBlogPosts().slice(0, 4),
    },
  }
}
