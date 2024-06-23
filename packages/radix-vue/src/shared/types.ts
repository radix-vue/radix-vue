type DataOrientation = 'vertical' | 'horizontal'
type Direction = 'ltr' | 'rtl'
/**
 * @deprecated Use `AccordionType` instead
 */
type Type = 'single' | 'multiple'
type SingleOrMultipleType = 'single' | 'multiple'

interface SingleOrMultipleProps<ValidValue = string | string[], ExplicitType = SingleOrMultipleType> {
  /**
   * Determines whether a "single" or "multiple" items can be pressed at a time.
   *
   * This prop will be ignored if any of `v-model` or `defaultValue` is an defined, as the type will be inferred from the value.
   */
  type?: ValidValue extends string
    ? 'single'
    : ValidValue extends string[]
      ? 'multiple'
      : ExplicitType extends 'single'
        ? 'single'
        : ExplicitType extends 'multiple'
          ? 'multiple'
          : never

  /**
   * The controlled value of the active item(s).
   *
   * Use this when you need to control the state of the items. Can be binded with `v-model`
   */
  modelValue?: ValidValue

  /**
   * The default active value of the item(s).
   *
   * Use when you do not need to control the state of the item(s).
   */
  defaultValue?: ValidValue

}

type ScrollBodyOption = {
  padding?: boolean | number
  margin?: boolean | number
}

type AcceptableValue = string | number | boolean | Record<string, any>
type ArrayOrWrapped<T> = T extends any[] ? T : Array<T>

export type { AcceptableValue, ArrayOrWrapped, DataOrientation, Direction, Type, SingleOrMultipleProps, SingleOrMultipleType, ScrollBodyOption }
