import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
/// <reference types="vitest" />

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Загружаем переменные окружения для текущего режима (development/production)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@shared': resolve(__dirname, 'src/shared'),
        '@app': resolve(__dirname, 'src/app'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@ui': resolve(__dirname, 'src/ui')
      }
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL, // Используем переменную окружения
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
    },
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: ['./src/test/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.spec.ts',
          '**/*.test.ts',
          '**/*.d.ts',
          'dist/',
          'server/'
        ],
        thresholds: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      },
      include: ['src/**/*.{test,spec}.{js,ts,vue}'],
      exclude: ['node_modules', 'dist', 'server']
    }
  }
}) 