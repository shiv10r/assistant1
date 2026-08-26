import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import vitePwa from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    vitePwa({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'VSR Railway',
        short_name: 'VSR Rail',
        description:
          'VSR Railway Top Three Modules: Track & Asset Inspection, Station Crowd Management, Maintenance & Work Orders',
        theme_color: '#0d3440',
        background_color: '#071b24',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/railway',
        icons: [
          {
            src: '/pwa/railway-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa/railway-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa/railway-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workboxOptions: {
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*railway.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'railway-api',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheLife: { maxAgeSeconds: 60 * 60 * 24 * 30 },
              networkTimeout: { sec: 5 },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|svg|js|css|json)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'railway-assets',
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
      },
    },
  },
})