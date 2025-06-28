import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@entities': resolve(__dirname, 'src/entities'),
      '@features': resolve(__dirname, 'src/features'),
      '@widgets': resolve(__dirname, 'src/widgets'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@app': resolve(__dirname, 'src/app')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3003',
        changeOrigin: true
      }
    }
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue','pinia'],
          d3: ['d3'],
          gsap: ['gsap']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['vue','pinia', 'd3', 'gsap']
  },
  define: {
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false
  }
}) 