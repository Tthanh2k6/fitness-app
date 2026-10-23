import { exById } from '../data/exercises'
import { STRETCHES, stretchMinutes } from '../data/stretches'
import type { Plate } from '../data/muscles'
import type { Profile } from '../profile'
import type { DayLog } from '../store'
import { itemSeconds, prescribe, type PlanItem, type Session } from './plan'

/** 8 ly 250 ml = 2 lít mỗi ngày */
export const WATER_GOAL = 8
export const STEP_GOAL = 8000

/** Lít nước từ số ly, dạng 1,25 */
export const liters = (glasses: number) => (glasses * 0.25).toLocaleString('vi-VN', { maximumFractionDigits: 2 })

/** Bài trong nhật ký nhưng không có trong lịch hôm nay (tập thêm từ thư viện) thì lấy mức gợi ý theo hồ sơ */
function itemsOf(log: DayLog, profile: Profile, session?: Session | null): PlanItem[] {
  return Object.keys(log.sets)
    .filter((id) => log.sets[id] > 0)
    .map((id) => session?.items.find((it) => it.exId === id) ?? (exById(id) ? { exId: id, ...prescribe(exById(id)!, profile) } : null))
    .filter((x): x is PlanItem => x !== null)
}

/** Calo đốt và phút tập thật sự trong ngày, tính theo số hiệp đã xong */
export function dayWork(log: DayLog | undefined, profile: Profile, session?: Session | null) {
  if (!log) return { kcal: 0, minutes: 0 }
  let kcal = 0
  let sec = 0
  for (const it of itemsOf(log, profile, session)) {
    const ex = exById(it.exId)!
    const share = Math.min(1, (log.sets[it.exId] ?? 0) / it.sets)
    kcal += (ex.met * profile.weightKg * itemSeconds(it) * share) / 3600
    sec += itemSeconds(it) * share
  }
  // Khởi động và giãn cơ: MET khoảng 2,5
  for (const phase of ['warmup', 'cooldown'] as const) {
    if (!log[phase]) continue
    const m = stretchMinutes(STRETCHES[phase])
    sec += m * 60
    kcal += (2.5 * profile.weightKg * m) / 60
  }
  return { kcal: Math.round(kcal), minutes: Math.round(sec / 60) }
}

/** Calo dự kiến của cả buổi (gồm khởi động và giãn cơ) */
export function plannedKcal(session: Session, profile: Profile) {
  const full: DayLog = { sets: Object.fromEntries(session.items.map((it) => [it.exId, it.sets])), warmup: true, cooldown: true }
  return dayWork(full, profile, session).kcal
}

export interface Metric {
  key: 'kcal' | 'steps' | 'minutes' | 'water'
  name: string
  value: number
  target: number
  /** Số hiển thị lớn, ví dụ 6.842 hoặc 1,25 */
  show: string
  /** Mục tiêu hiển thị nhỏ, ví dụ /8.000 */
  of: string
  plate: Plate
}

/** Bốn đĩa trên thanh đòn trang chủ: calo đốt, bước chân, phút tập, nước */
export function dailyMetrics(log: DayLog | undefined, profile: Profile, session: Session | null): Metric[] {
  const work = dayWork(log, profile, session)
  // Ngày nghỉ vẫn có mục tiêu vận động nhẹ: đi bộ, giãn cơ
  const kcalGoal = session ? plannedKcal(session, profile) : 120
  const minGoal = session ? session.minutes : 20
  const steps = log?.steps ?? 0
  const water = log?.water ?? 0
  const vn = (n: number) => n.toLocaleString('vi-VN')
  return [
    { key: 'kcal', name: 'Calo đốt', value: work.kcal, target: kcalGoal, show: vn(work.kcal), of: `/${vn(kcalGoal)} kcal`, plate: 'red' },
    { key: 'steps', name: 'Bước', value: steps, target: STEP_GOAL, show: vn(steps), of: `/${vn(STEP_GOAL)}`, plate: 'green' },
    { key: 'minutes', name: 'Phút tập', value: work.minutes, target: minGoal, show: vn(work.minutes), of: `/${minGoal} phút`, plate: 'yellow' },
    { key: 'water', name: 'Nước', value: water, target: WATER_GOAL, show: liters(water), of: `/${liters(WATER_GOAL)} lít`, plate: 'blue' },
  ]
}

/** % hoàn thành trung bình của bốn đĩa */
export const dailyPercent = (m: Metric[]) => Math.round((m.reduce((a, x) => a + Math.min(1, x.value / Math.max(1, x.target)), 0) / m.length) * 100)
