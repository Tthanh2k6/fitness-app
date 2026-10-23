import { dist, mid, type Pt } from './geometry'

/** Một điểm mốc MediaPipe đã đổi sang pixel, kèm độ tin cậy nhìn thấy */
export interface Joint extends Pt {
  v: number
}

export interface RawLandmark {
  x: number
  y: number
  visibility?: number
}

// Chỉ số 33 điểm mốc của MediaPipe Pose (trái/phải theo cơ thể người tập)
const IDX = {
  nose: 0, earL: 7, earR: 8,
  shoulderL: 11, shoulderR: 12, elbowL: 13, elbowR: 14, wristL: 15, wristR: 16,
  hipL: 23, hipR: 24, kneeL: 25, kneeR: 26, ankleL: 27, ankleR: 28,
  heelL: 29, heelR: 30, toeL: 31, toeR: 32,
} as const

export type Limb = 'shoulder' | 'elbow' | 'wrist' | 'hip' | 'knee' | 'ankle' | 'heel' | 'toe'
export const LIMBS: Limb[] = ['shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle', 'heel', 'toe']

export type Chain = Record<Limb, Joint>

export interface Body {
  nearSide: 'L' | 'R'
  /** Bên cơ thể gần camera (nhìn rõ hơn), dùng làm chuẩn khi quay nghiêng */
  near: Chain
  far: Chain
  nose: Joint
  ear: Joint
  /** +1: người quay mặt sang phải khung hình, -1: sang trái (theo toạ độ ảnh gốc, chưa lật gương) */
  facing: 1 | -1
  /** Khoảng cách hai vai / chiều dài thân: nhỏ khi đứng nghiêng, lớn khi đứng đối diện camera */
  shoulderSpread: number
  torsoLength: number
  width: number
  height: number
}

const chain = (lm: RawLandmark[], side: 'L' | 'R', w: number, h: number): Chain => {
  const pick = (k: string): Joint => {
    const p = lm[IDX[(k + side) as keyof typeof IDX]]
    return { x: p.x * w, y: p.y * h, v: p.visibility ?? 1 }
  }
  return Object.fromEntries(LIMBS.map((l) => [l, pick(l)])) as Chain
}

const meanVis = (c: Chain) => (c.shoulder.v + c.elbow.v + c.hip.v + c.knee.v + c.ankle.v) / 5

export function toBody(lm: RawLandmark[] | undefined, width: number, height: number): Body | null {
  if (!lm || lm.length < 33) return null
  const L = chain(lm, 'L', width, height)
  const R = chain(lm, 'R', width, height)
  const nearIsLeft = meanVis(L) >= meanVis(R)
  const near = nearIsLeft ? L : R
  const far = nearIsLeft ? R : L
  const nose = { x: lm[IDX.nose].x * width, y: lm[IDX.nose].y * height, v: lm[IDX.nose].visibility ?? 1 }
  const earRaw = lm[nearIsLeft ? IDX.earL : IDX.earR]
  const ear = { x: earRaw.x * width, y: earRaw.y * height, v: earRaw.visibility ?? 1 }

  // Hướng mặt: ưu tiên bàn chân (mũi chân so với gót), nếu chân khuất thì dùng mũi so với tai
  const footDx = near.toe.x - near.heel.x
  const headDx = nose.x - ear.x
  const facing: 1 | -1 = Math.abs(footDx) > 4 && near.toe.v > 0.5 ? (footDx > 0 ? 1 : -1) : headDx >= 0 ? 1 : -1

  const torsoLength = dist(mid(L.shoulder, R.shoulder), mid(L.hip, R.hip)) || 1
  return {
    nearSide: nearIsLeft ? 'L' : 'R', near, far, nose, ear, facing,
    shoulderSpread: dist(L.shoulder, R.shoulder) / torsoLength,
    torsoLength, width, height,
  }
}

/** Các khớp cần thấy rõ có nằm trong khung và đủ tin cậy không */
export function inFrame(body: Body, limbs: Limb[], minVis = 0.5) {
  const pad = 0.01
  return limbs.every((l) => {
    const j = body.near[l]
    return j.v >= minVis && j.x > body.width * pad && j.x < body.width * (1 - pad) && j.y > body.height * pad && j.y < body.height * (1 - pad)
  })
}
