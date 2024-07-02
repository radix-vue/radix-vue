<script lang="ts">
import type { PrimitiveProps } from '@/Primitive'
import type { CalendarIncrement } from '@/shared/date'
import type { DateValue } from '@internationalized/date'

export interface RangeCalendarPrevProps extends PrimitiveProps {
/**
 * The calendar unit to go forward
 * @deprecated Use `prevPage` instead
 */
  step?: CalendarIncrement
  /** The function to be used for the prev page. Overwrites the `prevPage` function set on the `RangeCalendarRoot`. */
  prevPage?: (placeholder: DateValue) => DateValue
}
</script>

<script setup lang="ts">
import { Primitive } from '@/Primitive'
import { injectRangeCalendarRootContext } from './RangeCalendarRoot.vue'

const props = withDefaults(defineProps<RangeCalendarPrevProps>(), { as: 'button' })

const rootContext = injectRangeCalendarRootContext()
</script>

<template>
  <Primitive
    v-bind="props"
    aria-label="Previous page"
    :type="as === 'button' ? 'button' : undefined"
    :aria-disabled="rootContext.isPrevButtonDisabled(props.step, props.prevPage) || undefined"
    :data-disabled="rootContext.isPrevButtonDisabled(props.step, props.prevPage) || undefined"
    :disabled="rootContext.isPrevButtonDisabled(props.step, props.prevPage)"
    @click="rootContext.prevPage(props.step, props.prevPage)"
  >
    <slot>Prev page</slot>
  </Primitive>
</template>
