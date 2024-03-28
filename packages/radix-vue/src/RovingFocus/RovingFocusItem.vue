<script lang="ts">
import type { PrimitiveProps } from '@/Primitive'

export interface RovingFocusItemProps extends PrimitiveProps {
  tabStopId?: string
  focusable?: boolean
  active?: boolean
}
</script>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted } from 'vue'
import { injectRovingFocusGroupContext } from './RovingFocusGroup.vue'
import { Primitive } from '@/Primitive'
import { focusFirst, getFocusIntent, wrapArray } from './utils'
import { useCollection, useId } from '@/shared'

const props = withDefaults(defineProps<RovingFocusItemProps>(), {
  focusable: true,
  active: true,
  as: 'span',
})

const context = injectRovingFocusGroupContext()
const id = computed(() => props.tabStopId || useId())
const isCurrentTabStop = computed(
  () => context.currentTabStopId.value === id.value,
)

const { injectCollection } = useCollection('rovingFocus')
const collections = injectCollection()

onMounted(() => {
  if (props.focusable)
    context.onFocusableItemAdd()
})
onUnmounted(() => {
  if (props.focusable)
    context.onFocusableItemRemove()
})

async function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Tab' && event.shiftKey) {
    context.onItemShiftTab()
    return
  }

  if (event.target !== event.currentTarget)
    return

  const focusIntent = getFocusIntent(
    event,
    context.orientation.value,
    context.dir.value,
  )

  if (focusIntent !== undefined) {
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
      return
    event.preventDefault()
    let candidateNodes = [...collections.value]

    if (focusIntent === 'last') {
      candidateNodes.reverse()
    }
    else if (focusIntent === 'prev' || focusIntent === 'next') {
      if (focusIntent === 'prev')
        candidateNodes.reverse()
      const currentIndex = candidateNodes.indexOf(
        event.currentTarget as HTMLElement,
      )

      candidateNodes = context.loop.value
        ? wrapArray(candidateNodes, currentIndex + 1)
        : candidateNodes.slice(currentIndex + 1)
    }
    nextTick(() => focusFirst(candidateNodes))
  }
}
</script>

<template>
  <Primitive
    data-radix-vue-collection-item
    :tabindex="isCurrentTabStop ? 0 : -1"
    :data-orientation="context.orientation.value"
    :data-active="active"
    :data-disabled="!focusable || undefined"
    :as="as"
    :as-child="asChild"
    @mousedown="
      (event) => {
        // We prevent focusing non-focusable items on `mousedown`.
        // Even though the item has tabIndex={-1}, that only means take it out of the tab order.
        if (!focusable) event.preventDefault();
        // Safari doesn't focus a button when clicked so we run our logic on mousedown also
        else context.onItemFocus(id);
      }
    "
    @focus="context.onItemFocus(id)"
    @keydown="handleKeydown"
  >
    <slot />
  </Primitive>
</template>
