<script lang="ts">
import type { Ref, VNode } from 'vue'
import type { DataOrientation, Direction } from '../shared/types'
import { createContext, useFormControl, useId } from '@/shared'
import { useConfig } from '@/ConfigProvider'

export interface SelectRootProps {
  open?: boolean
  defaultOpen?: boolean
  defaultValue?: string
  modelValue?: string
  orientation?: DataOrientation
  dir?: Direction
  name?: string
  autocomplete?: string
  disabled?: boolean
  required?: boolean
}
export type SelectRootEmits = {
  'update:modelValue': [value: string]
  'update:open': [value: boolean]
}

export interface SelectRootContext {
  triggerElement: Ref<HTMLElement | undefined>
  onTriggerChange(node: HTMLElement | undefined): void
  valueElement: Ref<HTMLElement | undefined>
  onValueElementChange(node: HTMLElement): void
  valueElementHasChildren: Ref<boolean>
  onValueElementHasChildrenChange(hasChildren: boolean): void
  contentId: string
  modelValue?: Ref<string>
  onValueChange(value: string): void
  open: Ref<boolean>
  required?: Ref<boolean>
  onOpenChange(open: boolean): void
  dir: Ref<Direction>
  triggerPointerDownPosRef: Ref<{ x: number; y: number } | null>
  disabled?: Ref<boolean>
}

export const [injectSelectRootContext, provideSelectRootContext]
  = createContext<SelectRootContext>('SelectRoot')

export interface SelectNativeOptionsContext {
  onNativeOptionAdd(option: VNode): void
  onNativeOptionRemove(option: VNode): void
}

export const [injectSelectNativeOptionsContext, provideSelectNativeOptionsContext]
  = createContext<SelectNativeOptionsContext>('SelectRoot')
</script>

<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import BubbleSelect from './BubbleSelect.vue'
import { PopperRoot } from '@/Popper'
import { useVModel } from '@vueuse/core'

const props = withDefaults(defineProps<SelectRootProps>(), {
  orientation: 'vertical',
  defaultValue: '',
  modelValue: undefined,
  open: undefined,
})

const emits = defineEmits<SelectRootEmits>()

const modelValue = useVModel(props, 'modelValue', emits, {
  defaultValue: props.defaultValue,
  passive: (props.modelValue === undefined) as false,
}) as Ref<string>

const open = useVModel(props, 'open', emits, {
  defaultValue: props.defaultOpen,
  passive: (props.open === undefined) as false,
}) as Ref<boolean>

const triggerElement = ref<HTMLElement>()
const valueElement = ref<HTMLElement>()
const triggerPointerDownPosRef = ref({
  x: 0,
  y: 0,
})
const valueElementHasChildren = ref(false)

const config = useConfig()
const dir = computed(() => props.dir || config.dir.value)

provideSelectRootContext({
  triggerElement,
  onTriggerChange: (node) => {
    triggerElement.value = node
  },
  valueElement,
  onValueElementChange: (node) => {
    valueElement.value = node
  },
  valueElementHasChildren,
  onValueElementHasChildrenChange: (hasChildren) => {
    valueElementHasChildren.value = hasChildren
  },
  contentId: useId(),
  modelValue,
  onValueChange: (value) => {
    modelValue.value = value
  },
  open,
  required: toRef(props, 'required'),
  onOpenChange: (value) => {
    open.value = value
  },
  dir,
  triggerPointerDownPosRef,
  disabled: toRef(props, 'disabled'),
})

const isFormControl = useFormControl(triggerElement)
const nativeOptionsSet = ref<Set<VNode>>(new Set())

// The native `select` only associates the correct default value if the corresponding
// `option` is rendered as a child **at the same time** as itself.
// Because it might take a few renders for our items to gather the information to build
// the native `option`(s), we generate a key on the `select` to make sure Vue re-builds it
// each time the options change.
const nativeSelectKey = computed(() => {
  return Array.from(nativeOptionsSet.value)
    .map(option => option.props?.value)
    .join(';')
})

provideSelectNativeOptionsContext({
  onNativeOptionAdd: (option) => {
    nativeOptionsSet.value.add(option)
  },
  onNativeOptionRemove: (option) => {
    nativeOptionsSet.value.delete(option)
  },
})
</script>

<template>
  <PopperRoot>
    <slot />

    <BubbleSelect
      v-if="isFormControl"
      :key="nativeSelectKey"
      v-bind="$attrs"
      aria-hidden
      tabindex="-1"
      :required="required"
      :name="name"
      :autocomplete="autocomplete"
      :disabled="disabled"
      :value="modelValue"
      @change="modelValue = $event.target.value"
    >
      <option v-if="modelValue === undefined" value="" />
      <component
        v-bind="option.props"
        :is="option"
        v-for="option in Array.from(nativeOptionsSet)"
        :key="option.key ?? ''"
      />
    </BubbleSelect>
  </PopperRoot>
</template>
