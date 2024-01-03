<script lang="ts">
import type { Ref } from 'vue'
import type { Direction } from '../shared/types'
import { createContext, useId } from '@/shared'
import { useConfig } from '@/ConfigProvider'

export interface DropdownMenuRootProps {
  open?: boolean
  defaultOpen?: boolean
  dir?: Direction
  modal?: boolean
}
export type DropdownMenuRootEmits = {
  'update:open': [value: boolean]
}

export interface DropdownMenuRootContext {
  open: Readonly<Ref<boolean>>
  onOpenChange(open: boolean): void
  onOpenToggle(): void
  triggerId: string
  triggerElement: Ref<HTMLElement | undefined>
  contentId: string
  modal: Ref<boolean>
  dir: Ref<Direction>
}

export const [injectDropdownMenuRootContext, provideDropdownMenuRootContext]
  = createContext<DropdownMenuRootContext>('DropdownMenuRoot')
</script>

<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { useVModel } from '@vueuse/core'
import { MenuRoot } from '@/Menu'

const props = withDefaults(defineProps<DropdownMenuRootProps>(), {
  modal: true,
  open: undefined,
})
const emit = defineEmits<DropdownMenuRootEmits>()

const open = useVModel(props, 'open', emit, {
  defaultValue: props.defaultOpen,
  passive: (props.open === undefined) as false,
}) as Ref<boolean>

const triggerElement = ref<HTMLElement>()

const config = useConfig()
const dir = computed(() => props.dir || config.dir.value)
provideDropdownMenuRootContext({
  open,
  onOpenChange: (value) => {
    open.value = value
  },
  onOpenToggle: () => {
    open.value = !open.value
  },
  triggerId: useId(),
  triggerElement,
  contentId: useId(),
  modal: toRef(props, 'modal'),
  dir,
})
</script>

<template>
  <MenuRoot v-model:open="open" :dir="dir" :modal="modal">
    <slot />
  </MenuRoot>
</template>
