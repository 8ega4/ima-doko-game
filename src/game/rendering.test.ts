import { describe, expect, it } from 'vitest'
import { normalizedPointFromPointer } from './rendering'

describe('pointer coordinates', () => {
  const bounds = { left: 10, top: 20, width: 200, height: 200 }

  it('maps CSS coordinates into normalized canvas coordinates', () => {
    expect(normalizedPointFromPointer(110, 120, bounds)).toEqual({ x: 0.5, y: 0.5 })
  })

  it('clamps taps outside the field', () => {
    expect(normalizedPointFromPointer(-20, 500, bounds)).toEqual({ x: 0, y: 1 })
  })
})
