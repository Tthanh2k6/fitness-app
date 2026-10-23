import { describe, expect, it } from 'vitest'
import { adviseMeal, mealSlot } from './advice'
import { DISHES } from './dishes'
import { predict, type FoodHead } from './head'

describe('predict', () => {
  const head: FoodHead = {
    version: 1, embedder: 'test', labels: ['Pho', 'Com tam', 'Banh mi'], dim: 2,
    W: [1, 0, 0, 1, -1, -1], b: [0, 0, 0],
  }

  it('xếp lớp theo xác suất và tổng xác suất bằng 1', () => {
    const out = predict(head, [3, 1], 3)
    expect(out.map((g) => g.label)).toEqual(['Pho', 'Com tam', 'Banh mi'])
    expect(out.reduce((s, g) => s + g.p, 0)).toBeCloseTo(1)
  })

  it('báo lỗi khi vector không khớp số chiều', () => {
    expect(() => predict(head, [1, 2, 3])).toThrow()
  })
})

describe('adviseMeal', () => {
  const base = { proteinG: 30, dailyKcal: 2000, slot: 'Trưa' as const } // mục tiêu bữa trưa = 700 kcal

  it('vừa đủ khi chênh không quá 15%', () => {
    expect(adviseMeal({ ...base, kcal: 740, goal: 'lose' }).tone).toBe('good')
  })

  it('giảm cân mà ăn dư thì nhắc bớt tinh bột', () => {
    const a = adviseMeal({ ...base, kcal: 900, goal: 'lose' })
    expect(a.tone).toBe('warn')
    expect(a.title).toBe('Dư 200 kcal so với bữa trưa')
  })

  it('tăng cân mà ăn dư vừa phải thì vẫn tốt', () => {
    expect(adviseMeal({ ...base, kcal: 900, goal: 'gain' }).tone).toBe('good')
  })

  it('tăng cân mà ăn thiếu thì nhắc ăn thêm', () => {
    const a = adviseMeal({ ...base, kcal: 400, goal: 'gain' })
    expect(a.tone).toBe('warn')
    expect(a.title).toBe('Thiếu 300 kcal cho bữa trưa')
  })

  it('tăng cơ thì nhắc khi ít đạm', () => {
    expect(adviseMeal({ ...base, kcal: 700, proteinG: 12, goal: 'muscle' }).tip).toContain('12g đạm')
  })
})

it('chia bữa theo giờ', () => {
  expect(mealSlot(new Date(2026, 9, 16, 7))).toBe('Sáng')
  expect(mealSlot(new Date(2026, 9, 16, 12))).toBe('Trưa')
  expect(mealSlot(new Date(2026, 9, 16, 15))).toBe('Bữa phụ')
  expect(mealSlot(new Date(2026, 9, 16, 19))).toBe('Tối')
})

it('bảng món có đủ dữ liệu hợp lệ', () => {
  expect(DISHES.length).toBe(28)
  for (const d of DISHES) {
    expect(d.kcal.s).toBeLessThan(d.kcal.m)
    expect(d.kcal.m).toBeLessThan(d.kcal.l)
    expect(new Set(DISHES.map((x) => x.datasetClass)).size).toBe(DISHES.length)
  }
})
