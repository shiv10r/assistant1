export type Edition = 'standard' | 'gold'

export type UserProfile = {
  displayName: string
  email: string
  phone: string
  jobTitle: string
  avatar: string
}

const EDITION_KEY = 'vsr_edition'
const PROFILE_EVENT = 'vsr-profile-change'

function profileKey(username: string): string {
  return `vsr_profile_${encodeURIComponent(username || 'user')}`
}

export function getEdition(): Edition {
  return localStorage.getItem(EDITION_KEY) === 'gold' ? 'gold' : 'standard'
}

export function applyEdition(edition: Edition): void {
  document.documentElement.dataset.edition = edition
}

export function initEdition(): Edition {
  const edition = getEdition()
  applyEdition(edition)
  return edition
}

export function setEdition(edition: Edition): void {
  localStorage.setItem(EDITION_KEY, edition)
  applyEdition(edition)

  const accent = edition === 'gold' ? 'amber' : 'cobalt'
  localStorage.setItem('lux_ui_accent', accent)
  document.documentElement.dataset.accent = accent
}

export function getUserProfile(username: string): UserProfile {
  try {
    const stored = JSON.parse(localStorage.getItem(profileKey(username)) || '{}') as Partial<UserProfile>
    return {
      displayName: stored.displayName || username,
      email: stored.email || '',
      phone: stored.phone || '',
      jobTitle: stored.jobTitle || '',
      avatar: stored.avatar || '',
    }
  } catch {
    return { displayName: username, email: '', phone: '', jobTitle: '', avatar: '' }
  }
}

export function saveUserProfile(username: string, profile: UserProfile): void {
  localStorage.setItem(profileKey(username), JSON.stringify(profile))
  window.dispatchEvent(new CustomEvent(PROFILE_EVENT, { detail: { username } }))
}

export function onUserProfileChange(listener: () => void): () => void {
  window.addEventListener(PROFILE_EVENT, listener)
  return () => window.removeEventListener(PROFILE_EVENT, listener)
}
