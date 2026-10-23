import type { Logs } from '../store'
import type { PlanItem, Session } from './plan'

/** Mức điều chỉnh lịch tập cộng dồn từ cảm nhận (RPE) sau các buổi trước */
export interface Adjust {
  /** Cộng/trừ số lần mỗi hiệp (bài tính giờ: ×2,5 giây) */
  reps: number
  /** Cộng thêm giây nghỉ giữa hiệp */
  rest: number
  /** Cộng/trừ số hiệp mỗi bài */
  sets: number
}

export const NO_ADJUST: Adjust = { reps: 0, rest: 0, sets: 0 }

export const RPE_LABEL = ['Nhẹ', 'Vừa sức', 'Khá nặng', 'Quá sức'] as const

/** Buổi sau sẽ thay đổi thế nào theo cảm nhận của buổi này */
export const RPE_EFFECT = [
  'tăng thêm 2 lần mỗi hiệp',
  'giữ nguyên độ nặng',
  'giữ nguyên số lần, nghỉ lâu hơn 15 giây',
  'giảm 1 hiệp mỗi bài',
] as const

function step(a: Adjust, rpe: number): Adjust {
  switch (rpe) {
    case 0: return { reps: Math.min(6, a.reps + 2), rest: Math.max(0, a.rest - 15), sets: Math.min(0, a.sets + 1) }
    case 2: return { ...a, rest: Math.min(30, a.rest + 15) }
    case 3: return { reps: Math.max(-4, Math.min(0, a.reps)), rest: a.rest, sets: Math.max(-1, a.sets - 1) }
    default: return a
  }
}

/**
 * Cộng dồn cảm nhận của mọi buổi trước ngày `date` (dạng 2026-10-22).
 * Không tính buổi của chính ngày đó để bài hôm nay không đổi giữa chừng.
 */
export function adjustBefore(logs: Logs, date: string): Adjust {
  return Object.keys(logs.days)
    .filter((d) => d < date && logs.days[d].rpe !== undefined)
    .sort()
    .reduce((a, d) => step(a, logs.days[d].rpe!), NO_ADJUST)
}

export function applyAdjustItem(it: PlanItem, a: Adjust): PlanItem {
  if (!a.reps && !a.rest && !a.sets) return it
  const amount = it.unit === 'lần'
    ? Math.max(4, it.amount + a.reps)
    : it.amount >= 120 ? it.amount : Math.max(15, it.amount + Math.round(a.reps * 2.5))
  return { ...it, amount, sets: Math.max(1, it.sets + a.sets), rest: it.rest + a.rest }
}

export function applyAdjust(s: Session | null, a: Adjust): Session | null {
  if (!s || (!a.reps && !a.rest && !a.sets)) return s
  return { ...s, items: s.items.map((it) => applyAdjustItem(it, a)) }
}
