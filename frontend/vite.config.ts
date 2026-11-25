import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'HidroCalc: dimensionamento de bombas',
        short_name: 'HidroCalc',
        description: "Calcule a bomba d'água certa para o seu sítio. Funciona sem internet.",
        lang: 'pt-BR',
        theme_color: '#1f6b3a',
        background_color: '#f1f4ec',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // Tudo o que o app precisa fica guardado no aparelho na primeira visita.
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        navigateFallbackDenylist: [/^\/api\//]
      }
    })
  ],
  server: {
    // Em desenvolvimento, /api vai para o backend local (cd backend && npm run dev).
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
