<script lang="ts">
import type {
  DismissableLayerEmits,
  DismissableLayerProps,
  FocusOutsideEvent,
} from '@/DismissableLayer'
import type { PointerDownOutsideEvent } from '@/DismissableLayer/utils'

type MotionAttribute = 'to-start' | 'to-end' | 'from-start' | 'from-end'

export type NavigationMenuContentImplEmits = DismissableLayerEmits

export interface NavigationMenuContentImplProps extends DismissableLayerProps {}
</script>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useEventListener } from '@vueuse/core'
import { injectNavigationMenuContext } from './NavigationMenuRoot.vue'
import {
  EVENT_ROOT_CONTENT_DISMISS,
  focusFirst,
  getOpenState,
  getTabbableCandidates,
  makeContentId,
  makeTriggerId,
} from './utils'
import { DismissableLayer } from '@/DismissableLayer'
import { useArrowNavigation, useCollection, useForwardExpose } from '@/shared'
import { injectNavigationMenuItemContext } from './NavigationMenuItem.vue'

const props = defineProps<NavigationMenuContentImplProps>()
const emits = defineEmits<NavigationMenuContentImplEmits>()

const { injectCollection } = useCollection('nav')
const collectionItems = injectCollection()
const { forwardRef, currentElement } = useForwardExpose()

const menuContext = injectNavigationMenuContext()
const itemContext = injectNavigationMenuItemContext()

const triggerId = makeTriggerId(menuContext.baseId, itemContext.value)
const contentId = makeContentId(menuContext.baseId, itemContext.value)

const prevMotionAttributeRef = ref<MotionAttribute | null>(null)
const motionAttribute = computed(() => {
  const items = collectionItems.value
  const values = items.map(item => item.id.split('trigger-')[1])
  if (menuContext.dir.value === 'rtl')
    values.reverse()
  const index = values.indexOf(menuContext.modelValue.value)
  const prevIndex = values.indexOf(menuContext.previousValue.value)
  const isSelected = itemContext.value === menuContext.modelValue.value
  const wasSelected = prevIndex === values.indexOf(itemContext.value)

  // We only want to update selected and the last selected content
  // this avoids animations being interrupted outside of that range
  if (!isSelected && !wasSelected)
    return prevMotionAttributeRef.value

  const attribute = (() => {
    // Don't provide a direction on the initial open
    if (index !== prevIndex) {
      // If we're moving to this item from another
      if (isSelected && prevIndex !== -1)
        return index > prevIndex ? 'from-end' : 'from-start'
      // If we're leaving this item for another
      if (wasSelected && index !== -1)
        return index > prevIndex ? 'to-start' : 'to-end'
    }
    // Otherwise we're entering from closed or leaving the list
    // entirely and should not animate in any direction
    return null
  })()

  // eslint-disable-next-line vue/no-side-effects-in-computed-properties
  prevMotionAttributeRef.value = attribute
  return attribute
})

function handleFocusOutside(ev: FocusOutsideEvent) {
  emits('focusOutside', ev)
  emits('interactOutside', ev)

  if (!ev.defaultPrevented) {
    itemContext.onContentFocusOutside()

    const target = ev.target as HTMLElement
    // Only dismiss content when focus moves outside of the menu
    if (menuContext.rootNavigationMenu?.value?.contains(target))
      ev.preventDefault()
  }
}

function handlePointerDownOutside(ev: PointerDownOutsideEvent) {
  emits('pointerDownOutside', ev)

  if (!ev.defaultPrevented) {
    const target = ev.target as HTMLElement
    const isTrigger = collectionItems.value.some(item =>
      item.contains(target),
    )
    const isRootViewport
    = menuContext.isRootMenu && menuContext.viewport.value?.contains(target)

    if (isTrigger || isRootViewport || !menuContext.isRootMenu)
      ev.preventDefault()
  }
}

watchEffect((onCleanup) => {
  const content = currentElement.value
  if (menuContext.isRootMenu && content) {
    // Bubble dismiss to the root content node and focus its trigger
    const handleClose = () => {
      menuContext.onItemDismiss()
      itemContext.onRootContentClose()
      if (content.contains(document.activeElement))
        itemContext.triggerRef.value?.focus()
    }

    const documentDismissCleanup = useEventListener(document, EVENT_ROOT_CONTENT_DISMISS, handleClose)

    onCleanup(() => {
      documentDismissCleanup()
    })
  }
})

function handleEscapeKeyDown(ev: KeyboardEvent) {
  emits('escapeKeyDown', ev)

  if (!ev.defaultPrevented) {
    menuContext.onItemDismiss()
    itemContext.triggerRef?.value?.focus()
    itemContext.wasEscapeCloseRef.value = true
  }
}

function handleKeydown(ev: KeyboardEvent) {
  // prevent parent menu triggering keydown event
  if ((ev.target as HTMLElement).closest('[data-radix-navigation-menu]') !== menuContext.rootNavigationMenu.value)
    return

  const isMetaKey = ev.altKey || ev.ctrlKey || ev.metaKey
  const isTabKey = ev.key === 'Tab' && !isMetaKey
  const candidates = getTabbableCandidates(ev.currentTarget as HTMLElement)

  if (isTabKey) {
    const focusedElement = document.activeElement
    const index = candidates.findIndex(
      candidate => candidate === focusedElement,
    )
    const isMovingBackwards = ev.shiftKey
    const nextCandidates = isMovingBackwards
      ? candidates.slice(0, index).reverse()
      : candidates.slice(index + 1, candidates.length)

    if (focusFirst(nextCandidates)) {
      // prevent browser tab keydown because we've handled focus
      ev.preventDefault()
    }
    else {
      // If we can't focus that means we're at the edges
      // so focus the proxy and let browser handle
      // tab/shift+tab keypress on the proxy instead
      itemContext.focusProxyRef.value?.focus()
      return
    }
  }

  const newSelectedElement = useArrowNavigation(
    ev,
    document.activeElement as HTMLElement,
    undefined,
    { itemsArray: candidates, loop: false, enableIgnoredElement: true },
  )
  newSelectedElement?.focus()
}

function handleDismiss() {
  const rootContentDismissEvent = new Event(EVENT_ROOT_CONTENT_DISMISS, {
    bubbles: true,
    cancelable: true,
  })
  currentElement.value?.dispatchEvent(rootContentDismissEvent)
}
</script>

<template>
  <DismissableLayer
    :id="contentId"
    :ref="forwardRef"
    :aria-labelledby="triggerId"
    :data-motion="motionAttribute"
    :data-state="getOpenState(menuContext.modelValue.value === itemContext.value)"
    :data-orientation="menuContext.orientation"
    v-bind="props"
    @keydown="handleKeydown"
    @escape-key-down="handleEscapeKeyDown"
    @pointer-down-outside="handlePointerDownOutside"
    @focus-outside="handleFocusOutside"
    @dismiss="handleDismiss"
  >
    <slot />
  </DismissableLayer>
</template>
