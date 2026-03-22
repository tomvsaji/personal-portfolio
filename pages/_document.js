import { Html, Head, Main, NextScript } from 'next/document'

const themeScript = `
(function () {
  try {
    var savedTheme = window.localStorage.getItem('theme');
    var preferredTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    var theme = savedTheme || preferredTheme;
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
  } catch (error) {
    document.documentElement.dataset.theme = 'dark';
  }
})();
`

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
