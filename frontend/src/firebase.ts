import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, type Auth } from 'firebase/auth'
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging'
import { getAnalytics, isSupported as analyticsSupported, logEvent, type Analytics } from 'firebase/analytics'
import { getPerformance, type FirebasePerformance } from 'firebase/performance'
import { api, BASE, type FirebaseWebConfig } from './api'

let cached: { config: FirebaseWebConfig; app: FirebaseApp | null; auth: Auth | null; messaging: Messaging | null; analytics: Analytics | null; perf: FirebasePerformance | null } | null = null

async function load(): Promise<NonNullable<typeof cached>> {
  if (cached) return cached
  const config = await api.firebaseConfig()
  cached = { config, app: null, auth: null, messaging: null, analytics: null, perf: null }
  if (!config.enabled || !config.apiKey) return cached

  const app = getApps().length ? getApps()[0] : initializeApp({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
    measurementId: config.measurementId || undefined,
  })
  cached.app = app
  cached.auth = getAuth(app)
  if (config.measurementId && (await analyticsSupported().catch(() => false))) {
    try {
      cached.analytics = getAnalytics(app)
      cached.perf = getPerformance(app)
    } catch {
      /* analytics/performance blocked or unsupported — ignore */
    }
  }
  return cached
}

export const firebaseEnabled = async () => (await load()).config.enabled

export async function logPageView(path: string): Promise<void> {
  const { analytics } = await load()
  if (!analytics) return
  try {
    logEvent(analytics, 'page_view', { page_path: path, page_location: window.location.href })
  } catch {
    /* ignore */
  }
}

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

/** Registers (or reuses) the FCM service worker and returns it once active. */
export async function ensureServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null
  try {
    const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js?api=' + encodeURIComponent(BASE))
    await navigator.serviceWorker.ready
    await reg.update()
    return reg
  } catch (e) {
    console.error('FCM SW registration failed:', e)
    return null
  }
}

/** Subscribes this browser to push notifications. Returns { token } or { error }. */
export async function subscribePush(): Promise<{ token: string | null; error?: string }> {
  const { config, app } = await load()
  if (!app || !config.messagingSenderId || !config.vapidKey) {
    return { token: null, error: `Push config incomplete (messagingSenderId=${!!config.messagingSenderId}, vapidKey=${!!config.vapidKey})` }
  }
  try {
    const messaging = getMessaging(app)
    const reg = await ensureServiceWorker()
    const token = await getToken(messaging, {
      vapidKey: config.vapidKey,
      serviceWorkerRegistration: reg ?? undefined,
    })
    return { token: token || null }
  } catch (e) {
    return { token: null, error: e instanceof Error ? e.message : String(e) }
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