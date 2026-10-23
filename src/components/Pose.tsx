import { useState } from 'react'
import type { Ex, Pattern } from '../data/exercises'

/**
 * Hình người que minh hoạ tư thế, khung 48×48, sàn ở y = 42,5.
 * lines: các đoạn thân, tay, chân (nét 3,4); props: dụng cụ (ghế, xà, tường) vẽ mờ; fills: tạ.
 */
interface PoseDef {
  head: [number, number]
  lines: string[]
  props?: string
  fills?: string
}

const POSES = {
  squat: { head: [26, 10], lines: ['M17 28 L24 15.5', 'M17 28 L29 28 L27 40 L33 40', 'M24 17 L36 19.5'] },
  lunge: { head: [24, 8.5], lines: ['M24 26 L24 13.5', 'M24 26 L32 32 L32 41 L36 41', 'M24 26 L17 39 L10 38', 'M24 15 L20 21 L23 25'] },
  hipthrust: { head: [8.5, 21.5], props: '<path d="M3 27 H16 M5 27 V41 M14 27 V41" stroke-width="2.4"/>', lines: ['M13 24 L26 21.5 L34 24 L33 40 L37 40', 'M14 24 L22 22.5'] },
  rdl: { head: [36, 13], lines: ['M20 24 L32 17', 'M20 24 L23 33 L22 41 L26 41', 'M31 18 L31 30'], fills: '<rect x="27.5" y="29.5" width="7" height="3.4" rx="1.2"/>' },
  stepup: { head: [24, 7.5], props: '<rect x="28" y="32" width="14" height="9" rx="1.5" stroke-width="2.4"/>', lines: ['M24 24 L24.5 12.5', 'M24 24 L32 25.5 L32 32 L36 32', 'M24 24 L21 32.5 L19 41 L22 41', 'M24.5 14 L28.5 21', 'M24.5 14 L20 20'] },
  plank: { head: [37, 22.5], lines: ['M8 33 L20 29.5 L32 26.5', 'M32 26.5 L31 34 L38 34'] },
  jack: { head: [24, 9.5], lines: ['M24 15 L24 28', 'M24 28 L19.5 41 M24 28 L28.5 41', 'M24 17 L17.5 6.5 M24 17 L30.5 6.5'] },
  fold: { head: [32, 23.5], lines: ['M14 37 L38 38 L38.5 33', 'M14 37 L28 27', 'M27.5 28 L37 34.5'] },
  calf: { head: [24, 7], lines: ['M24 12.5 L24 25', 'M24 25 L24.5 32.5 L25 37.5 L29.5 41', 'M24 14.5 L22.5 22.5'], props: '<path d="M26 41.5 H36" stroke-width="2.4"/>' },
  wallsit: { head: [14.5, 13], props: '<path d="M9 3 V42" stroke-width="2.4"/>', lines: ['M14 30 L14.5 18.5', 'M14 30 L26 30 L26 41 L30 41', 'M14.5 20 L20 25.5'] },
  bridge: { head: [7.5, 37.5], lines: ['M12 38.5 L24 30 L32 27 L34 40.5 L37.5 40.5', 'M13 40 L21 41'] },
  kick: { head: [36, 23.5], lines: ['M16 29 L31 27', 'M31 27.5 L31.5 41', 'M16 29 L16.5 41 L8 41.5', 'M16 29 L6 26.5 L5.5 16.5'] },
  seated: { head: [15.5, 9], props: '<path d="M10 30 H25 M12 30 V41 M23 30 V41 M10.5 30 V13" stroke-width="2.4"/>', lines: ['M14 29 L15.5 14.5', 'M14 29 L26 29 L37 24', 'M15.5 16 L21 26'] },
  pushup: { head: [37.5, 27.5], lines: ['M5 41.5 L19.5 36 L32.5 30.5', 'M32.5 31 L33 41.5'] },
  bench: {
    head: [8.5, 27], props: '<path d="M6 33 H31 M9 33 V41 M28 33 V41" stroke-width="2.4"/>',
    lines: ['M13.5 29.5 L26 29.5', 'M26 29.5 L33 27 L35 41 L38.5 41', 'M15 29.5 L15 16.5'], fills: '<rect x="11.5" y="13.2" width="7" height="3.4" rx="1.2"/>',
  },
  press: {
    head: [24, 10], lines: ['M24 15 L24 27', 'M24 27 L21 41 M24 27 L27 41', 'M24 16 L15.5 11.5 L16 3.8', 'M24 16 L32.5 11.5 L32 3.8'],
    fills: '<rect x="12.5" y="1.4" width="7" height="3.2" rx="1.2"/><rect x="28.5" y="1.4" width="7" height="3.2" rx="1.2"/>',
  },
  pike: { head: [14, 34.5], lines: ['M12.5 41.5 L17.5 30.5 L26 16.5 L35 41.5 L38.5 41.5'] },
  raise: {
    head: [24, 8], lines: ['M24 13 L24 26.5', 'M24 26.5 L20.5 41 M24 26.5 L27.5 41', 'M24 15 L36.5 15.5 M24 15 L11.5 15.5'],
    fills: '<rect x="36.3" y="12.6" width="3.4" height="6" rx="1.2"/><rect x="8.3" y="12.6" width="3.4" height="6" rx="1.2"/>',
  },
  row: {
    head: [35.5, 15.5], lines: ['M17 23.5 L31 19', 'M17 23.5 L20.5 32.5 L18.5 41 L22.5 41', 'M30 19.5 L24 22 L25.5 29'],
    fills: '<rect x="22" y="28.2" width="7" height="3.4" rx="1.2"/>',
  },
  hang: { head: [24, 12.5], props: '<path d="M6 4 H42" stroke-width="2.4"/>', lines: ['M24 18.5 L15 11 L15.5 4 M24 18.5 L33 11 L32.5 4', 'M24 18 L24 30', 'M24 30 L22 39.5 M24 30 L26.5 39'] },
  superman: { head: [36, 30.5], lines: ['M5 31 L24 39.5 L32 37.5', 'M32 38 L44 34.5'] },
  curl: {
    head: [24, 8], lines: ['M24 13 L24 26.5', 'M24 26.5 L22.5 41 M24 26.5 L26.5 41', 'M24 14.5 L24.5 21.5 L30.5 16.5'],
    fills: '<rect x="29" y="12.5" width="3.4" height="7" rx="1.2"/>',
  },
  dip: { head: [20, 13.5], props: '<path d="M4 27 H17 M6 27 V41 M15 27 V41" stroke-width="2.4"/>', lines: ['M19 18.5 L20 30', 'M20 30 L31 30.5 L32 41 L35.5 41', 'M19.5 19.5 L15.5 27'] },
  deadbug: { head: [8.5, 37.5], lines: ['M13 39.5 L26 39.5', 'M26 39.5 L26.5 28 L36.5 28', 'M15 39 L15.5 26.5'] },
  crunch: { head: [12.5, 29.5], lines: ['M24 39.5 L15.5 33.5', 'M24 39.5 L32 29.5 L36 40.5 L39.5 40.5', 'M16 34 L24.5 32'] },
  legraise: { head: [7.5, 37.5], lines: ['M12 39.5 L25 39.5', 'M25 39.5 L36 25 L38.5 26.5', 'M13 40 L20 41.5'] },
  twist: { head: [13.5, 23], lines: ['M22 39.5 L15.5 28', 'M22 39.5 L31 32 L38.5 35.5', 'M16 29.5 L25 31.5'], fills: '<circle cx="26.5" cy="31.5" r="2.6"/>' },
  run: { head: [26.5, 8], lines: ['M24.5 25 L26 13.5', 'M24.5 25 L31.5 30 L29 38.5', 'M24.5 25 L20.5 33.5 L13.5 36', 'M26 15 L31 21 L35 17.5', 'M26 15 L20.5 20.5 L18 25.5'] },
  climber: { head: [37.5, 24], lines: ['M7 41.5 L21 31.5 L33 27.5', 'M33 28 L33.5 41.5', 'M21 31.5 L28 35 L21.5 40.5'] },
  bike: {
    head: [32.5, 10], props: '<path d="M12 41.5 H38 M17 41.5 L21 27 M34 41.5 L34 17 M31 17 H38 M17.5 26.5 H25" stroke-width="2.2"/>',
    lines: ['M21.5 25 L29 14.5', 'M29 15.5 L33.5 17.5', 'M21.5 25 L28.5 30 L26 38', 'M21.5 25 L24 33.5 L19.5 37'],
  },
  quad: { head: [22, 7.5], lines: ['M22 12.5 L22 25', 'M22 25 L24 41 L27.5 41', 'M22 25 L19.5 36 L14.5 27.5', 'M22 14.5 L17 21 L15 26.5'] },
  arms: { head: [24, 8], lines: ['M24 13 L24 26.5', 'M24 26.5 L20.5 41 M24 26.5 L27.5 41', 'M24 15 L37 15.5 M24 15 L11 15.5'] },
  hips: { head: [24, 8], lines: ['M24 13 L24 26.5', 'M24 26.5 L21 41 M24 26.5 L27 41', 'M24 15 L18 20 L22.5 25', 'M24 15 L30 20 L25.5 25'] },
  figure4: { head: [7.5, 37.5], lines: ['M12 39.5 L25 39.5', 'M25 39.5 L31 30 L35 41', 'M25 39.5 L33 31 L27 27'] },
  child: { head: [14.5, 37.5], lines: ['M34 30 L19 36', 'M34 30 L25 41 L39 41.5', 'M19.5 37 L5.5 41'] },
} satisfies Record<string, PoseDef>

export type PoseName = keyof typeof POSES

/**
 * Minh hoạ động tác: ảnh người mẫu 3D render sẵn (public/poses, dựng bằng tools/human).
 * `line` hoặc ảnh không tải được thì vẽ hình người que theo màu `color`.
 */
export default function Pose({ name, size = 44, color = 'var(--ink)', floor = true, line = false }: {
  name: PoseName; size?: number; color?: string; floor?: boolean; line?: boolean
}) {
  const [failed, setFailed] = useState(false)
  if (line || failed) return <LinePose name={name} size={size} color={color} floor={floor} />
  // Ảnh nhỏ 192 px đủ nét cho ô tới khoảng 96 px trên màn hình mật độ cao
  const src = `/poses/${name}${size <= 96 ? '-sm' : ''}.webp`
  return (
    <img src={src} width={size} height={size} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable={false}
      onError={() => setFailed(true)}
      style={{ display: 'block', flexShrink: 0, maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
  )
}

function LinePose({ name, size, color, floor }: { name: PoseName; size: number; color: string; floor: boolean }) {
  const p: PoseDef = POSES[name]
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" style={{ display: 'block', flexShrink: 0 }}>
      {floor && <path d="M3 42.5 H45" stroke={color} strokeWidth={1.6} strokeLinecap="round" opacity={0.25} />}
      {p.props && <g fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" opacity={0.4} dangerouslySetInnerHTML={{ __html: p.props }} />}
      <g fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
        {p.lines.map((d) => <path key={d} d={d} />)}
      </g>
      {p.fills && <g fill={color} dangerouslySetInnerHTML={{ __html: p.fills }} />}
      <circle cx={p.head[0]} cy={p.head[1]} r={4.4} fill={color} />
    </svg>
  )
}

const BY_PATTERN: Record<Pattern, PoseName> = {
  squat: 'squat', hinge: 'rdl', lunge: 'lunge', glute: 'bridge', calf: 'calf', 'leg-iso': 'seated',
  push: 'pushup', 'chest-fly': 'bench', press: 'press', shoulder: 'raise', row: 'row', pulldown: 'hang', back: 'superman',
  biceps: 'curl', triceps: 'dip', 'core-hold': 'plank', 'core-move': 'crunch', 'core-rotate': 'twist',
  jump: 'jack', run: 'run', mixed: 'climber', machine: 'run',
}

const BY_ID: Record<string, PoseName> = {
  'wall-sit': 'wallsit', 'step-up': 'stepup', 'db-step-up': 'stepup', 'hip-thrust': 'hipthrust',
  'donkey-kick': 'kick', 'fire-hydrant': 'kick', 'bird-dog': 'kick',
  'db-bench-press': 'bench', 'chest-press': 'bench', 'incline-db-press': 'bench', 'band-chest-press': 'bench',
  'pike-pushup': 'pike', inchworm: 'pike', 'dead-bug': 'deadbug', 'hollow-hold': 'deadbug',
  'leg-raise': 'legraise', 'flutter-kicks': 'legraise', 'reverse-crunch': 'legraise', 'v-up': 'legraise',
  'hanging-knee-raise': 'hang', 'db-thruster': 'press', 'overhead-triceps': 'press', 'db-kickback': 'row',
  'rowing-machine': 'row', bike: 'bike', 'db-pullover': 'bench', 'skull-crusher': 'bench',
  'jump-rope': 'jack', burpee: 'jack', 'tuck-jump': 'jack', 'skater-jump': 'lunge', 'high-knees': 'run',
}

/** Hình minh hoạ của một bài: theo id nếu có hình riêng, không thì theo kiểu chuyển động */
export const poseOf = (e: Pick<Ex, 'id' | 'pattern'>): PoseName => BY_ID[e.id] ?? BY_PATTERN[e.pattern]

/** Hình cho các động tác khởi động và giãn cơ (data/stretches.ts) */
export function stretchPose(name: string): PoseName {
  const n = name.toLowerCase()
  if (n.includes('vai') || n.includes('ngực')) return 'arms'
  if (n.includes('hông')) return 'hips'
  if (n.includes('đá chân')) return 'lunge'
  if (n.includes('gối')) return 'run'
  if (n.includes('đùi trước')) return 'quad'
  if (n.includes('đùi sau') || n.includes('gập')) return 'fold'
  if (n.includes('mông')) return 'figure4'
  if (n.includes('em bé')) return 'child'
  return 'jack'
}
