import { describe, expect, it, vi } from 'vitest'
import { ensureServiceWorker } from '../../src/firebase'

describe('Railway PWA service worker', () => {
  it('registers only the root-scoped sw.js worker', async () => {
    const registration = { update: vi.fn().mockResolvedValue(undefined) }
    const serviceWorker = {
      getRegistration: vi.fn().mockResolvedValue(null),
      register: vi.fn().mockResolvedValue(registration),
      ready: Promise.resolve(registration),
    }
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: serviceWorker })

    await ensureServiceWorker()

    expect(serviceWorker.register).toHaveBeenCalledWith('/sw.js')
    expect(serviceWorker.register).toHaveBeenCalledTimes(1)
  })
})
