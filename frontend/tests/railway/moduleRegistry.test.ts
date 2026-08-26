import { describe, expect, it } from 'vitest'
import { MODULES_BY_KEY } from '../../src/app/moduleRegistry'

describe('Railway module registration', () => {
  it('registers one workspace with structured capability navigation', () => {
    const railway = MODULES_BY_KEY.railway
    const items = railway.navigation.flatMap((group) => group.items)

    expect(railway.baseRoute).toBe('/railway')
    expect(items).toEqual(expect.arrayContaining([
      expect.objectContaining({ to: '/railway/inspections', permission: 'railway.inspections.read' }),
      expect.objectContaining({ to: '/railway/maintenance', permission: 'railway.maintenance.read' }),
      expect.objectContaining({ to: '/railway/crowd', permission: 'railway.crowd.read' }),
    ]))
  })
})
