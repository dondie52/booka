import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sitemapPlugin } from './plugins/vite-plugin-sitemap.js'

export default defineConfig({
  plugins: [react(), sitemapPlugin()],
  base: '/',
})
