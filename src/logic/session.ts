import { exById } from '../data/exercises'
import type { DayLog } from '../store'
import { itemSeconds, type PlanItem, type Session } from './plan'

export const setsDone = (it: PlanItem, log?: DayLog) => Math.min(it.sets, log?.sets[it.exId] ?? 0)
export const itemDone = (it: PlanItem, log?: DayLog) => setsDone(it, log) >= it.sets
export const doneCount = (s: Session, log?: DayLog) => s.items.filter((it) => itemDone(it, log)).length

/** Bài đầu tiên chưa xong, hoặc -1 nếu đã xong hết */
export const nextIndex = (s: Session, log?: DayLog) => s.items.findIndex((it) => !itemDone(it, log))

/**
 * Calo ước tính theo MET: kcal = MET × cân nặng (kg) × số giờ của bài (gồm cả nghỉ giữa hiệp),
 * nhân tỉ lệ số hiệp đã tập. planned = true để ước tính cả buổi trước khi tập.
 */
export function burnedKcal(items: PlanItem[], log: DayLog | undefined, weightKg: number, planned = false) {
  return Math.round(
    items.reduce((sum, it) => {
      const ex = exById(it.exId)
      if (!ex) return sum
      const share = planned ? 1 : setsDone(it, log) / it.sets
      return sum + (ex.met * weightKg * itemSeconds(it) * share) / 3600
    }, 0),
  )
}
