<script lang="ts">
import type { PrimitiveProps } from '@/Primitive'
import type { Ref } from 'vue'
import { useVModel } from '@vueuse/core'
import { createContext, useFormControl } from '@/shared'
import type { CheckedState } from './utils'

export interface CheckboxRootProps extends PrimitiveProps {
  defaultChecked?: boolean
  checked?: boolean | 'indeterminate'
  disabled?: boolean
  required?: boolean
  name?: string
  value?: string
  id?: string
}

export type CheckboxRootEmits = {
  'update:checked': [value: boolean]
}

interface CheckboxRootContext {
  disabled: Ref<boolean>
  state: Ref<CheckedState>
}

export const [injectCheckboxRootContext, provideCheckboxRootContext]
  = createContext<CheckboxRootContext>('CheckboxRoot')
</script>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import { Primitive, usePrimitiveElement } from '@/Primitive'
import { getState, isIndeterminate } from './utils'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<CheckboxRootProps>(), {
  checked: undefined,
  value: 'on',
  as: 'button',
})
const emits = defineEmits<CheckboxRootEmits>()

const checked = useVModel(props, 'checked', emits, {
  defaultValue: props.defaultChecked,
  passive: (props.checked === undefined) as false,
}) as Ref<CheckedState>

const { primitiveElement, currentElement } = usePrimitiveElement()
const isFormControl = useFormControl(currentElement)
const ariaLabel = computed(() => props.id && currentElement.value
  ? (document.querySelector(`[for="${props.id}"]`) as HTMLLabelElement)?.innerText
  : undefined)

provideCheckboxRootContext({
  disabled: toRef(props, 'disabled'),
  state: checked,
})
</script>

<template>
  <Primitive
    v-bind="$attrs"
    :id="id"
    ref="primitiveElement"
    role="checkbox"
    :as-child="props.asChild"
    :as="as"
    :type="as === 'button' ? 'button' : undefined"
    :aria-checked="isIndeterminate(checked) ? 'mixed' : checked"
    :aria-required="false"
    :aria-label="$attrs['aria-label'] || ariaLabel"
    :data-state="getState(checked)"
    :data-disabled="disabled ? '' : undefined"
    :disabled="disabled"
    @keydown.enter.prevent="() => {
      // According to WAI ARIA, Checkboxes don't activate on enter keypress
    }"
    @click="checked = !checked"
  >
    <slot />
  </Primitive>

  <input
    v-if="isFormControl"
    type="checkbox"
    tabindex="-1"
    aria-hidden
    :value="value"
    :checked="!!checked"
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
