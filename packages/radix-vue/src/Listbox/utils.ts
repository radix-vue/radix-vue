import isEqual from 'fast-deep-equal'

export type AcceptableValue = string | number | boolean | Record<string, any>
export type ArrayOrWrapped<T> = T extends any[] ? T : Array<T>

export function queryCheckedElement(parentEl: HTMLElement | null) {
  return parentEl?.querySelector('[data-state=checked]') as HTMLElement | null
}

export function valueComparator<T>(value: T | T[] | undefined, currentValue: T, comparator?: keyof T | ((a: T, b: T) => boolean)) {
  if (value === undefined)
    return false
  else if (Array.isArray(value))
    return value.some(val => compare(val, currentValue, comparator))
  else
    return compare(value, currentValue, comparator)
}

export function compare<T>(value?: T, currentValue?: T, comparator?: keyof T | ((a: T, b: T) => boolean)) {
  if (value === undefined || currentValue === undefined)
    return false

  if (typeof value === 'string')
    return value === currentValue

  if (typeof comparator === 'function')
    return comparator(value, currentValue)

  if (typeof comparator === 'string')
    return value?.[comparator] === currentValue?.[comparator]

  return isEqual(value, currentValue)
}
