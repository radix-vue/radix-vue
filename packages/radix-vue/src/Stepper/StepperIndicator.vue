<script lang="ts">
import { injectStepperItemContext } from './StepperItem.vue'
import type { PrimitiveProps } from '@/Primitive'
import { useForwardExpose } from '@/shared'
</script>

<script setup lang="ts">
import { Primitive } from '@/Primitive'

export interface StepperIndicatorProps extends PrimitiveProps { }

const props = defineProps<StepperIndicatorProps>()
const itemContext = injectStepperItemContext()
useForwardExpose()
</script>

<template>
  <Primitive
    v-bind="props"
  >
    <slot>
      Step {{ itemContext.step.value }}
    </slot>
  </Primitive>
</template>
