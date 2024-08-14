import { defineConfig } from 'vite'
import nightwatch from 'vite-plugin-nightwatch'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '',
  plugins: [react(), nightwatch],
  test: {
    setupFiles: ['./app/setup.ts'],
    environment: "jsdom",
  },
  server: {
    host: true,
    port: 5173,
  },
})
