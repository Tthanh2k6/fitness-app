import type { Body, Limb, RawLandmark } from './body'
import type { Skeleton } from './exercises'
import type { Pt } from './geometry'

const COLOR = {
  bone: 'rgba(252, 252, 250, 0.9)',
  boneFar: 'rgba(252, 252, 250, 0.4)',
  issue: '#D2707F',
  target: '#D9A441',
  matched: '#3F9C7A',
}

// Các cặp điểm mốc nối thành khung xương (bỏ phần mặt)
const BONES: [number, number][] = [
  [11, 12], [11, 23], [12, 24], [23, 24],
  [11, 13], [13, 15], [12, 14], [14, 16],
  [23, 25], [25, 27], [27, 29], [29, 31], [27, 31],
  [24, 26], [26, 28], [28, 30], [30, 32], [28, 32],
]
const SIDE_OF = (i: number): 'L' | 'R' | null => (i >= 11 ? (i % 2 === 1 ? 'L' : 'R') : null)
const LIMB_OF: Record<number, Limb> = {
  11: 'shoulder', 12: 'shoulder', 13: 'elbow', 14: 'elbow', 15: 'wrist', 16: 'wrist', 23: 'hip', 24: 'hip',
  25: 'knee', 26: 'knee', 27: 'ankle', 28: 'ankle', 29: 'heel', 30: 'heel', 31: 'toe', 32: 'toe',
}

let smoothTarget: Record<string, Pt> | null = null

export function resetTargetSmoothing() {
  smoothTarget = null
}

/** Làm mượt khung chuẩn để không rung theo từng khung hình */
function smooth(points: Record<string, Pt>) {
  if (!smoothTarget) return (smoothTarget = { ...points })
  for (const [k, p] of Object.entries(points)) {
    const q = smoothTarget[k] ?? p
    smoothTarget[k] = { x: q.x + 0.3 * (p.x - q.x), y: q.y + 0.3 * (p.y - q.y) }
  }
  return smoothTarget
}

export function drawPose(
  ctx: CanvasRenderingContext2D,
  opts: {
    landmarks?: RawLandmark[]
    body: Body | null
    target: Skeleton | null
    matched: boolean
    issueJoints: Limb[]
  },
) {
  const { width: w, height: h } = ctx.canvas
  const unit = Math.min(w, h) / 100
  ctx.clearRect(0, 0, w, h)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (opts.target) {
    const pts = smooth(opts.target.points)
    ctx.setLineDash([unit * 2.4, unit * 1.6])
    ctx.strokeStyle = opts.matched ? COLOR.matched : COLOR.target
    ctx.lineWidth = unit * 1.1
    ctx.globalAlpha = 0.95
    ctx.beginPath()
    for (const [a, b] of opts.target.lines) {
      if (!pts[a] || !pts[b]) continue
      ctx.moveTo(pts[a].x, pts[a].y)
      ctx.lineTo(pts[b].x, pts[b].y)
    }
    ctx.stroke()
    const head = pts[opts.target.head.at]
    if (head) {
      ctx.beginPath()
      ctx.arc(head.x, head.y, opts.target.head.r, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  const lm = opts.landmarks
  if (!lm || !opts.body) return
  const { width: bw, height: bh, nearSide } = opts.body
  const at = (i: number) => ({ x: lm[i].x * bw, y: lm[i].y * bh })
  ctx.setLineDash([])

  for (const [a, b] of BONES) {
    const far = SIDE_OF(a) !== nearSide && SIDE_OF(b) !== nearSide
    ctx.strokeStyle = far ? COLOR.boneFar : COLOR.bone
    ctx.lineWidth = unit * (far ? 0.7 : 1)
    ctx.beginPath()
    const p = at(a)
    const q = at(b)
    ctx.moveTo(p.x, p.y)
    ctx.lineTo(q.x, q.y)
    ctx.stroke()
  }

  for (const i of Object.keys(LIMB_OF).map(Number)) {
    const near = SIDE_OF(i) === nearSide
    const bad = near && opts.issueJoints.includes(LIMB_OF[i])
    const p = at(i)
    ctx.fillStyle = bad ? COLOR.issue : near ? COLOR.bone : COLOR.boneFar
    ctx.beginPath()
    ctx.arc(p.x, p.y, unit * (bad ? 2 : near ? 1.1 : 0.8), 0, Math.PI * 2)
    ctx.fill()
    if (bad) {
      ctx.strokeStyle = COLOR.bone
      ctx.lineWidth = unit * 0.5
      ctx.stroke()
    }
  }
}
