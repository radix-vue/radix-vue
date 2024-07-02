<script lang="ts">
import type { PrimitiveProps } from '@/Primitive'
import type { CalendarIncrement } from '@/shared/date'
import type { DateValue } from '@internationalized/date'

export interface CalendarPrevProps extends PrimitiveProps {
/**
 * The calendar unit to go back
 * @deprecated Use `prevPage` instead
 */
  step?: CalendarIncrement
  /** The function to be used for the prev page. Overwrites the `prevPage` function set on the `CalendarRoot`. */
  prevPage?: (placeholder: DateValue) => DateValue
}
</script>

<script setup lang="ts">
import { Primitive } from '@/Primitive'
import { injectCalendarRootContext } from './CalendarRoot.vue'

const props = withDefaults(defineProps<CalendarPrevProps>(), { as: 'button', step: 'month' })

const rootContext = injectCalendarRootContext()
</script>

<template>
  <Primitive
    aria-label="Previous page"
    :as="props.as"
    :as-child="props.asChild"
    :type="as === 'button' ? 'button' : undefined"
    :aria-disabled="rootContext.isPrevButtonDisabled(props.step, props.prevPage) || undefined"
    :data-disabled="rootContext.isPrevButtonDisabled(props.step, props.prevPage) || undefined"
    :disabled="rootContext.isPrevButtonDisabled(props.step, props.prevPage)"
    @click="rootContext.prevPage(props.step, props.prevPage)"
  >
    <slot>Prev page</slot>
  </Primitive>
</template>
