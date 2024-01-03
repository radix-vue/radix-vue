<script lang="ts">
import type { Ref } from 'vue'

import type { PrimitiveProps } from '@/Primitive'
import type { Direction, Orientation } from './utils'
import { createContext, useCollection, useId } from '@/shared'
import { useConfig } from '@/ConfigProvider'

export interface NavigationMenuRootProps extends PrimitiveProps {
  modelValue?: string
  defaultValue?: string
  dir?: Direction
  orientation?: Orientation
  /**
   * The duration from when the pointer enters the trigger until the tooltip gets opened.
   * @defaultValue 200
   */
  delayDuration?: number
  /**
   * How much time a user has to enter another trigger without incurring a delay again.
   * @defaultValue 300
   */
  skipDelayDuration?: number
}
export type NavigationMenuRootEmits = {
  'update:modelValue': [value: string]
}

export interface NavigationMenuContext {
  isRootMenu: boolean
  modelValue: Ref<string>
  previousValue: Ref<string>
  baseId: string
  dir: Ref<Direction>
  orientation: Orientation
  rootNavigationMenu: Ref<HTMLElement | undefined>
  indicatorTrack: Ref<HTMLElement | undefined>
  onIndicatorTrackChange(indicatorTrack: HTMLElement | undefined): void
  viewport: Ref<HTMLElement | undefined>
  onViewportChange(viewport: HTMLElement | undefined): void
  onTriggerEnter(itemValue: string): void
  onTriggerLeave(): void
  onContentEnter(itemValue: string): void
  onContentLeave(): void
  onItemSelect(itemValue: string): void
  onItemDismiss(): void
}

export const [injectNavigationMenuContext, provideNavigationMenuContext]
  = createContext<NavigationMenuContext>(['NavigationMenuRoot', 'NavigationMenuSub'], 'NavigationMenuContext')
</script>

<script setup lang="ts">
import {
  computed,
  ref,
  toRef,
} from 'vue'
import { refAutoReset, useDebounceFn, useVModel } from '@vueuse/core'
import {
  Primitive,
  usePrimitiveElement,
} from '@/Primitive'

const props = withDefaults(defineProps<NavigationMenuRootProps>(), {
  modelValue: undefined,
  delayDuration: 200,
  skipDelayDuration: 300,
  orientation: 'horizontal',
  as: 'nav',
})
const emits = defineEmits<NavigationMenuRootEmits>()

const modelValue = useVModel(props, 'modelValue', emits, {
  defaultValue: props.defaultValue ?? '',
  passive: (props.modelValue === undefined) as false,
}) as Ref<string>
const previousValue = ref('')

const { primitiveElement, currentElement: rootNavigationMenu }
  = usePrimitiveElement()

const indicatorTrack = ref<HTMLElement>()
const viewport = ref<HTMLElement>()

const { createCollection } = useCollection('nav')
createCollection(indicatorTrack)

const config = useConfig()
const dir = computed(() => props.dir || config.dir.value)

const isDelaySkipped = refAutoReset(false, toRef(props, 'skipDelayDuration'))
const computedDelay = computed(() => {
  const isOpen = modelValue.value !== ''
  return isOpen || isDelaySkipped.value
    ? 150 // 150ms for user to switch trigger or move into content view
    : props.delayDuration
})

const debouncedFn = useDebounceFn((val: string) => {
  previousValue.value = modelValue.value
  modelValue.value = val
}, computedDelay)

provideNavigationMenuContext({
  isRootMenu: true,
  modelValue,
  previousValue,
  baseId: useId(),
  dir,
  orientation: props.orientation,
  rootNavigationMenu,
  indicatorTrack,
  onIndicatorTrackChange: (val) => {
    indicatorTrack.value = val
  },
  viewport,
  onViewportChange: (val) => {
    viewport.value = val
  },
  onTriggerEnter: (val) => {
    debouncedFn(val)
  },
  onTriggerLeave: () => {
    isDelaySkipped.value = true
    debouncedFn('')
  },
  onContentEnter: (val) => {
    debouncedFn(val)
  },
  onContentLeave: () => {
    debouncedFn('')
  },
  onItemSelect: (val) => {
    // When selecting item we trigger update immediately
    previousValue.value = modelValue.value
    modelValue.value = val
  },
  onItemDismiss: () => {
    previousValue.value = modelValue.value
    modelValue.value = ''
  },
})
</script>

<template>
  <Primitive
    ref="primitiveElement"
    aria-label="Main"
    :as="as"
    :as-child="asChild"
    :data-orientation="orientation"
    :dir="dir"
  >
    <slot />
  </Primitive>
</template>
