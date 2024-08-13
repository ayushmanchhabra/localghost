import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '',
  plugins: [react()],
  test: {
    setupFiles: ['./app/setup.ts'],
    environment: "jsdom",
  },
  server: {
    host: true,
    port: 5173,
  },
})
