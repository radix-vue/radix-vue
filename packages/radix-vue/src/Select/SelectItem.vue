<script lang="ts">
import type { Ref } from 'vue'
import type { PrimitiveProps } from '@/Primitive'
import { createContext, useId } from '@/shared'

interface SelectItemContext {
  value: string
  textId: string
  disabled: Ref<boolean>
  isSelected: Ref<boolean>
  onItemTextChange(node: HTMLElement | undefined): void
}

export const [injectSelectItemContext, provideSelectItemContext]
  = createContext<SelectItemContext>('SelectItem')

export interface SelectItemProps extends PrimitiveProps {
  value: string
  disabled?: boolean
  textValue?: string
}
</script>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  ref,
  toRef,
} from 'vue'
import { injectSelectRootContext } from './SelectRoot.vue'
import { SelectContentDefaultContextValue, injectSelectContentContext } from './SelectContentImpl.vue'
import { SELECTION_KEYS } from './utils'
import {
  Primitive,
  usePrimitiveElement,
} from '@/Primitive'

const props = defineProps<SelectItemProps>()

const rootContext = injectSelectRootContext()
const contentContext = injectSelectContentContext(SelectContentDefaultContextValue)
const { primitiveElement, currentElement } = usePrimitiveElement()

const isSelected = computed(() => rootContext.modelValue?.value === props.value)
const isFocused = ref(false)
const textValue = ref(props.textValue ?? '')
const textId = useId()

async function handleSelect(ev?: PointerEvent) {
  await nextTick()
  if (ev?.defaultPrevented)
    return

  if (!props.disabled) {
    rootContext.onValueChange(props.value)
    rootContext.onOpenChange(false)
  }
}

async function handlePointerMove(event: PointerEvent) {
  await nextTick()
  if (event.defaultPrevented)
    return
  if (props.disabled) {
    contentContext.onItemLeave?.()
  }
  else {
    // even though safari doesn't support this option, it's acceptable
    // as it only means it might scroll a few pixels when using the pointer.
    (event.currentTarget as HTMLElement).focus({ preventScroll: true })
  }
}

async function handlePointerLeave(event: PointerEvent) {
  await nextTick()
  if (event.defaultPrevented)
    return
  if (event.currentTarget === document.activeElement)
    contentContext.onItemLeave?.()
}

async function handleKeyDown(event: KeyboardEvent) {
  await nextTick()
  if (event.defaultPrevented)
    return
  const isTypingAhead = contentContext.searchRef?.value !== ''
  if (isTypingAhead && event.key === ' ')
    return
  if (SELECTION_KEYS.includes(event.key))
    handleSelect()
  // prevent page scroll if using the space key to select an item
  if (event.key === ' ')
    event.preventDefault()
}

if (props.value === '') {
  throw new Error(
    'A <SelectItem /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.',
  )
}

onMounted(() => {
  if (!currentElement.value)
    return
  contentContext.itemRefCallback(
    currentElement.value,
    props.value,
    props.disabled,
  )
})

provideSelectItemContext({
  value: props.value,
  disabled: toRef(props, 'disabled'),
  textId,
  isSelected,
  onItemTextChange: (node) => {
    textValue.value = ((textValue.value || node?.textContent) ?? '').trim()
  },
})
</script>

<template>
  <Primitive
    ref="primitiveElement"
    role="option"
    data-radix-vue-collection-item
    :aria-labelledby="textId"
    :data-highlighted="isFocused ? '' : undefined"
    :aria-selected="isSelected && isFocused"
    :data-state="isSelected ? 'checked' : 'unchecked'"
    :aria-disabled="disabled || undefined"
    :data-disabled="disabled ? '' : undefined"
    :tabindex="disabled ? undefined : -1"
    :as="as"
    :as-child="asChild"
    @focus="isFocused = true"
    @blur="isFocused = false"
    @pointerup="handleSelect"
    @touchend.prevent.stop
    @pointermove="handlePointerMove"
    @pointerleave="handlePointerLeave"
    @keydown="handleKeyDown"
  >
    <slot />
  </Primitive>
</template>
