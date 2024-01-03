import { type Component, type IntrinsicElementAttributes, type PropType, defineComponent, h } from 'vue'
import { Slot } from './Slot'

export interface PrimitiveProps {
  /**
   * Setting "asChild" to true has the same effect as setting "as" to "template".
   * @default false
   */
  asChild?: boolean
  /**
   * @default "div"
   */
  as?: keyof IntrinsicElementAttributes | Component
}

export const Primitive = defineComponent({
  name: 'Primitive',
  inheritAttrs: false,
  props: {
    asChild: {
      type: Boolean,
      default: false,
    },
    as: {
      type: [String, Object] as PropType<keyof IntrinsicElementAttributes | Component>,
      default: 'div',
    },
  },
  setup(props, { attrs, slots }) {
    const asTag = props.asChild ? 'template' : props.as

    if (asTag !== 'template')
      return () => h(props.as, attrs, { default: slots.default })

    return () => h(Slot, attrs, { default: slots.default })
  },
})
