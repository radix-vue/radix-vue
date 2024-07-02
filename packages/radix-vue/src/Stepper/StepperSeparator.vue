<script lang="ts">
import { injectStepperRootContext } from './StepperRoot.vue'
import { Separator, type SeparatorProps } from '@/Separator'
import { useForwardExpose } from '@/shared'
import { injectStepperItemContext } from './StepperItem.vue'
</script>

<script setup lang="ts">
export interface StepperSeparatorProps extends SeparatorProps { }

const props = withDefaults(defineProps<StepperSeparatorProps>(), {})

const rootContext = injectStepperRootContext()
const itemContext = injectStepperItemContext()

useForwardExpose()
</script>

<template>
  <Separator
    v-bind="props"
    decorative
    :orientation="rootContext.orientation.value"
    :data-state="itemContext.state.value"
  >
    <slot />
  </Separator>
</template>
