import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'http://localhost:8001', changeOrigin: true, rewrite: (p) => p.replace('/api', '') },
      '/trpc': { target: 'http://localhost:8001', changeOrigin: true },
      '/shell': { target: 'http://localhost:8001', changeOrigin: true },
      '/file': {
        target: 'http://localhost:8003',
        changeOrigin: true,
        rewrite: (p) => p.replace('/file', ''),
      },
    },
  },
  build: {
    target: 'esnext',
  },
})
