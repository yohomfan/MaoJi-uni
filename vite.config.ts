import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni()
  ],
  server: {
    port: 5173,
    host: '0.0.0.0'
  },
  build: {
    // Increase chunk size warning limit for mini program
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      output: {
        // Manual chunks for better code splitting
        manualChunks: {
          'uview-plus': ['uview-plus'],
          'pinia': ['pinia']
        }
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/uni.scss";'
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
