import { addDays, isoDate, weekdayIndex } from '../lib/format'
import type { Profile } from '../profile'
import { EMPTY_LOGS, type DayLog, type Logs, type MealLog } from '../store'
import { foodById } from './meals'
import { buildWeekPlan } from './plan'

/** Số ngẫu nhiên có hạt giống: cùng ngày nạp thì ra cùng dữ liệu */
function rng(seed: number) {
  let s = seed % 233280
  return () => (s = (s * 9301 + 49297) % 233280) / 233280
}

const pad = (n: number) => String(n).padStart(2, '0')
const clockAt = (min: number) => `${pad(Math.floor(((min % 1440) + 1440) % 1440 / 60))}:${pad(((min % 60) + 60) % 60)}`

const MENU: [string, string, string][][] = [
  // [bữa, id món, giờ]
  [['Sáng', 'yen-mach', '07:30'], ['Trưa', 'com-ga-luoc', '12:15'], ['Bữa phụ', 'sua-tuoi-khong-duong', '15:40'], ['Tối', 'salad-uc-ga', '19:10']],
  [['Sáng', 'trung-banh-mi', '07:10'], ['Trưa', 'com-tam', '12:00'], ['Bữa phụ', 'chuoi', '16:00'], ['Tối', 'dau-hu-sot-ca', '18:50']],
  [['Sáng', 'pho', '07:45'], ['Trưa', 'com-gao-lut-uc-ga', '12:20'], ['Bữa phụ', 'hai-trung-luoc', '15:30'], ['Tối', 'canh-chua-gao-lut', '19:00']],
  [['Sáng', 'sua-chua-chuoi', '07:20'], ['Trưa', 'bun-bo-hue', '12:10'], ['Bữa phụ', 'trai-cay', '15:50'], ['Tối', 'bo-xao-com', '19:20']],
  [['Sáng', 'banh-mi', '07:05'], ['Trưa', 'canh-chua-gao-lut', '12:30'], ['Bữa phụ', 'sua-chua-khong-duong', '16:10'], ['Tối', 'goi-cuon', '18:40']],
]

/**
 * Nhật ký mẫu khoảng 7 tuần để trình diễn: buổi tập theo đúng lịch của hồ sơ (một buổi lỡ, vài buổi tập dở),
 * số lần tăng dần để có kỷ lục, nước, bước chân, giấc ngủ, nhịp tim, cân nặng giảm/tăng dần về cân hiện tại,
 * số đo cơ thể, bữa ăn 5 ngày gần nhất và một thử thách đang tham gia.
 * Trả về kèm cân nặng lúc bắt đầu để cập nhật hồ sơ.
 */
export function makeDemoLogs(profile: Profile, today: Date): { logs: Logs; startKg: number } {
  const r = rng(today.getFullYear() * 400 + today.getMonth() * 31 + today.getDate())
  const plan = buildWeekPlan(profile)
  const DAYS = 49
  const days: Record<string, DayLog> = {}
  const missedDay = 23

  for (let i = DAYS; i >= 1; i--) {
    const d = addDays(today, -i)
    const session = plan[weekdayIndex(d)]
    const progress = (DAYS - i) / DAYS // 0 → 1: càng gần hôm nay càng khoẻ hơn
    const bed = 22 * 60 + 40 + Math.round(r() * 60) // 22:40–23:40
    const sleepLen = 380 + Math.round(r() * 90) // 6g20–7g50
    const log: DayLog = {
      sets: {},
      water: 5 + Math.floor(r() * 4),
      // 11 ngày gần nhất đang theo thử thách 8.000 bước: hầu hết đều đạt
      steps: i <= 11 ? (i === 6 ? 7200 : 8000 + Math.round(r() * 2500)) : 4000 + Math.round(r() * 6000),
      sleep: { bed: clockAt(bed), wake: clockAt(bed + sleepLen) },
      hr: 60 + Math.floor(r() * 8),
      mood: 1 + Math.floor(r() * 3),
    }
    if (session && i !== missedDay) {
      const partial = i % 11 === 0
      session.items.forEach((it, k) => {
        const sets = partial && k === session.items.length - 1 ? Math.max(1, it.sets - 1) : it.sets
        log.sets[it.exId] = sets
        const amount = it.unit === 'lần'
          ? Math.max(4, it.amount - 2 + Math.round(progress * 4))
          : Math.max(15, it.amount - 10 + Math.round(progress * 20))
        log.reps = { ...log.reps, [it.exId]: amount }
      })
      log.warmup = true
      log.cooldown = !partial
      log.rpe = 1
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 18, 30 + Math.floor(r() * 30))
      log.startedAt = start.getTime()
      log.finishedAt = start.getTime() + (session.minutes + Math.round(r() * 8 - 3)) * 60000
    }
    days[isoDate(d)] = log
  }
  // Hôm nay: chỉ có nước, giấc ngủ đêm qua và nhịp tim buổi sáng
  days[isoDate(today)] = { sets: {}, water: 3, sleep: { bed: '23:05', wake: '06:30' }, hr: 63 }

  // Cân nặng mỗi tuần một lần, tiến dần về cân hiện tại
  const now = profile.weightKg
  const startKg = profile.startKg !== now
    ? profile.startKg
    : profile.goal === 'lose' ? now + 2.6 : profile.goal === 'health' ? now + 0.4 : now - 1.6
  const weights: Logs['weights'] = []
  for (let w = 0; w <= 7; w++) {
    const t = w / 7
    const wobble = w > 0 && w < 7 ? (r() - 0.5) * 0.3 : 0
    weights.push({ date: isoDate(addDays(today, -DAYS + w * 7)), kg: Math.round((startKg + (now - startKg) * t + wobble) * 10) / 10 })
  }

  const female = profile.sex === 'female'
  const measures: Logs['measures'] = [
    { date: isoDate(addDays(today, -DAYS)), waist: female ? 71 : 84, hip: female ? 93 : 96, fat: female ? 28 : 22 },
    { date: isoDate(addDays(today, -2)), waist: female ? 68 : 81, hip: female ? 92 : 95, fat: female ? 26 : 20 },
  ]

  const meals: MealLog[] = []
  for (let i = 5; i >= 1; i--) {
    const date = isoDate(addDays(today, -i))
    for (const [slot, id, time] of MENU[i % MENU.length]) {
      const f = foodById(id)
      if (!f) continue
      meals.push({ id: `demo-${date}-${slot}`, date, slot, name: f.name, kcal: f.kcal, proteinG: f.proteinG, carbG: f.carbG, fatG: f.fatG, price: f.price, foodId: f.id, time })
    }
  }

  return {
    startKg: Math.round(startKg * 10) / 10,
    logs: {
      ...EMPTY_LOGS,
      days,
      weights,
      meals,
      measures,
      challenges: { 'steps-8000': isoDate(addDays(today, -11)) },
      demo: true,
    },
  }
}
