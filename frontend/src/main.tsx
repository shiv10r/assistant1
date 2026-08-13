import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initTheme, initWeatherTheme } from './theme'
import { ToastProvider } from './components/ui/Toast'
import './index.css'
import App from './App.tsx'

initTheme()
initWeatherTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
)
