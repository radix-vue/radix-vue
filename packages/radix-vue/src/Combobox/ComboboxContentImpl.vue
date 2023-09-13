<script lang="ts">
export type ComboboxContentImplEmits = {
  closeAutoFocus: [event: Event]
  /**
   * Event handler called when the escape key is down.
   * Can be prevented.
   */
  escapeKeyDown: [event: KeyboardEvent]
  /**
   * Event handler called when the a `pointerdown` event happens outside of the `DismissableLayer`.
   * Can be prevented.
   */
  pointerDownOutside: [event: PointerDownOutsideEvent]
}

export interface ComboboxContentImplProps extends PopperContentProps {
  position?: 'inline' | 'popper'
}
</script>

<script setup lang="ts">
import {
  computed,
  inject,
} from 'vue'
import { COMBOBOX_INJECT_KEY } from './ComboboxRoot.vue'
import {
  useBodyScrollLock,
  useHideOthers,
} from '@/shared'
import {
  DismissableLayer,
  type PointerDownOutsideEvent,
} from '@/DismissableLayer'
import { PopperContent, type PopperContentProps } from '@/Popper'
import { Primitive, usePrimitiveElement } from '@/Primitive'

const props = defineProps<ComboboxContentImplProps>()
const emits = defineEmits<ComboboxContentImplEmits>()

const context = inject(COMBOBOX_INJECT_KEY)

useBodyScrollLock(true)

const { primitiveElement, currentElement } = usePrimitiveElement()
useHideOthers(currentElement)

const pickedProps = computed(() => {
  if (props.position === 'popper')
    return props
  else return {}
})

function handleLeave() {
  context?.onSelectedValueChange('')
}
</script>

<template>
  <DismissableLayer
    as-child
    disable-outside-pointer-events
    @focus-outside.prevent
    @dismiss="context?.onOpenChange(false)"
    @escape-key-down="emits('escapeKeyDown', $event)"
    @pointer-down-outside="(ev) => {
      // if clicking inside the combobox, prevent dismiss
      if (context?.parentElement.value?.contains(ev.target as Node)) ev.preventDefault()
      emits('pointerDownOutside', ev)
    }"
  >
    <component
      :is="position === 'popper' ? PopperContent : Primitive "
      v-bind="{ ...$attrs, ...pickedProps }"
      :id="context?.contentId"
      ref="primitiveElement"
      role="listbox"
      :data-state="context?.open.value ? 'open' : 'closed'"
      :style="{
        // flex layout so we can place the scroll buttons properly
        display: 'flex',
        flexDirection: 'column',
        // reset the outline by default as the content MAY get focused
        outline: 'none',
      }"
      @pointerleave="handleLeave"
    >
      <slot />
    </component>
  </DismissableLayer>
</template>