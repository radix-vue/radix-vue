<script lang="ts">
import type { Ref } from 'vue'
import type { Direction } from './utils'
import { createContext } from '@/shared'
import { useConfig } from '@/ConfigProvider'

export interface MenuContext {
  open: Ref<boolean>
  onOpenChange(open: boolean): void
  content: Ref<HTMLElement | undefined>
  onContentChange(content: HTMLElement | undefined): void
}

export interface MenuRootContext {
  onClose(): void
  dir: Ref<Direction>
  isUsingKeyboardRef: Ref<boolean>
  modal: Ref<boolean>
}

export interface MenuProps {
  open?: boolean
  onOpenChange?(open: boolean): void
  dir?: Direction
  modal?: boolean
}

export const [injectMenuContext, provideMenuContext]
  = createContext<MenuContext>(['MenuRoot', 'MenuSub'], 'MenuContext')

export const [injectMenuRootContext, provideMenuRootContext]
  = createContext<MenuRootContext>('MenuRoot')
</script>

<script setup lang="ts">
import {
  computed,
  ref,
  toRef,
  watchEffect,
} from 'vue'
import { isClient } from '@vueuse/shared'
import { useVModel } from '@vueuse/core'
import { PopperRoot } from '@/Popper'

const props = withDefaults(defineProps<MenuProps>(), {
  open: false,
  modal: true,
})
const emits = defineEmits<{ 'update:open': [payload: boolean] }>()

const config = useConfig()
const dir = computed(() => props.dir || config.dir.value)

const open = useVModel(props, 'open', emits)

const content = ref<HTMLElement>()
const isUsingKeyboardRef = ref(false)

watchEffect((cleanupFn) => {
  if (!isClient)
    return
  // Capture phase ensures we set the boolean before any side effects execute
  // in response to the key or pointer event as they might depend on this value.
  const handleKeyDown = () => {
    isUsingKeyboardRef.value = true
    document.addEventListener('pointerdown', handlePointer, {
      capture: true,
      once: true,
    })
    document.addEventListener('pointermove', handlePointer, {
      capture: true,
      once: true,
    })
  }
  const handlePointer = () => (isUsingKeyboardRef.value = false)
  document.addEventListener('keydown', handleKeyDown, { capture: true })

  cleanupFn(() => {
    document.removeEventListener('keydown', handleKeyDown, { capture: true })
    document.removeEventListener('pointerdown', handlePointer, {
      capture: true,
    })
    document.removeEventListener('pointermove', handlePointer, {
      capture: true,
    })
  })
})

provideMenuContext({
  open,
  onOpenChange: (value) => {
    open.value = value
  },
  content,
  onContentChange: (element) => {
    content.value = element
  },
})

provideMenuRootContext({
  onClose: () => {
    open.value = false
  },
  isUsingKeyboardRef,
  dir,
  modal: toRef(props, 'modal'),
})
</script>

<template>
  <PopperRoot>
    <slot />
  </PopperRoot>
</template>
