<script lang="ts">
import type { Ref } from 'vue'
import type { Direction } from '@/shared/types'
import type { PrimitiveProps } from '@/Primitive'
import { createContext, useFormControl, useId } from '@/shared'
import { createCollection } from '@/Collection'
import { useConfig } from '@/ConfigProvider'

export type AcceptableValue = string | number | boolean | object
type ArrayOrWrapped<T> = T extends any[] ? T : Array<T>

type ComboboxRootContext<T> = {
  modelValue: Ref<T | Array<T>>
  onValueChange: (val: T) => void
  searchTerm: Ref<string>
  multiple: Ref<boolean>
  disabled: Ref<boolean>
  open: Ref<boolean>
  onOpenChange: (value: boolean) => void
  isUserInputted: Ref<boolean>
  filteredOptions: Ref<Array<T>>
  contentId: string
  contentElement: Ref<HTMLElement | undefined>
  onContentElementChange: (el: HTMLElement) => void
  inputElement: Ref<HTMLInputElement | undefined>
  onInputElementChange: (el: HTMLInputElement) => void
  onInputNavigation: (dir: 'up' | 'down' | 'home' | 'end') => void
  onInputEnter: () => void
  selectedValue: Ref<T | undefined>
  onSelectedValueChange: (val: T) => void
  parentElement: Ref<HTMLElement | undefined>
}

export const [injectComboboxRootContext, provideComboboxRootContext]
  = createContext<ComboboxRootContext<AcceptableValue>>('ComboboxRoot')

export type ComboboxRootEmits<T = AcceptableValue> = {
  'update:modelValue': [value: T]
  'update:open': [value: boolean]
  'update:searchTerm': [value: string]
}

export interface ComboboxRootProps<T = AcceptableValue> extends PrimitiveProps {
  modelValue?: T
  defaultValue?: T
  open?: boolean
  defaultOpen?: boolean
  searchTerm?: string
  multiple?: boolean
  disabled?: boolean
  name?: string
  dir?: Direction
  filterFunction?: (val: ArrayOrWrapped<T>, term: string) => ArrayOrWrapped<T>
  displayValue?: (val: T) => string
}
</script>

<script setup lang="ts" generic="T extends AcceptableValue = AcceptableValue">
import { computed, nextTick, ref, toRef, watch } from 'vue'
import { PopperRoot } from '@/Popper'
import { Primitive, usePrimitiveElement } from '@/Primitive'
import { computedWithControl, useVModel } from '@vueuse/core'
import { VisuallyHiddenInput } from '@/VisuallyHidden'
import isEqual from 'fast-deep-equal'

const props = withDefaults(defineProps<ComboboxRootProps<T>>(), {
  open: undefined,
})
const emit = defineEmits<ComboboxRootEmits<T>>()

const config = useConfig()
const dir = computed(() => props.dir || config.dir.value)

const searchTerm = useVModel(props, 'searchTerm', emit, {
  // @ts-expect-error ignore the type error here
  defaultValue: '',
  passive: (props.searchTerm === undefined) as false,
}) as Ref<string>

const modelValue = useVModel(props, 'modelValue', emit, {
  // @ts-expect-error ignore the type error here
  defaultValue: props.defaultValue ?? props.multiple ? [] : undefined,
  passive: (props.modelValue === undefined) as false,
  deep: true,
}) as Ref<T>

const open = useVModel(props, 'open', emit, {
  defaultValue: props.defaultOpen,
  passive: (props.open === undefined) as false,
}) as Ref<boolean>

const selectedValue = ref<T>()

async function onOpenChange(val: boolean) {
  open.value = val
  await nextTick()
  if (val) {
    if (modelValue.value) {
      if (Array.isArray(modelValue.value) && props.multiple)
        selectedValue.value = (getItems().find(i => (i.ref)?.dataset?.state === 'checked'))?.value
      else
        selectedValue.value = modelValue.value as T
    }
    inputElement.value?.focus()
    scrollSelectedValueIntoView()
  }
  else {
    isUserInputted.value = false
    resetSearchTerm()
  }
}

function onValueChange(val: T) {
  if (Array.isArray(modelValue.value) && props.multiple) {
    const index = modelValue.value.findIndex(i => isEqual(i, val))
    index === -1 ? modelValue.value.push(val) : modelValue.value.splice(index, 1)
  }
  else {
    modelValue.value = val
    onOpenChange(false)
  }
}

const isUserInputted = ref(false)

const inputElement = ref<HTMLInputElement>()
const contentElement = ref<HTMLElement>()
const { primitiveElement, currentElement: parentElement } = usePrimitiveElement()
const { getItems, reactiveItems, itemMapSize } = createCollection<{ value: T }>('data-radix-vue-combobox-item')

const options = computedWithControl(() => itemMapSize.value, () => {
  return getItems().map(i => i.value)
})

const filteredOptions = computed(() => {
  if (isUserInputted.value) {
    if (props.filterFunction)
      return props.filterFunction(options.value as ArrayOrWrapped<T>, searchTerm.value) as T[]

    else if (typeof options.value[0] === 'string')
      return options.value.filter(i => (i as string).toLowerCase().includes(searchTerm.value?.toLowerCase()))
  }
  return options.value
})

function resetSearchTerm() {
  if (!props.multiple && modelValue.value) {
    if (props.displayValue)
      searchTerm.value = props.displayValue(modelValue.value)
    else if (typeof modelValue.value !== 'object')
      searchTerm.value = modelValue.value.toString()
    else
      searchTerm.value = ''
  }
  else {
    searchTerm.value = ''
  }
}

const activeIndex = computed(() => filteredOptions.value.findIndex(i => isEqual(i, selectedValue.value)))
const selectedElement = computed(() => {
  return reactiveItems.value.find(i => i.value === selectedValue.value)?.ref
})

// nextTick() are required in the following watchers as we are waiting for DOM element to be mounted first the only apply following logic
watch(modelValue, async () => {
  await nextTick()
  resetSearchTerm()
}, { immediate: true })

watch(() => filteredOptions.value.length, async (length) => {
  await nextTick()
  await nextTick()
  if (length && activeIndex.value === -1)
    selectedValue.value = filteredOptions.value[0]
})

const isFormControl = useFormControl(parentElement)

function scrollSelectedValueIntoView() {
  // Find the highlighted element and scroll into view
  // We can put this in Item, but we avoid having too many watcher
  if (selectedElement.value instanceof Element)
    selectedElement.value.scrollIntoView({ block: 'nearest' })
}

provideComboboxRootContext({
  searchTerm,
  modelValue,
  // @ts-expect-error igoring
  onValueChange,
  isUserInputted,
  multiple: toRef(props, 'multiple'),
  disabled: toRef(props, 'disabled'),
  open,
  onOpenChange,
  filteredOptions,
  contentId: useId(),
  inputElement,
  onInputElementChange: val => inputElement.value = val,
  onInputNavigation: async (val) => {
    const index = activeIndex.value

    if ((index === 0 && val === 'up') || (index === (filteredOptions.value.length - 1) && val === 'down'))
      return

    if ((index === -1 && filteredOptions.value.length) || val === 'home')
      selectedValue.value = filteredOptions.value[0]

    else if (val === 'end')
      selectedValue.value = filteredOptions.value[filteredOptions.value.length - 1]

    else
      selectedValue.value = filteredOptions.value[val === 'up' ? index - 1 : index + 1]

    scrollSelectedValueIntoView()
  },
  onInputEnter: async () => {
    if (filteredOptions.value.length && selectedValue.value && selectedElement.value instanceof Element)
      selectedElement.value?.click()
  },
  selectedValue,
  onSelectedValueChange: val => selectedValue.value = val as T,
  parentElement,
  contentElement,
  onContentElementChange: val => contentElement.value = val,
})
</script>

<template>
  <PopperRoot>
    <Primitive
      ref="primitiveElement"
      :style="{
        pointerEvents: open ? 'auto' : undefined,
      }"
      :as="as"
      :as-child="asChild"
      :dir="dir"
      v-bind="$attrs"
    >
      <slot
        :active-index="activeIndex"
        :open="open"
        :value="modelValue"
      />

      <VisuallyHiddenInput v-if="isFormControl && name" :name="name" :value="modelValue" />
    </Primitive>
  </PopperRoot>
</template>
