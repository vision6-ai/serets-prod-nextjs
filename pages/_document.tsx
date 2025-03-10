import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  function getThemePreference() {
                    if (typeof localStorage !== 'undefined' && localStorage.getItem('serets-theme')) {
                      const storedPrefs = localStorage.getItem('serets-theme');
                      try {
                        return JSON.parse(storedPrefs || '"system"');
                      } catch (e) {
                        console.error('Error parsing theme preference:', e);
                      }
                    }
                    
                    // Check system preference as fallback
                    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                      return 'dark';
                    }
                    
                    return 'light';
                  }

                  const theme = getThemePreference();
                  const isDark = theme === 'dark' || 
                    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  
                  document.documentElement.classList.add(isDark ? 'dark' : 'light');
                } catch (e) {
                  // Fallback to light theme if something went wrong
                  console.error('Error setting initial theme:', e);
                  document.documentElement.classList.add('light');
                }
              })();
            `,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}