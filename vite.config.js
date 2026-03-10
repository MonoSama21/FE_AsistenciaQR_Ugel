import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import postcssOklabFunction from '@csstools/postcss-oklab-function'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
