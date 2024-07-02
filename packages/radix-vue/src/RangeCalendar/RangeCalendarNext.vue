<script lang="ts">
import type { PrimitiveProps } from '@/Primitive'
import type { CalendarIncrement } from '@/shared/date'
import type { DateValue } from '@internationalized/date'

export interface RangeCalendarNextProps extends PrimitiveProps {
/**
 * The calendar unit to go forward
 * @deprecated Use `nextPage` instead
 */
  step?: CalendarIncrement
  /** The function to be used for the next page. Overwrites the `nextPage` function set on the `RangeCalendarRoot`. */
  nextPage?: (placeholder: DateValue) => DateValue
}
</script>

<script setup lang="ts">
import { Primitive } from '@/Primitive'
import { injectRangeCalendarRootContext } from './RangeCalendarRoot.vue'

const props = withDefaults(defineProps<RangeCalendarNextProps>(), { as: 'button' })

const rootContext = injectRangeCalendarRootContext()
</script>

<template>
  <Primitive
    v-bind="props"
    aria-label="Next page"
    :type="as === 'button' ? 'button' : undefined"
    :aria-disabled="rootContext.isNextButtonDisabled(props.step, props.nextPage) || undefined"
    :data-disabled="rootContext.isNextButtonDisabled(props.step, props.nextPage) || undefined"
    :disabled="rootContext.isNextButtonDisabled(props.step, props.nextPage)"
    @click="rootContext.nextPage(props.step, props.nextPage)"
  >
    <slot>Next page</slot>
  </Primitive>
</template>
