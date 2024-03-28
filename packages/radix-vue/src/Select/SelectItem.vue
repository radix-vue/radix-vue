<script lang="ts">
import type { Ref } from 'vue'
import type { PrimitiveProps } from '@/Primitive'
import { createContext, useForwardExpose, useId } from '@/shared'

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
  /** The value given as data when submitted with a `name`. */
  value: string
  /** When `true`, prevents the user from interacting with the item. */
  disabled?: boolean
  /** Optional text used for typeahead purposes.
   *
   * By default the typeahead behavior will use the `.textContent` of the `SelectItemText` part.
   *
   * Use this when the content is complex, or you have non-textual content inside. */
  textValue?: string
}
</script>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  ref,
  toRefs,
} from 'vue'
import { injectSelectRootContext } from './SelectRoot.vue'
import { SelectContentDefaultContextValue, injectSelectContentContext } from './SelectContentImpl.vue'
import { ListboxItem } from '@/Listbox'

const props = defineProps<SelectItemProps>()
const { disabled } = toRefs(props)

const rootContext = injectSelectRootContext()
const contentContext = injectSelectContentContext(SelectContentDefaultContextValue)
const { forwardRef, currentElement } = useForwardExpose()

const isSelected = computed(() => rootContext.modelValue?.value === props.value)
const isFocused = ref(false)
const textValue = ref(props.textValue ?? '')
const textId = useId(undefined, 'radix-vue-select-item-text')

async function handleSelect(ev?: PointerEvent) {
  await nextTick()
  if (ev?.defaultPrevented)
    return

  if (!disabled.value) {
    rootContext.onValueChange(props.value)
    rootContext.onOpenChange(false)
  }
}

async function handlePointerMove(event: PointerEvent) {
  await nextTick()
  if (event.defaultPrevented)
    return
  if (disabled.value) {
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
  disabled,
  textId,
  isSelected,
  onItemTextChange: (node) => {
    textValue.value = ((textValue.value || node?.textContent) ?? '').trim()
  },
})
</script>

<template>
  <ListboxItem
    :ref="forwardRef"
    :value="value"
    :disabled="disabled"
    :aria-labelledby="textId"
    :data-highlighted="isFocused ? '' : undefined"
    :tabindex="disabled ? undefined : -1"
    :as="as"
    :as-child="asChild"
    @focus="isFocused = true"
    @blur="isFocused = false"
    @select.prevent="(ev) => {
      if (rootContext.open.value) {

        console.log('selected?', ev)
        handleSelect(ev.detail.originalEvent)
      }
    }"
    @touchend.prevent.stop
    @pointermove="handlePointerMove"
    @pointerleave="handlePointerLeave"
  >
    <slot />
  </ListboxItem>
</template>
