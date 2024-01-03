<script setup lang="ts">
import { usePrimitiveElement } from '@/Primitive'
import SliderImpl from './SliderImpl.vue'
import { computed, ref } from 'vue'
import type { Direction, SliderOrientationPrivateEmits, SliderOrientationPrivateProps } from './utils'
import { BACK_KEYS, linearScale, provideSliderOrientationContext } from './utils'
import { useConfig } from '..'

interface SliderHorizontalProps extends SliderOrientationPrivateProps {
  dir?: Direction
}

const props = defineProps<SliderHorizontalProps>()
const emits = defineEmits<SliderOrientationPrivateEmits>()

const { primitiveElement, currentElement: sliderElement } = usePrimitiveElement()

const config = useConfig()
const dir = computed(() => props.dir || config.dir.value)

const rectRef = ref<ClientRect>()
const isSlidingFromLeft = computed(() => {
  return (dir.value === 'ltr' && !props.inverted) || (dir.value !== 'ltr' && props.inverted)
})

function getValueFromPointer(pointerPosition: number) {
  const rect = rectRef.value || sliderElement.value!.getBoundingClientRect()
  const input = [0, rect.width] as const
  const output = isSlidingFromLeft.value
    ? [props.min, props.max] as const
    : [props.max, props.min] as const
  const value = linearScale(input, output)

  rectRef.value = rect
  return value(pointerPosition - rect.left)
}

provideSliderOrientationContext({
  startEdge: isSlidingFromLeft.value ? 'left' : 'right',
  endEdge: isSlidingFromLeft.value ? 'right' : 'left',
  direction: isSlidingFromLeft.value ? 1 : -1,
  size: 'width',
})
</script>

<template>
  <SliderImpl
    ref="primitiveElement"
    :dir="dir"
    data-orientation="horizontal"
    :style="{
      ['--radix-slider-thumb-transform' as any]: 'translateX(-50%)',
    }"
    @slide-start="(event) => {
      const value = getValueFromPointer(event.clientX);
      emits('slideStart', value)
    }"
    @slide-move="(event) => {
      const value = getValueFromPointer(event.clientX);
      emits('slideMove', value)
    }"
    @slide-end="() => {
      rectRef = undefined;
      emits('slideEnd')
    }"
    @step-key-down="(event) => {
      const slideDirection = isSlidingFromLeft ? 'from-left' : 'from-right';
      const isBackKey = BACK_KEYS[slideDirection].includes(event.key);
      emits('stepKeyDown', event, isBackKey ? -1 : 1)
    }"
    @end-key-down="emits('endKeyDown', $event)"
    @home-key-down="emits('homeKeyDown', $event)"
  >
    <slot />
  </SliderImpl>
</template>
