// test commit: verifying push workflow
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initAccent, initTheme, initWeatherTheme } from './theme'
import { ToastProvider } from './platform/ui/ToastProvider'
import './index.css'
import App from './App.tsx'

initTheme()
initWeatherTheme()
initAccent()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
)
