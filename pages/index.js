import Head from 'next/head'
import Image from 'next/image'
import styles from '@/styles/Home.module.css'
import Header from '@/components/header'
import Navbar from '@/components/navbar'
import Projects from '@/components/projects'
import Contact from '@/components/contact'
import Footer from '@/components/footer'

export default function Home() {
  return (
    <>
      <Head>
        <title>Tom V Saji | Software Engineer</title>
        <meta name="description" content="Hey, I am Tom, Web Developer, Designer and Content Creator. I love bringing cool designs to life and finding engineering solutions to porblems" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Fira+Sans&family=EB+Garamond&family=Fira+Sans+Condensed:wght@600&family=Open+Sans:wght@300;400;700&display=swap" rel="stylesheet" />
      </Head>
      <main className={styles.main}>
        <Navbar />
        <Header />
        <Projects />
        <Contact />
        <Footer />
      </main>
    </>
  )
}
