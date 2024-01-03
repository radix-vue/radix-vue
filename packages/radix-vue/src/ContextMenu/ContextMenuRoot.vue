<script lang="ts">
import type { Ref } from 'vue'
import type { Direction } from '@/shared/types'
import { createContext } from '@/shared'
import { useConfig } from '@/ConfigProvider'

type ContextMenuRootContext = {
  open: Ref<boolean>
  onOpenChange(open: boolean): void
  modal: Ref<boolean>
  dir: Ref<Direction>
}

export interface ContextMenuRootProps {
  dir?: Direction
  modal?: boolean
}
export type ContextMenuRootEmits = {
  'update:open': [value: boolean]
}

export const [injectContextMenuRootContext, provideContextMenuRootContext]
  = createContext<ContextMenuRootContext>('ContextMenuRoot')
</script>

<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { MenuRoot } from '@/Menu'

const props = withDefaults(defineProps<ContextMenuRootProps>(), {
  modal: true,
})
const emits = defineEmits<ContextMenuRootEmits>()
const config = useConfig()
const dir = computed(() => props.dir || config.dir.value)

const open = ref(false)

provideContextMenuRootContext({
  open,
  onOpenChange: (value: boolean) => {
    open.value = value
    emits('update:open', value)
  },
  dir,
  modal: toRef(props, 'modal'),
})
</script>

<template>
  <MenuRoot v-model:open="open" :dir="dir" :modal="modal">
    <slot />
  </MenuRoot>
</template>
