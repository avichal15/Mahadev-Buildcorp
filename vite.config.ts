import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set SINGLE_FILE=1 to bundle everything into one chunk, for producing a
// standalone preview HTML that runs from disk with no server. Normal builds
// keep the code-splitting that holds first paint to ~72 kB gzip.
const singleFile = !!process.env.SINGLE_FILE

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.PORT) || 5173,
  },
  build: singleFile
    ? {
        assetsInlineLimit: 100_000_000,
        cssCodeSplit: false,
        rollupOptions: { output: { inlineDynamicImports: true } },
      }
    : {},
})
