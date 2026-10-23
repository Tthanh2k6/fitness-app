import { exById } from '../data/exercises'
import type { Plate } from '../data/muscles'
import { addDays, isoDate, weekdayIndex } from '../lib/format'
import type { Profile } from '../profile'
import type { DayLog, Logs } from '../store'
import { sleepMinutes } from './health'
import { prescribe, type WeekPlan } from './plan'
import { isActive } from './progress'
import { STEP_GOAL, WATER_GOAL } from './daily'

/** 2026-10-22 → Date theo giờ máy */
export function fromIso(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const dayDiff = (a: Date, b: Date) =>
  Math.round((new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime() - new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime()) / 86400000)

const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export type ChallengeIcon = 'footprints' | 'timer' | 'moon' | 'leaf'

export interface Challenge {
  id: string
  title: string
  days: number
  desc: string
  icon: ChallengeIcon
  tone: Plate
  /** Tự đánh dấu mỗi ngày (app không tự biết được) */
  manual?: boolean
  check: (d: DayLog | undefined, id: string) => boolean
  /** Việc còn lại hôm nay, ví dụ "Hôm nay còn 1.158 bước" */
  today: (d: DayLog | undefined, done: boolean) => string
}

const vn = (n: number) => n.toLocaleString('vi-VN')

export const CHALLENGES: Challenge[] = [
  {
    id: 'steps-8000', title: '8.000 bước mỗi ngày', days: 30, desc: 'đi đủ 8.000 bước', icon: 'footprints', tone: 'green',
    check: (d) => (d?.steps ?? 0) >= STEP_GOAL,
    today: (d, done) => (done ? 'Hôm nay đã đủ bước' : d?.steps ? `Hôm nay còn ${vn(STEP_GOAL - d.steps)} bước` : 'Hôm nay chưa ghi bước chân'),
  },
  {
    id: 'plank-daily', title: 'Plank mỗi ngày', days: 21, desc: 'ít nhất 1 hiệp plank', icon: 'timer', tone: 'yellow',
    check: (d) => !!d && Object.entries(d.sets).some(([id, n]) => n > 0 && (id === 'plank' || exById(id)?.pattern === 'core-hold')),
    today: (_, done) => (done ? 'Hôm nay đã tập plank' : 'Hôm nay chưa tập plank'),
  },
  {
    id: 'sleep-23', title: 'Ngủ trước 23 giờ', days: 14, desc: 'đi ngủ trước 23:00', icon: 'moon', tone: 'blue',
    check: (d) => {
      if (!d?.sleep) return false
      const bed = toMin(d.sleep.bed)
      return bed >= 18 * 60 && bed <= 23 * 60
    },
    today: (d, done) => (done ? `Đêm qua ngủ lúc ${d!.sleep!.bed}` : d?.sleep ? `Đêm qua ngủ lúc ${d.sleep.bed}` : 'Ghi giờ ngủ đêm qua ở màn Sức khỏe'),
  },
  {
    id: 'no-milktea', title: 'Không trà sữa', days: 7, desc: 'tiết kiệm khoảng 200.000đ', icon: 'leaf', tone: 'green', manual: true,
    check: (d, id) => !!d?.checks?.includes(id),
    today: (_, done) => (done ? 'Hôm nay đã giữ được' : 'Hôm nay chưa đánh dấu'),
  },
]

export const challengeById = (id: string) => CHALLENGES.find((c) => c.id === id)

export type DayStatus = 'achieved' | 'missed' | 'today' | 'future'

export interface ChallengeProgress {
  /** Ngày thứ mấy của thử thách (1 = ngày tham gia) */
  dayNo: number
  total: number
  done: number
  missed: number
  daysLeft: number
  statuses: DayStatus[]
  todayDone: boolean
  todayText: string
  finished: boolean
}

export function challengeProgress(id: string, joined: string, logs: Logs, today: Date): ChallengeProgress | null {
  const c = challengeById(id)
  if (!c) return null
  const start = fromIso(joined)
  const dayNo = dayDiff(start, today) + 1
  const statuses: DayStatus[] = []
  for (let i = 0; i < c.days; i++) {
    const d = addDays(start, i)
    const diff = dayDiff(d, today)
    const ok = c.check(logs.days[isoDate(d)], id)
    statuses.push(diff > 0 ? (ok ? 'achieved' : 'missed') : diff === 0 ? (ok ? 'achieved' : 'today') : 'future')
  }
  const todayLog = logs.days[isoDate(today)]
  const todayDone = c.check(todayLog, id)
  return {
    dayNo: Math.max(1, dayNo),
    total: c.days,
    done: statuses.filter((s) => s === 'achieved').length,
    missed: statuses.filter((s) => s === 'missed').length,
    daysLeft: Math.max(0, c.days - Math.max(1, dayNo)),
    statuses,
    todayDone,
    todayText: c.today(todayLog, todayDone),
    finished: dayNo > c.days,
  }
}

/** Trung bình bước chân mỗi ngày từ ngày tham gia đến hôm nay (chỉ tính ngày có ghi) */
export function averageSteps(joined: string, logs: Logs, today: Date) {
  const xs: number[] = []
  for (let d = fromIso(joined); d <= today; d = addDays(d, 1)) {
    const s = logs.days[isoDate(d)]?.steps
    if (s) xs.push(s)
  }
  return xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0
}

/**
 * Chuỗi buổi dài nhất từng có: ngày nghỉ theo lịch không làm đứt chuỗi,
 * ngày có lịch mà không tập thì đứt (hôm nay chưa tập chưa tính là đứt).
 */
export function maxStreak(logs: Logs, plan: WeekPlan, today: Date) {
  const dates = Object.keys(logs.days).sort()
  if (!dates.length) return 0
  let best = 0
  let cur = 0
  for (let d = fromIso(dates[0]); d <= today; d = addDays(d, 1)) {
    if (isActive(logs.days[isoDate(d)])) best = Math.max(best, ++cur)
    else if (plan[weekdayIndex(d)] !== null && dayDiff(d, today) > 0) cur = 0
  }
  return best
}

/** Tổng số lần squat đã tập (mọi bài kiểu squat tính bằng số lần) */
export function squatReps(logs: Logs, profile: Profile) {
  let total = 0
  for (const log of Object.values(logs.days)) {
    for (const [id, sets] of Object.entries(log.sets)) {
      const ex = exById(id)
      if (!ex || ex.pattern !== 'squat' || ex.mode !== 'reps' || sets <= 0) continue
      total += sets * (log.reps?.[id] ?? prescribe(ex, profile).amount)
    }
  }
  return total
}

export interface Badge {
  id: string
  title: string
  tone: Plate
  earned: boolean
  /** Tiến độ khi chưa đạt, ví dụ "3/7" */
  progress: string
}

export function badges(logs: Logs, profile: Profile, plan: WeekPlan, today: Date): Badge[] {
  const days = Object.values(logs.days)
  const streakMax = maxStreak(logs, plan, today)
  const squats = squatReps(logs, profile)
  const goodNights = days.filter((d) => (sleepMinutes(d.sleep) ?? 0) >= 420).length
  const waterDays = days.filter((d) => (d.water ?? 0) >= WATER_GOAL).length
  const gain = profile.goal === 'gain' || profile.goal === 'muscle'
  const change = gain ? profile.weightKg - profile.startKg : profile.startKg - profile.weightKg
  const kg = Math.max(0, Math.round(change * 10) / 10)
  const fmt = (n: number) => n.toLocaleString('vi-VN', { maximumFractionDigits: 1 })
  const list: Badge[] = [
    { id: 'streak-7', title: 'Chuỗi 7 buổi', tone: 'red', earned: streakMax >= 7, progress: `${Math.min(streakMax, 7)}/7` },
    { id: 'squat-100', title: '100 lần squat', tone: 'blue', earned: squats >= 100, progress: `${Math.min(squats, 100)}/100` },
    { id: 'sleep-5', title: 'Ngủ đủ 5 đêm', tone: 'green', earned: goodNights >= 5, progress: `${Math.min(goodNights, 5)}/5` },
    { id: 'water-7', title: 'Uống đủ nước 7 ngày', tone: 'yellow', earned: waterDays >= 7, progress: `${Math.min(waterDays, 7)}/7` },
    profile.goal === 'health'
      ? { id: 'weigh-4', title: 'Ghi cân 4 tuần', tone: 'red', earned: logs.weights.length >= 4, progress: `${Math.min(logs.weights.length, 4)}/4` }
      : { id: 'kg-2', title: gain ? 'Tăng 2 kg' : 'Giảm 2 kg', tone: 'red', earned: change >= 2, progress: `${fmt(Math.min(kg, 2))}/2 kg` },
    { id: 'streak-30', title: 'Chuỗi 30 buổi', tone: 'blue', earned: streakMax >= 30, progress: `${Math.min(streakMax, 30)}/30` },
  ]
  return list
}
