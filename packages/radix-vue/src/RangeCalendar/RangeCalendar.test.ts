import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import RangeCalendar from './story/_RangeCalendar.vue'
import { mount } from '@vue/test-utils'
import { CalendarDate, CalendarDateTime, type DateValue, toZoned } from '@internationalized/date'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/vue'
import type { RangeCalendarRootProps } from './RangeCalendarRoot.vue'
import { useTestKbd } from '@/shared'

it('should pass axe accessibility tests', async () => {
  const wrapper = mount(RangeCalendar)
  expect(await axe(wrapper.element)).toHaveNoViolations()
})

const kbd = useTestKbd()

const calendarDateRange = {
  start: new CalendarDate(1980, 1, 20),
  end: new CalendarDate(1980, 1, 25),
}

const calendarDateTimeRange = {
  start: new CalendarDateTime(1980, 1, 20, 12, 30, 0, 0),
  end: new CalendarDateTime(1980, 1, 25, 12, 30, 0, 0),
}

const zonedDateTimeRange = {
  start: toZoned(calendarDateTimeRange.start, 'America/New_York'),
  end: toZoned(calendarDateTimeRange.end, 'America/New_York'),
}

const narrowWeekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const shortWeekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const longWeekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function getSelectedDays(calendar: HTMLElement) {
  return Array.from(calendar.querySelectorAll<HTMLElement>('[data-selected]'))
}

function setup(props: { calendarProps?: RangeCalendarRootProps; emits?: { 'onUpdate:modelValue'?: (data: DateValue) => void } } = {}) {
  const user = userEvent.setup()
  const returned = render(RangeCalendar, { props })
  const calendar = returned.getByTestId('calendar')
  expect(calendar).toBeVisible()
  return { ...returned, user, calendar }
}

it('should pass axe accessibility tests', async () => {
  const { calendar } = setup()
  expect(await axe(calendar)).toHaveNoViolations()
})

describe('RangeCalendar', () => {
  it('respects a default value if provided - `CalendarDate`', async () => {
    const { calendar, getByTestId } = setup({ calendarProps: { modelValue: calendarDateRange } })

    const selectedDays = calendar.querySelectorAll<HTMLElement>('[data-selected]')
    expect(selectedDays).toHaveLength(6)

    const heading = getByTestId('heading')
    expect(heading).toHaveTextContent('January 1980')
  })

  it('respects a default value if provided - `CalendarDateTime`', async () => {
    const { calendar, getByTestId } = setup({ calendarProps: { modelValue: calendarDateTimeRange } })

    const selectedDays = calendar.querySelectorAll<HTMLElement>('[data-selected]')
    expect(selectedDays).toHaveLength(6)

    const heading = getByTestId('heading')
    expect(heading).toHaveTextContent('January 1980')
  })

  it('respects a default value if provided - `ZonedDateTime`', async () => {
    const { calendar, getByTestId } = setup({ calendarProps: { modelValue: zonedDateTimeRange } })

    const selectedDays = calendar.querySelectorAll<HTMLElement>('[data-selected]')
    expect(selectedDays).toHaveLength(6)

    const heading = getByTestId('heading')
    expect(heading).toHaveTextContent('January 1980')
  })

  it('resets range on select when a range is already selected', async () => {
    const { getByTestId, calendar, user, rerender } = setup({
      calendarProps: { modelValue: calendarDateRange },
      emits: { 'onUpdate:modelValue': data => rerender({ calendarProps: { modelValue: data } }) },
    })

    let startValue = calendar.querySelector('[data-selection-start]')
    let endValue = calendar.querySelector('[data-selection-end]')

    expect(startValue).toHaveTextContent(String(calendarDateRange.start.day))
    expect(endValue).toHaveTextContent(String(calendarDateRange.end.day))

    const fifthDayInMonth = getByTestId('date-1-5')
    await user.click(fifthDayInMonth)
    expect(getByTestId('date-1-5')).toHaveAttribute('data-focused')

    const selectedDays = getSelectedDays(calendar)
    expect(selectedDays).toHaveLength(1)

    startValue = calendar.querySelector('[data-selection-start]')
    endValue = calendar.querySelector('[data-selection-end]')

    expect(startValue).not.toBeInTheDocument()
    expect(endValue).not.toBeInTheDocument()

    const seventhDayInMonth = getByTestId('date-1-7')
    await user.click(seventhDayInMonth)
    expect(getSelectedDays(calendar)).toHaveLength(3)
  })

  it('navigates the months forward using the next button', async () => {
    const { getByTestId, user } = setup({ calendarProps: { modelValue: calendarDateTimeRange } })

    const heading = getByTestId('heading')
    const nextBtn = getByTestId('next-button')

    for (const month of months) {
      expect(heading).toHaveTextContent(`${month} 1980`)
      await user.click(nextBtn)
    }
    expect(heading).toHaveTextContent('January 1981')
  })

  it('navigates the months backwards using the prev button', async () => {
    const { getByTestId, user } = setup({ calendarProps: { modelValue: calendarDateTimeRange } })

    const heading = getByTestId('heading')
    const prevBtn = getByTestId('prev-button')
    const newMonths = [...months].reverse()
    newMonths.pop()

    expect(heading).toHaveTextContent('January 1980')
    await user.click(prevBtn)

    for (const month of newMonths) {
      expect(heading).toHaveTextContent(`${month} 1979`)
      await user.click(prevBtn)
    }
    expect(heading).toHaveTextContent('January 1979')
  })

  it('always renders six weeks when `fixedWeeks` is `true`', async () => {
    const { getByTestId, calendar, user } = setup({
      calendarProps: {
        modelValue: calendarDateTimeRange,
        fixedWeeks: true,
      },
    })

    function getNumberOfWeeks() {
      return calendar.querySelectorAll('[data-week]').length
    }

    const nextButton = getByTestId('next-button')

    for (let i = 0; i < 12; i++) {
      expect(getNumberOfWeeks()).toBe(6)
      await user.click(nextButton)
    }

    for (let i = 0; i < 24; i++) {
      expect(getNumberOfWeeks()).toBe(6)
      await user.click(nextButton)
    }
  })

  it('should not allow navigation before the `minValue` (prev button)', async () => {
    const { getByTestId, user } = setup({
      calendarProps: {
        modelValue: calendarDateRange,
        minValue: new CalendarDate(1979, 11, 25),
      },
    })

    const prevBtn = getByTestId('prev-button')
    await user.click(prevBtn)
    const heading = getByTestId('heading')
    expect(heading).toHaveTextContent('December 1979')
    expect(prevBtn).not.toHaveAttribute('aria-disabled', 'true')
    expect(prevBtn).not.toHaveAttribute('data-disabled')

    await user.click(prevBtn)
    expect(heading).toHaveTextContent('November 1979')
    expect(prevBtn).toHaveAttribute('aria-disabled', 'true')
    expect(prevBtn).toHaveAttribute('data-disabled')

    await user.click(prevBtn)
    expect(heading).toHaveTextContent('November 1979')
  })

  it('should not allow navigation after the `maxValue` (next button)', async () => {
    const { getByTestId, user } = setup({
      calendarProps: {
        modelValue: calendarDateRange,
        maxValue: new CalendarDate(1980, 3, 25),
      },
    })

    const nextBtn = getByTestId('next-button')
    await user.click(nextBtn)
    const heading = getByTestId('heading')
    expect(heading).toHaveTextContent('February 1980')
    expect(nextBtn).not.toHaveAttribute('aria-disabled', 'true')
    expect(nextBtn).not.toHaveAttribute('data-disabled')

    await user.click(nextBtn)
    expect(heading).toHaveTextContent('March 1980')
    expect(nextBtn).toHaveAttribute('aria-disabled', 'true')
    expect(nextBtn).toHaveAttribute('data-disabled')

    await user.click(nextBtn)
    expect(heading).toHaveTextContent('March 1980')
  })

  it('does not navigate after `maxValue` (with keyboard)', async () => {
    const { getByTestId, user } = setup({
      calendarProps: {
        modelValue: calendarDateRange,
        maxValue: new CalendarDate(1980, 3, 31),
      },
    })

    const firstDayInMonth = getByTestId('date-1-1')
    firstDayInMonth.focus()
    expect(firstDayInMonth).toHaveFocus()

    const heading = getByTestId('heading')
    expect(heading).toHaveTextContent('January 1980')

    // five keypresses to February 1980
    await user.keyboard(kbd.ARROW_DOWN)
    expect(getByTestId('date-1-8')).toHaveFocus()
    await user.keyboard(kbd.ARROW_DOWN)
    expect(getByTestId('date-1-15')).toHaveFocus()
    await user.keyboard(kbd.ARROW_DOWN)
    expect(getByTestId('date-1-22')).toHaveFocus()
    await user.keyboard(kbd.ARROW_DOWN)
    expect(getByTestId('date-1-29')).toHaveFocus()
    await user.keyboard(kbd.ARROW_DOWN)
    expect(getByTestId('date-2-5')).toHaveFocus()
    expect(heading).toHaveTextContent('February 1980')

    // four keypresses to March 1980
    await user.keyboard(kbd.ARROW_DOWN)
    expect(getByTestId('date-2-12')).toHaveFocus()
    await user.keyboard(kbd.ARROW_DOWN)
    expect(getByTestId('date-2-19')).toHaveFocus()
    await user.keyboard(kbd.ARROW_DOWN)
    expect(getByTestId('date-2-26')).toHaveFocus()
    await user.keyboard(kbd.ARROW_DOWN)
    expect(getByTestId('date-3-4')).toHaveFocus()
    expect(heading).toHaveTextContent('March 1980')

    // four keypresses to April 1980
    await user.keyboard(kbd.ARROW_DOWN)
    expect(getByTestId('date-3-11')).toHaveFocus()
    await user.keyboard(kbd.ARROW_DOWN)
    expect(getByTestId('date-3-18')).toHaveFocus()
    await user.keyboard(kbd.ARROW_DOWN)
    expect(getByTestId('date-3-25')).toHaveFocus()
    await user.keyboard(kbd.ARROW_DOWN)
    expect(getByTestId('date-3-25')).toHaveFocus()
    expect(heading).toHaveTextContent('March 1980')
  })

  it('does not navigate before `minValue` (with keyboard)', async () => {
    const { getByTestId, user } = setup({
      calendarProps: {
        modelValue: calendarDateRange,
        minValue: new CalendarDate(1979, 12, 1),
      },
    })

    const firstDayInMonth = getByTestId('date-1-1')
    firstDayInMonth.focus()
    expect(firstDayInMonth).toHaveFocus()

    const heading = getByTestId('heading')
    expect(heading).toHaveTextContent('January 1980')

    // one keypress to get to December 1979
    await user.keyboard(kbd.ARROW_UP)
    expect(getByTestId('date-12-25')).toHaveFocus()
    expect(heading).toHaveTextContent('December 1979')

    // four keypresses to November 1979
    await user.keyboard(kbd.ARROW_UP)
    expect(getByTestId('date-12-18')).toHaveFocus()
    await user.keyboard(kbd.ARROW_UP)
    expect(getByTestId('date-12-11')).toHaveFocus()
    await user.keyboard(kbd.ARROW_UP)
    expect(getByTestId('date-12-4')).toHaveFocus()
    await user.keyboard(kbd.ARROW_UP)
    expect(getByTestId('date-12-4')).toHaveFocus()
    expect(heading).toHaveTextContent('December 1979')
  })

  it('handles unavailable dates appropriately', async () => {
    const { getByTestId, user } = setup({
      calendarProps: {
        placeholder: calendarDateRange.start,
        isDateUnavailable: (date) => {
          return date.day === 3
        },
      },
    })

    const thirdDayInMonth = getByTestId('date-1-3')
    expect(thirdDayInMonth).toHaveTextContent('3')
    expect(thirdDayInMonth).toHaveAttribute('data-unavailable')
    expect(thirdDayInMonth).toHaveAttribute('aria-disabled', 'true')
    await user.click(thirdDayInMonth)
    expect(thirdDayInMonth).not.toHaveAttribute('data-selected')
  })

  it('formats the weekday labels correctly - `\'narrow\'`', async () => {
    const { getByTestId } = setup({
      calendarProps: {
        placeholder: calendarDateRange.start,
        weekdayFormat: 'narrow',
      },
    })
    for (const [i, weekday] of narrowWeekdays.entries()) {
      const weekdayEl = getByTestId(`weekday-1-${i}`)
      expect(weekdayEl).toHaveTextContent(weekday)
    }
  })

  it('formats the weekday labels correctly - `\'short\'`', async () => {
    const { getByTestId } = setup({
      calendarProps: {
        placeholder: calendarDateRange.start,
        weekdayFormat: 'short',
      },
    })
    for (const [i, weekday] of shortWeekdays.entries()) {
      const weekdayEl = getByTestId(`weekday-1-${i}`)
      expect(weekdayEl).toHaveTextContent(weekday)
    }
  })

  it('formats the weekday labels correctly - `\'long\'`', async () => {
    const { getByTestId } = setup({
      calendarProps: {
        placeholder: calendarDateRange.start,
        weekdayFormat: 'long',
      },
    })
    for (const [i, weekday] of longWeekdays.entries()) {
      const weekdayEl = getByTestId(`weekday-1-${i}`)
      expect(weekdayEl).toHaveTextContent(weekday)
    }
  })
})
