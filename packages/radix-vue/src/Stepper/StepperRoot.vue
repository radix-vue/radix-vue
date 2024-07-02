<script lang="ts">
import type { Ref } from 'vue'
import { useVModel } from '@vueuse/core'
import { ref, toRefs } from 'vue'
import type { DataOrientation, Direction } from '../shared/types'
import type { PrimitiveProps } from '@/Primitive'
import { createContext, useDirection, useForwardExpose } from '@/shared'
import { Primitive } from '@/Primitive'

export interface StepperRootContext {
  modelValue: Ref<number | undefined>
  changeModelValue: (value: number) => void
  orientation: Ref<DataOrientation>
  dir: Ref<Direction>
  linear: Ref<boolean>
  stepperItems: Ref<Set<HTMLElement>>
  totalStepperItems: Ref<Set<HTMLElement>>
}

export interface StepperRootProps extends PrimitiveProps {
  /**
   * The value of the tab that should be active when initially rendered. Use when you do not need to control the state of the tabs
   */
  defaultValue?: number
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
  /** The controlled value of the tab to activate. Can be bound as `v-model`. */
  modelValue?: number
  /** Whether or not the steps must be completed in order */
  linear?: boolean
}
export type StepperRootEmits = {
  /** Event handler called when the value changes */
  'update:modelValue': [payload: number | undefined]
}

export const [injectStepperRootContext, provideStepperRootContext]
  = createContext<StepperRootContext>('StepperRoot')
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<StepperRootProps>(), {
  orientation: 'horizontal',
  linear: true,
  defaultValue: 1,
})
const emits = defineEmits<StepperRootEmits>()

defineSlots<{
  default: (props: {
    /** Current step */
    modelValue: number | undefined
  }) => any
}>()

const { dir: propDir, orientation: propOrientation, linear } = toRefs(props)
const dir = useDirection(propDir)
useForwardExpose()

const stepperItems = ref<Set<HTMLElement>>(new Set())
const totalStepperItems = ref<Set<HTMLElement>>(new Set())

const modelValue = useVModel(props, 'modelValue', emits, {
  defaultValue: props.defaultValue,
  passive: (props.modelValue === undefined) as false,
})

provideStepperRootContext({
  modelValue,
  changeModelValue: (value: number) => {
    modelValue.value = value
  },
  orientation: propOrientation,
  dir,
  linear,
  stepperItems,
  totalStepperItems,
})
</script>

<template>
  <Primitive
    role="group"
    aria-label="progress"
    :as="as"
    :as-child="asChild"
    :data-linear="linear ? '' : undefined"
    :data-orientation="orientation"
  >
    <slot :model-value="modelValue" />
    <div
      aria-live="polite"
      aria-atomic="true"
      role="status"
      :style="{
        transform: 'translateX(-100%)',
        position: 'absolute',
        pointerEvents: 'none',
        opacity: 0,
        margin: 0,
      }"
    >
      Step {{ modelValue }} of {{ totalStepperItems.size }}
    </div>
  </Primitive>
</template>
