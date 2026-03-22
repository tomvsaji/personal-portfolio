import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import SiteShell from '@/components/site-shell'
import { expertiseGroups, featuredProjects, profile, sideProjects } from '@/lib/site-data'

export default function AboutPage({ theme, toggleTheme }) {
  return (
    <>
      <Head>
        <title>About | Tom Vellavoor Saji</title>
        <meta
          name="description"
          content="Background, expertise, project highlights, and contact details for Tom Vellavoor Saji."
        />
      </Head>

      <main className={styles.page}>
        <SiteShell theme={theme} toggleTheme={toggleTheme} currentPath="/about">
          <section className={styles.hero}>
            <div className={styles.heroCopy}>
              <p className={styles.kicker}>About</p>
              <h1>{profile.name}</h1>
              <h2>{profile.headline}</h2>
              <p>{profile.summary}</p>
              <p className={styles.heroHighlights}>{profile.highlights}</p>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionKicker}>Expertise</p>
                <h3>Platforms, systems, and tools</h3>
              </div>
            </div>
            <div className={styles.grid}>
              {expertiseGroups.map((group) => (
                <article key={group.title} className={styles.card}>
                  <h4>{group.title}</h4>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionKicker}>Selected work</p>
                <h3>Production systems</h3>
              </div>
            </div>
            <div className={styles.projectList}>
              {featuredProjects.map((project) => (
                <article key={project.title} className={styles.projectCard}>
                  <h4>{project.title}</h4>
                  <ul>
                    {project.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  <p className={styles.architectureLabel}>Architecture</p>
                  <p className={styles.architecture}>{project.architecture}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.grid}>
              <article className={styles.card}>
                <p className={styles.sectionKicker}>Side projects</p>
                <h4>Independent builds</h4>
                <ul>
                  {sideProjects.map((project) => (
                    <li key={project.title}>{project.title}</li>
                  ))}
                </ul>
              </article>
              <article className={styles.card}>
                <p className={styles.sectionKicker}>Credentials</p>
                <h4>Certifications & education</h4>
                <ul>
                  <li>Microsoft Certified: Azure AI Engineer Associate</li>
                  <li>Microsoft Certified: Azure Developer Associate</li>
                  <li>B.E Electrical &amp; Electronics Engineering — Anna University (2020)</li>
                </ul>
              </article>
              <article className={styles.card}>
                <p className={styles.sectionKicker}>Contact</p>
                <h4>Reach out</h4>
                <div className={styles.contactList}>
                  <p>Email: <a href={`mailto:${profile.email}`}>{profile.email}</a></p>
                  <p>Phone: <a href={`tel:${profile.phone.replace(/\s+/g, '')}`}>{profile.phone}</a></p>
                  <p>LinkedIn: <a href={profile.linkedin} target="_blank" rel="noreferrer">{profile.linkedin.replace('https://', '')}</a></p>
                  <p>GitHub: <a href={profile.github} target="_blank" rel="noreferrer">{profile.github.replace('https://', '')}</a></p>
                </div>
              </article>
            </div>
          </section>
        </SiteShell>
      </main>
    </>
  )
}
