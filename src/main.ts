import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import uviewPlus from 'uview-plus'

export function createApp() {
  const app = createSSRApp(App)

  // Register Pinia
  const pinia = createPinia()
  app.use(pinia)

  // Register uView Plus UI library
  app.use(uviewPlus)

  return {
    app
  }
}
