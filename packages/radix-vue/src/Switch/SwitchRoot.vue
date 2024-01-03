<script lang="ts">
import type { Ref } from 'vue'
import type { PrimitiveProps } from '@/Primitive'
import { createContext, useFormControl } from '@/shared'

export interface SwitchRootProps extends PrimitiveProps {
  defaultChecked?: boolean
  checked?: boolean
  disabled?: boolean
  required?: boolean
  name?: string
  id?: string
  value?: string
}

export type SwitchRootEmits = {
  'update:checked': [payload: boolean]
}

export interface SwitchRootContext {
  checked?: Ref<boolean>
  toggleCheck: () => void
  disabled: Ref<boolean>
}

export const [injectSwitchRootContext, provideSwitchRootContext]
  = createContext<SwitchRootContext>('SwitchRoot')
</script>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useVModel } from '@vueuse/core'
import { Primitive, usePrimitiveElement } from '@/Primitive'

const props = withDefaults(defineProps<SwitchRootProps>(), {
  as: 'button',
  checked: undefined,
  value: 'on',
})
const emit = defineEmits<SwitchRootEmits>()

const checked = useVModel(props, 'checked', emit, {
  defaultValue: props.defaultChecked,
  passive: (props.checked === undefined) as false,
}) as Ref<boolean>

function toggleCheck() {
  if (props.disabled)
    return

  checked.value = !checked.value
}

const { primitiveElement, currentElement } = usePrimitiveElement()
const isFormControl = useFormControl(currentElement)
const ariaLabel = computed(() => props.id && currentElement.value ? (document.querySelector(`[for="${props.id}"]`) as HTMLLabelElement)?.innerText : undefined)

provideSwitchRootContext({
  checked,
  toggleCheck,
  disabled: toRef(props, 'disabled'),
})
</script>

<template>
  <Primitive
    v-bind="$attrs"
    :id="id"
    ref="primitiveElement"
    role="switch"
    :type="as === 'button' ? 'button' : undefined"
    :value="value"
    :aria-label="$attrs['aria-label'] || ariaLabel"
    :aria-checked="checked"
    :aria-required="required"
    :data-state="checked ? 'checked' : 'unchecked'"
    :data-disabled="disabled ? '' : undefined"
    :as-child="asChild"
    :as="as"
    :disabled="disabled"
    @click="toggleCheck"
    @keydown.enter.prevent="toggleCheck"
  >
    <slot />
  </Primitive>

  <input
    v-if="isFormControl"
    type="checkbox"
    :name="name"
    tabindex="-1"
    aria-hidden
    :disabled="disabled"
    :required="required"
    :value="value"
    :checked="!!checked"
    :data-state="checked ? 'checked' : 'unchecked'"
    :data-disabled="disabled ? '' : undefined"
    :style="{
      transform: 'translateX(-100%)',
      position: 'absolute',
      pointerEvents: 'none',
      opacity: 0,
      margin: 0,
    }"
  >
</template>
