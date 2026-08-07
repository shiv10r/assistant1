export type Theme = 'dark' | 'light'

const KEY = 'lux_theme'

export function getTheme(): Theme {
  return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark'
}

export function applyTheme(t: Theme) {
  document.documentElement.dataset.theme = t
  localStorage.setItem(KEY, t)
}

export function initTheme(): Theme {
  const t = getTheme()
  document.documentElement.dataset.theme = t
  return t
}
