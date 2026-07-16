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
    [500, '完全追跡者'],
    [499, '預言者'],
    [470, '預言者'],
    [469, '物理学者'],
    [420, '物理学者'],
    [419, '追跡者'],
    [350, '追跡者'],
    [349, '目で追う人'],
    [250, '目で追う人'],
    [249, '軌道迷子'],
    [150, '軌道迷子'],
    [149, 'ボールと絶縁'],
    [0, 'ボールと絶縁'],
  ])('maps %i points to %s', (score, title) => {
    expect(getTitle(score)).toBe(title)
  })
})
