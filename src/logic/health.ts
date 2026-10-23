import { exById } from '../data/exercises'
import type { Group } from '../data/muscles'
import { MUSCLE } from '../data/muscles'
import { addDays, isoDate } from '../lib/format'
import type { DayLog, Logs } from '../store'
import type { Session } from './plan'

const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

/** Số phút ngủ từ giờ đi ngủ đến giờ dậy (qua nửa đêm vẫn đúng) */
export function sleepMinutes(s?: { bed: string; wake: string }) {
  if (!s) return null
  const d = toMin(s.wake) - toMin(s.bed)
  return d <= 0 ? d + 24 * 60 : d
}

/** 7 giờ 20 phút → { h: 7, m: 20 } */
export const hm = (min: number) => ({ h: Math.floor(min / 60), m: Math.round(min % 60) })

export const MOOD_LABEL = ['Mệt', 'Bình thường', 'Khỏe', 'Rất khỏe'] as const

const MUSCLE_SHORT: Record<Group, string> = { legs: 'Cơ chân', upper: 'Thân trên', core: 'Cơ bụng', cardio: 'Sức bền' }

export type Level = 'good' | 'ok' | 'low'

export interface Factor {
  name: string
  value: string
  level: Level
}

export interface Readiness {
  score: number
  title: string
  advice: string
  factors: Factor[]
  /** Có đủ dữ liệu hôm nay chưa (giấc ngủ, nhịp tim hoặc cảm nhận) */
  measured: boolean
}

/** Nhịp tim nghỉ trung bình 7 ngày trước hôm nay */
export function hrBaseline(logs: Logs, today: Date) {
  const xs: number[] = []
  for (let i = 1; i <= 7; i++) {
    const hr = logs.days[isoDate(addDays(today, -i))]?.hr
    if (hr) xs.push(hr)
  }
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null
}

/** Nhóm cơ đã tập trong 2 ngày trước, kèm mức nặng (RPE) */
function recentLoad(logs: Logs, today: Date): { groups: Set<Group>; hard: boolean } {
  const groups = new Set<Group>()
  let hard = false
  for (let i = 1; i <= 2; i++) {
    const d: DayLog | undefined = logs.days[isoDate(addDays(today, -i))]
    if (!d) continue
    for (const [id, n] of Object.entries(d.sets)) {
      const g = exById(id)?.group
      if (g && n > 0) groups.add(g)
    }
    if ((d.rpe ?? 0) >= 2) hard = true
  }
  return { groups, hard }
}

/**
 * Điểm sẵn sàng tập 0–100: giấc ngủ 35%, cảm nhận 25%, nhịp tim nghỉ so với tuần trước 20%,
 * mức hồi phục của nhóm cơ sắp tập 20%. Thiếu số liệu thì tính mức trung tính.
 */
export function readiness(logs: Logs, today: Date, session: Session | null): Readiness {
  const log = logs.days[isoDate(today)]
  const sleep = sleepMinutes(log?.sleep)
  const sleepScore = sleep === null ? 70 : sleep >= 450 ? 100 : sleep >= 420 ? 90 : sleep >= 390 ? 78 : sleep >= 360 ? 65 : sleep >= 300 ? 45 : 25
  const base = hrBaseline(logs, today)
  const hrDiff = log?.hr && base ? log.hr - base : null
  const hrScore = hrDiff === null ? 75 : hrDiff <= 1 ? 100 : hrDiff <= 3 ? 80 : hrDiff <= 6 ? 55 : 35
  const moodScore = log?.mood === undefined ? 70 : [30, 65, 85, 100][log.mood]
  const load = recentLoad(logs, today)
  const target = session?.groups.find((g) => load.groups.has(g))
  const recoverScore = target ? (load.hard ? 45 : 65) : 100
  const score = Math.round(0.35 * sleepScore + 0.25 * moodScore + 0.2 * hrScore + 0.2 * recoverScore)

  const title = score >= 80 ? 'Sẵn sàng tập nặng' : score >= 60 ? 'Sẵn sàng tập vừa sức' : score >= 40 ? 'Nên tập nhẹ hôm nay' : 'Nên nghỉ ngơi hôm nay'
  const first = session?.items[0] ? exById(session.items[0].exId)?.name : undefined
  const advice = !session
    ? score >= 60 ? 'Hôm nay là ngày nghỉ. Đi bộ nhẹ 20 phút và giãn cơ để hồi phục.' : 'Hôm nay là ngày nghỉ. Ngủ sớm và uống đủ nước.'
    : score >= 80 ? `Cơ thể đã hồi phục tốt. Có thể thêm 1–2 lần ở hiệp cuối${first ? ` của ${first}` : ''}.`
    : score >= 60 ? `Giữ nguyên buổi ${session.title}.${target ? ` Nếu ${MUSCLE[target].label.toLowerCase()} còn mỏi, bớt 1 hiệp ở bài đầu.` : ''}`
    : score >= 40 ? `Tập buổi ${session.title} nhưng bớt 1 hiệp mỗi bài và nghỉ lâu hơn giữa hiệp.`
    : 'Thay buổi tập bằng giãn cơ nhẹ, ngủ bù và uống đủ nước.'

  const factors: Factor[] = [
    {
      name: 'Giấc ngủ',
      value: sleep === null ? 'Chưa ghi' : sleepScore >= 90 ? 'Tốt' : sleepScore >= 65 ? 'Hơi ít' : 'Thiếu ngủ',
      level: sleep === null ? 'ok' : sleepScore >= 90 ? 'good' : sleepScore >= 65 ? 'ok' : 'low',
    },
    {
      name: 'Nhịp tim',
      value: !log?.hr ? 'Chưa đo' : hrDiff === null ? `${log.hr} bpm` : hrScore >= 80 ? 'Bình thường' : 'Cao hơn mọi ngày',
      level: !log?.hr ? 'ok' : hrScore >= 80 ? 'good' : 'low',
    },
    {
      name: target ? MUSCLE_SHORT[target] : 'Cơ bắp',
      value: target ? (load.hard ? 'Còn mỏi' : 'Hơi mỏi') : 'Đã hồi phục',
      level: target ? (load.hard ? 'low' : 'ok') : 'good',
    },
  ]
  return { score, title, advice, factors, measured: sleep !== null || !!log?.hr || log?.mood !== undefined }
}
