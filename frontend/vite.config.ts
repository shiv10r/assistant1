import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
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
      injectManifest: {
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
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
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./tests/railway/setup.ts'],
  },
})
