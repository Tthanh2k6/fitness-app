import type { Muscle } from 'react-body-highlighter'
import { exById } from '../data/exercises'
import type { Group } from '../data/muscles'
import { addDays, isoDate, mondayOf, weekdayIndex } from '../lib/format'
import type { DayLog, Logs } from '../store'
import type { WeekPlan } from './plan'

export const isActive = (d?: DayLog) => !!d && Object.values(d.sets).some((n) => n > 0)

/**
 * Chuỗi ngày tập: đi lùi từ hôm nay, ngày nghỉ theo lịch không làm đứt chuỗi,
 * hôm nay chưa tập cũng chưa tính là đứt.
 */
export function streak(logs: Logs, plan: WeekPlan, today: Date) {
  let count = 0
  for (let i = 0; i < 366; i++) {
    const d = addDays(today, -i)
    const active = isActive(logs.days[isoDate(d)])
    if (active) count++
    else if (i === 0 || plan[weekdayIndex(d)] === null) continue
    else break
  }
  return count
}

export function totals(logs: Logs) {
  const days = Object.values(logs.days).filter(isActive)
  return {
    sessions: days.length,
    exercises: days.reduce((s, d) => s + Object.values(d.sets).filter((n) => n > 0).length, 0),
  }
}

/** Số lần mỗi cơ được tập (cơ chính của các bài đã làm) từ thứ Hai đến hôm nay */
export function weekMuscles(logs: Logs, today: Date): { muscle: Muscle; times: number }[] {
  const count = new Map<Muscle, number>()
  for (let d = mondayOf(today); d <= today; d = addDays(d, 1)) {
    const log = logs.days[isoDate(d)]
    if (!log) continue
    for (const [id, n] of Object.entries(log.sets)) {
      if (n <= 0) continue
      for (const m of exById(id)?.primary ?? []) count.set(m, (count.get(m) ?? 0) + 1)
    }
  }
  return [...count].map(([muscle, times]) => ({ muscle, times: Math.min(times, 3) }))
}

/** Nhóm cơ tập nhiều nhất trong ngày, để tô màu lịch tháng */
export function mainGroup(log?: DayLog): Group | null {
  if (!isActive(log)) return null
  const count = new Map<Group, number>()
  for (const [id, n] of Object.entries(log!.sets)) {
    const g = exById(id)?.group
    if (g && n > 0) count.set(g, (count.get(g) ?? 0) + n)
  }
  return [...count].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
}
