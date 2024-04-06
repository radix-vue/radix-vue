<script lang="ts">
import { useVModel } from '@vueuse/core'
import { Primitive, type PrimitiveProps } from '..'
import { injectListboxRootContext } from './ListboxRoot.vue'
import { onMounted } from 'vue'
import { usePrimitiveElement } from '@/Primitive'

export interface ListboxFilterProps extends PrimitiveProps {
  modelValue?: string
  /** Focus on element when mounted. */
  autoFocus?: boolean
}

export type ListboxFilterEmits = {
  'update:modelValue': [string]
}
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<ListboxFilterProps>(), {
  as: 'input',
})
const emits = defineEmits<ListboxFilterEmits>()
const modelValue = useVModel(props, 'modelValue', emits, {
  defaultValue: '',
  passive: (props.modelValue === undefined) as false,
})

const rootContext = injectListboxRootContext()
rootContext.focusable.value = false

const { primitiveElement, currentElement } = usePrimitiveElement()
onMounted(() => {
  setTimeout(() => {
    // make sure all DOM was flush then only capture the focus
    if (props.autoFocus)
      currentElement.value?.focus()
  }, 1)
})
</script>

<template>
  <Primitive
    ref="primitiveElement"
    :as="as"
    :as-child="asChild"
    :value="modelValue"
    @keydown.down.up.home.end.prevent="rootContext.onKeydownNavigation"
    @keydown.enter="rootContext.onKeydownEnter"
    @input="(event: InputEvent) => {
      modelValue = (event.target as HTMLInputElement).value
    }"
  >
    <slot />
  </Primitive>
</template>