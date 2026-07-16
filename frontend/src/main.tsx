import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/lib/i18n'
import { useSettingsStore } from '@/stores/settings'
import ThemeProvider from '@/components/ThemeProvider'
import App from './App'
import './index.css'

const queryClient = new QueryClient()

function I18nSync({ children }: { children: React.ReactNode }) {
  const language = useSettingsStore((s) => s.language)

  useEffect(() => {
    if (language && language !== i18n.language) {
      i18n.changeLanguage(language)
    }
  }, [language])

  return children
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <I18nSync>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </I18nSync>
      </QueryClientProvider>
    </I18nextProvider>
  </React.StrictMode>,
)
