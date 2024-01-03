<script lang="ts">
import type { Ref } from 'vue'
import type { PrimitiveProps } from '@/Primitive'
import { createContext, useCollection } from '@/shared'
import type {
  Direction,
  Orientation,
} from './utils'
import { useConfig } from '@/ConfigProvider'

export interface RovingFocusGroupProps extends PrimitiveProps {
  /**
   * The orientation of the group.
   * Mainly so arrow navigation is done accordingly (left & right vs. up & down)
   */
  orientation?: Orientation
  /**
   * The direction of navigation between items.
   */
  dir?: Direction
  /**
   * Whether keyboard navigation should loop around
   * @defaultValue false
   */
  loop?: boolean
  currentTabStopId?: string | null
  defaultCurrentTabStopId?: string
}

export type RovingFocusGroupEmits = {
  'entryFocus': [event: Event]
  'update:currentTabStopId': [value: string | null | undefined]
}

interface RovingContext {
  orientation: Ref<Orientation | undefined>
  dir: Ref<Direction>
  loop: Ref<boolean>
  currentTabStopId: Ref<string | null | undefined>
  onItemFocus(tabStopId: string): void
  onItemShiftTab(): void
  onFocusableItemAdd(): void
  onFocusableItemRemove(): void
}

export const [injectRovingFocusGroupContext, provideRovingFocusGroupContext]
  = createContext<RovingContext>('RovingFocusGroup')
</script>

<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { useVModel } from '@vueuse/core'
import {
  Primitive,
  usePrimitiveElement,
} from '@/Primitive'
import {
  ENTRY_FOCUS,
  EVENT_OPTIONS,
  focusFirst,
} from './utils'

const props = withDefaults(defineProps<RovingFocusGroupProps>(), {
  loop: false,
  orientation: undefined,
})
const emits = defineEmits<RovingFocusGroupEmits>()

const config = useConfig()
const dir = computed(() => props.dir || config.dir.value)

const currentTabStopId = useVModel(props, 'currentTabStopId', emits, {
  defaultValue: props.defaultCurrentTabStopId,
  passive: (props.currentTabStopId === undefined) as false,
})
const isTabbingBackOut = ref(false)
const isClickFocus = ref(false)
const focusableItemsCount = ref(0)

const { primitiveElement, currentElement } = usePrimitiveElement()
const { createCollection } = useCollection('rovingFocus')
const collections = createCollection(currentElement)

function handleFocus(event: FocusEvent) {
  // We normally wouldn't need this check, because we already check
  // that the focus is on the current target and not bubbling to it.
  // We do this because Safari doesn't focus buttons when clicked, and
  // instead, the wrapper will get focused and not through a bubbling event.
  const isKeyboardFocus = !isClickFocus.value

  if (
    event.currentTarget
    && event.target === event.currentTarget
    && isKeyboardFocus
    && !isTabbingBackOut.value
  ) {
    const entryFocusEvent = new CustomEvent(ENTRY_FOCUS, EVENT_OPTIONS)
    event.currentTarget.dispatchEvent(entryFocusEvent)
    emits('entryFocus', entryFocusEvent)

    if (!entryFocusEvent.defaultPrevented) {
      const items = collections.value
      const activeItem = items.find(item => item.getAttribute('data-active') === 'true')
      const currentItem = items.find(
        item => item.id === currentTabStopId.value,
      )
      const candidateItems = [activeItem, currentItem, ...items].filter(
        Boolean,
      ) as typeof items
      focusFirst(candidateItems)
    }
  }

  isClickFocus.value = false
}

provideRovingFocusGroupContext({
  loop: toRef(props, 'loop'),
  dir,
  orientation: toRef(props, 'orientation'),
  currentTabStopId,
  onItemFocus: (tabStopId) => {
    currentTabStopId.value = tabStopId
  },
  onItemShiftTab: () => {
    isTabbingBackOut.value = true
  },
  onFocusableItemAdd: () => {
    focusableItemsCount.value++
  },
  onFocusableItemRemove: () => {
    focusableItemsCount.value--
  },
})
</script>

<template>
  <Primitive
    ref="primitiveElement"
    :tabindex="isTabbingBackOut || focusableItemsCount === 0 ? -1 : 0"
    :data-orientation="orientation"
    :as="as"
    :as-child="asChild"
    :dir="dir"
    style="outline: none"
    @mousedown="isClickFocus = true"
    @focus="handleFocus"
    @blur="isTabbingBackOut = false"
  >
    <slot />
  </Primitive>
</template>
