<script lang="ts">
import type { PrimitiveProps } from '@/Primitive'
import { useForwardExpose } from '@/shared'

export interface ComboboxInputProps extends PrimitiveProps {
  /** Native input type */
  type?: string
  /** When `true`, prevents the user from interacting with item */
  disabled?: boolean
  /** Focus on element when mounted. */
  autoFocus?: boolean
}
</script>

<script setup lang="ts">
import { computed, onMounted, ref, watchSyncEffect } from 'vue'
import { injectComboboxRootContext } from './ComboboxRoot.vue'
import { Primitive } from '@/Primitive'

const props = withDefaults(defineProps<ComboboxInputProps>(), {
  type: 'text',
  as: 'input',
})

const rootContext = injectComboboxRootContext()

const { forwardRef, currentElement } = useForwardExpose()
onMounted(() => {
  const inputEl = currentElement.value.nodeName === 'INPUT'
    ? currentElement.value as HTMLInputElement
    : currentElement.value.querySelector('input')
  if (!inputEl)
    return

  rootContext.onInputElementChange(inputEl)

  setTimeout(() => {
    // make sure all DOM was flush then only capture the focus
    if (props.autoFocus)
      inputEl?.focus()
  }, 1)
})

const disabled = computed(() => props.disabled || rootContext.disabled.value || false)

// This is a hack to prevent Vue from throwing "max recursion" errors.
const activedescendant = ref<string | undefined>()
watchSyncEffect(() => activedescendant.value = rootContext.selectedElement.value?.id)

function handleKeyDown(ev: KeyboardEvent) {
  if (!rootContext.open.value)
    rootContext.onOpenChange(true)
  else
    rootContext.onInputNavigation(ev.key === 'ArrowUp' ? 'up' : 'down')
}

function handleHomeEnd(ev: KeyboardEvent) {
  // allow text selection while maintaining `shift` key
  if(ev.shiftKey)
    return

  ev.preventDefault()

  if (!rootContext.open.value)
    return
  rootContext.onInputNavigation(ev.key === 'Home' ? 'home' : 'end')
}

function handleInput(event: Event) {
  rootContext.searchTerm.value = (event.target as HTMLInputElement)?.value
  if (!rootContext.open.value)
    rootContext.onOpenChange(true)

  rootContext.isUserInputted.value = true
}
</script>

<template>
  <Primitive
    :ref="forwardRef"
    :as="as"
    :as-child="asChild"
    :type="type"
    :disabled="disabled"
    :value="rootContext.searchTerm.value"
    :aria-expanded="rootContext.open.value"
    :aria-controls="rootContext.contentId"
    :aria-disabled="disabled ?? undefined"
    :aria-activedescendant="activedescendant"
    aria-autocomplete="list"
    role="combobox"
    autocomplete="false"
    @input="handleInput"
    @keydown.down.up.prevent="handleKeyDown"
    @keydown.enter="rootContext.onInputEnter"
    @keydown.home.end="handleHomeEnd"
  >
    <slot />
  </Primitive>
</template>
