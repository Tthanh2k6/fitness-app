import { useMemo } from 'react'
import { addDays, isoDate, mondayOf, weekdayIndex } from '../lib/format'
import { useProfile, type Profile } from '../profile'
import { useStore } from '../store'
import { adjustBefore, applyAdjust } from './adjust'
import { buildWeekPlan, type WeekPlan } from './plan'

// v2: lịch xếp theo kiểu chuyển động, thư viện 120 bài
const PLAN_KEY = 'fitcoach.plan.v2'

// Chỉ những lựa chọn này mới làm lịch tập thay đổi
const planSignature = (p: Profile) =>
  JSON.stringify([p.goal, p.level, p.minutes, p.days, p.place, [...p.equipment].sort(), [...p.focus].sort()])

/**
 * Lịch tuần được lưu lại trên máy: mở lại app vẫn đúng các bài đã giao,
 * chỉ sinh lịch mới khi người dùng đổi mục tiêu, trình độ, thời gian, nơi tập hoặc vùng tập.
 */
function loadOrBuildPlan(p: Profile): WeekPlan {
  const sig = planSignature(p)
  try {
    const saved = JSON.parse(localStorage.getItem(PLAN_KEY) ?? 'null') as { sig: string; week: WeekPlan } | null
    if (saved?.sig === sig && Array.isArray(saved.week) && saved.week.length === 7) return saved.week
  } catch {
    // dữ liệu hỏng thì sinh lại
  }
  const week = buildWeekPlan(p)
  try {
    localStorage.setItem(PLAN_KEY, JSON.stringify({ sig, week }))
  } catch {
    // không lưu được thì vẫn dùng lịch vừa sinh
  }
  return week
}

/**
 * Lịch tuần, buổi tập hôm nay và nhật ký hôm nay.
 * Số lần, số hiệp, thời gian nghỉ đã được điều chỉnh theo cảm nhận sau các buổi trước (logic/adjust.ts).
 */
export function useToday() {
  const { profile } = useProfile()
  const store = useStore()
  const sig = planSignature(profile)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const base = useMemo(() => loadOrBuildPlan(profile), [sig])
  const now = new Date()
  const date = isoDate(now)
  const dow = weekdayIndex(now)
  const monday = mondayOf(now)
  // Mỗi ngày dùng mức điều chỉnh tính đến hết hôm trước: ngày đã tập không đổi, ngày sắp tới thấy ngay thay đổi
  const adjusts = base.map((_, i) => adjustBefore(store.logs, isoDate(addDays(monday, i))))
  const key = JSON.stringify(adjusts)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const week = useMemo(() => base.map((s, i) => applyAdjust(s, adjusts[i])), [base, key])
  return { profile, store, week, now, date, dow, adjust: adjusts[dow], session: week[dow], log: store.logs.days[date] }
}
