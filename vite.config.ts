import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  publicDir: 'docs/design',
  base: process.env.GITHUB_PAGES === 'true' ? '/ima-doko-game/' : '/',
  test: {
    environment: 'node',
  },
})
