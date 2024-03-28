<script lang="ts">
import { type DateValue, isEqualDay, isSameDay } from '@internationalized/date'

import type { Ref } from 'vue'
import type { PrimitiveProps } from '@/Primitive'
import { type Formatter, createContext } from '@/shared'

import { useCalendar, useCalendarState } from './useCalendar'
import { createDecade, createYear, getDefaultDate, handleCalendarInitialFocus } from '@/shared/date'
import type { Grid, Matcher, WeekDayFormat } from '@/shared/date'

type CalendarRootContext = {
  locale: Ref<string>
  modelValue: Ref<DateValue | DateValue[] | undefined>
  placeholder: Ref<DateValue>
  pagedNavigation: Ref<boolean>
  preventDeselect: Ref<boolean>
  weekStartsOn: Ref<0 | 1 | 2 | 3 | 4 | 5 | 6>
  weekdayFormat: Ref<WeekDayFormat>
  fixedWeeks: Ref<boolean>
  multiple: Ref<boolean>
  numberOfMonths: Ref<number>
  disabled: Ref<boolean>
  readonly: Ref<boolean>
  initialFocus: Ref<boolean>
  onDateChange: (date: DateValue) => void
  onPlaceholderChange: (date: DateValue) => void
  fullCalendarLabel: Ref<string>
  parentElement: Ref<HTMLElement | undefined>
  headingValue: Ref<string>
  isInvalid: Ref<boolean>
  nextPage: () => void
  prevPage: () => void
  isDateDisabled: Matcher
  isDateSelected: Matcher
  isDateUnavailable?: Matcher
  isOutsideVisibleView: (date: DateValue) => boolean
  isNextButtonDisabled: Ref<boolean>
  isPrevButtonDisabled: Ref<boolean>
  formatter: Formatter
}

interface BaseCalendarRootProps extends PrimitiveProps {
  /** The default value for the calendar */
  defaultValue?: DateValue
  /** The default placeholder date */
  defaultPlaceholder?: DateValue
  /** The placeholder date, which is used to determine what month to display when no date is selected. This updates as the user navigates the calendar and can be used to programatically control the calendar view */
  placeholder?: DateValue
  /** This property causes the previous and next buttons to navigate by the number of months displayed at once, rather than one month */
  pagedNavigation?: boolean
  /** Whether or not to prevent the user from deselecting a date without selecting another date first */
  preventDeselect?: boolean
  /** The day of the week to start the calendar on */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** The format to use for the weekday strings provided via the weekdays slot prop */
  weekdayFormat?: WeekDayFormat
  /** The accessible label for the calendar */
  calendarLabel?: string
  /** Whether or not to always display 6 weeks in the calendar */
  fixedWeeks?: boolean
  /** The maximum date that can be selected */
  maxValue?: DateValue
  /** The minimum date that can be selected */
  minValue?: DateValue
  /** The locale to use for formatting dates */
  locale?: string
  /** The number of months to display at once */
  numberOfMonths?: number
  /** Whether or not the calendar is disabled */
  disabled?: boolean
  /** Whether or not the calendar is readonly */
  readonly?: boolean
  /** If true, the calendar will focus the selected day, today, or the first day of the month depending on what is visible when the calendar is mounted */
  initialFocus?: boolean
  /** A function that returns whether or not a date is disabled */
  isDateDisabled?: Matcher
  /** A function that returns whether or not a date is unavailable */
  isDateUnavailable?: Matcher
}

interface MultipleCalendarRootProps extends BaseCalendarRootProps {
  /** The controlled checked state of the calendar. Can be bound as `v-model`. */
  modelValue?: DateValue[] | undefined
  /** Whether or not multiple dates can be selected */
  multiple: true
}

interface SingleCalendarRootProps extends BaseCalendarRootProps {
  /** The controlled checked state of the calendar. Can be bound as `v-model`. */
  modelValue?: DateValue | undefined
  /** Whether or not multiple dates can be selected */
  multiple?: false
}

export type CalendarRootProps = MultipleCalendarRootProps | SingleCalendarRootProps

export type CalendarRootEmits = {
  /** Event handler called whenever the model value changes */
  'update:modelValue': [date: DateValue | undefined]
  /** Event handler called whenever the placeholder value changes */
  'update:placeholder': [date: DateValue]
}

export const [injectCalendarRootContext, provideCalendarRootContext]
  = createContext<CalendarRootContext>('CalendarRoot')
</script>

<script setup lang="ts">
import { computed, onMounted, toRefs, watch } from 'vue'
import { Primitive, usePrimitiveElement } from '@/Primitive'
import { useMemoize, useVModel } from '@vueuse/core'

const props = withDefaults(defineProps<CalendarRootProps>(), {
  defaultValue: undefined,
  as: 'div',
  pagedNavigation: false,
  preventDeselect: false,
  weekStartsOn: 0,
  weekdayFormat: 'narrow',
  fixedWeeks: false,
  multiple: false,
  numberOfMonths: 1,
  disabled: false,
  readonly: false,
  initialFocus: false,
  placeholder: undefined,
  locale: 'en',
  isDateDisabled: undefined,
  isDateUnavailable: undefined,
})
const emits = defineEmits<CalendarRootEmits>()
defineSlots<{
  default(props: {
    /** The current date of the placeholder */
    date: DateValue
    /** The grid of dates */
    grid: Grid<DateValue>[]
    /** The days of the week */
    weekDays: string[]
    /** The formatter used inside the calendar for displaying dates */
    formatter: Formatter
    /** The months that can be selected */
    getMonths: DateValue[]
    /** The years that can be selected */
    getYears: ({ startIndex, endIndex }: { startIndex?: number; endIndex: number }) => DateValue[]
  }): any
}>()

const {
  locale,
  disabled,
  readonly,
  initialFocus,
  pagedNavigation,
  weekStartsOn,
  weekdayFormat,
  fixedWeeks,
  multiple,
  minValue,
  maxValue,
  numberOfMonths,
  preventDeselect,
  isDateDisabled: propsIsDateDisabled,
  isDateUnavailable: propsIsDateUnavailable,
  calendarLabel,
} = toRefs(props)

const { primitiveElement, currentElement: parentElement }
  = usePrimitiveElement()

const modelValue = useVModel(props, 'modelValue', emits, {
  defaultValue: props.defaultValue ?? undefined,
  passive: (props.modelValue === undefined) as false,
}) as Ref<DateValue | DateValue[] | undefined>

const defaultDate = getDefaultDate({
  defaultPlaceholder: props.placeholder,
  defaultValue: modelValue.value,
})

const placeholder = useVModel(props, 'placeholder', emits, {
  defaultValue: props.defaultPlaceholder ?? defaultDate.copy(),
  passive: (props.placeholder === undefined) as false,
}) as Ref<DateValue>

function onPlaceholderChange(value: DateValue) {
  placeholder.value = value.copy()
}

const {
  fullCalendarLabel,
  headingValue,
  isDateDisabled,
  isDateUnavailable,
  isNextButtonDisabled,
  isPrevButtonDisabled,
  weekdays,
  isOutsideVisibleView,
  nextPage,
  prevPage,
  formatter,
  grid,
} = useCalendar({
  locale,
  placeholder,
  weekStartsOn: props.weekStartsOn,
  fixedWeeks: props.fixedWeeks,
  numberOfMonths: props.numberOfMonths,
  minValue,
  maxValue,
  disabled,
  weekdayFormat: props.weekdayFormat,
  pagedNavigation: props.pagedNavigation,
  isDateDisabled: propsIsDateDisabled.value,
  isDateUnavailable: propsIsDateUnavailable.value,
  calendarLabel: calendarLabel.value,
})

const {
  isInvalid,
  isDateSelected,
} = useCalendarState({
  date: modelValue,
  isDateDisabled,
  isDateUnavailable,
})

watch(modelValue, (value) => {
  if (Array.isArray(value) && value.length) {
    const lastValue = value[value.length - 1]
    if (lastValue && !isEqualDay(placeholder.value, lastValue))
      onPlaceholderChange(lastValue)
  }
  else if (!Array.isArray(value) && value && !isEqualDay(placeholder.value, value)) {
    onPlaceholderChange(value)
  }
})

function onDateChange(value: DateValue) {
  if (!multiple.value) {
    if (!modelValue.value) {
      modelValue.value = value.copy()
      return
    }

    if (!preventDeselect.value && isEqualDay(modelValue.value as DateValue, value)) {
      placeholder.value = value.copy()
      modelValue.value = undefined
    }
    else { modelValue.value = value.copy() }
  }
  else if (Array.isArray(modelValue.value)) {
    if (!modelValue.value) {
      modelValue.value = [value.copy()]

      return
    }

    const index = modelValue.value.findIndex(date => isSameDay(date, value))
    if (index === -1) {
      modelValue.value = [...modelValue.value, value]
    }
    else if (!preventDeselect.value) {
      const next = modelValue.value.filter(date => !isSameDay(date, value))
      if (!next.length) {
        placeholder.value = value.copy()
        modelValue.value = undefined
        return
      }
      modelValue.value = next.map(date => date.copy())
    }
  }
}

const getMonths = computed(() => {
  const dateObj = placeholder.value.copy()
  return createYear({
    dateObj,
    maxValue: minValue.value,
    minValue: maxValue.value,
    numberOfMonths: numberOfMonths.value,
    pagedNavigation: pagedNavigation.value,
  })
})

const getYears = useMemoize(({ startIndex, endIndex }: { startIndex?: number; endIndex: number }) => {
  const dateObj = placeholder.value.copy()
  return createDecade({
    dateObj,
    startIndex,
    endIndex,
    maxValue: minValue.value,
    minValue: maxValue.value,
  })
})

onMounted(() => {
  if (initialFocus.value)
    handleCalendarInitialFocus(parentElement.value)
})

provideCalendarRootContext({
  isDateUnavailable,
  isDateDisabled,
  locale,
  formatter,
  modelValue,
  placeholder,
  disabled,
  initialFocus,
  pagedNavigation,
  weekStartsOn,
  weekdayFormat,
  fixedWeeks,
  multiple,
  numberOfMonths,
  readonly,
  preventDeselect,
  fullCalendarLabel,
  headingValue,
  isInvalid,
  isDateSelected,
  isNextButtonDisabled,
  isPrevButtonDisabled,
  isOutsideVisibleView,
  nextPage,
  prevPage,
  parentElement,
  onPlaceholderChange,
  onDateChange,
})
</script>

<template>
  <Primitive
    ref="primitiveElement"
    :as="as"
    :as-child="asChild"
    role="application"
    :aria-label="fullCalendarLabel"
    :data-readonly="readonly ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-invalid="isInvalid ? '' : undefined"
  >
    <slot
      :date="placeholder"
      :grid="grid"
      :week-days="weekdays"
      :formatter="formatter"
      :get-months="getMonths"
      :get-years="getYears"
    />
    <div
      style="border: 0px; clip: rect(0px, 0px, 0px, 0px); clip-path: inset(50%); height: 1px; margin: -1px; overflow: hidden; padding: 0px; position: absolute; white-space: nowrap; width: 1px;"
    >
      <div role="heading" aria-level="2">
        {{ fullCalendarLabel }}
      </div>
    </div>
  </Primitive>
</template>
