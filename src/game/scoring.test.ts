import { describe, expect, it } from 'vitest'
import { getTitle, scoreDistance } from './scoring'

describe('scoring', () => {
  it('awards 100 for an exact answer', () => {
    expect(scoreDistance(0)).toBe(100)
  })

  it('clamps the score between zero and one hundred', () => {
    expect(scoreDistance(-1)).toBe(100)
    expect(scoreDistance(2)).toBe(0)
  })

  it.each([
    [300, '預言者'],
    [270, '預言者'],
    [269, '物理学者'],
    [225, '物理学者'],
    [224, '追跡者'],
    [165, '追跡者'],
    [164, '一般人'],
    [90, '一般人'],
    [89, 'ボールと絶縁'],
    [0, 'ボールと絶縁'],
  ])('maps %i points to %s', (score, title) => {
    expect(getTitle(score)).toBe(title)
  })
})
