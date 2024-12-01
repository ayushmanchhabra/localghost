import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '',
  plugins: [react()],
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['json', 'json-summary'],
      reportOnFailure: true,
    },
    environment: 'jsdom',
    setupFiles: ['./app/setup.ts']
  },
  server: {
    host: true,
    port: 5173,
  },
})
