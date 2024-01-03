<script lang="ts">
import type { Direction, ScrollBodyOption } from '@/shared/types'
import type { Ref } from 'vue'
import { ref, toRefs } from 'vue'
import { createContext } from '@/shared'

interface ConfigProviderContext {
  dir: Ref<Direction>
  scrollBody: Ref<boolean | ScrollBodyOption>
}

export const [injectConfigProviderContext, provideConfigProviderContext]
  = createContext<ConfigProviderContext>('ConfigProvider')

export function useConfig() {
  return injectConfigProviderContext({
    dir: ref('ltr'),
    scrollBody: ref(true),
  })
}

export interface ConfigProviderProps {
  /**
   * The global reading direction of your application. This will be inherited by all primitives.
   * @default 'ltr'
   */
  dir?: Direction
  /**
   * The global scroll body behavior of your application. This will be inherited by the related primitives.
   * @default true
   */
  scrollBody?: boolean | ScrollBodyOption
}
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<ConfigProviderProps>(), {
  dir: 'ltr',
  scrollBody: true,
})

provideConfigProviderContext(toRefs(props))
</script>

<template>
  <slot />
</template>
