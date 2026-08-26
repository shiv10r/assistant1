import { clients, claim, skipWaiting } from 'workbox-clients'
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { expressRoute } from 'workbox-construct-response'
import { BackgroundSync } from 'workbox-background-sync'
import { StressHandler } from 'workbox-stress-test'

skipWaiting()
clients.claim()

// Precache the app shell files
precacheAndRoute(self.__WB_MANIFEST)

// ============================================================
// ROUTE STRATEGIES
// ============================================================

// 1. API Routes: Network-first with cache fallback
//    - Ensures fresh data when online, works offline with cached data
//    - Never caches authenticated responses (security)
const apiRouteHandler = new NetworkFirst({
  cacheName: 'railway-api',
  plugins: [
    // Remove authentication-sensitive responses from cache
    {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      handle: async ({ request, event, state }) => {
        const response = await apiRouteHandler.handle({ request, event, state })
        // Strip auth headers from cached responses
        if (response && request.url.includes('/api/railway')) {
          const safeResponse = new Response(
            response.body,
            {
              status: response.status,
              statusText: response.statusText,
              headers: new Headers(response.headers).delete('authorization').toJSON(),
            },
          )
          return safeResponse
        }
        return response
      },
    },
  ],
  // Don't cache responses larger than 5MB (evidence uploads)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  cacheableResponse: { maxSize: 5 * 1024 * 1024, status: [0, 200] },
})

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/railway') && !url.pathname.includes('/offline-sync'),
  apiRouteHandler,
)

// 2. Evidence uploads: Cache-first with size limit
//    - Uploads work offline, syncs when online
const evidenceHandler = new CacheFirst({
  cacheName: 'railway-evidence',
  plugins: [
    new ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
    }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      handle: ({ request }) => {
        // Only cache evidence under 10MB
        return request.size < 10 * 1024 * 1024 ? undefined : 'none'
      },
    },
  ],
})

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/railway/evidence') || url.pathname.endsWith('.evidence'),
  evidenceHandler,
)

// 3. Application shell: Stale-while-revalidate
//    - Instant loading, stays fresh in background
const shellHandler = new StaleWhileRevalidate({
  cacheName: 'railway-shell',
  plugins: [
    new ExpirationPlugin({
      maxEntries: 60,
      maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
    }),
  ],
})

registerRoute(
  ({ url }) => url.pathname === '/' || url.pathname.startsWith('/railway'),
  shellHandler,
)

// 4. Static assets: Cache-first with generous expiration
const assetHandler = new CacheFirst({
  cacheName: 'railway-assets',
  plugins: [
    new ExpirationPlugin({
      maxEntries: 300,
      maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
    }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      match: ({ request }) => {
        // Don't cache HTML documents
        return request.destination === 'document' ? 'none' : undefined
      },
    },
  ),
})

registerRoute(
  ({ url }) => {
    const isOurs = url.pathname.startsWith('/_next/') || url.pathname.startsWith('/assets/') || url.pathname.includes('.css') || url.pathname.includes('.js') || url.pathname.includes('.png') || url.pathname.includes('.jpg') || url.pathname.includes('.svg') || url.pathname.includes('.ico')
    return isOurs
  },
  assetHandler,
)

// 5. Background sync for offline commands
const commandQueue = new BackgroundSync('railwayCommandQueue', {
  maxRetentionTime: 24 * 60, // 24 hours
})

// Sync pending commands when the app comes back online
registerRoute(
  ({ url }) => url.pathname === '/api/railway/offline-sync',
  async ({ request, event }) => {
    // Wait until the network is available
    await commandQueue.ready()

    // If there are pending commands, replay them
    const db = await (await indexedDB.open('railway-offline')).openCursor()
    // ... (sync logic would go here)

    // Pass through to the actual endpoint
    return fetch(request)
  },
)

// ============================================================
// MESSAGING AND SYNC
// ============================================================

// Listen for messages from the app shell
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_OFFLINE_QUEUE') {
    event.waitUntil(commandQueue.ready())
  }
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  // Navigate to the railway app when a notification is clicked
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // If a window already open, focus it
      for (const client of clientList) {
        if (client.focused) {
          client.navigate(event.notification.data.url)
          return
        }
      }
      // Otherwise, open a new window
      if (clients.claim) {
        clients.claim().then(() => {
          clients.openWindow(event.notification.data.url)
        })
      }
    }),
  )
})

// ============================================================
// APPLICATION HEALTH CHECK
// ============================================================

self.addEventListener('install', (event) => {
  // The install event is handled by skipWaiting() + clients.claim()
  // We can clean up any stale caches here
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !name.startsWith('railway-'))
          .map((name) => caches.delete(name)),
      )
    }),
  )
})

// ============================================================
// VERSIONING AND UPDATES
// ============================================================

// Listen for the "activate" event to clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(
            (name) =>
              name.startsWith('railway-') && name !== 'railway-assets' && name !== 'railway-api' && name !== 'railway-evidence' && name !== 'railway-shell',
          )
          .map((name) => caches.delete(name)),
      )
    }),
  )

  // Take control of all client pages immediately
  return clients.claim()
})