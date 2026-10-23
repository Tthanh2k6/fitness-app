import { describe, expect, it } from 'vitest'
import { toBody, type RawLandmark } from './body'
import { Coach, type CoachState } from './coach'
import { EXERCISE_AI } from './exercises'
import { add, dir, scale, type Pt } from './geometry'

// Dựng khung xương nhìn nghiêng (bên trái gần camera, quay mặt sang phải) rồi đổi ra 33 điểm mốc như MediaPipe trả về
type Pose = Record<'nose' | 'ear' | 'shoulder' | 'elbow' | 'wrist' | 'hip' | 'knee' | 'ankle' | 'heel' | 'toe', Pt>

const walk = (p: Pt, len: number, angle: number) => add(p, scale(dir(angle, 1), len))
const NEAR: Record<keyof Pose, number> = { nose: 0, ear: 7, shoulder: 11, elbow: 13, wrist: 15, hip: 23, knee: 25, ankle: 27, heel: 29, toe: 31 }

function landmarks(p: Pose, w: number, h: number, farShift: Pt = { x: 4, y: 2 }): RawLandmark[] {
  const lm: RawLandmark[] = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 0.1 }))
  for (const [k, i] of Object.entries(NEAR) as [keyof Pose, number][]) {
    lm[i] = { x: p[k].x / w, y: p[k].y / h, visibility: 0.95 }
    if (i >= 11) lm[i + 1] = { x: (p[k].x + farShift.x) / w, y: (p[k].y + farShift.y) / h, visibility: 0.6 }
  }
  lm[8] = { ...lm[7], visibility: 0.3 }
  return lm
}

/** depth 0 = đứng thẳng, 1 = đáy squat (đùi song song sàn) */
function squat(depth: number, o: { lean?: number; heelLift?: number } = {}): Pose {
  const ankle = { x: 300, y: 1150 }
  const knee = walk(ankle, 220, 25 * depth)
  const hip = walk(knee, 230, -85 * depth)
  const lean = (o.lean ?? 40) * depth
  const shoulder = walk(hip, 260, lean)
  const heel = walk(ankle, 25, -110)
  return {
    ankle, knee, hip, shoulder,
    heel: { x: heel.x, y: heel.y - (o.heelLift ?? 0) },
    toe: walk(ankle, 70, 95),
    elbow: walk(shoulder, 140, 90 * depth + 180 * (1 - depth)),
    wrist: walk(walk(shoulder, 140, 90 * depth + 180 * (1 - depth)), 130, 90 * depth + 180 * (1 - depth)),
    ear: walk(shoulder, 90, lean),
    nose: add(walk(shoulder, 95, lean), { x: 22, y: 0 }),
  }
}

/** Nằm nghiêng: bend 0 = tay thẳng (đỉnh chống đẩy), 1 = đáy chống đẩy. sag > 0 làm võng hông */
function floor(bend: number, o: { sag?: number; forearm?: boolean } = {}): Pose {
  const ankle = { x: 200, y: 480 }
  const knee = walk(ankle, 220, 78)
  const hip0 = walk(knee, 230, 78)
  const hip = { x: hip0.x, y: hip0.y + (o.sag ?? 0) }
  const shoulder = walk(hip0, 260, 78)
  const elbow = o.forearm ? walk(shoulder, 140, 180) : walk(shoulder, 140, 180 + 60 * bend)
  const wrist = o.forearm ? walk(elbow, 130, 90) : walk(elbow, 130, 180 - 30 * bend)
  return {
    ankle, knee, hip, shoulder, elbow, wrist,
    heel: walk(ankle, 25, -60), toe: walk(ankle, 70, 170),
    ear: walk(shoulder, 90, 78), nose: add(walk(shoulder, 95, 78), { x: 20, y: 6 }),
  }
}

/** Chạy một chuỗi tư thế qua Coach, mỗi tư thế giữ `hold` khung hình 33 ms */
function run(id: string, poses: Pose[], size: { w: number; h: number }, hold = 3) {
  const coach = new Coach(EXERCISE_AI[id])
  let t = 0
  let state!: CoachState
  const seen: string[] = []
  for (const p of poses) {
    for (let k = 0; k < hold; k++) {
      t += 33
      state = coach.update(toBody(landmarks(p, size.w, size.h), size.w, size.h), t)
      if (state.feedback) seen.push(state.feedback.text)
    }
  }
  return { state, seen }
}

const ramp = (from: number, to: number, steps: number) => Array.from({ length: steps }, (_, i) => from + ((to - from) * (i + 1)) / steps)
const PORTRAIT = { w: 720, h: 1280 }
const LANDSCAPE = { w: 1280, h: 720 }

const squatReps = (n: number, depth = 1, o: Parameters<typeof squat>[1] = {}) => [
  ...Array(12).fill(0).map(() => squat(0)),
  ...Array.from({ length: n }, () => [
    ...ramp(0, depth, 8).map((d) => squat(d, o)),
    ...Array(4).fill(0).map(() => squat(depth, o)),
    ...ramp(depth, 0, 8).map((d) => squat(d, o)),
    ...Array(4).fill(0).map(() => squat(0)),
  ]).flat(),
]

describe('Coach squat', () => {
  it('đếm đủ số lần khi tập đúng kỹ thuật', () => {
    const { state } = run('squat', squatReps(3), PORTRAIT)
    expect(state.status).toBe('active')
    expect(state.reps).toBe(3)
    expect(state.goodReps).toBe(3)
  })

  it('không đếm và nhắc khi xuống chưa đủ sâu', () => {
    const { state, seen } = run('squat', squatReps(2, 0.6), PORTRAIT)
    expect(state.reps).toBe(0)
    expect(seen).toContain('Chưa đủ sâu, xuống thấp hơn nữa')
  })

  it('vẫn đếm nhưng ghi lỗi khi gập lưng quá nhiều', () => {
    const { state } = run('squat', squatReps(2, 1, { lean: 65 }), PORTRAIT)
    expect(state.reps).toBe(2)
    expect(state.goodReps).toBe(0)
    expect(state.mistakes.back?.count).toBe(2)
  })

  it('phát hiện nhón gót', () => {
    const { state } = run('squat', squatReps(1, 1, { heelLift: 60 }), PORTRAIT)
    expect(state.mistakes.heels?.count).toBe(1)
  })
})

describe('Coach điều kiện bắt đầu', () => {
  it('chưa thấy người thì nhắc bước vào khung', () => {
    const coach = new Coach(EXERCISE_AI.squat)
    expect(coach.update(null, 33).status).toBe('no-person')
  })

  it('đứng đối diện camera thì nhắc quay nghiêng', () => {
    const coach = new Coach(EXERCISE_AI.squat)
    const lm = landmarks(squat(0), PORTRAIT.w, PORTRAIT.h, { x: -220, y: 0 })
    const s = coach.update(toBody(lm, PORTRAIT.w, PORTRAIT.h), 33)
    expect(s.status).toBe('adjust')
    expect(s.hint).toBe('Quay nghiêng người 90° so với camera')
  })

  it('đang đứng mà chọn plank thì nhắc nằm xuống', () => {
    const coach = new Coach(EXERCISE_AI.plank)
    const s = coach.update(toBody(landmarks(squat(0), PORTRAIT.w, PORTRAIT.h), PORTRAIT.w, PORTRAIT.h), 33)
    expect(s.hint).toBe('Nằm xuống, chống khuỷu tay để bắt đầu')
  })
})

describe('Coach chống đẩy', () => {
  it('đếm số lần theo góc khuỷu tay', () => {
    const poses = [
      ...Array(12).fill(0).map(() => floor(0)),
      ...Array.from({ length: 4 }, () => [...ramp(0, 1, 8).map((b) => floor(b)), ...ramp(1, 0, 8).map((b) => floor(b))]).flat(),
    ]
    expect(run('pushup', poses, LANDSCAPE).state.reps).toBe(4)
  })

  it('nhắc khi võng hông', () => {
    const poses = [...Array(12).fill(0).map(() => floor(0)), ...Array(20).fill(0).map(() => floor(0.3, { sag: 70 }))]
    expect(run('pushup', poses, LANDSCAPE).seen).toContain('Siết bụng, đừng để võng hông')
  })
})

describe('Coach plank', () => {
  it('chỉ tính giờ khi người thẳng', () => {
    const good = run('plank', Array(80).fill(0).map(() => floor(0, { forearm: true })), LANDSCAPE)
    expect(good.state.holdMs).toBeGreaterThan(1500)
    const sag = run('plank', Array(80).fill(0).map(() => floor(0, { forearm: true, sag: 80 })), LANDSCAPE)
    expect(sag.state.holdMs).toBe(0)
    expect(sag.state.mistakes.sag).toBeDefined()
  })
})
