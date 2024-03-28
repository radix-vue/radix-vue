<script lang="ts">
import type { Ref } from 'vue'
import type { PrimitiveProps } from '@/Primitive'
import { createContext, useForwardExpose, useId } from '@/shared'
import type { AcceptableValue } from './ComboboxRoot.vue'
import type { ListboxItemEmits } from '@/Listbox'
import { ListboxItem } from '@/Listbox'

export type SelectEvent<T> = CustomEvent<{ originalEvent: PointerEvent; value?: T }>
interface ComboboxItemContext {
  isSelected: Ref<boolean>
}

export const [injectComboboxItemContext, provideComboboxItemContext]
  = createContext<ComboboxItemContext>('ComboboxItem')

export type ComboboxItemEmits<T extends AcceptableValue = AcceptableValue> = ListboxItemEmits<T>

export interface ComboboxItemProps<T extends AcceptableValue = AcceptableValue> extends PrimitiveProps {
  /** The value given as data when submitted with a `name`. */
  value: T
  /** When `true`, prevents the user from interacting with the item. */
  disabled?: boolean
}
</script>

<script setup lang="ts" generic="T extends AcceptableValue = AcceptableValue">
import {
  computed,
  nextTick,
  ref,
  toRefs,
} from 'vue'
import { injectComboboxRootContext } from './ComboboxRoot.vue'
import { injectComboboxGroupContext } from './ComboboxGroup.vue'

import isEqual from 'fast-deep-equal'

const props = defineProps<ComboboxItemProps<T>>()
const emits = defineEmits<ComboboxItemEmits<T>>()

const { disabled } = toRefs(props)

const rootContext = injectComboboxRootContext()
const groupContext = injectComboboxGroupContext({ id: '', options: ref([]) })
const { forwardRef } = useForwardExpose()

const isSelected = computed(() =>
  rootContext.multiple.value && Array.isArray(rootContext.modelValue.value)
    ? rootContext.modelValue.value?.some(val => isEqual(val, props.value))
    : isEqual(rootContext.modelValue?.value, props.value),
)

const isFocused = computed(() => isEqual(rootContext.selectedValue.value, props.value))
const textId = useId(undefined, 'radix-vue-combobox-item')

const isInOption = computed(() =>
  rootContext.isUserInputted.value
    ? rootContext.searchTerm.value === ''
     || !!rootContext.filteredOptions.value.find(i => isEqual(i, props.value))
    : true)

async function handlePointerMove(event: PointerEvent) {
  await nextTick()
  if (event.defaultPrevented)
    return

  rootContext.onSelectedValueChange(props.value)
}

if (props.value === '') {
  throw new Error(
    'A <SelectItem /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.',
  )
}

provideComboboxItemContext({
  isSelected,
})
</script>

<template>
  <ListboxItem
    :ref="forwardRef"
    :value="props.value"
    :as="as"
    :as-child="asChild"
    tabindex="-1"
    @pointermove="handlePointerMove"
    @select="emits('select', $event as any)"
  >
    <slot>{{ value }}</slot>
  </ListboxItem>
</template>
