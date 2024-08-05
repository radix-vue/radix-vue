import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import dts from 'vite-plugin-dts'
import pkg from './package.json'

const projectRootDir = resolve(__dirname)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    dts({
      tsconfigPath: 'tsconfig.build.json',
      exclude: ['src/test/**', 'src/**/story/**', 'src/**/*.story.vue'],
      cleanVueFileName: true,
      rollupTypes: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(projectRootDir, 'src'),
    },
    dedupe: [
      'vue',
      '@vue/runtime-core',
    ],
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    lib: {
      name: 'radix-vue',
      formats: ['es'],
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        date: resolve(__dirname, 'src/date/index.ts'),
      },
    },
    rollupOptions: {
      external: [
        'nanoid/non-secure',
        ...Object.keys(pkg.dependencies ?? {}),
        ...Object.keys(pkg.peerDependencies ?? {}),
      ],
      output: {
        // The package is split in chunks to make lazy-loading possible.
        // No major bundler supports splitting files, even if the file itself is side effects free.
        //
        // Each namespace (Accordion, AlertDialog, ...) is bundled as individual chunks re-exported by index.js.
        // This allows namespace-level granularity which is enough for all realistic code-splitting scenarios.
        //
        // The only exception are components intended for root-level usage, which are bundled in their own chunk.
        // This allows setting up a component's provider while still lazy-loading the actual component.
        manualChunks: (moduleId) => {
          const [namespace, file] = moduleId.split('?')[0].split('/').slice(-2)

          // Entrypoint
          if (namespace === 'src')
            return file

          // Providers
          const ROOT_LEVEL_COMPONENTS = ['ToastProvider.vue', 'TooltipProvider.vue']
          if (ROOT_LEVEL_COMPONENTS.includes(file))
            return 'RootProviders'

          // Namespace
          return namespace
        },
        assetFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'style.css')
            return 'index.css'
          return chunkInfo.name as string
        },
      },
    },
  },
})
