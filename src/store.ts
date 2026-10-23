import { createContext, useContext } from 'react'

/** Nhật ký một ngày */
export interface DayLog {
  /** Số hiệp đã xong của từng bài (theo id bài) */
  sets: Record<string, number>
  /** Số lần (hoặc số giây) tốt nhất trong một hiệp của từng bài, để tính kỷ lục */
  reps?: Record<string, number>
  /** Kết quả camera AI của từng bài: số lần đếm được, số lần đúng dáng, số lần mắc từng lỗi */
  form?: Record<string, { reps: number; good: number; issues: Record<string, number> }>
  warmup?: boolean
  cooldown?: boolean
  startedAt?: number
  finishedAt?: number
  /** Cảm nhận sau buổi tập: 0 nhẹ · 1 vừa sức · 2 khá nặng · 3 quá sức */
  rpe?: number
  /** Số ly nước 250 ml */
  water?: number
  /** Số bước chân (nhập tay từ ứng dụng sức khỏe của điện thoại) */
  steps?: number
  /** Giấc ngủ đêm trước ngày này, giờ dạng 23:10 */
  sleep?: { bed: string; wake: string }
  /** Nhịp tim lúc nghỉ (nhịp/phút), đo buổi sáng */
  hr?: number
  /** Hôm nay thấy thế nào: 0 mệt · 1 bình thường · 2 khỏe · 3 rất khỏe */
  mood?: number
  /** id các thử thách tự đánh dấu đã đạt trong ngày (ví dụ "Không trà sữa") */
  checks?: string[]
}

export interface MealLog {
  id: string
  date: string
  slot: string
  name: string
  kcal: number
  proteinG: number
  carbG?: number
  fatG?: number
  price: number
  /** id món trong FOODS (logic/meals.ts), để vẽ hình và mở công thức */
  foodId?: string
  /** Giờ ghi, dạng 12:15 */
  time?: string
}

/** Số đo cơ thể: vòng eo, vòng mông (cm), % mỡ */
export interface Measure {
  date: string
  waist?: number
  hip?: number
  fat?: number
}

export interface ShoppingItem {
  name: string
  qty: string
  done: boolean
}

export interface Logs {
  days: Record<string, DayLog>
  weights: { date: string; kg: number }[]
  meals: MealLog[]
  measures: Measure[]
  /** Thử thách đang tham gia: id → ngày tham gia */
  challenges: Record<string, string>
  /** id bài tập và id món đã lưu */
  favorites: string[]
  shopping: ShoppingItem[]
  /** Đang dùng dữ liệu mẫu để trình diễn */
  demo?: boolean
}

export const EMPTY_LOGS: Logs = { days: {}, weights: [], meals: [], measures: [], challenges: {}, favorites: [], shopping: [] }

export interface StoreApi {
  logs: Logs
  /** Cộng thêm hiệp đã xong cho một bài (mặc định +1); `reps` là số lần/số giây của hiệp vừa xong */
  addSets: (date: string, exId: string, n?: number, reps?: number) => void
  setSets: (date: string, exId: string, n: number, reps?: number) => void
  /** Cộng kết quả camera AI của một hiệp vào nhật ký */
  addForm: (date: string, exId: string, r: { reps: number; good: number; issues: Record<string, number> }) => void
  markStretch: (date: string, phase: 'warmup' | 'cooldown') => void
  startSession: (date: string) => void
  finishSession: (date: string) => void
  /** Ghi các chỉ số trong ngày: nước, bước, giấc ngủ, nhịp tim, cảm nhận, RPE */
  patchDay: (date: string, patch: Partial<Omit<DayLog, 'sets'>>) => void
  logWeight: (date: string, kg: number) => void
  logMeasure: (m: Measure) => void
  addMeal: (meal: Omit<MealLog, 'id'>) => void
  removeMeal: (id: string) => void
  joinChallenge: (id: string, date: string) => void
  leaveChallenge: (id: string) => void
  toggleFavorite: (id: string) => void
  addShopping: (items: { name: string; qty: string }[]) => void
  toggleShopping: (index: number) => void
  clearShopping: (onlyDone?: boolean) => void
  /** Thay toàn bộ nhật ký (nạp dữ liệu mẫu) */
  replaceAll: (logs: Logs) => void
  resetAll: () => void
}

export const StoreContext = createContext<StoreApi | null>(null)

export function useStore() {
  const s = useContext(StoreContext)
  if (!s) throw new Error('useStore phải nằm trong StoreProvider')
  return s
}
