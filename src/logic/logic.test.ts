import { describe, expect, it } from 'vitest'
import { exById, LIBRARY } from '../data/exercises'
import { VIDEOS } from '../data/videos'
import { DEFAULT_PROFILE, type Profile } from '../profile'
import { EMPTY_LOGS, type Logs } from '../store'
import { suggestMeals } from './meals'
import { allowedGear, buildWeekPlan, itemSeconds } from './plan'
import { streak, totals, weekMuscles } from './progress'
import { burnedKcal, doneCount, nextIndex } from './session'

const profile = (patch: Partial<Profile> = {}): Profile => ({ ...DEFAULT_PROFILE, onboarded: true, ...patch })

describe('lịch tập', () => {
  it('số buổi trong tuần đúng với lựa chọn, ngày nghỉ xen kẽ', () => {
    for (const days of [2, 3, 4, 5, 6]) {
      const week = buildWeekPlan(profile({ days }))
      expect(week.filter(Boolean).length).toBe(days)
      expect(week[6]).toBeNull() // Chủ nhật luôn nghỉ
    }
  })

  it('mỗi buổi vừa thời gian rảnh và có ít nhất 3 bài', () => {
    for (const minutes of [15, 30, 45, 60]) {
      for (const s of buildWeekPlan(profile({ minutes })).filter((x) => x !== null)) {
        expect(s.items.length).toBeGreaterThanOrEqual(3)
        if (s.items.length > 3) expect(s.minutes).toBeLessThanOrEqual(minutes + 1)
      }
    }
  })

  it('mục tiêu đổi số lần và thời gian nghỉ', () => {
    const lose = buildWeekPlan(profile({ goal: 'lose' }))[0]!.items.find((i) => i.unit === 'lần')!
    const gain = buildWeekPlan(profile({ goal: 'gain' }))[0]!.items.find((i) => i.unit === 'lần')!
    expect(lose.rest).toBeLessThan(gain.rest)
    expect(lose.amount).toBeGreaterThan(gain.amount)
  })

  it('trình độ đổi số hiệp và không giao bài quá khó cho người mới', () => {
    const beginner = buildWeekPlan(profile({ level: 'beginner' })).filter((x) => x !== null)
    const advanced = buildWeekPlan(profile({ level: 'advanced' })).filter((x) => x !== null)
    expect(beginner[0].items[0].sets).toBeLessThan(advanced[0].items[0].sets)
    for (const s of beginner) for (const it of s.items) expect(exById(it.exId)!.difficulty).toBe(1)
  })

  it('chỉ dùng dụng cụ người tập có', () => {
    const home = profile({ place: 'home', equipment: ['Thảm'] })
    const gear = allowedGear(home)
    for (const s of buildWeekPlan(home).filter((x) => x !== null)) {
      for (const it of s.items) expect(gear.has(exById(it.exId)!.gear)).toBe(true)
    }
    const gym = buildWeekPlan(profile({ place: 'gym', level: 'intermediate', days: 4 }))
    expect(gym.some((s) => s?.items.some((it) => exById(it.exId)!.gear !== 'none'))).toBe(true)
  })

  it('không lặp bài trong cùng một buổi', () => {
    for (const s of buildWeekPlan(profile({ minutes: 60, level: 'advanced', place: 'gym' })).filter((x) => x !== null)) {
      expect(new Set(s.items.map((i) => i.exId)).size).toBe(s.items.length)
    }
  })

  it('mỗi buổi không có hai bài cùng kiểu chuyển động, bài chính đứng đầu', () => {
    const profiles = [profile(), profile({ place: 'gym', level: 'advanced', minutes: 60, days: 6, goal: 'muscle' }), profile({ days: 3, level: 'basic', equipment: ['Tạ đơn'] })]
    for (const p of profiles) {
      for (const s of buildWeekPlan(p).filter((x) => x !== null)) {
        const patterns = s.items.map((i) => exById(i.exId)!.pattern)
        expect(new Set(patterns).size).toBe(patterns.length)
        const first = { full: ['squat'], lower: ['squat'], upper: ['push'], cardio: ['machine', 'run'] }[s.kind]
        expect(first).toContain(patterns[0])
      }
    }
  })

  it('các buổi cùng loại trong tuần không giống hệt nhau', () => {
    const week = buildWeekPlan(profile({ days: 4, goal: 'muscle', level: 'basic', place: 'gym' })).filter((x) => x !== null)
    const ids = (i: number) => week[i].items.map((it) => it.exId).join()
    expect(ids(0)).not.toBe(ids(2)) // Chân & mông A và B
    expect(ids(1)).not.toBe(ids(3))
  })

  it('tập ở phòng gym không giao bài chế từ đồ trong nhà', () => {
    for (const s of buildWeekPlan(profile({ place: 'gym', days: 6, minutes: 60 })).filter((x) => x !== null)) {
      for (const it of s.items) expect(exById(it.exId)!.homeOnly).toBeFalsy()
    }
  })

  it('thư viện có video hướng dẫn cho mọi bài, mã bài không trùng', () => {
    expect(new Set(LIBRARY.map((e) => e.id)).size).toBe(LIBRARY.length)
    for (const e of LIBRARY) expect(VIDEOS[e.id], e.id).toBeDefined()
    for (const id of Object.keys(VIDEOS)) expect(exById(id), id).toBeDefined()
  })

  it('thời lượng ước tính của bài tăng theo số hiệp', () => {
    const it = { exId: 'squat', sets: 2, amount: 12, unit: 'lần' as const, perSide: false, rest: 30 }
    expect(itemSeconds({ ...it, sets: 3 })).toBeGreaterThan(itemSeconds(it))
  })
})

describe('nhật ký và tiến độ', () => {
  const monday = new Date(2026, 9, 12) // thứ Hai 12/10/2026
  const p = profile({ days: 3 }) // tập thứ Hai, thứ Tư, thứ Sáu
  const week = buildWeekPlan(p)
  const logs: Logs = {
    ...EMPTY_LOGS,
    days: {
      '2026-10-12': { sets: { squat: 2, plank: 1 } },
      '2026-10-14': { sets: { 'incline-pushup': 2 } },
    },
    weights: [],
    meals: [],
  }

  it('đếm chuỗi ngày bỏ qua ngày nghỉ theo lịch', () => {
    expect(streak(logs, week, new Date(2026, 9, 15))).toBe(2) // thứ Năm nghỉ, chưa đứt chuỗi
    expect(streak(logs, week, new Date(2026, 9, 17))).toBe(0) // bỏ buổi thứ Sáu 16/10
  })

  it('tổng số buổi và số bài', () => {
    expect(totals(logs)).toEqual({ sessions: 2, exercises: 3 })
  })

  it('cơ đã tập trong tuần lấy từ cơ chính của bài', () => {
    const m = weekMuscles(logs, new Date(2026, 9, 15))
    expect(m.find((x) => x.muscle === 'quadriceps')?.times).toBe(1)
    expect(m.find((x) => x.muscle === 'chest')?.times).toBe(1)
  })

  it('bài tiếp theo và calo theo số hiệp đã tập', () => {
    const s = week[0]!
    const first = s.items[0]
    const log = { sets: { [first.exId]: first.sets } }
    expect(doneCount(s, log)).toBe(1)
    expect(nextIndex(s, log)).toBe(1)
    expect(burnedKcal(s.items, log, 60)).toBeGreaterThan(0)
    expect(burnedKcal(s.items, { sets: {} }, 60)).toBe(0)
    expect(monday.getDay()).toBe(1)
  })
})

describe('gợi ý món ăn', () => {
  it('nằm trong ngân sách của bữa', () => {
    const out = suggestMeals({ dailyKcal: 2000, budget: 120000, goal: 'lose', slot: 'Trưa' })
    expect(out.length).toBe(4)
    for (const f of out) expect(f.price).toBeLessThanOrEqual(120000 * 0.4)
  })

  it('tăng cân thì gợi ý món nhiều calo hơn giảm cân', () => {
    const avg = (goal: 'lose' | 'gain') =>
      suggestMeals({ dailyKcal: 2200, budget: 200000, goal, slot: 'Trưa' }).reduce((s, f) => s + f.kcal, 0) / 4
    expect(avg('gain')).toBeGreaterThan(avg('lose'))
  })
})
