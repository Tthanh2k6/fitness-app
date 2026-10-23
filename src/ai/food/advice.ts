import type { Goal } from '../../profile'

export type Portion = 's' | 'm' | 'l'
export type Slot = 'Sáng' | 'Trưa' | 'Bữa phụ' | 'Tối'

/** Tỉ lệ calo của mỗi bữa trong ngày */
export const MEAL_SHARE: Record<Slot, number> = { 'Sáng': 0.25, 'Trưa': 0.35, 'Bữa phụ': 0.1, 'Tối': 0.3 }

export function mealSlot(date: Date): Slot {
  const h = date.getHours()
  if (h < 10) return 'Sáng'
  if (h < 14) return 'Trưa'
  if (h < 17) return 'Bữa phụ'
  return 'Tối'
}

export interface Advice {
  tone: 'good' | 'warn'
  title: string
  tip: string
}

const TOLERANCE = 0.15

export function adviseMeal(o: { kcal: number; proteinG: number; dailyKcal: number; slot: Slot; goal: Goal }): Advice {
  const target = Math.round((o.dailyKcal * MEAL_SHARE[o.slot]) / 10) * 10
  const diff = o.kcal - target
  const pct = diff / target
  const meal = `bữa ${o.slot.toLowerCase()}`
  const lowProtein = o.goal === 'muscle' && o.proteinG < 25 ? ` Bữa này mới có ${Math.round(o.proteinG)}g đạm, nên thêm trứng, thịt nạc hoặc sữa chua.` : ''

  if (Math.abs(pct) <= TOLERANCE) {
    return { tone: 'good', title: `Vừa đủ cho ${meal} (~${target} kcal)`, tip: `Giữ khẩu phần như vậy.${lowProtein}` }
  }
  if (diff > 0) {
    if (o.goal === 'gain' && pct <= 0.4) {
      return { tone: 'good', title: `Nhiều hơn ${diff} kcal so với ${meal}`, tip: `Hợp với mục tiêu tăng cân.${lowProtein}` }
    }
    return {
      tone: 'warn',
      title: `Dư ${diff} kcal so với ${meal}`,
      tip: o.goal === 'lose'
        ? 'Bớt khoảng 1/3 phần tinh bột (cơm, bún, bánh) hoặc bỏ món chiên ăn kèm.'
        : `Bớt bớt tinh bột, ưu tiên phần thịt và rau.${lowProtein}`,
    }
  }
  if (o.goal === 'lose') {
    return { tone: 'good', title: `Ít hơn ${-diff} kcal so với ${meal}`, tip: 'Ổn cho mục tiêu giảm cân, nhớ ăn đủ rau và đạm.' }
  }
  return {
    tone: 'warn',
    title: `Thiếu ${-diff} kcal cho ${meal}`,
    tip: o.goal === 'gain' ? 'Thêm một quả trứng, một ly sữa hoặc thêm cơm.' : `Thêm nguồn đạm như trứng, thịt nạc, sữa chua.${lowProtein}`,
  }
}
