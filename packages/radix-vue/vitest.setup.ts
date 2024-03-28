import { beforeAll, expect, vi } from 'vitest'

import '@testing-library/jest-dom/vitest'
import * as matchers from 'vitest-axe/matchers'
import { configureAxe } from 'vitest-axe'
import 'vitest-canvas-mock'

expect.extend(matchers)

configureAxe({
  globalOptions: {
    rules: [{
      id: 'region', enabled: false,
    }],
  },
})

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
})
