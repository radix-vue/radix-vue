<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { CalendarCell, CalendarDay, CalendarGrid, CalendarGridBody, CalendarGridHead, CalendarGridRow, CalendarHeadCell, CalendarHeader, CalendarNext, CalendarPrev, CalendarRoot } from '../'
import { type Ref, ref } from 'vue'
import { type DateValue, getLocalTimeZone, today } from '@internationalized/date'

import CalendarSelect from './_CalendarSelect.vue'

import { useDateFormatter } from '@/shared'

const formatter = useDateFormatter('en')

const value = ref<DateValue>()
const placeholder = ref(today(getLocalTimeZone())) as Ref<DateValue>
const selectedMonth = ref(placeholder.value.month)
const selectedYear = ref(placeholder.value.year)

const years = ['2020', '2021', '2022', '2023', '2024']

function setPlaceholder(date: DateValue) {
  placeholder.value = date
  selectedMonth.value = date.month
  selectedYear.value = date.year
}

function setYear(year: string) {
  selectedYear.value = Number.parseInt(year)
  placeholder.value = placeholder.value.set({ year: Number.parseInt(year) })
}

function setMonth(month: string) {
  selectedMonth.value = Number.parseInt(month)
  placeholder.value = placeholder.value.set({ month: Number.parseInt(month) })
}
</script>

<template>
  <Story title="Calendar/Select" :layout="{ type: 'single' }">
    <Variant title="default">
      <CalendarRoot
        v-slot="{ weekDays, months }"
        v-model="value"
        :placeholder="placeholder"
        class="mt-6 rounded-[15px] border border-black bg-white p-[22px] shadow-md"
        fixed-weeks
        @update:placeholder="setPlaceholder"
      >
        <CalendarHeader class="flex items-center justify-between">
          <CalendarPrev
            class="inline-flex items-center cursor-pointer text-black justify-center rounded-[9px] bg-transparent w-10 h-10 hover:bg-black hover:text-white active:scale-98 active:transition-all"
          >
            <Icon icon="radix-icons:chevron-left" class="w-6 h-6" />
          </CalendarPrev>
          <CalendarSelect
            :options="formatter.getMonths()"
            :model-value="selectedMonth.toString()"
            @update:model-value="setMonth"
          />

          <CalendarSelect
            :options="years.map(item => ({ label: item, value: parseInt(item) }))"
            :model-value="selectedYear.toString()"
            @update:model-value="setYear"
          />

          <CalendarNext
            class="inline-flex items-center cursor-pointer justify-center text-black rounded-[9px] bg-transparent w-10 h-10 hover:bg-black hover:text-white active:scale-98 active:transition-all"
          >
            <Icon icon="radix-icons:chevron-right" class="w-6 h-6" />
          </CalendarNext>
        </CalendarHeader>
        <div
          class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-x-4 sm:space-y-0"
        >
          <CalendarGrid v-for="month in months" :key="month.value.toString()" class="w-full border-collapse select-none space-y-1">
            <CalendarGridHead>
              <CalendarGridRow class="mb-1 flex w-full justify-between">
                <CalendarHeadCell
                  v-for="day in weekDays" :key="day"
                  class="w-10 rounded-md text-xs !font-normal text-black"
                >
                  <div>{{ day.slice(0, 2) }}</div>
                </CalendarHeadCell>
              </CalendarGridRow>
            </CalendarGridHead>
            <CalendarGridBody>
              <CalendarGridRow v-for="(weekDates, index) in month.weeks" :key="`weekDate-${index}`" class="flex w-full">
                <CalendarCell
                  v-for="weekDate in weekDates"
                  :key="weekDate.toString()"
                  :date="weekDate"
                  class="relative !p-0 text-center text-sm w-10 h-10"
                >
                  <CalendarDay
                    :day="weekDate"
                    :month="month.value"
                    class="group relative inline-flex items-center justify-center whitespace-nowrap rounded-[9px] border border-transparent bg-transparent p-0 text-sm font-normal text-black w-10 h-10 hover:border-black data-[disabled]:pointer-events-none data-[outside-month]:pointer-events-none data-[selected]:bg-black data-[selected]:font-medium data-[disabled]:text-black/30 data-[selected]:text-white data-[unavailable]:text-black/30 data-[unavailable]:line-through"
                  >
                    <div
                      class="absolute top-[5px] hidden rounded-full w-1 h-1 group-data-[today]:block group-data-[today]:bg-grass9 group-data-[selected]:bg-white"
                    />
                    {{ weekDate.day }}
                  </CalendarDay>
                </CalendarCell>
              </CalendarGridRow>
            </CalendarGridBody>
          </CalendarGrid>
        </div>
      </CalendarRoot>
    </Variant>
  </Story>
</template>