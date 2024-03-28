<script lang="ts">
import { createContext, useForwardExpose, useTypeahead } from '@/shared'

type ListboxRootContext<T> = {
  modelValue: Ref<T | Array<T> | undefined>
  onValueChange: (val: T) => void
  multiple: Ref<boolean>
  disabled: Ref<boolean>
  containerElement: Ref<HTMLElement>
  highlightedElement: Ref<HTMLElement | null>
  isVirtual: Ref<boolean>
  virtualFocusHook: EventHook<Event | null>
  virtualKeydownHook: EventHook<KeyboardEvent>
  by?: keyof T | ((a: T, b: T) => boolean)
}

export const [injectListboxRootContext, provideListboxRootContext]
  = createContext<ListboxRootContext<AcceptableValue>>('ListboxRoot')

export interface ListboxRootProps<T = AcceptableValue> extends Pick<RovingFocusGroupProps, 'as' | 'asChild' | 'orientation' | 'dir' | 'loop'> {
  /** The controlled value of the listbox. Can be binded-with with `v-model`. */
  modelValue?: T | Array<T>
  /** The value of the listbox when initially rendered. Use when you do not need to control the state of the Listbox */
  defaultValue?: T | Array<T>
  /** Whether multiple options can be selected or not. */
  multiple?: boolean
  /** When `true`, prevents the user from interacting with listbox */
  disabled?: boolean
  selectionBehavior?: 'toggle' | 'replace'
  /** Use this to compare objects by a particular field, or pass your own comparison function for complete control over how objects are compared. */
  by?: keyof T | ((a: T, b: T) => boolean)
}

export type ListboxRootEmits<T = AcceptableValue> = {
  /** Event handler called when the value changes. */
  'update:modelValue': [value: T]
}
</script>

<script setup lang="ts" generic="T extends AcceptableValue = AcceptableValue">
import { RovingFocusGroup, type RovingFocusGroupProps } from '@/RovingFocus'
import { type EventHook, createEventHook, useVModel } from '@vueuse/core'
import { type AcceptableValue, compare, queryCheckedElement } from './utils'
import { type Ref, computed, nextTick, ref, toRefs, watch } from 'vue'

const props = withDefaults(defineProps<ListboxRootProps>(), {
  selectionBehavior: 'toggle',
})
const emits = defineEmits<ListboxRootEmits>()

const { multiple, disabled } = toRefs(props)
const { forwardRef, currentRef, currentElement: containerElement } = useForwardExpose()

const isUserAction = ref(false)
const modelValue = useVModel(props, 'modelValue', emits, {
  defaultValue: props.defaultValue ?? (multiple.value ? [] : undefined),
  passive: (props.modelValue === undefined) as false,
  deep: true,
}) as Ref<T | T[] | undefined>

function onValueChange(val: T) {
  isUserAction.value = true
  if (Array.isArray(modelValue.value)) {
    const index = modelValue.value.findIndex(i => compare(i, val, props.by))
    index === -1 ? modelValue.value.push(val) : modelValue.value.splice(index, 1)
    // TODO: add replace behavior for multiple
  }
  else {
    if (props.selectionBehavior === 'toggle') {
      if (compare(modelValue.value, val, props.by))
        modelValue.value = undefined
      else
        modelValue.value = val
    }
    else {
      modelValue.value = val
    }
  }
  setTimeout(() => {
    isUserAction.value = false
  }, 1)
}

const highlightedElement = ref<HTMLElement | null>(null)
const collectionItems = computed(() => (currentRef.value as InstanceType<typeof RovingFocusGroup>)?.collections ?? [])
const { handleTypeaheadSearch } = useTypeahead(collectionItems)

const isVirtual = ref(false)
const virtualFocusHook = createEventHook<Event | null>()
const virtualKeydownHook = createEventHook<KeyboardEvent>()

function handleFocus(event?: Event) {
  if (isVirtual.value) {
    virtualFocusHook.trigger(event)
  }
  else {
    const item = queryCheckedElement(containerElement.value)
    if (item && event) {
      item.focus()
      event.preventDefault()
    }
  }
}

// watch for only programmatic changes
watch(modelValue, () => {
  if (!isUserAction.value) {
    nextTick(() => {
      handleFocus()
    })
  }
}, { immediate: true, deep: true })

provideListboxRootContext({
  modelValue,
  // @ts-expect-error igoring
  onValueChange,
  multiple,
  disabled,
  containerElement,
  highlightedElement,
  isVirtual,
  virtualFocusHook,
  virtualKeydownHook,
  by: props.by,
})
</script>

<template>
  <RovingFocusGroup
    :ref="forwardRef"
    role="listbox"
    :as="as"
    :as-child="asChild"
    :loop="loop"
    :dir="dir"
    :orientation="orientation"
    enable-mutation-observer
    @entry-focus="handleFocus"
    @keydown="(ev: KeyboardEvent) => {
      if (isVirtual) {
        virtualKeydownHook.trigger(ev)
      }
      else {
        handleTypeaheadSearch(ev.key)
      }
    }"
  >
    <slot :model-value="modelValue" />
  </RovingFocusGroup>
</template>
