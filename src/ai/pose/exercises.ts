import { add, angleAt, dir, dist, scale, signedDistanceBelow, tiltFromVertical, type Pt } from './geometry'
import type { Body, Chain, Limb } from './body'

export type Phase = 'up' | 'down'

export interface Issue {
  code: string
  msg: string
  /** Khớp bên gần camera cần tô đỏ trên khung xương */
  joints: Limb[]
}

/** Khung tư thế chuẩn vẽ chồng lên camera, tính bằng pixel của khung hình */
export interface Skeleton {
  points: Record<string, Pt>
  lines: [string, string][]
  head: { at: string; r: number }
}

export interface ExerciseAI {
  id: string
  mode: 'reps' | 'hold'
  /** Khớp bên gần camera phải nhìn rõ thì mới chấm */
  need: Limb[]
  setup: string[]
  /** Trả về lời nhắc nếu người tập chưa vào đúng tư thế nền (đứng hay nằm) */
  posture: (b: Body) => string | null
  metric: {
    label: string
    read: (b: Body) => number
    /** Đếm 1 lần khi góc xuống dưới `down` rồi trở lại trên `up` */
    down: number
    up: number
    target: number
  }
  checks: (b: Body, phase: Phase) => Issue[]
  /** Bài giữ (plank): tư thế đang đạt để tính giờ */
  holdOk?: (b: Body) => boolean
  target: (b: Body) => Skeleton
  /** Người tập đã khớp khung chuẩn chưa (khung chuyển sang màu xanh) */
  matches: (b: Body) => boolean
}

const lengths = (c: Chain, b: Body) => {
  const shin = dist(c.knee, c.ankle)
  const thigh = dist(c.hip, c.knee)
  return {
    shin,
    thigh,
    torso: dist(c.hip, c.shoulder) || b.torsoLength,
    upper: dist(c.shoulder, c.elbow),
    fore: dist(c.elbow, c.wrist),
    foot: Math.max(dist(c.heel, c.toe), shin * 0.3),
    head: b.torsoLength * 0.32,
  }
}

const kneeAngle = (c: Chain) => angleAt(c.hip, c.knee, c.ankle)
const elbowAngle = (c: Chain) => angleAt(c.shoulder, c.elbow, c.wrist)
const bodyLine = (c: Chain) => angleAt(c.shoulder, c.hip, c.ankle)
const torsoTilt = (c: Chain) => tiltFromVertical(c.hip, c.shoulder)
const lying = (c: Chain) => tiltFromVertical(c.ankle, c.shoulder) > 55

// Đi từ một điểm neo theo chuỗi đoạn, mỗi đoạn có góc tính từ hướng lên trên (xem geometry.dir)
const walk = (from: Pt, len: number, angle: number, facing: 1 | -1) => add(from, scale(dir(angle, facing), len))

const LEG_LINES: [string, string][] = [['toe', 'heel'], ['heel', 'ankle'], ['ankle', 'knee'], ['knee', 'hip']]
const UPPER_LINES: [string, string][] = [['hip', 'shoulder'], ['shoulder', 'elbow'], ['elbow', 'wrist'], ['shoulder', 'neck']]

const hipLine = (c: Chain): Issue[] => {
  if (bodyLine(c) >= 160) return []
  return signedDistanceBelow(c.hip, c.shoulder, c.ankle) > 0
    ? [{ code: 'sag', msg: 'Siết bụng, đừng để võng hông', joints: ['hip'] }]
    : [{ code: 'pike', msg: 'Hạ hông xuống, giữ người thành một đường thẳng', joints: ['hip'] }]
}

const squat: ExerciseAI = {
  id: 'squat',
  mode: 'reps',
  need: ['shoulder', 'hip', 'knee', 'ankle'],
  setup: [
    'Đặt điện thoại cao ngang hông, cách 2–3 mét',
    'Đứng nghiêng 90° so với camera, thấy cả người từ đầu đến chân',
    'Hai chân rộng bằng vai, tay duỗi ra trước khi xuống',
  ],
  posture: (b) => (torsoTilt(b.near) > 80 ? 'Đứng thẳng lên để bắt đầu' : null),
  metric: { label: 'Góc gối', read: (b) => kneeAngle(b.near), down: 100, up: 160, target: 70 },
  checks: (b, phase) => {
    const c = b.near
    const { shin } = lengths(c, b)
    const issues: Issue[] = []
    if (phase === 'down' || kneeAngle(c) < 140) {
      if (torsoTilt(c) > 50) issues.push({ code: 'back', msg: 'Mở ngực, giữ lưng thẳng hơn', joints: ['shoulder', 'hip'] })
      if ((c.knee.x - c.toe.x) * b.facing > shin * 0.35) issues.push({ code: 'knees', msg: 'Đẩy hông ra sau, gối đừng vượt mũi chân', joints: ['knee'] })
    }
    if (c.heel.v > 0.5 && c.toe.v > 0.5 && c.toe.y - c.heel.y > shin * 0.18) {
      issues.push({ code: 'heels', msg: 'Giữ gót chân chạm sàn', joints: ['heel', 'ankle'] })
    }
    return issues
  },
  target: (b) => {
    const c = b.near
    const f = b.facing
    const s = lengths(c, b)
    const p: Record<string, Pt> = { ankle: c.ankle }
    p.heel = walk(p.ankle, s.foot * 0.3, -110, f)
    p.toe = walk(p.ankle, s.foot, 95, f)
    p.knee = walk(p.ankle, s.shin, 25, f)
    p.hip = walk(p.knee, s.thigh, -85, f)
    p.shoulder = walk(p.hip, s.torso, 40, f)
    p.neck = walk(p.shoulder, s.head * 0.5, 35, f)
    p.head = walk(p.shoulder, s.head * 1.2, 35, f)
    p.elbow = walk(p.shoulder, s.upper, 90, f)
    p.wrist = walk(p.elbow, s.fore, 90, f)
    return { points: p, lines: [...LEG_LINES, ...UPPER_LINES], head: { at: 'head', r: s.head * 0.45 } }
  },
  matches: (b) => kneeAngle(b.near) < 100 && torsoTilt(b.near) <= 50,
}

const pushup: ExerciseAI = {
  id: 'pushup',
  mode: 'reps',
  need: ['shoulder', 'elbow', 'wrist', 'hip', 'ankle'],
  setup: [
    'Đặt điện thoại sát sàn, cách 1,5–2 mét',
    'Nằm nghiêng 90° so với camera, thấy cả người từ đầu đến chân',
    'Hai tay đặt rộng hơn vai một chút',
  ],
  posture: (b) => (lying(b.near) ? null : 'Vào tư thế chống đẩy để bắt đầu'),
  metric: { label: 'Góc khuỷu tay', read: (b) => elbowAngle(b.near), down: 95, up: 155, target: 90 },
  checks: (b) => hipLine(b.near),
  target: (b) => {
    const c = b.near
    const f = b.facing
    const s = lengths(c, b)
    const p: Record<string, Pt> = { ankle: c.ankle }
    p.toe = walk(p.ankle, s.foot, 170, f)
    p.heel = walk(p.ankle, s.foot * 0.3, -60, f)
    p.knee = walk(p.ankle, s.shin, 78, f)
    p.hip = walk(p.knee, s.thigh, 78, f)
    p.shoulder = walk(p.hip, s.torso, 78, f)
    p.neck = walk(p.shoulder, s.head * 0.5, 78, f)
    p.head = walk(p.shoulder, s.head * 1.2, 78, f)
    p.elbow = walk(p.shoulder, s.upper, -120, f)
    p.wrist = walk(p.elbow, s.fore, 150, f)
    return { points: p, lines: [...LEG_LINES, ...UPPER_LINES], head: { at: 'head', r: s.head * 0.45 } }
  },
  matches: (b) => elbowAngle(b.near) < 100 && bodyLine(b.near) >= 160,
}

const plank: ExerciseAI = {
  id: 'plank',
  mode: 'hold',
  need: ['shoulder', 'elbow', 'hip', 'ankle'],
  setup: [
    'Đặt điện thoại sát sàn, cách 1,5–2 mét',
    'Nằm nghiêng 90° so với camera, chống khuỷu tay ngay dưới vai',
    'Giữ người thẳng từ vai đến gót chân',
  ],
  posture: (b) => (lying(b.near) ? null : 'Nằm xuống, chống khuỷu tay để bắt đầu'),
  metric: { label: 'Độ thẳng người', read: (b) => bodyLine(b.near), down: 0, up: 0, target: 180 },
  checks: (b) => {
    const c = b.near
    const issues = hipLine(c)
    if (Math.abs(c.shoulder.x - c.elbow.x) > dist(c.shoulder, c.elbow) * 0.5) {
      issues.push({ code: 'elbow', msg: 'Đặt khuỷu tay ngay dưới vai', joints: ['elbow', 'shoulder'] })
    }
    return issues
  },
  holdOk: (b) => lying(b.near) && bodyLine(b.near) >= 160,
  target: (b) => {
    const c = b.near
    const f = b.facing
    const s = lengths(c, b)
    const p: Record<string, Pt> = { ankle: c.ankle }
    p.toe = walk(p.ankle, s.foot, 170, f)
    p.heel = walk(p.ankle, s.foot * 0.3, -60, f)
    p.knee = walk(p.ankle, s.shin, 80, f)
    p.hip = walk(p.knee, s.thigh, 80, f)
    p.shoulder = walk(p.hip, s.torso, 80, f)
    p.neck = walk(p.shoulder, s.head * 0.5, 80, f)
    p.head = walk(p.shoulder, s.head * 1.2, 80, f)
    p.elbow = walk(p.shoulder, s.upper, 180, f)
    p.wrist = walk(p.elbow, s.fore, 90, f)
    return { points: p, lines: [...LEG_LINES, ...UPPER_LINES], head: { at: 'head', r: s.head * 0.45 } }
  },
  matches: (b) => bodyLine(b.near) >= 160,
}

/** Chân trước của động tác lunge: bàn chân nằm xa hơn theo hướng mặt */
const frontLeg = (b: Body) => ((b.near.ankle.x - b.far.ankle.x) * b.facing >= 0 ? b.near : b.far)

const lunge: ExerciseAI = {
  id: 'lunge',
  mode: 'reps',
  need: ['shoulder', 'hip', 'knee', 'ankle'],
  setup: [
    'Đặt điện thoại cao ngang hông, cách 2–3 mét',
    'Đứng nghiêng 90° so với camera, thấy cả người từ đầu đến chân',
    'Bước một chân lên trước, hạ người thẳng xuống',
  ],
  posture: (b) => (torsoTilt(b.near) > 60 ? 'Đứng thẳng lên để bắt đầu' : null),
  metric: { label: 'Góc gối trước', read: (b) => kneeAngle(frontLeg(b)), down: 105, up: 155, target: 90 },
  checks: (b, phase) => {
    const front = frontLeg(b)
    const issues: Issue[] = []
    if (phase === 'down' || kneeAngle(front) < 140) {
      if (torsoTilt(b.near) > 25) issues.push({ code: 'torso', msg: 'Giữ thân trên thẳng đứng', joints: ['shoulder', 'hip'] })
      if ((front.knee.x - front.toe.x) * b.facing > dist(front.knee, front.ankle) * 0.35) {
        issues.push({ code: 'knee', msg: 'Bước chân trước dài hơn một chút', joints: front === b.near ? ['knee'] : [] })
      }
    }
    return issues
  },
  target: (b) => {
    const front = frontLeg(b)
    const f = b.facing
    const s = lengths(front, b)
    const p: Record<string, Pt> = { ankle: front.ankle }
    p.heel = walk(p.ankle, s.foot * 0.3, -110, f)
    p.toe = walk(p.ankle, s.foot, 95, f)
    p.knee = walk(p.ankle, s.shin, 8, f)
    p.hip = walk(p.knee, s.thigh, -90, f)
    p.shoulder = walk(p.hip, s.torso, 0, f)
    p.neck = walk(p.shoulder, s.head * 0.5, 0, f)
    p.head = walk(p.shoulder, s.head * 1.2, 0, f)
    p.elbow = walk(p.shoulder, s.upper, 180, f)
    p.wrist = walk(p.elbow, s.fore, 175, f)
    p.knee2 = walk(p.hip, s.thigh, 175, f)
    p.ankle2 = walk(p.knee2, s.shin, -100, f)
    return {
      points: p,
      lines: [...LEG_LINES, ...UPPER_LINES, ['hip', 'knee2'], ['knee2', 'ankle2']],
      head: { at: 'head', r: s.head * 0.45 },
    }
  },
  matches: (b) => kneeAngle(frontLeg(b)) < 105 && torsoTilt(b.near) <= 25,
}

export const EXERCISE_AI: Record<string, ExerciseAI> = { squat, pushup, lunge, plank }
