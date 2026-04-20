import Link from 'next/link'
import styles from '@/styles/SiteShell.module.css'

export default function SiteShell({ children, theme = 'dark', toggleTheme, currentPath = '/' }) {
  const isActive = (path) => currentPath === path

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          Tom Vellavoor Saji
        </Link>
        <nav className={styles.nav}>
          <Link href="/" className={isActive('/') ? styles.active : ''}>
            Home
          </Link>
          <Link href="/blogs" className={currentPath.startsWith('/blogs') ? styles.active : ''}>
            Writing
          </Link>
          <Link href="/about" className={isActive('/about') ? styles.active : ''}>
            About
          </Link>
          <button type="button" onClick={toggleTheme} className={styles.themeToggle}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </nav>
      </header>
      {children}

      <footer className={styles.footer}>
        <nav className={styles.footerNav} aria-label="Footer navigation">
          <Link href="/">Home</Link>
          <Link href="/blogs">Writing</Link>
          <Link href="/about">About</Link>
        </nav>
        <p className={styles.footerCopy}>© {new Date().getFullYear()} Tom Vellavoor Saji</p>
      </footer>
    </div>
  )
}
