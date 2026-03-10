import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import postcssOklabFunction from '@csstools/postcss-oklab-function'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Transpila ?. ?? async/await a código compatible con Chrome 61+
    // (Yoga Tab 3 con Android 5.1 puede tener Chrome 61-79 sin soporte para optional chaining)
    target: 'chrome61',
  },
  css: {
    postcss: {
      plugins: [
        // Convierte oklch() → rgb() para compatibilidad con browsers antiguos
        // (Android 5.1 / Chrome < 111 no soporta oklch, Tailwind v4 lo usa por defecto)
        postcssOklabFunction({ subFeatures: { displayP3: false } })
      ]
    }
  }
})
