<script lang="ts">
import type { Ref } from 'vue'
import type { PrimitiveProps } from '@/Primitive'
import type { DataOrientation, Direction } from '../shared/types'
import { createContext, useDirection, useForwardExpose, useId } from '@/shared'
import { useVModel } from '@vueuse/core'

export type ModelValue = string | number

export interface TabsRootContext {
  modelValue: Ref<ModelValue | undefined>
  changeModelValue: (value: ModelValue) => void
  orientation: Ref<DataOrientation>
  dir: Ref<Direction>
  activationMode: 'automatic' | 'manual'
  baseId: string
  tabsList: Ref<HTMLElement | undefined>
}

export interface TabsRootProps<TModelValue extends ModelValue = ModelValue> extends PrimitiveProps {
  /**
   * The value of the tab that should be active when initially rendered. Use when you do not need to control the state of the tabs
   */
  defaultValue?: NoInfer<TModelValue>
  /**
   * The orientation the tabs are laid out.
   * Mainly so arrow navigation is done accordingly (left & right vs. up & down)
   * @defaultValue horizontal
   */
  orientation?: DataOrientation
  /**
   * The reading direction of the combobox when applicable. <br> If omitted, inherits globally from `DirectionProvider` or assumes LTR (left-to-right) reading mode.
   */
  dir?: Direction
  /**
   * Whether a tab is activated automatically (on focus) or manually (on click).
   * @defaultValue automatic
   */
  activationMode?: 'automatic' | 'manual'
  /** The controlled value of the tab to activate. Can be bind as `v-model`. */
  modelValue?: TModelValue
}
export type TabsRootEmits<TModelValue extends ModelValue = ModelValue> = {
  /** Event handler called when the value changes */
  'update:modelValue': [payload: TModelValue]
}

export const [injectTabsRootContext, provideTabsRootContext]
  = createContext<TabsRootContext>('TabsRoot')
</script>

<script setup lang="ts" generic="TModelValue extends ModelValue = ModelValue">
import { ref, toRefs } from 'vue'
import { Primitive } from '@/Primitive'

const props = withDefaults(defineProps<TabsRootProps<TModelValue>>(), {
  orientation: 'horizontal',
  activationMode: 'automatic',
})

const emits = defineEmits<TabsRootEmits<TModelValue>>()

defineSlots<{
  default: (props: {
    /** Current input values */
    modelValue: typeof modelValue.value
  }) => any
}>()

const { orientation, dir: propDir } = toRefs(props)
const dir = useDirection(propDir)
useForwardExpose()

const modelValue = useVModel<TabsRootProps<TModelValue>, 'modelValue', 'update:modelValue'>(props, 'modelValue', emits, {
  defaultValue: props.defaultValue,
  passive: (props.modelValue === undefined) as false,
})

const tabsList = ref<HTMLElement>()

provideTabsRootContext({
  modelValue,
  changeModelValue: (value) => {
    modelValue.value = value as TModelValue
  },
  orientation,
  dir,
  activationMode: props.activationMode,
  baseId: useId(undefined, 'radix-vue-tabs'),
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
    <slot :model-value="modelValue" />
  </Primitive>
</template>
