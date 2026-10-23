import { exById } from '../data/exercises'
import type { Profile } from '../profile'
import type { DayLog, Logs } from '../store'
import { prescribe } from './plan'

/** Thành tích một bài trong một ngày: số hiệp × số lần (bài tính giờ: số giây giữ lâu nhất) */
export interface Feat {
  exId: string
  date: string
  sets: number
  amount: number
  unit: 'lần' | 'giây'
  /** Điểm để so sánh: tổng số lần, hoặc số giây với bài tính giờ */
  score: number
}

function dayFeats(date: string, log: DayLog, profile: Profile): Feat[] {
  return Object.entries(log.sets)
    .filter(([, n]) => n > 0)
    .map(([exId, sets]) => {
      const ex = exById(exId)
      if (!ex) return null
      // Nhật ký cũ chưa ghi số lần thì lấy mức được giao
      const amount = log.reps?.[exId] ?? prescribe(ex, profile).amount
      const unit = ex.mode === 'time' ? 'giây' : 'lần'
      return { exId, date, sets, amount, unit, score: unit === 'giây' ? amount : sets * amount } as Feat
    })
    .filter((x): x is Feat => x !== null)
}

/** Kỷ lục tốt nhất của mỗi bài từng tập, mới nhất trước */
export function personalRecords(logs: Logs, profile: Profile): Feat[] {
  const best = new Map<string, Feat>()
  for (const date of Object.keys(logs.days).sort()) {
    for (const f of dayFeats(date, logs.days[date], profile)) {
      const b = best.get(f.exId)
      if (!b || f.score > b.score) best.set(f.exId, f)
    }
  }
  return [...best.values()].sort((a, b) => b.date.localeCompare(a.date) || b.score - a.score)
}

/** Kỷ lục mới lập trong ngày `date` (phải vượt thành tích trước đó, lần đầu tập không tính) */
export function newRecords(logs: Logs, profile: Profile, date: string): { now: Feat; before: Feat }[] {
  const log = logs.days[date]
  if (!log) return []
  const prior = personalRecords({ ...logs, days: Object.fromEntries(Object.entries(logs.days).filter(([d]) => d < date)) }, profile)
  return dayFeats(date, log, profile)
    .map((now) => ({ now, before: prior.find((p) => p.exId === now.exId)! }))
    .filter((x) => x.before && x.now.score > x.before.score)
    .sort((a, b) => b.now.score / b.before.score - a.now.score / a.before.score)
}

const clockOf = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

/** "3 × 18 lần", "1:45", "40 giây" */
export const featLabel = (f: Feat) =>
  f.unit === 'giây' ? (f.amount >= 60 ? clockOf(f.amount) : `${f.amount} giây`) : `${f.sets} × ${f.amount} lần`
