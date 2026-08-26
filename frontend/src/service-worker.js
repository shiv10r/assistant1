import { API_BASE } from './platform/api/baseUrl'

const STATIC_CACHE = 'vsr-static-v1'
const PRECACHE_URLS = self.__WB_MANIFEST.map((entry) => typeof entry === 'string' ? entry : entry.url)

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((name) => name !== STATIC_CACHE).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/') || (API_BASE && url.origin === new URL(API_BASE).origin)) {
    return
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () =>
        (await caches.match(event.request)) ?? (await caches.match('/index.html')) ?? Response.error()),
    )
    return
  }

  if (url.origin === self.location.origin) {
    event.respondWith(caches.match(event.request).then((cached) => cached ?? fetch(event.request)))
  }
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clientList) => {
      const existing = clientList[0]
      if (existing) {
        await existing.navigate(targetUrl)
        return existing.focus()
      }
      return self.clients.openWindow(targetUrl)
    }),
  )
})

try {
  importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
  importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')
  fetch(`${API_BASE}/api/firebase/config`)
    .then((response) => response.json())
    .then((config) => {
      if (!config.enabled || self.firebase.apps.length) return
      self.firebase.initializeApp(config)
      self.firebase.messaging().onBackgroundMessage((payload) => {
        const title = payload.notification?.title || 'VSR Systems'
        return self.registration.showNotification(title, {
          body: payload.notification?.body || '',
          icon: '/pwa/railway-192.png',
          data: { url: payload.fcmOptions?.link || '/' },
        })
      })
    })
    .catch(() => undefined)
} catch {
  // Push initialization is optional; offline application behavior remains available.
}
