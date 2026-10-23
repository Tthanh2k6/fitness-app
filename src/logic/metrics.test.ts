import { describe, expect, it } from 'vitest'
import { DEFAULT_PROFILE, macroTargets, targetEta, kcalTarget, type Profile } from '../profile'
import { EMPTY_LOGS, type Logs } from '../store'
import { adjustBefore, applyAdjust, NO_ADJUST } from './adjust'
import { dailyMetrics, dailyPercent, dayWork, plannedKcal } from './daily'
import { readiness, sleepMinutes } from './health'
import { dayNutrition, foodReason, FOODS, mealMacros, suggestMeals } from './meals'
import { buildWeekPlan } from './plan'
import { newRecords, personalRecords } from './records'

const profile = (patch: Partial<Profile> = {}): Profile => ({ ...DEFAULT_PROFILE, onboarded: true, ...patch })
const logs = (days: Logs['days']): Logs => ({ ...EMPTY_LOGS, days })

describe('điều chỉnh theo cảm nhận sau buổi tập', () => {
  it('chỉ tính các buổi trước ngày đang xét', () => {
    const l = logs({ '2026-10-20': { sets: {}, rpe: 0 }, '2026-10-22': { sets: {}, rpe: 0 } })
    expect(adjustBefore(l, '2026-10-20')).toEqual(NO_ADJUST)
    expect(adjustBefore(l, '2026-10-21').reps).toBe(2)
    expect(adjustBefore(l, '2026-10-23').reps).toBe(4)
  })

  it('quá sức thì bớt một hiệp, khá nặng thì nghỉ lâu hơn', () => {
    const a = adjustBefore(logs({ '2026-10-20': { sets: {}, rpe: 3 }, '2026-10-21': { sets: {}, rpe: 2 } }), '2026-10-22')
    expect(a.sets).toBe(-1)
    expect(a.rest).toBe(15)
    const s = buildWeekPlan(profile({ level: 'basic' }))[0]!
    const adj = applyAdjust(s, a)!
    adj.items.forEach((it, i) => {
      expect(it.sets).toBe(Math.max(1, s.items[i].sets - 1))
      expect(it.rest).toBe(s.items[i].rest + 15)
    })
  })

  it('không vượt giới hạn khi bấm "Nhẹ" nhiều lần', () => {
    const days: Logs['days'] = {}
    for (let d = 1; d <= 9; d++) days[`2026-10-0${d}`] = { sets: {}, rpe: 0 }
    expect(adjustBefore(logs(days), '2026-10-30')).toEqual({ reps: 6, rest: 0, sets: 0 })
  })
})

describe('chỉ số trong ngày', () => {
  const p = profile()
  const s = buildWeekPlan(p)[0]!

  it('buổi chưa tập thì calo và phút bằng 0, tập đủ thì bằng dự kiến', () => {
    expect(dayWork(undefined, p, s)).toEqual({ kcal: 0, minutes: 0 })
    const full = { sets: Object.fromEntries(s.items.map((it) => [it.exId, it.sets])), warmup: true, cooldown: true }
    expect(dayWork(full, p, s).kcal).toBe(plannedKcal(s, p))
    expect(plannedKcal(s, p)).toBeGreaterThan(50)
  })

  it('thanh đòn đủ 100% khi mọi chỉ số đạt mục tiêu', () => {
    const full = { sets: Object.fromEntries(s.items.map((it) => [it.exId, it.sets])), warmup: true, cooldown: true, water: 8, steps: 9000 }
    const m = dailyMetrics(full, p, s)
    expect(m.map((x) => x.key)).toEqual(['kcal', 'steps', 'minutes', 'water'])
    expect(dailyPercent(m)).toBeGreaterThanOrEqual(95)
    expect(dailyPercent(dailyMetrics(undefined, p, s))).toBe(0)
  })
})

describe('sức khỏe', () => {
  it('tính giờ ngủ qua nửa đêm', () => {
    expect(sleepMinutes({ bed: '23:10', wake: '06:30' })).toBe(440)
    expect(sleepMinutes({ bed: '01:00', wake: '07:00' })).toBe(360)
  })

  it('ngủ đủ và thấy khỏe thì điểm sẵn sàng cao hơn khi thiếu ngủ và mệt', () => {
    const today = new Date(2026, 9, 22)
    const good = readiness(logs({ '2026-10-22': { sets: {}, sleep: { bed: '22:30', wake: '06:30' }, mood: 3 } }), today, null)
    const bad = readiness(logs({ '2026-10-22': { sets: {}, sleep: { bed: '02:00', wake: '06:30' }, mood: 0 } }), today, null)
    expect(good.score).toBeGreaterThan(bad.score)
    expect(good.measured).toBe(true)
    expect(readiness(EMPTY_LOGS, today, null).measured).toBe(false)
  })
})

describe('kỷ lục', () => {
  const p = profile()
  it('lần đầu tập không tính là kỷ lục mới, vượt thành tích cũ thì có', () => {
    const l = logs({
      '2026-10-15': { sets: { squat: 3 }, reps: { squat: 15 } },
      '2026-10-22': { sets: { squat: 3 }, reps: { squat: 18 } },
    })
    expect(newRecords(l, p, '2026-10-15')).toEqual([])
    const r = newRecords(l, p, '2026-10-22')
    expect(r[0].now.amount).toBe(18)
    expect(r[0].before.amount).toBe(15)
    expect(personalRecords(l, p)[0].score).toBe(54)
  })
})

describe('dinh dưỡng', () => {
  it('mọi món đều có đủ đạm, tinh bột, chất béo khớp với calo (sai số 15%)', () => {
    for (const f of FOODS) {
      const kcal = f.proteinG * 4 + f.carbG * 4 + f.fatG * 9
      expect(Math.abs(kcal - f.kcal) / f.kcal, f.name).toBeLessThan(0.15)
    }
  })

  it('bữa ghi từ bản cũ không có tinh bột/chất béo vẫn ước tính được', () => {
    const m = mealMacros({ id: '1', date: '2026-10-22', slot: 'Trưa', name: 'Món lạ', kcal: 500, proteinG: 20, price: 30000 })
    expect(m.carb).toBeGreaterThan(0)
    expect(m.fat).toBeGreaterThan(0)
    const t = dayNutrition([{ id: '1', date: '', slot: 'Trưa', name: 'Cơm gà luộc', kcal: 520, proteinG: 35, price: 35000, foodId: 'com-ga-luoc' }])
    expect(t).toMatchObject({ kcal: 520, protein: 35, carb: 62, fat: 14, spent: 35000 })
  })

  it('mục tiêu dinh dưỡng cộng lại gần bằng calo mỗi ngày', () => {
    for (const goal of ['lose', 'gain', 'muscle', 'health'] as const) {
      const t = macroTargets(profile({ goal }))
      expect(Math.abs(t.protein * 4 + t.carb * 4 + t.fat * 9 - t.kcal)).toBeLessThan(10)
      expect(t.kcal).toBe(kcalTarget(profile({ goal })))
    }
  })

  it('gợi ý cho mục tiêu khỏe hơn và nhãn lý do', () => {
    const list = suggestMeals({ dailyKcal: 1800, budget: 120000, goal: 'health', slot: 'Tối' })
    expect(list.length).toBe(4)
    for (const f of list) expect(foodReason(f, list, true).text.length).toBeGreaterThan(0)
  })

  it('ngày dự kiến đạt cân nặng mong muốn', () => {
    expect(targetEta(profile({ goal: 'health' }))).toBeNull()
    expect(targetEta(profile({ weightKg: 61.4, targetKg: 58 }), new Date(2026, 9, 22))!.weeks).toBe(7)
  })
})
