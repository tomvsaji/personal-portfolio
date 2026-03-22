import { useEffect, useState } from 'react'
import '@/styles/globals.css'

export default function App({ Component, pageProps }) {
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('theme')
    const preferredTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
    setTheme(savedTheme || preferredTheme)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.body.dataset.theme = theme
    window.localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  return <Component {...pageProps} theme={theme} toggleTheme={toggleTheme} />
}
