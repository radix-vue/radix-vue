<script lang="ts">
import type { Ref } from 'vue'
import type { PrimitiveProps } from '@/Primitive'
import type { DataOrientation, Direction } from '../shared/types'
import { createContext, useCollection, useFormControl } from '@/shared'
import { useConfig } from '@/ConfigProvider'

export interface SliderRootProps extends PrimitiveProps {
  name?: string
  defaultValue?: number[]
  modelValue?: number[]
  disabled?: boolean
  orientation?: DataOrientation
  dir?: Direction
  inverted?: boolean
  min?: number
  max?: number
  step?: number
  minStepsBetweenThumbs?: number
}

export type SliderRootEmits = {
  'update:modelValue': [payload: number[] | undefined]
  'valueCommit': [payload: number[]]
}

export interface SliderRootContext {
  orientation: Ref<DataOrientation>
  disabled: Ref<boolean>
  min: Ref<number>
  max: Ref<number>
  modelValue?: Readonly<Ref<number[] | undefined>>
  valueIndexToChangeRef: Ref<number>
  thumbElements: Ref<HTMLElement[]>
}

export const [injectSliderRootContext, provideSliderRootContext]
  = createContext<SliderRootContext>('SliderRoot')
</script>

<script setup lang="ts">
import SliderHorizontal from './SliderHorizontal.vue'
import SliderVertical from './SliderVertical.vue'
import { computed, ref, toRef } from 'vue'
import { usePrimitiveElement } from '@/Primitive'
import { useVModel } from '@vueuse/core'
import { ARROW_KEYS, PAGE_KEYS, clamp, getClosestValueIndex, getDecimalCount, getNextSortedValues, hasMinStepsBetweenValues, roundValue } from './utils'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<SliderRootProps>(), {
  min: 0,
  max: 100,
  step: 1,
  orientation: 'horizontal',
  disabled: false,
  minStepsBetweenThumbs: 0,
  defaultValue: () => [0],
  inverted: false,
})
const emits = defineEmits<SliderRootEmits>()

const config = useConfig()
const dir = computed(() => props.dir || config.dir.value)

const { createCollection } = useCollection('sliderThumb')
const { primitiveElement, currentElement } = usePrimitiveElement()
createCollection(currentElement)
const isFormControl = useFormControl(currentElement)

const modelValue = useVModel(props, 'modelValue', emits, {
  defaultValue: props.defaultValue,
  passive: (props.modelValue === undefined) as false,
}) as Ref<number[]>

const valueIndexToChangeRef = ref(0)
const valuesBeforeSlideStartRef = ref(modelValue.value)

function handleSlideStart(value: number) {
  const closestIndex = getClosestValueIndex(modelValue.value, value)
  updateValues(value, closestIndex)
}

function handleSlideMove(value: number) {
  updateValues(value, valueIndexToChangeRef.value)
}

function handleSlideEnd() {
  const prevValue = valuesBeforeSlideStartRef.value[valueIndexToChangeRef.value]
  const nextValue = modelValue.value[valueIndexToChangeRef.value]
  const hasChanged = nextValue !== prevValue
  if (hasChanged)
    emits('valueCommit', modelValue.value)
}

function updateValues(value: number, atIndex: number, { commit } = { commit: false }) {
  const decimalCount = getDecimalCount(props.step)
  const snapToStep = roundValue(Math.round((value - props.min) / props.step) * props.step + props.min, decimalCount)
  const nextValue = clamp(snapToStep, [props.min, props.max])

  const nextValues = getNextSortedValues(modelValue.value, nextValue, atIndex)

  if (hasMinStepsBetweenValues(nextValues, props.minStepsBetweenThumbs * props.step)) {
    valueIndexToChangeRef.value = nextValues.indexOf(nextValue)
    const hasChanged = String(nextValues) !== String(modelValue.value)
    if (hasChanged && commit)
      emits('valueCommit', nextValues)

    if (hasChanged) {
      thumbElements.value[valueIndexToChangeRef.value]?.focus()
      modelValue.value = nextValues
    }
  }
}

const thumbElements = ref<HTMLElement[]>([])
provideSliderRootContext({
  modelValue,
  valueIndexToChangeRef,
  thumbElements,
  orientation: toRef(props, 'orientation'),
  min: toRef(props, 'min'),
  max: toRef(props, 'max'),
  disabled: toRef(props, 'disabled'),
})
</script>

<template>
  <component
    :is="orientation === 'horizontal' ? SliderHorizontal : SliderVertical"
    v-bind="$attrs"
    ref="primitiveElement"
    :as-child="asChild"
    :as="as"
    :min="min"
    :max="max"
    :dir="dir"
    :inverted="inverted"
    :aria-disabled="disabled"
    :data-disabled="disabled"
    @pointerdown="() => {
      if (!disabled) valuesBeforeSlideStartRef = modelValue
    }"
    @slide-start="!disabled && handleSlideStart($event)"
    @slide-move="!disabled && handleSlideMove($event)"
    @slide-end="!disabled && handleSlideEnd"
    @home-key-down="!disabled && updateValues(min, 0, { commit: true })"
    @end-key-down="!disabled && updateValues(max, modelValue.length - 1, { commit: true })"
    @step-key-down="(event, direction) => {
      if (!disabled) {
        const isPageKey = PAGE_KEYS.includes(event.key);
        const isSkipKey = isPageKey || (event.shiftKey && ARROW_KEYS.includes(event.key));
        const multiplier = isSkipKey ? 10 : 1;
        const atIndex = valueIndexToChangeRef;
        const value = modelValue[atIndex];
        const stepInDirection = step * multiplier * direction;
        updateValues(value + stepInDirection, atIndex, { commit: true });
      }
    }"
  >
    <slot :model-value="modelValue" />
  </component>

  <template v-if="isFormControl">
    <input
      v-for="(value, index) in modelValue"
      :key="index"
      :value="value"
      type="number"
      style="display: none"
      :name="name ? name + (modelValue.length > 1 ? '[]' : '') : undefined"
      :disabled="disabled"
    >
  </template>
</template>
