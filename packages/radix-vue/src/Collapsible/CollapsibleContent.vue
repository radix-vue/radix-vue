<script lang="ts">
import type { PrimitiveProps } from '@/Primitive'
import { useForwardExpose, useId } from '@/shared'

export interface CollapsibleContentProps extends PrimitiveProps {
  /**
   * Used to force mounting when more control is needed. Useful when
   * controlling animation with Vue animation libraries.
   */
  forceMount?: boolean
  /**
   * Used to disable animations, useful during drag operations
   */
  disableAnimation?: boolean
}
</script>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { injectCollapsibleRootContext } from './CollapsibleRoot.vue'
import {
  Primitive,
} from '@/Primitive'
import { Presence } from '@/Presence'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<CollapsibleContentProps>(), {
  disableAnimation: false,
})

const rootContext = injectCollapsibleRootContext()
rootContext.contentId ||= useId(undefined, 'radix-vue-collapsible-content')

const presentRef = ref<InstanceType<typeof Presence>>()
const { forwardRef, currentElement } = useForwardExpose()

const width = ref(0)
const height = ref(0)

// when opening we want it to immediately open to retrieve dimensions
// when closing we delay `present` to retrieve dimensions before closing
const isOpen = computed(() => rootContext.open.value)
const isMountAnimationPrevented = ref(isOpen.value)
const currentStyle = ref<Record<string, string>>()
const isAnimating = ref(false)
const lastOpenState = ref(isOpen.value)

watch(
  () => [isOpen.value, presentRef.value?.present],
  async ([newOpenState]) => {
    await nextTick()
    const node = currentElement.value
    if (!node)
      return
    currentStyle.value = currentStyle.value || {
      transitionDuration: node.style.transitionDuration,
      animationName: node.style.animationName,
    }

    if (newOpenState !== lastOpenState.value && !props.disableAnimation) {
      isAnimating.value = true
      lastOpenState.value = newOpenState

      const animationDuration = parseFloat(getComputedStyle(node).transitionDuration) * 1000
      setTimeout(() => {
        isAnimating.value = false
      }, animationDuration)
    }

    // block any animations/transitions so the element renders at its full dimensions
    node.style.transitionDuration = '0s'
    node.style.animationName = 'none'

    // get width and height from full dimensions
    const rect = node.getBoundingClientRect()
    height.value = rect.height
    width.value = rect.width

    // kick off any animations/transitions that were originally set up if it isn't the initial mount
    // and animations are not disabled
    if (!isMountAnimationPrevented.value && !props.disableAnimation) {
      node.style.transitionDuration = currentStyle.value.transitionDuration
      node.style.animationName = currentStyle.value.animationName
    }
  },
  {
    immediate: true,
  },
)

onMounted(() => {
  requestAnimationFrame(() => {
    isMountAnimationPrevented.value = false
  })
})

const contentStyle = computed(() => {
  const style: Record<string, string> = {
    [`--radix-collapsible-content-height`]: `${height.value}px`,
    [`--radix-collapsible-content-width`]: `${width.value}px`,
  }

  if (props.disableAnimation && !isAnimating.value) {
    style.animation = 'none'
    style.transition = 'none'
  }

  return style
})
</script>

<template>
  <Presence
    ref="presentRef"
    :present="forceMount || rootContext.open.value"
    :force-mount="true"
  >
    <Primitive
      v-bind="$attrs"
      :id="rootContext.contentId"
      :ref="forwardRef"
      :as-child="props.asChild"
      :as="as"
      :data-state="rootContext.open.value ? 'open' : 'closed'"
      :data-disabled="rootContext.disabled?.value ? '' : undefined"
      :hidden="!presentRef?.present"
      :style="contentStyle"
    >
      <slot v-if="presentRef?.present" />
    </Primitive>
  </Presence>
</template>
