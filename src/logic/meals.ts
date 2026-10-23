import { DISHES } from '../ai/food/dishes'
import { MEAL_SHARE, type Slot } from '../ai/food/advice'
import type { Goal } from '../profile'
import type { MealLog } from '../store'

export interface Food {
  id: string
  name: string
  kcal: number
  proteinG: number
  carbG: number
  fatG: number
  price: number
  /** Món ăn nhẹ, chỉ gợi ý cho bữa phụ */
  snack?: boolean
  /** Món tự nấu được ở nhà (có công thức trong data/recipes.ts) */
  home?: boolean
}

// Món ăn lành mạnh hay gặp, bổ sung cho 28 món AI nhận diện được (số liệu ước tính cho 1 phần)
const EXTRA: Food[] = [
  { id: 'canh-chua-gao-lut', name: 'Canh cá nấu chua, cơm gạo lứt', kcal: 450, proteinG: 32, carbG: 58, fatG: 10, price: 45000, home: true },
  { id: 'salad-uc-ga', name: 'Salad ức gà sốt mè rang', kcal: 420, proteinG: 34, carbG: 22, fatG: 21, price: 40000, home: true },
  { id: 'dau-hu-sot-ca', name: 'Đậu hũ sốt cà chua, cơm gạo lứt', kcal: 390, proteinG: 20, carbG: 55, fatG: 10, price: 30000, home: true },
  { id: 'com-gao-lut-uc-ga', name: 'Cơm gạo lứt, ức gà áp chảo', kcal: 560, proteinG: 45, carbG: 62, fatG: 14, price: 45000, home: true },
  { id: 'trung-banh-mi', name: 'Hai trứng luộc, bánh mì', kcal: 350, proteinG: 16, carbG: 40, fatG: 13, price: 15000, home: true },
  { id: 'sua-chua-chuoi', name: 'Sữa chua Hy Lạp, chuối', kcal: 220, proteinG: 12, carbG: 35, fatG: 4, price: 20000, home: true },
  { id: 'com-ga-luoc', name: 'Cơm gà luộc', kcal: 520, proteinG: 35, carbG: 62, fatG: 14, price: 35000, home: true },
  { id: 'yen-mach', name: 'Yến mạch, trứng, chuối', kcal: 480, proteinG: 24, carbG: 62, fatG: 15, price: 20000, home: true },
  { id: 'bo-xao-com', name: 'Bò xào rau, cơm', kcal: 620, proteinG: 38, carbG: 70, fatG: 20, price: 45000, home: true },
  { id: 'sinh-to-bo', name: 'Sinh tố bơ chuối', kcal: 450, proteinG: 8, carbG: 48, fatG: 26, price: 25000, home: true },
  { id: 'khoai-lang-sua', name: 'Khoai lang luộc, sữa tươi', kcal: 300, proteinG: 9, carbG: 55, fatG: 5, price: 18000, home: true },
  { id: 'xoi-ga', name: 'Xôi gà', kcal: 550, proteinG: 22, carbG: 80, fatG: 15, price: 25000 },
  { id: 'com-ga-xoi-mo', name: 'Cơm gà xối mỡ', kcal: 800, proteinG: 38, carbG: 85, fatG: 34, price: 40000 },
  { id: 'mi-y-bo-bam', name: 'Mì Ý bò bằm', kcal: 750, proteinG: 32, carbG: 90, fatG: 28, price: 45000, home: true },
  // Bữa phụ nhẹ, khoảng 100–200 kcal
  { id: 'chuoi', name: 'Một quả chuối', kcal: 105, proteinG: 1, carbG: 27, fatG: 0, price: 5000, snack: true },
  { id: 'sua-chua-khong-duong', name: 'Hộp sữa chua không đường', kcal: 100, proteinG: 5, carbG: 8, fatG: 5, price: 8000, snack: true },
  { id: 'sua-tuoi-khong-duong', name: 'Hộp sữa tươi không đường', kcal: 120, proteinG: 6, carbG: 9, fatG: 7, price: 8000, snack: true },
  { id: 'hai-trung-luoc', name: 'Hai quả trứng luộc', kcal: 150, proteinG: 12, carbG: 1, fatG: 10, price: 8000, snack: true },
  { id: 'khoai-lang', name: 'Một củ khoai lang luộc', kcal: 130, proteinG: 2, carbG: 30, fatG: 0, price: 8000, snack: true },
  { id: 'sua-dau-nanh', name: 'Ly sữa đậu nành', kcal: 130, proteinG: 7, carbG: 15, fatG: 5, price: 8000, snack: true },
  { id: 'trai-cay', name: 'Đĩa ổi, táo', kcal: 90, proteinG: 1, carbG: 22, fatG: 0, price: 15000, snack: true },
  { id: 'hat-dieu', name: 'Một nắm hạt điều (30 g)', kcal: 170, proteinG: 5, carbG: 9, fatG: 13, price: 15000, snack: true },
]

export const FOODS: Food[] = [
  ...DISHES.map((d) => ({
    id: d.id, name: d.name, kcal: d.kcal.m, proteinG: d.proteinG, carbG: d.carbG, fatG: d.fatG,
    price: Math.round((d.priceVnd[0] + d.priceVnd[1]) / 2000) * 1000,
  })),
  ...EXTRA,
]

export const foodById = (id?: string) => (id ? FOODS.find((f) => f.id === id) : undefined)
export const foodByName = (name: string) => FOODS.find((f) => f.name === name)

const MIN_SLOT_BUDGET = 20000

/** Gợi ý món cho một bữa: vừa túi tiền của bữa đó, rồi xếp theo mục tiêu */
export function suggestMeals(o: { dailyKcal: number; budget: number; goal: Goal; slot: Slot; n?: number; maxPrice?: number }): Food[] {
  const share = MEAL_SHARE[o.slot]
  const target = o.dailyKcal * share
  const slotBudget = Math.max(MIN_SLOT_BUDGET, o.budget * (o.slot === 'Bữa phụ' ? 0.15 : share + 0.05))
  const budget = o.maxPrice !== undefined ? Math.max(MIN_SLOT_BUDGET, Math.min(slotBudget * 1.3, o.maxPrice)) : slotBudget
  const foods = FOODS.filter((f) => !f.snack || o.slot === 'Bữa phụ')
  const affordable = foods.filter((f) => f.price <= budget)
  const pool = affordable.length >= 3 ? affordable : [...foods].sort((a, b) => a.price - b.price).slice(0, 6)
  const fit = (k: number, aim: number) => -Math.abs(k - aim) / aim
  const score = (f: Food) => {
    const proteinDensity = (f.proteinG * 4) / f.kcal // tỉ lệ năng lượng đến từ đạm
    // Giảm cân: hơi dưới mức calo của bữa, ưu tiên nhiều đạm. Tăng cân: trên mức. Tăng cơ: đúng mức, nhiều đạm
    if (o.goal === 'lose') return 2 * fit(f.kcal, target * 0.85) + 1.5 * proteinDensity
    if (o.goal === 'gain') return 2 * fit(f.kcal, target * 1.2) + 0.3 * (f.kcal / target)
    if (o.goal === 'health') return 2 * fit(f.kcal, target) + 0.4 * proteinDensity + (f.home ? 0.1 : 0)
    return 2 * fit(f.kcal, target) + proteinDensity
  }
  return [...pool].sort((a, b) => score(b) - score(a)).slice(0, o.n ?? 4)
}

export type Tone = 'red' | 'blue' | 'yellow' | 'green'

/** Nhãn lý do gợi ý món: nhiều đạm, ít tinh bột, rẻ nhất trong danh sách, hợp sau buổi tập */
export function foodReason(f: Food, list: Food[], trainedToday: boolean): { text: string; tone: Tone } {
  const pShare = (f.proteinG * 4) / f.kcal
  const cShare = (f.carbG * 4) / f.kcal
  if (trainedToday && f.proteinG >= 30 && cShare >= 0.35) return { text: 'Sau buổi tập', tone: 'red' }
  if (pShare >= 0.27) return { text: 'Nhiều đạm', tone: 'green' }
  if (cShare <= 0.3) return { text: 'Ít tinh bột', tone: 'blue' }
  if (list.length > 1 && f.price <= Math.min(...list.map((x) => x.price))) return { text: 'Rẻ nhất', tone: 'yellow' }
  if (f.kcal <= 200) return { text: 'Ăn nhẹ', tone: 'yellow' }
  return { text: 'Vừa calo', tone: 'blue' }
}

/** Tinh bột và chất béo của bữa đã ghi; bữa ghi từ bản cũ không có thì ước tính từ calo còn lại */
export function mealMacros(m: MealLog) {
  if (m.carbG !== undefined && m.fatG !== undefined) return { protein: m.proteinG, carb: m.carbG, fat: m.fatG }
  const f = foodById(m.foodId) ?? foodByName(m.name)
  if (f) {
    const k = m.kcal / f.kcal
    return { protein: m.proteinG, carb: Math.round(f.carbG * k), fat: Math.round(f.fatG * k) }
  }
  const rest = Math.max(0, m.kcal - m.proteinG * 4)
  return { protein: m.proteinG, carb: Math.round((rest * 0.65) / 4), fat: Math.round((rest * 0.35) / 9) }
}

/** Tổng calo, đạm, tinh bột, chất béo, tiền của các bữa trong một ngày */
export function dayNutrition(meals: MealLog[]) {
  return meals.reduce(
    (t, m) => {
      const x = mealMacros(m)
      return { kcal: t.kcal + m.kcal, protein: t.protein + x.protein, carb: t.carb + x.carb, fat: t.fat + x.fat, spent: t.spent + m.price }
    },
    { kcal: 0, protein: 0, carb: 0, fat: 0, spent: 0 },
  )
}

export const SLOTS = Object.keys(MEAL_SHARE) as Slot[]
/** Màu từng bữa trên thanh calo: sáng vàng, trưa đỏ, bữa phụ xanh lá, tối xanh dương */
export const SLOT_TONE: Record<Slot, Tone> = { 'Sáng': 'yellow', 'Trưa': 'red', 'Bữa phụ': 'green', 'Tối': 'blue' }
