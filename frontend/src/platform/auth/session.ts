const TOKEN_KEY = 'lux_token'
const ROLE_KEY = 'lux_role'
const USER_KEY = 'lux_user'
const EMAIL_KEY = 'lux_email'

export type AuthSession = {
  token: string
  username: string
  role: string
}

export function getToken(): string | null { return localStorage.getItem(TOKEN_KEY) }
export function getRole(): string { return localStorage.getItem(ROLE_KEY) || 'admin' }
export function getUsername(): string { return localStorage.getItem(USER_KEY) || '' }
export function getEmail(): string { return localStorage.getItem(EMAIL_KEY) || '' }
export function isAuthed(): boolean { return !!getToken() }
export function isAdmin(): boolean { return getRole() === 'admin' }

export function storeAuthSession(session: AuthSession, email = ''): void {
  localStorage.setItem(TOKEN_KEY, session.token)
  localStorage.setItem(ROLE_KEY, session.role)
  localStorage.setItem(USER_KEY, session.username)
  if (email) localStorage.setItem(EMAIL_KEY, email)
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  window.dispatchEvent(new Event('vsr:session-cleared'))
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ROLE_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(EMAIL_KEY)
  window.dispatchEvent(new Event('vsr:session-cleared'))
}
