import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, type Auth } from 'firebase/auth'
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging'
import { api, type FirebaseWebConfig } from './api'

let cached: { config: FirebaseWebConfig; app: FirebaseApp | null; auth: Auth | null; messaging: Messaging | null } | null = null

async function load(): Promise<NonNullable<typeof cached>> {
  if (cached) return cached
  const config = await api.firebaseConfig()
  cached = { config, app: null, auth: null, messaging: null }
  if (!config.enabled || !config.apiKey) return cached

  const app = getApps().length ? getApps()[0] : initializeApp({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
  })
  cached.app = app
  cached.auth = getAuth(app)
  return cached
}

export const firebaseEnabled = async () => (await load()).config.enabled

export async function signInWithGoogle(): Promise<{ idToken: string } | null> {
  const { auth } = await load()
  if (!auth) return null
  const cred = await signInWithPopup(auth, new GoogleAuthProvider())
  return { idToken: await cred.user.getIdToken() }
}

export async function signInWithEmail(email: string, password: string): Promise<{ idToken: string } | null> {
  const { auth } = await load()
  if (!auth) return null
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return { idToken: await cred.user.getIdToken() }
}

/** Subscribes this browser to push notifications and returns the FCM token. */
export async function subscribePush(): Promise<string | null> {
  const { config, app } = await load()
  if (!app || !config.messagingSenderId || !config.vapidKey) return null
  try {
    const messaging = getMessaging(app)
    const token = await getToken(messaging, { vapidKey: config.vapidKey })
    return token || null
  } catch {
    return null
  }
}

export async function onPushMessage(handler: (payload: { title?: string; body?: string }) => void): Promise<void> {
  const { config, app } = await load()
  if (!app || !config.messagingSenderId) return
  try {
    const messaging = getMessaging(app)
    onMessage(messaging, (payload) => {
      handler({ title: payload.notification?.title, body: payload.notification?.body })
    })
  } catch {
    /* ignore */
  }
}