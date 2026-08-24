// test commit: verifying push workflow
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initAccent, initTheme, initWeatherTheme } from './theme'
import { initEdition } from './platform/auth'
import { ToastProvider } from './platform/ui/ToastProvider'
import { RealtimeProvider } from './platform/realtime'
import './index.css'
import App from './App.tsx'

initTheme()
initWeatherTheme()
initEdition()
initAccent()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <RealtimeProvider><App /></RealtimeProvider>
    </ToastProvider>
  </StrictMode>,
)
