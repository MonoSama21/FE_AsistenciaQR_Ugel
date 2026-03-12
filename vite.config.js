import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import postcssOklabFunction from '@csstools/postcss-oklab-function'
import { babel } from '@rollup/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Transpila ?. ?? async/await a código compatible con Chrome 49+ (Android 5)
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      ecma: 5,
      compress: {
        ecma: 5,
        arrows: false,
        collapse_vars: false,
        comparisons: false,
        computed_props: false,
        hoist_funs: false,
        hoist_props: false,
        hoist_vars: false,
        inline: false,
        loops: false,
        negate_iife: false,
        properties: false,
        reduce_funcs: false,
        reduce_vars: false,
        switches: false,
        toplevel: false,
        typeofs: false,
        booleans: true,
        if_return: true,
        sequences: true,
        unused: true,
        conditionals: true,
        dead_code: true,
        evaluate: true
      },
      mangle: {
        safari10: true
      },
      format: {
        ecma: 5,
        safari10: true
      }
    },
    rollupOptions: {
      plugins: [
        babel({
          babelHelpers: 'bundled',
          exclude: /node_modules\/(?!(jspdf|html2canvas|html5-qrcode)\/)/,
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          presets: [
            ['@babel/preset-env', {
              targets: {
                chrome: '49',
                android: '5'
              },
              modules: false,
              bugfixes: true,
              loose: true
            }]
          ]
        })
      ]
    }
  },
  css: {
    postcss: {
      plugins: [
        // Convierte oklch() → rgb() para compatibilidad con browsers antiguos
        // (Android 5.1 / Chrome < 111 no soporta oklch, Tailwind v4 lo usa por defecto)
        postcssOklabFunction({ subFeatures: { displayP3: false } })
      ]
    }
  },
  esbuild: {
    target: 'es2015'
  }
})
