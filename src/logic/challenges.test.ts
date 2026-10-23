import { describe, expect, it } from 'vitest'
import { DEFAULT_PROFILE, type Profile } from '../profile'
import { EMPTY_LOGS, type Logs } from '../store'
import { badges, challengeProgress, maxStreak } from './challenges'
import { makeDemoLogs } from './demo'
import { buildWeekPlan } from './plan'

const profile = (patch: Partial<Profile> = {}): Profile => ({ ...DEFAULT_PROFILE, onboarded: true, ...patch })

describe('thử thách và huy hiệu', () => {
  const today = new Date(2026, 9, 23)

  it('đếm ngày đạt, ngày lỡ và hôm nay của thử thách bước chân', () => {
    const logs: Logs = {
      ...EMPTY_LOGS,
      days: {
        '2026-10-20': { sets: {}, steps: 9000 },
        '2026-10-21': { sets: {}, steps: 5000 },
        '2026-10-22': { sets: {}, steps: 8000 },
        '2026-10-23': { sets: {}, steps: 3000 },
      },
    }
    const p = challengeProgress('steps-8000', '2026-10-20', logs, today)!
    expect(p.dayNo).toBe(4)
    expect(p.done).toBe(2)
    expect(p.missed).toBe(1)
    expect(p.statuses.slice(0, 5)).toEqual(['achieved', 'missed', 'achieved', 'today', 'future'])
    expect(p.todayText).toContain('5.000')
  })

  it('thử thách tự đánh dấu dựa vào checks của ngày', () => {
    const logs: Logs = { ...EMPTY_LOGS, days: { '2026-10-23': { sets: {}, checks: ['no-milktea'] } } }
    expect(challengeProgress('no-milktea', '2026-10-23', logs, today)!.todayDone).toBe(true)
  })

  it('chuỗi dài nhất bỏ qua ngày nghỉ theo lịch, đứt khi lỡ buổi', () => {
    const p = profile({ days: 3 }) // thứ Hai, Tư, Sáu
    const plan = buildWeekPlan(p)
    const on = { sets: { squat: 2 } }
    const logs: Logs = { ...EMPTY_LOGS, days: { '2026-10-05': on, '2026-10-07': on, '2026-10-09': on, '2026-10-12': on, '2026-10-19': on } }
    expect(maxStreak(logs, plan, today)).toBe(4)
  })

  it('dữ liệu mẫu đủ 7 tuần, đánh dấu demo và mở được huy hiệu', () => {
    const p = profile({ weightKg: 61.4, startKg: 61.4, targetKg: 58 })
    const { logs, startKg } = makeDemoLogs(p, today)
    expect(logs.demo).toBe(true)
    expect(Object.keys(logs.days).length).toBe(50)
    expect(logs.weights[logs.weights.length - 1].kg).toBe(61.4)
    expect(startKg).toBeGreaterThan(61.4)
    expect(logs.days['2026-10-23'].sets).toEqual({})
    const earned = badges(logs, { ...p, startKg }, buildWeekPlan(p), today).filter((b) => b.earned).map((b) => b.id)
    expect(earned).toEqual(expect.arrayContaining(['streak-7', 'kg-2']))
  })
})
