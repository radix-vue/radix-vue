/*
  * Adapted from https://github.com/melt-ui/melt-ui/blob/develop/src/lib/builders/range-calendar/create.ts
*/

import { type DateValue, isSameDay } from '@internationalized/date'
import { type Ref, computed } from 'vue'
import { areAllDaysBetweenValid, isBefore, isBetween } from '@/shared/date'
import type { Matcher } from '@/shared/date'

export type UseRangeCalendarProps = {
  start: Ref<DateValue | undefined>
  end: Ref<DateValue | undefined>
  isDateDisabled: Matcher
  isDateUnavailable: Matcher
  focusedValue: Ref<DateValue | undefined>
}

export function useRangeCalendarState(props: UseRangeCalendarProps) {
  const isStartInvalid = computed(() => {
    if (!props.start.value)
      return false
    if (props.isDateDisabled(props.start.value))
      return true
    return false
  })

  const isEndInvalid = computed(() => {
    if (!props.end.value)
      return false
    if (props.isDateDisabled(props.end.value))
      return true
    return false
  })

  const isInvalid = computed(
    () => {
      if (isStartInvalid.value || isEndInvalid.value)
        return false
      if (props.start.value && props.end.value && isBefore(props.end.value, props.start.value))
        return true
      return false
    },
  )

  const isSelectionStart = (date: DateValue) => {
    if (!props.start.value || !props.end.value)
      return false
    return isSameDay(props.start.value, date)
  }

  const isSelectionEnd = (date: DateValue) => {
    if (!props.end.value || !props.start.value)
      return false
    return isSameDay(props.end.value, date)
  }

  const isSelected = (date: DateValue) => {
    if (props.start.value && isSameDay(props.start.value, date))
      return true
    if (props.end.value && isSameDay(props.end.value, date))
      return true
    if (props.end.value && props.start.value)
      return isBetween(date, props.start.value, props.end.value)

    return false
  }

  const highlightedRange = computed(() => {
    if (props.start.value && props.end.value)
      return null
    if (!props.start.value || !props.focusedValue.value)
      return null

    const isStartBeforeFocused = isBefore(props.start.value, props.focusedValue.value)
    const start = isStartBeforeFocused ? props.start.value : props.focusedValue.value
    const end = isStartBeforeFocused ? props.focusedValue.value : props.start.value

    if (isSameDay(start.add({ days: 1 }), end)) {
      return {
        start,
        end,
      }
    }

    const isValid = areAllDaysBetweenValid(start, end, props.isDateUnavailable, props.isDateDisabled)
    if (isValid) {
      return {
        start,
        end,
      }
    }
    return null
  })

  return {
    isInvalid,
    isSelected,
    highlightedRange,
    isSelectionStart,
    isSelectionEnd,
  }
}
