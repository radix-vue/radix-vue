<script lang="ts">
import type { Ref } from 'vue'
import type { PrimitiveProps } from '@/Primitive'
import type { DataOrientation, Direction } from '../shared/types'
import { createContext, useId } from '@/shared'
import { useConfig } from '@/ConfigProvider'

export interface TabsRootContext {
  modelValue: Ref<string | undefined>
  changeModelValue: (value: string) => void
  orientation: Ref<DataOrientation>
  dir: Ref<Direction>
  activationMode: 'automatic' | 'manual'
  baseId: string
  tabsList: Ref<HTMLElement | undefined>
}

export interface TabsRootProps extends PrimitiveProps {
  defaultValue?: string
  /**
   * The orientation the tabs are layed out.
   * Mainly so arrow navigation is done accordingly (left & right vs. up & down)
   * @defaultValue horizontal
   */
  orientation?: DataOrientation
  /**
   * The direction of navigation between toolbar items.
   */
  dir?: Direction
  /**
   * Whether a tab is activated automatically or manually.
   * @defaultValue automatic
   * */
  activationMode?: 'automatic' | 'manual'
  modelValue?: string
}
export type TabsRootEmits = {
  'update:modelValue': [payload: string]
}

export const [injectTabsRootContext, provideTabsRootContext]
  = createContext<TabsRootContext>('TabsRoot')
</script>

<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { useVModel } from '@vueuse/core'
import { Primitive } from '@/Primitive'

const props = withDefaults(defineProps<TabsRootProps>(), {
  orientation: 'horizontal',
  activationMode: 'automatic',
})
const emits = defineEmits<TabsRootEmits>()

const config = useConfig()
const dir = computed(() => props.dir || config.dir.value)

const modelValue = useVModel(props, 'modelValue', emits, {
  defaultValue: props.defaultValue,
  passive: (props.modelValue === undefined) as false,
})

const tabsList = ref<HTMLElement>()

provideTabsRootContext({
  modelValue,
  changeModelValue: (value: string) => {
    modelValue.value = value
  },
  orientation: toRef(props, 'orientation'),
  dir,
  activationMode: props.activationMode,
  baseId: useId(),
  tabsList,
})
</script>

<template>
  <Primitive
    :dir="dir"
    :data-orientation="orientation"
    :as-child="asChild"
    :as="as"
  >
    <slot />
  </Primitive>
</template>
