<script setup lang="ts">
import { usePrimitiveElement } from '@/Primitive'
import SliderImpl from './SliderImpl.vue'
import { computed, ref } from 'vue'
import type { SliderOrientationPrivateEmits, SliderOrientationPrivateProps } from './utils'
import { BACK_KEYS, linearScale, provideSliderOrientationContext } from './utils'

interface SliderVerticalProps extends SliderOrientationPrivateProps {}
const props = defineProps<SliderVerticalProps>()
const emits = defineEmits<SliderOrientationPrivateEmits>()

const { primitiveElement, currentElement: sliderElement } = usePrimitiveElement()

const rectRef = ref<ClientRect>()
const isSlidingFromBottom = computed(() => !props.inverted)

function getValueFromPointer(pointerPosition: number) {
  const rect = rectRef.value || sliderElement.value!.getBoundingClientRect()
  const input: [number, number] = [0, rect.height]
  const output: [number, number] = isSlidingFromBottom.value ? [props.max, props.min] : [props.min, props.max]
  const value = linearScale(input, output)

  rectRef.value = rect
  return value(pointerPosition - rect.top)
}

provideSliderOrientationContext({
  startEdge: isSlidingFromBottom.value ? 'bottom' : 'top',
  endEdge: isSlidingFromBottom.value ? 'top' : 'bottom',
  size: 'height',
  direction: isSlidingFromBottom.value ? 1 : -1,
})
</script>

<template>
  <SliderImpl
    ref="primitiveElement"
    data-orientation="vertical"
    :style="{
      ['--radix-slider-thumb-transform' as any]: 'translateY(50%)',
    }"
    @slide-start="(event) => {
      const value = getValueFromPointer(event.clientY);
      emits('slideStart', value)
    }"
    @slide-move="(event) => {
      const value = getValueFromPointer(event.clientY);
      emits('slideMove', value)
    }"
    @slide-end="() => {
      rectRef = undefined;
      emits('slideEnd')
    }"
    @step-key-down="(event) => {
      const slideDirection = isSlidingFromBottom ? 'from-bottom' : 'from-top';
      const isBackKey = BACK_KEYS[slideDirection].includes(event.key);
      emits('stepKeyDown', event, isBackKey ? -1 : 1)
    }"
    @end-key-down="emits('endKeyDown', $event)"
    @home-key-down="emits('homeKeyDown', $event)"
  >
    <slot />
  </SliderImpl>
</template>
