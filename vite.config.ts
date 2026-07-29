import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  base: process.env.GITHUB_PAGES === 'true' ? '/ima-doko-game/' : '/',
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        lp: fileURLToPath(new URL('./lp/index.html', import.meta.url)),
      },
    },
  },
  test: {
    environment: 'node',
  },
})
