// Service worker that receives Firebase Cloud Messaging background pushes.
// Fetches the public Firebase config from the same origin so it works without build-time values.
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

async function init() {
  const params = new URL(self.location.href).searchParams
  const apiBase = (params.get('api') || '').replace(/\/$/, '')
  const res = await fetch(apiBase ? apiBase + '/api/firebase/config' : '/api/firebase/config')
  const cfg = await res.json()
  if (!cfg.enabled) return
  firebase.initializeApp({
    apiKey: cfg.apiKey,
    authDomain: cfg.authDomain,
    projectId: cfg.projectId,
    messagingSenderId: cfg.messagingSenderId,
    appId: cfg.appId,
  })
  const messaging = firebase.messaging()

  self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    const url = event.notification.data?.url || '/'
    event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) { client.navigate(url); return client.focus() }
      }
      return clients.openWindow(url)
    }))
  })

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || 'VSR Systems'
    self.registration.showNotification(title, {
      body: payload.notification?.body || '',
      icon: '/favicon.svg',
      badge: '/icons.svg',
      data: { url: payload.fcmOptions?.link || '/' },
    })
  })
}

self.addEventListener('install', (e) => e.waitUntil(init()))
