<script lang="ts">
import type { PrimitiveProps } from '@/Primitive'
import type { ImageLoadingStatus } from './utils'

export type AvatarImageEmits = {
  'loadingStatusChange': [value: ImageLoadingStatus]
}
export interface AvatarImageProps extends PrimitiveProps {
  src: string
}
</script>

<script setup lang="ts">
import { toRef, watch } from 'vue'
import { Primitive } from '../Primitive'
import { injectAvatarRootContext } from './AvatarRoot.vue'
import { useImageLoadingStatus } from './utils'

const props = withDefaults(defineProps<AvatarImageProps>(), { as: 'img' })
const emits = defineEmits<AvatarImageEmits>()

const src = toRef(props, 'src')
const rootContext = injectAvatarRootContext()

const imageLoadingStatus = useImageLoadingStatus(src)

watch(
  imageLoadingStatus,
  (newValue) => {
    emits('loadingStatusChange', newValue)
    if (newValue !== 'idle')
      rootContext.imageLoadingStatus.value = newValue
  },
  { immediate: true },
)
</script>

<template>
  <Primitive
    v-if="imageLoadingStatus === 'loaded'"
    role="img"
    :as-child="asChild"
    :as="as"
    :src="src"
  >
    <slot />
  </Primitive>
</template>
