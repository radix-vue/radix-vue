<script lang="ts">
export interface ScrollAreaScrollbarScrollProps {
  forceMount?: boolean
}
</script>

<script setup lang="ts">
import { watchEffect } from 'vue'
import { useDebounceFn, useEventListener } from '@vueuse/core'
import { useStateMachine } from '../shared/useStateMachine'
import { injectScrollAreaRootContext } from './ScrollAreaRoot.vue'
import { injectScrollAreaScrollbarContext } from './ScrollAreaScrollbar.vue'
import ScrollAreaScrollbarVisible from './ScrollAreaScrollbarVisible.vue'
import { Presence } from '@/Presence'
import { useForwardExpose } from '@/shared'

defineProps<ScrollAreaScrollbarScrollProps>()

const rootContext = injectScrollAreaRootContext()
const scrollbarContext = injectScrollAreaScrollbarContext()

const { forwardRef } = useForwardExpose()

const { state, dispatch } = useStateMachine('hidden', {
  hidden: {
    SCROLL: 'scrolling',
  },
  scrolling: {
    SCROLL_END: 'idle',
    POINTER_ENTER: 'interacting',
  },
  interacting: {
    SCROLL: 'interacting',
    POINTER_LEAVE: 'idle',
  },
  idle: {
    HIDE: 'hidden',
    SCROLL: 'scrolling',
    POINTER_ENTER: 'interacting',
  },
})

watchEffect((onCleanup) => {
  if (state.value === 'idle') {
    const timeId = window.setTimeout(
      () => dispatch('HIDE'),
      rootContext.scrollHideDelay.value,
    )

    onCleanup(() => {
      window.clearTimeout(timeId)
    })
  }
})

const debounceScrollEnd = useDebounceFn(() => dispatch('SCROLL_END'), 100)

watchEffect((onCleanup) => {
  const viewport = rootContext.viewport.value
  const scrollDirection = scrollbarContext.isHorizontal.value
    ? 'scrollLeft'
    : 'scrollTop'

  if (viewport) {
    let prevScrollPos = viewport[scrollDirection]
    const handleScroll = () => {
      const scrollPos = viewport[scrollDirection]
      const hasScrollInDirectionChanged = prevScrollPos !== scrollPos
      if (hasScrollInDirectionChanged) {
        dispatch('SCROLL')
        debounceScrollEnd()
      }
      prevScrollPos = scrollPos
    }

    const viewportScrollCleanup = useEventListener(viewport, 'scroll', handleScroll)

    onCleanup(() => {
      viewportScrollCleanup()
    })
  }
})
</script>

<template>
  <Presence :present="forceMount || state !== 'hidden'">
    <ScrollAreaScrollbarVisible
      v-bind="$attrs"
      :ref="forwardRef"
    >
      <slot />
    </ScrollAreaScrollbarVisible>
  </Presence>
</template>
