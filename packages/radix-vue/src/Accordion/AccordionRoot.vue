<script lang="ts">
import type { ComputedRef, Ref } from 'vue'
import type { PrimitiveProps } from '@/Primitive'
import type { DataOrientation, Direction, Type } from '@/shared/types'
import { createContext } from '@/shared'
import { useConfig } from '@/ConfigProvider'

export interface AccordionRootProps extends PrimitiveProps {
  /**
   * Determines whether one or multiple items can be opened at the same time.
   */
  type: Type

  /**
   * The controlled value of the item to expand when type is "single" or the controlled values of the items to expand when type is "multiple".
   */
  modelValue?: string | string[]

  /**
   * The default value of the item to expand when type is "single" or the default values of the items to expand when type is "multiple".
   * Use when you do not need to control the state of the item(s).
   */
  defaultValue?: string | string[]

  /**
   * When type is "single", allows closing content when clicking trigger for an open item.
   * When type is "multiple", this prop has no effect.
   *
   * @default false
   */
  collapsible?: boolean

  /**
   * When true, prevents the user from interacting with the accordion and all its items
   *
   * @default false
   */
  disabled?: boolean

  /**
   * The reading direction of the accordion when applicable. If omitted, assumes LTR (left-to-right) reading mode.
   *
   * @default "ltr"
   */
  dir?: Direction

  /**
   * The orientation of the accordion.
   *
   * @default "vertical"
   */
  orientation?: DataOrientation
}

export type AccordionRootEmits = {
  'update:modelValue': [value: string | string[] | undefined]
}

export type AccordionRootContext = {
  disabled: Ref<AccordionRootProps['disabled']>
  direction: Ref<Direction>
  orientation: AccordionRootProps['orientation']
  parentElement: Ref<HTMLElement | undefined>
  changeModelValue(value: string): void
  isSingle: ComputedRef<boolean>
  modelValue: Ref<string | undefined | string[]>
  collapsible: boolean
}

export const [injectAccordionRootContext, provideAccordionRootContext]
  = createContext<AccordionRootContext>('AccordionRoot')
</script>

<script setup lang="ts">
import {
  Primitive,
  usePrimitiveElement,
} from '@/Primitive'
import { useSingleOrMultipleValue } from '@/shared/useSingleOrMultipleValue'
import { computed, toRef } from 'vue'

const props = withDefaults(defineProps<AccordionRootProps>(), {
  asChild: false,
  disabled: false,
  orientation: 'vertical',
  collapsible: false,
})
const emits = defineEmits<AccordionRootEmits>()
const config = useConfig()
const direction = computed(() => props.dir || config.dir.value)

const { modelValue, changeModelValue } = useSingleOrMultipleValue(props, emits)

const { primitiveElement, currentElement: parentElement }
  = usePrimitiveElement()

provideAccordionRootContext({
  disabled: toRef(props, 'disabled'),
  direction,
  orientation: props.orientation,
  parentElement,
  isSingle: computed(() => props.type === 'single'),
  collapsible: props.collapsible,
  modelValue,
  changeModelValue,
})

defineExpose({ modelValue })
</script>

<template>
  <Primitive ref="primitiveElement" :as-child="asChild" :as="as">
    <slot :model-value="modelValue" />
  </Primitive>
</template>
