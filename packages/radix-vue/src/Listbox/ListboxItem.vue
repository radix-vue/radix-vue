<script lang="ts">
import { createContext, handleAndDispatchCustomEvent, useForwardExpose, useId } from '@/shared'

export interface ListboxItemProps<T = AcceptableValue> extends PrimitiveProps {
  /** The value given as data when submitted with a `name`. */
  value: T
  /** When `true`, prevents the user from interacting with the item. */
  disabled?: boolean
}
export type SelectEvent<T> = CustomEvent<{ originalEvent: PointerEvent, value?: T }>

export type ListboxItemEmits<T = AcceptableValue> = {
  /** Event handler called when the selecting item. <br> It can be prevented by calling `event.preventDefault`. */
  select: [event: SelectEvent<T>]
}

const LISTBOX_SELECT = 'listbox.select'

interface ListboxItemContext {
  isSelected: Ref<boolean>
}

export const [injectListboxItemContext, provideListboxItemContext]
  = createContext<ListboxItemContext>('ListboxItem')
</script>

<script setup lang="ts"  generic="T extends AcceptableValue = AcceptableValue">
import { injectListboxRootContext } from './ListboxRoot.vue'
import { type Ref, computed } from 'vue'
import { Primitive, type PrimitiveProps } from '..'
import { valueComparator } from './utils'
import { CollectionItem } from '@/Collection'
import type { AcceptableValue } from '@/shared/types'

const props = withDefaults(defineProps<ListboxItemProps>(), {
  as: 'div',
})
const emits = defineEmits<ListboxItemEmits>()

const { forwardRef, currentElement } = useForwardExpose()
const id = useId(undefined, 'radix-vue-listbox-item')
const rootContext = injectListboxRootContext()

const isHighlighted = computed(() => currentElement.value === rootContext.highlightedElement.value)
const isSelected = computed(() => valueComparator(rootContext.modelValue.value, props.value, rootContext.by))

const disabled = computed(() => rootContext.disabled.value || props.disabled)

async function handleSelect(ev: SelectEvent<T>) {
  emits('select', ev)
  if (ev?.defaultPrevented)
    return

  if (!disabled.value && ev) {
    rootContext.onValueChange(props.value)
    rootContext.onChangeHighlight(ev.target as HTMLElement)
  }
}

function handleSelectCustomEvent(ev: PointerEvent) {
  const eventDetail = { originalEvent: ev, value: props.value as T }
  handleAndDispatchCustomEvent(LISTBOX_SELECT, handleSelect, eventDetail)
}

provideListboxItemContext({
  isSelected,
})
</script>

<template>
  <CollectionItem :value="value">
    <Primitive
      :id="id"
      :ref="forwardRef"
      role="option"
      :tabindex="rootContext.focusable.value ? isHighlighted ? '0' : '-1' : undefined"
      :aria-selected="isSelected"
      :as="as"
      :as-child="asChild"
      :disabled="disabled ? '' : undefined"
      :data-disabled="disabled ? '' : undefined"
      :data-highlighted="isHighlighted ? '' : undefined"
      :data-state="isSelected ? 'checked' : 'unchecked'"
      @click="handleSelectCustomEvent"
      @keydown.space.prevent="handleSelectCustomEvent"
      @pointermove="(event) => {
        if (rootContext.highlightOnHover.value)
          rootContext.onChangeHighlight(currentElement)
        else
          rootContext.focusable.value ? undefined : rootContext.onChangeHighlight(currentElement)
      }"
    >
      <slot />
    </Primitive>
  </CollectionItem>
</template>
