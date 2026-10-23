import type { Muscle } from 'react-body-highlighter'
import { LIBRARY, type Ex, type Gear, type Pattern } from '../data/exercises'
import type { Group } from '../data/muscles'
import type { Goal, Level, Profile } from '../profile'

/** Một bài trong buổi tập: số hiệp, số lần (hoặc số giây), thời gian nghỉ */
export interface PlanItem {
  exId: string
  sets: number
  /** Số lần mỗi hiệp, hoặc số giây nếu bài tính giờ */
  amount: number
  unit: 'lần' | 'giây'
  perSide: boolean
  rest: number
}

export type SessionKind = 'full' | 'lower' | 'upper' | 'cardio'

export interface Session {
  kind: SessionKind
  title: string
  groups: Group[]
  items: PlanItem[]
  minutes: number
}

/** 7 phần tử, thứ Hai → Chủ nhật; null là ngày nghỉ */
export type WeekPlan = (Session | null)[]

const TITLE: Record<SessionKind, string> = {
  full: 'Toàn thân',
  lower: 'Chân & mông',
  upper: 'Ngực, lưng & tay',
  cardio: 'Đốt mỡ & cardio',
}

// Ngày tập trong tuần theo số buổi (0 = thứ Hai), xếp ngày nghỉ xen kẽ
const TRAINING_DAYS: Record<number, number[]> = {
  2: [0, 3], 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 4, 5], 6: [0, 1, 2, 3, 4, 5],
}

function sessionKinds(days: number, p: Profile): SessionKind[] {
  // Khỏe hơn mỗi ngày: xếp lịch như giảm cân để có buổi cardio xen kẽ
  const lose = p.goal === 'lose' || p.goal === 'health'
  switch (days) {
    case 2: return ['full', 'full']
    // Người mới tập toàn thân 3 buổi/tuần: mỗi nhóm cơ được tập nhiều lần, mỗi buổi không quá mệt
    case 3:
      if (p.level === 'beginner') return lose ? ['full', 'cardio', 'full'] : ['full', 'full', 'full']
      return lose ? ['lower', 'upper', 'cardio'] : ['lower', 'upper', 'full']
    case 4: return lose ? ['lower', 'upper', 'cardio', 'full'] : ['lower', 'upper', 'lower', 'upper']
    case 5: return ['lower', 'upper', lose ? 'cardio' : 'full', 'lower', 'upper']
    default: return ['lower', 'upper', 'cardio', 'lower', 'upper', lose ? 'cardio' : 'full']
  }
}

/** Một vị trí trong buổi: lấy kiểu chuyển động đầu tiên chưa có trong buổi và có bài phù hợp */
type Slot = Pattern[]

// Bài nhiều khớp, nặng nhất đứng đầu khi còn khoẻ; bài cô lập và bụng ở cuối
const TEMPLATE: Record<SessionKind, Slot[]> = {
  full: [['squat'], ['push'], ['hinge', 'glute'], ['row', 'pulldown'], ['lunge'], ['press', 'shoulder'], ['core-hold'], ['core-move', 'core-rotate'], ['biceps', 'triceps'], ['glute', 'calf']],
  lower: [['squat'], ['hinge'], ['lunge'], ['glute'], ['leg-iso', 'calf'], ['core-hold'], ['calf', 'leg-iso'], ['core-move', 'core-rotate']],
  upper: [['push'], ['row'], ['press'], ['pulldown', 'back'], ['shoulder'], ['chest-fly'], ['biceps'], ['triceps'], ['core-hold', 'core-move'], ['core-rotate', 'core-move']],
  // Tập vòng: xen kẽ bài tim mạch với bài sức mạnh để nhịp tim luôn cao
  cardio: [['machine', 'run'], ['squat'], ['jump', 'mixed'], ['push'], ['run', 'mixed', 'jump'], ['lunge', 'glute'], ['mixed', 'jump'], ['core-move', 'core-rotate'], ['core-hold']],
}

// Giảm cân: chen một bài tim mạch sau hai bài chính của buổi sức mạnh
const CARDIO_SLOT: Slot = ['jump', 'run', 'mixed']

function template(kind: SessionKind, goal: Goal): Slot[] {
  const t = TEMPLATE[kind]
  return goal === 'lose' && kind !== 'cardio' ? [...t.slice(0, 2), CARDIO_SLOT, ...t.slice(2)] : t
}

/** Bài cô lập một cơ: nhiều lần hơn, nghỉ ngắn hơn bài chính */
const ISOLATION = new Set<Pattern>(['leg-iso', 'calf', 'glute', 'chest-fly', 'shoulder', 'biceps', 'triceps'])

/** Mục tiêu quyết định số lần và thời gian nghỉ */
const BY_GOAL: Record<Goal, { reps: number; rest: number; sec: number }> = {
  lose: { reps: 15, rest: 30, sec: 40 },
  gain: { reps: 10, rest: 90, sec: 30 },
  muscle: { reps: 10, rest: 60, sec: 35 },
  health: { reps: 12, rest: 45, sec: 30 },
}

/** Trình độ quyết định số hiệp, độ khó tối đa và cộng/trừ số lần */
const BY_LEVEL: Record<Level, { sets: number; maxDifficulty: number; repsDelta: number; secDelta: number }> = {
  beginner: { sets: 2, maxDifficulty: 1, repsDelta: -3, secDelta: -10 },
  basic: { sets: 3, maxDifficulty: 2, repsDelta: -2, secDelta: -5 },
  intermediate: { sets: 3, maxDifficulty: 3, repsDelta: 0, secDelta: 0 },
  advanced: { sets: 4, maxDifficulty: 3, repsDelta: 2, secDelta: 10 },
}

const WARMUP_COOLDOWN_MIN = 8
const GEAR_OF_LABEL: Record<string, Gear> = { 'Tạ đơn': 'dumbbell', 'Dây kháng lực': 'band', 'Xà đơn': 'bar' }

export function allowedGear(p: Profile): Set<Gear> {
  if (p.place === 'gym') return new Set<Gear>(['none', 'dumbbell', 'band', 'bar', 'gym'])
  return new Set<Gear>(['none', ...p.equipment.map((l) => GEAR_OF_LABEL[l]).filter(Boolean)])
}

export function prescribe(ex: Ex, p: Profile): Omit<PlanItem, 'exId'> {
  const g = BY_GOAL[p.goal]
  const l = BY_LEVEL[p.level]
  if (ex.mode === 'time') {
    // Bài cardio trên máy tính theo phút, các bài khác theo giây
    const sec = ex.gear === 'gym' && ex.group === 'cardio' ? 300 : Math.max(20, g.sec + l.secDelta)
    return { sets: ex.gear === 'gym' && ex.group === 'cardio' ? 1 : l.sets, amount: sec, unit: 'giây', perSide: !!ex.perSide, rest: g.rest }
  }
  const iso = ISOLATION.has(ex.pattern)
  // Squat, deadlift tạ đòn và máy nặng thì không quá 12 lần dù mục tiêu giảm cân
  const heavy = ex.gear === 'gym' && (ex.pattern === 'squat' || ex.pattern === 'hinge')
  const reps = Math.min(heavy ? 12 : 30, Math.max(6, g.reps + l.repsDelta + (iso ? 2 : 0)))
  const rest = iso ? Math.max(30, g.rest - 15) : g.rest
  return { sets: l.sets, amount: ex.perSide ? Math.max(6, reps - 3) : reps, unit: 'lần', perSide: !!ex.perSide, rest }
}

/** Thời lượng ước tính của một bài (giây), mỗi lần tập mất khoảng 3 giây */
export function itemSeconds(it: PlanItem) {
  const work = (it.unit === 'giây' ? it.amount : it.amount * 3) * (it.perSide ? 2 : 1)
  return it.sets * work + Math.max(0, it.sets - 1) * it.rest + 30
}

const overlap = (a: Muscle[], b: Muscle[]) => a.some((m) => b.includes(m))

// Ở phòng gym ưu tiên tạ và máy, ở nhà ưu tiên dụng cụ người tập đã mua
const GEAR_BONUS: Record<'home' | 'gym', Record<Gear, number>> = {
  home: { none: 0, dumbbell: 0.5, band: 0.5, bar: 0.5, gym: 0 },
  gym: { none: 0, dumbbell: 1, band: 0.25, bar: 1, gym: 1 },
}

function pickExercise(pattern: Pattern, p: Profile, gear: Set<Gear>, used: Set<string>, weekUse: Map<string, number>, salt: number): Ex | undefined {
  const max = BY_LEVEL[p.level].maxDifficulty
  const pool = LIBRARY.filter((e) => e.pattern === pattern && gear.has(e.gear) && e.difficulty <= max && !used.has(e.id) && !(e.homeOnly && p.place === 'gym'))
  const score = (e: Ex) =>
    (overlap(e.primary, p.focus) ? 3 : overlap(e.secondary, p.focus) ? 1 : 0) +
    (e.ai ? 1 : 0) +
    (e.primary.length >= 2 ? 1 : 0) + // bài nhiều cơ (squat, hít đất...) xếp trước bài đơn lẻ
    GEAR_BONUS[p.place][e.gear] +
    (p.level === 'advanced' ? e.difficulty * 0.5 : p.level === 'intermediate' && e.difficulty >= 2 ? 0.5 : 0)
  const ranked = [...pool].sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id))
  if (!ranked.length) return undefined
  // Trong nhóm bài tốt nhất, lấy bài ít được giao nhất trong tuần để các buổi không lặp y hệt nhau
  const top = ranked.filter((e) => score(e) >= score(ranked[0]) - 1)
  const fewest = Math.min(...top.map((e) => weekUse.get(e.id) ?? 0))
  const fresh = top.filter((e) => (weekUse.get(e.id) ?? 0) === fewest)
  return fresh[salt % fresh.length]
}

export function buildSession(kind: SessionKind, p: Profile, salt = 0, title = TITLE[kind], weekUse = new Map<string, number>()): Session {
  const gear = allowedGear(p)
  const used = new Set<string>()
  const usedPatterns = new Set<Pattern>()
  const items: PlanItem[] = []
  let seconds = WARMUP_COOLDOWN_MIN * 60
  const budget = p.minutes * 60
  for (const slot of template(kind, p.goal)) {
    let ex: Ex | undefined
    for (const pattern of slot) {
      if (usedPatterns.has(pattern)) continue
      ex = pickExercise(pattern, p, gear, used, weekUse, salt + items.length)
      if (ex) break
    }
    if (!ex) continue
    const item = { exId: ex.id, ...prescribe(ex, p) }
    if (items.length >= 3 && seconds + itemSeconds(item) > budget) break
    used.add(ex.id)
    weekUse.set(ex.id, (weekUse.get(ex.id) ?? 0) + 1)
    usedPatterns.add(ex.pattern)
    items.push(item)
    seconds += itemSeconds(item)
  }
  const groups = [...new Set(items.map((i) => LIBRARY.find((e) => e.id === i.exId)!.group))]
  return { kind, title, groups, items, minutes: Math.round(seconds / 60) }
}

export function buildWeekPlan(p: Profile): WeekPlan {
  const days = TRAINING_DAYS[p.days] ?? TRAINING_DAYS[3]
  const kinds = sessionKinds(p.days, p)
  const week: WeekPlan = Array(7).fill(null)
  const seen: Partial<Record<SessionKind, number>> = {}
  const weekUse = new Map<string, number>()
  days.forEach((dow, i) => {
    const kind = kinds[i]
    const n = (seen[kind] = (seen[kind] ?? -1) + 1)
    const repeated = kinds.filter((k) => k === kind).length > 1
    week[dow] = buildSession(kind, p, n, repeated ? `${TITLE[kind]} ${'ABC'[n]}` : TITLE[kind], weekUse)
  })
  return week
}

export const amountLabel = (it: PlanItem) =>
  `${it.amount >= 120 && it.unit === 'giây' ? `${Math.round(it.amount / 60)} phút` : `${it.amount} ${it.unit}`}${it.perSide ? '/bên' : ''}`
