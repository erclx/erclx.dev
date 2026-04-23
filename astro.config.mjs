// @ts-check
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

import react from '@astrojs/react'

export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
})
