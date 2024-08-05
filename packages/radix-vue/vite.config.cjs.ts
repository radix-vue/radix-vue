import { defineConfig, mergeConfig } from 'vite'
import viteConfig from './vite.config'

const merged = defineConfig(mergeConfig(viteConfig, defineConfig({
  build: {
    emptyOutDir: false, // Contains esm build
    target: 'es2022', // Transpile syntax to Node 18+
    sourcemap: false,
    minify: true,
    rollupOptions: {
      output: {
        // No code splitting
        manualChunks: {},
      },
    },
  },
})))

// We need to *replace* these, however mergeConfig won't let us do that (it wants to merge the arrays).
merged.plugins = merged.plugins.slice(0, -1) // Don't run DTS
if (merged.build.lib)
  merged.build.lib.formats = ['cjs']

export default merged
