export const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ??
  (import.meta.env.PROD ? 'https://vsrsystemsbackend-1.onrender.com' : '')
