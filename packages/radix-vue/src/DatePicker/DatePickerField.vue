<script lang="ts">
import { type DateValue, isEqualDay } from '@internationalized/date'
import { DateFieldRoot } from '..'
import { injectDatePickerRootContext } from './DatePickerRoot.vue'
</script>

<script setup lang="ts">
const rootContext = injectDatePickerRootContext()
</script>

<template>
  <DateFieldRoot
    v-slot="{ segments }"
    :ref="rootContext.dateFieldRef"
    :model-value="rootContext.modelValue.value"
    :placeholder="rootContext.placeholder.value"
    v-bind="{
      id: rootContext.id.value,
      name: rootContext.name.value,
      disabled: rootContext.disabled.value,
      minValue: rootContext.minValue.value,
      maxValue: rootContext.maxValue.value,
      readonly: rootContext.readonly.value,
      hourCycle: rootContext.hourCycle.value,
      granularity: rootContext.granularity.value,
      hideTimeZone: rootContext.hideTimeZone.value,
      locale: rootContext.locale.value,
      isDateUnavailable: rootContext.isDateUnavailable,
      required: rootContext.required.value,
    }"
    @update:model-value="(date: DateValue | undefined) => {
      if (date && rootContext.modelValue.value && isEqualDay(rootContext.modelValue.value, date) && date.compare(rootContext.modelValue.value) === 0) return
      rootContext.onDateChange(date)
    }"
    @update:placeholder="(date: DateValue) => {
      if (isEqualDay(rootContext.placeholder.value, date) && date.compare(rootContext.placeholder.value) === 0) return
      rootContext.onPlaceholderChange(date)
    }"
  >
    <slot :segments="segments" />
  </DateFieldRoot>
</template>
