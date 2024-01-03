<script lang="ts">
import type { Ref } from 'vue'
import { createContext, useId } from '@/shared'

export interface DialogRootProps {
  open?: boolean
  defaultOpen?: boolean
  modal?: boolean
}

export type DialogRootEmits = {
  'update:open': [value: boolean]
}

export interface DialogRootContext {
  open: Readonly<Ref<boolean>>
  modal: Ref<boolean>
  openModal(): void
  onOpenChange(value: boolean): void
  onOpenToggle(): void
  triggerElement: Ref<HTMLElement | undefined>
  contentElement: Ref<HTMLElement | undefined>
  contentId: string
  titleId: string
  descriptionId: string
}

export const [injectDialogRootContext, provideDialogRootContext]
  = createContext<DialogRootContext>('DialogRoot')
</script>

<script setup lang="ts">
import { ref, toRef } from 'vue'
import { useVModel } from '@vueuse/core'

const props = withDefaults(defineProps<DialogRootProps>(), {
  open: undefined,
  defaultOpen: false,
  modal: true,
})
const emit = defineEmits<DialogRootEmits>()

const open = useVModel(props, 'open', emit, {
  defaultValue: props.defaultOpen,
  passive: (props.open === undefined) as false,
}) as Ref<boolean>

const triggerElement = ref<HTMLElement>()
const contentElement = ref<HTMLElement>()

provideDialogRootContext({
  open,
  modal: toRef(props, 'modal'),
  openModal: () => {
    open.value = true
  },
  onOpenChange: (value) => {
    open.value = value
  },
  onOpenToggle: () => {
    open.value = !open.value
  },
  contentId: useId(),
  titleId: useId(),
  descriptionId: useId(),
  triggerElement,
  contentElement,
})
</script>

<template>
  <slot />
</template>
