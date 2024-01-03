<script lang="ts">
import type { Ref } from 'vue'
import type { PrimitiveProps } from '@/Primitive'
import type { Direction, ScrollType } from './types'
import { createContext } from '@/shared'
import { useConfig } from '@/ConfigProvider'

export interface ScrollAreaRootContext {
  type: Ref<ScrollType>
  dir: Ref<Direction>
  scrollHideDelay: Ref<number>
  scrollArea: Ref<HTMLElement | undefined>
  viewport: Ref<HTMLElement | undefined>
  onViewportChange(viewport: HTMLElement | null): void
  content: Ref<HTMLElement | undefined>
  onContentChange(content: HTMLElement): void
  scrollbarX: Ref<HTMLElement | undefined>
  onScrollbarXChange(scrollbar: HTMLElement | null): void
  scrollbarXEnabled: Ref<boolean>
  onScrollbarXEnabledChange(rendered: boolean): void
  scrollbarY: Ref<HTMLElement | undefined>
  onScrollbarYChange(scrollbar: HTMLElement | null): void
  scrollbarYEnabled: Ref<boolean>
  onScrollbarYEnabledChange(rendered: boolean): void
  onCornerWidthChange(width: number): void
  onCornerHeightChange(height: number): void
}

export const [injectScrollAreaRootContext, provideScrollAreaRootContext]
  = createContext<ScrollAreaRootContext>('ScrollAreaRoot')

export interface ScrollAreaRootProps extends PrimitiveProps {
  type?: ScrollType
  dir?: Direction
  scrollHideDelay?: number
}
</script>

<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import {
  Primitive,
  usePrimitiveElement,
} from '@/Primitive'

const props = withDefaults(defineProps<ScrollAreaRootProps>(), {
  type: 'hover',
  scrollHideDelay: 600,
})

const { primitiveElement, currentElement: scrollArea } = usePrimitiveElement()

const cornerWidth = ref(0)
const cornerHeight = ref(0)
const viewport = ref<HTMLElement>()
const content = ref<HTMLElement>()
const scrollbarX = ref<HTMLElement>()
const scrollbarY = ref<HTMLElement>()
const scrollbarXEnabled = ref(false)
const scrollbarYEnabled = ref(false)

const config = useConfig()
const dir = computed(() => props.dir || config.dir.value)

provideScrollAreaRootContext({
  type: toRef(props, 'type'),
  dir,
  scrollHideDelay: toRef(props, 'scrollHideDelay'),
  scrollArea,
  viewport,
  onViewportChange: (el) => {
    viewport.value = el || undefined
  },
  content,
  onContentChange: (el) => {
    content.value = el
  },
  scrollbarX,
  scrollbarXEnabled,
  scrollbarY,
  scrollbarYEnabled,
  onScrollbarXChange: (scrollbar) => {
    scrollbarX.value = scrollbar || undefined
  },
  onScrollbarYChange: (scrollbar) => {
    scrollbarY.value = scrollbar || undefined
  },
  onScrollbarXEnabledChange: (rendered) => {
    scrollbarXEnabled.value = rendered
  },
  onScrollbarYEnabledChange: (rendered) => {
    scrollbarYEnabled.value = rendered
  },
  onCornerWidthChange: (width) => {
    cornerWidth.value = width
  },
  onCornerHeightChange: (height) => {
    cornerHeight.value = height
  },
})
</script>

<template>
  <Primitive
    ref="primitiveElement"
    :as-child="props.asChild"
    :as="as"
    :dir="dir"
    :style="{
      position: 'relative',
      // Pass corner sizes as CSS vars to reduce re-renders of context consumers
      ['--radix-scroll-area-corner-width' as any]: `${cornerWidth}px`,
      ['--radix-scroll-area-corner-height' as any]: `${cornerHeight}px`,
    }"
  >
    <slot />
  </Primitive>
</template>
