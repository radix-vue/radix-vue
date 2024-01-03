<script lang="ts">
import type { Ref } from 'vue'
import type { PrimitiveProps } from '@/Primitive'
import type { DataOrientation, Direction } from '../shared/types'
import { createContext } from '@/shared'
import { useConfig } from '@/ConfigProvider'

type TypeEnum = 'single' | 'multiple'

export interface ToggleGroupRootProps extends PrimitiveProps {
  type?: TypeEnum
  defaultValue?: string | string[]
  modelValue?: string | string[]
  rovingFocus?: boolean
  disabled?: boolean
  orientation?: DataOrientation
  dir?: Direction
  loop?: boolean
}
export type ToggleGroupRootEmits = {
  'update:modelValue': [payload: string]
}

interface ToggleGroupRootContext {
  type: TypeEnum
  modelValue: Ref<string | string[] | undefined>
  changeModelValue: (value: string) => void
  dir?: Ref<Direction>
  orientation?: DataOrientation
  loop: Ref<boolean>
  rovingFocus: Ref<boolean>
  disabled?: Ref<boolean>
}

export const [injectToggleGroupRootContext, provideToggleGroupRootContext]
  = createContext<ToggleGroupRootContext>('ToggleGroupRoot')
</script>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import { Primitive } from '@/Primitive'
import { useSingleOrMultipleValue } from '@/shared/useSingleOrMultipleValue'
import { RovingFocusGroup } from '@/RovingFocus'

const props = withDefaults(defineProps<ToggleGroupRootProps>(), {
  type: 'single',
  loop: true,
  rovingFocus: true,
  disabled: false,
})
const emits = defineEmits<ToggleGroupRootEmits>()

const config = useConfig()
const dir = computed(() => props.dir || config.dir.value)

const { modelValue, changeModelValue } = useSingleOrMultipleValue(props, emits)

provideToggleGroupRootContext({
  type: props.type,
  modelValue,
  changeModelValue,
  dir,
  orientation: props.orientation,
  loop: toRef(props, 'loop'),
  rovingFocus: toRef(props, 'rovingFocus'),
  disabled: toRef(props, 'disabled'),
})
</script>

<template>
  <component
    :is="rovingFocus ? RovingFocusGroup : Primitive"
    as-child
    :orientation="rovingFocus ? orientation : undefined"
    :dir="dir"
    :loop="rovingFocus ? loop : undefined"
  >
    <Primitive role="group" :as-child="asChild" :as="as">
      <slot :model-value="modelValue" />
    </Primitive>
  </component>
</template>
