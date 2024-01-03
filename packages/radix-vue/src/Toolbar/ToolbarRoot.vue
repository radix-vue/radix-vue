<script lang="ts">
import { type Ref, computed, toRef } from 'vue'
import type { PrimitiveProps } from '@/Primitive'
import type { DataOrientation, Direction } from '@/shared/types'
import { createContext } from '@/shared'
import { useConfig } from '@/ConfigProvider'

export interface ToolbarRootProps extends PrimitiveProps {
  orientation?: DataOrientation
  dir?: Direction
  loop?: boolean
}

export interface ToolbarRootContext {
  orientation: Ref<DataOrientation>
  dir: Ref<Direction>
}

export const [injectToolbarRootContext, provideToolbarRootContext]
  = createContext<ToolbarRootContext>('ToolbarRoot')
</script>

<script setup lang="ts">
import { Primitive } from '@/Primitive'
import { RovingFocusGroup } from '@/RovingFocus'

const props = withDefaults(defineProps<ToolbarRootProps>(), {
  orientation: 'horizontal',
})

const config = useConfig()
const dir = computed(() => props.dir || config.dir.value)

provideToolbarRootContext({ orientation: toRef(props, 'orientation'), dir })
</script>

<template>
  <RovingFocusGroup as-child :orientation="orientation" :dir="dir" :loop="loop">
    <Primitive
      role="toolbar"
      :aria-orientation="orientation"
      :as-child="asChild"
      :as="as"
    >
      <slot />
    </Primitive>
  </RovingFocusGroup>
</template>
