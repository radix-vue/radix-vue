<script lang="ts">
import type { PrimitiveProps } from '@/Primitive'

export interface ToastCloseProps extends PrimitiveProps {}
</script>

<script setup lang="ts">
import { Primitive } from '@/Primitive'
import ToastAnnounceExclude from './ToastAnnounceExclude.vue'
import { injectToastRootContext } from './ToastRootImpl.vue'

const props = withDefaults(defineProps<ToastCloseProps>(), {
  as: 'button',
})

const rootContext = injectToastRootContext()
</script>

<template>
  <ToastAnnounceExclude as-child>
    <Primitive
      v-bind="props"
      :type="as === 'button' ? 'button' : undefined "
      @click="rootContext.onClose()"
    >
      <slot />
    </Primitive>
  </ToastAnnounceExclude>
</template>
