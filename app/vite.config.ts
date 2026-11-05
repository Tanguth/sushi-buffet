import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: { globPatterns: ['**/*.{js,css,html,svg,webp}'] },
      manifest: {
        name: 'BotC Pick & Ban',
        short_name: 'BotC Draft',
        display: 'standalone',
        orientation: 'any',
        background_color: '#14121a',
        theme_color: '#14121a',
        icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
      },
    }),
  ],
})
