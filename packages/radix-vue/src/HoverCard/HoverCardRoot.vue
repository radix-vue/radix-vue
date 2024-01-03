<script lang="ts">
import type { Ref } from 'vue'
import { createContext } from '@/shared'

export interface HoverCardRootProps {
  defaultOpen?: false
  open?: boolean
  openDelay?: number
  closeDelay?: number
}
export type HoverCardRootEmits = {
  'update:open': [value: boolean]
}

export interface HoverCardRootContext {
  open: Ref<boolean>
  onOpenChange(open: boolean): void
  onOpen(): void
  onClose(): void
  onDismiss(): void
  hasSelectionRef: Ref<boolean>
  isPointerDownOnContentRef: Ref<boolean>
}

export const [injectHoverCardRootContext, provideHoverCardRootContext]
  = createContext<HoverCardRootContext>('HoverCardRoot')
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { useVModel } from '@vueuse/core'
import { PopperRoot } from '@/Popper'

const props = withDefaults(defineProps<HoverCardRootProps>(), {
  defaultOpen: false,
  open: undefined,
  openDelay: 700,
  closeDelay: 300,
})
const emit = defineEmits<HoverCardRootEmits>()

const open = useVModel(props, 'open', emit, {
  defaultValue: props.defaultOpen,
  passive: (props.open === undefined) as false,
}) as Ref<boolean>

const openTimerRef = ref(0)
const closeTimerRef = ref(0)
const hasSelectionRef = ref(false)
const isPointerDownOnContentRef = ref(false)

function handleOpen() {
  clearTimeout(closeTimerRef.value)
  openTimerRef.value = window.setTimeout(
    () => open.value = true,
    props.openDelay,
  )
}

function handleClose() {
  clearTimeout(openTimerRef.value)
  if (!hasSelectionRef.value && !isPointerDownOnContentRef.value) {
    closeTimerRef.value = window.setTimeout(
      () => open.value = false,
      props.closeDelay,
    )
  }
}

function handleDismiss() {
  open.value = false
}

provideHoverCardRootContext({
  open,
  onOpenChange(value) {
    open.value = value
  },
  onOpen: handleOpen,
  onClose: handleClose,
  onDismiss: handleDismiss,
  hasSelectionRef,
  isPointerDownOnContentRef,
})
</script>

<template>
  <PopperRoot>
    <slot />
  </PopperRoot>
</template>
