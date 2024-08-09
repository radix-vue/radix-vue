<script lang="ts">
import type { PrimitiveProps } from '@/Primitive'
import { useVModel } from '@vueuse/core'
import { clamp, createContext, snapValueToStep, useFormControl } from '@/shared'
import { type HTMLAttributes, type Ref, computed, ref, toRefs } from 'vue'

export interface NumberFieldRootProps extends PrimitiveProps {
  defaultValue?: number
  modelValue?: number
  /** The smallest value allowed for the input. */
  min?: number
  /** The largest value allowed for the input. */
  max?: number
  /** The amount that the input value changes with each increment or decrement "tick". */
  step?: number
  /** Formatting options for the value displayed in the number field. This also affects what characters are allowed to be typed by the user. */
  formatOptions?: Intl.NumberFormatOptions
  /** The locale to use for formatting dates */
  locale?: string
  /** When `true`, prevents the user from interacting with the Number Field. */
  disabled?: boolean
  /** When `true`, indicates that the user must set the value before the owning form can be submitted. */
  required?: boolean
  /** The name of the number field. Submitted with its owning form as part of a name/value pair. */
  name?: string
  /** Id of the element */
  id?: string
}

export type NumberFieldRootEmits = {
  'update:modelValue': [val: number]
}

interface NumberFieldRootContext {
  modelValue: Ref<number>
  handleIncrease: (multiplier?: number) => void
  handleDecrease: (multiplier?: number) => void
  handleMinMaxValue: (type: 'min' | 'max') => void
  inputEl: Ref<HTMLInputElement | undefined>
  onInputElement: (el: HTMLInputElement) => void
  inputMode: Ref<HTMLAttributes['inputmode']>
  textValue: Ref<string>
  validate: (val: string) => boolean
  applyInputValue: (val: string) => void
  disabled: Ref<boolean>
  max: Ref<number | undefined>
  min: Ref<number | undefined>
  isDecreaseDisabled: Ref<boolean>
  isIncreaseDisabled: Ref<boolean>
  id: Ref<string | undefined>
  locale: Ref<string>
}

export const [injectNumberFieldRootContext, provideNumberFieldRootContext] = createContext<NumberFieldRootContext>('NumberFieldRoot')
</script>

<script setup lang="ts">
import { Primitive, usePrimitiveElement } from '@/Primitive'
import { handleDecimalOperation, useNumberFormatter, useNumberParser } from './utils'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<NumberFieldRootProps>(), {
  as: 'div',
  defaultValue: undefined,
  locale: 'en-US',
  step: 1,
})
const emits = defineEmits<NumberFieldRootEmits>()
const { disabled, min, max, step, locale, formatOptions, id } = toRefs(props)

const modelValue = useVModel(props, 'modelValue', emits, {
  defaultValue: props.defaultValue,
  passive: (props.modelValue === undefined) as false,
}) as Ref<number>

const { primitiveElement, currentElement } = usePrimitiveElement()

const isFormControl = useFormControl(currentElement)
const inputEl = ref<HTMLInputElement>()

const isDecreaseDisabled = computed(() => (
  clampInputValue(modelValue.value) === min.value
  || (min.value !== undefined && !isNaN(modelValue.value) ? (handleDecimalOperation('-', modelValue.value, step.value) < min.value) : false)),
)
const isIncreaseDisabled = computed(() => (
  clampInputValue(modelValue.value) === max.value
  || (max.value !== undefined && !isNaN(modelValue.value) ? (handleDecimalOperation('+', modelValue.value, step.value) > max.value) : false)),
)

function handleChangingValue(type: 'increase' | 'decrease', multiplier = 1) {
  if (disabled.value)
    return

  let newValue: number
  if (isNaN(modelValue.value)) {
    newValue = min.value ?? 0
  }
  else {
    const change = (step.value ?? 1) * multiplier
    newValue = type === 'increase' ? modelValue.value + change : modelValue.value - change
  }

  modelValue.value = clampInputValue(newValue)
  setInputValue()
}

function handleIncrease(multiplier = 1) {
  handleChangingValue('increase', multiplier)
}
function handleDecrease(multiplier = 1) {
  handleChangingValue('decrease', multiplier)
}

function handleMinMaxValue(type: 'min' | 'max') {
  if (type === 'min' && min.value !== undefined)
    modelValue.value = clampInputValue(min.value)
  else if (type === 'max' && max.value !== undefined)
    modelValue.value = clampInputValue(max.value)
  setInputValue()
}

// Formatter
const numberFormatter = useNumberFormatter(locale, formatOptions)
const numberParser = useNumberParser(locale, formatOptions)

const inputMode = computed<HTMLAttributes['inputmode']>(() => {
  // The inputMode attribute influences the software keyboard that is shown on touch devices.
  // Browsers and operating systems are quite inconsistent about what keys are available, however.
  // We choose between numeric and decimal based on whether we allow negative and fractional numbers,
  // and based on testing on various devices to determine what keys are available in each inputMode.
  const hasDecimals = numberFormatter.resolvedOptions().maximumFractionDigits! > 0
  return hasDecimals ? 'decimal' : 'numeric'
})

// Replace negative textValue formatted using currencySign: 'accounting'
// with a textValue that can be announced using a minus sign.
const textValue = computed(() => {
  if (isNaN(modelValue.value))
    return ''

  let formattedValue = numberFormatter.format(modelValue.value)
  // Temporary solution: Handle locale equals to ar, textValue equals to 1 and 2 separately for the time being.
  // ModelValue is equal to 1 and 2
  if (locale.value === 'ar' && formatOptions.value?.style === 'unit' && formatOptions.value?.unit === 'day') {
    const value = Math.abs(modelValue.value)
    if (value === 1) {
      formattedValue = `${value} يوم`
    }
    else if (value === 2) {
      formattedValue = `${value} يومان`
    }
  }

  return formattedValue
})

function validate(val: string) {
  return numberParser.isValidPartialNumber(val, min.value, max.value)
}

function setInputValue() {
  if (inputEl.value) {
    inputEl.value.value = textValue.value
  }
}

function clampInputValue(val: number) {
  // Clamp to min and max, round to the nearest step, and round to specified number of digits
  let clampedValue: number
  if (step.value === undefined || isNaN(step.value))
    clampedValue = clamp(val, min.value, max.value)
  else
    clampedValue = snapValueToStep(val, min.value, max.value, step.value)

  return clampedValue
}

function applyInputValue(val: string) {
  const parsedValue = numberParser.parse(val)

  if (!isNaN(parsedValue)) {
    modelValue.value = clampInputValue(parsedValue)
  }

  setInputValue()
}

provideNumberFieldRootContext({
  modelValue,
  handleDecrease,
  handleIncrease,
  handleMinMaxValue,
  inputMode,
  inputEl,
  onInputElement: el => inputEl.value = el,
  textValue,
  validate,
  applyInputValue,
  disabled,
  max,
  min,
  isDecreaseDisabled,
  isIncreaseDisabled,
  id,
  locale,
})
</script>

<template>
  <Primitive
    v-bind="$attrs"
    ref="primitiveElement"
    role="group"
    :as="as"
    :as-child="asChild"
  >
    <slot
      :model-value="modelValue"
      :text-value="textValue"
    />
  </Primitive>

  <input
    v-if="isFormControl"
    type="text"
    tabindex="-1"
    aria-hidden
    :value="modelValue"
    :name="props.name"
    :disabled="props.disabled"
    :required="props.required"
    :style="{
      transform: 'translateX(-100%)',
      position: 'absolute',
      pointerEvents: 'none',
      opacity: 0,
      margin: 0,
    }"
  >
</template>
